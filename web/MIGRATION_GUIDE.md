# Frontend Migration Guide
## OtusFX Smart Contract Updates - January 2026

This guide documents the changes made to align the frontend with the redesigned smart contracts (lending pool and bootstrap pool) and adds USD1 stablecoin support.

---

## 📋 Summary of Changes

### ✅ Completed
1. **Generated IDLs**: Created `lending_pool.json` IDL from built program
2. **Rewrote lending hook**: Complete rewrite to use OTUS-as-interest model (no more LP tokens)
3. **Added USD1 support**: Updated bootstrap, lending, and trading hooks to support dual stablecoins
4. **Updated lending UI**: Added OTUS interest display, stablecoin selector, and claim button

### ⚠️ Needs Manual Updates
- Bootstrap UI (`/web/app/app/bootstrap/page.tsx`) needs stablecoin selector and real deposit calls
- Trading UI (`/web/app/app/trade/page.tsx`) needs collateral type selector
- Token mints need to be updated for devnet/testnet

---

## 🗂️ Files Changed

### IDLs
| File | Status | Description |
|------|--------|-------------|
| `/web/idl/lending_pool.json` | ✅ **NEW** | Generated from redesigned lending-pool program |
| `/web/idl/bootstrap.json` | ⚠️ Outdated | Uses old format, needs regeneration when deploying |
| `/web/idl/trading_engine.json` | ⚠️ Outdated | Needs regeneration with USD1 support |

### Hooks
| File | Status | Changes |
|------|--------|---------|
| `/web/hooks/useLendingPool.ts` | ✅ **REWRITTEN** | Complete rewrite:<br>• Uses `lending_pool` IDL<br>• Tracks OTUS interest instead of LP tokens<br>• Supports USDC and USD1<br>• New methods: `initializeLenderPosition`, `depositLiquidity`, `withdrawLiquidity`, `claimOtusRewards` |
| `/web/hooks/useBootstrap.ts` | ✅ **UPDATED** | • Added USD1 support<br>• Fixed account names (`user_deposit` instead of `contribution`)<br>• Added `initializeUserDeposit()` method<br>• Added `mintScopsNFT()` and `claimOTUS()` methods<br>• Reads tier from on-chain enum |
| `/web/hooks/useTrading.ts` | ✅ **UPDATED** | • Added `collateralType` parameter to `openPosition()`<br>• Supports both USDC and USD1 vaults<br>• Maps collateral type to enum for program call |

### UI Pages
| File | Status | Changes |
|------|--------|---------|
| `/web/app/app/lend/page.tsx` | ✅ **UPDATED** | • Added stablecoin selector (USDC/USD1)<br>• Shows OTUS interest earned<br>• Added "Claim OTUS" button<br>• Shows pool stats for both stablecoins<br>• Handles initialization requirement |
| `/web/app/app/bootstrap/page.tsx` | ⚠️ **NEEDS UPDATE** | • Currently calls `showComingSoon()` instead of real deposit<br>• Needs stablecoin selector (see demo version for reference)<br>• Needs to call `initializeUserDeposit()` before first deposit |
| `/web/app/app/trade/page.tsx` | ⚠️ **NEEDS UPDATE** | • Missing collateral type selector<br>• Needs to pass `collateralType` to `openPosition()` |

---

## 🔧 Backend-Frontend Alignment

### Lending Pool

#### ✅ What's Now Aligned
- **Account Structure**: Uses `LenderPosition` with direct principal tracking
- **Interest Model**: OTUS tokens instead of LP token appreciation
- **Dual Stablecoins**: Both USDC and USD1 supported
- **Separate Initialization**: Requires `initialize_lender_position` before first deposit

#### 📊 New Data Model

**Old Model (LP Tokens)**:
```typescript
{
  totalLpTokens: number,
  userShares: number,
  sharePrice: number,  // Increases as interest accrues
  userDeposit: number  // = userShares * sharePrice
}
```

**New Model (OTUS Interest)**:
```typescript
{
  // Principal (what user deposited)
  usdcDeposited: number,
  usd1Deposited: number,
  totalUsdValue: number,

  // Interest (in OTUS tokens)
  otusInterestEarned: number,
  otusInterestClaimed: number,

  // Pool pricing
  otusPrice: number  // OTUS price in USD
}
```

**Interest Calculation**:
```
interest_usd = principal * APR * time / year
otus_earned = interest_usd / otus_price
```

