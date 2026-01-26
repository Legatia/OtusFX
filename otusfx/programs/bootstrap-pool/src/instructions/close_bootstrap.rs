use anchor_lang::prelude::*;
use crate::error::BootstrapError;
use crate::state::BootstrapConfig;

#[derive(Accounts)]
pub struct CloseBootstrap<'info> {
    #[account(
        constraint = authority.key() == bootstrap_config.authority @ BootstrapError::Unauthorized
    )]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [BootstrapConfig::SEEDS_PREFIX],
        bump = bootstrap_config.bump
    )]
    pub bootstrap_config: Account<'info, BootstrapConfig>,
}

pub fn handler(ctx: Context<CloseBootstrap>) -> Result<()> {
    let config = &mut ctx.accounts.bootstrap_config;
    let clock = Clock::get()?;

    // Verify bootstrap period has ended
    require!(
        clock.unix_timestamp >= config.bootstrap_end,
        BootstrapError::BootstrapNotEnded
    );

    // Close bootstrap
    config.is_active = false;

    let total_usd = config.total_deposited_usdc + config.total_deposited_usd1;

    msg!("Bootstrap pool closed");
    msg!("Total deposited: {} USD (USDC: {}, USD1: {})",
        total_usd / 1_000_000,
        config.total_deposited_usdc / 1_000_000,
        config.total_deposited_usd1 / 1_000_000
    );
    msg!("Total participants: {}", config.total_participants);

    Ok(())
}
