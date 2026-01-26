# Lending Pool Program Design

## Overview
The Lending Pool provides USDC liquidity that enables leveraged FX trading. Lenders deposit USDC and earn yield from:
- Borrowing interest paid by leveraged traders
- Protocol fees from trading volume
- OTUS token rewards (after TGE)

This pool works in tandem with the Trading Engine to provide leverage for FX positions.

## State Accounts

### 1. LendingConfig (PDA)
```rust
pub struct LendingConfig {
    pub authority: Pubkey,              // Protocol authority
    pub usdc_vault: Pubkey,             // Main USDC liquidity pool
    pub total_deposits: u64,            // Total USDC deposited by lenders
    pub total_borrowed: u64,            // Total USDC currently borrowed for leverage
    pub total_reserves: u64,            // Protocol reserves (safety buffer)
    pub base_interest_rate: u16,        // Base APR in bps (e.g., 500 = 5%)
    pub utilization_multiplier: u16,    // Rate increase per utilization % (in bps)
    pub max_utilization_rate: u16,      // Max % of pool that can be borrowed (e.g., 8000 = 80%)
    pub reserve_factor: u16,            // % of interest going to reserves (e.g., 1000 = 10%)
    pub otus_rewards_per_second: u64,   // OTUS distributed per second to lenders
    pub last_update_timestamp: i64,     // Last time interest was accrued
    pub total_lp_tokens: u64,           // Total LP tokens issued (shares)
    pub bump: u8,
}
```
**Seeds**: `["lending_config"]`

### 2. LenderPosition (PDA per user)
```rust
pub struct LenderPosition {
    pub lender: Pubkey,                 // Lender's wallet
    pub lp_tokens: u64,                 // LP token balance (shares of pool)
    pub otus_rewards_claimed: u64,      // Total OTUS claimed
    pub otus_rewards_debt: u64,         // Reward debt for accounting
    pub deposit_timestamp: i64,         // First deposit time
    pub last_action_timestamp: i64,     // Last deposit/withdrawal
    pub total_deposited: u64,           // Cumulative USDC deposited
    pub total_withdrawn: u64,           // Cumulative USDC withdrawn
    pub bump: u8,
}
```
**Seeds**: `["lender_position", lender.key()]`

### 3. BorrowPosition (PDA per trading position)
```rust
pub struct BorrowPosition {
    pub trading_position: Pubkey,       // Link to Trading Engine position
    pub borrowed_amount: u64,           // USDC borrowed for leverage
    pub interest_accrued: u64,          // Interest accumulated (in USDC)
    pub borrow_timestamp: i64,          // When borrowed
    pub last_interest_update: i64,      // Last interest calculation
    pub bump: u8,
}
```
**Seeds**: `["borrow_position", trading_position.key()]`

## Interest Rate Model

### Utilization-Based Dynamic Rate
```rust
fn calculate_borrow_rate(config: &LendingConfig) -> u64 {
    let utilization = (config.total_borrowed * 10000) / config.total_deposits;

    // Base rate + (utilization% * multiplier)
    // Example: 5% base + (60% utilization * 0.1% per %) = 11% APR
    let borrow_rate_bps = config.base_interest_rate
        + ((utilization * config.utilization_multiplier) / 10000);

    borrow_rate_bps as u64
}

fn calculate_lender_rate(borrow_rate_bps: u64, config: &LendingConfig) -> u64 {
    // Lenders get borrow_rate * utilization * (1 - reserve_factor)
    let utilization = (config.total_borrowed * 10000) / config.total_deposits;

    let gross_rate = (borrow_rate_bps * utilization) / 10000;
    let net_rate = (gross_rate * (10000 - config.reserve_factor)) / 10000;

    net_rate
}
```

**Example Rates**:
| Utilization | Borrow APR | Lender APR (after 10% reserve) |
|-------------|------------|-------------------------------|
| 20%         | 7%         | 1.26%                         |
| 50%         | 10%        | 4.5%                          |
| 80%         | 13%        | 9.36%                         |

## LP Token Accounting (Shares Model)

```rust
fn calculate_lp_tokens_to_mint(deposit_amount: u64, config: &LendingConfig) -> u64 {
    if config.total_lp_tokens == 0 {
        // First depositor gets 1:1 LP tokens
        deposit_amount
    } else {
        // LP tokens = (deposit_amount * total_lp_tokens) / total_pool_value
        let pool_value = config.total_deposits + config.total_reserves;
        (deposit_amount * config.total_lp_tokens) / pool_value
    }
}

fn calculate_withdrawal_amount(lp_tokens: u64, config: &LendingConfig) -> u64 {
    // USDC = (lp_tokens * total_pool_value) / total_lp_tokens
    let pool_value = config.total_deposits + config.total_reserves;
    (lp_tokens * pool_value) / config.total_lp_tokens
}
```

