# Trading Engine Design

## Overview

OtusFX's trading engine implements a **private auto-deleverage system** that protects institutional traders from liquidation hunting while maintaining capital efficiency. Unlike traditional perps that result in total wipeouts, our system gradually reduces leverage to preserve capital.

---

## Core Problem

Traditional perpetual futures have critical flaws for institutional traders:

| Issue | Impact | Our Solution |
|-------|--------|--------------|
| **Total Liquidation** | 100% capital loss | Progressive deleverage |
| **Visible Stop Losses** | Liquidation hunting | Encrypted triggers (Arcium) |
| **Forced Position Close** | No recovery opportunity | Minimum 2x floor |
| **24/7 Monitoring** | Active babysitting required | Set and forget |

---

## Auto-Deleverage Mechanism

### How It Works

Instead of liquidating positions at a single threshold, we progressively reduce leverage at multiple stages:

```
Traditional Hard Liquidation:
20x Position → -80% margin → LIQUIDATED (total loss)

OtusFX Auto-Deleverage:
20x Position → -50% margin → Deleverage to 10x
           → -65% margin → Deleverage to 5x
           → -75% margin → Deleverage to 2x
           → -85% margin → Final close with remainder
```

### Deleverage Tiers

| Margin Health | Action | Result |
|---------------|--------|--------|
| < 50% | First deleverage | Close 50% of position |
| < 35% | Second deleverage | Close 50% of remaining |
| < 25% | Third deleverage | Reduce to 2x minimum |
| < 15% | Final close | Exit with remainder |

### Example: $100 Margin, 20x EUR/USD Long

| Event | Price | P&L | Margin | Action | New Leverage |
|-------|-------|-----|--------|--------|--------------|
| Open | 1.1000 | - | $100 | - | 20x |
| Drop -2% | 1.0780 | -$40 | $60 | Deleverage 1 | 10x |
| Drop -3% more | 1.0455 | -$18 | $42 | Deleverage 2 | 5x |
| Drop -4% more | 1.0037 | -$8.40 | $33.60 | Deleverage 3 | 2x |
| User closes | - | - | $33.60 | Exit | - |

**Result**: User keeps $33.60 instead of losing entire $100

---

## Privacy Integration: Arcium

### The Liquidation Hunting Problem

Without privacy, deleverage trigger prices are visible on-chain:

```
Whale Position:
- Size: $10M
- Entry: 1.1000
- Deleverage triggers: [1.0780, 1.0615, 1.0505]

Attacker sees triggers → Pushes price to 1.0780 → Whale gets deleveraged → Attacker profits
```

### Solution: Encrypted Trigger Prices

We use **Arcium's Multi-Party Computation (MPC)** to encrypt trigger prices:

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCIUM INTEGRATION FLOW                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. ORDER CREATION                                               │
│     User opens 20x position                                      │
│           ↓                                                      │
│     Calculate deleverage triggers: [1.0780, 1.0615, 1.0505]     │
│           ↓                                                      │
│     Encrypt via Arcium MXE: encrypted_triggers                  │
│           ↓                                                      │
│     Store encrypted data on-chain                               │
│                                                                  │
│  2. KEEPER MONITORING                                            │
│     Keeper monitors Pyth oracle prices                          │
│           ↓                                                      │
│     Calls: check_deleverage(position_key)                       │
│           ↓                                                      │
│     Arcium MXE: Decrypts → Compares → Returns boolean          │
│           ↓                                                      │
│     If true: Execute deleverage                                 │
│                                                                  │
│  3. WHAT ATTACKERS SEE                                           │
│     Position exists: ✓                                          │
│     Position size: ??? (encrypted)                              │
│     Trigger prices: ??? (encrypted)                             │
│     Only revealed AFTER execution                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Smart Contract Architecture

### Position Account Structure

