# OtusFX Toolchain Notes

## The Edition2024 Problem and Solution

### Problem Summary
We encountered build failures when trying to compile Solana programs with Anchor 0.31.0.

### Root Cause
```
Anchor 0.31.0
└── solana-program v2.3.0
    └── blake3 v1.8.3
        └── constant_time_eq v0.4.2
            └── Requires Rust edition2024
```

**The Critical Issue**: Solana's `cargo-build-sbf` tool (which compiles on-chain programs) bundles its own Rust toolchain:
- rustc 1.84.1
- Cargo 1.84.0

This bundled toolchain **does not support edition2024** (feature stabilized in Rust 1.86+).

Even if you have Rust nightly locally, `anchor build` internally calls `cargo-build-sbf`, which uses its own bundled toolchain.

### Solution
**Downgrade to Anchor 0.30.1**

Anchor 0.30.1 uses:
```
Anchor 0.30.1
└── solana-program v1.18.x
    └── blake3 v1.5.x (no edition2024 requirement)
```

This version is fully compatible with Solana's cargo-build-sbf rustc 1.84.1.

### Implementation

**1. Install Anchor CLI 0.30.1 with Rust stable:**
```bash
rustup default stable
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked
```

**2. Update program dependencies:**
```toml
# programs/*/Cargo.toml
[dependencies]
anchor-lang = "0.30.1"
anchor-spl = "0.30.1"
```

**3. Build both programs:**
```bash
cd otusfx && anchor build
cd ../pyth-oracle && anchor build
```

### Why Not Use Nightly/Docker?
- **Doesn't help**: cargo-build-sbf ignores your local Rust version
- **Docker same issue**: cargo-build-sbf in Docker still uses bundled rustc 1.84.1
- **Adds complexity**: No benefit for this specific problem

### Future: When Can We Use Anchor 0.31.0?
Wait for Solana to update platform-tools to rustc 1.86+ with edition2024 support. Track:
- Solana platform-tools releases
- solana-cargo-build-sbf version updates

Check current version:
```bash
cargo-build-sbf --version
# Output: platform-tools vX.XX, rustc X.XX.X
```

When it shows rustc 1.86+, we can upgrade to Anchor 0.31.0+.

### Key Toolchain Commands
```bash
# Check cargo-build-sbf version (the one that matters)
cargo-build-sbf --version

# Check your local Rust (not used for BPF builds)
rustc --version

# Check Anchor CLI
anchor --version

# Verify build toolchain
anchor build --verbose  # Shows cargo-build-sbf being invoked
```

### Pyth SDK Compatibility
The Pyth SDK (`pyth-solana-receiver-sdk v0.3.0`) works fine with Anchor 0.30.1. The edition2024 requirement was coming from Anchor's dependencies, not Pyth's.

### Summary
**The lesson**: Solana on-chain program compilation is constrained by `cargo-build-sbf`'s bundled Rust toolchain, not your local Rust installation. Always check the platform-tools version first when encountering edition/feature errors.
