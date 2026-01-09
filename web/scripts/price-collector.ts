#!/usr/bin/env npx tsx

/**
 * Price Collector Script
 * 
 * Polls Pyth Hermes API every 60 seconds and stores FX prices in SQLite.
 * Run with: npx tsx scripts/price-collector.ts
 */

import { insertPrices, closeDb, getPriceCount } from '../lib/db';

const HERMES_ENDPOINT = 'https://hermes.pyth.network';

// Pyth FX price feed IDs (major pairs with active data)
const PRICE_FEEDS: Record<string, string> = {
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

interface PythV2Response {
    parsed: Array<{
        id: string;
        price: {
            price: string;
            conf: string;
            expo: number;
            publish_time: number;
        };
    }>;
}

async function fetchPrices(): Promise<{ pair: string; price: number; timestamp: number }[]> {
    const feedIds = Object.values(PRICE_FEEDS);
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

    const prices: { pair: string; price: number; timestamp: number }[] = [];

    // Create reverse mapping of id -> pair
    const idToPair: Record<string, string> = {};
    for (const [pair, id] of Object.entries(PRICE_FEEDS)) {
        idToPair[id.slice(2)] = pair; // Remove 0x prefix
    }

    for (const item of data.parsed) {
        const pair = idToPair[item.id];
        if (!pair) continue;

        const priceValue = parseInt(item.price.price);
        const expo = item.price.expo;
        const calculatedPrice = priceValue * Math.pow(10, expo);

        if (calculatedPrice > 0) {
            prices.push({
                pair,
                price: calculatedPrice,
                timestamp: item.price.publish_time,
            });
        }
    }

    return prices;
}

async function collectPrices(): Promise<void> {
    try {
        const prices = await fetchPrices();

        if (prices.length > 0) {
            insertPrices(prices);
            const timestamp = new Date().toISOString();
            console.log(`[${timestamp}] Stored ${prices.length} prices:`,
                prices.map(p => `${p.pair}: ${p.price.toFixed(4)}`).join(', '));
        }
    } catch (error) {
        console.error('Error collecting prices:', error);
    }
}

async function main(): Promise<void> {
    console.log('Starting price collector...');
    console.log('Pairs:', Object.keys(PRICE_FEEDS).join(', '));
    console.log('Polling interval: 60 seconds');
    console.log('');

    // Show current data counts
    for (const pair of Object.keys(PRICE_FEEDS)) {
        const count = getPriceCount(pair);
        console.log(`  ${pair}: ${count} records in database`);
    }
    console.log('');

    // Initial collection
    await collectPrices();

    // Poll every 60 seconds (1 minute - matches chart intervals)
    const interval = setInterval(collectPrices, 60000);

    // Handle graceful shutdown
    const shutdown = () => {
        console.log('\nShutting down...');
        clearInterval(interval);
        closeDb();
        process.exit(0);
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

main().catch(console.error);
