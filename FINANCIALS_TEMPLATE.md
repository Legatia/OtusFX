# OtusFX Financial Model Template

## Key Assumptions (Base Case)

### User Growth
| Metric | Month 1 | Month 6 | Month 12 | Year 2 | Year 3 |
|--------|---------|---------|----------|--------|--------|
| Active Traders | 10 | 50 | 500 | 2,000 | 7,500 |
| Monthly Growth Rate | - | 35% | 25% | 15% | 12% |
| Churn Rate | 5% | 5% | 5% | 5% | 5% |

### Trading Volume (per trader)
| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Avg Monthly Volume | $1M | $1.2M | $1.5M |
| Avg Leverage | 10x | 12x | 15x |
| Trades per Month | 20 | 25 | 30 |

---

## Revenue Model

### Revenue Stream 1: Trading Fees (8 bps)
```
Monthly Revenue = Monthly Volume × 0.0008
Year 1 Example: $500M × 0.0008 = $400K
```

### Revenue Stream 2: DeFi Yield (10% APY on idle collateral)
```
Avg Collateral per Trader = Monthly Volume / Avg Leverage
Avg Collateral = $1M / 10x = $100K
Total Collateral (500 traders) = $50M
Annual Yield Revenue = $50M × 10% = $5M
Monthly Yield Revenue = $5M / 12 = $416K
```

### Revenue Stream 3: Weekend Impact (2% fee on donations)
```
Participation Rate: 10% of traders
Avg Donation per Month: $500
Monthly Donations = 500 × 10% × $500 = $25K
Fee Revenue (2%) = $25K × 0.02 = $500
```

### Combined Monthly Revenue @ 500 Traders
| Stream | Monthly $ |
|--------|-----------|
| Trading Fees | $400K |
| DeFi Yield | $416K |
| Weekend Impact | $0.5K |
| **TOTAL** | **$816.5K** |

---

## Cost Structure

### Fixed Costs (Monthly)
| Category | Month 1-6 | Month 7-12 | Year 2+ |
|----------|-----------|------------|---------|
| Team Salaries | $0 | $120K | $150K |
| Infrastructure (RPC, servers) | $5K | $10K | $20K |
| Marketing | $0 | $10K | $30K |
| Legal/Compliance | $2K | $5K | $10K |
| Software/Tools | $1K | $2K | $5K |
| **TOTAL** | **$8K** | **$147K** | **$215K** |

### Variable Costs (% of Revenue)
| Category | Rate |
|----------|------|
| Oracle Fees (Pyth) | 0.1% of volume |
| Gas Fees | $0.02 per tx |
| Customer Support | 5% of revenue |

---

## Unit Economics

### Cost to Acquire Customer (CAC)
```
Marketing Spend: $10K/month (Year 1 avg)
New Traders: 40/month
CAC = $10K / 40 = $250
```

### Lifetime Value (LTV)
```
Monthly Revenue per Trader: $1,632
Avg Customer Lifetime: 18 months
Churn Rate: 5% monthly
LTV = $1,632 × 18 = $29,376
```

### LTV:CAC Ratio
```
$29,376 / $250 = 117:1 ✅ (Excellent, target is 3:1)
```

### Months to Recover CAC
```
$250 / $1,632 = 0.15 months ✅ (Payback in ~4 days)
```

---

## 3-Year Projections (Base Case)

### Year 1
| Quarter | Traders | Monthly Vol | Revenue | Costs | Profit | Margin |
|---------|---------|-------------|---------|-------|--------|--------|
| Q1 | 30 | $30M | $49K | $24K | $25K | 51% |
| Q2 | 80 | $80M | $131K | $72K | $59K | 45% |
| Q3 | 200 | $200M | $327K | $180K | $147K | 45% |
| Q4 | 500 | $500M | $817K | $441K | $376K | 46% |
| **TOTAL** | - | - | **$8.5M** | **$2.4M** | **$6.1M** | **72%** |

### Year 2
| Quarter | Traders | Monthly Vol | Revenue | Costs | Profit | Margin |
|---------|---------|-------------|---------|-------|--------|--------|
| Q1 | 800 | $960M | $1.57M | $645K | $925K | 59% |
| Q2 | 1,200 | $1.44B | $2.35M | $775K | $1.58M | 67% |
| Q3 | 1,800 | $2.16B | $3.53M | $900K | $2.63M | 75% |
| Q4 | 2,500 | $3.0B | $4.90M | $1.05M | $3.85M | 79% |
| **TOTAL** | - | - | **$38.2M** | **$10.2M** | **$28M** | **73%** |

### Year 3
| Quarter | Traders | Monthly Vol | Revenue | Costs | Profit | Margin |
|---------|---------|-------------|---------|-------|--------|--------|
| Q1 | 3,500 | $5.25B | $8.58M | $1.3M | $7.28M | 85% |
| Q2 | 5,000 | $7.5B | $12.25M | $1.5M | $10.75M | 88% |
| Q3 | 6,500 | $9.75B | $15.93M | $1.7M | $14.23M | 89% |
| Q4 | 8,000 | $12B | $19.60M | $1.9M | $17.70M | 90% |
| **TOTAL** | - | - | **$79.2M** | **$11.8M** | **$67.4M** | **85%** |

