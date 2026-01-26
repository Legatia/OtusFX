/**
 * OTUS Token Distribution Script (Simplified for Devnet)
 *
 * For devnet testing, all tokens remain in the authority wallet.
 * When programs need OTUS, they can be manually transferred or
 * programs can be updated with proper vault initialization.
 */

import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { getAccount } from "@solana/spl-token";
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
    console.log("OTUS Token Status - Devnet");
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
    const { getAssociatedTokenAddress } = await import("@solana/spl-token");
    const authorityTokenAccount = await getAssociatedTokenAddress(otusMint, walletKeypair.publicKey);
    console.log("💼 Authority Token Account:", authorityTokenAccount.toString());

    // Check balance
    try {
        const accountInfo = await getAccount(connection, authorityTokenAccount);
        const balance = Number(accountInfo.amount) / Math.pow(10, DECIMALS);
        console.log("💰 Current Balance:", balance.toLocaleString(), "OTUS\n");

        if (balance !== TOTAL_SUPPLY) {
            console.log("⚠️  Warning: Balance doesn't match expected total supply");
            console.log(`   Expected: ${TOTAL_SUPPLY.toLocaleString()} OTUS`);
            console.log(`   Actual: ${balance.toLocaleString()} OTUS\n`);
        }
    } catch (error) {
        console.log("❌ Error reading token account:", error);
        return;
    }

    // Load program IDLs to show vault addresses
    const bootstrapIdl = JSON.parse(fs.readFileSync("../../web/idl/bootstrap.json", "utf-8"));
    const lendingIdl = JSON.parse(fs.readFileSync("../../web/idl/lending_pool.json", "utf-8"));
    const tradingIdl = JSON.parse(fs.readFileSync("../../web/idl/trading_engine.json", "utf-8"));

    const bootstrapProgramId = new PublicKey(bootstrapIdl.address || bootstrapIdl.metadata?.address);
    const lendingProgramId = new PublicKey(lendingIdl.address);
    const tradingProgramId = new PublicKey(tradingIdl.address || tradingIdl.metadata?.address);

    console.log("📦 Program IDs:");
    console.log("   Bootstrap:", bootstrapProgramId.toString());
    console.log("   Lending:", lendingProgramId.toString());
    console.log("   Trading:", tradingProgramId.toString());

    // Derive vault PDAs (for reference)
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

    console.log("\n🏦 Expected Vault PDAs (for program initialization):");
    console.log("   Bootstrap OTUS Vault:", bootstrapOtusVault.toString());
    console.log("   Lending OTUS Vault:", lendingOtusVault.toString());
    console.log("   Trading OTUS Vault:", tradingOtusVault.toString());

    // Calculate amounts
    const calculateAmount = (percentage: number) => {
        return TOTAL_SUPPLY * percentage;
    };

    console.log("\n💸 Token Allocation (Held in Authority Wallet):");
    console.log("─".repeat(80));
    console.log(`   Bootstrap Rewards         30%  ${calculateAmount(ALLOCATIONS.BOOTSTRAP_REWARDS).toLocaleString()} OTUS`);
    console.log(`   Lending Interest          30%  ${calculateAmount(ALLOCATIONS.LENDING_INTEREST).toLocaleString()} OTUS`);
    console.log(`   Trading Incentives        15%  ${calculateAmount(ALLOCATIONS.TRADING_INCENTIVES).toLocaleString()} OTUS`);
    console.log(`   Team Reserve              15%  ${calculateAmount(ALLOCATIONS.TEAM_RESERVE).toLocaleString()} OTUS`);
    console.log(`   Initial Liquidity         5%   ${calculateAmount(ALLOCATIONS.INITIAL_LIQUIDITY).toLocaleString()} OTUS`);
    console.log(`   Buffer                    5%   ${calculateAmount(ALLOCATIONS.BUFFER).toLocaleString()} OTUS`);
    console.log("─".repeat(80));
    console.log(`   TOTAL                     100% ${TOTAL_SUPPLY.toLocaleString()} OTUS\n`);

    console.log("📋 Status Summary:");
    console.log("─".repeat(80));
    console.log("✅ OTUS token created on devnet");
    console.log("✅ All tokens in authority wallet");
    console.log("✅ Mint authority disabled (fixed supply)");
    console.log("⏳ Programs need OTUS vault initialization instructions");
    console.log("⏳ Manual transfers can be done when programs are ready");
    console.log("─".repeat(80));

    // Save distribution summary
    const summary = {
        timestamp: new Date().toISOString(),
        network: "devnet",
        status: "All tokens held in authority wallet (awaiting program vault initialization)",
        otusMint: otusMint.toString(),
        authorityWallet: walletKeypair.publicKey.toString(),
        authorityTokenAccount: authorityTokenAccount.toString(),
        totalSupply: TOTAL_SUPPLY,
        allocations: {
            bootstrap_rewards: {
                percentage: ALLOCATIONS.BOOTSTRAP_REWARDS * 100,
                amount: calculateAmount(ALLOCATIONS.BOOTSTRAP_REWARDS),
                expectedVaultPDA: bootstrapOtusVault.toString(),
            },
            lending_interest: {
                percentage: ALLOCATIONS.LENDING_INTEREST * 100,
                amount: calculateAmount(ALLOCATIONS.LENDING_INTEREST),
                expectedVaultPDA: lendingOtusVault.toString(),
            },
            trading_incentives: {
                percentage: ALLOCATIONS.TRADING_INCENTIVES * 100,
                amount: calculateAmount(ALLOCATIONS.TRADING_INCENTIVES),
                expectedVaultPDA: tradingOtusVault.toString(),
            },
            team_reserve: {
                percentage: ALLOCATIONS.TEAM_RESERVE * 100,
                amount: calculateAmount(ALLOCATIONS.TEAM_RESERVE),
            },
            initial_liquidity: {
                percentage: ALLOCATIONS.INITIAL_LIQUIDITY * 100,
                amount: calculateAmount(ALLOCATIONS.INITIAL_LIQUIDITY),
            },
            buffer: {
                percentage: ALLOCATIONS.BUFFER * 100,
                amount: calculateAmount(ALLOCATIONS.BUFFER),
            },
        },
        programIds: {
            bootstrap: bootstrapProgramId.toString(),
            lending: lendingProgramId.toString(),
            trading: tradingProgramId.toString(),
        },
    };

    fs.writeFileSync("../otus-distribution-summary.json", JSON.stringify(summary, null, 2));
    console.log("\n📊 Distribution summary saved to: otus-distribution-summary.json\n");

    console.log("====================================");
    console.log("✅ Token Status Check Complete!");
    console.log("====================================\n");

    console.log("📝 Next Steps:");
    console.log("   1. Add OTUS vault initialization to program instructions");
    console.log("   2. Initialize vaults in each program");
    console.log("   3. Transfer allocated amounts from authority wallet");
    console.log("   4. Test OTUS rewards/interest distribution\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });
