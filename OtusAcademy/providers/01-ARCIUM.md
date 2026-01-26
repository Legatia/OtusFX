# Arcium — Multi-Party Computation for Solana

> *"Full privacy for any application, with just a few lines of code."*

## Overview

**Arcium** is a decentralized Multi-Party Computation (MPC) network that enables confidential computing on Solana. It allows applications to compute over fully encrypted data without ever revealing the underlying information.

| Attribute | Value |
|-----------|-------|
| **Technology** | Multi-Party Computation (MPC) |
| **Chain** | Solana |
| **Status** | 🟢 OtusFX Partner |
| **Website** | [arcium.com](https://arcium.com) |
| **Docs** | [docs.arcium.com](https://docs.arcium.com) |

---

## How It Works

### Multi-Party Computation (MPC)

MPC allows multiple parties to jointly compute a function over their inputs while keeping those inputs private. No single party ever sees the complete data.

```
Traditional Computing:
User → Sends plaintext data → Server computes → Returns result
       ⚠️ Server sees all data!

MPC Computing:
User → Encrypts data → Multiple MXE nodes compute together → Return result
       ✅ No single node sees the data!
```

### Arcium's MXE (Multi-Party eXecution Environments)

Arcium uses distributed MXE nodes to perform computations:

```
┌─────────────────────────────────────────────────────────────┐
│                     DATA FLOW                                │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   1. Client encrypts data locally                           │
│          ↓                                                   │
│   2. Encrypted data sent to MXE network                     │
│          ↓                                                   │
│   3. MXE nodes compute TOGETHER (threshold cryptography)    │
│          ↓                                                   │
│   4. Only the RESULT is revealed (not inputs)               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Benefits

| Benefit | Description |
|---------|-------------|
| **Full Privacy** | Data never exposed, even during computation |
| **Trustless** | No single party has access to complete data |
| **Composable** | Works with existing Solana programs |
| **Low Latency** | Designed for real-time applications |

---

## Use Cases

### Financial Applications
- **Dark Pools**: Hide order book from participants
- **Private Auctions**: Sealed-bid auctions
- **Credit Scoring**: Compute scores without revealing data
- **Liquidation Prevention**: Hide trigger prices (OtusFX)

### Gaming
- **Hidden Information**: Poker hands, fog of war
- **Anti-Cheat**: Verify without revealing game state

### Identity
- **Private KYC**: Verify credentials without sharing data
- **Voting**: Anonymous yet verifiable elections

---

## OtusFX Integration

OtusFX uses Arcium for **Private Auto-Deleverage**:

```rust
// Example: Encrypted deleverage trigger check
let should_trigger = arcium_check_trigger(
    &position.encrypted_triggers,  // Encrypted price thresholds
    tier,                          // Which tier to check
    current_price,                 // Current oracle price
)?;
// Returns: true/false
// Reveals: Nothing about the trigger price
```

**Why this matters:**
- Liquidation hunters can't see your stop-loss prices
- Positions are protected from manipulation
- Only triggered when conditions met

---

## Technical Architecture

### Components

1. **Arcium SDK** — Client-side encryption library
2. **MXE Network** — Distributed computation nodes
3. **Verifier** — On-chain verification of MPC results

### Security Model

- **Threshold Trust**: Requires n/m nodes to collude to break privacy
- **Honest Majority**: Assumes majority of nodes are honest
- **Cryptographic Proofs**: Results can be verified on-chain

---

## Getting Started

### Installation

```bash
npm install @arcium-network/sdk
```

### Basic Usage

```typescript
import { ArciumClient } from '@arcium-network/sdk';

// Initialize client
const arcium = new ArciumClient();

// Encrypt sensitive data
const encrypted = await arcium.encrypt({
  data: [1.0850, 1.0780, 1.0650],  // Deleverage triggers
  mxe: 'deleverage-checker',
  publicKey: PROTOCOL_PUBLIC_KEY,
});

// Later: Check condition without revealing data
const shouldTrigger = await arcium.checkCondition({
  encryptedData: encrypted,
  comparison: 'less_than',
  value: currentPrice,
});
```

---

## Resources

| Resource | Link |
|----------|------|
| **Documentation** | [docs.arcium.com](https://docs.arcium.com) |
| **GitHub** | [github.com/arcium-network](https://github.com/arcium-network) |
| **Discord** | [discord.gg/arcium](https://discord.gg/arcium) |
| **Twitter** | [@ArciumNetwork](https://twitter.com/ArciumNetwork) |

### Recommended Reading
- [Introduction to MPC](https://docs.arcium.com/introduction) — Official intro
- [Key Features & Use Cases](https://docs.arcium.com/introduction/key-features-and-use-cases)
- [Integration Guide](https://docs.arcium.com/developers/integration)

---

## Summary

| What | Details |
|------|---------|
| **Technology** | MPC (Multi-Party Computation) |
| **Privacy Level** | Full encryption during computation |
| **Trust Model** | Distributed, threshold-based |
| **OtusFX Use** | Encrypted deleverage triggers |
| **Best For** | Any computation on private data |
