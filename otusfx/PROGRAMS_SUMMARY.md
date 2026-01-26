# OtusFX Smart Contracts Summary

This document summarizes the Solana smart contracts implemented for the OtusFX protocol.

## Program Architecture

```
OtusFX Ecosystem
├── Trading Engine (otusfx)
│   ├── Leveraged FX positions (1-25x)
│   ├── Pyth oracle integration (Pull model)
│   ├── Liquidation mechanics
│   └── Private positions via Arcium (planned)
│
├── Bootstrap Pool (bootstrap-pool)
│   ├── Genesis depositor rewards
│   ├── Tiered NFT badges (Scops)
│   └── FX pair governance voting
│
└── Lending Pool (lending-pool)
    ├── USDC liquidity provision
    ├── Interest-bearing deposits
    ├── Leveraged trading liquidity
    └── OTUS token rewards
```

## 1. Trading Engine (`otusfx`)

**Program ID**: `5ViKWmxzdXATK9b4x3bgr9szqsR2UhfokPJNLLQCKL76`

### Features
- **Leveraged FX Trading**: Open long/short positions with 1-25x leverage
- **Pyth Oracle Integration**: Uses Pyth Pull Oracle model for real-time FX prices
- **11 FX Pairs**: EUR/USD, GBP/USD, USD/JPY, AUD/USD, USD/CAD, USD/CHF, NZD/USD, EUR/GBP, EUR/JPY, GBP/JPY, AUD/JPY
- **Liquidation Engine**: Automatic position liquidation when margin drops below threshold
- **Cross-Program Borrowing**: CPIs to Lending Pool for leverage

### Key Instructions
- `initialize_config`: Set up protocol configuration
- `open_position`: Open leveraged FX position
- `close_position`: Close position and realize PnL
- `trigger_deleverage`: Automatically reduce leverage on losing positions
- `liquidate_position`: Liquidate underwater positions

### Pyth Pull Oracle Integration
Client workflow:
1. Fetch price update from Hermes API: `https://hermes.pyth.network/api/latest_price_feeds?ids[]={feed_id}`
2. Post price update to Pyth Solana Receiver in transaction
3. Program reads verified price directly from Pyth feed account

Feed IDs are mapped in `utils/pyth.rs` via `get_pyth_feed_id()`.

## 2. Bootstrap Pool (`bootstrap-pool`)

**Program ID**: `BootStrap11111111111111111111111111111111111`

### Features
- **Genesis Deposits**: Early USDC deposits earn OTUS token allocations
- **Tiered NFT Badges (Scops)**: Soul-bound NFTs based on deposit amount
  - **Bronze**: 100-999 USDC
  - **Silver**: 1,000-9,999 USDC
  - **Gold**: 10,000-99,999 USDC
  - **Platinum**: 100,000+ USDC
- **Governance Voting**: Weighted voting on FX pair additions (voting power = USDC deposited)
- **Withdrawal Window**: Can withdraw before bootstrap_end, funds locked after

### Key Instructions
- `initialize_bootstrap`: Set up bootstrap pool with start/end times and OTUS rate
- `deposit_usdc`: Deposit USDC to earn OTUS allocation
- `withdraw_usdc`: Withdraw USDC (only before bootstrap_end)
- `claim_otus_rewards`: Claim OTUS tokens after TGE
- `mint_scops_nft`: Mint tiered NFT badge
- `propose_fx_pair`: Propose new FX pair for voting
- `vote_on_pair`: Vote for/against FX pair proposal
- `finalize_pair_voting`: Finalize voting after period ends
- `close_bootstrap`: Close bootstrap (admin only, after bootstrap_end)

### OTUS Allocation Formula
```rust
otus_allocation = (usdc_deposited * otus_distribution_rate) / 1_000_000
```

Example: If rate is 100 and user deposits 1,000 USDC → 100,000 OTUS allocated

## 3. Lending Pool (`lending-pool`)

**Program ID**: `LendingPoo111111111111111111111111111111111`

### Features
- **USDC Liquidity Provision**: Lenders deposit USDC and receive LP tokens (shares)
- **Dynamic Interest Rates**: Utilization-based APR model
- **OTUS Rewards**: Lenders earn OTUS tokens proportional to LP share
- **Leveraged Trading Integration**: Provides liquidity for Trading Engine borrows
- **Protocol Reserves**: Safety buffer from interest revenue

### Interest Rate Model

**Borrow APR** = Base Rate + (Utilization% × Multiplier)
- Base Rate: 5% (500 bps)
- Utilization Multiplier: 0.1% per 1% utilization

**Lender APR** = Borrow APR × Utilization × (1 - Reserve Factor)
- Reserve Factor: 10% (1000 bps)

**Example Rates**:
| Utilization | Borrow APR | Lender APR |
|-------------|------------|------------|
| 20%         | 7%         | 1.26%      |
| 50%         | 10%        | 4.5%       |
| 80%         | 13%        | 9.36%      |

### LP Token Accounting (Shares Model)

**Deposit**:
```rust
lp_tokens = (deposit_amount * total_lp_tokens) / total_pool_value
```

**Withdrawal**:
```rust
usdc_amount = (lp_tokens * total_pool_value) / total_lp_tokens
```

Pool value appreciates as interest accrues, increasing LP token redemption value.

### Key Instructions
- `initialize_lending`: Set up lending pool with rate parameters
- `deposit_liquidity`: Deposit USDC, receive LP tokens
- `withdraw_liquidity`: Burn LP tokens, receive USDC
- `borrow_for_leverage`: CPI from Trading Engine to borrow USDC
- `repay_borrow`: CPI from Trading Engine to repay with interest
- `accrue_pool_interest`: Update pool state (permissionless crank)
- `claim_otus_rewards`: Claim accumulated OTUS rewards
- `update_lending_config`: Update rate parameters (admin only)

