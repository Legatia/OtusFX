"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl, BN, utils } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import { getAssociatedTokenAddress, TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { getFeedId } from "../lib/pyth";
import idl from "../idl/trading_engine.json";

const PROGRAM_ID = new PublicKey(idl.address);

export function useTrading() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();

    const program = useMemo(() => {
        if (!wallet) return null;
        const provider = new AnchorProvider(connection, wallet, {});
        return new Program(idl as unknown as Idl, provider);
    }, [connection, wallet]);

    // Helper to map string pair (EUR/USD) to Anchor enum ({ eurUsd: {} })
    const mapPairToEnum = (pair: string) => {
        // Remove slash and camelCase
        // EUR/USD -> eurUsd
        const [base, quote] = pair.split("/");
        const camel = base.toLowerCase() + quote.charAt(0).toUpperCase() + quote.slice(1).toLowerCase();
        return { [camel]: {} };
    };

    // Helper to map string side to Anchor enum
    const mapSideToEnum = (side: "long" | "short") => {
        return { [side]: {} };
    };

    const openPosition = async (
        pair: string,
        side: "long" | "short",
        marginAmount: number,
        leverage: number,
        isPrivate: boolean
    ) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        try {
            console.log("Initializing trade...");

            // 1. Derive Config PDA
            const [configPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("config")],
                PROGRAM_ID
            );

            // 2. Fetch Config to get Vault and Total Positions
            const configAccount = await (program.account as any).tradingConfig.fetch(configPda);
            const totalPositions = configAccount.totalPositions as BN;
            const usdcVault = configAccount.usdcVault as PublicKey;

            // 3. Derive Position PDA: [b"position", owner, total_positions]
            // Note: totalPositions is BN, need little-endian 8 bytes
            const [positionPda] = PublicKey.findProgramAddressSync(
                [
                    Buffer.from("position"),
                    wallet.publicKey.toBuffer(),
                    totalPositions.toArrayLike(Buffer, "le", 8),
                ],
                PROGRAM_ID
            );

            // 4. Get User ATA
            // Fetch Mint from Vault Account to be sure
            const vaultInfo = await connection.getParsedAccountInfo(usdcVault);
            const vaultData = vaultInfo.value?.data as any; // ParsedAccountData
            const mintAddress = new PublicKey(vaultData.parsed.info.mint);

            const userUsdc = await getAssociatedTokenAddress(mintAddress, wallet.publicKey);

            // 5. Get Pyth Feed
            const priceFeed = getFeedId(pair);

            console.log("Sending tx...", {
                pair: mapPairToEnum(pair),
                side: mapSideToEnum(side),
                margin: marginAmount,
                leverage,
                feeds: {
                    config: configPda.toBase58(),
                    position: positionPda.toBase58(),
                    priceFeed: priceFeed.toBase58()
                }
            });

            // 6. Execute Instruction
            const tx = await program.methods
                .openPosition(
                    mapPairToEnum(pair),
                    mapSideToEnum(side),
                    new BN(marginAmount * 1_000_000), // Convert to 6 decimals (USDC)
                    leverage,
                    isPrivate
                )
                .accounts({
                    config: configPda,
                    position: positionPda,
                    owner: wallet.publicKey,
                    userUsdc: userUsdc,
                    usdcVault: usdcVault,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    priceFeed: priceFeed,
                    systemProgram: SystemProgram.programId,
                })
                .rpc();

            console.log("Trade executed:", tx);
            return tx;

        } catch (error) {
            console.error("Trade failed:", error);
            throw error;
        }
    };

    /**
     * Close a position and settle PnL
     */
    const closePosition = async (positionPubkey: PublicKey, pair: string) => {
        if (!program || !wallet) throw new Error("Wallet not connected");

        try {
            console.log("Closing position...", positionPubkey.toBase58());

            // 1. Derive Config PDA
            const [configPda] = PublicKey.findProgramAddressSync(
                [Buffer.from("config")],
                PROGRAM_ID
            );

            // 2. Fetch Config to get Vault
            const configAccount = await (program.account as any).tradingConfig.fetch(configPda);
            const usdcVault = configAccount.usdcVault as PublicKey;

            // 3. Get User ATA
            const vaultInfo = await connection.getParsedAccountInfo(usdcVault);
            const vaultData = vaultInfo.value?.data as any;
            const mintAddress = new PublicKey(vaultData.parsed.info.mint);
            const userUsdc = await getAssociatedTokenAddress(mintAddress, wallet.publicKey);

            // 4. Get Pyth Feed for this pair
            const priceFeed = getFeedId(pair);

            console.log("Sending close tx...", {
                position: positionPubkey.toBase58(),
                priceFeed: priceFeed.toBase58()
            });

            // 5. Execute Close Instruction
            const tx = await program.methods
                .closePosition()
                .accounts({
                    config: configPda,
                    position: positionPubkey,
                    owner: wallet.publicKey,
                    userUsdc: userUsdc,
                    usdcVault: usdcVault,
                    tokenProgram: TOKEN_PROGRAM_ID,
                    priceFeed: priceFeed,
                })
                .rpc();

            console.log("Position closed:", tx);
            return tx;

        } catch (error) {
            console.error("Close position failed:", error);
            throw error;
        }
    };

    return { openPosition, closePosition, program };
}

