# OtusFX Smart Contracts - Status & TODO

## 📊 Current State

### ✅ What Exists (Compiled & Deployed)

**1. Trading Engine (`otusfx`)** - 382KB
- Program ID: `5ViKWmxzdXATK9b4x3bgr9szqsR2UhfokPJNLLQCKL76`
- Last Build: Jan 26, 2026
- **Instructions:**
  - ✅ `initialize` - Set up trading config
  - ✅ `open_position` - Open leveraged FX position
  - ✅ `trigger_deleverage` - Progressive auto-deleverage
  - ✅ `close_position` - Close position manually
  - ✅ `update_config` - Admin config updates

**2. Lending Pool (`lending_pool`)** - 460KB
- Program ID: `LendingPoo111111111111111111111111111111111`
- Last Build: Jan 24, 2026
- **Instructions:**
  - ✅ `initialize_lending` - Set up lending pool
  - ✅ `initialize_lender_position` - Create lender account
  - ✅ `deposit_liquidity` - Deposit USDC/USD1
  - ✅ `withdraw_liquidity` - Withdraw USDC/USD1
  - ✅ `borrow_for_leverage` - Trading program borrows
  - ✅ `repay_borrow` - Trading program repays
  - ✅ `accrue_pool_interest` - Interest accumulation (crank)
  - ✅ `claim_otus_rewards` - Claim OTUS interest
  - ✅ `update_lending_config` - Admin updates

**3. Bootstrap Pool (`bootstrap_pool`)** - 430KB
- Program ID: `BootStrap11111111111111111111111111111111111`
- Last Build: Jan 24, 2026
- **Instructions:**
  - ✅ `initialize_bootstrap` - Set up bootstrap phase
  - ✅ `initialize_user_deposit` - Create user account
  - ✅ `deposit_usdc` - Deposit USDC/USD1
  - ✅ `withdraw_usdc` - Withdraw before end
  - ✅ `claim_otus_rewards` - Claim OTUS after TGE
  - ✅ `mint_scops_nft` - Mint tier-based NFT badge
  - ✅ `close_bootstrap` - End bootstrap phase

---

## ❌ What's Missing (Critical for Hackathon Claims)

### 1. **Privacy Integrations - ZERO Implementation**

**Current State:**
```rust
// From programs/otusfx/src/state/position.rs
/// MVP: Stored in plaintext (V2: encrypted via Arcium)
```

**What You Claim vs Reality:**

| Feature | Claimed in Docs | Actual Status |
|---------|----------------|---------------|
| Privacy Cash deposits | ✅ "Integrated" | ❌ No contract integration |
| ShadowWire transfers | ✅ "Hidden amounts" | ❌ No contract integration |
| Arcium MPC encryption | ⚠️ "Roadmap" | ❌ Not even started |
| Encrypted positions | ✅ "Via Arcium" | ❌ Stored in plaintext |
| Private liquidations | ✅ "Hidden triggers" | ❌ Public thresholds |

**Impact:** Hackathon judges will see UI says "Encrypted via Arcium" but blockchain shows plaintext data. This is misleading.

---

### 2. **Privacy Cash Integration (High Priority)**

**What's Needed:**
```rust
// Add to lending_pool/src/instructions/deposit_liquidity.rs

pub fn deposit_liquidity_private(
    ctx: Context<DepositLiquidityPrivate>,
    stablecoin_type: StablecoinType,
    amount: u64,
    commitment: [u8; 32],        // Privacy Cash commitment
    nullifier_hash: [u8; 32],    // Privacy Cash nullifier
    proof: Vec<u8>,              // zk-SNARK proof
) -> Result<()> {
    // 1. Verify zk-SNARK proof (via CPI to Privacy Cash program)
    // 2. Check nullifier hasn't been used
    // 3. Store commitment
    // 4. Accept deposit without linking to user wallet
}
```

**Complexity:** Medium (3-5 hours with Privacy Cash SDK)
**Benefit:** Actually deliver on "deposit unlinkability" claim

---

### 3. **ShadowWire Integration (Medium Priority)**

**What's Needed:**
```rust
// Add to lending_pool/src/instructions/withdraw_liquidity.rs

pub fn withdraw_liquidity_private(
    ctx: Context<WithdrawLiquidityPrivate>,
    stablecoin_type: StablecoinType,
    amount: u64,
    bulletproof: Vec<u8>,        // ShadowWire Bulletproof
    range_proof: Vec<u8>,        // Proves amount is valid
) -> Result<()> {
    // 1. Verify Bulletproof (via CPI to ShadowWire program)
    // 2. Verify range proof (amount > 0, amount <= balance)
    // 3. Transfer hidden amount
}
```

