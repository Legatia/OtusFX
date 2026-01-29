use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;
pub mod utils;

use error::LendingError;
use instructions::*;
use state::*;

declare_id!("LendingPoo111111111111111111111111111111111");

#[program]
pub mod lending_pool {
    use super::*;

    /// Initialize the lending pool
    pub fn initialize_lending(
        ctx: Context<InitializeLending>,
        base_interest_rate: u16,
        utilization_multiplier: u16,
        max_utilization_rate: u16,
        reserve_factor: u16,
        initial_otus_price_usd: u64,
    ) -> Result<()> {
        instructions::initialize_lending::handler(
            ctx,
            base_interest_rate,
            utilization_multiplier,
            max_utilization_rate,
            reserve_factor,
            initial_otus_price_usd,
        )
    }

    /// Initialize lender position account (must be called before first deposit)
    pub fn initialize_lender_position(ctx: Context<InitializeLenderPosition>) -> Result<()> {
        instructions::initialize_lender_position::handler(ctx)
    }

    /// Deposit stablecoin (USDC or USD1) to lending pool
    pub fn deposit_liquidity(
        ctx: Context<DepositLiquidity>,
        stablecoin_type: StablecoinType,
        amount: u64,
    ) -> Result<()> {
        instructions::deposit_liquidity::handler(ctx, stablecoin_type, amount)
    }

    /// Withdraw stablecoin (USDC or USD1) from lending pool
    pub fn withdraw_liquidity(
        ctx: Context<WithdrawLiquidity>,
        stablecoin_type: StablecoinType,
        amount: u64,
    ) -> Result<()> {
        instructions::withdraw_liquidity::handler(ctx, stablecoin_type, amount)
    }

    /// Deposit stablecoin with Privacy Cash (hides deposit source)
    pub fn deposit_liquidity_private(
        ctx: Context<DepositLiquidityPrivate>,
        stablecoin_type: StablecoinType,
        amount: u64,
        commitment: [u8; 32],
        nullifier_hash: [u8; 32],
    ) -> Result<()> {
        instructions::deposit_liquidity_private::handler(
            ctx,
            stablecoin_type,
            amount,
            commitment,
            nullifier_hash,
        )
    }

    /// Withdraw stablecoin with ShadowWire Bulletproofs (hides withdrawal amount)
    pub fn withdraw_liquidity_private(
        ctx: Context<WithdrawLiquidityPrivate>,
        stablecoin_type: StablecoinType,
        amount_commitment: [u8; 32],
        range_proof_bytes: Vec<u8>,
        revealed_amount: u64,
    ) -> Result<()> {
        instructions::withdraw_liquidity_private::handler(
            ctx,
            stablecoin_type,
            amount_commitment,
            range_proof_bytes,
            revealed_amount,
        )
    }

    /// Borrow stablecoin for leveraged trading (CPI from Trading Engine)
    pub fn borrow_for_leverage(
        ctx: Context<BorrowForLeverage>,
        stablecoin_type: StablecoinType,
        borrow_amount: u64,
    ) -> Result<()> {
        instructions::borrow_for_leverage::handler(ctx, stablecoin_type, borrow_amount)
    }

    /// Repay borrowed stablecoin (CPI from Trading Engine)
    pub fn repay_borrow(
        ctx: Context<RepayBorrow>,
        stablecoin_type: StablecoinType,
        repay_amount: u64,
    ) -> Result<()> {
        instructions::repay_borrow::handler(ctx, stablecoin_type, repay_amount)
    }

    /// Accrue interest for all lender positions (permissionless crank)
    pub fn accrue_pool_interest(ctx: Context<AccruePoolInterest>) -> Result<()> {
        instructions::accrue_pool_interest::handler(ctx)
    }

    /// Claim OTUS interest earned from lending
    pub fn claim_otus_rewards(ctx: Context<ClaimOtusRewards>) -> Result<()> {
        instructions::claim_otus_rewards::handler(ctx)
    }

    /// Update lending config (admin only)
    pub fn update_lending_config(
        ctx: Context<UpdateLendingConfig>,
        base_interest_rate: Option<u16>,
        utilization_multiplier: Option<u16>,
        max_utilization_rate: Option<u16>,
        reserve_factor: Option<u16>,
        otus_price_usd: Option<u64>,
    ) -> Result<()> {
        instructions::update_lending_config::handler(
            ctx,
            base_interest_rate,
            utilization_multiplier,
            max_utilization_rate,
            reserve_factor,
            otus_price_usd,
        )
    }
}