## Instructions

### 1. `initialize_lending`
**Authority**: Protocol admin
**Accounts**:
- `authority` (signer)
- `lending_config` (init, PDA)
- `usdc_vault` (init, token account)
- `usdc_mint`
- `system_program`, `token_program`, `rent`

**Args**:
- `base_interest_rate: u16` (bps)
- `utilization_multiplier: u16` (bps)
- `max_utilization_rate: u16` (bps)
- `reserve_factor: u16` (bps)

**Logic**:
- Initialize lending pool with config
- Set initial rates and limits

### 2. `deposit_liquidity`
**Authority**: Lender
**Accounts**:
- `lender` (signer)
- `lending_config` (mut)
- `lender_position` (init_if_needed, PDA)
- `lender_usdc_account` (mut)
- `usdc_vault` (mut)
- `token_program`, `system_program`

**Args**:
- `amount: u64` (USDC)

**Logic**:
- Accrue interest first (update pool value)
- Calculate LP tokens to mint
- Transfer USDC to vault
- Update lender_position with LP tokens
- Update lending_config total_deposits and total_lp_tokens
- Update OTUS reward debt for this lender

**OTUS Reward Accounting**:
```rust
// When depositing:
lender.otus_rewards_debt = (lender.lp_tokens * pool.accumulated_otus_per_share) / 1e12;
```

### 3. `withdraw_liquidity`
**Authority**: Lender
**Accounts**:
- `lender` (signer)
- `lending_config` (mut)
- `lender_position` (mut)
- `lender_usdc_account` (mut)
- `usdc_vault` (mut)
- `token_program`

**Args**:
- `lp_tokens: u64` (amount of LP tokens to burn)

**Logic**:
- Accrue interest first
- Calculate USDC to return based on LP tokens
- Verify sufficient available liquidity (total_deposits - total_borrowed)
- Transfer USDC to lender
- Burn LP tokens
- Update lender_position and lending_config
- Claim pending OTUS rewards

**Liquidity Check**:
```rust
let available = config.total_deposits - config.total_borrowed;
let requested_usdc = calculate_withdrawal_amount(lp_tokens, config);
require!(requested_usdc <= available, InsufficientLiquidity);
```

### 4. `borrow_for_leverage` (CPI from Trading Engine)
**Authority**: Trading Engine program (CPI)
**Accounts**:
- `trading_position` (from Trading Engine)
- `lending_config` (mut)
- `borrow_position` (init, PDA)
- `usdc_vault` (mut)
- `trading_engine_usdc_account` (mut)
- `token_program`, `system_program`

**Args**:
- `borrow_amount: u64`

**Logic**:
- Verify caller is Trading Engine program
- Verify utilization won't exceed max_utilization_rate
- Transfer USDC from vault to Trading Engine
- Create BorrowPosition linked to trading position
- Update lending_config.total_borrowed

**Utilization Check**:
```rust
let new_total_borrowed = config.total_borrowed + borrow_amount;
let new_utilization = (new_total_borrowed * 10000) / config.total_deposits;
require!(new_utilization <= config.max_utilization_rate, MaxUtilizationExceeded);
```

### 5. `repay_borrow` (CPI from Trading Engine)
**Authority**: Trading Engine program (CPI)
**Accounts**:
- `trading_position`
- `lending_config` (mut)
- `borrow_position` (mut, close)
- `usdc_vault` (mut)
- `trading_engine_usdc_account` (mut)
- `token_program`

**Args**:
- `repay_amount: u64` (includes principal + interest)

**Logic**:
- Calculate accrued interest
- Verify repay_amount >= borrowed_amount + interest_accrued
- Transfer USDC back to vault
- Split repayment:
  - Principal → total_deposits
  - Interest * (1 - reserve_factor) → total_deposits (distributed to lenders)
  - Interest * reserve_factor → total_reserves
- Close BorrowPosition account
- Update lending_config.total_borrowed

**Interest Calculation**:
```rust
fn accrue_interest(borrow: &mut BorrowPosition, config: &LendingConfig, clock: &Clock) -> u64 {
    let time_elapsed = clock.unix_timestamp - borrow.last_interest_update;
    let borrow_rate_bps = calculate_borrow_rate(config);

    // APR to per-second rate: (rate / 10000) / (365.25 * 86400)
    let rate_per_second = (borrow_rate_bps as u128 * borrow.borrowed_amount as u128)
        / (10000 * 31_557_600); // seconds in a year

    let interest = (rate_per_second * time_elapsed as u128) as u64;
    borrow.interest_accrued += interest;
    borrow.last_interest_update = clock.unix_timestamp;

    interest
}
```

### 6. `accrue_pool_interest`
**Authority**: Anyone (permissionless crank)
**Accounts**:
- `lending_config` (mut)
- `clock` (sysvar)

