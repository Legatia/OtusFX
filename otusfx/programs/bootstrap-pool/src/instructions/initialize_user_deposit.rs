use anchor_lang::prelude::*;
use crate::state::{BootstrapConfig, UserDeposit};

#[derive(Accounts)]
pub struct InitializeUserDeposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [BootstrapConfig::SEEDS_PREFIX],
        bump = bootstrap_config.bump
    )]
    pub bootstrap_config: Account<'info, BootstrapConfig>,

    #[account(
        init,
        payer = user,
        space = UserDeposit::LEN,
        seeds = [UserDeposit::SEEDS_PREFIX, user.key().as_ref()],
        bump
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<InitializeUserDeposit>) -> Result<()> {
    let user_deposit = &mut ctx.accounts.user_deposit;
    let clock = Clock::get()?;

    user_deposit.user = ctx.accounts.user.key();
    user_deposit.usdc_deposited = 0;
    user_deposit.usd1_deposited = 0;
    user_deposit.total_usd_value = 0;
    user_deposit.deposit_timestamp = clock.unix_timestamp;
    user_deposit.otus_allocation = 0;
    user_deposit.scops_tier = crate::state::ScopsTier::None;
    user_deposit.has_claimed_otus = false;
    user_deposit.has_minted_scops = false;
    user_deposit.bump = ctx.bumps.user_deposit;

    msg!("User deposit account initialized");
    msg!("User: {}", ctx.accounts.user.key());

    Ok(())
}
