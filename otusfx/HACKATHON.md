# OtusFX - Solana Privacy Hack Submission

## 🔒 Privacy-First Leveraged FX Trading

OtusFX is the **first truly private leveraged trading platform** on Solana, combining privacy-preserving technologies with FX markets to enable confidential trading at scale.

---

## 🎯 Hackathon Track

**Private Payments** - Building innovative solutions for confidential transfers on Solana

---

## 🏆 Why We're Different

Most DeFi protocols expose your entire trading history on-chain. OtusFX breaks this pattern using **multiple layers of privacy**:

1. **Privacy Cash** - Deposit unlinkability (your wallet address is hidden from deposits)
2. **ShadowWire** - Hidden-amount transfers using Bulletproofs ZK
3. **Arcium** (Roadmap) - Encrypted position storage via MPC

---

## 🛠️ Built With (Sponsor Technologies)

### Core Privacy Stack
- 🔐 **Privacy Cash** - Deposit/withdraw unlinkability breaking wallet-to-action correlation
- 🌙 **ShadowWire (Radr Labs)** - Bulletproof zero-knowledge proofs for hidden-amount transfers
- 🔮 **Arcium** - MPC encrypted storage for position data (roadmap integration)

### Solana Ecosystem
- ⚡ **Solana** - High-performance blockchain with 400ms slots
- 📊 **Pyth Network** - Real-time FX price oracles (EUR/USD, GBP/USD, etc.)
- ⚙️ **Anchor 0.30.1** - Solana smart contract framework

### Token Standards
- 🪙 **SPL Token** - OTUS utility token (1B fixed supply, devnet deployed)
- 💵 **USDC/USD1** - Dual stablecoin support for margin deposits

---

## 🎥 Demo Video

**[3-Minute Demo Video]** - https://youtube.com/[YOUR_VIDEO_ID]

**Walkthrough:**
1. **00:00-00:20** - Problem: FX trading lacks privacy
2. **00:20-01:00** - Solution: OtusFX privacy architecture
3. **01:00-02:20** - Live Demo:
   - Private deposit via Privacy Cash (wallet unlinkability)
   - Hidden-amount trading via ShadowWire
   - Position management with privacy guarantees
   - OTUS rewards distribution
4. **02:20-02:45** - Technical innovation & architecture
5. **02:45-03:00** - Impact & future vision

---

## 🔐 Privacy Guarantees

### What's Private:
✅ **Deposit source** - Privacy Cash breaks wallet-to-deposit link
✅ **Transfer amounts** - ShadowWire hides transaction values
✅ **Position sizes** - Encrypted storage (Arcium roadmap)
✅ **Trading patterns** - No on-chain correlation between actions

### What's Public:
❌ Position outcomes (PnL) - Required for settlement
❌ Liquidation events - Required for keeper network
❌ Pool TVL - Necessary for protocol health

### Threat Model:
- **Protected against:** Chain analysts, MEV bots, competitor tracking
- **Not protected against:** Your own wallet provider seeing signed txs
- **Trade-off:** Privacy vs capital efficiency (we optimize for privacy)

---

## 📐 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER WALLET                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ├─────────────────────────────────┐
                            │                                 │
                    ┌───────▼──────────┐          ┌──────────▼─────────┐
                    │  Privacy Cash    │          │    ShadowWire      │
                    │  (Deposit Pool)  │          │  (Transfer Layer)  │
                    │                  │          │                    │
                    │  • Commitment    │          │  • Bulletproofs    │
                    │  • Nullifier     │          │  • Hidden amounts  │
                    │  • Unlinkability │          │  • ZK proofs       │
                    └──────────┬───────┘          └──────────┬─────────┘
                               │                             │
                               └─────────┬───────────────────┘
                                         │
                           ┌─────────────▼──────────────┐
                           │   OtusFX Smart Contracts   │
                           │                            │
                           │  • Bootstrap Pool          │
                           │  • Lending Pool            │
                           │  • Trading Engine          │
                           │                            │
                           │  ┌──────────────────────┐  │
                           │  │  Pyth Oracle (Prices)│  │
                           │  └──────────────────────┘  │
                           │                            │
                           │  ┌──────────────────────┐  │
                           │  │  OTUS Tokenomics     │  │
                           │  │  (Interest + Rewards)│  │
                           │  └──────────────────────┘  │
                           └────────────────────────────┘
```

---

## 🚀 Quick Start (Devnet Testing)

### Prerequisites
```bash
# Install dependencies
npm install -g @coral-xyz/anchor-cli@0.30.1
npm install -g solana@1.18.0

# Configure Solana CLI
solana config set --url https://api.devnet.solana.com
```

### 1. Get Devnet SOL
```bash
solana airdrop 2
```

### 2. Get Test Tokens
```bash
# Request devnet USDC from faucet
# Devnet USDC: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU

