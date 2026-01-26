# Bootstrap Pool Program Design

## Overview
The Bootstrap Pool incentivizes early adopters to provide initial USDC liquidity to the OtusFX protocol before the OTUS token launches. Participants earn:
- Genesis depositor rewards (distributed in OTUS tokens later)
- Tiered NFT badges (Scops) based on contribution level
- Governance voting rights on FX pair listings

## State Accounts

### 1. BootstrapConfig (PDA)
```rust
pub struct BootstrapConfig {
    pub authority: Pubkey,              // Protocol authority
    pub usdc_vault: Pubkey,             // USDC token account for deposits
    pub total_deposited: u64,           // Total USDC deposited (6 decimals)
    pub bootstrap_start: i64,           // Unix timestamp
    pub bootstrap_end: i64,             // Unix timestamp
    pub is_active: bool,                // Can accept deposits
    pub otus_distribution_rate: u64,    // OTUS per USDC (e.g., 100 OTUS per 1 USDC)
    pub total_participants: u32,        // Total number of depositors
    pub bump: u8,
}
```
**Seeds**: `["bootstrap_config"]`

### 2. UserDeposit (PDA per user)
```rust
pub struct UserDeposit {
    pub user: Pubkey,                   // Depositor wallet
    pub amount_deposited: u64,          // USDC deposited (6 decimals)
    pub deposit_timestamp: i64,         // When deposited
    pub otus_allocation: u64,           // OTUS tokens earned
    pub scops_tier: ScopsTier,          // NFT badge tier
    pub voting_power: u64,              // Governance weight
    pub has_claimed_otus: bool,         // Claimed OTUS after TGE
    pub has_minted_scops: bool,         // Minted NFT badge
    pub bump: u8,
}
```
**Seeds**: `["user_deposit", user.key()]`

### 3. ScopsTier Enum
```rust
pub enum ScopsTier {
    None,           // 0 USDC
    Bronze,         // 100-999 USDC
    Silver,         // 1,000-9,999 USDC
    Gold,           // 10,000-99,999 USDC
    Platinum,       // 100,000+ USDC
}
```

### 4. PairVoting (PDA per FX pair proposal)
```rust
pub struct PairVoting {
    pub pair_name: String,              // e.g., "EUR/CHF"
    pub proposer: Pubkey,               // Who proposed it
    pub votes_for: u64,                 // Total voting power in favor
    pub votes_against: u64,             // Total voting power against
    pub total_voters: u32,              // Number of voters
    pub proposal_start: i64,            // When voting started
    pub proposal_end: i64,              // When voting ends
    pub is_active: bool,                // Can still vote
    pub is_approved: bool,              // Result after voting
    pub bump: u8,
}
```
**Seeds**: `["pair_voting", pair_name]`

### 5. UserVote (PDA per user per proposal)
```rust
pub struct UserVote {
    pub user: Pubkey,
    pub pair_voting: Pubkey,
    pub vote: VoteChoice,               // For/Against
    pub voting_power_used: u64,
    pub bump: u8,
}
```
**Seeds**: `["user_vote", user.key(), pair_voting.key()]`

## Instructions

### 1. `initialize_bootstrap`
**Authority**: Protocol admin
**Accounts**:
- `authority` (signer)
- `bootstrap_config` (init, PDA)
- `usdc_vault` (init, token account owned by PDA)
- `usdc_mint` (USDC mint)
- `system_program`, `token_program`, `rent`

**Args**:
- `bootstrap_start: i64`
- `bootstrap_end: i64`
- `otus_distribution_rate: u64`

**Logic**:
- Create bootstrap config with authority and vault
- Set active period and OTUS reward rate

### 2. `deposit_usdc`
**Authority**: Any user
**Accounts**:
- `user` (signer)
- `bootstrap_config` (mut)
- `user_deposit` (init_if_needed, PDA)
- `user_usdc_account` (mut)
- `usdc_vault` (mut)
- `token_program`, `system_program`

**Args**:
- `amount: u64` (USDC with 6 decimals)

**Logic**:
- Verify bootstrap is active and within time window
- Transfer USDC from user to vault
- Create or update UserDeposit account
- Calculate OTUS allocation: `amount * otus_distribution_rate / 1_000_000`
- Determine Scops tier based on total deposited
- Calculate voting power (1:1 with USDC deposited)
- Increment total_deposited and total_participants

**Scops Tier Calculation**:
```rust
fn calculate_scops_tier(amount: u64) -> ScopsTier {
    match amount {
        0..=99_999_999 => ScopsTier::None,          // < 100 USDC
        100_000_000..=999_999_999 => ScopsTier::Bronze,  // 100-999 USDC
        1_000_000_000..=9_999_999_999 => ScopsTier::Silver, // 1k-9,999 USDC
        10_000_000_000..=99_999_999_999 => ScopsTier::Gold, // 10k-99,999 USDC
        _ => ScopsTier::Platinum,                   // 100k+ USDC
    }
}
```

### 3. `withdraw_usdc`
**Authority**: Depositor
**Accounts**:
- `user` (signer)
- `bootstrap_config` (mut)
- `user_deposit` (mut)
- `user_usdc_account` (mut)
- `usdc_vault` (mut)
- `token_program`

**Args**:
- `amount: u64`

**Logic**:
- Allow partial or full withdrawal ONLY before bootstrap_end
- Update user_deposit amounts
- Recalculate Scops tier and voting power
- Transfer USDC back to user

