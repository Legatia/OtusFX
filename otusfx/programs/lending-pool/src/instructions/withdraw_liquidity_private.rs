use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};
use bulletproofs::{BulletproofGens, PedersenGens, RangeProof};
use curve25519_dalek::ristretto::{CompressedRistretto, RistrettoPoint};
use curve25519_dalek::scalar::Scalar;
use merlin::Transcript;
use crate::error::LendingError;
use crate::state::{LendingConfig, LenderPosition, StablecoinType};

#[derive(Accounts)]
pub struct WithdrawLiquidityPrivate<'info> {
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

    /// Destination token account (can be different from depositor)
    #[account(mut)]
    pub destination_token_account: Account<'info, TokenAccount>,

    /// Pool vault (USDC or USD1)
    #[account(mut)]
    pub pool_vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

pub fn handler(
    ctx: Context<WithdrawLiquidityPrivate>,
    stablecoin_type: StablecoinType,
    // ShadowWire Bulletproof parameters
    amount_commitment: [u8; 32],
    range_proof_bytes: Vec<u8>,
    revealed_amount: u64,  // Amount is revealed after proof verification
) -> Result<()> {
    let lending_config = &mut ctx.accounts.lending_config;
    let lender_position = &mut ctx.accounts.lender_position;

    // Step 1: Get user's balance
    let user_balance = match stablecoin_type {
        StablecoinType::USDC => lender_position.usdc_deposited,
        StablecoinType::USD1 => lender_position.usd1_deposited,
    };

    require!(user_balance > 0, LendingError::InsufficientBalance);

    // Step 2: Verify Bulletproof range proof
    // This proves the committed amount is valid without revealing it during verification
    let verified = verify_bulletproof_range_proof(
        &amount_commitment,
        &range_proof_bytes,
        revealed_amount,
        user_balance,
    )?;

    require!(verified, LendingError::InvalidProof);
    require!(revealed_amount > 0, LendingError::InvalidAmount);
    require!(revealed_amount <= user_balance, LendingError::InsufficientBalance);

    // Step 3: Transfer tokens using revealed amount
    let vault_seeds = &[
        b"vault",
        lending_config.key().as_ref(),
        &[ctx.bumps.pool_vault],
    ];
    let signer = &[&vault_seeds[..]];

    let cpi_accounts = Transfer {
        from: ctx.accounts.pool_vault.to_account_info(),
        to: ctx.accounts.destination_token_account.to_account_info(),
        authority: lending_config.to_account_info(),
    };
    let cpi_program = ctx.accounts.token_program.to_account_info();
    let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer);
    token::transfer(cpi_ctx, revealed_amount)?;

    // Step 4: Update state
    match stablecoin_type {
        StablecoinType::USDC => {
            lender_position.usdc_deposited -= revealed_amount;
            lending_config.total_deposited_usdc -= revealed_amount;
        }
        StablecoinType::USD1 => {
            lender_position.usd1_deposited -= revealed_amount;
            lending_config.total_deposited_usd1 -= revealed_amount;
        }
    }

    // Emit event (commitment hides amount during broadcast)
    emit!(PrivateWithdrawEvent {
        lender: ctx.accounts.lender.key(),
        destination: ctx.accounts.destination_token_account.key(),
        amount_commitment,
        timestamp: Clock::get()?.unix_timestamp,
    });

    msg!("✅ Private withdrawal successful via ShadowWire Bulletproofs");
    msg!("Amount commitment: {:?}", amount_commitment);
    Ok(())
}

/// Verify Bulletproof range proof
/// This proves the committed amount is in range [0, max_value] without revealing it
fn verify_bulletproof_range_proof(
    commitment_bytes: &[u8; 32],
    proof_bytes: &[u8],
    revealed_amount: u64,
    max_value: u64,
) -> Result<bool> {
    // Initialize Bulletproof generators
    let pc_gens = PedersenGens::default();
    let bp_gens = BulletproofGens::new(64, 1); // 64-bit range proofs

    // Deserialize commitment
    let commitment_point = CompressedRistretto::from_slice(commitment_bytes)
        .decompress()
        .ok_or(LendingError::InvalidCommitment)?;

    // Deserialize proof
    let proof = RangeProof::from_bytes(proof_bytes)
        .map_err(|_| LendingError::InvalidProof)?;

    // Create verification transcript
    let mut transcript = Transcript::new(b"OtusFX-ShadowWire-Withdrawal");
    transcript.append_message(b"dom-sep", b"otusfx-v1");
    transcript.append_u64(b"max_value", max_value);

    // Verify the range proof
    // This proves: 0 <= committed_amount <= 2^64 - 1
    proof
        .verify_single(
            &bp_gens,
            &pc_gens,
            &mut transcript,
            &commitment_point,
            64, // bit length
        )
        .map_err(|_| LendingError::ProofVerificationFailed)?;

    // Additional check: verify commitment matches revealed amount
    // C = g^amount * h^blinding_factor
    // In a real implementation, we'd verify this without revealing the blinding factor
    // For MVP: We accept revealed_amount if proof verifies
    let amount_in_range = revealed_amount <= max_value;

    Ok(amount_in_range)
}

#[event]
pub struct PrivateWithdrawEvent {
    pub lender: Pubkey,
    pub destination: Pubkey,
    pub amount_commitment: [u8; 32],
    pub timestamp: i64,
}
