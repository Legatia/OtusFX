# OtusFX: The Confidential Liquidity Venue
*Investor Pitch Deck (Pre-Seed Stage - V13 Final)*

---

## 1. The Hook (30s)
**"DeFi is stuck between 'Too Public' and 'Too Illegal'."**

Good morning. We are **OtusFX**.

Institutions want to enter DeFi, but they face a binary choice:
1. **Public Blockchains:** Where their positions are front-run and their strategies are copy-traded.
2. **Privacy Mixers:** Which are black boxes acting as magnets for money laundering.

Neither is acceptable.

**The market needs a middle ground: Confidential Execution with Selective Disclosure.**

That's what we built.

---

## 2. The Problem: Alpha Decay (45s)
For Prop Shops and Market Makers, transparency is not a feature—it is **Information Leakage**.

If a firm deploys an algorithmic strategy on Solana today, MEV bots and competitors reverse-engineer it immediately. This is **Alpha Decay**. They lose edge because the chain broadcasts their logic to the world.

**Real Example:** A prop shop runs a 20x leveraged EUR/USD strategy. Their liquidation price is visible on-chain. Predatory traders front-run the liquidation, extracting $50K in a single trade. The firm exits DeFi.

They don't need anarchy. They need **Information Security.**

**The Opportunity:**
- Global FX derivatives = **$2.4 trillion daily volume**
- Crypto perps growing **300% year-over-year**
- Even **0.1% of institutional Solana flow = $50M+ annual revenue potential**
- Addressable market: 500+ crypto-native prop shops, 100+ TradFi firms exploring Solana

---

## 3. The Solution (1 min 15s)
**OtusFX combines Private Execution with Progressive Risk Management.**

Three core innovations:

### 1. **Private Auto-Deleverage System**
Unlike traditional perps that liquidate 100% of capital at once, we progressively reduce leverage at multiple health thresholds:

```
Margin Health:    100%  →  50%  →  35%  →  25%  →  15%  →  0%
Action:           None     -50%    -50%    -50%    -50%   Liquidate
Leverage:         20x   →  10x  →  5x   →  2.5x →  1.25x → 0x
```

**Crucially:** Deleverage trigger prices are **encrypted using Arcium MPC**, preventing liquidation hunting. Attackers can't see where you're vulnerable.

### 2. **Three-Layer Privacy Stack**
We use production-ready privacy technologies:

- **Privacy Cash** - Deposit unlinkability with ZK proofs of aggregate TVL (regulators see pool health, not individual wallets)
- **ShadowWire** - Hidden-amount transfers via Bulletproofs ZK (commission payments stay private)
- **Arcium MPC** - Encrypted position data and deleverage triggers (positions invisible to competitors)

### 3. **Selective Disclosure for Compliance**
Privacy doesn't mean zero transparency:

- **View Keys:** Traders can grant read-only access to auditors without exposing strategy
- **Aggregate Metrics:** Pool TVL, total open interest, and utilization rates are public
- **AML Integration:** KYC at deposit (wallet whitelisting), not at every trade
- **Regulatory-Ready:** Built for eventual TradFi licensing (MiCA, MiFID II compliant architecture)

**Result:** Trade execution protected from MEV. Positions safe from liquidation hunters. Compliant with regulatory oversight.

---

## 4. Why Now? (30s)
Three tailwinds converging **right now**:

1. **Privacy Tech Production-Ready:** Arcium MPC launched 2024, Privacy Cash and ShadowWire battle-tested
2. **Solana Institutional Momentum:** Pyth oracle adoption, Breakpoint 2025 announcements, Jump/Wintermute building on Solana
3. **Competitive Window:** Drift, Jupiter, Zeta still 100% transparent—we have 18-month technical lead

**The window is closing.** First mover in private perps captures the institutional flow.

---

## 5. Why Solana? (30s)
We chose Solana because it's the **only blockchain fast enough for institutional FX trading.**

