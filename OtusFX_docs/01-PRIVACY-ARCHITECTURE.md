# Privacy Architecture

OtusFX integrates three distinct privacy technologies to create a comprehensive shield for traders and lenders.

## 1. Privacy Cash (Confidential Lending)
**Use Case:** Hiding lender balances and pool solvency proofs.

### Implementation
- **SDK:** `lib/privacy-cash-server.ts` (Server-side real SDK), `lib/privacy-cash.ts` (Client mock)
- **Flow:**
    1. User deposits USDC/USD1/USDT via `depositSPL()`.
    2. SDK generates a ZK commitment inserted into a Merkle tree.
    3. User receives a "note" (private balance).
    4. **Milestones:** We prove total TVL > $100k/$500k using `proveAggregateGte()` without revealing individual deposits.

### Status
- ✅ SDK Integrated
- ✅ Multi-token support
- ✅ API Routes created (`/api/privacy/deposit`, `/milestones`)

## 2. ShadowWire (Private Transfers)
**Use Case:** Private copy trading commissions and hidden user-to-user transfers.

### Implementation
- **SDK:** `@radr/shadowwire` wrapper in `lib/shadowwire.ts`.
- **Flow:**
    1. Lead trader executes a profitable trade.
    2. Copier pays 20% commission.
    3. Payment sent via ShadowWire `transfer({ type: 'internal' })`.
    4. Amount is hidden using Bulletproofs; only sender/receiver know value.

### Status
- ✅ SDK Integrated
- ✅ Supports USDC & USD1 (USDT not supported by SDK)
- ✅ API Route created (`/api/privacy/commission`)

## 3. Arcium (Encrypted Positions & Deleverage Triggers)
**Use Case:** Hiding deleverage trigger prices to prevent liquidation hunting, plus optional position size privacy.

### Implementation *[Active Development]*
- **Technology:** MPC (Multi-Party Computation) via Arcium MXE (Multi-Party eXecution Environments).
- **Primary Use:** **Private Auto-Deleverage System**
    - Deleverage trigger prices encrypted client-side before submission
    - Arcium MXE performs confidential comparison: `encrypted_trigger <= current_price`
    - Returns boolean result without revealing trigger price
    - Prevents whale hunting and stop-loss sniping
- **Flow:**
    1. User opens position with leverage (e.g., 20x EUR/USD)
    2. Calculate deleverage triggers: [50% loss, 65% loss, 75% loss]
    3. Encrypt triggers via Arcium SDK client-side
    4. Store encrypted triggers on-chain in position account
    5. Keepers call `trigger_deleverage()` with tier index
    6. Arcium MXE decrypts, compares with oracle price, returns true/false
    7. If true: execute partial position close
- **Security Model:**
    - Only Arcium MXE nodes can decrypt (distributed trust)
    - Trigger prices never visible to keepers or attackers
    - Only revealed after deleverage execution (via events)

## Privacy Support Matrix

| Feature | Privacy Tech | Visibility | Status |
|---------|--------------|------------|--------|
| **Lending Deposits** | Privacy Cash | Hidden (ZK) | ✅ Ready |
| **TVL Reporting** | Privacy Cash | Aggregated Proofs | ✅ Ready |
| **Commission Pay** | ShadowWire | Hidden (Bulletproofs) | ✅ Ready |
| **Deleverage Triggers** | Arcium MXE | Encrypted (MPC) | 🚧 Active Dev |
| **Position Size** | Arcium | Encrypted (MPC) | ⏳ Phase 4 |
| **Entry Price** | Arcium | Encrypted (MPC) | ⏳ Phase 4 |
