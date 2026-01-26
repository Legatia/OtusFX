use anchor_lang::prelude::*;

pub mod error;
pub mod instructions;
pub mod state;

use error::BootstrapError;
use instructions::*;
use state::*;

declare_id!("BootStrap11111111111111111111111111111111111");

#[program]
pub mod bootstrap_pool {
    use super::*;

    /// Initialize the bootstrap pool
    pub fn initialize_bootstrap(
        ctx: Context<InitializeBootstrap>,
        bootstrap_start: i64,
        bootstrap_end: i64,
        otus_distribution_rate: u64,
    ) -> Result<()> {
        instructions::initialize_bootstrap::handler(
            ctx,
            bootstrap_start,
            bootstrap_end,
            otus_distribution_rate,
        )
    }

    /// Initialize user deposit account (must be called before first deposit)
    pub fn initialize_user_deposit(ctx: Context<InitializeUserDeposit>) -> Result<()> {
        instructions::initialize_user_deposit::handler(ctx)
    }

    /// Deposit stablecoin (USDC or USD1) to bootstrap pool
    pub fn deposit_usdc(ctx: Context<DepositUsdc>, stablecoin_type: StablecoinType, amount: u64) -> Result<()> {
        instructions::deposit_usdc::handler(ctx, stablecoin_type, amount)
    }

    /// Withdraw stablecoin (USDC or USD1) from bootstrap pool (before bootstrap_end)
    pub fn withdraw_usdc(ctx: Context<WithdrawUsdc>, stablecoin_type: StablecoinType, amount: u64) -> Result<()> {
        instructions::withdraw_usdc::handler(ctx, stablecoin_type, amount)
    }

    /// Claim OTUS rewards after TGE
    pub fn claim_otus_rewards(ctx: Context<ClaimOtusRewards>) -> Result<()> {
        instructions::claim_otus_rewards::handler(ctx)
    }

    /// Mint Scops NFT badge based on tier
    pub fn mint_scops_nft(ctx: Context<MintScopsNft>) -> Result<()> {
        instructions::mint_scops_nft::handler(ctx)
    }

    /// Close bootstrap pool (after bootstrap_end)
    pub fn close_bootstrap(ctx: Context<CloseBootstrap>) -> Result<()> {
        instructions::close_bootstrap::handler(ctx)
    }
}
