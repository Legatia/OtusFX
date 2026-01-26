use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use crate::error::BootstrapError;
use crate::state::{BootstrapConfig, UserDeposit};

#[derive(Accounts)]
pub struct ClaimOtusRewards<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        seeds = [BootstrapConfig::SEEDS_PREFIX],
        bump = bootstrap_config.bump
    )]
    pub bootstrap_config: Account<'info, BootstrapConfig>,

    #[account(
        mut,
        seeds = [UserDeposit::SEEDS_PREFIX, user.key().as_ref()],
        bump = user_deposit.bump,
        constraint = user_deposit.user == user.key() @ BootstrapError::Unauthorized
    )]
    pub user_deposit: Account<'info, UserDeposit>,

    /// OTUS token mint
    pub otus_mint: Account<'info, Mint>,

    /// Protocol's OTUS token reserve
    #[account(
        mut,
        constraint = otus_vault.mint == otus_mint.key()
    )]
    pub otus_vault: Account<'info, TokenAccount>,

    /// User's OTUS token account
    #[account(
        mut,
        constraint = user_otus_account.mint == otus_mint.key(),
        constraint = user_otus_account.owner == user.key()
    )]
    pub user_otus_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimOtusRewards>) -> Result<()> {
    let config = &ctx.accounts.bootstrap_config;
    let user_deposit = &mut ctx.accounts.user_deposit;
    let clock = Clock::get()?;

    // Verify bootstrap has ended
    require!(
        clock.unix_timestamp >= config.bootstrap_end,
        BootstrapError::BootstrapNotEnded
    );

    // Verify user hasn't already claimed
    require!(
        !user_deposit.has_claimed_otus,
        BootstrapError::AlreadyClaimedOtus
    );

    let otus_amount = user_deposit.otus_allocation;
    require!(otus_amount > 0, BootstrapError::InsufficientDeposit);

    // Transfer OTUS tokens from vault to user
    let seeds = &[BootstrapConfig::SEEDS_PREFIX, &[config.bump]];
    let signer_seeds = &[&seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.otus_vault.to_account_info(),
            to: ctx.accounts.user_otus_account.to_account_info(),
            authority: config.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, otus_amount)?;

    // Mark as claimed
    user_deposit.has_claimed_otus = true;

    msg!("OTUS rewards claimed");
    msg!("User: {}", ctx.accounts.user.key());
    msg!("Amount: {} OTUS", otus_amount);

    Ok(())
}
