/**
 * OTUS Token Distribution Script
 *
 * Distributes tokens to program vaults according to tokenomics:
 * - 30% Bootstrap rewards
 * - 30% Lending interest
 * - 15% Trading incentives
 * - 15% Team reserve
 * - 5% Initial liquidity
 * - 5% Buffer
 */

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getAssociatedTokenAddress, createAssociatedTokenAccount, transfer, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";

const DEVNET_RPC = "https://api.devnet.solana.com";
const TOTAL_SUPPLY = 1_000_000_000; // 1 billion OTUS
const DECIMALS = 6;

// Tokenomics allocation
const ALLOCATIONS = {
    BOOTSTRAP_REWARDS: 0.30,      // 30% - 300M OTUS
    LENDING_INTEREST: 0.30,       // 30% - 300M OTUS
    TRADING_INCENTIVES: 0.15,     // 15% - 150M OTUS
    TEAM_RESERVE: 0.15,           // 15% - 150M OTUS
    INITIAL_LIQUIDITY: 0.05,      // 5%  - 50M OTUS
    BUFFER: 0.05,                 // 5%  - 50M OTUS
};

async function main() {
    console.log("====================================");
    console.log("OTUS Token Distribution - Devnet");
    console.log("====================================\n");

    // Load wallet
    const connection = new Connection(DEVNET_RPC, "confirmed");
    const walletKeypair = Keypair.fromSecretKey(
        Uint8Array.from(JSON.parse(fs.readFileSync(process.env.HOME + "/.config/solana/id.json", "utf-8")))
    );
    console.log("📝 Authority Wallet:", walletKeypair.publicKey.toString());

    // Get OTUS mint from file
    const otusMintStr = fs.readFileSync("../otus-mint-devnet.txt", "utf-8").trim();
    const otusMint = new PublicKey(otusMintStr);
    console.log("🪙 OTUS Mint:", otusMint.toString());

    // Get authority's token account
    const authorityTokenAccount = await getAssociatedTokenAddress(otusMint, walletKeypair.publicKey);
    console.log("💼 Authority Token Account:", authorityTokenAccount.toString());

    // Load program IDLs
    const bootstrapIdl = JSON.parse(fs.readFileSync("../../web/idl/bootstrap.json", "utf-8"));
    const lendingIdl = JSON.parse(fs.readFileSync("../../web/idl/lending_pool.json", "utf-8"));
    const tradingIdl = JSON.parse(fs.readFileSync("../../web/idl/trading_engine.json", "utf-8"));

    const bootstrapProgramId = new PublicKey(bootstrapIdl.address || bootstrapIdl.metadata?.address);
    const lendingProgramId = new PublicKey(lendingIdl.address);
    const tradingProgramId = new PublicKey(tradingIdl.address || tradingIdl.metadata?.address);

    console.log("\n📦 Program IDs:");
    console.log("   Bootstrap:", bootstrapProgramId.toString());
    console.log("   Lending:", lendingProgramId.toString());
    console.log("   Trading:", tradingProgramId.toString());

    // Derive vault PDAs
    const [bootstrapOtusVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("otus_vault")],
        bootstrapProgramId
    );

    const [lendingOtusVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("otus_vault")],
        lendingProgramId
    );

    const [tradingOtusVault] = PublicKey.findProgramAddressSync(
        [Buffer.from("otus_vault")],
        tradingProgramId
    );

    console.log("\n🏦 Vault PDAs:");
    console.log("   Bootstrap OTUS Vault:", bootstrapOtusVault.toString());
    console.log("   Lending OTUS Vault:", lendingOtusVault.toString());
    console.log("   Trading OTUS Vault:", tradingOtusVault.toString());

    // Calculate amounts
    const calculateAmount = (percentage: number) => {
        return Math.floor(TOTAL_SUPPLY * percentage * Math.pow(10, DECIMALS));
    };

    const distributions = [
        {
            name: "Bootstrap Rewards",
            vault: bootstrapOtusVault,
            amount: calculateAmount(ALLOCATIONS.BOOTSTRAP_REWARDS),
            percentage: ALLOCATIONS.BOOTSTRAP_REWARDS * 100,
        },
        {
            name: "Lending Interest",
            vault: lendingOtusVault,
            amount: calculateAmount(ALLOCATIONS.LENDING_INTEREST),
            percentage: ALLOCATIONS.LENDING_INTEREST * 100,
        },
        {
            name: "Trading Incentives",
            vault: tradingOtusVault,
            amount: calculateAmount(ALLOCATIONS.TRADING_INCENTIVES),
            percentage: ALLOCATIONS.TRADING_INCENTIVES * 100,
        },
    ];

    console.log("\n💸 Distribution Plan:");
    console.log("─".repeat(80));
    distributions.forEach(d => {
        console.log(`   ${d.name.padEnd(25)} ${d.percentage}%  ${(d.amount / Math.pow(10, DECIMALS)).toLocaleString()} OTUS`);
    });
    console.log(`   ${"Team Reserve".padEnd(25)} ${(ALLOCATIONS.TEAM_RESERVE * 100)}%  ${(calculateAmount(ALLOCATIONS.TEAM_RESERVE) / Math.pow(10, DECIMALS)).toLocaleString()} OTUS (kept in authority wallet)`);
    console.log(`   ${"Initial Liquidity".padEnd(25)} ${(ALLOCATIONS.INITIAL_LIQUIDITY * 100)}%  ${(calculateAmount(ALLOCATIONS.INITIAL_LIQUIDITY) / Math.pow(10, DECIMALS)).toLocaleString()} OTUS (kept in authority wallet)`);
    console.log(`   ${"Buffer".padEnd(25)} ${(ALLOCATIONS.BUFFER * 100)}%  ${(calculateAmount(ALLOCATIONS.BUFFER) / Math.pow(10, DECIMALS)).toLocaleString()} OTUS (kept in authority wallet)`);
    console.log("─".repeat(80));

    // Create vault token accounts and transfer
    console.log("\n🚀 Starting distribution...\n");

    for (const dist of distributions) {
        try {
            console.log(`📤 Distributing to ${dist.name}...`);

            // Create associated token account for vault
            const vaultTokenAccount = await getAssociatedTokenAddress(otusMint, dist.vault, true);
            console.log(`   Vault Token Account: ${vaultTokenAccount.toString()}`);

            // Check if account exists
            const accountInfo = await connection.getAccountInfo(vaultTokenAccount);
            if (!accountInfo) {
                console.log(`   Creating token account...`);
                await createAssociatedTokenAccount(
                    connection,
                    walletKeypair,
                    otusMint,
                    dist.vault,
                    {},
                    TOKEN_PROGRAM_ID
                );
                console.log(`   ✅ Token account created`);
            } else {
                console.log(`   ℹ️  Token account already exists`);
            }

            // Transfer tokens
            console.log(`   Transferring ${(dist.amount / Math.pow(10, DECIMALS)).toLocaleString()} OTUS...`);
            const signature = await transfer(
                connection,
                walletKeypair,
                authorityTokenAccount,
                vaultTokenAccount,
                walletKeypair.publicKey,
                dist.amount,
                [],
                {},
                TOKEN_PROGRAM_ID
            );
            console.log(`   ✅ Transferred! Signature: ${signature}`);
            console.log();

        } catch (error) {
            console.error(`   ❌ Failed to distribute to ${dist.name}:`, error);
        }
    }

    console.log("====================================");
    console.log("✅ Distribution Complete!");
    console.log("====================================\n");

    // Save distribution summary
    const summary = {
        timestamp: new Date().toISOString(),
        network: "devnet",
        otusMint: otusMint.toString(),
        totalSupply: TOTAL_SUPPLY,
        distributions: distributions.map(d => ({
            name: d.name,
            vault: d.vault.toString(),
            amount: d.amount / Math.pow(10, DECIMALS),
            percentage: d.percentage,
        })),
        teamReserve: calculateAmount(ALLOCATIONS.TEAM_RESERVE) / Math.pow(10, DECIMALS),
        liquidity: calculateAmount(ALLOCATIONS.INITIAL_LIQUIDITY) / Math.pow(10, DECIMALS),
        buffer: calculateAmount(ALLOCATIONS.BUFFER) / Math.pow(10, DECIMALS),
    };

    fs.writeFileSync("../otus-distribution-summary.json", JSON.stringify(summary, null, 2));
    console.log("📊 Distribution summary saved to: otus-distribution-summary.json\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
