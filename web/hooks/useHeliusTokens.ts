"use client";

/**
 * useHeliusTokens Hook
 * 
 * Fetches token balances and metadata using Helius Token API
 * Provides faster, pre-parsed token data compared to standard RPC calls
 */

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getTokenBalances, getTransactionHistory, TokenBalance } from "@/lib/helius";

export interface HeliusToken extends TokenBalance {
    // Helius provides enriched metadata
    priceUsd?: number;
    valueUsd?: number;
}

export interface TransactionSummary {
    signature: string;
    timestamp: number;
    type: string;
    description: string;
    fee: number;
    success: boolean;
}

export function useHeliusTokens() {
    const { publicKey } = useWallet();
    const [tokens, setTokens] = useState<HeliusToken[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTokens = useCallback(async () => {
        if (!publicKey) {
            setTokens([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const balances = await getTokenBalances(publicKey.toBase58());

            // Filter out zero balances and sort by amount
            const nonZeroTokens = balances
                .filter(t => t.amount > 0)
                .sort((a, b) => b.amount - a.amount);

            setTokens(nonZeroTokens);
        } catch (err) {
            console.error("[useHeliusTokens] Failed to fetch:", err);
            setError("Failed to fetch token balances");
        } finally {
            setLoading(false);
        }
    }, [publicKey]);

    useEffect(() => {
        fetchTokens();

        // Refresh every 30 seconds
        const interval = setInterval(fetchTokens, 30000);
        return () => clearInterval(interval);
    }, [fetchTokens]);

    return {
        tokens,
        loading,
        error,
        refresh: fetchTokens,
    };
}

export function useHeliusTransactions(limit: number = 20) {
    const { publicKey } = useWallet();
    const [transactions, setTransactions] = useState<TransactionSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = useCallback(async () => {
        if (!publicKey) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const history = await getTransactionHistory(publicKey.toBase58(), limit);

            // Parse Helius enhanced transaction format
            const parsed: TransactionSummary[] = history.map((tx: any) => ({
                signature: tx.signature,
                timestamp: tx.timestamp * 1000, // Convert to ms
                type: tx.type || "Unknown",
                description: tx.description || `${tx.type || "Transaction"}`,
                fee: tx.fee || 0,
                success: tx.transactionError === null,
            }));

            setTransactions(parsed);
        } catch (err) {
            console.error("[useHeliusTransactions] Failed to fetch:", err);
            setError("Failed to fetch transaction history");
        } finally {
            setLoading(false);
        }
    }, [publicKey, limit]);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    return {
        transactions,
        loading,
        error,
        refresh: fetchTransactions,
    };
}
