import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/privacy/commission
 * 
 * Pay a hidden commission to a copy trading leader
 * Uses ShadowWire for amount-hidden transfers
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { fromWallet, toWallet, amount } = body;

        if (!fromWallet || !toWallet || !amount) {
            return NextResponse.json(
                { error: 'Missing required fields: fromWallet, toWallet, amount' },
                { status: 400 }
            );
        }

        // Dynamic import to avoid client bundling issues
        const { payPrivateCommission } = await import('@/lib/shadowwire');

        const result = await payPrivateCommission(
            fromWallet,
            toWallet,
            parseFloat(amount)
        );

        return NextResponse.json({
            success: true,
            txHash: result.tx_signature || result,
            message: `🔒 Private commission of ${amount} USDC paid to ${toWallet.slice(0, 8)}...`
        });

    } catch (error) {
        console.error('[API] Commission error:', error);
        return NextResponse.json(
            { error: 'Commission payment failed', details: String(error) },
            { status: 500 }
        );
    }
}
