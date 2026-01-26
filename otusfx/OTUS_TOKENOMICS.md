# OTUS Token - Tokenomics & Implementation

## Overview

**Token Name**: Otus Token
**Symbol**: OTUS
**Standard**: SPL Token (Classic)
**Total Supply**: 1,000,000,000 OTUS (Fixed)
**Decimals**: 6
**Network**: Devnet (for testing)

---

## Token Allocation

| Category | Allocation | Amount (OTUS) | Purpose |
|----------|-----------|---------------|---------|
| **Bootstrap Rewards** | 30% | 300,000,000 | Genesis depositor rewards distributed over 6 months |
| **Lending Interest** | 30% | 300,000,000 | Lender interest payments in OTUS |
| **Trading Incentives** | 15% | 150,000,000 | Volume rewards, copy trading incentives |
| **Team Reserve** | 15% | 150,000,000 | Development, partnerships, testing |
| **Initial Liquidity** | 5% | 50,000,000 | DEX liquidity (Raydium/Orca) |
| **Buffer/Contingency** | 5% | 50,000,000 | Emergency reserve, unforeseen needs |
| **Total** | 100% | 1,000,000,000 | - |

---

## Utility & Use Cases

### **1. Lending Pool Interest** ✅
- Lenders earn OTUS tokens as interest (instead of stablecoins)
- Interest rate calculated: `interest_usd = principal * APR * time`
- Conversion to OTUS: `otus_earned = interest_usd / otus_price`
- **Formula**: `OTUS_price = (USDC + USD1 in treasury) / OTUS_supply`

### **2. Bootstrap Genesis Rewards** ✅
- Early depositors earn OTUS allocation
- Credits calculated: `credits = deposit_usd * days * multiplier`
- Multiplier: 2x for early participants
- **Scops NFT Tiers**: Trading fee discounts (10-50%) based on deposit size

### **3. Leverage Bonus** ✅
- **+1x leverage per 5,000 OTUS held** (max +4x bonus)
- Example: Holding 20,000 OTUS = +4x max leverage
- Base leverage: 1-20x → Enhanced: 1-24x

### **4. Fee Discounts** ✅
- Scops NFT holders get trading fee discounts:
  - **Great Horned** (Top 10): 50% discount
  - **Snowy** (11-100): 35% discount
  - **Barn** (101-500): 25% discount
  - **Screech** (501+): 10% discount

### **5. Copy Trading (Future)** 🔮
- Pay OTUS to unlock premium trader signals
- Traders earn OTUS from follower volume

---

## Token Supply Model

### **Fixed Supply**
- ✅ No inflation
- ✅ Fixed cap at 1 billion OTUS
- ✅ Mint authority disabled after creation
- ✅ Deflationary pressure from future burn mechanisms

### **Future Deflationary Mechanisms** (Post-MVP)
- Transfer fees (0.5% auto-burn)
- Trading fee buy-backs
- NFT minting burns
- Liquidation penalty burns

---

## Pricing Mechanism

### **Floor Price (Treasury Backing)**
```
OTUS_floor_price = (Total USDC + Total USD1 in treasury) / OTUS_circulating_supply
```

**Example**:
```
Treasury: $500,000 USDC + $200,000 USD1 = $700,000
Circulating Supply: 100,000,000 OTUS
Floor Price: $700,000 / 100M = $0.007 per OTUS
```

### **Market Price**
- Determined by DEX trading (Raydium, Orca, Jupiter)
- Expected to trade above floor price due to utility value
- Arbitrage opportunity if market price < floor price

### **No Redemption (MVP)**
- For devnet testing, no redemption mechanism
- Production: May add treasury redemption with penalty

---

## Token Distribution Schedule

### **Immediate (Genesis)**
- Bootstrap vault: 300M OTUS
- Lending vault: 300M OTUS
- Trading vault: 150M OTUS
- **Total in programs**: 750M OTUS (75%)

### **Held by Authority**
- Team reserve: 150M OTUS (15%)
- Liquidity: 50M OTUS (5%)
- Buffer: 50M OTUS (5%)
- **Total held**: 250M OTUS (25%)

