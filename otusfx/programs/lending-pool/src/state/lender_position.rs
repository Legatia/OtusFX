use anchor_lang::prelude::*;

/// Lender's position in the lending pool
#[account]
pub struct LenderPosition {
    /// Lender's wallet
    pub lender: Pubkey,
    /// USDC currently deposited (principal)
    pub usdc_deposited: u64,
    /// USD1 currently deposited (principal)
    pub usd1_deposited: u64,
    /// Total USD value (USDC + USD1)
    pub total_usd_value: u64,
    /// OTUS interest earned (not claimed yet)
    pub otus_interest_earned: u64,
    /// OTUS interest claimed
    pub otus_interest_claimed: u64,
    /// First deposit timestamp
    pub deposit_timestamp: i64,
    /// Last interest calculation timestamp
    pub last_interest_update: i64,
    /// Cumulative USDC deposited
    pub cumulative_usdc_deposited: u64,
    /// Cumulative USD1 deposited
    pub cumulative_usd1_deposited: u64,
    /// Cumulative USDC withdrawn
    pub cumulative_usdc_withdrawn: u64,
    /// Cumulative USD1 withdrawn
    pub cumulative_usd1_withdrawn: u64,
    /// Privacy mode enabled
    pub is_private: bool,
    /// Number of privacy commitments created
    pub privacy_commitment_count: u32,
    /// PDA bump
    pub bump: u8,
}

impl LenderPosition {
    pub const LEN: usize = 8 + // discriminator
        32 + // lender
        8 + // usdc_deposited
        8 + // usd1_deposited
        8 + // total_usd_value
        8 + // otus_interest_earned
        8 + // otus_interest_claimed
        8 + // deposit_timestamp
        8 + // last_interest_update
        8 + // cumulative_usdc_deposited
        8 + // cumulative_usd1_deposited
        8 + // cumulative_usdc_withdrawn
        8 + // cumulative_usd1_withdrawn
        1 + // is_private
        4 + // privacy_commitment_count
        1; // bump

    pub const SEEDS_PREFIX: &'static [u8] = b"lender_position";

    /// Calculate interest earned in USD since last update
    /// Formula: interest_usd = principal * APR * time_elapsed / SECONDS_PER_YEAR
    pub fn calculate_interest_usd(&self, current_apr_bps: u64, current_timestamp: i64) -> u64 {
        if self.total_usd_value == 0 {
            return 0;
        }

        let time_elapsed = (current_timestamp - self.last_interest_update) as u64;
        const SECONDS_PER_YEAR: u64 = 365 * 24 * 60 * 60;

        // Interest = principal * APR * time / year
        // APR is in basis points (1/10000), so divide by 10000
        let interest_usd = (self.total_usd_value as u128 * current_apr_bps as u128 * time_elapsed as u128)
            / (10000 * SECONDS_PER_YEAR) as u128;

        interest_usd as u64
    }

    /// Convert USD interest to OTUS tokens
    /// Formula: otus_amount = interest_usd / otus_price_usd
    pub fn convert_interest_to_otus(&self, interest_usd: u64, otus_price_usd: u64) -> u64 {
        if otus_price_usd == 0 {
            return 0;
        }

        // Both are 6 decimals, so result is also 6 decimals
        (interest_usd as u128 * 1_000_000 / otus_price_usd as u128) as u64
    }

    /// Accrue interest as OTUS tokens
    pub fn accrue_interest(&mut self, apr_bps: u64, otus_price_usd: u64, current_timestamp: i64) {
        let interest_usd = self.calculate_interest_usd(apr_bps, current_timestamp);
        if interest_usd > 0 {
            let otus_earned = self.convert_interest_to_otus(interest_usd, otus_price_usd);
            self.otus_interest_earned = self.otus_interest_earned.saturating_add(otus_earned);
        }
        self.last_interest_update = current_timestamp;
    }

    /// Update position after deposit
    pub fn update_from_deposit(&mut self, usdc_amount: u64, usd1_amount: u64, current_timestamp: i64) {
        if self.total_usd_value == 0 {
            self.deposit_timestamp = current_timestamp;
            self.last_interest_update = current_timestamp;
        }

        self.usdc_deposited = self.usdc_deposited.saturating_add(usdc_amount);
        self.usd1_deposited = self.usd1_deposited.saturating_add(usd1_amount);
        self.total_usd_value = self.usdc_deposited.saturating_add(self.usd1_deposited);

        self.cumulative_usdc_deposited = self.cumulative_usdc_deposited.saturating_add(usdc_amount);
        self.cumulative_usd1_deposited = self.cumulative_usd1_deposited.saturating_add(usd1_amount);
    }

    /// Update position after withdrawal
    pub fn update_from_withdrawal(&mut self, usdc_amount: u64, usd1_amount: u64) {
        self.usdc_deposited = self.usdc_deposited.saturating_sub(usdc_amount);
        self.usd1_deposited = self.usd1_deposited.saturating_sub(usd1_amount);
        self.total_usd_value = self.usdc_deposited.saturating_add(self.usd1_deposited);

        self.cumulative_usdc_withdrawn = self.cumulative_usdc_withdrawn.saturating_add(usdc_amount);
        self.cumulative_usd1_withdrawn = self.cumulative_usd1_withdrawn.saturating_add(usd1_amount);
    }
}
