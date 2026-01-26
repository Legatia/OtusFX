//! Pyth Pull Oracle Integration
//!
//! Uses Pyth's Pull model: client fetches price update from Hermes,
//! posts it to Pyth Solana Receiver, then we read the verified price.

use anchor_lang::prelude::*;
use crate::error::TradingError;
use crate::state::{FxPair, Direction};

/// Pyth Solana Receiver Program ID (mainnet/devnet)
/// Instructions use this to validate price feed account ownership
/// rec5EKMGg6MxZYaMdyBfgwp4d5rB9T1VQH5pJv5LtFJ
pub const PYTH_ORACLE_PROGRAM_ID: Pubkey = Pubkey::new_from_array([
    0x0e, 0x8a, 0x5d, 0x5c, 0x7d, 0x01, 0x7c, 0x89,
    0x4a, 0x9f, 0x67, 0x31, 0x1b, 0x5c, 0x68, 0x3e,
    0xa8, 0x9b, 0x1a, 0x5d, 0x6e, 0x4a, 0x9d, 0x8d,
    0x7b, 0x3e, 0x4c, 0x2d, 0x1f, 0x7a, 0x3c, 0x01,
]);

/// Maximum staleness in seconds (5 minutes)
pub const MAX_PRICE_STALENESS_SEC: i64 = 300;

/// Simplified price data from Pyth feed account
#[derive(Clone, Copy)]
pub struct PythPrice {
    pub price: i64,
    pub conf: u64,
    pub expo: i32,
    pub publish_time: i64,
}

/// Read price from Pyth Receiver price feed account
///
/// IMPORTANT: The client must include a "post price update" instruction
/// BEFORE calling our instruction in the same transaction.
///
/// Account layout (PriceUpdateV2):
/// - bytes 0-7: discriminator
/// - bytes 8-15: price (i64)
/// - bytes 16-23: conf (u64)
/// - bytes 24-27: expo (i32)
/// - bytes 28-35: publish_time (i64)
fn get_pyth_price(
    price_feed_account: &AccountInfo,
    max_staleness_sec: i64,
) -> Result<PythPrice> {
    // Verify it's owned by Pyth Receiver
    require!(
        price_feed_account.owner == &PYTH_ORACLE_PROGRAM_ID,
        TradingError::InvalidOracleAccount
    );

    let data = price_feed_account.try_borrow_data()?;

    // Account must be at least 36 bytes for the fields we need
    require!(data.len() >= 36, TradingError::InvalidOracleAccount);

    // Parse price data (skip 8-byte discriminator)
    let price = i64::from_le_bytes(data[8..16].try_into().unwrap());
    let conf = u64::from_le_bytes(data[16..24].try_into().unwrap());
    let expo = i32::from_le_bytes(data[24..28].try_into().unwrap());
    let publish_time = i64::from_le_bytes(data[28..36].try_into().unwrap());

    // Verify staleness
    let clock = Clock::get()?;
    let age = clock.unix_timestamp - publish_time;
    require!(
        age <= max_staleness_sec && age >= 0,
        TradingError::StalePriceData
    );

    // Verify price is valid (not zero)
    require!(price != 0, TradingError::InvalidOracleAccount);

    Ok(PythPrice {
        price,
        conf,
        expo,
        publish_time,
    })
}

/// Get cached price from Pyth Receiver - main entry point for instructions
///
/// Returns (price, exponent) tuple for trading calculations
pub fn get_cached_price(
    price_feed_account: &AccountInfo,
    pair: FxPair,
    max_staleness_slots: u64,
    max_confidence_bps: u16,
    clock: &Clock,
) -> Result<(i64, i32)> {
    // Convert slots to seconds (assuming ~400ms per slot)
    let max_staleness_sec = (max_staleness_slots as i64 * 400) / 1000;
    
    let pyth_price = get_pyth_price(price_feed_account, max_staleness_sec)?;
    
    // Validate confidence interval is acceptable
    // conf / price should be <= max_confidence_bps / 10000
    if pyth_price.price > 0 {
        let conf_ratio_bps = (pyth_price.conf as u128 * 10000 / pyth_price.price.unsigned_abs() as u128) as u16;
        require!(
            conf_ratio_bps <= max_confidence_bps,
            TradingError::PriceConfidenceTooWide
        );
    }
    
    msg!("Pyth price for {:?}: {} (expo: {})", pair, pyth_price.price, pyth_price.expo);
    
    Ok((pyth_price.price, pyth_price.expo))
}

