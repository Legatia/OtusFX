"use client";

import { useEffect, useState, useCallback, useRef } from 'react';

// Pyth FX price feed IDs (major pairs with active data)
// See: https://hermes.pyth.network/v2/price_feeds?asset_type=fx
export const PYTH_PRICE_FEEDS: Record<string, string> = {
    // Major pairs (vs USD)
    'EUR/USD': '0xa995d00bb36a63cef7fd2c287dc105fc8f3d93779f062f09551b0af3e81ec30b',
    'GBP/USD': '0x84c2dde9633d93d1bcad84e7dc41c9d56578b7ec52fabedc1f335d673df0a7c1',
    'USD/JPY': '0xef2c98c804ba503c6a707e38be4dfbb16683775f195b091252bf24693042fd52',
    'USD/CHF': '0x0b1e3297e69f162877b577b0d6a47a0d63b2392bc8499e6540da4187a63e28f8',
    'AUD/USD': '0x67a6f93030420c1c9e3fe37c1ab6b77966af82f995944a9fefce357a22854a80',
    // Cross pairs
    'EUR/GBP': '0xc349ff6087acab1c0c5442a9de0ea804239cc9fd09be8b1a93ffa0ed7f366d9c',
    'EUR/JPY': '0xd8c874fa511b9838d094109f996890642421e462c3b29501a2560cecf82c2eb4',
    'EUR/CHF': '0x6194ee9b4ae25932ae69e6574871801f0f30b4a3317877c55301a45902aa0c1a',
    'GBP/JPY': '0xcfa65905787703c692c3cac2b8a009a1db51ce68b54f5b206ce6a55bfa2c3cd1',
};

// All available pairs for easy access
export const FX_PAIRS = Object.keys(PYTH_PRICE_FEEDS);

// Pair metadata
export const PAIR_INFO: Record<string, { base: string; quote: string; decimals: number }> = {
    'EUR/USD': { base: 'EUR', quote: 'USD', decimals: 5 },
    'GBP/USD': { base: 'GBP', quote: 'USD', decimals: 5 },
    'USD/JPY': { base: 'USD', quote: 'JPY', decimals: 3 },
    'USD/CHF': { base: 'USD', quote: 'CHF', decimals: 5 },
    'AUD/USD': { base: 'AUD', quote: 'USD', decimals: 5 },
    'EUR/GBP': { base: 'EUR', quote: 'GBP', decimals: 5 },
    'EUR/JPY': { base: 'EUR', quote: 'JPY', decimals: 3 },
    'EUR/CHF': { base: 'EUR', quote: 'CHF', decimals: 5 },
    'GBP/JPY': { base: 'GBP', quote: 'JPY', decimals: 3 },
};

// Triangular arbitrage configurations
export const TRIANGLES = [
    { name: 'EUR-USD-GBP', pairs: ['EUR/USD', 'GBP/USD', 'EUR/GBP'], currencies: ['EUR', 'USD', 'GBP'] },
    { name: 'EUR-USD-JPY', pairs: ['EUR/USD', 'USD/JPY', 'EUR/JPY'], currencies: ['EUR', 'USD', 'JPY'] },
    { name: 'EUR-USD-CHF', pairs: ['EUR/USD', 'USD/CHF', 'EUR/CHF'], currencies: ['EUR', 'USD', 'CHF'] },
    { name: 'GBP-USD-JPY', pairs: ['GBP/USD', 'USD/JPY', 'GBP/JPY'], currencies: ['GBP', 'USD', 'JPY'] },
];



export interface PriceData {
    pair: string;
    price: number;
    change24h: number;
    high24h: number;
    low24h: number;
    confidence: number;
    lastUpdate: Date;
    isLive: boolean;
    isMarketClosed: boolean;
}

// Check if FX market is closed (weekends: Friday 22:00 UTC to Sunday 22:00 UTC)
export function isFXMarketClosed(): boolean {
    const now = new Date();
    const utcDay = now.getUTCDay(); // 0 = Sunday, 6 = Saturday
    const utcHour = now.getUTCHours();

    // Saturday: always closed
    if (utcDay === 6) return true;

    // Sunday: closed until 22:00 UTC
    if (utcDay === 0 && utcHour < 22) return true;

    // Friday: closed after 22:00 UTC
    if (utcDay === 5 && utcHour >= 22) return true;

    return false;
}

// V2 API response structure
interface PythV2Response {
    parsed: Array<{
        id: string;
        price: {
            price: string;
            conf: string;
            expo: number;
            publish_time: number;
        };
        ema_price: {
            price: string;
            conf: string;
            expo: number;
            publish_time: number;
        };
    }>;
}

const HERMES_ENDPOINT = 'https://hermes.pyth.network';
const BENCHMARKS_ENDPOINT = 'https://benchmarks.pyth.network';