**Logic**:
- Calculate total interest accrued across all borrows (estimated)
- Update pool value (total_deposits increases from interest)
- Update last_update_timestamp
- Update OTUS rewards accumulator

**Note**: This is called periodically or before deposits/withdrawals to keep pool state fresh

### 7. `claim_otus_rewards`
**Authority**: Lender
**Accounts**:
- `lender` (signer)
- `lending_config` (mut)
- `lender_position` (mut)
- `otus_mint`
- `otus_vault` (protocol OTUS reserve)
- `lender_otus_account` (mut)
- `token_program`

**Logic**:
- Calculate pending OTUS rewards using accumulated_per_share model
- Transfer OTUS to lender
- Update otus_rewards_claimed and otus_rewards_debt

**Reward Calculation**:
```rust
fn calculate_pending_otus(lender: &LenderPosition, pool: &LendingConfig) -> u64 {
    let accumulated = (lender.lp_tokens * pool.accumulated_otus_per_share) / 1e12;
    accumulated - lender.otus_rewards_debt - lender.otus_rewards_claimed
}
```

### 8. `update_lending_config`
**Authority**: Protocol admin
**Accounts**:
- `authority` (signer)
- `lending_config` (mut)

**Args**:
- `base_interest_rate: Option<u16>`
- `utilization_multiplier: Option<u16>`
- `max_utilization_rate: Option<u16>`
- `reserve_factor: Option<u16>`
- `otus_rewards_per_second: Option<u64>`

**Logic**:
- Update lending parameters
- Emit event with new config

## Integration with Trading Engine

The Trading Engine will CPI into the Lending Pool for leverage:

```rust
// In Trading Engine's open_position instruction:
pub fn open_position(
    ctx: Context<OpenPosition>,
    collateral: u64,
    leverage: u8, // 1-25x
    // ... other params
) -> Result<()> {
    // Calculate borrow amount needed
    let position_size = collateral * leverage as u64;
    let borrow_amount = position_size - collateral;

    // CPI to Lending Pool to borrow
    let cpi_accounts = BorrowForLeverage {
        trading_position: ctx.accounts.position.to_account_info(),
        lending_config: ctx.accounts.lending_config.to_account_info(),
        borrow_position: ctx.accounts.borrow_position.to_account_info(),
        usdc_vault: ctx.accounts.lending_usdc_vault.to_account_info(),
        trading_engine_usdc_account: ctx.accounts.trading_usdc_account.to_account_info(),
        token_program: ctx.accounts.token_program.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(ctx.accounts.lending_program.to_account_info(), cpi_accounts);
    lending_pool::cpi::borrow_for_leverage(cpi_ctx, borrow_amount)?;

    // Continue with position opening...
}
```

## Security Considerations

1. **Utilization Limits**: Max 80% of pool can be borrowed to ensure withdrawal liquidity
2. **Interest Accrual**: Must accrue before deposits/withdrawals to prevent gaming
3. **CPI Authorization**: Only Trading Engine program can borrow/repay
4. **Liquidation Integration**: Failed positions must repay borrows immediately
5. **Reserve Buffer**: 10% of interest builds safety reserves
6. **Rate Limits**: Prevent flash loan attacks with minimum borrow duration

## Events

```rust
#[event]
pub struct DepositEvent {
    pub lender: Pubkey,
    pub amount: u64,
    pub lp_tokens_minted: u64,
}

#[event]
pub struct WithdrawEvent {
    pub lender: Pubkey,
    pub amount: u64,
    pub lp_tokens_burned: u64,
}

#[event]
pub struct BorrowEvent {
    pub trading_position: Pubkey,
    pub amount: u64,
    pub borrow_rate: u64,
}

#[event]
pub struct RepayEvent {
    pub trading_position: Pubkey,
    pub principal: u64,
    pub interest: u64,
}
```

## Client Integration

### Deposit Flow
```typescript
const tx = await lendingProgram.methods
  .depositLiquidity(new BN(10000_000_000)) // 10,000 USDC
  .accounts({
    lender: lenderPublicKey,
    lendingConfig: lendingConfigPda,
    lenderPosition: lenderPositionPda,
    lenderUsdcAccount: lenderUsdcAta,
    usdcVault: usdcVaultPda,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Check APR
```typescript
const config = await lendingProgram.account.lendingConfig.fetch(lendingConfigPda);
const borrowRate = calculateBorrowRate(config);
const lenderRate = calculateLenderRate(borrowRate, config);
console.log(`Current Lender APR: ${lenderRate / 100}%`);
```

## Next Steps

1. Implement program with Anchor 0.30.1
2. Create CPI interface for Trading Engine integration
3. Write interest accrual tests with time manipulation
4. Simulate high utilization scenarios
5. Deploy to devnet and integrate with Trading Engine