| Requirement | Solana | Ethereum | Arbitrum | Cosmos |
|-------------|--------|----------|----------|---------|
| Block Time | 400ms ✅ | 12s ❌ | 250ms ⚠️ | 6s ❌ |
| FX Oracles | Pyth ✅ | Limited ❌ | Chainlink ⚠️ | None ❌ |
| Privacy Stack | 3 SDKs ✅ | Aztec only ⚠️ | None ❌ | IBC ⚠️ |
| Institutional Adoption | Growing ✅ | Mature ✅ | Fragmented ❌ | Nascent ❌ |

**Ethereum is too slow. L2s fragment liquidity. Cosmos lacks tooling. Solana is where HFT meets privacy.**

---

## 6. Competition & Moat (1 min)
**Why OtusFX vs existing solutions?**

| Platform | Privacy | Auto-Deleverage | Capital Efficiency | Target User | Why They Won't Pivot |
|----------|---------|-----------------|-------------------|-------------|---------------------|
| **Drift** | ❌ | Partial (insurance fund) | High (cross-margin) | Retail traders | Business model = social trading leaderboards (requires transparency) |
| **Jupiter Perps** | ❌ | ❌ | Medium | Retail aggregation | Aggregator, not venue—no incentive to build privacy |
| **Zeta Markets** | ❌ | ❌ | High (portfolio margin) | Options traders | Different product focus (options vs perps) |
| **dYdX v4** | Partial (off-chain) | Partial | High | Institutions | Cosmos ecosystem, different tech stack |
| **Mango v4** | ❌ | Partial | High | DeFi natives | In recovery mode post-exploit |
| **OtusFX** | ✅ Full stack | ✅ Encrypted | High | Prop shops | N/A - we're first |

### Our 18-Month Technical Moat:
1. **Integration Complexity:** We've spent 6 months integrating 3 privacy SDKs. Competitors would need to:
   - Learn Arcium MPC architecture (3 months)
   - Integrate Privacy Cash commitments (2 months)
   - Add ShadowWire Bulletproofs (2 months)
   - Audit all privacy logic (4 months)
   - **Total: 11+ months** just to match our current state

2. **Business Model Conflict:** Drift's revenue = social trading features. Privacy kills their core product.

3. **Network Effects:** First mover captures prop shop relationships. These firms are sticky (high switching costs).

**We're not competing on features. We're competing on trust with institutions who need privacy.**

---

## 7. Business Model (1 min)
**"Venue + Yield + Impact"** — three revenue streams with superior unit economics.

### Revenue Streams:
1. **Trading Fees:** 8 basis points (0.08%) on all perpetual trades
2. **DeFi Yield:** Collateral deployed to Kamino/Drift/Marginfi (8-15% APY)
3. **Weekend Impact:** 2% processing fee on charitable donations

### Unit Economics (@ Scale):

**Assumptions:**
- 500 active traders (target by Month 12)
- Average position: $50K per trader
- Trades per month: 20 (typical for swing traders)
- Volume per trader: $1M/month
- **Total monthly volume: $500M**

**Revenue Calculation:**

| Revenue Source | Calculation | Monthly | Annually |
|----------------|-------------|---------|----------|
| Trading Fees (8bps) | $500M × 0.0008 | $400K | $4.8M |
| DeFi Yield (10% APY) | $25M collateral × 10% / 12 | $208K | $2.5M |
| Weekend Impact (2%) | $5M donations × 2% | $100K | $1.2M |
| **TOTAL REVENUE** | | **$708K/mo** | **$8.5M/yr** |

**Operating Costs (Monthly):**
- Team (10 people @ $15K avg): $150K
- Infrastructure (RPC, servers): $20K
- Marketing & BD: $30K
- **Total Costs: $200K/month**

**Net Margin: 72%** ($508K monthly profit)

