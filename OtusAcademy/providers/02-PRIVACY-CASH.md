# Privacy Cash — Zero-Knowledge Private Balances

> *"Private balances with aggregate proofs. Know the total without knowing the parts."*

## Overview

**Privacy Cash** is a zero-knowledge protocol enabling confidential token balances on Solana. Users can deposit tokens and receive private "notes" that hide individual amounts while still allowing aggregate proofs (e.g., "total TVL > $1M").

| Attribute | Value |
|-----------|-------|
| **Technology** | Zero-Knowledge Proofs (ZK-SNARKs) |
| **Chain** | Solana |
| **Status** | 🟢 OtusFX Partner |
| **Use Case** | Private lending deposits, TVL proofs |

---

## How It Works

### The Problem with Transparent Balances

On public blockchains, everyone can see:
- How much you deposited
- When you deposited
- Your wallet's total holdings

This creates risks:
- **Targeted attacks** on large holders
- **Front-running** based on deposit patterns
- **Competitive intelligence** leakage

### Privacy Cash Solution

```
┌─────────────────────────────────────────────────────────────┐
│                     PRIVACY CASH FLOW                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. User deposits 10,000 USDC                              │
│          ↓                                                   │
│   2. SDK generates ZK commitment                            │
│          ↓                                                   │
│   3. Commitment inserted into Merkle tree                   │
│          ↓                                                   │
│   4. User receives private "note" (proof of deposit)        │
│          ↓                                                   │
│   5. On-chain: Only tree root visible, not individual notes │
│                                                              │
│   Result: Nobody knows you deposited 10,000 USDC            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

### 1. Private Deposits
Individual deposit amounts are hidden using ZK commitments.

### 2. Aggregate Proofs
Prove statements about totals without revealing individual amounts:
```
Prove: "Total deposits > $100,000"
Reveal: true/false
Hidden: Individual deposit amounts
```

### 3. Private Withdrawals
Withdraw using ZK proofs that verify ownership without linking to deposit.

---

## OtusFX Integration

OtusFX uses Privacy Cash for **Confidential Lending Deposits**:

```typescript
// Example: Private deposit to lending pool
import { PrivacyCash } from 'privacy-cash-sdk';

const client = new PrivacyCash();

// Deposit privately
const note = await client.depositSPL({
  token: 'USDC',
  amount: 10_000,
  poolId: LENDING_POOL_ID,
});

// Later: Prove TVL milestones without revealing deposits
const proof = await client.proveAggregateGte({
  poolId: LENDING_POOL_ID,
  threshold: 500_000,  // Prove TVL > $500K
});
```

### OtusFX Use Cases

| Feature | Privacy Cash Role |
|---------|-------------------|
| **Lending Deposits** | Hide individual lender amounts |
| **TVL Milestones** | Prove "$X raised" without revealing depositors |
| **Bootstrap Pool** | Private participation in genesis phase |

---

## Technical Architecture

### Components

1. **Merkle Tree** — Stores ZK commitments on-chain
2. **Nullifier Set** — Prevents double-spending
3. **ZK Circuits** — Prove ownership and amounts
4. **SDK** — Client-side proof generation

### Zero-Knowledge Proof System

Privacy Cash uses ZK-SNARKs (Succinct Non-interactive Arguments of Knowledge):
- **Succinct**: Proofs are small and fast to verify
- **Non-interactive**: No back-and-forth with verifier
- **Zero-Knowledge**: Reveals nothing beyond the statement truth

---

## Privacy Guarantees

| What's Hidden | What's Revealed |
|---------------|-----------------|
| Individual deposit amounts | Aggregate totals (with permission) |
| Depositor identities | Proof that deposits exist |
| Deposit timing | Pool participation counts |
| Withdrawal amounts | Successful withdrawal (yes/no) |

---

## Comparison to Other Privacy Solutions

| Solution | Approach | Trade-off |
|----------|----------|-----------|
| **Tornado Cash** | Mixer model | Fixed denominations, regulatory risk |
| **Privacy Cash** | ZK commitments + proofs | More flexible, aggregate proofs |
| **Zcash** | Shielded transactions | Different chain, no smart contracts |
| **Aztec** | ZK rollup | Ethereum only |

---

## Security Considerations

### Pros
- Cryptographically sound (based on well-studied ZK systems)
- On-chain verification
- Audited circuits

### Considerations
- Trusted setup requirement for some ZK systems
- Proof generation requires client-side computation
- New technology, smaller ecosystem than MPC

---

## Resources

| Resource | Link |
|----------|------|
| **Documentation** | Contact OtusFX for SDK access |
| **Technology** | Based on ZK-SNARK research |
| **Academic Papers** | [zkSNARKs explained](https://z.cash/technology/zksnarks/) |

---

## Summary

| What | Details |
|------|---------|
| **Technology** | Zero-Knowledge Proofs |
| **Privacy Level** | Individual amounts hidden |
| **Unique Feature** | Aggregate proofs without revealing parts |
| **OtusFX Use** | Private lending deposits, TVL milestones |
| **Best For** | Financial privacy with compliance |