#### 🔄 Hook Method Changes

| Old Method | New Method | Changes |
|------------|------------|---------|
| `deposit(amount)` | `depositLiquidity(amount, stablecoinType)` | • Added stablecoin type parameter<br>• Requires position initialization first |
| `withdraw(amount)` | `withdrawLiquidity(amount, stablecoinType)` | • Added stablecoin type parameter<br>• Automatically claims OTUS interest |
| N/A | `initializeLenderPosition()` | **NEW** - Must be called before first deposit |
| N/A | `claimOtusRewards()` | **NEW** - Claim OTUS without withdrawing principal |

---

### Bootstrap Pool

#### ✅ What's Now Aligned
- **Account Names**: Uses `UserDeposit` instead of `Contribution`
- **Dual Stablecoins**: USDC + USD1 support
- **On-chain Tiers**: Reads `ScopsTier` enum from contract
- **On-chain OTUS Allocation**: Uses `otus_allocation` field

#### 🔄 Hook Method Changes

| Old Method | New Method | Changes |
|------------|------------|---------|
| `depositPublic(amount)` | `depositPublic(amount, stablecoinType)` | • Added stablecoin type parameter (defaults to USDC)<br>• Requires user deposit initialization first |
| N/A | `initializeUserDeposit()` | **NEW** - Must be called before first deposit |
| N/A | `mintScopsNFT()` | **NEW** - Mint tier-based NFT (TODO: add Metaplex accounts) |
| N/A | `claimOTUS()` | **NEW** - Claim allocated OTUS tokens |

#### 📊 Account Field Changes

```typescript
// Old (contribution)
{
  amount: BN,
  timestamp: i64
}

// New (user_deposit)
{
  usdcDeposited: u64,
  usd1Deposited: u64,
  totalUsdValue: u64,
  otusAllocation: u64,
  scopsTier: ScopsTier,  // Enum: None | Screech | Barn | Snowy | GreatHorned
  hasClaimedOtus: bool,
  hasMintedScops: bool
}
```

---

### Trading Engine

#### ✅ What's Now Aligned
- **Dual Vaults**: Both `usdcVault` and `usd1Vault` in config
- **Collateral Type**: Added `collateral_type` field to positions

#### 🔄 Hook Method Changes

| Old Method | New Method | Changes |
|------------|------------|---------|
| `openPosition(pair, side, margin, leverage, isPrivate)` | `openPosition(pair, side, margin, leverage, isPrivate, collateralType)` | • Added `collateralType` parameter (defaults to USDC)<br>• Passes collateral enum to program |

---

## 🚀 Deployment Checklist

### Before Deploying Programs

1. **Update Program IDs**:
   ```bash
   # After deploying to devnet
   solana program deploy target/deploy/lending_pool.so
   # Update IDL address field with deployed program ID
   ```

2. **Update Token Mints** in hooks:
   ```typescript
   // In all hooks (useBootstrap, useLending, useTrading)
   const USDC_MINT = new PublicKey("Devnet_USDC_Mint_Here");
   const USD1_MINT = new PublicKey("Devnet_USD1_Mint_Here");
   const OTUS_MINT = new PublicKey("Devnet_OTUS_Mint_Here");
   ```

3. **Generate Fresh IDLs**:
   ```bash
   # Use anchor CLI to generate IDLs after successful build
   anchor build
   cp target/idl/*.json web/idl/
   ```

### After Deploying Programs

4. **Initialize Programs** (one-time setup):
   ```typescript
   // 1. Initialize lending pool
   await program.methods.initializeLending(
     200,    // base_interest_rate (2%)
     500,    // utilization_multiplier (5%)
     8000,   // max_utilization_rate (80%)
     1000,   // reserve_factor (10%)
     120000  // initial_otus_price_usd ($0.12)
   ).rpc();

   // 2. Initialize bootstrap pool
   await program.methods.initialize(
     endTime,
     2  // 2x credits multiplier
   ).rpc();
   ```

5. **Test User Flows**:
   - [ ] Bootstrap: Initialize → Deposit → Check credits → Mint NFT → Claim OTUS
   - [ ] Lending: Initialize → Deposit → Wait → Withdraw (with OTUS) → Claim remaining OTUS
   - [ ] Trading: Open position (USDC) → Close → Open position (USD1) → Close

---

## 🐛 Known Issues & TODOs

