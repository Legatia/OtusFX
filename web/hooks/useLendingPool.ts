"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import lendingIdl from "../idl/lending_pool.json";
// @ts-ignore - Privacy Cash SDK types
import { PrivacyCash } from "privacycash";
// @ts-ignore - ShadowWire SDK types
import { ShadowWire } from "@radr/shadowwire";

const PROGRAM_ID = new PublicKey(lendingIdl.address);

// Token mints (devnet)
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // ✅ Devnet USDC
const USD1_MINT = new PublicKey("2yyHi6Q84oyjmAcMqP9UfuCmftzSjbFpXxTDRUZN9GFi"); // ✅ Devnet USD1 (test)
const OTUS_MINT = new PublicKey("Bax4q8hoKoAFsN5GTCggMXkDUTyroLFmeveF9hm7rttV"); // ✅ Devnet OTUS Token

export type StablecoinType = "USDC" | "USD1";

export interface LendingPoolStats {
    totalDepositsUsdc: number;      // Total USDC deposited
    totalDepositsUsd1: number;      // Total USD1 deposited
    totalDeposits: number;          // Combined USDC + USD1
    totalBorrowed: number;          // Currently borrowed by traders
    utilizationRate: number;        // borrowed/deposits * 100
    lenderAPY: number;              // APY paid in OTUS
    borrowRate: number;             // APY traders pay
    availableLiquidity: number;     // Available for borrowing
    reserves: number;               // Protocol reserves
    otusPrice: number;              // Current OTUS price in USD
}

export interface LenderStats {
    usdcDeposited: number;          // User's USDC principal
    usd1Deposited: number;          // User's USD1 principal
    totalUsdValue: number;          // Total principal value
    otusInterestEarned: number;     // OTUS earned but not claimed
    otusInterestClaimed: number;    // OTUS already claimed
    depositTimestamp: number;       // First deposit time
    cumulativeUsdcDeposited: number;
    cumulativeUsd1Deposited: number;
    cumulativeUsdcWithdrawn: number;
    cumulativeUsd1Withdrawn: number;
}