**Complexity:** Medium (3-5 hours with ShadowWire SDK)
**Benefit:** Actually deliver on "hidden amounts" claim

---

### 4. **Arcium MPC Encryption (Low Priority for Hackathon)**

**What's Needed:**
- Store encrypted position data instead of plaintext
- Use Arcium Confidential VM for liquidation triggers
- Encrypted PnL calculations

**Complexity:** High (10-20 hours, requires deep Arcium integration)
**Recommendation:** Keep as "Roadmap" for hackathon, don't claim it works

---

### 5. **Missing Instructions**

**Trading Engine:**
- ❌ `liquidate_position` - No liquidation keeper instruction
- ❌ `update_price_oracle` - Manual price update (for testing)
- ❌ `emergency_withdraw` - Circuit breaker for security

**Lending Pool:**
- ❌ `liquidate_bad_debt` - Handle underwater positions
- ❌ `emergency_pause` - Security pause mechanism

**Bootstrap Pool:**
- ❌ `vote_for_pair` - FX pair voting (claimed but not implemented)
- ❌ `update_otus_rate` - Dynamic reward adjustment

---

### 6. **Testing Gaps**

**Current Test Status:**
```bash
$ ls tests/
# No test files found!
```

**What's Missing:**
- ❌ Unit tests for all instructions
- ❌ Integration tests for cross-program calls (lending ↔ trading)
- ❌ Fuzz tests for edge cases
- ❌ Security tests (reentrancy, overflow, etc.)

**Recommendation:** At minimum, add smoke tests before hackathon

---

## 🔴 Critical Issues (Must Fix)

### Issue 1: Misleading Privacy Claims

**Problem:** UI shows "Encrypted via Arcium" but data is plaintext on-chain.

**Fix Options:**
1. **Honest (Recommended):** Change UI to "Privacy Mode (Coming Soon)"
2. **Implement:** Actually integrate Privacy Cash for deposits (3-5 hours)
3. **Mock:** Add encrypted storage fields but populate with zeros (hacky, not recommended)

---

### Issue 2: Programs Won't Build

**Problem:** When trying to rebuild programs, Rust toolchain errors occur:
```
error: cannot find type `SourceFile` in crate `proc_macro`
```

**Root Cause:**
- Anchor CLI 0.30.1 vs @coral-xyz/anchor ^0.31.0 mismatch
- Rust nightly toolchain compatibility

**Fix:**
```bash
# Option 1: Downgrade frontend Anchor dependency
cd web
npm install @coral-xyz/anchor@0.30.1

# Option 2: Upgrade Anchor CLI
cargo install --git https://github.com/coral-xyz/anchor --tag v0.31.0 anchor-cli

# Option 3: Use pre-built .so files (current approach)
# Just deploy existing binaries, don't rebuild
```

**Recommendation:** Option 3 for hackathon (use existing builds)

---

### Issue 3: No Devnet Deployment Scripts

**Problem:** No easy way to initialize programs on devnet.

**What's Needed:**
```bash
# Create: scripts/deploy-devnet.sh

#!/bin/bash
# Deploy all programs to devnet

anchor deploy --provider.cluster devnet

# Initialize trading engine
anchor run initialize-trading

# Initialize lending pool
anchor run initialize-lending

# Initialize bootstrap pool
anchor run initialize-bootstrap

# Fund OTUS vaults
anchor run fund-vaults
```

---

### Issue 4: Frontend ↔ Contract Mismatch

**Problem:** Frontend hooks call instructions that might not match deployed contracts.

**Check Needed:**
```bash
# Verify program IDs match
grep "declare_id" programs/*/src/lib.rs
grep "PROGRAM_ID\|programId" hooks/*.ts

# Verify instruction signatures match
# Compare Anchor IDL with frontend calls
```

---

## 🟡 Nice to Have (Post-Hackathon)

### 1. Dynamic Leverage Calculation
Currently hardcoded. Should calculate based on:
- Pool liquidity depth
- Current utilization
- OTUS holdings bonus

### 2. Oracle Price Validation
- Add staleness checks for Pyth prices
- Add confidence interval validation
- Add fallback oracle (Switchboard)

### 3. Fee Distribution
- Protocol fees go to treasury
- Keeper fees for liquidators
- Referral fees

### 4. Governance
- OTUS token voting
- Parameter adjustments
- Emergency pause

### 5. Copy Trading Signals
- On-chain signal registry
- Privacy-preserving follower matching
- Performance-based reputation

---

