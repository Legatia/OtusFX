import { NextResponse } from 'next/server';
import { getPriceHistory, getLatestPrice, getOldestPrice, getPriceCount } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const pair = searchParams.get('pair');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const limit = searchParams.get('limit');

    if (!pair) {
        return NextResponse.json(
            { error: 'Missing required parameter: pair' },
            { status: 400 }
        );
    }

    // If no time range specified, return stats and latest data
    if (!from || !to) {
        const latest = getLatestPrice(pair);
        const oldest = getOldestPrice(pair);
        const count = getPriceCount(pair);

        return NextResponse.json({
            pair,
            count,
            latest: latest ? {
                price: latest.price,
                timestamp: latest.timestamp,
            } : null,
            oldest: oldest ? {
                price: oldest.price,
                timestamp: oldest.timestamp,
            } : null,
            dataAvailable: count > 0,
        });
    }

    // Parse timestamps
    const fromTimestamp = parseInt(from);
    const toTimestamp = parseInt(to);
    const maxLimit = limit ? parseInt(limit) : 500;

    if (isNaN(fromTimestamp) || isNaN(toTimestamp)) {
        return NextResponse.json(
            { error: 'Invalid timestamp format' },
            { status: 400 }
        );
    }

    // Get historical prices
    const prices = getPriceHistory(pair, fromTimestamp, toTimestamp, maxLimit);

    return NextResponse.json({
        pair,
        from: fromTimestamp,
        to: toTimestamp,
        count: prices.length,
        prices: prices.map(p => ({
            price: p.price,
            timestamp: p.timestamp,
        })),
    });
}
