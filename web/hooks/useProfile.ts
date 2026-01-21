"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Program, AnchorProvider, Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import tradingIdl from "../idl/trading_engine.json";
import bootstrapIdl from "../idl/bootstrap.json";
import creditsIdl from "../idl/credits.json";

const TRADING_PROGRAM_ID = new PublicKey(tradingIdl.address);
const BOOTSTRAP_PROGRAM_ID = new PublicKey(bootstrapIdl.address);
const CREDITS_PROGRAM_ID = new PublicKey(creditsIdl.address);

export interface ProfileStats {
    // Trading Stats
    totalTrades: number;
    winRate: number;
    totalVolume: number;
    totalPnL: number;
    bestTrade: number;
    worstTrade: number;
    avgHoldTime: string;

    // Credit Stats
    creditBalance: number;
    lifetimeCreditsEarned: number;
    lifetimeCreditsSpent: number;

    // Bootstrap Stats
    bootstrapContribution: number;
    tier: string;
    rank: number;

    // Account
    joinDate: string;
    openPositions: number;
}

export function useProfile() {
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const [stats, setStats] = useState<ProfileStats | null>(null);
    const [badges, setBadges] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const programs = useMemo(() => {
        if (!wallet) return null;
        const provider = new AnchorProvider(connection, wallet, {});
        return {
            trading: new Program(tradingIdl as unknown as Idl, provider),
            bootstrap: new Program(bootstrapIdl as unknown as Idl, provider),
            credits: new Program(creditsIdl as unknown as Idl, provider),
        };
    }, [connection, wallet]);

    const fetchProfile = useCallback(async () => {
        if (!programs || !wallet) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch Trading Stats
            let totalTrades = 0;
            let totalVolume = 0;
            let totalPnL = 0;
            let openPositions = 0;
            let bestTrade = 0;
            let worstTrade = 0;

            let closedPositions = 0;
            let winningTrades = 0;
            let totalHoldTimeSeconds = 0;

            try {
                const positions = await (programs.trading.account as any).position.all([
                    { memcmp: { offset: 8, bytes: wallet.publicKey.toBase58() } }
                ]);

                totalTrades = positions.length;
                const currentTime = Math.floor(Date.now() / 1000);

                for (const pos of positions) {
                    const size = pos.account.size?.toNumber() || 0;
                    const entryPrice = pos.account.entryPrice?.toNumber() || 0;
                    const openedAt = pos.account.openedAt?.toNumber() || currentTime;
                    const margin = pos.account.margin?.toNumber() || 0;

                    totalVolume += size / 1_000_000;

                    if (pos.account.isOpen) {
                        openPositions++;
                    } else {
                        // Closed position - calculate PnL metrics
                        closedPositions++;
                        // Note: We don't have exit price stored, so we estimate
                        // In production, an indexer would track actual realized PnL
                        const holdTime = currentTime - openedAt;
                        totalHoldTimeSeconds += holdTime;
                    }
                }
            } catch (e) {
                console.log("No trading positions found");
            }

            // Fetch Credit Stats
            let creditBalance = 0;
            let lifetimeCreditsEarned = 0;
            let lifetimeCreditsSpent = 0;

            try {
                const [creditAccountPda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("credit_account"), wallet.publicKey.toBuffer()],
                    CREDITS_PROGRAM_ID
                );
                const creditAccount = await (programs.credits.account as any).creditAccount.fetch(creditAccountPda);
                creditBalance = creditAccount.balance?.toNumber() || 0;
                lifetimeCreditsEarned = creditAccount.lifetimeEarned?.toNumber() || 0;
                lifetimeCreditsSpent = creditAccount.lifetimeSpent?.toNumber() || 0;
            } catch (e) {
                console.log("No credit account found");
            }

            // Fetch Bootstrap Stats
            let bootstrapContribution = 0;
            let tier = "Owlet";
            let rank = 0;

            try {
                const [contributionPda] = PublicKey.findProgramAddressSync(
                    [Buffer.from("contribution"), wallet.publicKey.toBuffer()],
                    BOOTSTRAP_PROGRAM_ID
                );
                const contribution = await (programs.bootstrap.account as any).contribution.fetch(contributionPda);
                bootstrapContribution = contribution.amount?.toNumber() / 1_000_000 || 0;
                rank = contribution.rank?.toNumber() || 0;

                // Determine tier from rank
                if (rank <= 10) tier = "Snowy";
                else if (rank <= 50) tier = "Great Horned";
                else if (rank <= 100) tier = "Eagle";
                else if (rank <= 500) tier = "Barn";
                else tier = "Screech";
            } catch (e) {
                console.log("No bootstrap contribution found");
            }

            // Calculate stats from actual position data
            // Note: Full PnL tracking requires an off-chain indexer that records exit prices
            // For now, show what we can calculate from on-chain data
            const winRate = closedPositions > 0 ? Math.round((winningTrades / closedPositions) * 100) : 0;
            const avgHoldTimeHours = closedPositions > 0
                ? Math.round((totalHoldTimeSeconds / closedPositions) / 3600)
                : 0;

            // Determine badges
            const calculatedBadges = [];
            if (bootstrapContribution > 0) {
                calculatedBadges.push({ name: "Founding Trader", emoji: "🏆", description: "Bootstrap participant", earned: true });
            }
            if (totalTrades > 0) {
                calculatedBadges.push({ name: "First Trade", emoji: "🎯", description: "Completed first trade", earned: true });
            }
            if (totalVolume >= 1000) {
                calculatedBadges.push({ name: "1K Volume", emoji: "📈", description: "Traded $1K+ volume", earned: true });
            }
            if (totalVolume >= 10000) {
                calculatedBadges.push({ name: "10K Volume", emoji: "💰", description: "Traded $10K+ volume", earned: true });
            }
            if (totalVolume >= 100000) {
                calculatedBadges.push({ name: "100K Volume", emoji: "🚀", description: "Traded $100K+ volume", earned: true });
            }

            setBadges(calculatedBadges);
            setStats({
                totalTrades,
                winRate,
                totalVolume,
                totalPnL,
                bestTrade,
                worstTrade,
                avgHoldTime: closedPositions > 0 ? `~${avgHoldTimeHours} hours` : "--",
                creditBalance,
                lifetimeCreditsEarned,
                lifetimeCreditsSpent,
                bootstrapContribution,
                tier,
                rank,
                joinDate: bootstrapContribution > 0 ? "Bootstrap Era" : "--",
                openPositions,
            });
        } catch (e) {
            console.error("Error fetching profile:", e);
        } finally {
            setLoading(false);
        }
    }, [programs, wallet]);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    return {
        stats,
        badges,
        loading,
        refresh: fetchProfile,
    };
}
