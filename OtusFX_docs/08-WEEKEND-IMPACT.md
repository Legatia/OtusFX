# Weekend Impact — Product Specification

> *"Give Back. Earn OTUS. Save on Taxes."*

## Overview

Weekend Impact is a charitable giving feature that keeps users engaged when FX markets are closed (Saturday-Sunday) while generating platform revenue and distributing OTUS tokens meaningfully.

**Core Value Proposition:**
1. **OTUS Cashback** — Tiered rewards from weekly trading fees
2. **Scops Credits** — Platform perks for donors
3. **Tax Benefits** — Documentation for tax deductions/credits

---

## Problem Solved

| Issue | Solution |
|-------|----------|
| FX markets closed on weekends | Charitable giving keeps users engaged |
| Need fee-generating weekend activity | 2% processing fee on donations |
| OTUS distribution mechanism | Cashback from trading fee pool |
| Differentiation from competitors | First DeFi platform with tax-optimized giving |

---

## Mechanics

### 1. Weekly Impact Fund (Multi-Source)

Multiple revenue streams fund the weekend giving:

```
        TRADING FEES (8bps)                    DEFI YIELD (8-15% APY)
              ↓                                       ↓
   ┌──────────┴──────────┐              ┌────────────┴────────────┐
   │   50% Stakers       │              │   55% Treasury         │
   │   20% Treasury      │              │   20% Insurance        │
   │   15% Insurance     │              │   15% Team (OTUS)      │
   │   5%  Team          │              │   5%  Foundation       │
   │   10% IMPACT ←──────┼──────────────┼── 5%  IMPACT ←         │
   └─────────────────────┘              └────────────────────────┘
```

**Example Week ($10M trading volume, $20M TVL):**

| Source | Calculation | Contribution |
|--------|-------------|--------------|
| Trading Fees | $10M × 8bps × 10% | $800 |
| DeFi Yield | $20M × 10% APY ÷ 52 weeks × 5% | ~$192 |
| **Total Impact Fund** | | **~$1,000/week** |

This is 2.5x larger than single-source, enabling better tiered cashback rates.

### 2. Tiered Cashback Rates

Early donors get better rates:

| Tier | Donation Range | OTUS Cashback |
|------|----------------|---------------|
| 🥇 Early Bird | First $1,500 | 25% |
| 🥈 Contributor | Next $2,500 | 15% |
| 🥉 Supporter | Next $2,500 | 10% |
| — | After fund depletes | 0% |

**Fund Distribution Example (~$1,000 fund):**
```
$1,500 × 25% = $375 (Tier 1)
$2,500 × 15% = $375 (Tier 2)
$2,500 × 10% = $250 (Tier 3)
─────────────────────────────
Total capacity: ~$6,500 in donations
```

### 3. Credits Integration

| Action | Credits Earned |
|--------|----------------|
| Weekend donation | 1 credit per $1 |
| Bootstrap deposit | 1 credit per $1 |
| Trading volume | 0.1 credit per $100 |

Credits unlock: fee discounts, priority access, exclusive features.

### 4. Tax Documentation

OtusFX provides documentation; users handle local tax filing.

**Per-Jurisdiction Benefits:**

| Jurisdiction | Tax Model | User Benefit Example |
|--------------|-----------|---------------------|
| 🇺🇸 USA | Deduction | $100 donation → ~$30 tax savings |
| 🇮🇹 Italy | Credit (30%) | €100 donation → €30 off tax bill |
| 🇫🇷 France | Credit (66%) | €100 donation → €66 off tax bill |
| 🇩🇪 Germany | Deduction | €100 donation → ~€35 tax savings |
| 🇵🇱 Poland | 1% Allocation | Designate 1% of tax to charity |

---

## Weekly Cadence

```
Monday-Friday: Trading generates fees → Impact Fund accumulates
Friday 5pm:    "This week's Impact Fund: $X" preview
Saturday 8am:  Donations open, tiers active
Sunday 8pm:    Donations close, OTUS distributed
Monday:        New week begins
```

---

## User Flow

```
1. User opens Weekend Impact (Saturday)
         ↓
2. Sees current tier and cashback rate
         ↓
3. Selects charity from curated list
         ↓
4. Enters donation amount
         ↓
5. Reviews: OTUS cashback + Credits + Tax benefit estimate
         ↓
6. Confirms donation via wallet
         ↓
7. Receives:
   ├── Confirmation + receipt
   ├── OTUS tokens (Sunday evening)
   ├── Credits (immediate)
   └── Tax receipt (via email)
```

---

## UI Specification

### Weekend Impact Dashboard

```
┌─────────────────────────────────────────────┐
│         🌿 WEEKEND IMPACT                   │
│    Give Back. Earn OTUS. Save on Taxes.     │
├─────────────────────────────────────────────┤
│                                             │
│   This Week's Impact Fund: $2,400           │
│   Generated by OtusFX traders 🦉            │
│                                             │
│   Current Tier: 🥈 CONTRIBUTOR              │
│   Your Cashback: 15% OTUS                   │
│                                             │
│   ┌─────────────────────────────────────┐   │
│   │ 🥇 25% ████████████ FULL            │   │
│   │ 🥈 15% ██████░░░░░░ $1,200 left     │   │
│   │ 🥉 10% ░░░░░░░░░░░░ $3,000 left     │   │
│   └─────────────────────────────────────┘   │
│                                             │
│   Featured: 🌍 Rainforest Trust             │
│   [View All Charities]                      │
│                                             │
│   Donate: [$100      ▾]                     │
│                                             │
│   You'll receive:                           │
│   ├── OTUS Cashback: ~$15                   │
│   ├── Credits: 100                          │
│   └── Tax Benefit: ~$30*                    │
│                                             │
│   [  Donate Now  ]                          │
│   ☑️ Email me tax receipt                    │
│                                             │
│   *Estimate at 30% rate. Consult advisor.   │
└─────────────────────────────────────────────┘
```

