use anchor_lang::prelude::*;

#[error_code]
pub enum BootstrapError {
    #[msg("Bootstrap period has not started yet")]
    BootstrapNotStarted,

    #[msg("Bootstrap period has ended")]
    BootstrapEnded,

    #[msg("Bootstrap is not active")]
    BootstrapNotActive,

    #[msg("Cannot withdraw after bootstrap end")]
    WithdrawalNotAllowed,

    #[msg("Insufficient deposit amount")]
    InsufficientDeposit,

    #[msg("Insufficient balance to withdraw")]
    InsufficientBalance,

    #[msg("OTUS rewards already claimed")]
    AlreadyClaimedOtus,

    #[msg("Scops NFT already minted")]
    AlreadyMintedScops,

    #[msg("Deposit amount too low for Scops NFT")]
    InsufficientTierForNft,

    #[msg("Bootstrap has not ended yet")]
    BootstrapNotEnded,

    #[msg("Invalid stablecoin type")]
    InvalidStablecoin,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Unauthorized")]
    Unauthorized,
}
