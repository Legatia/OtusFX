# SynFX (Solana)

SynFX is a privacy-first foreign exchange trading protocol on Solana, leveraging Arcium for confidential execution and Pyth for institutional-grade market data.

## Features

- **Private Trading**: Utilizing Arcium's confidential computing (C-SPL) to hide position sizes and entry prices.
- **Lending Pool**: Single-asset USDC lending pool allowing passive yield for lenders and leverage for traders.
- **Institutional Data**: Real-time FX feeds via Pyth Network.
- **MEV Protection**: Dark pool execution prevents front-running and copy-trading.

## Architecture

- **Frontend**: Next.js 14, Tailwind CSS, Framer Motion
- **Settlement**: Solana (High-speed, low-cost)
- **Privacy**: Arcium (Confidential Computing)
- **Oracles**: Pyth Network

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

1. Navigate to the web directory:
   ```bash
   cd web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) (or 3001 if 3000 is taken)

## Project Structure

- `/app`: Next.js app router pages
- `/components`: React components
- `/lib`: Utilities and configuration (Pyth, etc.)

## Bootstrap Phase

The current demo includes a Bootstrap Phase UI where users can:
- Deposit funds to seed the lending pool
- Earn credits and unique NFT badges ("Founding Lender")
- View real-time pool stats
