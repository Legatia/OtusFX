use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::TradingError;
use crate::state::{TradingConfig, Position, FxPair, Direction};
use crate::utils::{get_cached_price, get_fx_pair_id, calculate_trading_fee, calculate_trigger_prices, PYTH_ORACLE_PROGRAM_ID};

/// Maximum staleness in slots (~5 minutes at 400ms/slot)
const MAX_STALENESS_SLOTS: u64 = 750;

#[derive(Accounts)]
pub struct OpenPosition<'info> {
    #[account(
        mut,
        seeds = [TradingConfig::SEED_PREFIX],
        bump = config.bump
    )]
    pub config: Account<'info, TradingConfig>,

    #[account(
        init,
        payer = trader,
        space = Position::LEN,
        seeds = [
            Position::SEED_PREFIX,
            trader.key().as_ref(),
            &config.position_counter.to_le_bytes()
        ],
        bump
    )]
    pub position: Account<'info, Position>,

    #[account(mut)]
    pub trader: Signer<'info>,

    /// Trader's USDC token account (source of margin)
    #[account(
        mut,
        constraint = trader_usdc.mint == usdc_vault.mint,
        constraint = trader_usdc.owner == trader.key()
    )]
    pub trader_usdc: Account<'info, TokenAccount>,

    /// Protocol USDC vault
    #[account(
        mut,
        constraint = usdc_vault.key() == config.usdc_vault
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    /// Pyth Oracle price cache account
    /// CHECK: Validated by owner check in get_cached_price
    #[account(
        constraint = price_cache.owner == &PYTH_ORACLE_PROGRAM_ID @ TradingError::InvalidOracleAccount
    )]
    pub price_cache: AccountInfo<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<OpenPosition>,
    pair: u8,
    direction: u8,
    margin: u64,
    leverage: u8,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let clock = &ctx.accounts.clock;

    // Validate trading is not paused
    require!(!config.is_paused, TradingError::TradingPaused);

    // Validate leverage
    require!(
        leverage >= config.min_leverage && leverage <= config.max_leverage,
        TradingError::InvalidLeverage
    );

    // Validate pair
    let fx_pair = FxPair::from_u8(pair)
        .ok_or(TradingError::InvalidPair)?;

    // Validate direction
    let dir = Direction::from_u8(direction)
        .ok_or(TradingError::InvalidDirection)?;

    // Validate margin
    require!(margin > 0, TradingError::InsufficientMargin);

    // Get current price from Pyth Oracle cache
    let (current_price, price_expo) = get_cached_price(
        &ctx.accounts.price_cache,
        fx_pair,
        MAX_STALENESS_SLOTS,
        config.max_price_confidence_bps,
        clock,
    )?;

    // Calculate position size (notional value)
    let size = margin
        .checked_mul(leverage as u64)
        .ok_or(TradingError::ArithmeticOverflow)?;

    // Calculate trading fee
    let trading_fee = calculate_trading_fee(size, config.trading_fee_bps)?;

    // Total amount to transfer = margin + trading fee
    let total_transfer = margin
        .checked_add(trading_fee)
        .ok_or(TradingError::ArithmeticOverflow)?;

    // Transfer margin + fee from trader to vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.trader_usdc.to_account_info(),
        to: ctx.accounts.usdc_vault.to_account_info(),
        authority: ctx.accounts.trader.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, total_transfer)?;

    // Calculate trigger prices for auto-deleverage
    let trigger_prices = calculate_trigger_prices(
        current_price,
        dir,
        &config.deleverage_thresholds,
    )?;

    // Initialize position
    let position = &mut ctx.accounts.position;
    position.owner = ctx.accounts.trader.key();
    position.position_id = config.position_counter;
    position.is_open = true;
    position.pair = fx_pair;
    position.direction = dir;
    position.leverage = leverage;
    position.initial_leverage = leverage;
    position.margin = margin;
    position.initial_margin = margin;
    position.size = size;
    position.entry_price = current_price;
    position.entry_price_expo = price_expo;
    position.trigger_prices = trigger_prices;
    position.deleverage_executed = [false; 4];
    position.opened_at = clock.unix_timestamp;
    position.closed_at = None;
    position.final_pnl_otus = None;
    position.bump = ctx.bumps.position;

    // Increment position counter
    let config = &mut ctx.accounts.config;
    config.position_counter = config.position_counter
        .checked_add(1)
        .ok_or(TradingError::ArithmeticOverflow)?;

    msg!("Position opened:");
    msg!("  ID: {}", position.position_id);
    msg!("  Pair: {:?}", fx_pair);
    msg!("  Direction: {:?}", dir);
    msg!("  Margin: {} USDC", margin);
    msg!("  Leverage: {}x", leverage);
    msg!("  Size: {} USDC", size);
    msg!("  Entry Price: {}", current_price);
    msg!("  Trading Fee: {} USDC", trading_fee);
    msg!("  Trigger Prices: {:?}", trigger_prices);

    Ok(())
}
