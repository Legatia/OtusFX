import { PublicKey } from "@solana/web3.js";
import { useEffect, useState, useMemo } from "react";
import { HermesClient } from "@pythnetwork/hermes-client";

// ==========================================
// 1. Pyth Price Feed IDs (Universal Hex IDs)
// These are the canonical Pyth Feed IDs used by Hermes
// ==========================================

// Correct Pyth Price Feed IDs from pyth.network
const PYTH_FEED_IDS: Record<string, string> = {
    // Major pairs
    "EUR/USD": "a995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b",
    "GBP/USD": "84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1",
    "USD/JPY": "ef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52",
    "AUD/USD": "67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80",
    "USD/CAD": "3112b03a41c910ed446852aacf67118cb1bec67b2cd0b9a214c58cc0eaa2ecca",
    "USD/CHF": "0b1e3297e69f162877b577b0d6a47a0d63b2392bc8499e6540da4187a63e28f8",
    // Cross pairs (for triangular arbitrage)
    "EUR/JPY": "d8c874fa511b9838d094109f996890642421e462c3b29501a2560cecf82c2eb4",
    "GBP/CHF": "ae95ee182ff568100d09257956a01d6bd663072e62fe108bae42ecca4400f527",
    "AUD/JPY": "8dbbb66dff44114f0bfc34a1d19f0fe6fc3906dcc72f7668d3ea936e1d6544ce",
    "EUR/CHF": "6194ee9b4ae25932ae69e6574871801f0f30b4a3317877c55301a45902aa0c1a",
    "EUR/GBP": "c349ff6087acab1c0c5442a9de0ea804239cc9fd09be8b1a93ffa0ed7f366d9c",
};

// For Solana contract, we still need PublicKeys derived from the Feed IDs
// Note: On Solana, you'd use PythSolanaReceiver to get the actual price account
export const PYTH_FEEDS = {
    "EUR/USD": new PublicKey(Buffer.from(PYTH_FEED_IDS["EUR/USD"], "hex")),
    "GBP/USD": new PublicKey(Buffer.from(PYTH_FEED_IDS["GBP/USD"], "hex")),
    "USD/JPY": new PublicKey(Buffer.from(PYTH_FEED_IDS["USD/JPY"], "hex")),
    "AUD/USD": new PublicKey(Buffer.from(PYTH_FEED_IDS["AUD/USD"], "hex")),
    "USD/CAD": new PublicKey(Buffer.from(PYTH_FEED_IDS["USD/CAD"], "hex")),
    "USD/CHF": new PublicKey(Buffer.from(PYTH_FEED_IDS["USD/CHF"], "hex")),
    "EUR/JPY": new PublicKey(Buffer.from(PYTH_FEED_IDS["EUR/JPY"], "hex")),
    "GBP/CHF": new PublicKey(Buffer.from(PYTH_FEED_IDS["GBP/CHF"], "hex")),
    "AUD/JPY": new PublicKey(Buffer.from(PYTH_FEED_IDS["AUD/JPY"], "hex")),
    "EUR/CHF": new PublicKey(Buffer.from(PYTH_FEED_IDS["EUR/CHF"], "hex")),
    "EUR/GBP": new PublicKey(Buffer.from(PYTH_FEED_IDS["EUR/GBP"], "hex")),
};

export function getFeedId(pair: string): PublicKey {
    const feed = PYTH_FEEDS[pair as keyof typeof PYTH_FEEDS];
    if (!feed) {
        throw new Error(`Price feed not found for pair: ${pair}`);
    }
    return feed;
}

// ==========================================
// 2. Frontend Utilities & Hooks (Hermes)
// ==========================================

export const FX_PAIRS = [
    "EUR/USD",
    "GBP/USD",
    "USD/JPY",
    "AUD/USD",
    "USD/CAD",
    "USD/CHF",
];

