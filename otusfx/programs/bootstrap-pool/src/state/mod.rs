pub mod config;
pub mod user_deposit;

pub use config::*;
pub use user_deposit::*;

use anchor_lang::prelude::*;

/// Stablecoin type for deposits/withdrawals
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum StablecoinType {
    USDC,
    USD1,
}
