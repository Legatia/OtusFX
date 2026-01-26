pub mod config;
pub mod position;

pub use config::*;
pub use position::*;

use anchor_lang::prelude::*;

/// Stablecoin type for margin deposits
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum StablecoinType {
    USDC,
    USD1,
}