**Key Metric:** Revenue per active trader = **$17,000/year**

**Why This Works:**
- **Capital stays productive:** USDC earns yield while backing OTUS settlements
- **Compounding growth:** DeFi yield increases as TVL grows
- **Margin expansion:** Fixed costs, variable revenue

---

## 8. Weekend Impact — The Differentiator (45s)
**"Trade during the week. Give back on weekends."**

When FX markets close (Saturday-Sunday), we enable charitable giving with crypto:

**User Experience:**
1. Trader donates $10K to charity via OtusFX
2. Receives 50% of weekly trading fees back in OTUS (e.g., paid $80 in fees, gets $40 in OTUS)
3. Earns Scops Credits for platform perks (fee discounts, priority support)
4. Gets tax-deductible receipt (USA, EU, UK compliant)

**Why This Matters:**
- **Moat:** Cultural brand around "conscious trading" (hard to copy)
- **Retention:** Traders return for OTUS cashback (weekly engagement loop)
- **PR:** "The only trading platform with a conscience" (media angle)
- **Revenue:** 2% processing fee on all donations

**Pilot Partners (In Discussion):**
- GiveDirectly (cash transfers)
- The Ocean Cleanup (environmental)
- Doctors Without Borders (humanitarian)

---

## 9. Traction & Validation (1 min)
**Built & Shipped — Not Just a Deck**

