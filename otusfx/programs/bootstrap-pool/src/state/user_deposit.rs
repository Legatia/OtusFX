use anchor_lang::prelude::*;

/// Scops NFT tier based on deposit amount
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum ScopsTier {
    None,       // 0 USDC
    Bronze,     // 100-999 USDC
    Silver,     // 1,000-9,999 USDC
    Gold,       // 10,000-99,999 USDC
    Platinum,   // 100,000+ USDC
}

impl ScopsTier {
    /// Calculate tier from deposit amount (in 6 decimal USDC)
    pub fn from_amount(amount: u64) -> Self {
        match amount {
            0..=99_999_999 => ScopsTier::None,              // < 100 USDC
            100_000_000..=999_999_999 => ScopsTier::Bronze, // 100-999 USDC
            1_000_000_000..=9_999_999_999 => ScopsTier::Silver, // 1k-9,999 USDC
            10_000_000_000..=99_999_999_999 => ScopsTier::Gold, // 10k-99,999 USDC
            _ => ScopsTier::Platinum,                       // 100k+ USDC
        }
    }

    /// Get tier name for NFT metadata
    pub fn name(&self) -> &str {
        match self {
            ScopsTier::None => "None",
            ScopsTier::Bronze => "Bronze",
            ScopsTier::Silver => "Silver",
            ScopsTier::Gold => "Gold",
            ScopsTier::Platinum => "Platinum",
        }
    }
}

/// User's deposit in the bootstrap pool
#[account]
pub struct UserDeposit {
    /// Depositor's wallet
    pub user: Pubkey,
    /// USDC deposited (6 decimals)
    pub usdc_deposited: u64,
    /// USD1 deposited (6 decimals)
    pub usd1_deposited: u64,
    /// Total USD value (USDC + USD1)
    pub total_usd_value: u64,
    /// Timestamp of first deposit
    pub deposit_timestamp: i64,
    /// OTUS tokens allocated based on total USD value
    pub otus_allocation: u64,
    /// Scops NFT tier
    pub scops_tier: ScopsTier,
    /// Has claimed OTUS after TGE
    pub has_claimed_otus: bool,
    /// Has minted Scops NFT
    pub has_minted_scops: bool,
    /// PDA bump
    pub bump: u8,
}

impl UserDeposit {
    pub const LEN: usize = 8 + // discriminator
        32 + // user
        8 + // usdc_deposited
        8 + // usd1_deposited
        8 + // total_usd_value
        8 + // deposit_timestamp
        8 + // otus_allocation
        1 + // scops_tier (enum)
        1 + // has_claimed_otus
        1 + // has_minted_scops
        1; // bump

    pub const SEEDS_PREFIX: &'static [u8] = b"user_deposit";

    /// Update allocation and tier based on new deposit
    pub fn update_from_deposit(&mut self, usdc_amount: u64, usd1_amount: u64, otus_rate: u64, clock: &Clock) {
        if self.total_usd_value == 0 {
            self.deposit_timestamp = clock.unix_timestamp;
        }

        self.usdc_deposited += usdc_amount;
        self.usd1_deposited += usd1_amount;
        self.total_usd_value = self.usdc_deposited + self.usd1_deposited;
        self.otus_allocation = (self.total_usd_value * otus_rate) / 1_000_000; // 6 decimals
        self.scops_tier = ScopsTier::from_amount(self.total_usd_value);
    }

    /// Update allocation and tier after withdrawal
    pub fn update_from_withdrawal(&mut self, usdc_amount: u64, usd1_amount: u64, otus_rate: u64) {
        self.usdc_deposited = self.usdc_deposited.saturating_sub(usdc_amount);
        self.usd1_deposited = self.usd1_deposited.saturating_sub(usd1_amount);
        self.total_usd_value = self.usdc_deposited + self.usd1_deposited;
        self.otus_allocation = (self.total_usd_value * otus_rate) / 1_000_000;
        self.scops_tier = ScopsTier::from_amount(self.total_usd_value);
    }
}