export const PAIR_INFO: Record<string, { decimals: number }> = {
    "EUR/USD": { decimals: 4 },
    "GBP/USD": { decimals: 4 },
    "USD/JPY": { decimals: 2 },
    "AUD/USD": { decimals: 4 },
    "USD/CAD": { decimals: 4 },
    "USD/CHF": { decimals: 4 },
    "EUR/JPY": { decimals: 2 },
    "GBP/CHF": { decimals: 4 },
    "AUD/JPY": { decimals: 2 },
    "EUR/CHF": { decimals: 4 },
    "EUR/GBP": { decimals: 4 },
};

export const formatPrice = (price: number, decimals: number = 4) => {
    return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
    }).format(price);
};

export function usePythPrices(pairs: string[]) {
    const [prices, setPrices] = useState<Record<string, { price: number; high24h: number; low24h: number; isLive: boolean; lastUpdate?: Date; isMarketClosed?: boolean }>>({});
    const [loading, setLoading] = useState(true);

    // Using public Hermes endpoint with HermesClient
    const client = useMemo(() => new HermesClient("https://hermes.pyth.network"), []);

    useEffect(() => {
        const fetchPrices = async () => {
            // 1. Get IDs (prefixed with 0x for Hermes)
            const ids = pairs
                .map(p => PYTH_FEED_IDS[p])
                .filter(Boolean)
                .map(id => `0x${id}`);

            if (ids.length === 0) return;

            try {
                const priceUpdate = await client.getLatestPriceUpdates(ids, { parsed: true });
                if (!priceUpdate?.parsed) return;

                const newPrices: Record<string, any> = {};

                priceUpdate.parsed.forEach((feed: any) => {
                    // Find the pair name for this feed ID (strip 0x for comparison)
                    const feedIdClean = feed.id.replace(/^0x/, '');
                    const pairName = Object.keys(PYTH_FEED_IDS).find(key => PYTH_FEED_IDS[key] === feedIdClean);
                    if (!pairName) return;

                    const priceData = feed.price;
                    if (priceData) {
                        const price = Number(priceData.price) * Math.pow(10, priceData.expo);
                        newPrices[pairName] = {
                            price,
                            high24h: price * 1.005, // Mock 24h stats for demo
                            low24h: price * 0.995,
                            isLive: true,
                            lastUpdate: new Date(),
                            isMarketClosed: false,
                        };
                    }
                });

                setPrices(p => ({ ...p, ...newPrices }));
                setLoading(false);
            } catch (err) {
                console.error("Pyth fetch error:", err);
            }
        };

        // Initial fetch
        fetchPrices();

        // Poll every 2s
        const interval = setInterval(fetchPrices, 2000);

        return () => clearInterval(interval);
    }, [pairs, client]);

    return { prices, loading };
}

// ==========================================
// 3. PnL Calculation Utilities
// ==========================================

/**
 * Calculate PnL for a position
 * @param entryPrice - Entry price of the position (6 decimals)
 * @param currentPrice - Current market price (6 decimals)
 * @param size - Position size (notional value in USDC, 6 decimals)
 * @param side - 'LONG' or 'SHORT'
 * @returns PnL in USDC
 */
export function calculatePnL(
    entryPrice: number,
    currentPrice: number,
    size: number,
    side: string
): number {
    if (entryPrice === 0 || currentPrice === 0) return 0;

    // Price change percentage
    const priceChangePercent = (currentPrice - entryPrice) / entryPrice;

    // PnL is size * price_change_percent for long, negative for short
    const pnl = side.toUpperCase() === 'LONG'
        ? size * priceChangePercent
        : -size * priceChangePercent;

    return pnl;
}

/**
 * Calculate PnL percentage based on margin
 */
export function calculatePnLPercent(pnl: number, margin: number): number {
    if (margin === 0) return 0;
    return (pnl / margin) * 100;
}

/**
 * Get Hermes client for fetching latest prices (Singleton)
 */
let hermesClientInstance: HermesClient | null = null;

export function createHermesClient() {
    if (!hermesClientInstance) {
        hermesClientInstance = new HermesClient("https://hermes.pyth.network");
    }
    return hermesClientInstance;
}

/**
 * Fetch latest price for a single pair
 */
