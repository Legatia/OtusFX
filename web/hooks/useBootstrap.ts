"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN, utils } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import idl from "../idl/bootstrap.json";

const PROGRAM_ID = new PublicKey(idl.address);

export function useBootstrap() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [totalRaised, setTotalRaised] = useState(0);
    const [userContribution, setUserContribution] = useState(0);
    const [credits, setCredits] = useState(0);
    const [tier, setTier] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const program = useMemo(() => {
        if (!wallet) return null;
        const provider = new AnchorProvider(connection, wallet, {});
        return new Program(idl as unknown as Idl, provider);
    }, [connection, wallet]);

    // Fetch Global Stats
    const fetchStats = useCallback(async () => {
        if (!program) return;
        try {
            const [configPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("bootstrap_config")],
                PROGRAM_ID
            );
            const config = await (program.account as any).bootstrapConfig.fetch(configPda);
            setTotalRaised(config.totalRaised.toNumber() / 1_000_000);
        } catch (e) {
            console.error("Error fetching bootstrap stats", e);
        }
    }, [program]);

    // Fetch User Stats
    const fetchUserStats = useCallback(async () => {
        if (!program || !wallet) return;
        try {
            const [contributionPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("contribution"), wallet.publicKey.toBuffer()],
                PROGRAM_ID
            );
            const contribution = await (program.account as any).contribution.fetch(contributionPda);
            const amount = contribution.amount.toNumber() / 1_000_000;
            setUserContribution(amount);

            // Calculate Credits (Mock logic based on amount + time multiplier)
            // In real app, this field would come from contract
            const calculatedCredits = amount * 21 * 2;
            setCredits(calculatedCredits);

            // Determine Tier
            if (calculatedCredits > 50000) setTier("Great Horned");
            else if (calculatedCredits > 20000) setTier("Snowy");
            else if (calculatedCredits > 10000) setTier("Barn");
            else if (calculatedCredits > 0) setTier("Screech");
            else setTier(null);

        } catch (e) {
            // User hasn't contributed yet
            setUserContribution(0);
            setCredits(0);
            setTier(null);
        } finally {
            setLoading(false);
        }
    }, [program, wallet]);

    useEffect(() => {
        fetchStats();
        if (wallet) fetchUserStats();
    }, [fetchStats, fetchUserStats, wallet]);

    // Public Deposit (Standard)
    const depositPublic = async (amount: number) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bootstrap_config")],
            PROGRAM_ID
        );

        const [contributionPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("contribution"), wallet.publicKey.toBuffer()],
            PROGRAM_ID
        );

        const config = await (program.account as any).bootstrapConfig.fetch(configPda);
        const usdcVault = config.usdcVault as PublicKey;

        // Get Mint from Vault to be safe (or hardcode USDC)
        const vaultInfo = await connection.getParsedAccountInfo(usdcVault);
        const vaultData = vaultInfo.value?.data as any;
        const mintAddress = new PublicKey(vaultData.parsed.info.mint);

        const userUsdc = await getAssociatedTokenAddress(mintAddress, wallet.publicKey);

        const tx = await program.methods
            .deposit(new BN(amount * 1_000_000))
            .accounts({
                config: configPda,
                contribution: contributionPda,
                depositor: wallet.publicKey,
                userUsdc: userUsdc,
                usdcVault: usdcVault,
                tokenProgram: TOKEN_PROGRAM_ID,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        await fetchStats();
        await fetchUserStats();
        return tx;
    };

    // Private Deposit (ZK Proof)
    const depositPrivate = async (amount: number, proofHash: string) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bootstrap_config")],
            PROGRAM_ID
        );

        const [contributionPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("contribution"), wallet.publicKey.toBuffer()],
            PROGRAM_ID
        );

        // Convert hex string proof to byte array (padded/truncated to 32 bytes)
        const hexString = proofHash.replace("0x", "").padEnd(64, '0').slice(0, 64);
        const proofBytes = Array.from(Buffer.from(hexString, "hex"));

        const tx = await program.methods
            .depositPrivate(
                new BN(amount * 1_000_000),
                proofBytes
            )
            .accounts({
                config: configPda,
                contribution: contributionPda,
                depositor: wallet.publicKey,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        await fetchStats();
        await fetchUserStats();
        return tx;
    };

    return {
        totalRaised,
        userContribution,
        credits,
        tier,
        loading,
        depositPublic,
        depositPrivate,
        refresh: () => { fetchStats(); fetchUserStats(); }
    };
}