---

## Smart Contract Integration

### **Program Vaults**

Each program has an OTUS vault PDA:

```rust
// Bootstrap Program
[b"otus_vault"] → Bootstrap OTUS Vault (300M OTUS)

// Lending Program
[b"otus_vault"] → Lending OTUS Vault (300M OTUS)

// Trading Program
[b"otus_vault"] → Trading OTUS Vault (150M OTUS)
```

### **Distribution Mechanics**

**Bootstrap Rewards**:
```rust
user.otus_allocation = user.total_usd_value * credits_rate;
// Claimed after bootstrap period ends
```

**Lending Interest**:
```rust
interest_usd = principal * APR * time / year;
otus_earned = interest_usd / otus_price;
// Claimed on withdraw or manual claim
```

**Leverage Bonus**:
```rust
otus_balance = get_token_balance(user_wallet, OTUS_MINT);
bonus_leverage = min(otus_balance / 5000, 4);
max_leverage = base_max_leverage + bonus_leverage;
```

---

## Devnet Deployment Steps

### **1. Create Token**
```bash
cd /Users/tobiasd/Desktop/stablefi/Solana/otusfx/scripts
./create-otus-token.sh
```

**Output**: Saves mint address to `otus-mint-devnet.txt`

### **2. Update Hooks**
Replace placeholder in:
- `/web/hooks/useLendingPool.ts:15`
- `/web/hooks/useBootstrap.ts:12`
- `/web/hooks/useTrading.ts:14`

```typescript
const OTUS_MINT = new PublicKey("PASTE_DEVNET_MINT_HERE");
```

### **3. Distribute Tokens**
```bash
npx ts-node scripts/distribute-otus.ts
```

**Output**: Transfers tokens to program vaults

### **4. Initialize Programs**
Run initialization instructions for each program with OTUS vault accounts.

### **5. Test End-to-End**
- Bootstrap: Deposit → Claim OTUS
- Lending: Deposit → Withdraw (receive OTUS interest)
- Trading: Hold OTUS → Get leverage bonus

---

## Token Metadata (Metaplex)

```json
{
  "name": "Otus Token",
  "symbol": "OTUS",
  "description": "The utility token for OtusFX - privacy-first leveraged FX trading on Solana. Earn OTUS as lending interest, bootstrap rewards, and trading incentives.",
  "image": "https://arweave.net/[UPLOAD_LOGO_HERE]",
  "external_url": "https://otusfx.com",
  "properties": {
    "category": "utility",
    "files": [
      {
        "uri": "https://arweave.net/[LOGO]",
        "type": "image/png"
      }
    ]
  }
}
```

---

## Mainnet Migration Plan

When moving to mainnet:

1. **Create new token** on mainnet with same parameters
2. **Add token metadata** via Metaplex
3. **Upload logo** to Arweave (permanent storage)
4. **Deploy programs** with mainnet OTUS mint
5. **Add initial liquidity** to Raydium (50M OTUS + USDC pair)
6. **Enable trading** and monitor price discovery
7. **Announce** token launch to community

---

## Risk Considerations

### **Devnet Testing**
- ⚠️ Devnet tokens have no value
- ⚠️ Devnet can reset (save all addresses)
- ⚠️ Use for testing only

### **Mainnet Launch**
- ⚠️ Ensure proper audits before mainnet
- ⚠️ Test all distribution logic thoroughly
- ⚠️ Verify treasury backing calculations
- ⚠️ Consider progressive decentralization

---

## Support & Resources

- **Mint Address**: See `otus-mint-devnet.txt`
- **Distribution Summary**: See `otus-distribution-summary.json`
- **Explorer**: https://explorer.solana.com/address/[MINT]?cluster=devnet
- **Scripts**: `/scripts/create-otus-token.sh` and `/scripts/distribute-otus.ts`

---

**Last Updated**: January 25, 2026
**Network**: Devnet
**Status**: Testing Phase