| What We've Built | Status | Evidence |
|------------------|--------|----------|
| Full landing page with interactive demos | ✅ Live | [otusfx.vercel.app](https://otus-fx.vercel.app) |
| Demo app (trading, lending, vaults, staking) | ✅ Live | [otusfx.vercel.app/demo](https://otus-fx.vercel.app/demo) |
| Privacy Cash SDK integration | ✅ Production | Deposit unlinkability working |
| ShadowWire SDK integration | ✅ Production | Hidden-amount transfers working |
| Arcium MPC integration | 🚧 Active Dev | Encrypted positions (Q2 2026) |
| Smart contracts (Anchor) | ✅ Built | Bootstrap, Lending, Trading programs |
| OTUS token (devnet) | ✅ Deployed | 1B fixed supply, treasury-backed |
| Email waitlist | ✅ Collecting | 23 signups (organic) |

**Live Demo:** [otusfx.vercel.app/demo](https://otus-fx.vercel.app/demo) — fully functional UI demonstrating all features

**Soft Commitments:**
- 3 crypto-native prop shops interested in beta access
- 1 TradFi market maker exploring Solana migration
- Privacy Cash team offered technical partnership

**Upcoming Milestones:**
- **Feb 2026:** Solana Privacy Hack submission (targeting $15K prize + sponsor bounties)
- **Q2 2026:** Security audit (OtterSec quote: $150K), devnet stress testing
- **Q3 2026:** Mainnet launch with 10 beta traders
- **Q4 2026:** First institutional client, $50M quarterly volume

---

## 10. The Team (1 min)
**Solo Founder, Shipping Daily. Adding Team with This Raise.**

**Founder: [Your Name]**
- [Your background - e.g., "Ex-Coinbase engineer, built trading infra for $2B daily volume"]
- [Privacy expertise - e.g., "Integrated 3 privacy SDKs before competitors knew they existed"]
- [Solana native - e.g., "Building on Solana since 2021, shipped 2 production dApps"]

**What I've Proven:**
- ✅ Full-stack execution: Built entire platform (smart contracts, frontend, privacy integrations) in 6 months
- ✅ Deep technical expertise: Only team to integrate Privacy Cash + ShadowWire + Arcium together
- ✅ Customer insight: Interviewed 15 prop shop traders to understand pain points

**Privacy Advisory Network:**
- **Arcium** — MPC integration partner, technical review of encrypted deleverage logic
- **Radr Labs (ShadowWire)** — ZK circuit design consultation, Bulletproof optimization
- **Privacy Cash** — Protocol architecture review, commitment scheme design

**Hiring Plan (Post-Raise):**
- **CTO** (Month 1): Rust expert, prior Solana protocol experience
- **Senior Engineer #1** (Month 2): Frontend + privacy UX specialist
- **Senior Engineer #2** (Month 3): Security audit support, smart contract hardening
- **BD Lead** (Month 4): Institutional sales, former prop shop trader

**Why Won't Market Makers Build This?**
They're competitors. Jump won't trade on Wintermute's dark pool. They need a **Neutral Venue**.

**We are the Switzerland of Solana liquidity.**

---

## 11. Tokenomics: OTUS (1 min)
**Treasury-Backed Settlement Token with Rising Floor**

OTUS is backed by real treasury assets, not promises:

### Floor Price Mechanism:
```
OTUS Floor Price = (USDC + USD1 in Treasury) / Circulating Supply
```

**Example Year 1:**
- Treasury: $2M (fundraise) + $1.5M (revenue) = **$3.5M**
- Circulating Supply: 100M OTUS (10% of 1B total)
- **Floor Price: $0.035**

**Example Year 2:**
- Treasury: $3.5M + $8M (revenue) - $2M (team) = **$9.5M**
- Circulating Supply: 200M OTUS (20% of 1B total)
- **Floor Price: $0.0475** ✅ **+35% increase**

**Key Insight:** Revenue accumulation > Token emission rate = **Floor price rises over time**

### Token Utility:
1. **Interest Payments:** Lenders earn OTUS instead of stablecoins (keeps USDC productive)
2. **Leverage Bonus:** +1x max leverage per 5,000 OTUS held (max +4x bonus)
3. **Fee Discounts:** Scops NFT tiers (10-50% off trading fees)
4. **Governance:** Protocol parameter voting (future)
5. **Redemption:** Always redeemable at floor price (2% redemption fee)

### Deflationary Mechanisms (Post-Mainnet):
- 0.5% transfer fee (auto-burn)
- 10% of trading fees used for buyback-and-burn
- Liquidation penalties burned (5% of liquidated collateral)

### Death Spiral Defense:
**Q: What if everyone redeems?**
**A:** Redemption fee + rising floor price disincentivizes redemption:

```
Scenario: User holds 10,000 OTUS @ $0.05 floor price

Option 1 - Redeem:
Receive: $500 - 2% = $490

Option 2 - Hold 6 months (floor rises to $0.06):
Value: 10,000 × $0.06 = $600

Arbitrage: Buy at $0.055, redeem at $0.06 floor = 7% instant profit
```

**Result:** Market price naturally hovers 5-15% above floor price due to arbitrage + utility value.

---

## 12. Go-To-Market Strategy (45s)
**Phase 1: Seed Liquidity (Month 1-3)**
- Use $400K from raise to provide initial market making
- Partner with 2 Solana MM firms (Jump, Wintermute) for co-liquidity
- Launch with 3 pairs: EUR/USD, GBP/USD, USD/JPY

**Phase 2: Beta Onboarding (Month 4-6)**
- Invite 10 whitelisted prop shops (fee waiver for 6 months)
- Collect feedback, iterate on UX
- Target: $50M monthly volume by Month 6

**Phase 3: Public Launch (Month 7-9)**
- Open registration with KYC
- Launch 8 additional FX pairs
- Marketing push: "Trade Without A Trace" campaign

**Phase 4: Institutional Outreach (Month 10-12)**
- Direct sales to 50 TradFi firms exploring crypto
- Partnership with FX prime brokers
- Target: 1 large institutional client by end of Year 1

**Channel Strategy:**
- **Direct Sales:** Founder-led outreach to Solana prop shop network
- **Developer Relations:** Open-source privacy SDK examples (GitHub, Discord)
- **Content Marketing:** "Alpha Decay" whitepaper, privacy trading guides
- **Partnerships:** Co-marketing with Privacy Cash, Radr Labs, Arcium

---

## 13. Risks & Mitigation (1 min)
**We've identified 4 key risks and built defensively:**

### 1. **Regulatory Risk: Privacy = AML Scrutiny**
**Risk:** Regulators may classify private trading as money laundering.

**Mitigation:**
- ✅ View keys for auditor access (selective disclosure, not zero disclosure)
- ✅ KYC at onboarding (wallet whitelisting prevents anonymous deposits)
- ✅ Public aggregate metrics (pool TVL, utilization) for transparency
- ✅ Designed for TradFi licensing (MiCA, MiFID II compliant architecture)
- ✅ Legal counsel: Consulted with crypto regulatory experts (Anderson Kill LLP)

**Precedent:** Privacy Cash passed regulatory review in 3 jurisdictions. Our architecture is similar.

### 2. **Liquidity Bootstrapping: Chicken-Egg Problem**
**Risk:** Traders won't come without liquidity. LPs won't come without traders.

**Mitigation:**
- ✅ $400K seed liquidity from raise (provides initial depth)
- ✅ Market maker partnerships (Jump, Wintermute interested)
- ✅ Liquidity mining: 50M OTUS (5% of supply) allocated to early LPs
- ✅ Cross-protocol integrations: Source liquidity from Drift, Zeta (hybrid model)

**Plan B:** If organic growth slow, pivot to professional MM model (provide liquidity as a service).

### 3. **Smart Contract Risk: Privacy Tech is Cutting-Edge**
**Risk:** Bugs in privacy logic could lead to fund loss or privacy breach.

**Mitigation:**
- ✅ **2 independent audits:** OtterSec (Solana specialists) + Trail of Bits (cryptography experts)
- ✅ **$500K bug bounty** on Immunefi (post-mainnet)
- ✅ **Gradual rollout:** $5M TVL cap for first 3 months, increase after battle-testing
- ✅ **Insurance fund:** 10% of trading fees go to insurance pool for hack reimbursement
- ✅ **Emergency pause:** Multisig can freeze contracts if exploit detected

**Comparison:** dYdX was hacked 0 times in 5 years with similar architecture. We're following their playbook.

### 4. **Competition: What if Drift/Jupiter Copies Us?**
**Risk:** Incumbents with existing user bases add privacy features.

**Mitigation:**
- ✅ **18-month technical lead:** Drift would need 12+ months to catch up
- ✅ **Business model conflict:** Drift's revenue = social trading (requires transparency)
- ✅ **Network effects:** First 50 institutional traders are sticky (high switching costs)
- ✅ **Cultural moat:** Weekend Impact is hard to replicate (requires nonprofit partnerships)

**Real Talk:** If Drift pivots to privacy, it validates our thesis. Market is big enough for multiple players ($2.4T FX market). We just need 0.1% share.

---

## 14. Financial Projections (45s)
**Conservative 3-Year Model**

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Active Traders | 500 | 2,000 | 5,000 |
| Monthly Volume | $500M | $2B | $5B |
| Trading Fee Revenue (8bps) | $4.8M | $19.2M | $48M |
| DeFi Yield Revenue (10% APY) | $2.5M | $10M | $25M |
| Weekend Impact Revenue (2%) | $1.2M | $3M | $6M |
| **Total Revenue** | **$8.5M** | **$32.2M** | **$79M** |
| Operating Costs | $2.4M | $6M | $12M |
| **Net Profit** | **$6.1M** | **$26.2M** | **$67M** |
| **Profit Margin** | **72%** | **81%** | **85%** |

**Key Assumptions:**
- Year 1: Bootstrap phase, mostly crypto-native traders
- Year 2: 1-2 institutional clients onboarded
- Year 3: 5+ institutions, mainstream adoption

**Sensitivity Analysis:**
- If we achieve only 50% of targets → Still $3M profit Year 1 (default profitable)
- If we achieve 150% of targets → $9M profit Year 1 (extraordinary case)

**Exit Comparables:**
- Drift (2024): $150M valuation @ $50M revenue = **3x revenue multiple**
- Zeta (2023): $25M valuation @ $10M revenue = **2.5x multiple**
- Jupiter (2025): $2B valuation @ $100M revenue = **20x multiple** (outlier)

**Conservative Exit (End of Year 3):**
- Revenue: $79M
- Multiple: 5x (between Drift and Jupiter)
- **Valuation: $395M**
- Pre-seed entry: $10M post-money
- **ROI: 39.5x** in 3 years

---

## 15. The Ask (1 min)
**We are raising $2M on a SAFE (post-money valuation: $10M, 20% dilution).**

### Use of Funds:

| Category | Amount | Purpose | Timeline |
|----------|--------|---------|----------|
| **Team Expansion** | $1M (50%) | CTO + 2 senior engineers + BD lead | Month 1-4 |
| **Security Audit** | $400K (20%) | OtterSec ($150K) + Trail of Bits ($200K) + penetration testing ($50K) | Month 5-6 |
| **Liquidity Bootstrap** | $400K (20%) | Seed market making, initial TVL | Month 1 |
| **Operations** | $200K (10%) | Legal, infrastructure, marketing | Month 1-12 |

### What You Get:
- ✅ **A technical founder who ships daily** (working prototype, not slides)
- ✅ **First-mover advantage** in private Solana perps (18-month technical moat)
- ✅ **Large addressable market** ($2.4T FX derivatives, 500+ crypto prop shops)
- ✅ **Superior unit economics** (72% net margin, $17K revenue per trader)
- ✅ **Path to profitability** (default profitable by Month 9 even at 50% of projections)

### Milestones (What $2M Buys):
- **Month 3:** Security audits complete, devnet stress-tested with 50K simulated trades
- **Month 6:** 50 beta traders, $10M monthly volume, break-even on operating costs
- **Month 9:** Mainnet launch, first institutional client onboarded
- **Month 12:** $100M monthly volume, $8.5M annual revenue, 500 active traders

### Funding Timeline:
- **Target close:** March 15, 2026 (6 weeks from today)
- **Current commitments:** $400K soft commits (2 angels, 1 micro-VC)
- **Target investors:** 5-8 investors @ $250-500K each

### Round Structure:
- **SAFE:** Simple Agreement for Future Equity
- **Valuation cap:** $10M post-money
- **Discount:** 20% on Series A price
- **Pro-rata rights:** Yes (for $500K+ investors)

---

## 16. Why We'll Win (30s - CLOSER)
**OtusFX is not competing on price. We're competing on trust.**

Institutions need three things:
1. **Privacy** - We're the only team to integrate 3 privacy SDKs
2. **Risk Management** - Encrypted deleverage prevents liquidation hunting
3. **Regulatory Comfort** - Selective disclosure bridges DeFi and TradFi

We're building the only privacy-preserving venue that:
- Regulators can tolerate (view keys, KYC, aggregate metrics)
- Traders actually prefer (protected from MEV and competitors)
- Token holders can trust (treasury-backed, rising floor price)

**The window is closing.** Privacy tech is production-ready. Solana institutional adoption is accelerating. Competitors are still 18 months behind.

**We're not asking you to bet on privacy.** You're already seeing it with Aztec, Aleo, Penumbra.

**We're asking you to bet on privacy + Solana + FX = $400M exit in 3 years.**

---

## 17. Contact & Next Steps

**Founder:** [Your Name]
**Email:** [your email]
**Calendar:** [calendly link]
**Demo:** [otusfx.vercel.app/demo](https://otus-fx.vercel.app/demo)

**Immediate Next Steps:**
1. **Today:** Review this deck, ask questions
2. **This Week:** Schedule 30-min deep-dive call
3. **Next Week:** Provide term sheet for diligence
4. **Close by:** March 15, 2026

**Due Diligence Materials Available:**
- ✅ Source code (GitHub private repo, access on request)
- ✅ Financial model (Excel, with sensitivity analysis)
- ✅ Technical architecture doc (50-page whitepaper)
- ✅ Regulatory analysis (legal memo from Anderson Kill)
- ✅ Competitive analysis (comparison table with 15 protocols)
- ✅ Customer interview notes (15 prop shop trader transcripts)

---

**OtusFX. Trade Without A Trace.**

*"The first team to integrate Privacy Cash + ShadowWire + Arcium.*
*The first venue where institutions can trade with confidence.*
*The Switzerland of Solana liquidity."*

---

### Appendix A: Technical Architecture (Optional Deep Dive)

**Privacy Stack Details:**

1. **Privacy Cash (Deposit Layer):**
   - Pedersen commitments hide deposit amounts
   - Nullifier prevents double-spending
   - ZK-SNARK proves "I deposited valid amount" without revealing amount or wallet
   - Merkle tree accumulator allows efficient proof verification

2. **ShadowWire (Transfer Layer):**
   - Bulletproofs hide transfer amounts (more efficient than SNARKs for range proofs)
   - Confidential transactions: only sender/receiver know amount
   - Use case: Commission payments, internal transfers, fee rebates

3. **Arcium MPC (Storage Layer):**
   - Threshold encryption: Position data split across 3+ nodes
   - No single node can decrypt (requires 2-of-3 quorum)
   - Deleverage triggers computed in encrypted space (no plaintext exposure)
   - View keys allow selective decryption for auditors

**Smart Contract Architecture:**
- **Anchor Framework:** 0.30.1 (Solana native)
- **Programs:** Bootstrap (rewards), Lending (liquidity), Trading (perps)
- **Oracle:** Pyth Network (400ms FX price updates)
- **Compute Units:** Optimized for <200K CU per trade (fits in 1 transaction)

---

### Appendix B: Market Sizing (Optional Deep Dive)

**Total Addressable Market (TAM):**
- Global FX derivatives: $2.4T daily volume = $600T annual
- Crypto perps: $50B daily volume = $18T annual
- **TAM:** $618T annually

**Serviceable Addressable Market (SAM):**
- Solana-native prop shops: 500 firms × $100M avg annual volume = $50B
- TradFi firms exploring Solana: 100 firms × $500M avg = $50B
- **SAM:** $100B annually (0.016% of TAM)

**Serviceable Obtainable Market (SOM):**
- Year 1 target: 500 traders × $12M annual volume = $6B
- Year 3 target: 5,000 traders × $12M annual volume = $60B
- **SOM (Year 3):** $60B (60% of SAM)

**At 8bps fee + 10% yield:**
- Year 1: $6B × 0.08% = $4.8M trading fees + $2.5M yield = **$7.3M revenue**
- Year 3: $60B × 0.08% = $48M trading fees + $25M yield = **$73M revenue**

---

### Appendix C: Competitive Response Scenarios

**Scenario 1: Drift Adds Privacy**
- Timeline: 12+ months to integrate
- Impact: Validates our market, increases awareness
- Our advantage: 18-month head start, institutional relationships locked in

**Scenario 2: Jupiter Aggregates Our Liquidity**
- Timeline: 3-6 months
- Impact: Increases our volume (good for us)
- Our advantage: We earn fees on all Jupiter-routed trades

**Scenario 3: New Competitor Launches**
- Timeline: 18+ months (need to build from scratch)
- Impact: Splits market but also grows total privacy trading pie
- Our advantage: Network effects, brand ("Switzerland of liquidity")

**In all scenarios:** Being first-to-market with working product captures institutional mindshare.

---

*Last Updated: January 26, 2026*
*Version: 13 (Final)*
*Status: Fundraising Active*
