use anchor_lang::prelude::*;
use crate::error::TradingError;
use crate::state::TradingConfig;

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    #[account(
        mut,
        seeds = [TradingConfig::SEED_PREFIX],
        bump = config.bump,
        constraint = config.authority == authority.key() @ TradingError::InvalidAuthority
    )]
    pub config: Account<'info, TradingConfig>,

    pub authority: Signer<'info>,
}

pub fn handler(
    ctx: Context<UpdateConfig>,
    new_trading_fee_bps: Option<u16>,
    new_keeper_fee_bps: Option<u16>,
    new_max_leverage: Option<u8>,
    is_paused: Option<bool>,
) -> Result<()> {
    let config = &mut ctx.accounts.config;

    if let Some(fee) = new_trading_fee_bps {
        config.trading_fee_bps = fee;
        msg!("Updated trading fee to {} bps", fee);
    }

    if let Some(fee) = new_keeper_fee_bps {
        config.keeper_fee_bps = fee;
        msg!("Updated keeper fee to {} bps", fee);
    }

    if let Some(leverage) = new_max_leverage {
        config.max_leverage = leverage;
        msg!("Updated max leverage to {}x", leverage);
    }

    if let Some(paused) = is_paused {
        config.is_paused = paused;
        msg!("Trading paused: {}", paused);
    }

    Ok(())
}
