# Light Protocol — ZK Compression for Solana

> *"Scale anything on Solana. Create tokens and accounts at a fraction of the cost."*

## Overview

**Light Protocol** pioneered ZK Compression on Solana—a framework that lets developers create tokens and program accounts at 1/100th the cost without sacrificing L1 performance or security.

| Attribute | Value |
|-----------|-------|
| **Technology** | Zero-Knowledge Compression |
| **Chain** | Solana |
| **Status** | 🔵 Solana Ecosystem |
| **Website** | [lightprotocol.com](https://lightprotocol.com) |
| **Docs** | [zkcompression.com](https://www.zkcompression.com) |

---

## What is ZK Compression?

### The Problem: State Rent

Solana charges "rent" for storing data on-chain:
- 1 token account: ~0.002 SOL ($0.30-0.50)
- Airdrop to 1M users: ~2,000 SOL ($300,000+)

This makes large-scale airdrops, payments, and DeFi expensive.

### Light's Solution: Compressed State

```
┌─────────────────────────────────────────────────────────────┐
│                   ZK COMPRESSION                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   Traditional Token Account:                                 │
│   [Full account data stored on-chain] → ~0.002 SOL rent     │
│                                                              │
│   Compressed Token Account:                                  │
│   [Only hash stored on-chain] → ~0.00002 SOL (100x cheaper) │
│   [Full data stored off-chain in Merkle tree]               │
│                                                              │
│   ZK Proofs verify: "I own this compressed token"           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Benefits

| Benefit | Impact |
|---------|--------|
| **100x Cost Reduction** | Airdrops, payments become viable |
| **L1 Security** | Same security as regular Solana |
| **L1 Performance** | No sequencer, no additional latency |
| **Composable** | Works with existing programs |

---

## How It Works

### Merkle Trees + ZK Proofs

1. **Compressed State**: Token balances stored as leaves in a Merkle tree
2. **Root on Chain**: Only the tree root stored on-chain (cheap)
3. **ZK Proofs**: Users provide proofs to access/modify their compressed accounts
4. **RPC Indexers**: Specialized RPC nodes (Light, Helius) index full tree data

```
On-chain:           Merkle Root (32 bytes)
                           ↑
Off-chain:    [Leaf1] [Leaf2] [Leaf3] ... [Leaf N]
               (Full account data indexed by RPC)
```

---

## Privacy Aspects

While Light Protocol is primarily about **cost reduction**, it has privacy implications:

| Aspect | Detail |
|--------|--------|
| **Leaf Privacy** | Individual leaves not directly visible on-chain |
| **Nullifiers** | Used to prevent double-spending |
| **RPC Trust** | Must trust RPC to provide correct proofs |

**Note**: Light is not a mixer. Transactions are traceable with RPC access.

---

## Light Token Program

The high-performance token standard built on ZK Compression:

```typescript
// Create compressed token mint
import { createMint, mintTo, transfer } from '@lightprotocol/compressed-token';

// Mint costs ~100x less than regular SPL token
const mint = await createMint(connection, payer, authority);

// Airdrop to millions of users affordably
for (const user of users) {
  await mintTo(connection, mint, user, amount);
}
```

---

## Use Cases

### Already Using Light

| Application | Use Case |
|-------------|----------|
| **Helium** | IOT network payments |
| **Drip.Haus** | NFT drops |
| **Various DAOs** | Token airdrops |

### Potential for OtusFX

| Feature | Light Protocol Potential |
|---------|-------------------------|
| **OTUS Distribution** | Cheap airdrops to community |
| **Genesis Rewards** | Compressed NFT badges |
| **Micro-rewards** | Frequent small distributions |

---

## Integration with RPC Providers

Light Protocol requires specialized RPC:

| Provider | Support |
|----------|---------|
| **Light RPC** | Native support |
| **Helius** | Full ZK compression support |
| **Quicknode** | Coming soon |

---

## Getting Started

### Installation

```bash
npm install @lightprotocol/stateless.js @lightprotocol/compressed-token
```

### Basic Usage

```typescript
import { createRpc, confirmTx } from '@lightprotocol/stateless.js';
import { createMint, mintTo } from '@lightprotocol/compressed-token';

// Connect to ZK compression-enabled RPC
const connection = createRpc(RPC_ENDPOINT, RPC_ENDPOINT);

// Create compressed token mint
const { mint, transactionSignature } = await createMint(
  connection,
  payer,
  authority,
  9, // decimals
);

// Mint compressed tokens (100x cheaper!)
await mintTo(connection, payer, mint, destination, authority, amount);
```

---

## Comparison

| Feature | Regular SPL | Compressed SPL |
|---------|-------------|----------------|
| **Account Cost** | ~0.002 SOL | ~0.00002 SOL |
| **Latency** | ~400ms | ~400ms (same) |
| **Security** | L1 | L1 (same) |
| **RPC** | Standard | Light/Helius |
| **Composability** | Full | Growing |

---

## Resources

| Resource | Link |
|----------|------|
| **Website** | [lightprotocol.com](https://lightprotocol.com) |
| **Documentation** | [zkcompression.com](https://www.zkcompression.com) |
| **GitHub** | [github.com/Lightprotocol](https://github.com/Lightprotocol/light-protocol) |
| **Security Audits** | [Audits](https://github.com/Lightprotocol/light-protocol/tree/main/audits) |
| **Twitter** | [@LightProtocol](https://twitter.com/LightProtocol) |
| **Discord** | [discord.gg/light](https://discord.gg/rpddh53TeG) |

---

## Summary

| What | Details |
|------|---------|
| **Technology** | ZK Compression (Merkle trees + proofs) |
| **Primary Use** | Cost reduction (100x cheaper accounts) |
| **Privacy** | Secondary benefit (leaves off-chain) |
| **Trade-off** | Requires specialized RPC |
| **Best For** | Mass airdrops, payments, DeFi scale |
