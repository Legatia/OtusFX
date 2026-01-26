use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::error::LendingError;
use crate::state::LendingConfig;

#[derive(Accounts)]
pub struct InitializeLending<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = LendingConfig::LEN,
        seeds = [LendingConfig::SEEDS_PREFIX],
        bump
    )]
    pub lending_config: Account<'info, LendingConfig>,

    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = lending_config,
        seeds = [b"usdc_vault"],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = usd1_mint,
        token::authority = lending_config,
        seeds = [b"usd1_vault"],
        bump
    )]
    pub usd1_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = otus_mint,
        token::authority = lending_config,
        seeds = [b"otus_vault"],
        bump
    )]
    pub otus_vault: Account<'info, TokenAccount>,

    pub usdc_mint: Account<'info, Mint>,
    pub usd1_mint: Account<'info, Mint>,
    pub otus_mint: Account<'info, Mint>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<InitializeLending>,
    base_interest_rate: u16,
    utilization_multiplier: u16,
    max_utilization_rate: u16,
    reserve_factor: u16,
    initial_otus_price_usd: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.lending_config;
    let clock = Clock::get()?;

    // Validate parameters
    require!(
        base_interest_rate <= 5000, // Max 50% base rate
        LendingError::InvalidInterestRate
    );
    require!(
        utilization_multiplier <= 2000, // Max 20% multiplier
        LendingError::InvalidInterestRate
    );
    require!(
        max_utilization_rate <= 9000 && max_utilization_rate >= 5000, // 50-90%
        LendingError::InvalidInterestRate
    );
    require!(
        reserve_factor <= 3000, // Max 30% to reserves
        LendingError::InvalidReserveFactor
    );
    require!(
        initial_otus_price_usd > 0, // Must have a valid OTUS price
        LendingError::InvalidInterestRate
    );

    config.authority = ctx.accounts.authority.key();
    config.usdc_vault = ctx.accounts.usdc_vault.key();
    config.usd1_vault = ctx.accounts.usd1_vault.key();
    config.otus_vault = ctx.accounts.otus_vault.key();
    config.total_deposited_usdc = 0;
    config.total_deposited_usd1 = 0;
    config.total_borrowed = 0;
    config.total_reserves = 0;
    config.base_interest_rate = base_interest_rate;
    config.utilization_multiplier = utilization_multiplier;
    config.max_utilization_rate = max_utilization_rate;
    config.reserve_factor = reserve_factor;
    config.last_update_timestamp = clock.unix_timestamp;
    config.otus_price_usd = initial_otus_price_usd;
    config.bump = ctx.bumps.lending_config;

    msg!("Lending pool initialized");
    msg!("Base rate: {}bps, Multiplier: {}bps", base_interest_rate, utilization_multiplier);
    msg!("Max utilization: {}bps, Reserve factor: {}bps", max_utilization_rate, reserve_factor);
    msg!("OTUS price: {} USD", initial_otus_price_usd as f64 / 1_000_000.0);
    msg!("USDC vault: {}", ctx.accounts.usdc_vault.key());
    msg!("USD1 vault: {}", ctx.accounts.usd1_vault.key());
    msg!("OTUS vault: {}", ctx.accounts.otus_vault.key());

    Ok(())
}
