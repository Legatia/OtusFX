use anchor_lang::prelude::*;
use crate::error::TradingError;

/// Calculate trading fee in USDC
pub fn calculate_trading_fee(notional: u64, fee_bps: u16) -> Result<u64> {
    let fee = (notional as u128)
        .checked_mul(fee_bps as u128)
        .ok_or(error!(TradingError::ArithmeticOverflow))?
        .checked_div(10_000)
        .ok_or(error!(TradingError::DivisionByZero))? as u64;
    Ok(fee)
}

/// Calculate keeper reward (percentage of closed notional, not margin)
pub fn calculate_keeper_reward(closed_notional: u64, keeper_fee_bps: u16) -> Result<u64> {
    let reward = (closed_notional as u128)
        .checked_mul(keeper_fee_bps as u128)
        .ok_or(error!(TradingError::ArithmeticOverflow))?
        .checked_div(10_000)
        .ok_or(error!(TradingError::DivisionByZero))? as u64;
    Ok(reward)
}

/// Calculate trigger prices for auto-deleverage tiers
/// Returns array of 4 trigger prices [tier0, tier1, tier2, tier3]
pub fn calculate_trigger_prices(
    entry_price: i64,
    direction: crate::state::Direction,
    thresholds: &[u8; 4], // [50, 35, 25, 15]
) -> Result<[i64; 4]> {
    use crate::state::Direction;

    let mut triggers = [0i64; 4];

    for (i, &threshold) in thresholds.iter().enumerate() {
        // At each threshold, calculate price that would cause that margin health
        // margin_health = (margin + unrealized_pnl) / initial_margin
        // For threshold%, we need unrealized_pnl such that equity = threshold% of initial margin
        // This means unrealized_pnl = (threshold% - 100%) * initial_margin

        // Price movement as percentage: (threshold - 100) / leverage
        // For Long: trigger_price = entry_price * (1 + movement%)
        // For Short: trigger_price = entry_price * (1 - movement%)

        // Simplified: at threshold%, the loss is (100 - threshold)% of initial margin
        // Since position is leveraged, price movement = (100 - threshold) / leverage

        // For now, use conservative approach:
        // Each tier represents accumulated loss as percentage
        let loss_pct = 100 - threshold;

        // Price movement = loss_pct (since at 1x leverage, 50% loss = 50% price move)
        // With leverage, this scales inversely
        let price_move_bps = loss_pct as i64 * 100; // Convert to basis points

        let trigger_price = match direction {
            Direction::Long => {
                // For long, trigger is below entry (loss when price drops)
                let move_amount = entry_price
                    .checked_mul(price_move_bps)
                    .ok_or(error!(TradingError::ArithmeticOverflow))?
                    .checked_div(10_000)
                    .ok_or(error!(TradingError::DivisionByZero))?;
                entry_price.checked_sub(move_amount)
                    .ok_or(error!(TradingError::ArithmeticUnderflow))?
            }
            Direction::Short => {
                // For short, trigger is above entry (loss when price rises)
                let move_amount = entry_price
                    .checked_mul(price_move_bps)
                    .ok_or(error!(TradingError::ArithmeticOverflow))?
                    .checked_div(10_000)
                    .ok_or(error!(TradingError::DivisionByZero))?;
                entry_price.checked_add(move_amount)
                    .ok_or(error!(TradingError::ArithmeticOverflow))?
            }
        };

        triggers[i] = trigger_price;
    }

    Ok(triggers)
}

/// Convert USDC amount to OTUS amount (simple ratio for MVP)
/// In production, this would query the actual OTUS/USDC price from treasury
pub fn usdc_to_otus(usdc_amount: u64, otus_price_usdc: u64) -> Result<u64> {
    // otus_amount = usdc_amount / otus_price
    // Assuming 6 decimals for both
    let otus = (usdc_amount as u128)
        .checked_mul(1_000_000)
        .ok_or(error!(TradingError::ArithmeticOverflow))?
        .checked_div(otus_price_usdc as u128)
        .ok_or(error!(TradingError::DivisionByZero))? as u64;
    Ok(otus)
}

/// Convert OTUS amount to USDC amount
pub fn otus_to_usdc(otus_amount: u64, otus_price_usdc: u64) -> Result<u64> {
    // usdc_amount = otus_amount * otus_price
    let usdc = (otus_amount as u128)
        .checked_mul(otus_price_usdc as u128)
        .ok_or(error!(TradingError::ArithmeticOverflow))?
        .checked_div(1_000_000)
        .ok_or(error!(TradingError::DivisionByZero))? as u64;
    Ok(usdc)
}
