"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePythPrices } from "../lib/pyth";

// FX pairs for triangular arbitrage detection
const TRIANGULAR_ROUTES = [
    { name: "EUR-USD-JPY", pairs: ["EUR/USD", "USD/JPY", "EUR/JPY"] },
    { name: "GBP-USD-CHF", pairs: ["GBP/USD", "USD/CHF", "GBP/CHF"] },
    { name: "AUD-USD-JPY", pairs: ["AUD/USD", "USD/JPY", "AUD/JPY"] },
    { name: "EUR-USD-CHF", pairs: ["EUR/USD", "USD/CHF", "EUR/CHF"] },
];

export interface ArbOpportunity {
    id: string;
    route: string;
    legs: string[];
    estimatedProfit: number; // Percentage
    confidence: "High" | "Medium" | "Low";
    prices: { pair: string; price: number }[];
    timestamp: number;
}

// Calculate triangular arbitrage profit
function calculateTriangularProfit(
    priceA: number, // e.g., EUR/USD
    priceB: number, // e.g., USD/JPY
    priceC: number, // e.g., EUR/JPY (cross rate)
): number {
    // Synthetic rate: EUR/USD * USD/JPY = EUR/JPY synthetic
    const syntheticRate = priceA * priceB;
    // Profit = (synthetic - actual) / actual * 100
    const profit = ((syntheticRate - priceC) / priceC) * 100;
    return Math.abs(profit); // Arb works both directions
}

function getConfidence(profit: number): "High" | "Medium" | "Low" {
    if (profit > 0.1) return "High";
    if (profit > 0.05) return "Medium";
    return "Low";
}

export function useArbitrage() {
    const allPairs = Array.from(new Set(TRIANGULAR_ROUTES.flatMap(r => r.pairs)));
    const { prices, loading: pricesLoading } = usePythPrices(allPairs);

    const [opportunities, setOpportunities] = useState<ArbOpportunity[]>([]);
    const [executedArbs, setExecutedArbs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalProfit: 0,
        totalTrades: 0,
        winRate: 0,
        avgProfit: 0,
    });

    // Detect arbitrage opportunities from real-time prices
    const detectOpportunities = useCallback(() => {
        if (!prices || Object.keys(prices).length === 0) return;

        const detected: ArbOpportunity[] = [];

        for (const route of TRIANGULAR_ROUTES) {
            const [pairA, pairB, pairC] = route.pairs;
            const priceA = prices[pairA]?.price;
            const priceB = prices[pairB]?.price;
            const priceC = prices[pairC]?.price;

            if (!priceA || !priceB || !priceC) continue;

            const profit = calculateTriangularProfit(priceA, priceB, priceC);

            // Only show if profit > 0.02% (above typical spread)
            if (profit > 0.02) {
                detected.push({
                    id: `${route.name}-${Date.now()}`,
                    route: route.name,
                    legs: route.pairs,
                    estimatedProfit: profit,
                    confidence: getConfidence(profit),
                    prices: [
                        { pair: pairA, price: priceA },
                        { pair: pairB, price: priceB },
                        { pair: pairC, price: priceC },
                    ],
                    timestamp: Date.now(),
                });
            }
        }

        // Sort by profit descending
        detected.sort((a, b) => b.estimatedProfit - a.estimatedProfit);
        setOpportunities(detected);
        setLoading(false);
    }, [prices]);

    useEffect(() => {
        detectOpportunities();
    }, [detectOpportunities]);

    // Execute arb (would call trading_engine in production)
    const executeArb = async (opportunity: ArbOpportunity, size: number) => {
        // In production: open 3 positions atomically via trading_engine
        console.log("Executing arb:", opportunity.route, "size:", size);

        // Mock execution result
        const executedArb = {
            id: Date.now(),
            route: opportunity.route,
            legs: opportunity.legs,
            profit: opportunity.estimatedProfit * 0.8, // Slippage simulation
            size,
            time: new Date().toLocaleTimeString(),
        };

        setExecutedArbs(prev => [executedArb, ...prev].slice(0, 10));
        setStats(prev => ({
            totalProfit: prev.totalProfit + (size * opportunity.estimatedProfit / 100),
            totalTrades: prev.totalTrades + 1,
            winRate: 100, // Mock
            avgProfit: (prev.totalProfit + (size * opportunity.estimatedProfit / 100)) / (prev.totalTrades + 1),
        }));

        return executedArb;
    };

    return {
        opportunities,
        executedArbs,
        stats,
        loading: loading || pricesLoading,
        executeArb,
        refresh: detectOpportunities,
    };
}
