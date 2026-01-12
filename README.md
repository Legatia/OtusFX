# OtusFX 🦉

> *"Trade in the shadows. Profit in private."*

OtusFX is a privacy-first foreign exchange trading protocol on Solana. Named after the Otus genus of scops owls — silent hunters with night vision — we enable traders to operate unseen.

## Features

- **Encrypted Positions**: Arcium C-SPL hides position sizes, entry prices, and liquidation levels
- **Private Lending Pool**: Privacy Cash integration keeps balances confidential
- **Silent Execution**: ShadowWire transfers prevent volume tracking
- **Strategy Vaults**: Copy top traders without revealing strategies
- **Private Arbitrage**: Inco Lightning for confidential triangular arb
- **Institutional Data**: Real-time FX feeds via Pyth Network

## Community

Early supporters are called **Scops** (from scops owls). Genesis Scops are the first to seed the lending pool during Bootstrap.

## Architecture

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Settlement**: Solana (High-speed, low-cost)
- **Privacy Stack**:
  - Arcium (Confidential positions)
  - ShadowWire (Private transfers)
  - Privacy Cash (Private lending)
  - Inco Lightning (Confidential compute)
- **Oracles**: Pyth Network

## Getting Started

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

## Project Structure

- `/app`: Next.js app router pages
- `/components`: React components
- `/lib`: Utilities and configuration (Pyth, etc.)

## Bootstrap Phase

Genesis Scops can:
- Deposit USDC to seed the lending pool
- Earn credits and unique Genesis Scops NFT badges
- Access exclusive tier perks (fee discounts, priority access)
