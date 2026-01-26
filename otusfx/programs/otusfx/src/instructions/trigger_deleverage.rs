use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::TradingError;
use crate::state::{TradingConfig, Position};
use crate::utils::{get_cached_price, has_crossed_trigger, calculate_keeper_reward, PYTH_ORACLE_PROGRAM_ID};

/// Maximum staleness in slots (~5 minutes at 400ms/slot)
const MAX_STALENESS_SLOTS: u64 = 750;

#[derive(Accounts)]
pub struct TriggerDeleverage<'info> {
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
        constraint = position.is_open @ TradingError::PositionNotOpen
    )]
    pub position: Account<'info, Position>,

    /// Keeper who is triggering the deleverage (can be anyone)
    #[account(mut)]
    pub keeper: Signer<'info>,

    /// Keeper's USDC token account (receives reward)
    #[account(
        mut,
        constraint = keeper_usdc.mint == usdc_vault.mint,
        constraint = keeper_usdc.owner == keeper.key()
    )]
    pub keeper_usdc: Account<'info, TokenAccount>,

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
    pub clock: Sysvar<'info, Clock>,
}

pub fn handler(
    ctx: Context<TriggerDeleverage>,
    tier: u8,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let position = &mut ctx.accounts.position;
    let clock = &ctx.accounts.clock;

    // Validate tier
    require!(tier < 4, TradingError::InvalidDeleverageTier);

    // Check if tier already executed
    require!(
        !position.deleverage_executed[tier as usize],
        TradingError::DeleverageTierAlreadyExecuted
    );

    // Get current price from Pyth Oracle cache
    let (current_price, current_price_expo) = get_cached_price(
        &ctx.accounts.price_cache,
        position.pair,
        MAX_STALENESS_SLOTS,
        config.max_price_confidence_bps,
        clock,
    )?;

    // Verify trigger price has been crossed
    let trigger_price = position.trigger_prices[tier as usize];
    require!(
        has_crossed_trigger(current_price, trigger_price, position.direction),
        TradingError::MarginHealthAboveThreshold
    );

    // Calculate margin health
    let margin_health = position.calculate_margin_health(current_price, current_price_expo)?;

    // Verify margin health is at or below threshold
    let threshold = config.deleverage_thresholds[tier as usize];
    require!(
        margin_health <= threshold,
        TradingError::MarginHealthAboveThreshold
    );

    // Calculate deleverage amount
    let (close_percentage, new_leverage) = position.calculate_deleverage_amount(tier)?;

    // Calculate size to close
    let close_size = if close_percentage == 100 {
        position.size
    } else {
        position.size
            .checked_mul(close_percentage)
            .ok_or(TradingError::ArithmeticOverflow)?
            .checked_div(100)
            .ok_or(TradingError::DivisionByZero)?
    };

    // Calculate PnL on closed portion
    let total_unrealized_pnl = position.calculate_unrealized_pnl(current_price, current_price_expo)?;
    let closed_pnl = if close_percentage == 100 {
        total_unrealized_pnl
    } else {
        (total_unrealized_pnl as i128)
            .checked_mul(close_percentage as i128)
            .ok_or(TradingError::ArithmeticOverflow)?
            .checked_div(100)
            .ok_or(TradingError::DivisionByZero)? as i64
    };

    // Update position state
    position.size = position.size
        .checked_sub(close_size)
        .ok_or(TradingError::ArithmeticUnderflow)?;

    // Adjust margin based on PnL
    if closed_pnl >= 0 {
        position.margin = position.margin
            .checked_add(closed_pnl as u64)
            .ok_or(TradingError::ArithmeticOverflow)?;
    } else {
        position.margin = position.margin
            .checked_sub(closed_pnl.abs() as u64)
            .ok_or(TradingError::ArithmeticUnderflow)?;
    }

    // Update leverage
    position.leverage = new_leverage;

    // Mark tier as executed
    position.deleverage_executed[tier as usize] = true;

    // Calculate keeper reward (0.05% of closed notional, not margin)
    let keeper_reward = calculate_keeper_reward(close_size, config.keeper_fee_bps)?;

    // Transfer keeper reward from vault
    let config_seeds = &[
        TradingConfig::SEED_PREFIX,
        &[config.bump],
    ];
    let signer_seeds = &[&config_seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.usdc_vault.to_account_info(),
        to: ctx.accounts.keeper_usdc.to_account_info(),
        authority: config.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
    token::transfer(cpi_ctx, keeper_reward)?;

    // Close position completely if this was tier 3 (final deleverage)
    if tier == 3 {
        position.is_open = false;
        position.closed_at = Some(clock.unix_timestamp);
    }

    msg!("Deleverage triggered:");
    msg!("  Position ID: {}", position.position_id);
    msg!("  Tier: {}", tier);
    msg!("  Current Price: {}", current_price);
    msg!("  Trigger Price: {}", trigger_price);
    msg!("  Margin Health: {}%", margin_health);
    msg!("  Closed Size: {} USDC", close_size);
    msg!("  Closed PnL: {} USDC", closed_pnl);
    msg!("  New Leverage: {}x", new_leverage);
    msg!("  Remaining Size: {} USDC", position.size);
    msg!("  Keeper Reward: {} USDC", keeper_reward);

    Ok(())
}
