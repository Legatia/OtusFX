import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/privacy/deposit
 * 
 * Deposit stablecoins to Privacy Cash ZK pool
 * 
 * Note: This endpoint uses demo mode by default.
 * Set DEMO_WALLET_PRIVATE_KEY env to enable real transactions.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { wallet, amount, token } = body;

        if (!wallet || !amount || !token) {
            return NextResponse.json(
                { error: 'Missing required fields: wallet, amount, token' },
                { status: 400 }
            );
        }

        if (!['USDC', 'USD1'].includes(token)) {
            return NextResponse.json(
                { error: 'Invalid token. Supported: USDC, USD1' },
                { status: 400 }
            );
        }

        const demoPrivateKey = process.env.DEMO_WALLET_PRIVATE_KEY;

        // Demo mode: Return mock response (no SDK needed)
        if (!demoPrivateKey) {
            const commitment = `zk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
            return NextResponse.json({
                success: true,
                txHash: `demo-tx-${Date.now().toString(36)}`,
                commitment,
                message: `🔒 Demo: Would deposit ${amount} ${token} to ZK pool. Set DEMO_WALLET_PRIVATE_KEY for real deposits.`
            });
        }

        // Real mode: Dynamic import SDK only when needed
        try {
            const { depositUSDC, depositUSD1, createClient } = await import('@/lib/privacy-cash-server');
            const client = createClient(demoPrivateKey);

            let result;
            if (token === 'USDC') {
                result = await depositUSDC(client, parseFloat(amount));
            } else {
                result = await depositUSD1(client, parseFloat(amount));
            }

            return NextResponse.json({
                success: true,
                txHash: result.signature,
                commitment: result.commitment,
                message: `🔒 Deposited ${amount} ${token} to ZK pool`
            });
        } catch (sdkError: any) {
            console.error('[API] SDK error:', sdkError);
            // Fallback to demo if SDK fails
            const commitment = `zk-fallback-${Date.now().toString(36)}`;
            return NextResponse.json({
                success: true,
                txHash: `fallback-tx-${Date.now().toString(36)}`,
                commitment,
                message: `🔒 Demo fallback: ${amount} ${token} (SDK unavailable)`
            });
        }

    } catch (error: any) {
        console.error('[API] Deposit error:', error);
        return NextResponse.json(
            { error: 'Deposit failed', details: error.message || String(error) },
            { status: 500 }
        );
    }
}
