#!/bin/bash

# OTUS Token Creation Script - Devnet
# Creates SPL token with fixed supply and initial distribution

set -e

echo "======================================"
echo "OTUS Token Creation - Devnet"
echo "======================================"

# Configuration
NETWORK="devnet"
DECIMALS=6
TOTAL_SUPPLY=1000000000  # 1 billion OTUS

# Check if wallet exists
if [ ! -f ~/.config/solana/id.json ]; then
    echo "❌ Wallet not found. Creating new wallet..."
    solana-keygen new --no-bip39-passphrase
fi

# Switch to devnet
echo "📡 Switching to devnet..."
solana config set --url https://api.devnet.solana.com

# Airdrop SOL for gas if needed
BALANCE=$(solana balance | awk '{print $1}')
if (( $(echo "$BALANCE < 1" | bc -l) )); then
    echo "💰 Requesting SOL airdrop..."
    solana airdrop 2
    sleep 2
fi

echo ""
echo "📊 Wallet Information:"
solana address
solana balance

echo ""
echo "🪙 Creating OTUS Token..."

# Create token mint
TOKEN_MINT=$(spl-token create-token --decimals $DECIMALS 2>&1 | grep "Creating token" | awk '{print $3}')

if [ -z "$TOKEN_MINT" ]; then
    echo "❌ Failed to create token mint"
    exit 1
fi

echo "✅ Token Mint Created: $TOKEN_MINT"

# Create token account for authority
echo ""
echo "📦 Creating token account..."
TOKEN_ACCOUNT=$(spl-token create-account $TOKEN_MINT 2>&1 | grep "Creating account" | awk '{print $3}')
echo "✅ Token Account Created: $TOKEN_ACCOUNT"

# Mint total supply
echo ""
echo "⚡ Minting $TOTAL_SUPPLY OTUS tokens..."
spl-token mint $TOKEN_MINT $TOTAL_SUPPLY $TOKEN_ACCOUNT

# Disable future minting (fixed supply)
echo ""
echo "🔒 Disabling mint authority (fixed supply)..."
spl-token authorize $TOKEN_MINT mint --disable

echo ""
echo "======================================"
echo "✅ OTUS Token Created Successfully!"
echo "======================================"
echo ""
echo "📝 Token Details:"
echo "   Mint Address: $TOKEN_MINT"
echo "   Token Account: $TOKEN_ACCOUNT"
echo "   Total Supply: $TOTAL_SUPPLY OTUS"
echo "   Decimals: $DECIMALS"
echo "   Network: Devnet"
echo ""
echo "🔍 View on Solana Explorer:"
echo "   https://explorer.solana.com/address/$TOKEN_MINT?cluster=devnet"
echo ""
echo "💾 Saving mint address to file..."
echo "$TOKEN_MINT" > otus-mint-devnet.txt
echo "   Saved to: otus-mint-devnet.txt"
echo ""

# Display token info
echo "📊 Token Info:"
spl-token display $TOKEN_MINT

echo ""
echo "======================================"
echo "Next Steps:"
echo "1. Update hooks with mint address: $TOKEN_MINT"
echo "2. Create token vaults for programs"
echo "3. Distribute tokens per tokenomics"
echo "======================================"