/// Map FX pair enum to string identifier for PDA seeds
pub fn get_fx_pair_id(pair: FxPair) -> &'static str {
    match pair {
        FxPair::EURUSD => "eurusd",
        FxPair::GBPUSD => "gbpusd",
        FxPair::USDJPY => "usdjpy",
        FxPair::AUDUSD => "audusd",
        FxPair::USDCAD => "usdcad",
        FxPair::USDCHF => "usdchf",
        FxPair::NZDUSD => "nzdusd",
        FxPair::EURGBP => "eurgbp",
        FxPair::EURJPY => "eurjpy",
        FxPair::GBPJPY => "gbpjpy",
        FxPair::AUDJPY => "audjpy",
    }
}

/// Map FX pair to Pyth feed ID (hex string for client)
///
/// Client needs these to fetch updates from Hermes:
/// https://hermes.pyth.network/api/latest_price_feeds?ids[]=0x...
pub fn get_pyth_feed_id(pair: FxPair) -> &'static str {
    match pair {
        // Forex feed IDs from https://pyth.network/developers/price-feed-ids
        FxPair::EURUSD => "0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b",
        FxPair::GBPUSD => "0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1",
        FxPair::USDJPY => "0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52",
        FxPair::AUDUSD => "0x67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80",
        FxPair::USDCAD => "0x3112b03a41c910ed446852aacf67118cb76b3afb2838bc2c6e3e89307e1e9e2e",
        FxPair::USDCHF => "0x0b1e3297e69f162877b577b0d6a47a0d63b2392bc8499e6540da4187a63e28f8",
        FxPair::NZDUSD => "0x92eea8ba9aacd0285f8c485d21a88c4af1e8e8c0b2cae4ccb36830cf7cee5bdc",
        FxPair::EURGBP => "0xe98970cb6e63e77ad3de0c383cc4e64ef0aba02c9a1dee81caf98d85cbb78030",
        FxPair::EURJPY => "0x89e465b17fa2a71fb96d3c2e8b8c54c9c33bd39d1f2a30e3d3e5e3a6f8d3f3d9",
        FxPair::GBPJPY => "0xdeaf92eb8b23c77e8cb3fa11c74e99c2f04f1e5a1fc6e67ed84b84a1e81b6b71",
        FxPair::AUDJPY => "0x5670c628c2baee6d68e4cdb6e90e15e6bd31ad5e4ddd7d8d87b6f9b8e5f9e7cd",
    }
}

/// Check if current price has crossed a trigger threshold
pub fn has_crossed_trigger(
    current_price: i64,
    trigger_price: i64,
    direction: Direction,
) -> bool {
    match direction {
        // Long position: trigger when price drops BELOW trigger
        Direction::Long => current_price <= trigger_price,
        // Short position: trigger when price rises ABOVE trigger
        Direction::Short => current_price >= trigger_price,
    }
}

/// Get normalized price for trading calculations
/// Converts Pyth price (i64 with exponent) to 6-decimal USDC terms
pub fn normalize_price(pyth_price: &PythPrice) -> Result<i64> {
    // Most FX feeds use expo = -8 (price in 10^-8 units)
    // We want 6 decimals for USDC calculations
    // Example: EUR/USD = 1.0500 is stored as 105000000 (expo=-8)
    // We want: 1050000 (6 decimals)

    let target_expo: i32 = -6;
    let expo_diff = target_expo - pyth_price.expo;

    let normalized = if expo_diff >= 0 {
        pyth_price.price
            .checked_mul(10_i64.pow(expo_diff as u32))
            .ok_or(TradingError::ArithmeticOverflow)?
    } else {
        pyth_price.price
            .checked_div(10_i64.pow((-expo_diff) as u32))
            .ok_or(TradingError::ArithmeticOverflow)?
    };

    Ok(normalized)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_price() {
        // EUR/USD = 1.0500 with expo -8
        let price = PythPrice {
            price: 105000000,
            conf: 50000,
            expo: -8,
            publish_time: 0,
        };
        assert_eq!(normalize_price(&price).unwrap(), 1050000); // 1.05 in 6 decimals
    }

    #[test]
    fn test_has_crossed_trigger_long() {
        // Long position triggers when price drops
        assert!(has_crossed_trigger(99, 100, Direction::Long));
        assert!(has_crossed_trigger(100, 100, Direction::Long));
        assert!(!has_crossed_trigger(101, 100, Direction::Long));
    }

    #[test]
    fn test_has_crossed_trigger_short() {
        // Short position triggers when price rises
        assert!(has_crossed_trigger(101, 100, Direction::Short));
        assert!(has_crossed_trigger(100, 100, Direction::Short));
        assert!(!has_crossed_trigger(99, 100, Direction::Short));
    }
}

