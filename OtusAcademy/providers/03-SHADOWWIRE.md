# ShadowWire — Private Transfers with Bulletproofs

> *"Transfer value privately. Only sender and receiver know the amount."*

## Overview

**ShadowWire** (by Radr Labs) enables private token transfers on Solana using Bulletproofs—a compact zero-knowledge range proof system. Unlike mixers that pool funds, ShadowWire hides transfer amounts while keeping sender/receiver visible.

| Attribute | Value |
|-----------|-------|
| **Technology** | Bulletproofs (Range Proofs) |
| **Chain** | Solana |
| **Status** | 🟢 OtusFX Partner |
| **Use Case** | Private commission payments, hidden P2P transfers |
| **Developer** | Radr Labs |

---

## How It Works

### The Problem with Transparent Transfers

On-chain transfers reveal:
- Exact amount sent
- Sender address
- Receiver address
- Timing

This enables:
- **Income tracking** by competitors
- **Payment pattern analysis**
- **Business intelligence gathering**

### ShadowWire Solution: Hidden Amounts

```
┌─────────────────────────────────────────────────────────────┐
│                     SHADOWWIRE FLOW                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Traditional Transfer:                                      │
│   Alice → 500 USDC → Bob                                    │
│   Everyone sees: "Alice sent Bob 500 USDC"                  │
│                                                              │
│   ShadowWire Transfer:                                       │
│   Alice → ??? USDC → Bob                                    │
│   Everyone sees: "Alice sent Bob [hidden amount] USDC"      │
│   Only Alice and Bob know: It was 500 USDC                  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Bulletproofs Explained

### What Are Bulletproofs?

Bulletproofs are a type of zero-knowledge proof specifically designed for **range proofs**—proving a value is within a range without revealing the value.

```
Prove: "I'm sending between 0 and 1,000,000 USDC"
Reveal: true (valid range)
Hidden: The exact amount
```

### Why Bulletproofs?

| Property | Benefit |
|----------|---------|
| **No trusted setup** | Unlike SNARKs, no ceremony required |
| **Compact proofs** | ~1KB per proof |
| **Aggregatable** | Multiple proofs combine efficiently |
| **Battle-tested** | Used in Monero, Mimblewimble |

---

## Key Features

### 1. Amount Privacy
Transfer amounts are hidden using Pedersen commitments + range proofs.

### 2. Sender/Receiver Visible
Addresses are NOT hidden (different from mixers). This provides:
- Auditability when needed
- Compliance-friendly
- Simpler integration

### 3. Multi-Token Support
Works with USDC, USD1, and other SPL tokens.

---

## OtusFX Integration

OtusFX uses ShadowWire for **Private Commission Payments**:

```typescript
// Example: Pay copy trading commission privately
import { ShadowWire } from '@radr/shadowwire';

const client = new ShadowWire();

// Lead trader earned profit, copier pays 20% commission
await client.transfer({
  type: 'internal',
  from: copierWallet,
  to: leadTraderWallet,
  amount: 200,  // This amount is hidden on-chain
  token: 'USDC',
});

// On-chain: "Copier sent LeadTrader [hidden] USDC"
// Only parties know: It was $200
```

### OtusFX Use Cases

| Feature | ShadowWire Role |
|---------|-----------------|
| **Copy Trading Commissions** | Hide profit-sharing amounts |
| **P2P Transfers** | Private transfers between users |
| **Vault Distributions** | Hide yield payouts |

---

## Privacy Model

### What's Hidden vs. Visible

| Visible | Hidden |
|---------|--------|
| Sender address | Transfer amount |
| Receiver address | Balance changes |
| Transaction timing | Total holdings |
| Token type | — |

### Trade-offs

| Pros | Cons |
|------|------|
| Amount privacy | Addresses visible |
| No trusted setup | Larger proofs than SNARKs |
| Fast verification | Newer on Solana |
| Compliance-friendly | Not full anonymity |

---

## Comparison to Other Solutions

| Solution | Amount Hidden | Addresses Hidden | Trust Model |
|----------|---------------|------------------|-------------|
| **ShadowWire** | ✅ | ❌ | Trustless |
| **Tornado Cash** | ✅ | ✅ | Trusted setup |
| **Privacy Cash** | ✅ | Partial | Trusted setup |
| **Monero** | ✅ | ✅ | Trustless |

**ShadowWire's niche**: Amount privacy with address transparency (compliance-friendly).

---

## Technical Details

### Pedersen Commitments

Amounts are "committed" using:
```
Commitment = g^amount * h^blinding_factor
```

- Can't extract `amount` from commitment
- But can prove it's in a valid range
- Commitments are homomorphic (add up correctly)

### Range Proofs

Bulletproofs prove:
```
0 ≤ amount ≤ 2^64
```

Without revealing `amount`. Proof size: ~1KB.

---

## Getting Started

### Installation

```bash
npm install @radr/shadowwire
```

### Basic Usage

```typescript
import { ShadowWire, ShadowWireConfig } from '@radr/shadowwire';

const config: ShadowWireConfig = {
  rpcUrl: process.env.SOLANA_RPC_URL,
  network: 'mainnet-beta',
};

const client = new ShadowWire(config);

// Private transfer
const tx = await client.transfer({
  type: 'internal',
  from: senderKeypair,
  to: receiverPublicKey,
  amount: 1000,
  token: 'USDC',
});

console.log('Transaction:', tx.signature);
// Amount is hidden on-chain!
```

---

## Resources

| Resource | Link |
|----------|------|
| **Radr Labs** | [radr.io](https://radr.io) |
| **Bulletproofs Paper** | [eprint.iacr.org/2017/1066](https://eprint.iacr.org/2017/1066) |
| **Pedersen Commitments** | [Wikipedia](https://en.wikipedia.org/wiki/Commitment_scheme) |

---

## Summary

| What | Details |
|------|---------|
| **Technology** | Bulletproofs (Range Proofs) |
| **Privacy Level** | Amounts hidden, addresses visible |
| **Trust Model** | Trustless (no ceremony) |
| **OtusFX Use** | Private commission payments |
| **Best For** | Amount privacy with compliance |
