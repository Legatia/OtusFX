use anchor_lang::prelude::*;
use super::{FxPair, Direction, StablecoinType};

/// Represents a leveraged FX position with auto-deleverage support
#[account]
pub struct Position {
    /// Owner of the position
    pub owner: Pubkey,

    /// Unique position ID (global counter)
    pub position_id: u64,

    /// Position status
    pub is_open: bool,

    /// FX pair being traded
    pub pair: FxPair,

    /// Long or Short
    pub direction: Direction,

    /// Stablecoin type used for margin (USDC or USD1)
    pub collateral_type: StablecoinType,

    /// Current leverage (decreases with deleverage)
    pub leverage: u8,

    /// Initial leverage at opening
    pub initial_leverage: u8,

    /// Current margin (in stablecoin, 6 decimals)
    pub margin: u64,

    /// Initial margin at opening
    pub initial_margin: u64,

    /// Position size (notional value in USD)
    pub size: u64,

    /// Entry price (Pyth format with exponent)
    pub entry_price: i64,

    /// Price exponent (e.g., -8 means divide by 10^8)
    pub entry_price_expo: i32,

    /// Trigger prices for auto-deleverage [tier0, tier1, tier2, tier3]
    /// Calculated at position open based on margin health thresholds
    /// MVP: Stored in plaintext (V2: encrypted via Arcium)
    pub trigger_prices: [i64; 4],

    /// Track which deleverage tiers have been executed
    pub deleverage_executed: [bool; 4],

    /// Timestamp when position was opened
    pub opened_at: i64,

    /// Timestamp when position was closed (None if still open)
    pub closed_at: Option<i64>,

    /// Final PnL in OTUS (settlement token)
    pub final_pnl_otus: Option<i64>,

    /// Bump for PDA derivation
    pub bump: u8,
}

impl Position {
    pub const LEN: usize = 8 +   // discriminator
        32 +                      // owner
        8 +                       // position_id
        1 +                       // is_open
        1 +                       // pair
        1 +                       // direction
        1 +                       // collateral_type
        1 +                       // leverage
        1 +                       // initial_leverage
        8 +                       // margin
        8 +                       // initial_margin
        8 +                       // size
        8 +                       // entry_price
        4 +                       // entry_price_expo
        32 +                      // trigger_prices (4 * 8)
        4 +                       // deleverage_executed (4 * 1)
        8 +                       // opened_at
        9 +                       // closed_at (Option<i64>)
        9 +                       // final_pnl_otus (Option<i64>)
        1;                        // bump

    pub const SEED_PREFIX: &'static [u8] = b"position";

    /// Calculate current margin health percentage (0-100)
    /// margin_health = (margin + unrealized_pnl) / initial_margin * 100
    pub fn calculate_margin_health(&self, current_price: i64, current_price_expo: i32) -> Result<u8> {
        // Calculate unrealized PnL
        let pnl = self.calculate_unrealized_pnl(current_price, current_price_expo)?;

        // Current equity = margin + unrealized PnL
        let current_equity = if pnl >= 0 {
            self.margin.checked_add(pnl as u64)
                .ok_or(error!(crate::error::TradingError::ArithmeticOverflow))?
        } else {
            self.margin.checked_sub(pnl.abs() as u64)
                .ok_or(error!(crate::error::TradingError::ArithmeticUnderflow))?
        };

        // margin_health = (current_equity / initial_margin) * 100
        let health = current_equity
            .checked_mul(100)
            .ok_or(error!(crate::error::TradingError::ArithmeticOverflow))?
            .checked_div(self.initial_margin)
            .ok_or(error!(crate::error::TradingError::DivisionByZero))?;

        Ok(health.min(255) as u8)
    }

    /// Calculate unrealized PnL in USDC (can be negative)
    pub fn calculate_unrealized_pnl(&self, current_price: i64, current_price_expo: i32) -> Result<i64> {
        // Normalize prices to same exponent
        let (entry_normalized, current_normalized) = if self.entry_price_expo == current_price_expo {
            (self.entry_price, current_price)
        } else {
            // Handle exponent differences
            if self.entry_price_expo > current_price_expo {
                let diff = (self.entry_price_expo - current_price_expo) as u32;
                let multiplier = 10_i64.pow(diff);
                (self.entry_price, current_price.checked_mul(multiplier)
                    .ok_or(error!(crate::error::TradingError::ArithmeticOverflow))?)
            } else {
                let diff = (current_price_expo - self.entry_price_expo) as u32;
                let multiplier = 10_i64.pow(diff);
                (self.entry_price.checked_mul(multiplier)
                    .ok_or(error!(crate::error::TradingError::ArithmeticOverflow))?, current_price)
            }
        };

        // Calculate price delta
        let price_delta = match self.direction {
            Direction::Long => current_normalized - entry_normalized,
            Direction::Short => entry_normalized - current_normalized,
        };

        // PnL = (price_delta / entry_price) * size
        // Using i128 to avoid overflow in intermediate calculations
        let pnl = (price_delta as i128)
            .checked_mul(self.size as i128)
            .ok_or(error!(crate::error::TradingError::ArithmeticOverflow))?
            .checked_div(entry_normalized as i128)
            .ok_or(error!(crate::error::TradingError::DivisionByZero))? as i64;

        Ok(pnl)
    }

    /// Check if a deleverage tier should be triggered
    pub fn should_trigger_deleverage(&self, tier: u8, current_margin_health: u8, thresholds: &[u8; 4]) -> bool {
        if tier >= 4 {
            return false;
        }

        let threshold = thresholds[tier as usize];
        current_margin_health <= threshold && !self.deleverage_executed[tier as usize]
    }

    /// Calculate how much position to close for a deleverage tier
    pub fn calculate_deleverage_amount(&self, tier: u8) -> Result<(u64, u8)> {
        let (close_percentage, target_leverage) = match tier {
            0 => (50, self.initial_leverage / 2), // Tier 0: 50% margin health → close 50%, halve leverage
            1 => (50, self.leverage / 2),         // Tier 1: 35% margin health → close 50% more, halve again
            2 => {
                // Tier 2: 25% margin health → reduce to 2x leverage
                let current_size = self.size;
                let target_size = self.margin.checked_mul(2)
                    .ok_or(error!(crate::error::TradingError::ArithmeticOverflow))?;
                let close_size = current_size.checked_sub(target_size)
                    .ok_or(error!(crate::error::TradingError::ArithmeticUnderflow))?;
                let close_pct = close_size.checked_mul(100)
                    .ok_or(error!(crate::error::TradingError::ArithmeticOverflow))?
                    .checked_div(current_size)
                    .ok_or(error!(crate::error::TradingError::DivisionByZero))? as u8;
                return Ok((close_pct as u64, 2));
            }
            3 => (100, 0), // Tier 3: 15% margin health → close all remaining
            _ => return Err(error!(crate::error::TradingError::InvalidDeleverageTier)),
        };

        Ok((close_percentage, target_leverage))
    }
}
