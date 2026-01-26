use anchor_lang::prelude::*;
use anchor_lang::{AnchorSerialize, AnchorDeserialize};

/// Global trading configuration
#[account]
pub struct TradingConfig {
    /// Authority that can update config
    pub authority: Pubkey,

    /// OTUS treasury program for settlement
    pub otus_treasury: Pubkey,

    /// USDC vault for margin deposits
    pub usdc_vault: Pubkey,

    /// USD1 vault for margin deposits
    pub usd1_vault: Pubkey,

    /// Trading fee in basis points (8 bps = 0.08%)
    pub trading_fee_bps: u16,

    /// Keeper fee in basis points (5 bps = 0.05% of closed notional)
    pub keeper_fee_bps: u16,

    /// Maximum leverage allowed (default: 20x)
    pub max_leverage: u8,

    /// Minimum leverage floor after deleverage (default: 2x)
    pub min_leverage: u8,

    /// Margin health thresholds for auto-deleverage [50, 35, 25, 15]
    pub deleverage_thresholds: [u8; 4],

    /// Pyth program ID
    pub pyth_program: Pubkey,

    /// Maximum age for Pyth price data (seconds)
    pub max_price_age: i64,

    /// Maximum price confidence ratio (e.g., 2% = 200 bps)
    pub max_price_confidence_bps: u16,

    /// Trading paused flag
    pub is_paused: bool,

    /// Global position counter
    pub position_counter: u64,

    /// Bump for PDA derivation
    pub bump: u8,
}

impl TradingConfig {
    pub const LEN: usize = 8 +  // discriminator
        32 +                     // authority
        32 +                     // otus_treasury
        32 +                     // usdc_vault
        32 +                     // usd1_vault
        2 +                      // trading_fee_bps
        2 +                      // keeper_fee_bps
        1 +                      // max_leverage
        1 +                      // min_leverage
        4 +                      // deleverage_thresholds
        32 +                     // pyth_program
        8 +                      // max_price_age
        2 +                      // max_price_confidence_bps
        1 +                      // is_paused
        8 +                      // position_counter
        1;                       // bump

    pub const SEED_PREFIX: &'static [u8] = b"config";
}

/// FX trading pairs supported by the protocol
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum FxPair {
    EURUSD = 0,
    GBPUSD = 1,
    USDJPY = 2,
    AUDUSD = 3,
    USDCAD = 4,
    USDCHF = 5,
    NZDUSD = 6,
    EURGBP = 7,
    EURJPY = 8,
    GBPJPY = 9,
    AUDJPY = 10,
}

impl FxPair {
    pub fn from_u8(value: u8) -> Option<Self> {
        match value {
            0 => Some(FxPair::EURUSD),
            1 => Some(FxPair::GBPUSD),
            2 => Some(FxPair::USDJPY),
            3 => Some(FxPair::AUDUSD),
            4 => Some(FxPair::USDCAD),
            5 => Some(FxPair::USDCHF),
            6 => Some(FxPair::NZDUSD),
            7 => Some(FxPair::EURGBP),
            8 => Some(FxPair::EURJPY),
            9 => Some(FxPair::GBPJPY),
            10 => Some(FxPair::AUDJPY),
            _ => None,
        }
    }
}

/// Position direction
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Direction {
    Long = 0,
    Short = 1,
}

impl Direction {
    pub fn from_u8(value: u8) -> Option<Self> {
        match value {
            0 => Some(Direction::Long),
            1 => Some(Direction::Short),
            _ => None,
        }
    }
}
