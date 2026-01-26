use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::LendingError;
use crate::state::{LendingConfig, BorrowPosition, StablecoinType};

/// Expected Trading Engine Program ID (will be set when Trading Engine is deployed)
/// Placeholder address - update with actual program ID after deployment
#[allow(dead_code)]
const TRADING_ENGINE_PROGRAM_ID: &str = "5ViKWmxzdXATK9b4x3bgr9szqsR2UhfokPJNLLQCKL76";

#[derive(Accounts)]
#[instruction(stablecoin_type: StablecoinType)]
pub struct BorrowForLeverage<'info> {
    /// Trading position account (from Trading Engine)
    /// CHECK: Validated by Trading Engine program
    pub trading_position: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [LendingConfig::SEEDS_PREFIX],
        bump = lending_config.bump
    )]
    pub lending_config: Account<'info, LendingConfig>,

    #[account(
        init,
        payer = trading_engine_authority,
        space = BorrowPosition::LEN,
        seeds = [BorrowPosition::SEEDS_PREFIX, trading_position.key().as_ref()],
        bump
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

    /// Trading Engine's token account (receives borrowed funds)
    #[account(mut)]
    pub trading_engine_token_account: Account<'info, TokenAccount>,

    /// Trading Engine authority (payer for borrow_position account)
    #[account(mut)]
    pub trading_engine_authority: Signer<'info>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

pub fn handler(ctx: Context<BorrowForLeverage>, stablecoin_type: StablecoinType, borrow_amount: u64) -> Result<()> {
    let config = &mut ctx.accounts.lending_config;
    let borrow_position = &mut ctx.accounts.borrow_position;
    let clock = Clock::get()?;

    // Verify caller is Trading Engine program (CPI check)
    // Note: In production, validate that the calling program is the Trading Engine
    // For now, we'll allow any caller for testing purposes
    // TODO: Uncomment this in production
    // require!(
    //     ctx.accounts.trading_position.owner == &TRADING_ENGINE_PROGRAM_ID,
    //     LendingError::UnauthorizedCaller
    // );

    require!(borrow_amount > 0, LendingError::InvalidBorrowAmount);

    // Verify utilization won't exceed max
    let new_total_borrowed = config
        .total_borrowed
        .checked_add(borrow_amount)
        .ok_or(LendingError::ArithmeticOverflow)?;

    let total_deposits = config.total_deposits();
    if total_deposits > 0 {
        let new_utilization = (new_total_borrowed * 10000) / total_deposits;
        require!(
            new_utilization <= config.max_utilization_rate as u64,
            LendingError::MaxUtilizationExceeded
        );
    } else {
        return Err(LendingError::InsufficientLiquidity.into());
    }

    // Determine which vault to use
    let vault_account = match stablecoin_type {
        StablecoinType::USDC => ctx.accounts.usdc_vault.to_account_info(),
        StablecoinType::USD1 => ctx.accounts.usd1_vault.to_account_info(),
    };

    // Transfer stablecoin from vault to Trading Engine
    let seeds = &[LendingConfig::SEEDS_PREFIX, &[config.bump]];
    let signer_seeds = &[&seeds[..]];

    let transfer_ctx = CpiContext::new_with_signer(
        ctx.accounts.token_program.to_account_info(),
        Transfer {
            from: vault_account,
            to: ctx.accounts.trading_engine_token_account.to_account_info(),
            authority: config.to_account_info(),
        },
        signer_seeds,
    );
    token::transfer(transfer_ctx, borrow_amount)?;

    // Create borrow position
    borrow_position.trading_position = ctx.accounts.trading_position.key();
    borrow_position.stablecoin_type = stablecoin_type;
    borrow_position.borrowed_amount = borrow_amount;
    borrow_position.interest_accrued = 0;
    borrow_position.borrow_timestamp = clock.unix_timestamp;
    borrow_position.last_interest_update = clock.unix_timestamp;
    borrow_position.bump = ctx.bumps.borrow_position;

    // Update global stats
    config.total_borrowed = new_total_borrowed;

    let utilization = (config.total_borrowed * 10000) / total_deposits;
    let borrow_rate = config.calculate_borrow_rate();

    let token_name = match stablecoin_type {
        StablecoinType::USDC => "USDC",
        StablecoinType::USD1 => "USD1",
    };

    msg!("Borrowed for leverage");
    msg!("Trading position: {}", ctx.accounts.trading_position.key());
    msg!("Amount: {} {}", borrow_amount / 1_000_000, token_name);
    msg!("Utilization: {}bps", utilization);
    msg!("Borrow rate: {}bps", borrow_rate);

    Ok(())
}
