use anchor_lang::prelude::*;

#[error_code]
pub enum TradingError {
    #[msg("Trading is currently paused")]
    TradingPaused,

    #[msg("Invalid leverage amount")]
    InvalidLeverage,

    #[msg("Invalid FX pair")]
    InvalidPair,

    #[msg("Invalid direction (must be Long or Short)")]
    InvalidDirection,

    #[msg("Position is not open")]
    PositionNotOpen,

    #[msg("Position is already closed")]
    PositionAlreadyClosed,

    #[msg("Insufficient margin")]
    InsufficientMargin,

    #[msg("Pyth price is stale")]
    StalePriceData,

    #[msg("Pyth price confidence too wide")]
    PriceConfidenceTooWide,

    #[msg("Invalid deleverage tier")]
    InvalidDeleverageTier,

    #[msg("Deleverage tier already executed")]
    DeleverageTierAlreadyExecuted,

    #[msg("Margin health above trigger threshold")]
    MarginHealthAboveThreshold,

    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,

    #[msg("Arithmetic underflow")]
    ArithmeticUnderflow,

    #[msg("Division by zero")]
    DivisionByZero,

    #[msg("Invalid authority")]
    InvalidAuthority,

    #[msg("Position size exceeds maximum")]
    PositionSizeTooLarge,

    #[msg("Unauthorized: only position owner can close manually")]
    UnauthorizedClose,

    #[msg("Invalid oracle account")]
    InvalidOracleAccount,

    #[msg("Price cannot be negative")]
    NegativePrice,
}