## ⚡ Hackathon Priority (Next 48 Hours)

### Day 1 (8 hours)

**Goal: Make privacy claims honest OR implement one real integration**

#### Option A: Honest Approach (Low Risk, 2 hours)
1. ✅ Change UI labels from "Encrypted" to "Privacy-Ready"
2. ✅ Add banner: "Privacy features launching with mainnet"
3. ✅ Update HACKATHON.md to clarify current vs roadmap
4. ✅ Focus pitch on architecture, not current state

#### Option B: Real Integration (Medium Risk, 8 hours)
1. ✅ Integrate Privacy Cash for deposits (3-5 hours)
   - Add CPI to Privacy Cash program
   - Verify zk-SNARKs on-chain
   - Store commitments/nullifiers
2. ✅ Test end-to-end flow (1 hour)
3. ✅ Update frontend to use new instruction (2 hours)
4. ✅ Record demo showing real privacy (2 hours)

**Recommendation:** Option A for time safety, Option B if confident

---

### Day 2 (4 hours)

**Goal: Add basic tests & deployment scripts**

1. ✅ Add smoke tests (2 hours)
   - Initialize all programs
   - Deposit → Withdraw flow
   - Open → Close position flow
2. ✅ Create deployment script (1 hour)
3. ✅ Deploy to devnet and verify (1 hour)

---

## 🎯 Realistic Hackathon Deliverables

### What Judges Will Accept:

**Tier 1: Honest Demo (Safe)**
- ✅ Working smart contracts (already deployed)
- ✅ Clear about what's implemented vs roadmap
- ✅ Architecture diagrams showing future privacy
- ✅ "This is the foundation, privacy launches Q2"

**Tier 2: Partial Integration (Competitive)**
- ✅ Privacy Cash deposit flow working
- ✅ One real privacy transaction on devnet
- ✅ Demo video showing actual zk-proof verification
- ✅ "We integrated 1 of 3 privacy layers in 6 days"

**Tier 3: Full Integration (Risky, Not Recommended)**
- ❌ Privacy Cash + ShadowWire + Arcium all working
- ❌ Too much scope for 6 days
- ❌ High risk of bugs/incomplete features

---

## 📋 Smart Contract Checklist

### Pre-Hackathon (Must Do)
- [x] All programs compile
- [x] All programs deployed to devnet
- [ ] Privacy claims aligned with reality
- [ ] Basic smoke tests added
- [ ] Deployment scripts created
- [ ] Program IDs match frontend

### Hackathon Submission (Nice to Have)
- [ ] Privacy Cash integration working
- [ ] End-to-end deposit flow tested
- [ ] Demo video shows real transaction
- [ ] Documentation explains architecture

### Post-Hackathon (Roadmap)
- [ ] ShadowWire integration
- [ ] Arcium MPC integration
- [ ] Full test coverage
- [ ] Security audit
- [ ] Mainnet deployment

---

## 🚨 Decision Point

**You have 6 days until hackathon. Choose your path:**

### Path A: Polish What Exists (Recommended)
**Time: 2-4 hours**
- Fix privacy claims to be honest
- Add deployment scripts
- Add basic tests
- Focus on pitch & demo

**Result:** Solid foundation, honest about roadmap

---

### Path B: Integrate Privacy Cash
**Time: 8-10 hours**
- Implement deposit_liquidity_private instruction
- Add CPI to Privacy Cash program
- Test on devnet
- Update frontend

**Result:** One real privacy feature working

---

### Path C: Do Nothing (Not Recommended)
**Time: 0 hours**
- Keep existing contracts as-is
- Hope judges don't check on-chain data
- Risk being called out for misleading claims

**Result:** Could backfire if judges verify

---

## 🎬 My Recommendation

**Do Path A (Honest Approach) + Minimal Privacy Cash Integration**

**Rationale:**
1. You already have strong pitch materials (9.5/10)
2. Your architecture is solid
3. UI looks professional
4. Better to under-promise and over-deliver
5. Privacy Cash integration could be buggy under pressure

**Spend time on:**
- ✅ Polish pitch & demo video (highest ROI)
- ✅ Fix privacy labels to be accurate
- ✅ Add deployment scripts for judges to test
- ✅ Create clear "Current vs Roadmap" section in docs

**Skip:**
- ❌ Complex privacy integrations (high risk)
- ❌ Extensive testing (time sink)
- ❌ New features (scope creep)

---

**Last Updated:** January 27, 2026
**Hackathon Deadline:** February 1, 2026 (6 days)
**Current Smart Contract Grade:** B+ (functional but not private)