### Donation Summary (Post-Donation)

```
┌─────────────────────────────────────────────┐
│         ✅ DONATION COMPLETE                │
├─────────────────────────────────────────────┤
│                                             │
│   Amount: $100 USDC                         │
│   Charity: Rainforest Trust                 │
│   Receipt: rainforest-trust.org/receipt/... │
│                                             │
│   Rewards:                                  │
│   ├── 🪙 15 OTUS (arrives Sunday 8pm)       │
│   ├── ⭐ 100 Credits (added)                │
│   └── 📄 Tax receipt (sent to email)        │
│                                             │
│   [View Receipt] [Share Impact]             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## Tax Documentation

### What OtusFX Provides

1. **Per-Donation Receipt**
```
DONATION RECEIPT
────────────────────────────
Donor Wallet: 0x7a3f...4e2b
Amount: $500 USDC
Date: 2026-01-22
Charity: Rainforest Trust
EIN (US): 13-3500609
Transaction: solana.fm/tx/5kT...
────────────────────────────
This may qualify for tax benefits.
Consult your tax advisor.
```

2. **Annual Summary Export**
```
YOUR 2026 OTUSFX IMPACT SUMMARY
────────────────────────────────
Total Donated: $2,500
Charities Supported: 4
Transactions: 12

[Download PDF] [Export CSV]

Tax guidance by jurisdiction:
🇺🇸 USA → Report as charitable deduction
🇪🇺 EU → May qualify for tax credit
🇬🇧 UK → Gift Aid may apply

Consult your local tax professional.
```

### Implementation via The Giving Block

| Responsibility | Handler |
|---------------|---------|
| Charity verification | The Giving Block |
| Receipt generation | The Giving Block |
| Annual summaries | OtusFX |
| Tax filing | User's accountant |
| Tax advice | NOT OtusFX |

---

## Revenue Model

| Source | Amount | Notes |
|--------|--------|-------|
| Processing fee | 2% of donations | $10K donations = $200 |
| OTUS distribution | From Impact Fund | Already allocated from fees |
| Credits | No direct cost | Loyalty mechanism |

**Net Revenue:** 2% of all weekend donation volume

---

## Technical Requirements

### Data Models

```typescript
interface ImpactFund {
  weekStart: Date;
  weekEnd: Date;
  totalFees: number;
  impactAllocation: number; // 5% of totalFees
  distributed: number;
  tierProgress: {
    tier1Used: number; // max $1000
    tier2Used: number; // max $2000
    tier3Used: number; // max $3000
  };
}

interface DonationRecord {
  id: string;
  wallet: string;
  amount: number;
  currency: 'USDC' | 'USD1';
  charityId: string;
  charityName: string;
  charityEIN?: string;
  tier: 1 | 2 | 3;
  cashbackRate: number;
  otusAwarded: number;
  creditsAwarded: number;
  txHash: string;
  receiptUrl?: string;
  timestamp: Date;
}
```

### API Endpoints

```
GET  /api/impact/fund          → Current week's fund status
GET  /api/impact/charities     → Available charities
POST /api/impact/donate        → Process donation
GET  /api/impact/history       → User's donation history
GET  /api/impact/summary/:year → Annual summary export
```

### External Integrations

- **The Giving Block API** — Charity routing & receipts
- **Pyth** — USDC/USD pricing (if needed)
- **Solana** — Transaction processing

---

## Disclaimers (Required)

Display on all Impact pages:

> **Tax Disclaimer:** Tax treatment of charitable donations varies by jurisdiction. OtusFX does not provide tax advice. Donations are made directly to registered charities. Tax receipts are issued by charities or their fiscal sponsors. Consult a qualified tax professional for guidance specific to your situation.

---

## Launch Phases

### Phase 1: MVP
- 5 curated charities (via The Giving Block)
- Tiered OTUS cashback
- Credits integration
- Basic receipt download

### Phase 2: Enhanced
- 20+ charities
- Jurisdiction-specific guidance
- Annual summary export
- Impact score leaderboard

### Phase 3: Advanced
- Direct charity partnerships (EU focus)
- Tax software integrations
- Corporate matching programs
- Impact NFT badges

---

## Success Metrics

| Metric | Target (Month 1) |
|--------|------------------|
| Weekend donations | $10,000+ |
| Unique donors | 50+ |
| Processing revenue | $200+ |
| OTUS distributed | Proportional to fund |
| User retention (Sat-Sun) | 2x current |

---

## Competitive Advantage

**First DeFi platform combining:**
- Trading activity → Charitable giving
- Dynamic cashback from protocol revenue
- Tax-optimized donation flow
- Privacy-preserving records

**Narrative:** *"Trade during the week. Give back on weekends."*
