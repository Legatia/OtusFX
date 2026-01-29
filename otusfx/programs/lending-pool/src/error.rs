use anchor_lang::prelude::*;

#[error_code]
pub enum LendingError {
    #[msg("Insufficient liquidity in pool")]
    InsufficientLiquidity,

    #[msg("Insufficient balance to withdraw")]
    InsufficientBalance,

    #[msg("Max utilization rate exceeded")]
    MaxUtilizationExceeded,

    #[msg("Insufficient repayment amount")]
    InsufficientRepayment,

    #[msg("No OTUS rewards to claim")]
    NoOtusRewards,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,

    #[msg("Invalid borrow amount")]
    InvalidBorrowAmount,

    #[msg("Invalid repay amount")]
    InvalidRepayAmount,

    #[msg("Unauthorized - Only Trading Engine can borrow/repay")]
    UnauthorizedCaller,

    #[msg("Unauthorized - Only authority can update config")]
    Unauthorized,

    #[msg("Invalid interest rate parameter")]
    InvalidInterestRate,

    #[msg("Invalid reserve factor")]
    InvalidReserveFactor,

    #[msg("Invalid stablecoin type")]
    InvalidStablecoin,

    #[msg("Invalid commitment - must be non-zero")]
    InvalidCommitment,

    #[msg("Invalid zero-knowledge proof")]
    InvalidProof,

    #[msg("Zero-knowledge proof verification failed")]
    ProofVerificationFailed,

    #[msg("Minimum deposit amount not met")]
    MinimumDepositNotMet,

    #[msg("Invalid amount - must be greater than zero")]
    InvalidAmount,
}
