use anchor_lang::prelude::*;

/// Lending pool configuration
#[account]
pub struct LendingConfig {
    /// Protocol authority
    pub authority: Pubkey,
    /// USDC vault (main liquidity pool)
    pub usdc_vault: Pubkey,
    /// USD1 vault (alternative stablecoin)
    pub usd1_vault: Pubkey,
    /// OTUS token vault (for interest payments)
    pub otus_vault: Pubkey,
    /// Total USDC deposited by lenders
    pub total_deposited_usdc: u64,
    /// Total USD1 deposited by lenders
    pub total_deposited_usd1: u64,
    /// Total stablecoins currently borrowed for leverage (combined USDC + USD1)
    pub total_borrowed: u64,
    /// Protocol reserves (safety buffer)
    pub total_reserves: u64,
    /// Base interest rate in bps (e.g., 500 = 5%)
    pub base_interest_rate: u16,
    /// Rate increase per utilization % (in bps)
    pub utilization_multiplier: u16,
    /// Max % of pool that can be borrowed (e.g., 8000 = 80%)
    pub max_utilization_rate: u16,
    /// % of interest going to reserves (e.g., 1000 = 10%)
    pub reserve_factor: u16,
    /// Last time interest was accrued
    pub last_update_timestamp: i64,
    /// OTUS price in USD (6 decimals, e.g., 1_000_000 = $1.00)
    /// Placeholder: Updated via governance/oracle based on treasury formula
    /// Formula: OTUS_price = (USDC + USD1 in treasury) / OTUS_supply
    pub otus_price_usd: u64,
    /// PDA bump
    pub bump: u8,
}

impl LendingConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // usdc_vault
        32 + // usd1_vault
        32 + // otus_vault
        8 + // total_deposited_usdc
        8 + // total_deposited_usd1
        8 + // total_borrowed
        8 + // total_reserves
        2 + // base_interest_rate
        2 + // utilization_multiplier
        2 + // max_utilization_rate
        2 + // reserve_factor
        8 + // last_update_timestamp
        8 + // otus_price_usd
        1; // bump

    pub const SEEDS_PREFIX: &'static [u8] = b"lending_config";

    /// Calculate total deposits (USDC + USD1)
    pub fn total_deposits(&self) -> u64 {
        self.total_deposited_usdc.saturating_add(self.total_deposited_usd1)
    }

    /// Calculate current borrow APR in bps
    pub fn calculate_borrow_rate(&self) -> u64 {
        let total_deposits = self.total_deposits();
        if total_deposits == 0 {
            return self.base_interest_rate as u64;
        }

        let utilization = (self.total_borrowed * 10000) / total_deposits;
        let borrow_rate_bps = self.base_interest_rate as u64
            + ((utilization * self.utilization_multiplier as u64) / 10000);

        borrow_rate_bps
    }

    /// Calculate current lender APR in bps
    pub fn calculate_lender_rate(&self) -> u64 {
        let total_deposits = self.total_deposits();
        if total_deposits == 0 {
            return 0;
        }

        let borrow_rate_bps = self.calculate_borrow_rate();
        let utilization = (self.total_borrowed * 10000) / total_deposits;

        let gross_rate = (borrow_rate_bps * utilization) / 10000;
        let net_rate = (gross_rate * (10000 - self.reserve_factor as u64)) / 10000;

        net_rate
    }

    /// Calculate total pool value (deposits + reserves)
    pub fn total_pool_value(&self) -> u64 {
        self.total_deposits().saturating_add(self.total_reserves)
    }

    /// Calculate available liquidity for withdrawal
    pub fn available_liquidity(&self) -> u64 {
        self.total_deposits().saturating_sub(self.total_borrowed)
    }
}
