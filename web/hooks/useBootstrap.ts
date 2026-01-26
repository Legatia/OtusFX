"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN, utils } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import idl from "../idl/bootstrap.json";

const PROGRAM_ID = new PublicKey(idl.address);

// Token mints (devnet)
const USDC_MINT = new PublicKey("4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU"); // ✅ Devnet USDC
const USD1_MINT = new PublicKey("2yyHi6Q84oyjmAcMqP9UfuCmftzSjbFpXxTDRUZN9GFi"); // ✅ Devnet USD1 (test)
const OTUS_MINT = new PublicKey("Bax4q8hoKoAFsN5GTCggMXkDUTyroLFmeveF9hm7rttV"); // ✅ Devnet OTUS Token

export type StablecoinType = "USDC" | "USD1";

export function useBootstrap() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [totalRaisedUsdc, setTotalRaisedUsdc] = useState(0);
    const [totalRaisedUsd1, setTotalRaisedUsd1] = useState(0);
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
            setTotalRaisedUsdc(config.totalDepositedUsdc.toNumber() / 1_000_000);
            setTotalRaisedUsd1(config.totalDepositedUsd1.toNumber() / 1_000_000);
        } catch (e) {
            console.error("Error fetching bootstrap stats", e);
        }
    }, [program]);

    // Fetch User Stats
    const fetchUserStats = useCallback(async () => {
        if (!program || !wallet) return;
        try {
            const [userDepositPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("user_deposit"), wallet.publicKey.toBuffer()],
                PROGRAM_ID
            );
            const userDeposit = await (program.account as any).userDeposit.fetch(userDepositPda);
            const totalUsdValue = userDeposit.totalUsdValue.toNumber() / 1_000_000;
            setUserContribution(totalUsdValue);

            // Credits from contract
            const otusAllocation = userDeposit.otusAllocation.toNumber() / 1_000_000;
            setCredits(otusAllocation);

            // Tier from contract (enum: None, Screech, Barn, Snowy, GreatHorned)
            const tierEnum = userDeposit.scopsTier;
            if (tierEnum.greatHorned) setTier("Great Horned");
            else if (tierEnum.snowy) setTier("Snowy");
            else if (tierEnum.barn) setTier("Barn");
            else if (tierEnum.screech) setTier("Screech");
            else setTier(null);

        } catch (e) {
            // User hasn't deposited yet
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

    // Initialize user deposit account (must be called before first deposit)
    const initializeUserDeposit = async () => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bootstrap_config")],
            PROGRAM_ID
        );

        const [userDepositPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_deposit"), wallet.publicKey.toBuffer()],
            PROGRAM_ID
        );

        const tx = await program.methods
            .initializeUserDeposit()
            .accounts({
                user: wallet.publicKey,
                bootstrapConfig: configPda,
                userDeposit: userDepositPda,
                systemProgram: SystemProgram.programId,
            })
            .rpc();

        await fetchUserStats();
        return tx;
    };

    // Public Deposit (Standard) - supports both USDC and USD1
    const depositPublic = async (amount: number, stablecoinType: StablecoinType = "USDC") => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bootstrap_config")],
            PROGRAM_ID
        );

        const [userDepositPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_deposit"), wallet.publicKey.toBuffer()],
            PROGRAM_ID
        );

        const config = await (program.account as any).bootstrapConfig.fetch(configPda);
        const usdcVault = config.usdcVault as PublicKey;
        const usd1Vault = config.usd1Vault as PublicKey;

        // Get user's token account
        const tokenMint = stablecoinType === "USDC" ? USDC_MINT : USD1_MINT;
        const userTokenAccount = await getAssociatedTokenAddress(tokenMint, wallet.publicKey);

        // Map stablecoin type to enum
        const stablecoinEnum = stablecoinType === "USDC" ? { usdc: {} } : { usd1: {} };

        const tx = await program.methods
            .depositUsdc(stablecoinEnum, new BN(amount * 1_000_000))
            .accounts({
                user: wallet.publicKey,
                bootstrapConfig: configPda,
                userDeposit: userDepositPda,
                usdcVault,
                usd1Vault,
                userTokenAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
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

    // Add mint NFT and claim OTUS methods
    const mintScopsNFT = async () => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bootstrap_config")],
            PROGRAM_ID
        );

        const [userDepositPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_deposit"), wallet.publicKey.toBuffer()],
            PROGRAM_ID
        );

        // TODO: Add NFT mint accounts when Metaplex integration is ready
        const tx = await program.methods
            .mintScops()
            .accounts({
                user: wallet.publicKey,
                bootstrapConfig: configPda,
                userDeposit: userDepositPda,
                // ... additional NFT accounts
            })
            .rpc();

        await fetchUserStats();
        return tx;
    };

    const claimOTUS = async () => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        const [configPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("bootstrap_config")],
            PROGRAM_ID
        );

        const [userDepositPda] = PublicKey.findProgramAddressSync(
            [Buffer.from("user_deposit"), wallet.publicKey.toBuffer()],
            PROGRAM_ID
        );

        const config = await (program.account as any).bootstrapConfig.fetch(configPda);
        const otusVault = config.otusVault as PublicKey;

        const userOtusAccount = await getAssociatedTokenAddress(
            OTUS_MINT,
            wallet.publicKey
        );

        const tx = await program.methods
            .claimOtus()
            .accounts({
                user: wallet.publicKey,
                bootstrapConfig: configPda,
                userDeposit: userDepositPda,
                otusVault,
                userOtusAccount,
                tokenProgram: TOKEN_PROGRAM_ID,
            })
            .rpc();

        await fetchUserStats();
        return tx;
    };

    return {
        totalRaised: totalRaisedUsdc + totalRaisedUsd1,
        totalRaisedUsdc,
        totalRaisedUsd1,
        userContribution,
        credits,
        tier,
        loading,
        initializeUserDeposit,
        depositPublic,
        depositPrivate,
        mintScopsNFT,
        claimOTUS,
        refresh: () => { fetchStats(); fetchUserStats(); }
    };
}
