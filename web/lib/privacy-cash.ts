/**
 * Privacy Cash Client Library
 * 
 * Client-side wrapper that calls API routes for Privacy Cash operations.
 * The API routes use the real Privacy Cash SDK on the server.
 * 
 * Supported tokens: USDC, USD1
 */

// Supported tokens for Privacy Cash deposits
export const PRIVACY_CASH_TOKENS = ['USDC', 'USD1'] as const;
export type PrivacyCashToken = typeof PRIVACY_CASH_TOKENS[number];

// Token mint addresses (mainnet)
export const TOKEN_MINTS: Record<PrivacyCashToken, string> = {
    USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    USD1: 'USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB',
};

export interface PrivateDepositParams {
    wallet: string;
    amount: number;
    token: PrivacyCashToken;
}

export interface PrivateWithdrawParams {
    wallet: string;
    recipient: string;
    amount: number;
    token: PrivacyCashToken;
}

export interface DepositResult {
    success: boolean;
    txHash: string;
    commitment: string;
    message: string;
}

export interface WithdrawResult {
    success: boolean;
    txHash: string;
    message: string;
}

export interface BalanceResult {
    available: number;
    raw: number;
}

/**
 * Deposit stablecoins to Privacy Cash pool
 * Calls the server-side API route which uses the real SDK
 */
export async function privateDeposit({ wallet, amount, token }: PrivateDepositParams): Promise<DepositResult> {
    const response = await fetch('/api/privacy/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, amount, token }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Deposit failed');
    }

    return response.json();
}

/**
 * Withdraw stablecoins from Privacy Cash pool
 */
export async function privateWithdraw({ wallet, recipient, amount, token }: PrivateWithdrawParams): Promise<WithdrawResult> {
    const response = await fetch('/api/privacy/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet, recipient, amount, token }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Withdraw failed');
    }

    return response.json();
}

/**
 * Get private balance for a wallet
 */
export async function getPrivateBalance(wallet: string, token: PrivacyCashToken): Promise<BalanceResult> {
    const response = await fetch(`/api/privacy/balance?wallet=${wallet}&token=${token}`);

    if (!response.ok) {
        console.error('Failed to fetch balance');
        return { available: 0, raw: 0 };
    }

    return response.json();
}

/**
 * Get total pool TVL
 */
export async function getPoolTVL(token: PrivacyCashToken): Promise<number> {
    const response = await fetch(`/api/privacy/tvl?token=${token}`);

    if (!response.ok) {
        return 0;
    }

    const data = await response.json();
    return data.tvl || 0;
}

// ============================================
// MILESTONE PROOFS
// ============================================

export const MILESTONES = [
    { amount: 100_000, label: '100K' },
    { amount: 500_000, label: '500K' },
    { amount: 1_000_000, label: '1M' },
    { amount: 5_000_000, label: '5M' },
];

export async function checkMilestones(token: PrivacyCashToken) {
    const response = await fetch(`/api/privacy/milestones?token=${token}`);

    if (!response.ok) {
        return MILESTONES.map(m => ({
            ...m,
            reached: false,
            tvl: 'Unknown',
        }));
    }

    return response.json();
}

export async function generateMilestoneProof(milestone: number, token: PrivacyCashToken) {
    const response = await fetch('/api/privacy/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ milestone, token }),
    });

    if (!response.ok) {
        return {
            milestone,
            token,
            verified: false,
            message: 'Failed to generate proof',
        };
    }

    return response.json();
}
