# OtusFX Trading Engine - Build Instructions

## Architecture Overview

The OtusFX trading system consists of **two separate Solana programs**:

1. **`otusfx`** - The main trading engine (this directory)
   - Built with Anchor **0.30.1** and Rust **stable** (or nightly)
   - Handles positions, deleverage, settlements
   - Reads prices from the oracle program (no direct Pyth SDK dependency)

2. **`pyth-oracle`** - The Pyth price oracle cache (../pyth-oracle)
   - Built with Anchor **0.30.1** and Rust **stable** (or nightly)
   - Handles Pyth price validation and caching
   - The trading engine reads prices from this program

**Important Toolchain Note**:
We use Anchor 0.30.1 (not 0.31.0) because Solana's `cargo-build-sbf` tool (used for compiling on-chain programs) bundles rustc 1.84.1, which doesn't support edition2024. Anchor 0.31.0 has dependencies requiring edition2024 (`blake3 v1.8.3` from `solana-program v2.3.0`), causing build failures. Anchor 0.30.1 uses older Solana dependencies compatible with the BPF toolchain.

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│   PYTH ORACLE PROGRAM          OTUSFX TRADING ENGINE            │
│   (../pyth-oracle)             (this directory)                 │
│                                                                  │
│   ┌─────────────────┐         ┌─────────────────┐              │
│   │ update_price()  │         │ open_position() │              │
│   │ - Pyth SDK      │ ◄────── │ - Read cached   │              │
│   │ - Validate      │  Read   │   price         │              │
│   │ - Cache price   │         │ - No Pyth SDK   │              │
│   └─────────────────┘         └─────────────────┘              │
│                                                                  │
│   Build: Anchor 0.30.1        Build: Anchor 0.30.1            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Build Output

After successful build:

**Trading Engine:**
- `target/deploy/otusfx.so` - The compiled trading program
- `target/idl/otusfx.json` - The IDL for client integration

**Oracle Program:**
- `../pyth-oracle/target/deploy/pyth_oracle.so` - The compiled oracle program
- `../pyth-oracle/target/idl/pyth_oracle.json` - The IDL for CPI

## Building Locally (Recommended)

Build both programs with Anchor 0.30.1:

```bash
# Build trading engine
cd /path/to/otusfx
cargo clean
anchor build

# Build oracle program
cd ../pyth-oracle
cargo clean
anchor build
```

### Local Prerequisites
- Rust stable (1.81.0+) or nightly - both work with Anchor 0.30.1
- Solana CLI 1.18.x
- Anchor CLI **0.30.1** (not 0.31.0 - see toolchain note above)

## Deployment

After building, deploy both programs:

```bash
# Configure Solana CLI
solana config set --url devnet

# Deploy oracle program first
cd ../pyth-oracle
anchor deploy --provider.cluster devnet

# Deploy trading engine
cd ../otusfx
anchor deploy --provider.cluster devnet
```

**Important**: Deploy the oracle program before the trading engine. The trading engine reads prices from the oracle program, so it must be deployed and have initialized price caches.

### Initialize Price Caches

After deploying the oracle program, initialize caches for each FX pair:

```bash
# Example: Initialize EUR/USD cache
anchor run init-price-cache -- eurusd <pyth-feed-id>
```

## Program Features

### Trading Engine (otusfx)
- **Progressive Auto-Deleverage**: 4-tier system (50%, 35%, 25%, 15% margin health)
- **Permissionless Keepers**: 0.05% reward for triggering deleverage
- **OTUS Settlement**: PnL settled in OTUS to keep USDC earning yield
- **Leverage Range**: 2x-20x for institutional-grade risk management

### Oracle Program (pyth-oracle)
- **Pyth Price Validation**: Real-time FX prices with staleness checks
- **Price Caching**: Efficient on-chain price storage
- **Confidence Checks**: Validates price confidence intervals
- **11 FX Pairs**: EUR/USD, GBP/USD, USD/JPY, and more

## IDL Integration

Use the generated IDLs for frontend/client integration:

```typescript
import { Program } from "@coral-xyz/anchor";
import tradingIdl from "./target/idl/otusfx.json";
import oracleIdl from "../pyth-oracle/target/idl/pyth_oracle.json";

const tradingProgram = new Program(tradingIdl, provider);
const oracleProgram = new Program(oracleIdl, provider);
```

## Troubleshooting

### "edition2024 not supported" or "blake3 compile error"
This error occurs if you're using Anchor 0.31.0. Downgrade to Anchor 0.30.1:
```bash
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked
```

Also ensure your program Cargo.toml uses:
```toml
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"  # if using SPL
```

### "cargo-build-sbf" version mismatch
The Solana BPF toolchain uses rustc 1.84.1. This is expected and works fine with Anchor 0.30.1. Don't try to override it.

### Price cache not found
Make sure the oracle program is deployed and price caches are initialized before opening positions.

### Leftover error to be solved
error[E0599]: no method named `source_file` found for struct `proc_macro2::Span` in the current scope
   --> /Users/tobiasd/.cargo/registry/src/index.crates.io-1949cf8c6b5b557f/anchor-syn-0.30.1/src/idl/defined.rs:499:66
    |
499 | ...call_site().source_file().path();
    |                ^^^^^^^^^^^ method not found in `proc_macro2::Span`

For more information about this error, try `rustc --explain E0599`.