---

## Sensitivity Analysis

### Best Case (30% higher growth)
| Year | Revenue | Profit | Margin |
|------|---------|--------|--------|
| 1 | $11M | $8M | 73% |
| 2 | $50M | $38M | 76% |
| 3 | $103M | $88M | 85% |

### Worst Case (30% lower growth)
| Year | Revenue | Profit | Margin |
|------|---------|--------|--------|
| 1 | $6M | $4.3M | 72% |
| 2 | $27M | $19.6M | 73% |
| 3 | $55M | $47M | 85% |

---

## Use of Funds ($2M Raise)

### Year 1 Deployment
| Category | Amount | % | Purpose |
|----------|--------|---|---------|
| **Engineering** | $1M | 50% | CTO + 2 senior engineers (18 months runway) |
| **Security** | $400K | 20% | OtterSec audit ($150K) + Trail of Bits ($150K) + Bug bounty ($100K) |
| **Liquidity** | $400K | 20% | Bootstrap pool seed + market making |
| **Operations** | $200K | 10% | Legal, marketing, infrastructure |
| **TOTAL** | **$2M** | **100%** | - |

### Burn Rate & Runway
```
Monthly Burn (with team): $147K
Total Funding: $2M
Runway: 13.6 months
Break-even: Month 6 (500 traders, $817K revenue)
Revenue at Month 13: $2.5M+ (sustainable)
```

---

## Valuation Scenarios

### Pre-Money Valuation Logic
```
Year 3 Profit: $67M
Exit Multiple (conservative): 5x EBITDA
Exit Valuation: $67M × 5 = $335M

Investor Ownership: 20% (post-money $10M)
Investor Exit Value: $335M × 20% = $67M
ROI: $67M / $2M = 33.5x (3 years)
```

### Comparable Valuations
| Company | Revenue | Valuation | Multiple |
|---------|---------|-----------|----------|
| Drift | $50M | $150M | 3x |
| Jupiter | $100M | $2B | 20x |
| dYdX | $80M | $500M | 6.25x |
| **OtusFX (Y3)** | **$79M** | **$395M** | **5x** |

### Discount to Comparables
```
Average Multiple: (3x + 20x + 6.25x) / 3 = 9.75x
OtusFX Y3 @ 9.75x = $79M × 9.75 = $770M
Conservative (50% discount) = $385M ✅ (close to $395M target)
```

---

## Key Metrics Dashboard

### Operational KPIs
- **Customer Acquisition Cost (CAC):** $250
- **Lifetime Value (LTV):** $29,376
- **LTV:CAC Ratio:** 117:1
- **Payback Period:** 0.15 months (4 days)
- **Gross Margin:** 95%+
- **Net Margin:** 72-85%

### Growth Metrics
- **MoM User Growth:** 25-35%
- **Churn Rate:** 5%
- **Revenue per Trader:** $1,632/month
- **Volume per Trader:** $1M/month

### Financial Health
- **Burn Multiple:** 0.06 (excellent, <1 is good)
- **Rule of 40:** 120+ (Revenue Growth % + Profit Margin %)
- **Months to Break-Even:** 6
- **Capital Efficiency:** $4.25 revenue per $1 raised (Year 1)

---

## Risk Adjustments

### Scenario: 50% Lower Trading Volume
```
Impact: Revenue drops 40% (trading fees + yield)
Year 1 Revenue: $5.1M (vs $8.5M)
Still profitable: $3.4M profit (67% margin)
Conclusion: Business model resilient ✅
```

### Scenario: Regulatory Ban on Privacy
```
Impact: Fall back to transparent mode
Differentiation lost, compete on leverage/fees
Revenue impact: -30% (lose institutional traders)
Mitigation: View keys + KYC maintain compliance
```

### Scenario: Competitor Launches Privacy
```
Timeline: 18+ months to build our stack
Impact: Market share dilution
Mitigation: Network effects, first-mover advantage
Revenue impact: -20% growth rate
```

---

## Investor Returns

### Exit Scenarios (Year 3)

| Scenario | Valuation | Investor Value | ROI | IRR |
|----------|-----------|----------------|-----|-----|
| **Bear** | $150M | $30M | 15x | 136% |
| **Base** | $395M | $79M | 39.5x | 255% |
| **Bull** | $770M | $154M | 77x | 351% |

### Liquidity Timeline
- **Year 1:** Priced Series A (opportunity to exit at 5-10x)
- **Year 2:** Series B or acquisition offers
- **Year 3:** Strategic acquisition or pre-IPO round

---

## Notes for Excel Model

**Build this in Google Sheets with:**
1. **Assumptions Tab:** All inputs (growth rates, fees, costs)
2. **Revenue Tab:** Monthly breakdown with formulas
3. **Costs Tab:** Fixed + variable cost model
4. **P&L Tab:** Full income statement
5. **Unit Economics Tab:** CAC, LTV, payback calculations
6. **Sensitivity Tab:** Data tables for scenarios
7. **Charts Tab:** Visualizations (growth curve, margins)

**Share link with investors for transparency.**

---

**Last Updated:** January 27, 2026
**Version:** 1.0 (Base Case Model)
