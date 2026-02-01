# OtusFX 🦉

> *"Trade in the shadows. Profit in private."*

OtusFX is the first **confidential liquidity venue** on Solana. We combine high-speed execution with institutional-grade privacy, solving the "Alpha Decay" problem where public blockchains reveal profitable strategies to front-runners.

## 🚀 Live Demo

**[Launch Demo App](https://otus-fx.vercel.app/demo)**

## 🛡️ The Triple Privacy Stack

We have successfully integrated three cutting-edge privacy technologies into a unified browser-based experience:

### 1. Privacy Cash (Integrated)
**Confidential Lending & Deposits**
- Users deposit assets into a shared anonymity set.
- **Status**: ✅ Integrated. Real-time encrypted deposits using `privacycash` SDK.

### 2. ShadowWire (Integrated)
**Silent Execution**
- Transfers and settlements are hidden using Zero-Knowledge Proofs (Bulletproofs).
- **Status**: ✅ Integrated. Using `@radr/shadowwire` with custom WASM patches for browser compatibility.

### 3. Arcium MPC (Simulated)
**Encrypted Positions**
- Multi-Party Computation network where nodes process data without ever seeing the raw values.
- **Status**: ⚠️ **Simulation Mode**. The frontend currently demonstrates the MPC UX workflow (Node discovery -> Key Sharding -> Blinded Compute) to showcase the intended mainnet experience.

## ✨ Key Features

- **Private Lending Pool**: Earn yield on USDC without revealing your total wealth.
- **Encrypted Leverage**: Trade with up to 10x leverage. Your liquidation price is hidden from hunters.
- **Selective Disclosure**: Generate view keys for auditors or regulators to prove solvency without public exposure.

## 🛠️ Getting Started

We use a custom Next.js setup with patched WASM support for the privacy SDKs.

```bash
cd web
npm install
npm run dev
```

### Build Notes
The project requires specific `next.config.ts` patches to handle WASM files from Rust-based privacy SDKs. If you encounter build errors, ensure you are using the provided configuration which handles `node-localstorage` and `fs` polyfills.

## 📚 Stack

- **Frontend**: Next.js 16 (App Router), Tailwind v4, Framer Motion
- **Solana**: Web3.js, Anchor Framework
- **Oracles**: Pyth Network
- **Privacy**: Privacy Cash SDK, ShadowWire SDK, Arcium (Simulated)

## 🔮 Future Roadmap

- **Q2 2026**: Mainnet Launch
- **Q3 2026**: Full Arcium Network Integration (replacing simulation)
- **Q4 2026**: Institutional Compliance Suite (ZK-KYC)

---

*"The Switzerland of Solana liquidity."*
