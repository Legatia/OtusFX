"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "../idl/credits.json";

const PROGRAM_ID = new PublicKey(idl.address);

export function useCredits() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [balance, setBalance] = useState(0);
    const [lifetimeEarned, setLifetimeEarned] = useState(0);
    const [lifetimeSpent, setLifetimeSpent] = useState(0);
    const [loading, setLoading] = useState(true);
    const [accountExists, setAccountExists] = useState(false);

    const program = useMemo(() => {
        if (!wallet) return null;
        const provider = new AnchorProvider(connection, wallet, {});
        return new Program(idl as unknown as Idl, provider);
    }, [connection, wallet]);

    // Derive PDAs
    const getConfigPda = () => {
        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("credits_config")],
            PROGRAM_ID
        );
        return configPda;
    };

    const getCreditAccountPda = (owner: PublicKey) => {
        const [creditAccountPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("credit_account"), owner.toBuffer()],
            PROGRAM_ID
        );
        return creditAccountPda;
    };

    // Fetch credit balance
    const fetchBalance = useCallback(async () => {
        if (!program || !wallet) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            const creditAccountPda = getCreditAccountPda(wallet.publicKey);

            const accountInfo = await connection.getAccountInfo(creditAccountPda);
            if (!accountInfo) {
                setAccountExists(false);
                setBalance(0);
                setLoading(false);
                return;
            }

            const creditAccount = await (program.account as any).creditAccount.fetch(creditAccountPda);
            setAccountExists(true);
            setBalance(creditAccount.balance.toNumber());
            setLifetimeEarned(creditAccount.lifetimeEarned.toNumber());
            setLifetimeSpent(creditAccount.lifetimeSpent.toNumber());
        } catch (e) {
            console.error("Failed to fetch credit balance", e);
            setAccountExists(false);
            setBalance(0);
        } finally {
            setLoading(false);
        }
    }, [program, wallet, connection]);

    // Create credit account (if it doesn't exist)
    const createAccount = async () => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        try {
            const creditAccountPda = getCreditAccountPda(wallet.publicKey);

            const tx = await program.methods
                .createAccount()
                .accounts({
                    creditAccount: creditAccountPda,
                    owner: wallet.publicKey,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log("Credit account created:", tx);
            await fetchBalance();
            return tx;
        } catch (error) {
            console.error("Failed to create credit account:", error);
            throw error;
        }
    };

    // Burn credits (spend in marketplace)
    const burnCredits = async (amount: number, itemId: number) => {
        if (!program || !wallet) throw new Error("Wallet not connected");
        if (balance < amount) throw new Error("Insufficient credits");

        try {
            const configPda = getConfigPda();
            const creditAccountPda = getCreditAccountPda(wallet.publicKey);

            const tx = await program.methods
                .burnCredits(new BN(amount), new BN(itemId))
                .accounts({
                    config: configPda,
                    creditAccount: creditAccountPda,
                    owner: wallet.publicKey,
                })
                .rpc();

            console.log("Credits burned:", tx);
            await fetchBalance(); // Refresh balance after burn
            return tx;
        } catch (error) {
            console.error("Failed to burn credits:", error);
            throw error;
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    // Poll every 30s
    useEffect(() => {
        const interval = setInterval(fetchBalance, 30000);
        return () => clearInterval(interval);
    }, [fetchBalance]);

    return {
        balance,
        lifetimeEarned,
        lifetimeSpent,
        loading,
        accountExists,
        createAccount,
        burnCredits,
        refresh: fetchBalance,
    };
}
