use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer, Mint};
use crate::error::LendingError;
use crate::state::{LendingConfig, LenderPosition};

#[derive(Accounts)]
pub struct ClaimOtusRewards<'info> {
    #[account(mut)]
    pub lender: Signer<'info>,

    #[account(
        mut,
        seeds = [LendingConfig::SEEDS_PREFIX],
        bump = lending_config.bump
    )]
    pub lending_config: Account<'info, LendingConfig>,

    #[account(
        mut,
        seeds = [LenderPosition::SEEDS_PREFIX, lender.key().as_ref()],
        bump = lender_position.bump,
        constraint = lender_position.lender == lender.key() @ LendingError::Unauthorized
    )]
    pub lender_position: Account<'info, LenderPosition>,

    /// OTUS token mint
    pub otus_mint: Account<'info, Mint>,

    /// Protocol's OTUS token reserve
    #[account(
        mut,
        constraint = otus_vault.mint == otus_mint.key()
    )]
    pub otus_vault: Account<'info, TokenAccount>,

    /// Lender's OTUS token account
    #[account(
        mut,
        constraint = lender_otus_account.mint == otus_mint.key(),
        constraint = lender_otus_account.owner == lender.key()
    )]
    pub lender_otus_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<ClaimOtusRewards>) -> Result<()> {
    let config = &mut ctx.accounts.lending_config;
    let lender_position = &mut ctx.accounts.lender_position;
    let clock = Clock::get()?;

    // Accrue interest first
    let apr_bps = config.calculate_lender_rate();
    lender_position.accrue_interest(apr_bps, config.otus_price_usd, clock.unix_timestamp);

    // Get OTUS interest earned
    let otus_to_claim = lender_position.otus_interest_earned;

    require!(otus_to_claim > 0, LendingError::NoOtusRewards);

    // Transfer OTUS from vault to lender
    let seeds = &[LendingConfig::SEEDS_PREFIX, &[config.bump]];
    let signer_seeds = &[&seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.otus_vault.to_account_info(),
            to: ctx.accounts.lender_otus_account.to_account_info(),
            authority: config.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, otus_to_claim)?;

    // Update lender position
    lender_position.otus_interest_claimed = lender_position
        .otus_interest_claimed
        .checked_add(otus_to_claim)
        .ok_or(LendingError::ArithmeticOverflow)?;

    lender_position.otus_interest_earned = 0;

    msg!("OTUS interest claimed");
    msg!("Lender: {}", ctx.accounts.lender.key());
    msg!("Amount: {} OTUS", otus_to_claim);

    Ok(())
}
