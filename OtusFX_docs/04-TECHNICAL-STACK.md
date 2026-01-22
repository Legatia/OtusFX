# Technical Stack (Solana)

## Frontend

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (with `postcss` config)
- **State Management:** React Context + Hooks
- **Wallet Connection:** `@solana/wallet-adapter-react`
- **3D Graphics:** Three.js / React Three Fiber (Landing Page)

### Key Libraries
- `privacy-cash-sdk`: Custom build (cloned in `lib/`)
- `@radr/shadowwire`: Private transfers
- `@arcium-network/sdk`: MPC for encrypted deleverage triggers
- `@solana/web3.js`: Core interaction
- `lucide-react`: Icons

## Backend / API

- **API Routes:** Next.js API Routes (`app/api/`)
  - Used for Server-side SDK interactions (Privacy Cash real SDK).
  - Handles ZK Proof generation request.
- **RPC Provider:** Helius (primary), fallback to public RPCs.

## Smart Contracts (On-Chain)

- **Framework:** Anchor (Rust)
- **Program ID:** `71eGR...` (Bootstrap Program)

### Program Structure
```
programs/
├── bootstrap/          # The Bootstrap Phase logic
│   ├── src/lib.rs      # Entry point & Instructions
│   └── src/state.rs    # Account definitions (Config, Contribution)
├── trading_engine/     # [Planned] Core Perp Engine
└── privacy_layer/      # [Planned] Hooks for Arcium/Privacy Cash
```

## Privacy Implementation Pattern

Due to WASM limitations in browser environments for some ZK libraries, we adopt a **Hybrid Architecture**:

1. **Client-Side:**
   - Handles wallet connection & signing.
   - Uses `lib/privacy-cash.ts` (Mock/Lite version) for UI feedback.
   - Directly interacts with `lib/shadowwire.ts` (Browser compatible).
   
2. **Server-Side (API):**
   - Handles heavy ZK proof generation.
   - Uses `lib/privacy-cash-server.ts` (Node.js version).
   - Generates transactions for client to sign.

3. **Gasless Layer:**
   - **Kora** wraps transactions before signing to delegating gas payment.
