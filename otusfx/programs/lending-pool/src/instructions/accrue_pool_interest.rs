use anchor_lang::prelude::*;
use crate::state::LendingConfig;

#[derive(Accounts)]
pub struct AccruePoolInterest<'info> {
    #[account(
        mut,
        seeds = [LendingConfig::SEEDS_PREFIX],
        bump = lending_config.bump
    )]
    pub lending_config: Account<'info, LendingConfig>,
}

pub fn handler(ctx: Context<AccruePoolInterest>) -> Result<()> {
    let config = &mut ctx.accounts.lending_config;
    let clock = Clock::get()?;

    // Update last timestamp
    config.last_update_timestamp = clock.unix_timestamp;

    let total_deposits = config.total_deposits();

    msg!("Pool interest accrued");
    msg!("Total deposits: {} USD (USDC: {}, USD1: {})",
        total_deposits / 1_000_000,
        config.total_deposited_usdc / 1_000_000,
        config.total_deposited_usd1 / 1_000_000
    );
    msg!("Total borrowed: {} USD", config.total_borrowed / 1_000_000);
    msg!("Total reserves: {} USD", config.total_reserves / 1_000_000);
    msg!("Lender APR: {}bps", config.calculate_lender_rate());
    msg!("OTUS price: ${}", config.otus_price_usd as f64 / 1_000_000.0);

    Ok(())
}
