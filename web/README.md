# OtusFX 🦉

**Private institutional-grade FX trading on Solana.**

OtusFX brings dark pool privacy to DeFi, allowing traders to execute confidential positions with dynamic leverage and zero-knowledge proofs.

## ⚡ Features

- **Zero Knowledge Order Books**: Mask your trade size and direction from MEV bots and copy-traders.
- **Dynamic Leverage**: Protocol-managed leverage (up to 20x) that adjusts based on real-time liquidity depth.
- **Privacy Cash**: Shielded deposits and withdrawals using ZK technology.
- **Institutional Pools**: Permissioned liquidity pools with compliance hooks.

## 🛠 Tech Stack

- **Frontend**: Next.js 15 (App Router), TailwindCSS, Shadcn/UI
- **Blockchain**: Solana (Mainnet/Devnet)
- **RPC & Data**: Helius (for high-performance state fetching)
- **Oracles**: Pyth Network (Real-time FX feeds)
- **Privacy**: Custom ZK-proof generation (Mocked/Simulated for Demo)

## 🚀 Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   Create a `.env` or `.env.local` file with the following keys:
   ```env
   # RPC Provider (Get from https://dev.helius.xyz)
   NEXT_PUBLIC_HELIUS_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
   HELIUS_API_KEY=YOUR_KEY
   
   # Network (mainnet-beta or devnet)
   NEXT_PUBLIC_SOLANA_NETWORK=mainnet-beta
   
   # Webhook for Waitlist (Optional)
   GOOGLE_SHEETS_WEBHOOK_URL=...
   ```

3. **Run Locally**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## 📦 Deployment

This project is optimized for **Vercel**.

1. Import the `Solana/web` directory.
2. Add the environment variables in the Vercel dashboard.
3. Deploy!

## 🔐 Privacy Notice

This is a demonstration interface. While it connects to real Solana Mainnet data for pricing (Pyth) and wallet balances, the privacy/ZK proofs are currently simulated for the investor demo.
