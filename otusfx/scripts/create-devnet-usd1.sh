#!/bin/bash

# Create USD1 test token on devnet for hackathon demo

set -e

echo "======================================"
echo "Creating USD1 Test Token on Devnet"
echo "======================================"
echo ""

# Ensure we're on devnet
solana config set --url https://api.devnet.solana.com

# Check balance
BALANCE=$(solana balance | awk '{print $1}')
echo "💰 Current balance: $BALANCE SOL"

if (( $(echo "$BALANCE < 1" | bc -l) )); then
    echo "🪂 Requesting airdrop..."
    solana airdrop 2
    sleep 5
fi

# Create USD1 token
echo ""
echo "🪙 Creating USD1 token..."
USD1_MINT=$(spl-token create-token --decimals 6 | grep "Creating token" | awk '{print $3}')

echo "✅ USD1 Mint Created: $USD1_MINT"
echo ""

# Create token account
echo "📦 Creating token account..."
spl-token create-account $USD1_MINT

# Mint 10 billion USD1 (for testing)
echo "💵 Minting 10,000,000,000 USD1..."
spl-token mint $USD1_MINT 10000000000

echo ""
echo "✅ USD1 Token Setup Complete!"
echo "======================================"
echo "Mint Address: $USD1_MINT"
echo "======================================"
echo ""

# Save to file
echo $USD1_MINT > ../usd1-mint-devnet.txt
echo "📝 Saved to usd1-mint-devnet.txt"

echo ""
echo "View on Explorer:"
echo "https://explorer.solana.com/address/$USD1_MINT?cluster=devnet"
echo ""
