use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Mint};
use crate::error::BootstrapError;
use crate::state::BootstrapConfig;

#[derive(Accounts)]
pub struct InitializeBootstrap<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(
        init,
        payer = authority,
        space = BootstrapConfig::LEN,
        seeds = [BootstrapConfig::SEEDS_PREFIX],
        bump
    )]
    pub bootstrap_config: Account<'info, BootstrapConfig>,

    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = bootstrap_config,
        seeds = [b"usdc_vault"],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = usd1_mint,
        token::authority = bootstrap_config,
        seeds = [b"usd1_vault"],
        bump
    )]
    pub usd1_vault: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = authority,
        token::mint = otus_mint,
        token::authority = bootstrap_config,
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
    ctx: Context<InitializeBootstrap>,
    bootstrap_start: i64,
    bootstrap_end: i64,
    otus_distribution_rate: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.bootstrap_config;

    require!(bootstrap_end > bootstrap_start, BootstrapError::BootstrapNotActive);

    config.authority = ctx.accounts.authority.key();
    config.usdc_vault = ctx.accounts.usdc_vault.key();
    config.usd1_vault = ctx.accounts.usd1_vault.key();
    config.otus_vault = ctx.accounts.otus_vault.key();
    config.total_deposited_usdc = 0;
    config.total_deposited_usd1 = 0;
    config.bootstrap_start = bootstrap_start;
    config.bootstrap_end = bootstrap_end;
    config.is_active = true;
    config.otus_distribution_rate = otus_distribution_rate;
    config.total_participants = 0;
    config.bump = ctx.bumps.bootstrap_config;

    msg!("Bootstrap pool initialized");
    msg!("Start: {}, End: {}", bootstrap_start, bootstrap_end);
    msg!("OTUS rate: {} per USD", otus_distribution_rate);
    msg!("USDC vault: {}", ctx.accounts.usdc_vault.key());
    msg!("USD1 vault: {}", ctx.accounts.usd1_vault.key());
    msg!("OTUS vault: {}", ctx.accounts.otus_vault.key());

    Ok(())
}