### Critical
- [ ] **OTUS Mint Address**: Placeholder in hooks, needs real mint after token creation
- [ ] **NFT Minting**: `mintScopsNFT()` missing Metaplex accounts

### High Priority
- [ ] **Bootstrap UI**: Port stablecoin selector and real deposit logic from demo version
- [ ] **Trading UI**: Add collateral type selector dropdown
- [ ] **Error Handling**: Add better error messages for initialization requirements

### Medium Priority
- [ ] **Wallet Balance Fetching**: Currently returns 0, needs real SPL token balance queries
- [ ] **Loading States**: Add skeleton loaders while fetching on-chain data
- [ ] **Transaction Confirmations**: Add proper confirmation UI with explorerscan links

### Low Priority
- [ ] **Rate Limiting**: Add debouncing to deposit/withdraw inputs
- [ ] **Mobile Responsiveness**: Test all forms on mobile devices
- [ ] **Dark Mode**: Ensure all new components respect theme

---

## 📖 Usage Examples

### Lending Pool Flow

```typescript
import { useLendingPool } from "@/hooks/useLendingPool";

function LendingPage() {
  const {
    poolStats,           // Global pool statistics
    lenderStats,         // User's position data
    initializeLenderPosition,
    depositLiquidity,          // Public deposit
    withdrawLiquidity,         // Public withdraw
    depositLiquidityPrivate,   // Private deposit (via Privacy Cash)
    withdrawLiquidityPrivate,  // Private withdraw (via Privacy Cash)
    claimOtusRewards
  } = useLendingPool();

  // First time user
  const handleFirstDeposit = async () => {
    await initializeLenderPosition();  // One-time setup
    await depositLiquidity(1000, "USDC");
  };

  // Subsequent deposits
  const handleDeposit = async () => {
    await depositLiquidity(500, "USD1");
  };

  // Withdraw with OTUS interest
  const handleWithdraw = async () => {
    // Withdraws principal + claims all OTUS interest
    await withdrawLiquidity(500, "USDC");
  };

  // Claim OTUS without withdrawing
  const handleClaim = async () => {
    await claimOtusRewards();
  };

  // PRIVACY MODE: Deposit via Privacy Cash (default, recommended)
  const handlePrivateDeposit = async () => {
    // Breaks wallet linkage via Privacy Cash pool
    await depositLiquidityPrivate(1000, "USDC");
  };

  // PRIVACY MODE: Withdraw via Privacy Cash
  const handlePrivateWithdraw = async () => {
    // Hides destination via Privacy Cash pool
    await withdrawLiquidityPrivate(500, "USDC");
  };

  return (
    <div>
      <div>Your Deposit: ${lenderStats.totalUsdValue}</div>
      <div>OTUS Earned: {lenderStats.otusInterestEarned} OTUS</div>
      <div>Pool APY: {poolStats.lenderAPY}%</div>
      <div>OTUS Price: ${poolStats.otusPrice}</div>

      {/* Privacy Toggle */}
      <label>
        <input type="checkbox" checked={isPrivate} onChange={...} />
        Private Mode (via Privacy Cash)
      </label>
    </div>
  );
}
```

### Bootstrap Pool Flow

```typescript
import { useBootstrap } from "@/hooks/useBootstrap";

function BootstrapPage() {
  const {
    totalRaised,
    totalRaisedUsdc,
    totalRaisedUsd1,
    userContribution,
    credits,
    tier,
    initializeUserDeposit,
    depositPublic,
    mintScopsNFT,
    claimOTUS
  } = useBootstrap();

  // First time user
  const handleFirstDeposit = async () => {
    await initializeUserDeposit();
    await depositPublic(1000, "USDC");
  };

  // Deposit USD1
  const handleDepositUSD1 = async () => {
    await depositPublic(500, "USD1");
  };

  // Mint NFT (when eligible)
  const handleMintNFT = async () => {
    if (tier) {
      await mintScopsNFT();
    }
  };

  // Claim OTUS (after bootstrap ends)
  const handleClaimOTUS = async () => {
    await claimOTUS();
  };

  return (
    <div>
      <div>Total Raised: ${totalRaised} ({totalRaisedUsdc} USDC + {totalRaisedUsd1} USD1)</div>
      <div>Your Deposit: ${userContribution}</div>
      <div>Credits: {credits}</div>
      <div>Tier: {tier || "None"}</div>
    </div>
  );
}
```

