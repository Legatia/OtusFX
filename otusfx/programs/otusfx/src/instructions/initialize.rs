use anchor_lang::prelude::*;
use anchor_spl::token::{Mint, Token, TokenAccount};
use crate::state::TradingConfig;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = TradingConfig::LEN,
        seeds = [TradingConfig::SEED_PREFIX],
        bump
    )]
    pub config: Account<'info, TradingConfig>,

    #[account(mut)]
    pub authority: Signer<'info>,

    /// USDC mint (6 decimals)
    pub usdc_mint: Account<'info, Mint>,

    /// USDC vault for margin deposits
    #[account(
        init,
        payer = authority,
        token::mint = usdc_mint,
        token::authority = config,
        seeds = [b"vault", usdc_mint.key().as_ref()],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    /// USD1 mint (6 decimals)
    pub usd1_mint: Account<'info, Mint>,

    /// USD1 vault for margin deposits
    #[account(
        init,
        payer = authority,
        token::mint = usd1_mint,
        token::authority = config,
        seeds = [b"vault", usd1_mint.key().as_ref()],
        bump
    )]
    pub usd1_vault: Account<'info, TokenAccount>,

    /// OTUS treasury program (placeholder for now)
    /// CHECK: This will be the OTUS treasury program in production
    pub otus_treasury: UncheckedAccount<'info>,

    /// Pyth program
    /// CHECK: Validated by Pyth SDK
    pub pyth_program: UncheckedAccount<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,
    pub rent: Sysvar<'info, Rent>,
}

pub fn handler(
    ctx: Context<Initialize>,
    trading_fee_bps: u16,
    keeper_fee_bps: u16,
    max_leverage: u8,
    min_leverage: u8,
) -> Result<()> {
    let config = &mut ctx.accounts.config;

    config.authority = ctx.accounts.authority.key();
    config.otus_treasury = ctx.accounts.otus_treasury.key();
    config.usdc_vault = ctx.accounts.usdc_vault.key();
    config.usd1_vault = ctx.accounts.usd1_vault.key();
    config.trading_fee_bps = trading_fee_bps;
    config.keeper_fee_bps = keeper_fee_bps;
    config.max_leverage = max_leverage;
    config.min_leverage = min_leverage;
    config.deleverage_thresholds = [50, 35, 25, 15];
    config.pyth_program = ctx.accounts.pyth_program.key();
    config.max_price_age = 60; // 60 seconds
    config.max_price_confidence_bps = 200; // 2%
    config.is_paused = false;
    config.position_counter = 0;
    config.bump = ctx.bumps.config;

    msg!("Trading engine initialized");
    msg!("Trading fee: {} bps", trading_fee_bps);
    msg!("Keeper fee: {} bps", keeper_fee_bps);
    msg!("Max leverage: {}x", max_leverage);
    msg!("Min leverage: {}x", min_leverage);
    msg!("USDC vault: {}", ctx.accounts.usdc_vault.key());
    msg!("USD1 vault: {}", ctx.accounts.usd1_vault.key());

    Ok(())
}
