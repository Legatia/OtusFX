use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::LendingError;
use crate::state::{LendingConfig, LenderPosition, StablecoinType};

#[derive(Accounts)]
#[instruction(stablecoin_type: StablecoinType)]
pub struct DepositLiquidity<'info> {
    #[account(mut)]
    pub lender: Signer<'info>,

    #[account(
        mut,
        seeds = [LendingConfig::SEEDS_PREFIX],
        bump = lending_config.bump
    )]
    pub lending_config: Account<'info, LendingConfig>,

    #[account(
        mut,
        seeds = [LenderPosition::SEEDS_PREFIX, lender.key().as_ref()],
        bump = lender_position.bump,
        constraint = lender_position.lender == lender.key()
    )]
    pub lender_position: Account<'info, LenderPosition>,

    #[account(mut)]
    pub lender_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"usdc_vault"],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"usd1_vault"],
        bump
    )]
    pub usd1_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DepositLiquidity>, stablecoin_type: StablecoinType, amount: u64) -> Result<()> {
    let config = &mut ctx.accounts.lending_config;
    let lender_position = &mut ctx.accounts.lender_position;
    let clock = Clock::get()?;

    require!(amount > 0, LendingError::InvalidBorrowAmount);

    // Accrue interest for existing position before adding new deposit
    let apr_bps = config.calculate_lender_rate();
    lender_position.accrue_interest(apr_bps, config.otus_price_usd, clock.unix_timestamp);

    // Determine which vault to use
    let vault_account = match stablecoin_type {
        StablecoinType::USDC => ctx.accounts.usdc_vault.to_account_info(),
        StablecoinType::USD1 => ctx.accounts.usd1_vault.to_account_info(),
    };

    // Transfer stablecoin from lender to vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.lender_token_account.to_account_info(),
            to: vault_account,
            authority: ctx.accounts.lender.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    // Update deposit amounts based on stablecoin type
    let (usdc_amount, usd1_amount) = match stablecoin_type {
        StablecoinType::USDC => (amount, 0u64),
        StablecoinType::USD1 => (0u64, amount),
    };

    lender_position.update_from_deposit(usdc_amount, usd1_amount, clock.unix_timestamp);

    // Update global stats
    match stablecoin_type {
        StablecoinType::USDC => {
            config.total_deposited_usdc = config
                .total_deposited_usdc
                .checked_add(amount)
                .ok_or(LendingError::ArithmeticOverflow)?;
        }
        StablecoinType::USD1 => {
            config.total_deposited_usd1 = config
                .total_deposited_usd1
                .checked_add(amount)
                .ok_or(LendingError::ArithmeticOverflow)?;
        }
    }

    let token_name = match stablecoin_type {
        StablecoinType::USDC => "USDC",
        StablecoinType::USD1 => "USD1",
    };

    msg!("Liquidity deposited");
    msg!("Lender: {}", ctx.accounts.lender.key());
    msg!("Amount: {} {}", amount / 1_000_000, token_name);
    msg!("Total USD value: {} USD", lender_position.total_usd_value / 1_000_000);
    msg!("Current lender APR: {}bps", config.calculate_lender_rate());

    Ok(())
}
