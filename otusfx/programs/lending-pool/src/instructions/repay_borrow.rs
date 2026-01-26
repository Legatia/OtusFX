use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::LendingError;
use crate::state::{LendingConfig, BorrowPosition, StablecoinType};

#[derive(Accounts)]
#[instruction(stablecoin_type: StablecoinType)]
pub struct RepayBorrow<'info> {
    /// Trading position account (from Trading Engine)
    /// CHECK: Validated by borrow_position PDA seeds
    pub trading_position: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [LendingConfig::SEEDS_PREFIX],
        bump = lending_config.bump
    )]
    pub lending_config: Account<'info, LendingConfig>,

    #[account(
        mut,
        close = trading_engine_authority,
        seeds = [BorrowPosition::SEEDS_PREFIX, trading_position.key().as_ref()],
        bump = borrow_position.bump
    )]
    pub borrow_position: Account<'info, BorrowPosition>,

    #[account(
        mut,
        seeds = [b"usdc_vault"],
        bump
    )]
    pub usdc_vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        seeds = [b"usd1_vault"],
        bump
    )]
    pub usd1_vault: Account<'info, TokenAccount>,

    /// Trading Engine's token account (repays borrowed funds)
    #[account(mut)]
    pub trading_engine_token_account: Account<'info, TokenAccount>,

    /// Trading Engine authority (receives rent from closed borrow_position)
    #[account(mut)]
    pub trading_engine_authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(ctx: Context<RepayBorrow>, stablecoin_type: StablecoinType, repay_amount: u64) -> Result<()> {
    let config = &mut ctx.accounts.lending_config;
    let borrow_position = &mut ctx.accounts.borrow_position;
    let clock = Clock::get()?;

    // Verify stablecoin type matches borrow position
    require!(
        borrow_position.stablecoin_type == stablecoin_type,
        LendingError::InvalidStablecoin
    );

    // Accrue interest first
    let time_elapsed = clock.unix_timestamp - borrow_position.last_interest_update;
    let borrow_rate_bps = config.calculate_borrow_rate();
    const SECONDS_PER_YEAR: i64 = 365 * 24 * 60 * 60;

    // Calculate interest: principal * rate * time / year
    let interest = (borrow_position.borrowed_amount as u128 * borrow_rate_bps as u128 * time_elapsed as u128)
        / (10000 * SECONDS_PER_YEAR as u128);
    let interest = interest as u64;

    borrow_position.interest_accrued = borrow_position
        .interest_accrued
        .checked_add(interest)
        .ok_or(LendingError::ArithmeticOverflow)?;

    let total_debt = borrow_position.total_debt();

    // Verify repayment covers the full debt
    require!(
        repay_amount >= total_debt,
        LendingError::InsufficientRepayment
    );

    // Determine which vault to use
    let vault_account = match stablecoin_type {
        StablecoinType::USDC => ctx.accounts.usdc_vault.to_account_info(),
        StablecoinType::USD1 => ctx.accounts.usd1_vault.to_account_info(),
    };

    // Transfer stablecoin from Trading Engine back to vault
    let transfer_ctx = CpiContext::new(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: ctx.accounts.trading_engine_token_account.to_account_info(),
            to: vault_account,
            authority: ctx.accounts.trading_engine_authority.to_account_info(),
        },
    );
    token::transfer(transfer_ctx, repay_amount)?;

    // Split repayment: principal + interest
    let principal = borrow_position.borrowed_amount;
    let interest_paid = interest;

    // Interest distribution:
    // - (1 - reserve_factor) goes to lenders (increases total_deposits)
    // - reserve_factor goes to reserves
    let lender_share = (interest_paid as u128 * (10000 - config.reserve_factor as u128)) / 10000;
    let reserve_share = interest_paid - lender_share as u64;

    // Update global stats
    config.total_borrowed = config
        .total_borrowed
        .checked_sub(principal)
        .ok_or(LendingError::ArithmeticUnderflow)?;

    // Principal + lender share of interest goes back to deposits
    match stablecoin_type {
        StablecoinType::USDC => {
            config.total_deposited_usdc = config
                .total_deposited_usdc
                .checked_add(lender_share as u64)
                .ok_or(LendingError::ArithmeticOverflow)?;
        }
        StablecoinType::USD1 => {
            config.total_deposited_usd1 = config
                .total_deposited_usd1
                .checked_add(lender_share as u64)
                .ok_or(LendingError::ArithmeticOverflow)?;
        }
    }

    config.total_reserves = config
        .total_reserves
        .checked_add(reserve_share)
        .ok_or(LendingError::ArithmeticOverflow)?;

    let token_name = match stablecoin_type {
        StablecoinType::USDC => "USDC",
        StablecoinType::USD1 => "USD1",
    };

    msg!("Borrow repaid");
    msg!("Trading position: {}", ctx.accounts.trading_position.key());
    msg!("Principal: {} {}", principal / 1_000_000, token_name);
    msg!("Interest: {} {}", interest_paid / 1_000_000, token_name);
    msg!("To lenders: {} {}", lender_share / 1_000_000, token_name);
    msg!("To reserves: {} {}", reserve_share / 1_000_000, token_name);

    // borrow_position account will be closed automatically (via close constraint)

    Ok(())
}