### Trading with Collateral Choice

```typescript
import { useTrading } from "@/hooks/useTrading";

function TradePage() {
  const { openPosition } = useTrading();

  // Open position with USDC collateral
  const handleTradeUSDC = async () => {
    await openPosition(
      "EUR/USD",
      "long",
      1000,      // margin
      10,        // leverage
      false,     // isPrivate
      "USDC"     // collateralType
    );
  };

  // Open position with USD1 collateral
  const handleTradeUSD1 = async () => {
    await openPosition(
      "GBP/USD",
      "short",
      500,
      15,
      true,
      "USD1"
    );
  };
}
```

---

## 🔐 Privacy Feature Integration

### Overview
The lending pool now supports **Privacy Mode** via Privacy Cash SDK, which breaks the link between your wallet and your lending position.

### How It Works

**Public Mode** (Direct Deposit):
```
User Wallet → Lending Pool Vault
✅ Lower gas fees
❌ Wallet linkage visible on-chain
❌ Deposit amount public
```

**Private Mode** (via Privacy Cash):
```
User Wallet → Privacy Cash Pool → Lending Pool Vault
✅ Wallet linkage hidden (ZK proof)
✅ Deposit amount encrypted
✅ Balance queries private
❌ Slightly higher gas (~10%)
```

### Implementation Details

#### Two-Step Flow (Client-Side)

**Deposit**:
1. User calls `depositLiquidityPrivate(amount, stablecoinType)`
2. Hook calls `/api/privacy/deposit` (deposits to Privacy Cash pool)
3. Privacy Cash returns commitment hash
4. Hook calls standard `deposit_liquidity` instruction
5. Result: Funds in lending pool, but source wallet hidden

**Withdraw**:
1. User calls `withdrawLiquidityPrivate(amount, stablecoinType)`
2. Hook calls standard `withdraw_liquidity` instruction
3. Hook calls `/api/privacy/withdraw` (routes through Privacy Cash)
4. Result: Funds withdrawn, destination hidden

#### UI Integration

The lending page (`/web/app/app/lend/page.tsx`) includes:
- **Privacy Toggle**: ON by default (purple gradient button)
- **Visual Indicators**: Lock icon on button, purple border when active
- **Privacy Benefits Info**: Explains what's protected
- **Button Styling**: Purple gradient for private, emerald for public

### Privacy Benefits

| What's Protected | Public Mode | Private Mode |
|------------------|-------------|--------------|
| Deposit source wallet | ❌ Visible | ✅ Hidden |
| Deposit amount | ❌ Public | ✅ Encrypted |
| Balance queries | ❌ Anyone | ✅ Only you |
| Withdrawal destination | ❌ Visible | ✅ Hidden |
| TVL contribution | ❌ Exact | ✅ Approximate range |

### User Experience

**Default Behavior**: Privacy Mode is **ON** by default
- Most users want privacy protection
- Toggle is visible and easy to disable
- Clear visual feedback (purple vs emerald)

**Success Messages**:
- Public: "✅ Deposited 1000 USDC!"
- Private: "🔒 Privately deposited 1000 USDC! Your deposit source is hidden via Privacy Cash."

### Technical Notes

1. **Demo Mode Fallback**: If `DEMO_WALLET_PRIVATE_KEY` env var is not set, Privacy Cash API returns mock responses
2. **Gas Costs**: Privacy deposits cost ~0.01 SOL extra for ZK proof verification
3. **Error Handling**: If Privacy Cash step fails, user gets clear error (funds not lost)
4. **Compatibility**: Works with both USDC and USD1 stablecoins

---

## 🔗 Related Documentation

- **Smart Contract Design**: See `/programs/lending-pool/LENDING_DESIGN.md` and `/programs/bootstrap-pool/BOOTSTRAP_DESIGN.md`
- **Program Summary**: See `/PROGRAMS_SUMMARY.md` for architecture overview
- **Build Instructions**: See `/BUILD.md` for toolchain setup

---

## 📞 Support

If you encounter issues:
1. Check console logs for detailed error messages
2. Verify program IDs in IDL files match deployed programs
3. Ensure token mints are correct for your network
4. Check if initialization was called before first deposit

For questions or issues, create an issue in the repository or contact the development team.

---

**Last Updated**: January 25, 2026
**Compatible Anchor Version**: 0.30.1
**Network**: Devnet (update mints for mainnet)
