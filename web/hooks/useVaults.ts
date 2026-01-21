"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import idl from "../idl/vaults.json";

// Placeholder - replace with actual deployed address after `anchor build && anchor deploy`
const PROGRAM_ID = new PublicKey("VLT1111111111111111111111111111111111111111");

export interface VaultInfo {
    publicKey: PublicKey;
    name: string;
    strategyType: string;
    totalAssets: number;
    totalShares: number;
    userShares: number;
    userValue: number;
    apy: number | null;
    // Fee structure from vault account
    managementFeeBps: number;
    performanceFeeBps: number;
    withdrawalFeeBps: number;
    lockPeriodDays: number;
}

export function useVaults() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [vaults, setVaults] = useState<VaultInfo[]>([]);
    const [loading, setLoading] = useState(true);

    const program = useMemo(() => {
        if (!wallet) return null;
        const provider = new AnchorProvider(connection, wallet, {});
        return new Program(idl as unknown as Idl, provider);
    }, [connection, wallet]);

    // Fetch All Vaults with user balances
    const fetchVaults = useCallback(async () => {
        if (!program) return;
        try {
            setLoading(true);
            const allVaults = await (program.account as any).vault.all();

            const formatted: VaultInfo[] = await Promise.all(
                allVaults.map(async (v: any) => {
                    const totalAssets = v.account.totalAssets.toNumber() / 1_000_000;
                    const totalShares = v.account.totalShares.toNumber() / 1_000_000;
                    const shareMint = v.account.shareMint;

                    // Fetch user's share balance if wallet connected
                    let userShares = 0;
                    let userValue = 0;
                    if (wallet) {
                        try {
                            const userSharesAta = await getAssociatedTokenAddress(shareMint, wallet.publicKey);
                            const balance = await connection.getTokenAccountBalance(userSharesAta);
                            userShares = Number(balance.value.uiAmount || 0);
                            // Calculate user's share of assets
                            if (totalShares > 0) {
                                userValue = (userShares / totalShares) * totalAssets;
                            }
                        } catch {
                            // User doesn't have share account
                        }
                    }

                    return {
                        publicKey: v.publicKey,
                        name: v.account.name,
                        strategyType: v.account.strategyType,
                        totalAssets,
                        totalShares,
                        userShares,
                        userValue,
                        apy: null, // TBD - will come from performance oracle or yield strategy
                        // Fee structure from vault account
                        managementFeeBps: v.account.managementFeeBps || 0,
                        performanceFeeBps: v.account.performanceFeeBps || 0,
                        withdrawalFeeBps: v.account.withdrawalFeeBps || 0,
                        lockPeriodDays: v.account.lockPeriodDays || 0,
                    };
                })
            );

            setVaults(formatted);
        } catch (e) {
            console.error("Error fetching vaults", e);
        } finally {
            setLoading(false);
        }
    }, [program, wallet, connection]);

    useEffect(() => {
        fetchVaults();
    }, [fetchVaults]);

    // Deposit USDC into vault, receive shares
    const deposit = async (vaultPubkey: PublicKey, amount: number) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const vaultAccount = await (program.account as any).vault.fetch(vaultPubkey);
        const usdcVault = vaultAccount.usdcVault;
        const shareMint = vaultAccount.shareMint;

        const vaultInfo = await connection.getParsedAccountInfo(usdcVault);
        const vaultData = vaultInfo.value?.data as any;
        const usdcMint = new PublicKey(vaultData.parsed.info.mint);

        const userUsdc = await getAssociatedTokenAddress(usdcMint, wallet.publicKey);
        const userShares = await getAssociatedTokenAddress(shareMint, wallet.publicKey);

        const tx = await program.methods
            .deposit(new BN(amount * 1_000_000))
            .accounts({
                vault: vaultPubkey,
                shareMint: shareMint,
                usdcVault: usdcVault,
                depositor: wallet.publicKey,
                userUsdc: userUsdc,
                userShares: userShares,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        await fetchVaults();
        return tx;
    };

    // Withdraw USDC from vault by burning shares
    const withdraw = async (vaultPubkey: PublicKey, shares: number) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const vaultAccount = await (program.account as any).vault.fetch(vaultPubkey);
        const usdcVault = vaultAccount.usdcVault;
        const shareMint = vaultAccount.shareMint;

        const vaultInfo = await connection.getParsedAccountInfo(usdcVault);
        const vaultData = vaultInfo.value?.data as any;
        const usdcMint = new PublicKey(vaultData.parsed.info.mint);

        const userUsdc = await getAssociatedTokenAddress(usdcMint, wallet.publicKey);
        const userSharesAta = await getAssociatedTokenAddress(shareMint, wallet.publicKey);

        const tx = await program.methods
            .withdraw(new BN(shares * 1_000_000))
            .accounts({
                vault: vaultPubkey,
                shareMint: shareMint,
                usdcVault: usdcVault,
                withdrawer: wallet.publicKey,
                userUsdc: userUsdc,
                userShares: userSharesAta,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        await fetchVaults();
        return tx;
    };

    // Private deposit via Privacy Cash - amount hidden using ZK
    const privateDeposit = async (
        vaultPubkey: PublicKey,
        amount: number,
        token: 'USDC' | 'USD1' = 'USDC'
    ) => {
        if (!wallet) throw new Error("Wallet not connected");

        // Step 1: Deposit to Privacy Cash pool first (creates ZK commitment)
        const response = await fetch('/api/privacy/vault-deposit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                wallet: wallet.publicKey.toString(),
                vaultPubkey: vaultPubkey.toString(),
                amount,
                token,
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Private deposit failed');
        }

        const result = await response.json();

        await fetchVaults();
        return result;
    };

    return { vaults, loading, deposit, privateDeposit, withdraw, refresh: fetchVaults };
}
