# Bootstrap Phase & Migration

The Solana Bootstrap phase introduces specific mechanics tailored to the Solana ecosystem ecosystem (SPL tokens, NFTs, high throughput).

## Key Differences from Roadmap

| Feature | Original Spec | Solana Implementation |
|---------|---------------|-----------------------|
| **Deposit Token** | USDC only | **USDC, USD1, USDT** |
| **Privacy** | None | **Privacy Cash (ZK)** |
| **Gas Fee** | SOL | **Kora Gasless (Stablecoins)** |
| **Tiers** | Generic | **Owl Species (Snowy -> Screech)** |

## Founding Lender NFTs (Owl Tiers)

Depositors are assigned an "Owl Tier" based on their deposit rank. This is tracked on-chain in `programs/bootstrap/src/lib.rs`.

### Tier Structure

| Rank | Tier Name | Species | Fee Discount |
|------|-----------|---------|--------------|
| **1-10** | Diamond | **Snowy Owl** | 50% |
| **11-50** | Platinum | **Great Horned Owl** | 40% |
| **51-100** | Gold | **Eagle Owl** | 30% |
| **101-500** | Silver | **Barn Owl** | 25% |
| **501+** | Bronze | **Screech Owl** | 10% |

### NFT Minting
- **Timing:** Minted at the end of the Bootstrap phase.
- **Metadata:** Dynamic, hosted on Arweave/IPFS.
- **Transferability:** Soulbound (initially) to prevent farming.

## Credit System (Solana)

Credits are the engagement layer. On Solana, we track these efficiently in PDA (Program Derived Address) accounts.

### Earning Rules
1. **Deposits:** 0.1 credit per Dollar/day.
2. **Early Bird:** 2x multiplier for first 7 days.
3. **Referrals:** 10% of referee earnings.

## Technical Flow

1. **User Connects:** Phantom/Solflare via generic wallet adapter.
2. **Deposit:** 
   - User selects USDC, USD1, or USDT.
   - **Kora** wraps transaction (pays gas).
   - **Privacy Cash** encrypts deposit (optional) or Standard Deposit.
3. **State Update:**
   - `BootstrapConfig` account updates `total_raised`.
   - `Contribution` account updates user's balance and rank.
4. **Leaderboard:**
   - Fetched from on-chain accounts (`getProgramAccounts`).
   - Sorted client-side (or via indexer) to display "Owl Tier".
