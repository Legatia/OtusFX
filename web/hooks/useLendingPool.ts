"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import vaultsIdl from "../idl/vaults.json";

const PROGRAM_ID = new PublicKey(vaultsIdl.address);

// Lending Pool is a specialized vault that lends to trading engine
// We reuse the vaults program with a specific "lending_pool" vault
const LENDING_POOL_NAME = "lending_pool";

export interface LendingPoolStats {
    totalDeposits: number;      // Total USDC in pool
    totalBorrowed: number;      // Reserved by trading engine
    utilizationRate: number;    // borrowed/deposits * 100
    lenderAPY: number;          // Based on utilization curve
    borrowRate: number;         // What traders pay
    userDeposit: number;        // User's share value
    userShares: number;         // User's LP tokens
    userEarnings: number;       // Estimated earnings
}

// Interest rate model (kinked curve)
function calculateAPY(utilization: number): number {
    const kink = 80; // Optimal utilization
    const baseRate = 2; // 2% base
    const slope1 = 0.05; // Gentle slope below kink
    const slope2 = 0.5; // Steep slope above kink

    if (utilization <= kink) {
        return baseRate + (utilization * slope1);
    } else {
        const normalRate = baseRate + (kink * slope1);
        return normalRate + ((utilization - kink) * slope2);
    }
}

export function useLendingPool() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [poolStats, setPoolStats] = useState<LendingPoolStats>({
        totalDeposits: 0,
        totalBorrowed: 0,
        utilizationRate: 0,
        lenderAPY: 0,
        borrowRate: 0,
        userDeposit: 0,
        userShares: 0,
        userEarnings: 0,
    });
    const [loading, setLoading] = useState(true);
    const [walletBalance, setWalletBalance] = useState(0);

    const program = useMemo(() => {
        if (!wallet) return null;
        const provider = new AnchorProvider(connection, wallet, {});
        return new Program(vaultsIdl as unknown as Idl, provider);
    }, [connection, wallet]);

    // Get lending pool PDA
    const getLendingPoolPda = () => {
        const [pda] = PublicKey.findProgramAddressSync(
            [Buffer.from("vault"), Buffer.from(LENDING_POOL_NAME)],
            PROGRAM_ID
        );
        return pda;
    };

    const fetchPoolStats = useCallback(async () => {
        if (!program) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const lendingPoolPda = getLendingPoolPda();

            // Try to fetch the lending pool vault
            let totalDeposits = 0;
            let totalShares = 0;
            let userShares = 0;
            let shareMint: PublicKey | null = null;

            try {
                const vault = await (program.account as any).vault.fetch(lendingPoolPda);
                totalDeposits = vault.totalAssets.toNumber() / 1_000_000;
                totalShares = vault.totalShares.toNumber() / 1_000_000;
                shareMint = vault.shareMint;

                // Fetch user's share balance
                if (wallet && shareMint) {
                    try {
                        const userSharesAta = await getAssociatedTokenAddress(shareMint, wallet.publicKey);
                        const balance = await connection.getTokenAccountBalance(userSharesAta);
                        userShares = Number(balance.value.uiAmount || 0);
                    } catch {
                        // User doesn't have shares yet
                    }
                }
            } catch {
                // Lending pool not initialized yet
                console.log("Lending pool not initialized");
            }

            // TODO: Query trading_engine for actual borrowed amount when borrow tracking is implemented
            // For now, show 0% utilization since we don't have real borrow data
            const totalBorrowed = 0;
            const utilizationRate = totalDeposits > 0 ? (totalBorrowed / totalDeposits) * 100 : 0;
            const lenderAPY = calculateAPY(utilizationRate);
            const borrowRate = lenderAPY * 1.5; // Spread

            // User's deposit value
            const userDeposit = totalShares > 0 ? (userShares / totalShares) * totalDeposits : 0;
            const userEarnings = userDeposit * (lenderAPY / 100) * (30 / 365); // 30-day estimate

            // Fetch wallet USDC balance
            if (wallet) {
                try {
                    // Hardcoded USDC mint for devnet/mainnet
                    const usdcMint = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
                    const userUsdc = await getAssociatedTokenAddress(usdcMint, wallet.publicKey);
                    const balance = await connection.getTokenAccountBalance(userUsdc);
                    setWalletBalance(Number(balance.value.uiAmount || 0));
                } catch {
                    setWalletBalance(0);
                }
            }

            setPoolStats({
                totalDeposits,
                totalBorrowed,
                utilizationRate,
                lenderAPY,
                borrowRate,
                userDeposit,
                userShares,
                userEarnings,
            });
        } catch (e) {
            console.error("Error fetching lending pool:", e);
        } finally {
            setLoading(false);
        }
    }, [program, wallet, connection]);

    useEffect(() => {
        fetchPoolStats();
    }, [fetchPoolStats]);

    // Deposit to lending pool
    const deposit = async (amount: number) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const lendingPoolPda = getLendingPoolPda();
        const vault = await (program.account as any).vault.fetch(lendingPoolPda);
        const usdcVault = vault.usdcVault;
        const shareMint = vault.shareMint;

        const vaultInfo = await connection.getParsedAccountInfo(usdcVault);
        const vaultData = vaultInfo.value?.data as any;
        const usdcMint = new PublicKey(vaultData.parsed.info.mint);

        const userUsdc = await getAssociatedTokenAddress(usdcMint, wallet.publicKey);
        const userSharesAta = await getAssociatedTokenAddress(shareMint, wallet.publicKey);

        const tx = await program.methods
            .deposit(new BN(amount * 1_000_000))
            .accounts({
                vault: lendingPoolPda,
                shareMint: shareMint,
                usdcVault: usdcVault,
                depositor: wallet.publicKey,
                userUsdc: userUsdc,
                userShares: userSharesAta,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        await fetchPoolStats();
        return tx;
    };

    // Withdraw from lending pool
    const withdraw = async (shares: number) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const lendingPoolPda = getLendingPoolPda();
        const vault = await (program.account as any).vault.fetch(lendingPoolPda);
        const usdcVault = vault.usdcVault;
        const shareMint = vault.shareMint;

        const vaultInfo = await connection.getParsedAccountInfo(usdcVault);
        const vaultData = vaultInfo.value?.data as any;
        const usdcMint = new PublicKey(vaultData.parsed.info.mint);

        const userUsdc = await getAssociatedTokenAddress(usdcMint, wallet.publicKey);
        const userSharesAta = await getAssociatedTokenAddress(shareMint, wallet.publicKey);

        const tx = await program.methods
            .withdraw(new BN(shares * 1_000_000))
            .accounts({
                vault: lendingPoolPda,
                shareMint: shareMint,
                usdcVault: usdcVault,
                withdrawer: wallet.publicKey,
                userUsdc: userUsdc,
                userShares: userSharesAta,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        await fetchPoolStats();
        return tx;
    };

    return {
        poolStats,
        walletBalance,
        loading,
        deposit,
        withdraw,
        refresh: fetchPoolStats,
    };
}