# Get devnet USD1 (test token)
# Devnet USD1: 2yyHi6Q84oyjmAcMqP9UfuCmftzSjbFpXxTDRUZN9GFi
```

### 3. Launch Frontend
```bash
cd web
npm install
npm run dev
```

### 4. Test Privacy Flows

#### Private Lending
```bash
# 1. Navigate to /app/lend
# 2. Toggle Privacy Mode ON (default)
# 3. Deposit 100 USDC
#    - ✅ Privacy Cash breaks wallet link
#    - ✅ Your identity is hidden from the lending pool
# 4. Earn OTUS interest
# 5. Withdraw privately
#    - ✅ Withdrawal destination unlinkable
```

#### Private Trading
```bash
# 1. Navigate to /app/trade
# 2. Open EUR/USD long position
#    - ✅ Margin deposit via Privacy Cash
#    - ✅ Position size hidden via ShadowWire
# 3. Close position
#    - ✅ PnL settlement with privacy preserved
```

---

## 📊 Key Metrics

- **Privacy Layers**: 2 fully integrated (Privacy Cash + ShadowWire)
- **Supported Assets**: 11 FX pairs (EUR/USD, GBP/USD, USD/JPY, etc.)
- **Leverage**: Up to 25x (dynamic based on OTUS holdings)
- **Tokenomics**: 1B OTUS fixed supply (deflationary)
- **Devnet Deployed**: ✅ All programs deployed and functional

---

## 🎓 Innovation Highlights

### 1. **Multi-Layer Privacy**
First protocol to combine deposit unlinkability (Privacy Cash) with hidden-amount transfers (ShadowWire) for comprehensive privacy.

### 2. **FX Market Privacy**
Bringing privacy to the world's largest market ($7.5T daily volume) - first privacy-focused FX DEX.

### 3. **OTUS Tokenomics**
Treasury-backed token with floor price, used for interest payments and leverage bonuses.

### 4. **Dual Stablecoin Support**
Accept both USDC and USD1, giving users flexibility and reducing single-point-of-failure risk.

### 5. **Privacy-First UX**
Privacy mode is **default ON** - users opt-out of privacy rather than opt-in.

---

## 🗺️ Roadmap

### ✅ Phase 1: MVP (Current)
- [x] Privacy Cash integration
- [x] ShadowWire integration
- [x] Bootstrap pool with OTUS rewards
- [x] Lending pool with OTUS interest
- [x] Trading engine with 11 FX pairs
- [x] OTUS token deployed (devnet)

### 🔄 Phase 2: Arcium Integration (Next 2 weeks)
- [ ] Encrypted position storage via MPC
- [ ] Private PnL calculations
- [ ] Hidden liquidation logic
- [ ] Full three-layer privacy stack

### 🔮 Phase 3: Mainnet Launch (Q2 2026)
- [ ] Security audits (OtterSec + Trail of Bits)
- [ ] Bug bounty program (Immunefi)
- [ ] Mainnet deployment
- [ ] Liquidity mining campaign

### 🌟 Phase 4: Advanced Features (Q3 2026)
- [ ] Copy trading vaults with private performance
- [ ] Credits system (soul-bound engagement tokens)
- [ ] Scops NFT badges with fee discounts
- [ ] Cross-chain privacy bridges

---

## 📄 Documentation

- **[README.md](README.md)** - General overview
- **[PRIVACY.md](PRIVACY.md)** - Detailed privacy threat model
- **[OTUS_TOKENOMICS.md](OTUS_TOKENOMICS.md)** - Token economics
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - Technical architecture
- **[API.md](web/API.md)** - Frontend hook documentation

---

## 🤝 Team

**Solo Builder** - @[YOUR_GITHUB] (for hackathon)
**Background**: [Your background - eg: ex-Coinbase engineer, Solana dev since 2021]

---

## 🔗 Links

- **GitHub**: https://github.com/[YOUR_USERNAME]/otusfx
- **Demo**: https://otusfx.vercel.app (devnet)
- **Twitter**: @[YOUR_TWITTER]
- **Discord**: [Your Discord invite]

---

## 🙏 Acknowledgments

Special thanks to:
- **Privacy Cash** team for deposit unlinkability SDK
- **Radr Labs** (ShadowWire) for Bulletproof hidden-amount transfers
- **Arcium** for MPC encrypted storage (roadmap)
- **Pyth Network** for real-time FX oracles
- **Solana Foundation** for devnet infrastructure
- **Helius** for RPC support

---

## 📜 License

MIT License - see [LICENSE](LICENSE)

---

## 🏅 Hackathon Bounties Applied For

1. **Main Track**: Private Payments ($15,000)
2. **Privacy Cash Bounty**: Best integration of Privacy Cash SDK
3. **Radr Labs Bounty**: Best use of ShadowWire
4. **Arcium Bounty**: MPC encrypted storage (roadmap integration)

**Total Potential**: $15k+ in prizes

---

**Built for Solana Privacy Hack** | January 2026
**Submission Date**: February 1, 2026
**Category**: Private Payments

---

## 🚨 Important Notes

- **Devnet Only**: This is a testnet deployment for hackathon demonstration
- **No Real Value**: Devnet tokens have no monetary value
- **Educational**: For hackathon and educational purposes only
- **Not Audited**: Smart contracts have NOT been audited - do not use with real funds

---

## 🎬 Video Transcript (for reference)

> "Forex trading is a $7.5 trillion daily market, but it lacks privacy. Every trade, every position, every liquidation - all visible on-chain.
>
> OtusFX changes this with three layers of privacy:
>
> Layer 1: Privacy Cash breaks the link between your wallet and your deposits. No one can trace funds back to you.
>
> Layer 2: ShadowWire uses Bulletproofs to hide transaction amounts. Your position sizes remain private.
>
> Layer 3 (Roadmap): Arcium MPC encrypts position data, making even your trading strategy invisible.
>
> Watch as I deposit 100 USDC privately, open a leveraged EUR/USD position with hidden size, and earn OTUS rewards - all while maintaining complete privacy.
>
> OtusFX: Privacy-first leverage trading on Solana. Built with Privacy Cash, ShadowWire, and Arcium."

---

**Thank you to the judges and sponsors for this opportunity!** 🙏
