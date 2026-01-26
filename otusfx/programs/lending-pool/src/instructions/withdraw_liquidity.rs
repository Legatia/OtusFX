use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use crate::error::LendingError;
use crate::state::{LendingConfig, LenderPosition, StablecoinType};

#[derive(Accounts)]
#[instruction(stablecoin_type: StablecoinType)]
pub struct WithdrawLiquidity<'info> {
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
        constraint = lender_position.lender == lender.key() @ LendingError::Unauthorized
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

    /// OTUS token mint
    pub otus_mint: Account<'info, Mint>,

    /// Protocol's OTUS token reserve
    #[account(
        mut,
        constraint = otus_vault.mint == otus_mint.key()
    )]
    pub otus_vault: Account<'info, TokenAccount>,

    /// Lender's OTUS token account
    #[account(
        mut,
        constraint = lender_otus_account.mint == otus_mint.key(),
        constraint = lender_otus_account.owner == lender.key()
    )]
    pub lender_otus_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<WithdrawLiquidity>, stablecoin_type: StablecoinType, amount: u64) -> Result<()> {
    let config = &mut ctx.accounts.lending_config;
    let lender_position = &mut ctx.accounts.lender_position;
    let clock = Clock::get()?;

    // Accrue interest before withdrawal
    let apr_bps = config.calculate_lender_rate();
    lender_position.accrue_interest(apr_bps, config.otus_price_usd, clock.unix_timestamp);

    // Verify lender has sufficient balance for the specific stablecoin
    let lender_balance = match stablecoin_type {
        StablecoinType::USDC => lender_position.usdc_deposited,
        StablecoinType::USD1 => lender_position.usd1_deposited,
    };
    require!(lender_balance >= amount, LendingError::InsufficientBalance);

    // Verify sufficient available liquidity
    let available = config.available_liquidity();
    require!(amount <= available, LendingError::InsufficientLiquidity);

    // Determine which vault to use
    let vault_account = match stablecoin_type {
        StablecoinType::USDC => ctx.accounts.usdc_vault.to_account_info(),
        StablecoinType::USD1 => ctx.accounts.usd1_vault.to_account_info(),
    };

    // Transfer stablecoin from vault to lender
    let seeds = &[LendingConfig::SEEDS_PREFIX, &[config.bump]];
    let signer_seeds = &[&seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: vault_account,
            to: ctx.accounts.lender_token_account.to_account_info(),
            authority: config.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, amount)?;

    // Transfer OTUS interest earned (if any)
    let otus_to_claim = lender_position.otus_interest_earned;
    if otus_to_claim > 0 {
        let otus_transfer_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.otus_vault.to_account_info(),
                to: ctx.accounts.lender_otus_account.to_account_info(),
                authority: config.to_account_info(),
            },
            signer_seeds,
        );
        token::transfer(otus_transfer_ctx, otus_to_claim)?;

        // Update claimed amount
        lender_position.otus_interest_claimed = lender_position
            .otus_interest_claimed
            .checked_add(otus_to_claim)
            .ok_or(LendingError::ArithmeticOverflow)?;
        lender_position.otus_interest_earned = 0;
    }

    // Update withdrawal amounts based on stablecoin type
    let (usdc_amount, usd1_amount) = match stablecoin_type {
        StablecoinType::USDC => (amount, 0u64),
        StablecoinType::USD1 => (0u64, amount),
    };

    lender_position.update_from_withdrawal(usdc_amount, usd1_amount);

    // Update global stats
    match stablecoin_type {
        StablecoinType::USDC => {
            config.total_deposited_usdc = config
                .total_deposited_usdc
                .checked_sub(amount)
                .ok_or(LendingError::ArithmeticUnderflow)?;
        }
        StablecoinType::USD1 => {
            config.total_deposited_usd1 = config
                .total_deposited_usd1
                .checked_sub(amount)
                .ok_or(LendingError::ArithmeticUnderflow)?;
        }
    }

    let token_name = match stablecoin_type {
        StablecoinType::USDC => "USDC",
        StablecoinType::USD1 => "USD1",
    };

    msg!("Liquidity withdrawn");
    msg!("Lender: {}", ctx.accounts.lender.key());
    msg!("Principal: {} {}", amount / 1_000_000, token_name);
    msg!("OTUS interest: {} OTUS", otus_to_claim);
    msg!("Remaining USD value: {} USD", lender_position.total_usd_value / 1_000_000);

    Ok(())
}