**Note**: After bootstrap_end, funds are locked until OTUS TGE

### 4. `claim_otus_rewards`
**Authority**: Depositor
**Accounts**:
- `user` (signer)
- `bootstrap_config`
- `user_deposit` (mut)
- `otus_mint` (OTUS token mint)
- `otus_vault` (protocol's OTUS reserve)
- `user_otus_account` (mut)
- `token_program`

**Logic**:
- Verify bootstrap has ended
- Verify user hasn't already claimed
- Transfer allocated OTUS tokens to user
- Set `has_claimed_otus = true`

**Note**: Only callable after OTUS token is launched

### 5. `mint_scops_nft`
**Authority**: Depositor
**Accounts**:
- `user` (signer)
- `user_deposit` (mut)
- `scops_nft_mint` (init, unique mint for this user's tier)
- `user_nft_account` (init)
- `metadata_account` (Metaplex metadata)
- `master_edition` (Metaplex master edition)
- `token_metadata_program`
- `token_program`, `system_program`, `rent`

**Logic**:
- Verify user has a tier (Bronze or higher)
- Verify user hasn't already minted
- Create NFT with metadata:
  - Name: "OtusFX Scops - {Tier}"
  - Symbol: "SCOPS"
  - URI: Points to tier-specific JSON
  - Attributes: tier, deposit_amount, timestamp
- Mint 1 NFT to user
- Set `has_minted_scops = true`

**Metadata JSON Structure**:
```json
{
  "name": "OtusFX Scops - Gold",
  "symbol": "SCOPS",
  "description": "Genesis depositor badge for OtusFX protocol",
  "image": "https://otus.com/scops/gold.png",
  "attributes": [
    {"trait_type": "Tier", "value": "Gold"},
    {"trait_type": "Deposit Amount", "value": "50000"},
    {"trait_type": "Deposit Date", "value": "2026-01-23"}
  ]
}
```

### 6. `propose_fx_pair`
**Authority**: Bootstrap participant
**Accounts**:
- `proposer` (signer)
- `user_deposit` (must exist)
- `pair_voting` (init, PDA)
- `system_program`, `rent`

**Args**:
- `pair_name: String` (e.g., "EUR/CHF")
- `voting_duration_days: u8`

**Logic**:
- Verify proposer is a bootstrap participant
- Create new PairVoting account
- Set voting period (start to end)
- Set is_active = true

### 7. `vote_on_pair`
**Authority**: Bootstrap participant
**Accounts**:
- `voter` (signer)
- `user_deposit` (voter's deposit)
- `pair_voting` (mut)
- `user_vote` (init_if_needed, PDA)
- `system_program`

**Args**:
- `vote_choice: VoteChoice` (For/Against)

**Logic**:
- Verify voting is active and within time window
- Verify voter is a bootstrap participant
- Create or update UserVote
- Add voting power to votes_for or votes_against
- Increment total_voters

**Voting Power**: 1:1 with USDC deposited (from user_deposit.amount_deposited)

### 8. `finalize_pair_voting`
**Authority**: Anyone (permissionless)
**Accounts**:
- `pair_voting` (mut)

**Logic**:
- Verify voting period has ended
- Set is_active = false
- Set is_approved = true if votes_for > votes_against
- Emit event with result

### 9. `close_bootstrap`
**Authority**: Protocol admin
**Accounts**:
- `authority` (signer)
- `bootstrap_config` (mut)

**Logic**:
- Verify bootstrap_end has passed
- Set is_active = false
- Funds remain locked in vault until OTUS distribution

## Security Considerations

1. **Sybil Resistance**: Minimum deposit requirement (e.g., 10 USDC) to prevent spam
2. **Reentrancy**: Use Anchor's account constraints
3. **Time Manipulation**: Use Clock sysvar for all time checks
4. **Authority Control**: Only protocol authority can initialize/close
5. **Withdrawal Restrictions**: Lock funds after bootstrap_end
6. **NFT Supply**: One Scops NFT per user (soulbound via update_authority = None)

## Events

```rust
#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub total_deposited: u64,
    pub scops_tier: ScopsTier,
}

#[event]
pub struct VoteEvent {
    pub voter: Pubkey,
    pub pair_name: String,
    pub vote_choice: VoteChoice,
    pub voting_power: u64,
}

#[event]
pub struct PairApprovalEvent {
    pub pair_name: String,
    pub votes_for: u64,
    pub votes_against: u64,
    pub approved: bool,
}
```

## Client Integration

### Deposit Flow
```typescript
const tx = await program.methods
  .depositUsdc(new BN(1000_000_000)) // 1,000 USDC
  .accounts({
    user: userPublicKey,
    bootstrapConfig: bootstrapConfigPda,
    userDeposit: userDepositPda,
    userUsdcAccount: userUsdcAta,
    usdcVault: usdcVaultPda,
    tokenProgram: TOKEN_PROGRAM_ID,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

### Vote Flow
```typescript
const tx = await program.methods
  .voteOnPair({ for: {} }) // Or { against: {} }
  .accounts({
    voter: voterPublicKey,
    userDeposit: voterDepositPda,
    pairVoting: pairVotingPda,
    userVote: userVotePda,
    systemProgram: SystemProgram.programId,
  })
  .rpc();
```

## Next Steps

1. Implement program with Anchor 0.30.1
2. Write unit tests with Bankrun/LiteSVM
3. Create TypeScript SDK for client integration
4. Deploy to devnet for testing
5. Design Scops NFT artwork for each tier
