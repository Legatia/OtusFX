use anchor_lang::prelude::*;

/// Bootstrap pool configuration
#[account]
pub struct BootstrapConfig {
    /// Protocol authority
    pub authority: Pubkey,
    /// USDC vault for deposits
    pub usdc_vault: Pubkey,
    /// USD1 vault for deposits
    pub usd1_vault: Pubkey,
    /// OTUS token vault (for reward distribution)
    pub otus_vault: Pubkey,
    /// Total USDC deposited (6 decimals)
    pub total_deposited_usdc: u64,
    /// Total USD1 deposited (6 decimals)
    pub total_deposited_usd1: u64,
    /// Bootstrap start time (Unix timestamp)
    pub bootstrap_start: i64,
    /// Bootstrap end time (Unix timestamp)
    pub bootstrap_end: i64,
    /// Can accept deposits
    pub is_active: bool,
    /// OTUS tokens per 1 USD (e.g., 100 = 100 OTUS per USD)
    pub otus_distribution_rate: u64,
    /// Total number of depositors
    pub total_participants: u32,
    /// PDA bump
    pub bump: u8,
}

impl BootstrapConfig {
    pub const LEN: usize = 8 + // discriminator
        32 + // authority
        32 + // usdc_vault
        32 + // usd1_vault
        32 + // otus_vault
        8 + // total_deposited_usdc
        8 + // total_deposited_usd1
        8 + // bootstrap_start
        8 + // bootstrap_end
        1 + // is_active
        8 + // otus_distribution_rate
        4 + // total_participants
        1; // bump

    pub const SEEDS_PREFIX: &'static [u8] = b"bootstrap_config";
}
