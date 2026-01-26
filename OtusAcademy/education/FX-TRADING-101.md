# FX Trading 101

> *Foreign exchange fundamentals for crypto natives.*

## What is FX Trading?

**Foreign Exchange (FX or Forex)** is the trading of currency pairs—exchanging one currency for another at agreed prices.

```
EUR/USD = 1.0850

Meaning: 1 Euro = 1.0850 US Dollars
```

---

## Why Trade FX?

| Reason | Details |
|--------|---------|
| **Largest Market** | $7.5 trillion daily volume |
| **24/5 Trading** | Monday 5am Sydney → Friday 5pm New York |
| **High Liquidity** | Tight spreads, easy entry/exit |
| **Leverage** | Trade larger positions with less capital |
| **Macro Exposure** | Trade on economic fundamentals |

---

## Currency Pairs

### Major Pairs
Most traded pairs (all include USD):

| Pair | Name | Characteristics |
|------|------|-----------------|
| EUR/USD | Euro Dollar | Most liquid pair |
| GBP/USD | Cable | Highly volatile |
| USD/JPY | Dollar Yen | Safe-haven dynamics |
| USD/CHF | Swissy | Safe-haven, stable |

### Minor/Cross Pairs
Don't include USD:

| Pair | Name |
|------|------|
| EUR/GBP | Euro Pound |
| EUR/JPY | Euro Yen |
| GBP/JPY | Pound Yen |

### Exotic Pairs
Emerging market currencies:
- USD/TRY (Turkish Lira)
- USD/BRL (Brazilian Real)
- EUR/PLN (Polish Zloty)

---

## Reading FX Quotes

### Base and Quote Currency

```
EUR/USD = 1.0850
│     │
Base  Quote

Base: Currency you're buying/selling (EUR)
Quote: Currency used to price it (USD)
```

### Bid and Ask

```
EUR/USD Bid: 1.0849  Ask: 1.0851
              │            │
        Buy price    Sell price

Spread: Ask - Bid = 0.0002 (2 pips)
```

### Pips

A **pip** (Percentage in Point) is the smallest price movement:
- Most pairs: 0.0001 (4th decimal)
- JPY pairs: 0.01 (2nd decimal)

```
EUR/USD moved from 1.0850 to 1.0870
Movement: 20 pips UP
```

---

## Long vs Short

### Going Long (Buy)
You expect the base currency to **strengthen**.

```
EUR/USD at 1.0850
You BUY (go long)
EUR/USD rises to 1.0900
You SELL to close
Profit: 50 pips
```

### Going Short (Sell)
You expect the base currency to **weaken**.

```
EUR/USD at 1.0850
You SELL (go short)
EUR/USD falls to 1.0800
You BUY to close
Profit: 50 pips
```

---

## Leverage

### What Is It?

Leverage lets you control large positions with small capital.

```
Without leverage:
   $1,000 capital → $1,000 position

With 20x leverage:
   $1,000 capital → $20,000 position
```

### The Double-Edged Sword

| Scenario | Without Leverage | With 20x Leverage |
|----------|-----------------|-------------------|
| Price moves +1% | +$10 profit | +$200 profit |
| Price moves -1% | -$10 loss | -$200 loss |
| Price moves -5% | -$50 loss | **-$1,000 (wiped out)** |

### OtusFX Auto-Deleverage

Unlike traditional liquidation (100% loss), OtusFX progressively reduces leverage:

```
Traditional: 20x → -5% move → LIQUIDATED (total loss)
OtusFX:      20x → -2.5% → Auto-reduce to 10x
                  → -3.5% → Auto-reduce to 5x
                  → -4.5% → Auto-reduce to 2x
                  → Exit with remaining capital
```

---

## Market Hours

FX trades 24 hours on weekdays across global sessions:

```
Session Timeline (UTC)

Sydney   ████░░░░░░░░░░░░░░░░░░░░   21:00-06:00
Tokyo        ████████░░░░░░░░░░░░░   00:00-09:00
London           ░░░░████████░░░░░   08:00-17:00
New York             ░░░░░░████████   13:00-22:00

Overlap periods = highest volatility
London/NY overlap (13:00-17:00 UTC) = peak trading
```

### Weekend Gap
Markets close Friday 5pm New York, reopen Sunday 5pm Sydney.
Prices can "gap" if major news occurs over the weekend.

---

## What Moves FX Prices?

### Economic Data
- **Interest Rates**: Higher rates → stronger currency
- **GDP Growth**: Strong economy → stronger currency
- **Inflation (CPI)**: Complex relationship with rates
- **Employment**: Jobs data moves markets

### Central Banks
- **Federal Reserve** (USD)
- **European Central Bank** (EUR)
- **Bank of England** (GBP)
- **Bank of Japan** (JPY)

### Geopolitics
- Elections
- Trade wars
- Conflicts

---

## Order Types

| Order | Description |
|-------|-------------|
| **Market** | Execute immediately at current price |
| **Limit** | Execute only at specified price or better |
| **Stop** | Execute when price reaches level (stop-loss) |
| **Take Profit** | Close position when target reached |

---

## Risk Management

### Position Sizing

Never risk more than 1-2% of account per trade.

```
Account: $10,000
Max risk per trade: $100-200 (1-2%)
Stop-loss: Must be set to limit loss to this amount
```

### Stop-Loss

Always set a stop-loss. Define your exit BEFORE entering.

### Leverage Guidelines

| Experience | Max Leverage |
|------------|--------------|
| Beginner | 2-5x |
| Intermediate | 5-10x |
| Advanced | 10-20x |
| OtusFX Max | 20x (with auto-deleverage protection) |

---

## FX vs Crypto Trading

| Aspect | FX | Crypto |
|--------|----|----|
| **Hours** | 24/5 | 24/7 |
| **Volatility** | 1-2% daily | 5-10%+ daily |
| **Liquidity** | Very high | Lower |
| **Regulation** | Heavy | Light |
| **Leverage** | Up to 50x+ | Usually 2-20x |

---

## Getting Started on OtusFX

1. **Start Small**: Use minimum position sizes
2. **Learn First**: Paper trade or use small amounts
3. **Set Stops**: Always know your max loss
4. **Understand Leverage**: Don't max out
5. **Use Auto-Deleverage**: It's there to protect you

---

## Further Resources

- [Investopedia Forex Guide](https://www.investopedia.com/forex-4427707)
- [BabyPips School](https://www.babypips.com/learn/forex) — Free forex course
- [TradingView](https://www.tradingview.com/) — Charts and analysis