export async function fetchLatestPrice(pair: string): Promise<number | null> {
    try {
        const client = createHermesClient();
        const feedIdHex = PYTH_FEED_IDS[pair];
        if (!feedIdHex) return null;

        const priceUpdates = await client.getLatestPriceUpdates([`0x${feedIdHex}`]);
        if (priceUpdates.parsed && priceUpdates.parsed.length > 0) {
            const update = priceUpdates.parsed[0];
            const price = Number(update.price.price) * Math.pow(10, update.price.expo);
            return price;
        }
        return null;
    } catch (error) {
        console.error(`Failed to fetch price for ${pair}:`, error);
        return null;
    }
}

// ==========================================
// 4. Triangular Arbitrage Monitor
// ==========================================

// Triangular arbitrage routes
const TRIANGULAR_ROUTES = [
    { name: "EUR-USD-JPY", pairs: ["EUR/USD", "USD/JPY", "EUR/JPY"] as const },
    { name: "GBP-USD-CHF", pairs: ["GBP/USD", "USD/CHF", "GBP/CHF"] as const },
    { name: "AUD-USD-JPY", pairs: ["AUD/USD", "USD/JPY", "AUD/JPY"] as const },
    { name: "EUR-USD-GBP", pairs: ["EUR/USD", "GBP/USD", "EUR/GBP"] as const },
];

export interface TriangleInfo {
    name: string;
    pairs: readonly string[];
}

export interface ArbitrageOpportunity {
    triangle: TriangleInfo;
    path: string[];
    prices: Record<string, number>;
    actualRate: number;
    profitPct: number;
    profitable: boolean;
}

/**
 * Calculate triangular arbitrage metrics
 * For a triangle A/B, B/C, A/C:
 * - Forward: A → B → C → A should equal 1
 * - If (A/B) * (B/C) / (A/C) != 1, there's an arb opportunity
 */
function calculateTriangularArb(
    priceAB: number | undefined,
    priceBC: number | undefined,
    priceAC: number | undefined
): { actualRate: number; profitPct: number } {
    if (!priceAB || !priceBC || !priceAC || priceAC === 0) {
        return { actualRate: 1, profitPct: 0 };
    }

    // Calculate synthetic cross rate
    const syntheticRate = priceAB * priceBC;
    const actualRate = syntheticRate / priceAC;
    const profitPct = (actualRate - 1) * 100;

    return { actualRate, profitPct };
}

export function useArbitrageMonitor() {
    const allPairs = Array.from(
        new Set(TRIANGULAR_ROUTES.flatMap(r => [...r.pairs]))
    );
    const { prices, loading } = usePythPrices(allPairs);
    const [opportunities, setOpportunities] = useState<ArbitrageOpportunity[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (loading || Object.keys(prices).length === 0) return;

        try {
            const opps: ArbitrageOpportunity[] = TRIANGULAR_ROUTES.map(triangle => {
                const [pairA, pairB, pairC] = triangle.pairs;
                const priceA = prices[pairA]?.price;
                const priceB = prices[pairB]?.price;
                const priceC = prices[pairC]?.price;

                const { actualRate, profitPct } = calculateTriangularArb(priceA, priceB, priceC);

                return {
                    triangle: {
                        name: triangle.name,
                        pairs: triangle.pairs,
                    },
                    path: [...triangle.pairs],
                    prices: {
                        [pairA]: priceA || 0,
                        [pairB]: priceB || 0,
                        [pairC]: priceC || 0,
                    },
                    actualRate,
                    profitPct,
                    profitable: Math.abs(profitPct) > 0.01, // > 1 bps is considered profitable
                };
            });

            // Sort by absolute profit potential
            opps.sort((a, b) => Math.abs(b.profitPct) - Math.abs(a.profitPct));
            setOpportunities(opps);
            setError(null);
        } catch (e) {
            setError("Failed to calculate arbitrage opportunities");
            console.error(e);
        }
    }, [prices, loading]);

    return {
        opportunities,
        prices,
        loading,
        error,
    };
}