```rust
#[account]
pub struct Position {
    pub owner: Pubkey,
    pub entry_price: i64,           // Pyth price format (expo -8)
    pub margin: u64,                // Amount in USDC/USD1
    pub size: u64,                  // Notional position size
    pub leverage: u8,               // Current effective leverage
    pub direction: Direction,       // Long or Short
    
    // Encrypted deleverage triggers (Arcium)
    pub encrypted_triggers: [u8; 256],  // MPC-encrypted trigger prices
    pub deleverage_executed: [bool; 3], // Track which tiers triggered
    
    // Settlement
    pub settled: bool,
    pub settlement_price: i64,
    
    pub timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum Direction {
    Long,
    Short,
}
```

### Key Instructions

#### 1. Open Position (with Encrypted Triggers)

```rust
pub fn open_position(
    ctx: Context<OpenPosition>,
    size: u64,
    leverage: u8,
    direction: Direction,
    encrypted_triggers: [u8; 256],  // Pre-encrypted client-side
) -> Result<()> {
    let current_price = ctx.accounts.pyth_oracle.get_price()?;
    
    let position = &mut ctx.accounts.position;
    position.owner = ctx.accounts.user.key();
    position.entry_price = current_price;
    position.margin = ctx.accounts.margin_account.amount;
    position.size = size;
    position.leverage = leverage;
    position.direction = direction;
    position.encrypted_triggers = encrypted_triggers;
    position.deleverage_executed = [false; 3];
    position.timestamp = Clock::get()?.unix_timestamp;
    
    // Transfer margin from user
    transfer_from_user_to_vault(ctx, position.margin)?;
    
    emit!(PositionOpened {
        position_key: position.key(),
        owner: position.owner,
        leverage,
        // Note: size and triggers NOT in event (privacy)
    });
    
    Ok(())
}
```

#### 2. Check and Execute Deleverage (Arcium-Powered)

```rust
pub fn trigger_deleverage(
    ctx: Context<TriggerDeleverage>,
    tier: u8,  // Which deleverage tier (0, 1, or 2)
) -> Result<()> {
    let position = &mut ctx.accounts.position;
    let current_price = ctx.accounts.pyth_oracle.get_price()?;
    
    require!(!position.deleverage_executed[tier as usize], ErrorCode::AlreadyDeleveraged);
    
    // Call Arcium MXE to check trigger
    let should_execute = arcium_check_trigger(
        &position.encrypted_triggers,
        tier,
        current_price,
    )?;
    
    require!(should_execute, ErrorCode::TriggerNotMet);
    
    // Execute partial close
    let close_percentage = match tier {
        0 => 50,  // First tier: close 50%
        1 => 50,  // Second tier: close 50% of remainder
        2 => 70,  // Third tier: reduce to 2x leverage
        _ => return Err(ErrorCode::InvalidTier.into()),
    };
    
    let size_to_close = position.size * close_percentage / 100;
    let realized_pnl = calculate_pnl(position, current_price, size_to_close);
    
    // Update position
    position.size -= size_to_close;
    position.margin = (position.margin as i64 + realized_pnl) as u64;
    position.leverage = calculate_new_leverage(position);
    position.deleverage_executed[tier as usize] = true;
    
    // Pay keeper reward (0.05% of closed notional)
    let keeper_reward = size_to_close * 5 / 10000;
    transfer_keeper_reward(&ctx.accounts.keeper, keeper_reward)?;
    
    emit!(PositionDeleveraged {
        position_key: position.key(),
        tier,
        new_leverage: position.leverage,
        keeper: ctx.accounts.keeper.key(),
    });
    
    Ok(())
}
```

#### 3. Close Position (OTUS Settlement)

```rust
pub fn close_position(
    ctx: Context<ClosePosition>,
) -> Result<()> {
    let position = &ctx.accounts.position;
    let current_price = ctx.accounts.pyth_oracle.get_price()?;
    
    let final_pnl = calculate_pnl(position, current_price, position.size);
    let final_margin = (position.margin as i64 + final_pnl) as u64;
    
    // Settle in OTUS (see OTUS tokenomics)
    let otus_amount = calculate_otus_settlement(final_margin)?;
    
    // Transfer OTUS to user
    transfer_otus_to_user(ctx, otus_amount)?;
    
    // Mark position as settled
    position.settled = true;
    position.settlement_price = current_price;
    
    Ok(())
}
```