### Trading Engine Integration

When a trader opens a leveraged position:
1. Trader deposits collateral in Trading Engine
2. Trading Engine CPIs to `borrow_for_leverage` for additional capital
3. Borrow position is created and linked to trading position
4. When position closes, Trading Engine CPIs to `repay_borrow`
5. Interest is split: 90% to lenders, 10% to reserves

## Program Dependencies

All programs use:
- **Anchor Framework**: v0.30.1
- **SPL Token**: v4.0.0
- **Solana**: v3.0.13 (cargo-build-sbf with rustc 1.80.0)

### Dependency Pins (for stable build)
```toml
blake3 = "1.5.5"
jobserver = "0.1.31"
getrandom = "0.2"
toml_edit = "0.21.1"
indexmap = "2.2.6"
proc-macro2 = "1.0.84"
spl-discriminator = "0.2.2"
```

## Build Instructions

```bash
# Build all programs
anchor build

# Build specific program
cd programs/bootstrap-pool && cargo build-sbf

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test
```

## Testing Strategy

### Unit Tests (LiteSVM/Mollusk)
- Test individual instructions
- Test state transitions
- Test error conditions

### Integration Tests (Surfpool)
- Test cross-program interactions
- Test Trading Engine ↔ Lending Pool CPI
- Test oracle price updates

### Devnet Testing
- Test with real Pyth price feeds
- Test with real users and transactions
- Stress test liquidation mechanics

## Security Considerations

### Trading Engine
- ✅ Oracle staleness checks (60s max)
- ✅ Price confidence bounds
- ✅ Leverage limits (1-25x)
- ✅ Liquidation thresholds
- ⚠️ Privacy features (Arcium) - planned

### Bootstrap Pool
- ✅ Minimum deposit (10 USDC) - anti-spam
- ✅ Time-based withdrawal restrictions
- ✅ Soul-bound Scops NFTs
- ✅ Voting power = deposited USDC

### Lending Pool
- ✅ Max utilization rate (80%) - ensures withdrawal liquidity
- ✅ Interest accrual before deposits/withdrawals
- ✅ CPI authorization checks for borrows/repays
- ✅ Reserve buffer (10% of interest)

## Next Steps

1. **Complete Build**: Finish anchor build to generate IDLs
2. **Generate TypeScript SDKs**: Use Codama/Kinobi for client SDKs
3. **Write Tests**: Unit tests with LiteSVM, integration tests with Surfpool
4. **Deploy to Devnet**: Test with real Pyth oracles
5. **Frontend Integration**: Connect to React UI with @solana/client
6. **OTUS Token Program**: Create Token-2022 program with extensions
7. **Arcium Privacy Integration**: Implement encrypted position data
8. **Vaults Program**: Copy trading functionality
9. **Credits Program**: Soul-bound engagement tokens
10. **Security Audit**: Professional audit before mainnet

## Documentation

- [BUILD.md](./BUILD.md) - Build and deployment instructions
- [BOOTSTRAP_DESIGN.md](./BOOTSTRAP_DESIGN.md) - Bootstrap Pool detailed design
- [LENDING_DESIGN.md](./LENDING_DESIGN.md) - Lending Pool detailed design
- [TOOLCHAIN_NOTES.md](./TOOLCHAIN_NOTES.md) - Rust toolchain and dependency notes

## Program Addresses (Devnet)

After deployment, update these addresses:

- **Trading Engine**: `TBD`
- **Bootstrap Pool**: `TBD`
- **Lending Pool**: `TBD`

## Client Examples

### Deposit to Bootstrap Pool

```typescript
import { Program, AnchorProvider } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";

const program = new Program(bootstrapIdl, provider);

const [bootstrapConfig] = PublicKey.findProgramAddressSync(
  [Buffer.from("bootstrap_config")],
  program.programId
);

const [userDeposit] = PublicKey.findProgramAddressSync(
  [Buffer.from("user_deposit"), userPublicKey.toBuffer()],
  program.programId
);

await program.methods
  .depositUsdc(new BN(1000_000_000)) // 1,000 USDC
  .accounts({
    user: userPublicKey,
    bootstrapConfig,
    userDeposit,
    userUsdcAccount: userUsdcAta,
    usdcVault,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Open Leveraged Position

```typescript
// 1. Fetch Pyth price update
const hermes = "https://hermes.pyth.network";
const feedId = "0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b"; // EUR/USD
const priceUpdate = await fetch(`${hermes}/api/latest_price_feeds?ids[]=${feedId}`);

// 2. Post price update to Pyth (instruction 0 in transaction)
const pythUpdateIx = await pythReceiver.methods
  .postPriceUpdate(priceUpdate.data)
  .accounts({...})
  .instruction();

// 3. Open position (instruction 1 in transaction)
const openPositionIx = await tradingEngine.methods
  .openPosition({
    collateral: new BN(5000_000_000), // 5,000 USDC collateral
    leverage: 10,                      // 10x leverage
    direction: { long: {} },           // Long EUR/USD
    pair: { eurusd: {} },
  })
  .accounts({
    trader: traderPublicKey,
    config,
    position,
    pythPriceFeed,                     // Pyth feed account
    traderUsdcAccount,
    vault,
    // Lending Pool accounts for borrow
    lendingConfig,
    borrowPosition,
    lendingVault,
    // ...
  })
  .instruction();

// 4. Send transaction with both instructions
const tx = new Transaction().add(pythUpdateIx, openPositionIx);
await provider.sendAndConfirm(tx);
```

---

**Built with**: Solana, Anchor, Pyth Network, Metaplex
**License**: MIT
**Version**: 1.0.0
**Last Updated**: January 2026
