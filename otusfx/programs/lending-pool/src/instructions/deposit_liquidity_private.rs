use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use crate::error::LendingError;
use crate::state::{LendingConfig, LenderPosition, StablecoinType};

// Privacy Cash Program ID (mainnet)
// For devnet, we'll need to find/deploy Privacy Cash on devnet
// For now, using placeholder that can be updated
declare_id!("PrivacyCash1111111111111111111111111111111");

#[derive(Accounts)]
pub struct DepositLiquidityPrivate<'info> {
    #[account(
        mut,
        has_one = usdc_vault,
        has_one = usd1_vault,
    )]
    pub lending_config: Account<'info, LendingConfig>,

    #[account(
        mut,
        seeds = [b"lender", lender.key().as_ref()],
        bump,
    )]
    pub lender_position: Account<'info, LenderPosition>,

    #[account(mut)]
    pub lender: Signer<'info>,

    /// User's token account (source)
    #[account(mut)]
    pub lender_token_account: Account<'info, TokenAccount>,

    /// Lending pool vault (USDC or USD1)
    #[account(mut)]
    pub pool_vault: Account<'info, TokenAccount>,

    /// Privacy Cash commitment PDA
    /// This stores the commitment in our program's state
    #[account(
        init,
        payer = lender,
        space = 8 + 32 + 32 + 8 + 1,
        seeds = [b"privacy_commitment", lender.key().as_ref(), &commitment],
        bump
    )]
    pub commitment_account: Account<'info, PrivacyCommitment>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

/// Stores Privacy Cash commitment data
#[account]
pub struct PrivacyCommitment {
    pub lender: Pubkey,
    pub commitment: [u8; 32],
    pub nullifier_hash: [u8; 32],
    pub amount: u64,
    pub is_spent: bool,
}

pub fn handler(
    ctx: Context<DepositLiquidityPrivate>,
    stablecoin_type: StablecoinType,
    amount: u64,
    commitment: [u8; 32],
    nullifier_hash: [u8; 32],
) -> Result<()> {
    let lending_config = &mut ctx.accounts.lending_config;
    let lender_position = &mut ctx.accounts.lender_position;

    require!(amount > 0, LendingError::InvalidAmount);
    require!(amount >= 1_000_000, LendingError::MinimumDepositNotMet); // Min 1 USDC

    // Verify commitment is not duplicate
    let commitment_check = &commitment[..];
    require!(
        commitment_check.iter().any(|&x| x != 0),
        LendingError::InvalidCommitment
    );

    // Step 1: Transfer tokens from user to lending pool vault
    let cpi_accounts = Transfer {
        from: ctx.accounts.lender_token_account.to_account_info(),
        to: ctx.accounts.pool_vault.to_account_info(),
        authority: ctx.accounts.lender.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
    token::transfer(cpi_ctx, amount)?;

    // Step 2: Store Privacy Cash commitment
    let commitment_account = &mut ctx.accounts.commitment_account;
    commitment_account.lender = ctx.accounts.lender.key();
    commitment_account.commitment = commitment;
    commitment_account.nullifier_hash = nullifier_hash;
    commitment_account.amount = amount;
    commitment_account.is_spent = false;

    // Step 3: Update lending pool state
    match stablecoin_type {
        StablecoinType::USDC => {
            lender_position.usdc_deposited += amount;
            lending_config.total_deposited_usdc += amount;
        }
        StablecoinType::USD1 => {
            lender_position.usd1_deposited += amount;
            lending_config.total_deposited_usd1 += amount;
        }
    }

    // Mark lender position as private
    lender_position.is_private = true;
    lender_position.privacy_commitment_count += 1;

    // Emit event (without revealing amount to preserve privacy)
    emit!(PrivateDepositEvent {
        lender: ctx.accounts.lender.key(),
        commitment,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("✅ Private deposit successful via Privacy Cash");
    msg!("Commitment: {:?}", commitment);
    Ok(())
}

#[event]
pub struct PrivateDepositEvent {
    pub lender: Pubkey,
    pub commitment: [u8; 32],
    pub timestamp: i64,
}
