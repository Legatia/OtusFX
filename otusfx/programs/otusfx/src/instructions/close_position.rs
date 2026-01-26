use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::TradingError;
use crate::state::{TradingConfig, Position};
use crate::utils::{get_cached_price, usdc_to_otus, PYTH_ORACLE_PROGRAM_ID};

/// Maximum staleness in slots (~5 minutes at 400ms/slot)
const MAX_STALENESS_SLOTS: u64 = 750;

#[derive(Accounts)]
pub struct ClosePosition<'info> {
    #[account(
        seeds = [TradingConfig::SEED_PREFIX],
        bump = config.bump
    )]
    pub config: Account<'info, TradingConfig>,

    #[account(
        mut,
        seeds = [
            Position::SEED_PREFIX,
            position.owner.as_ref(),
            &position.position_id.to_le_bytes()
        ],
        bump = position.bump,
        constraint = position.is_open @ TradingError::PositionNotOpen,
        constraint = position.owner == trader.key() @ TradingError::UnauthorizedClose
    )]
    pub position: Account<'info, Position>,

    /// Position owner (must sign to close manually)
    #[account(mut)]
    pub trader: Signer<'info>,

    /// Trader's USDC token account (receives margin back)
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

    /// OTUS treasury for PnL settlement
    /// CHECK: This will be validated by OTUS treasury CPI in production
    #[account(mut)]
    pub otus_treasury: UncheckedAccount<'info>,

    pub token_program: Program<'info, Token>,
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<ClosePosition>,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let position = &mut ctx.accounts.position;
    let clock = &ctx.accounts.clock;

    // Get current price from Pyth Oracle cache
    let (current_price, current_price_expo) = get_cached_price(
        &ctx.accounts.price_cache,
        position.pair,
        MAX_STALENESS_SLOTS,
        config.max_price_confidence_bps,
        clock,
    )?;

    // Calculate final PnL in USDC
    let total_unrealized_pnl = position.calculate_unrealized_pnl(current_price, current_price_expo)?;

    // Calculate final equity
    let final_equity_usdc = if total_unrealized_pnl >= 0 {
        position.margin
            .checked_add(total_unrealized_pnl as u64)
            .ok_or(TradingError::ArithmeticOverflow)?
    } else {
        position.margin
            .checked_sub(total_unrealized_pnl.abs() as u64)
            .ok_or(TradingError::ArithmeticUnderflow)?
    };

    // Settlement in OTUS (keeps USDC in treasury earning yield)
    // For MVP, use simple 1:1 ratio. In production, query actual OTUS price from treasury
    let otus_price_usdc = 1_000_000; // $1.00 in 6 decimals
    let final_pnl_otus = if total_unrealized_pnl >= 0 {
        usdc_to_otus(total_unrealized_pnl as u64, otus_price_usdc)? as i64
    } else {
        -(usdc_to_otus(total_unrealized_pnl.abs() as u64, otus_price_usdc)? as i64)
    };

    // Return margin to trader
    let config_seeds = &[
        TradingConfig::SEED_PREFIX,
        &[config.bump],
    ];
    let signer_seeds = &[&config_seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.usdc_vault.to_account_info(),
        to: ctx.accounts.trader_usdc.to_account_info(),
        authority: config.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
    token::transfer(cpi_ctx, position.margin)?;

    // TODO: Settle PnL in OTUS via CPI to OTUS treasury
    // For MVP, we're just recording the PnL. In production:
    // - If profit: Mint OTUS to trader
    // - If loss: Burn OTUS from trader (or deduct from balance)
    //
    // CPI call would look like:
    // otus_treasury::cpi::settle_pnl(
    //     cpi_ctx,
    //     trader.key(),
    //     final_pnl_otus,
    // )?;

    // Update position state
    position.is_open = false;
    position.closed_at = Some(clock.unix_timestamp);
    position.final_pnl_otus = Some(final_pnl_otus);

    msg!("Position closed:");
    msg!("  Position ID: {}", position.position_id);
    msg!("  Close Price: {}", current_price);
    msg!("  PnL (USDC): {}", total_unrealized_pnl);
    msg!("  PnL (OTUS): {}", final_pnl_otus);
    msg!("  Final Equity: {} USDC", final_equity_usdc);
    msg!("  Margin Returned: {} USDC", position.margin);

    Ok(())
}