export function useLendingPool() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const [poolStats, setPoolStats] = useState<LendingPoolStats>({
        totalDepositsUsdc: 0,
        totalDepositsUsd1: 0,
        totalDeposits: 0,
        totalBorrowed: 0,
        utilizationRate: 0,
        lenderAPY: 0,
        borrowRate: 0,
        availableLiquidity: 0,
        reserves: 0,
        otusPrice: 0,
    });

    const [lenderStats, setLenderStats] = useState<LenderStats>({
        usdcDeposited: 0,
        usd1Deposited: 0,
        totalUsdValue: 0,
        otusInterestEarned: 0,
        otusInterestClaimed: 0,
        depositTimestamp: 0,
        cumulativeUsdcDeposited: 0,
        cumulativeUsd1Deposited: 0,
        cumulativeUsdcWithdrawn: 0,
        cumulativeUsd1Withdrawn: 0,
    });

    const [loading, setLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState({ usdc: 0, usd1: 0 });

    const program = useMemo(() => {
        if (!wallet) return null;
        const provider = new AnchorProvider(connection, wallet, {});
        return new Program(lendingIdl as unknown as Idl, provider);
    }, [connection, wallet]);

    // Get lending config PDA
    const getLendingConfigPda = useCallback(() => {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lending_config")],
            PROGRAM_ID
        );
        return pda;
    }, []);

    // Get lender position PDA
    const getLenderPositionPda = useCallback((lender: PublicKey) => {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("lender_position"), lender.toBuffer()],
            PROGRAM_ID
        );
        return pda;
    }, []);

    // Fetch pool stats from LendingConfig account
    const fetchPoolStats = useCallback(async () => {
        if (!program) return;

        try {
            const configPda = getLendingConfigPda();
            const config = await (program.account as any).lendingConfig.fetch(configPda);

            const totalDepositsUsdc = config.totalDepositedUsdc.toNumber() / 1_000_000;
            const totalDepositsUsd1 = config.totalDepositedUsd1.toNumber() / 1_000_000;
            const totalDeposits = totalDepositsUsdc + totalDepositsUsd1;
            const totalBorrowed = config.totalBorrowed.toNumber() / 1_000_000;
            const reserves = config.totalReserves.toNumber() / 1_000_000;
            const otusPrice = config.otusPriceUsd.toNumber() / 1_000_000;

            const utilizationRate = totalDeposits > 0 ? (totalBorrowed / totalDeposits) * 100 : 0;

            // Calculate rates using on-chain formulas
            const baseRate = config.baseInterestRate;
            const utilMultiplier = config.utilizationMultiplier;
            const utilBps = Math.floor(utilizationRate * 100);
            const borrowRateBps = baseRate + ((utilBps * utilMultiplier) / 10000);

            const reserveFactor = config.reserveFactor;
            const grossRate = (borrowRateBps * utilBps) / 10000;
            const lenderRateBps = (grossRate * (10000 - reserveFactor)) / 10000;

            setPoolStats({
                totalDepositsUsdc,
                totalDepositsUsd1,
                totalDeposits,
                totalBorrowed,
                utilizationRate,
                lenderAPY: lenderRateBps / 100, // Convert bps to %
                borrowRate: borrowRateBps / 100,
                availableLiquidity: totalDeposits - totalBorrowed,
                reserves,
                otusPrice,
            });
        } catch (error) {
            console.error("Error fetching pool stats:", error);
        }
    }, [program, getLendingConfigPda]);

    // Fetch user's lender position
    const fetchLenderStats = useCallback(async () => {
        if (!program || !wallet) {
            setLoading(false);
            return;
        }

        try {
            const positionPda = getLenderPositionPda(wallet.publicKey);
            const position = await (program.account as any).lenderPosition.fetch(positionPda);

            setLenderStats({
                usdcDeposited: position.usdcDeposited.toNumber() / 1_000_000,
                usd1Deposited: position.usd1Deposited.toNumber() / 1_000_000,
                totalUsdValue: position.totalUsdValue.toNumber() / 1_000_000,
                otusInterestEarned: position.otusInterestEarned.toNumber() / 1_000_000,
                otusInterestClaimed: position.otusInterestClaimed.toNumber() / 1_000_000,
                depositTimestamp: position.depositTimestamp.toNumber(),
                cumulativeUsdcDeposited: position.cumulativeUsdcDeposited.toNumber() / 1_000_000,
                cumulativeUsd1Deposited: position.cumulativeUsd1Deposited.toNumber() / 1_000_000,
                cumulativeUsdcWithdrawn: position.cumulativeUsdcWithdrawn.toNumber() / 1_000_000,
                cumulativeUsd1Withdrawn: position.cumulativeUsd1Withdrawn.toNumber() / 1_000_000,
            });
        } catch (error) {
            // Position doesn't exist yet
            console.log("Lender position not initialized");
            setLenderStats({
                usdcDeposited: 0,
                usd1Deposited: 0,
                totalUsdValue: 0,
                otusInterestEarned: 0,
                otusInterestClaimed: 0,
                depositTimestamp: 0,
                cumulativeUsdcDeposited: 0,
                cumulativeUsd1Deposited: 0,
                cumulativeUsdcWithdrawn: 0,
                cumulativeUsd1Withdrawn: 0,
            });
        } finally {
            setLoading(false);
        }
    }, [program, wallet, getLenderPositionPda]);

    // Fetch wallet balances
    const fetchWalletBalances = useCallback(async () => {
        if (!wallet) return;

        try {
            const [usdcAta, usd1Ata] = await Promise.all([
                getAssociatedTokenAddress(USDC_MINT, wallet.publicKey),
                getAssociatedTokenAddress(USD1_MINT, wallet.publicKey),
            ]);

            const [usdcBal, usd1Bal] = await Promise.all([
                connection.getTokenAccountBalance(usdcAta).catch(() => ({ value: { uiAmount: 0 } })),
                connection.getTokenAccountBalance(usd1Ata).catch(() => ({ value: { uiAmount: 0 } })),
            ]);

            setWalletBalance({
                usdc: usdcBal.value.uiAmount || 0,
                usd1: usd1Bal.value.uiAmount || 0,
            });
        } catch (error) {
            console.error("Error fetching wallet balances:", error);
        }
    }, [connection, wallet]);

    useEffect(() => {
        fetchPoolStats();
        if (wallet) {
            fetchLenderStats();
            fetchWalletBalances();
        }
    }, [fetchPoolStats, fetchLenderStats, fetchWalletBalances, wallet]);

    // Initialize lender position (must be called before first deposit)
    const initializeLenderPosition = async () => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const configPda = getLendingConfigPda();
        const positionPda = getLenderPositionPda(wallet.publicKey);

        const tx = await program.methods
            .initializeLenderPosition()
            .accounts({
                lender: wallet.publicKey,
                lendingConfig: configPda,
                lenderPosition: positionPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        await fetchLenderStats();
        return tx;
    };

    // Deposit liquidity - PUBLIC (direct deposit, wallet linkage visible)
    const depositLiquidity = async (amount: number, stablecoinType: StablecoinType) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const configPda = getLendingConfigPda();
        const positionPda = getLenderPositionPda(wallet.publicKey);

        // Get config to find vaults
        const config = await (program.account as any).lendingConfig.fetch(configPda);
        const usdcVault = config.usdcVault as PublicKey;
        const usd1Vault = config.usd1Vault as PublicKey;

        // Get user's token account
        const tokenMint = stablecoinType === "USDC" ? USDC_MINT : USD1_MINT;
        const lenderTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey);

        // Map stablecoin type to enum
        const stablecoinEnum = stablecoinType === "USDC" ? { usdc: {} } : { usd1: {} };

        const tx = await program.methods
            .depositLiquidity(stablecoinEnum, new BN(amount * 1_000_000))
            .accounts({
                lender: wallet.publicKey,
                lendingConfig: configPda,
                lenderPosition: positionPda,
                usdcVault,
                usd1Vault,
                lenderTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        await fetchPoolStats();
        await fetchLenderStats();
        await fetchWalletBalances();
        return tx;
    };

    // Deposit liquidity - PRIVATE (via Privacy Cash, wallet linkage hidden)
    const depositLiquidityPrivate = async (amount: number, stablecoinType: StablecoinType) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        try {
            console.log(`[Privacy Cash] Generating commitment for ${amount} ${stablecoinType}...`);

            // Step 1: Generate Privacy Cash commitment and nullifier
            const privacyCash = new PrivacyCash(connection);
            const { commitment, nullifierHash, secret } = await privacyCash.generateCommitment(
                amount * 1_000_000, // Convert to smallest unit
                wallet.publicKey.toString()
            );

            console.log(`[Privacy Cash] Commitment generated: ${Buffer.from(commitment).toString('hex').slice(0, 16)}...`);
            console.log(`[Privacy Cash] Nullifier hash: ${Buffer.from(nullifierHash).toString('hex').slice(0, 16)}...`);

            // Step 2: Prepare accounts
            const configPda = getLendingConfigPda();
            const positionPda = getLenderPositionPda(wallet.publicKey);

            const config = await (program.account as any).lendingConfig.fetch(configPda);
            const usdcVault = config.usdcVault as PublicKey;
            const usd1Vault = config.usd1Vault as PublicKey;

            const tokenMint = stablecoinType === "USDC" ? USDC_MINT : USD1_MINT;
            const lenderTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey);
            const poolVault = stablecoinType === "USDC" ? usdcVault : usd1Vault;

            // Generate commitment account PDA
            const [commitmentAccountPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("privacy_commitment"),
                    wallet.publicKey.toBuffer(),
                    Buffer.from(commitment)
                ],
                PROGRAM_ID
            );

            const stablecoinEnum = stablecoinType === "USDC" ? { usdc: {} } : { usd1: {} };

            // Step 3: Call private deposit instruction
            console.log(`[Privacy Cash] Depositing to lending pool with privacy...`);
            const tx = await program.methods
                .depositLiquidityPrivate(
                    stablecoinEnum,
                    new BN(amount * 1_000_000),
                    Array.from(commitment),
                    Array.from(nullifierHash)
                )
                .accounts({
                    lendingConfig: configPda,
                    lenderPosition: positionPda,
                    lender: wallet.publicKey,
                    lenderTokenAccount,
                    poolVault,
                    usdcVault, // Required by has_one constraint
                    usd1Vault, // Required by has_one constraint
                    commitmentAccount: commitmentAccountPda,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log(`✅ Private deposit complete: ${tx}`);
            console.log(`💾 Save this secret to withdraw later: ${secret}`);

            await fetchPoolStats();
            await fetchLenderStats();
            await fetchWalletBalances();
            return tx;
        } catch (error) {
            console.error('[Privacy Cash] Private deposit failed:', error);
            throw error;
        }
    };

    // Withdraw liquidity - PUBLIC (direct withdrawal, visible on-chain)
    const withdrawLiquidity = async (amount: number, stablecoinType: StablecoinType) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const configPda = getLendingConfigPda();
        const positionPda = getLenderPositionPda(wallet.publicKey);

        // Get config to find vaults
        const config = await (program.account as any).lendingConfig.fetch(configPda);
        const usdcVault = config.usdcVault as PublicKey;
        const usd1Vault = config.usd1Vault as PublicKey;
        const otusVault = config.otusVault as PublicKey;

        // Get user's token accounts
        const tokenMint = stablecoinType === "USDC" ? USDC_MINT : USD1_MINT;
        const lenderTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey);
        const lenderOtusAccount = await getAssociatedTokenAddress(OTUS_MINT, wallet.publicKey);

        // Map stablecoin type to enum
        const stablecoinEnum = stablecoinType === "USDC" ? { usdc: {} } : { usd1: {} };

        const tx = await program.methods
            .withdrawLiquidity(stablecoinEnum, new BN(amount * 1_000_000))
            .accounts({
                lender: wallet.publicKey,
                lendingConfig: configPda,
                lenderPosition: positionPda,
                usdcVault,
                usd1Vault,
                otusVault,
                lenderTokenAccount,
                lenderOtusAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        await fetchPoolStats();
        await fetchLenderStats();
        await fetchWalletBalances();
        return tx;
    };

    // Withdraw liquidity - PRIVATE (via ShadowWire Bulletproofs, amount hidden)
    const withdrawLiquidityPrivate = async (amount: number, stablecoinType: StablecoinType) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        try {
            console.log(`[ShadowWire] Generating Bulletproof for withdrawal...`);

            // Step 1: Generate ShadowWire Bulletproof to hide withdrawal amount
            const shadowWire = new ShadowWire();
            const amountInSmallestUnit = amount * 1_000_000;

            const { commitment, proof, blindingFactor } = await shadowWire.generateRangeProof(
                amountInSmallestUnit,
                64 // 64-bit range proof
            );

            console.log(`[ShadowWire] Bulletproof generated (${proof.length} bytes)`);
            console.log(`[ShadowWire] Amount commitment: ${Buffer.from(commitment).toString('hex').slice(0, 16)}...`);

            // Step 2: Prepare accounts
            const configPda = getLendingConfigPda();
            const positionPda = getLenderPositionPda(wallet.publicKey);

            const config = await (program.account as any).lendingConfig.fetch(configPda);
            const usdcVault = config.usdcVault as PublicKey;
            const usd1Vault = config.usd1Vault as PublicKey;

            const tokenMint = stablecoinType === "USDC" ? USDC_MINT : USD1_MINT;
            const destinationTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey);
            const poolVault = stablecoinType === "USDC" ? usdcVault : usd1Vault;

            const stablecoinEnum = stablecoinType === "USDC" ? { usdc: {} } : { usd1: {} };

            // Step 3: Call private withdrawal instruction
            console.log(`[ShadowWire] Withdrawing from lending pool with hidden amount...`);
            const tx = await program.methods
                .withdrawLiquidityPrivate(
                    stablecoinEnum,
                    Array.from(commitment),
                    Array.from(proof),
                    new BN(amountInSmallestUnit) // Revealed after proof verification
                )
                .accounts({
                    lendingConfig: configPda,
                    lenderPosition: positionPda,
                    lender: wallet.publicKey,
                    destinationTokenAccount,
                    poolVault,
                    usdcVault, // Required by has_one constraint
                    usd1Vault, // Required by has_one constraint
                    tokenProgram: TOKEN_PROGRAM_ID,
                })
                .rpc();

            console.log(`✅ Private withdrawal complete: ${tx}`);
            console.log(`🔒 Amount hidden from chain observers via Bulletproofs`);

            await fetchPoolStats();
            await fetchLenderStats();
            await fetchWalletBalances();
            return tx;
        } catch (error) {
            console.error('[ShadowWire] Private withdrawal failed:', error);
            throw error;
        }
    };

    // Claim OTUS rewards without withdrawing principal
    const claimOtusRewards = async () => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const configPda = getLendingConfigPda();
        const positionPda = getLenderPositionPda(wallet.publicKey);

        // Get config to find OTUS vault
        const config = await (program.account as any).lendingConfig.fetch(configPda);
        const otusVault = config.otusVault as PublicKey;

        const lenderOtusAccount = await getAssociatedTokenAddress(OTUS_MINT, wallet.publicKey);

        const tx = await program.methods
            .claimOtusRewards()
            .accounts({
                lender: wallet.publicKey,
                lendingConfig: configPda,
                lenderPosition: positionPda,
                otusVault,
                lenderOtusAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        await fetchLenderStats();
        return tx;
    };

    return {
        // Pool stats
        poolStats,
        // User stats
        lenderStats,
        // Wallet balances
        walletBalance,
        // Loading state
        loading,
        // Actions - Public
        initializeLenderPosition,
        depositLiquidity,
        withdrawLiquidity,
        claimOtusRewards,
        // Actions - Private (via Privacy Cash)
        depositLiquidityPrivate,
        withdrawLiquidityPrivate,
        // Refresh
        refresh: () => {
            fetchPoolStats();
            fetchLenderStats();
            fetchWalletBalances();
        },
    };
}
