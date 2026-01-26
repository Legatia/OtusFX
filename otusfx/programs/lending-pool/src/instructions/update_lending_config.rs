use anchor_lang::prelude::*;
use crate::error::LendingError;
use crate::state::LendingConfig;

#[derive(Accounts)]
pub struct UpdateLendingConfig<'info> {
    #[account(
        constraint = authority.key() == lending_config.authority @ LendingError::Unauthorized
    )]
    pub authority: Signer<'info>,

    #[account(
        mut,
        seeds = [LendingConfig::SEEDS_PREFIX],
        bump = lending_config.bump
    )]
    pub lending_config: Account<'info, LendingConfig>,
}

pub fn handler(
    ctx: Context<UpdateLendingConfig>,
    base_interest_rate: Option<u16>,
    utilization_multiplier: Option<u16>,
    max_utilization_rate: Option<u16>,
    reserve_factor: Option<u16>,
    otus_price_usd: Option<u64>,
) -> Result<()> {
    let config = &mut ctx.accounts.lending_config;

    if let Some(rate) = base_interest_rate {
        require!(rate <= 5000, LendingError::InvalidInterestRate);
        config.base_interest_rate = rate;
        msg!("Base interest rate updated: {}bps", rate);
    }

    if let Some(multiplier) = utilization_multiplier {
        require!(multiplier <= 2000, LendingError::InvalidInterestRate);
        config.utilization_multiplier = multiplier;
        msg!("Utilization multiplier updated: {}bps", multiplier);
    }

    if let Some(max_util) = max_utilization_rate {
        require!(
            max_util <= 9000 && max_util >= 5000,
            LendingError::InvalidInterestRate
        );
        config.max_utilization_rate = max_util;
        msg!("Max utilization rate updated: {}bps", max_util);
    }

    if let Some(factor) = reserve_factor {
        require!(factor <= 3000, LendingError::InvalidReserveFactor);
        config.reserve_factor = factor;
        msg!("Reserve factor updated: {}bps", factor);
    }

    if let Some(price) = otus_price_usd {
        require!(price > 0, LendingError::InvalidInterestRate);
        config.otus_price_usd = price;
        msg!("OTUS price updated: ${}", price as f64 / 1_000_000.0);
    }

    msg!("Lending config updated");

    Ok(())
}
