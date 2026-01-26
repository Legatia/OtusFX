use anchor_lang::prelude::*;

declare_id!("5ViKWmxzdXATK9b4x3bgr9szqsR2UhfokPJNLLQCKL76");

pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use instructions::*;

#[program]
pub mod otusfx {
    use super::*;

    /// Initialize the trading engine configuration
    pub fn initialize(
        ctx: Context<Initialize>,
        trading_fee_bps: u16,
        keeper_fee_bps: u16,
        max_leverage: u8,
        min_leverage: u8,
    ) -> Result<()> {
        instructions::initialize::handler(ctx, trading_fee_bps, keeper_fee_bps, max_leverage, min_leverage)
    }

    /// Open a new leveraged position
    pub fn open_position(
        ctx: Context<OpenPosition>,
        pair: u8,
        direction: u8,
        margin: u64,
        leverage: u8,
    ) -> Result<()> {
        instructions::open_position::handler(ctx, pair, direction, margin, leverage)
    }

    /// Trigger progressive deleverage at a specific tier
    pub fn trigger_deleverage(
        ctx: Context<TriggerDeleverage>,
        tier: u8,
    ) -> Result<()> {
        instructions::trigger_deleverage::handler(ctx, tier)
    }

    /// Close a position manually or after full deleverage
    pub fn close_position(
        ctx: Context<ClosePosition>,
    ) -> Result<()> {
        instructions::close_position::handler(ctx)
    }

    /// Update trading configuration (admin only)
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_trading_fee_bps: Option<u16>,
        new_keeper_fee_bps: Option<u16>,
        new_max_leverage: Option<u8>,
        is_paused: Option<bool>,
    ) -> Result<()> {
        instructions::update_config::handler(ctx, new_trading_fee_bps, new_keeper_fee_bps, new_max_leverage, is_paused)
    }
}
