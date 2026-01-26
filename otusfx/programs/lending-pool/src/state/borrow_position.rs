use anchor_lang::prelude::*;
use crate::state::StablecoinType;

/// Borrow position linked to a trading position
#[account]
pub struct BorrowPosition {
    /// Link to Trading Engine position
    pub trading_position: Pubkey,
    /// Stablecoin type borrowed
    pub stablecoin_type: StablecoinType,
    /// Amount borrowed (in stablecoin, 6 decimals)
    pub borrowed_amount: u64,
    /// Interest accumulated (in same stablecoin, 6 decimals)
    pub interest_accrued: u64,
    /// When borrowed
    pub borrow_timestamp: i64,
    /// Last interest calculation
    pub last_interest_update: i64,
    /// PDA bump
    pub bump: u8,
}

impl BorrowPosition {
    pub const LEN: usize = 8 + // discriminator
        32 + // trading_position
        1 + // stablecoin_type (enum)
        8 + // borrowed_amount
        8 + // interest_accrued
        8 + // borrow_timestamp
        8 + // last_interest_update
        1; // bump

    pub const SEEDS_PREFIX: &'static [u8] = b"borrow_position";

    /// Calculate total debt (principal + interest)
    pub fn total_debt(&self) -> u64 {
        self.borrowed_amount.saturating_add(self.interest_accrued)
    }
}
