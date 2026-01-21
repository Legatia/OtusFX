import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/privacy/balance
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const wallet = searchParams.get('wallet');
        const token = searchParams.get('token') || 'USDC';

        if (!wallet) {
            return NextResponse.json(
                { error: 'Missing required param: wallet' },
                { status: 400 }
            );
        }

        const demoPrivateKey = process.env.DEMO_WALLET_PRIVATE_KEY;

        // Demo mode
        if (!demoPrivateKey) {
            return NextResponse.json({
                available: 0,
                raw: 0,
                message: 'Demo mode - set DEMO_WALLET_PRIVATE_KEY for real balances'
            });
        }

        // Real mode
        try {
            const { getUSDCBalance, getUSD1Balance, createClient } = await import('@/lib/privacy-cash-server');
            const client = createClient(demoPrivateKey);

            let balance;
            if (token === 'USDC') {
                balance = await getUSDCBalance(client);
            } else {
                balance = await getUSD1Balance(client);
            }

            return NextResponse.json({
                available: balance.amount,
                raw: balance.lamports || 0,
            });
        } catch (sdkError: any) {
            console.error('[API] SDK error:', sdkError);
            return NextResponse.json({
                available: 0,
                raw: 0,
                message: 'SDK unavailable'
            });
        }

    } catch (error: any) {
        console.error('[API] Balance error:', error);
        return NextResponse.json(
            { available: 0, raw: 0, error: error.message },
            { status: 500 }
        );
    }
}