export function usePositions() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [positions, setPositions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const program = useMemo(() => {
        if (!wallet) return null;
        const provider = new AnchorProvider(connection, wallet, {});
        return new Program(idl as unknown as Idl, provider);
    }, [connection, wallet]);

    const fetchPositions = useCallback(async () => {
        if (!program || !wallet) return;
        try {
            setLoading(true);
            // Fetch all position accounts owned by this wallet
            const allPositions = await (program.account as any).position.all([
                {
                    memcmp: {
                        offset: 8, // Discriminator
                        bytes: wallet.publicKey.toBase58(),
                    },
                },
            ]);

            // Import PnL utilities
            const { fetchLatestPrice, calculatePnL, calculatePnLPercent } = await import('../lib/pyth');

            const formattedPositions = await Promise.all(allPositions.map(async (p: any) => {
                const account = p.account;
                const pairKey = Object.keys(account.pair)[0]; // e.g. "eurUsd"
                const pair = pairKey.slice(0, 3).toUpperCase() + '/' + pairKey.slice(3).toUpperCase(); // EUR/USD
                const side = Object.keys(account.side)[0].toUpperCase(); // LONG or SHORT
                const size = account.size.toNumber() / 1_000_000;
                const margin = account.margin.toNumber() / 1_000_000;
                const entryPrice = account.entryPrice.toNumber() / 1_000_000;

                // Fetch current price from Pyth
                const currentPrice = await fetchLatestPrice(pair);

                // Calculate PnL
                let pnl = 0;
                let pnlPercent = 0;
                if (currentPrice) {
                    pnl = calculatePnL(entryPrice, currentPrice, size, side);
                    pnlPercent = calculatePnLPercent(pnl, margin);
                }

                return {
                    publicKey: p.publicKey,
                    pair: pairKey.slice(0, 3).toUpperCase() + pairKey.slice(3).toUpperCase(), // EURUSD
                    side,
                    size,
                    margin,
                    entryPrice,
                    leverage: account.leverage,
                    pnl,
                    pnlPercent,
                    currentPrice,
                    isOpen: account.isOpen,
                };
            }));

            setPositions(formattedPositions.filter((p: any) => p.isOpen));
        } catch (e) {
            console.error("Failed to fetch positions", e);
        } finally {
            setLoading(false);
        }
    }, [program, wallet]);

    // Initial fetch
    useEffect(() => {
        fetchPositions();
    }, [fetchPositions]);

    // Poll every 10s
    useEffect(() => {
        const interval = setInterval(fetchPositions, 10000);
        return () => clearInterval(interval);
    }, [fetchPositions]);

    return { positions, loading, refetch: fetchPositions };
}
