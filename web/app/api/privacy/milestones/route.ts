import { NextRequest, NextResponse } from 'next/server';
import { checkMilestones, generateMilestoneProof, MILESTONES } from '@/lib/privacy-cash';

/**
 * GET /api/privacy/milestones
 * 
 * Check which TVL milestones have been reached
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const token = (searchParams.get('token') || 'USDC') as 'USDC' | 'USD1';

        const milestones = await checkMilestones(token);

        return NextResponse.json({
            success: true,
            token,
            milestones,
            reachedCount: milestones.filter((m: { reached: boolean }) => m.reached).length,
            totalCount: MILESTONES.length
        });

    } catch (error) {
        console.error('[API] Milestones error:', error);
        return NextResponse.json(
            { error: 'Failed to check milestones', details: String(error) },
            { status: 500 }
        );
    }
}

/**
 * POST /api/privacy/milestones
 * 
 * Generate ZK proof for a specific milestone
 * This proof can be shared with VCs/auditors without revealing exact TVL
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { milestone, token = 'USDC' } = body;

        if (!milestone) {
            return NextResponse.json(
                { error: 'Missing required field: milestone (e.g., 100000, 500000, 1000000)' },
                { status: 400 }
            );
        }

        const proof = await generateMilestoneProof(
            parseInt(milestone),
            token as 'USDC' | 'USD1'
        );

        return NextResponse.json({
            success: true,
            ...proof
        });

    } catch (error) {
        console.error('[API] Milestone proof error:', error);
        return NextResponse.json(
            { error: 'Failed to generate milestone proof', details: String(error) },
            { status: 500 }
        );
    }
}
