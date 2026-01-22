# Token Support Matrix

OtusFX supports two stablecoins optimized for privacy and low-fee on-ramps.

## Supported Assets

| Token | Symbol | Mint Address (Mainnet) | Notes |
|-------|--------|------------------------|-------|
| **USDC** | USDC | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` | Primary. Coinbase/Revolut 0% on-ramp. |
| **USD1** | USD1 | `USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB` | World Liberty Financial. ShadowWire $2.5k bounty. |

## Feature Support

| Feature | USDC | USD1 |
|---------|:----:|:----:|
| **Standard Deposit** | ✅ | ✅ |
| **Privacy Cash Deposit** | ✅ | ✅ |
| **ShadowWire Deposit** | ✅ | ✅ |
| **ShadowWire Transfer** | ✅ | ✅ |
| **Kora Gasless** | ✅ | ✅ |
| **Bootstrap Credit Earning** | ✅ | ✅ |

## On-Ramp Options

| Provider | Fee | Method |
|----------|-----|--------|
| **Coinbase (Advanced)** | ~0% | Buy USDC, send to Solana wallet |
| **Revolut** | 0% | Buy USDC, send to Solana wallet |
| **MoonPay** *(future)* | 1-4.5% | In-app widget |

## Future Roadmap

### Phase 2: Fiat On-Ramp
- **MoonPay Integration**: Embed widget for card purchases
- Fee: 1% (bank) to 4.5% (card)
- Converts fiat → USDC directly

### Phase 3: Privacy Swap (Arcium)
- Accept any stablecoin (USDT, DAI, etc.)
- Auto-swap to USDC via Arcium encrypted swap
- Swap fee: ~0.3% + slippage
- Privacy preserved during swap

## Code References

### `lib/tokens.ts`
```typescript
export const SUPPORTED_TOKENS = {
    USDC: { ... },
    USD1: { ... }
};
export const TOKEN_ORDER = ["USDC", "USD1"];
```

### `lib/privacy-cash.ts`
```typescript
export const PRIVACY_CASH_TOKENS = ['USDC', 'USD1'] as const;
```
