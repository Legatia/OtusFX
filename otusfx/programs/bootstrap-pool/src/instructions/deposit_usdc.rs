use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::BootstrapError;
use crate::state::{BootstrapConfig, UserDeposit, StablecoinType};

#[derive(Accounts)]
#[instruction(stablecoin_type: StablecoinType)]
pub struct DepositUsdc<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [BootstrapConfig::SEEDS_PREFIX],
        bump = bootstrap_config.bump
    )]
    pub bootstrap_config: Account<'info, BootstrapConfig>,

    #[account(
        mut,
        seeds = [UserDeposit::SEEDS_PREFIX, user.key().as_ref()],
        bump = user_deposit.bump,
        constraint = user_deposit.user == user.key()
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"usdc_vault"],
        bump,
        constraint = usdc_vault.owner == bootstrap_config.key()
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"usd1_vault"],
        bump,
        constraint = usd1_vault.owner == bootstrap_config.key()
    )]
    pub usd1_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<DepositUsdc>, stablecoin_type: StablecoinType, amount: u64) -> Result<()> {
    let config = &mut ctx.accounts.bootstrap_config;
    let user_deposit = &mut ctx.accounts.user_deposit;
    let clock = Clock::get()?;

    // Verify bootstrap is active
    require!(config.is_active, BootstrapError::BootstrapNotActive);
    require!(
        clock.unix_timestamp >= config.bootstrap_start,
        BootstrapError::BootstrapNotStarted
    );
    require!(
        clock.unix_timestamp < config.bootstrap_end,
        BootstrapError::BootstrapEnded
    );

    // Minimum deposit: 10 USD (anti-spam)
    require!(amount >= 10_000_000, BootstrapError::InsufficientDeposit);

    // Determine which vault to use based on stablecoin type
    let vault_account = match stablecoin_type {
        StablecoinType::USDC => ctx.accounts.usdc_vault.to_account_info(),
        StablecoinType::USD1 => ctx.accounts.usd1_vault.to_account_info(),
    };

    // Transfer stablecoin from user to vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.user_token_account.to_account_info(),
            to: vault_account,
            authority: ctx.accounts.user.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, amount)?;

    // Update deposit amounts based on stablecoin type
    let (usdc_amount, usd1_amount) = match stablecoin_type {
        StablecoinType::USDC => (amount, 0u64),
        StablecoinType::USD1 => (0u64, amount),
    };

    user_deposit.update_from_deposit(usdc_amount, usd1_amount, config.otus_distribution_rate, &clock);

    // Update global stats
    match stablecoin_type {
        StablecoinType::USDC => {
            config.total_deposited_usdc = config
                .total_deposited_usdc
                .checked_add(amount)
                .ok_or(BootstrapError::ArithmeticOverflow)?;
        }
        StablecoinType::USD1 => {
            config.total_deposited_usd1 = config
                .total_deposited_usd1
                .checked_add(amount)
                .ok_or(BootstrapError::ArithmeticOverflow)?;
        }
    }

    let token_name = match stablecoin_type {
        StablecoinType::USDC => "USDC",
        StablecoinType::USD1 => "USD1",
    };

    msg!("Deposit successful");
    msg!("User: {}", ctx.accounts.user.key());
    msg!("Amount: {} {}", amount / 1_000_000, token_name);
    msg!("Total USD value: {} USD", user_deposit.total_usd_value / 1_000_000);
    msg!("OTUS allocation: {}", user_deposit.otus_allocation);
    msg!("Scops tier: {}", user_deposit.scops_tier.name());

    Ok(())
}
