pub mod config;
pub mod lender_position;
pub mod borrow_position;

pub use config::*;
pub use lender_position::*;
pub use borrow_position::*;

use anchor_lang::prelude::*;

/// Stablecoin type for deposits/withdrawals/borrows
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum StablecoinType {
    USDC,
    USD1,
}
