use anchor_lang::prelude::*;
use crate::state::{LendingConfig, LenderPosition};

#[derive(Accounts)]
pub struct InitializeLenderPosition<'info> {
    #[account(mut)]
    pub lender: Signer<'info>,

    #[account(
        seeds = [LendingConfig::SEEDS_PREFIX],
        bump = lending_config.bump
    )]
    pub lending_config: Account<'info, LendingConfig>,

    #[account(
        init,
        payer = lender,
        space = LenderPosition::LEN,
        seeds = [LenderPosition::SEEDS_PREFIX, lender.key().as_ref()],
        bump
    )]
    pub lender_position: Account<'info, LenderPosition>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeLenderPosition>) -> Result<()> {
    let lender_position = &mut ctx.accounts.lender_position;
    let clock = Clock::get()?;

    lender_position.lender = ctx.accounts.lender.key();
    lender_position.usdc_deposited = 0;
    lender_position.usd1_deposited = 0;
    lender_position.total_usd_value = 0;
    lender_position.otus_interest_earned = 0;
    lender_position.otus_interest_claimed = 0;
    lender_position.deposit_timestamp = clock.unix_timestamp;
    lender_position.last_interest_update = clock.unix_timestamp;
    lender_position.cumulative_usdc_deposited = 0;
    lender_position.cumulative_usd1_deposited = 0;
    lender_position.cumulative_usdc_withdrawn = 0;
    lender_position.cumulative_usd1_withdrawn = 0;
    lender_position.bump = ctx.bumps.lender_position;

    msg!("Lender position initialized");
    msg!("Lender: {}", ctx.accounts.lender.key());

    Ok(())
}