---

## Arcium Integration Details

### Client-Side Encryption (TypeScript/Rust)

```typescript
import { ArciumClient, MXE } from '@arcium-network/sdk';

async function encryptDeleverageTriggers(
  entryPrice: number,
  leverage: number,
  direction: 'long' | 'short'
): Promise<Uint8Array> {
  const arcium = new ArciumClient();
  
  // Calculate trigger prices
  const triggers = calculateTriggers(entryPrice, leverage, direction);
  // e.g., [1.0780, 1.0615, 1.0505]
  
  // Encrypt using Arcium MXE
  const encrypted = await arcium.encrypt({
    data: triggers,
    mxe: 'deleverage-checker',
    publicKey: PROTOCOL_PUBLIC_KEY,
  });
  
  return encrypted;
}
```

### On-Chain Verification (Arcium CPI)

```rust
use arcium_sdk::{MXE, check_condition};

fn arcium_check_trigger(
    encrypted_triggers: &[u8; 256],
    tier: u8,
    current_price: i64,
) -> Result<bool> {
    // Cross-Program Invocation to Arcium MXE
    let mxe_result = check_condition(
        encrypted_triggers,
        tier,
        current_price,
    )?;
    
    Ok(mxe_result.should_trigger)
}
```

---

## Keeper Network

### Keeper Responsibilities

1. **Monitor Positions**: Subscribe to Pyth price feeds
2. **Check Triggers**: Call `trigger_deleverage` when price conditions met
3. **Earn Rewards**: Receive 0.05% of deleveraged notional

### Keeper Incentive Economics

```
Example Deleverage:
- Position size: $1M
- Close 50% = $500K
- Keeper reward: $500K × 0.05% = $250
- Gas cost: ~$0.10
- Net profit: $249.90
```

### Running a Keeper

```bash
# Clone keeper bot
git clone https://github.com/otusfx/keeper-bot
cd keeper-bot

# Configure
cp .env.example .env
# Add RPC_URL, KEEPER_WALLET

# Run
npm install
npm run start
```

---

## Integration with OTUS Tokenomics

When positions close (either manually or via final deleverage):

1. **Calculate Final Margin**: `initial_margin + realized_pnl`
2. **Convert to OTUS**: Based on treasury backing ratio
3. **Settle to User**: Transfer OTUS tokens
4. **Keep Stables**: USDC/USD1 stays in protocol → earning yield → backs OTUS

See [22-OTUS-TOKENOMICS.md](../22-OTUS-TOKENOMICS.md) for full details.

---

## Risk Parameters

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| First deleverage | 50% margin loss | Early intervention |
| Deleverage step | 50% position | Aggressive capital preservation |
| Minimum leverage | 2x | Always some exposure |
| Final close | 15% margin | Emergency exit |
| Keeper fee | 0.05% | Covers gas + profit |
| Max leverage | 20x | Institutional-friendly |

---

## Key Advantages

| Feature | Benefit |
|---------|---------|
| **No Total Wipeout** | Always walk away with something |
| **Private Triggers** | No liquidation hunting |
| **Set and Forget** | Sleep peacefully |
| **Institutional Grade** | Mimics traditional risk management |
| **Decentralized** | Permissionless keeper network |

---

## Future Enhancements

### Phase 4: Advanced Risk Management

- **Dynamic Deleverage**: Adjust tiers based on volatility
- **User-Configurable Tiers**: Custom risk profiles
- **Insurance Pool Integration**: Backstop for extreme events
- **Cross-Margining**: Share margin across positions

### Phase 5: Full Position Privacy

- **Encrypted Position Size**: Hide notional via Arcium
- **Confidential PnL**: Settlement amounts private
- **ZK Solvency Proofs**: Prove protocol health without revealing positions