// Fallback prices for when API is unavailable (approximate market rates)
const FALLBACK_PRICES: Record<string, number> = {
    'EUR/USD': 1.0850,
    'GBP/USD': 1.2720,
    'USD/JPY': 148.50,
    'USD/CHF': 0.8820,
    'AUD/USD': 0.6550,
    'EUR/GBP': 0.8530,
    'EUR/JPY': 161.10,
    'EUR/CHF': 0.9570,
    'GBP/JPY': 188.90,
};

// Cache for last known prices when markets close
const lastKnownPrices: Record<string, number> = {};

export function usePythPrices(pairs: string[]) {
    const [prices, setPrices] = useState<Record<string, PriceData>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPrices = useCallback(async () => {
        try {
            // Get feed IDs for requested pairs
            const feedIds = pairs
                .filter(pair => PYTH_PRICE_FEEDS[pair])
                .map(pair => PYTH_PRICE_FEEDS[pair]);

            if (feedIds.length === 0) {
                setLoading(false);
                return;
            }

            // Fetch latest prices from Hermes v2 API
            const queryParams = feedIds.map(id => `ids[]=${id}`).join('&');
            const response = await fetch(
                `${HERMES_ENDPOINT}/v2/updates/price/latest?${queryParams}&parsed=true`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch prices: ${response.status}`);
            }

            const data: PythV2Response = await response.json();

            if (!data.parsed || data.parsed.length === 0) {
                throw new Error('No price data received');
            }

            // Create a map of id -> price data (without 0x prefix)
            const priceMap = new Map<string, { price: number; conf: number; isLive: boolean }>();

            for (const item of data.parsed) {
                const price = parseInt(item.price.price);
                const expo = item.price.expo;
                const conf = parseInt(item.price.conf);
                const calculatedPrice = price * Math.pow(10, expo);

                priceMap.set(item.id, {
                    price: calculatedPrice,
                    conf: conf * Math.pow(10, expo),
                    isLive: calculatedPrice > 0 && item.price.publish_time > 0,
                });
            }

            // Build price data objects for each pair
            const newPrices: Record<string, PriceData> = {};
            const marketClosed = isFXMarketClosed();

            for (const pair of pairs) {
                const feedId = PYTH_PRICE_FEEDS[pair];
                if (!feedId) continue;

                // Remove 0x prefix to match response format
                const idWithoutPrefix = feedId.slice(2);
                const priceData = priceMap.get(idWithoutPrefix);

                let finalPrice: number;
                let isLive: boolean;

                // Use live price if available
                if (priceData && priceData.price > 0) {
                    finalPrice = priceData.price;
                    isLive = !marketClosed; // Only live if market is open
                    // Cache this as the last known price
                    lastKnownPrices[pair] = finalPrice;
                } else {
                    // No data - use last known price or fallback
                    finalPrice = lastKnownPrices[pair] || FALLBACK_PRICES[pair] || 1;
                    isLive = false;
                }

                newPrices[pair] = {
                    pair: pair,
                    price: finalPrice,
                    change24h: 0,
                    high24h: isLive ? finalPrice * 1.003 : finalPrice,
                    low24h: isLive ? finalPrice * 0.997 : finalPrice,
                    confidence: priceData?.conf || 0,
                    lastUpdate: new Date(),
                    isLive: isLive,
                    isMarketClosed: marketClosed,
                };
            }

            setPrices(newPrices);
            setError(null);
        } catch (err) {
            console.error('Error fetching Pyth prices:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch prices');

            // On error, use last known or fallback prices (flat line)
            const fallbackPrices: Record<string, PriceData> = {};
            const marketClosed = isFXMarketClosed();
            for (const pair of pairs) {
                const fallback = lastKnownPrices[pair] || FALLBACK_PRICES[pair];
                if (fallback) {
                    fallbackPrices[pair] = {
                        pair,
                        price: fallback,
                        change24h: 0,
                        high24h: fallback,
                        low24h: fallback,
                        confidence: 0,
                        lastUpdate: new Date(),
                        isLive: false,
                        isMarketClosed: marketClosed,
                    };
                }
            }
            setPrices(fallbackPrices);
        } finally {
            setLoading(false);
        }
    }, [pairs]);

    useEffect(() => {
        fetchPrices();

        // Poll every 60 seconds for updated prices (matches chart intervals)
        const interval = setInterval(fetchPrices, 60000);

        return () => clearInterval(interval);
    }, [fetchPrices]);

    return { prices, loading, error, refetch: fetchPrices };
}

// Fetch historical price from Pyth Benchmarks API
export async function fetchHistoricalPrice(pair: string, timestamp: number): Promise<number | null> {
    const feedId = PYTH_PRICE_FEEDS[pair];
    if (!feedId) return null;

    try {
        const response = await fetch(
            `${BENCHMARKS_ENDPOINT}/v1/updates/price/${timestamp}?ids=${feedId}&parsed=true`
        );

        if (!response.ok) return null;

        const data = await response.json();

        if (data.parsed && data.parsed.length > 0) {
            const priceInfo = data.parsed[0].price;
            const price = parseInt(priceInfo.price);
            const expo = priceInfo.expo;
            return price * Math.pow(10, expo);
        }

        return null;
    } catch {
        return null;
    }
}

// Format price for display
export function formatPrice(price: number, decimals: number = 4): string {
    return price.toFixed(decimals);
}

// Format percentage change
export function formatChange(change: number): string {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
}

// Triangular arbitrage types
export interface ArbitrageOpportunity {
    triangle: typeof TRIANGLES[0];
    direction: 'forward' | 'reverse';
    prices: Record<string, number>;
    impliedRate: number;
    actualRate: number;
    profitPct: number;
    profitable: boolean;
    path: string[];
}

// Calculate triangular arbitrage opportunity
export function calculateArbitrage(
    triangle: typeof TRIANGLES[0],
    prices: Record<string, PriceData>
): ArbitrageOpportunity | null {
    const [pair1, pair2, pair3] = triangle.pairs;
    const [ccy1, ccy2, ccy3] = triangle.currencies;

    const p1 = prices[pair1]?.price;
    const p2 = prices[pair2]?.price;
    const p3 = prices[pair3]?.price;

    if (!p1 || !p2 || !p3) return null;

    // Forward: ccy1 -> ccy2 -> ccy3 -> ccy1
    // We need to figure out the conversion based on pair structure
    let forwardRate: number;
    let reverseRate: number;

    // EUR-USD-GBP example:
    // EUR/USD = 1.16 (1 EUR = 1.16 USD)
    // GBP/USD = 1.34 (1 GBP = 1.34 USD)
    // EUR/GBP = 0.87 (1 EUR = 0.87 GBP)
    //
    // Forward: Start with 1 EUR
    // 1 EUR -> 1.16 USD (multiply by EUR/USD)
    // 1.16 USD -> 1.16/1.34 GBP = 0.866 GBP (divide by GBP/USD)
    // 0.866 GBP -> 0.866/0.87 EUR = 0.995 EUR (divide by EUR/GBP)
    // If result > 1, profit!

    if (triangle.name === 'EUR-USD-GBP') {
        // EUR -> USD -> GBP -> EUR
        forwardRate = (p1 / p2) / p3; // EUR/USD / GBP/USD / EUR/GBP
        reverseRate = p3 * p2 / p1;   // EUR/GBP * GBP/USD / EUR/USD
    } else if (triangle.name === 'EUR-USD-JPY') {
        // EUR -> USD -> JPY -> EUR
        // EUR/USD, USD/JPY, EUR/JPY
        forwardRate = (p1 * p2) / p3; // EUR/USD * USD/JPY / EUR/JPY
        reverseRate = p3 / (p1 * p2);
    } else if (triangle.name === 'EUR-USD-CHF') {
        // EUR -> USD -> CHF -> EUR
        // EUR/USD, USD/CHF, EUR/CHF
        forwardRate = (p1 * p2) / p3;
        reverseRate = p3 / (p1 * p2);
    } else if (triangle.name === 'GBP-USD-JPY') {
        // GBP -> USD -> JPY -> GBP
        // GBP/USD, USD/JPY, GBP/JPY
        forwardRate = (p1 * p2) / p3;
        reverseRate = p3 / (p1 * p2);
    } else {
        return null;
    }

    const forwardProfit = (forwardRate - 1) * 100;
    const reverseProfit = (reverseRate - 1) * 100;

    const bestDirection = Math.abs(forwardProfit) > Math.abs(reverseProfit) ? 'forward' : 'reverse';
    const bestProfit = bestDirection === 'forward' ? forwardProfit : reverseProfit;
    const bestRate = bestDirection === 'forward' ? forwardRate : reverseRate;

    // Build path description
    const path = bestDirection === 'forward'
        ? [ccy1, ccy2, ccy3, ccy1]
        : [ccy1, ccy3, ccy2, ccy1];

    return {
        triangle,
        direction: bestDirection,
        prices: { [pair1]: p1, [pair2]: p2, [pair3]: p3 },
        impliedRate: 1,
        actualRate: bestRate,
        profitPct: bestProfit,
        profitable: bestProfit > 0.01, // > 1 basis point
        path,
    };
}

// Hook to monitor all triangular arbitrage opportunities
export function useArbitrageMonitor() {
    const allPairs = TRIANGLES.flatMap(t => t.pairs).filter((v, i, a) => a.indexOf(v) === i);
    const { prices, loading, error } = usePythPrices(allPairs);

    const opportunities = TRIANGLES.map(triangle => calculateArbitrage(triangle, prices)).filter(Boolean) as ArbitrageOpportunity[];

    // Sort by absolute profit
    opportunities.sort((a, b) => Math.abs(b.profitPct) - Math.abs(a.profitPct));

    return { opportunities, prices, loading, error };
}
