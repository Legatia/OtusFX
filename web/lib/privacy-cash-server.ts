/**
 * Privacy Cash Server-Side SDK Wrapper
 * 
 * ⚠️ ONLY USE IN API ROUTES OR SERVER COMPONENTS
 * 
 * Currently in DEMO MODE for deployment.
 * Real SDK integration requires WASM modules that need special bundler config.
 * 
 * To enable real transactions:
 * 1. Set DEMO_WALLET_PRIVATE_KEY in .env
 * 2. Build the privacy-cash-sdk locally
 * 3. Configure wasm-loader in next.config
 */

import { PublicKey } from '@solana/web3.js';

// Token mint addresses (mainnet)
export const MINTS = {
    USDC: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'),
    USD1: new PublicKey('USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB'),
} as const;

export type SupportedToken = keyof typeof MINTS;

// Types for SDK responses
export interface DepositResult {
    signature: string;
    commitment: string;
}

export interface WithdrawResult {
    signature: string;
    fee: number;
}

export interface BalanceResult {
    amount: number;
    lamports?: number;
}

// Demo mode flag - real SDK disabled for deployment
const DEMO_MODE = true;

function generateDemoSignature(): string {
    return `demo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateDemoCommitment(): string {
    return `zk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Create a Privacy Cash client (demo mode)
 */
export function createClient(
    ownerSecretKey: string,
    rpcUrl?: string
): any {
    if (DEMO_MODE) {
        console.log('[Privacy Cash] Using demo mode');
        return { demo: true };
    }

    // Real SDK would be loaded here
    // const { PrivacyCash } = require('./privacy-cash-sdk/dist/index.js');
    throw new Error('Real SDK not available in demo mode');
}

// ============================================
// USDC Operations (Demo)
// ============================================

export async function depositUSDC(client: any, amount: number): Promise<DepositResult> {
    return {
        signature: generateDemoSignature(),
        commitment: generateDemoCommitment(),
    };
}

export async function withdrawUSDC(
    client: any,
    amount: number,
    recipientAddress?: string
): Promise<WithdrawResult> {
    return {
        signature: generateDemoSignature(),
        fee: amount * 0.001, // 0.1% demo fee
    };
}

export async function getUSDCBalance(client: any): Promise<BalanceResult> {
    return { amount: 0 };
}

// ============================================
// USD1 Operations (Demo)
// ============================================

export async function depositUSD1(client: any, amount: number): Promise<DepositResult> {
    return {
        signature: generateDemoSignature(),
        commitment: generateDemoCommitment(),
    };
}

export async function withdrawUSD1(
    client: any,
    amount: number,
    recipientAddress?: string
): Promise<WithdrawResult> {
    return {
        signature: generateDemoSignature(),
        fee: amount * 0.001,
    };
}

export async function getUSD1Balance(client: any): Promise<BalanceResult> {
    return { amount: 0 };
}

// ============================================
// SOL Operations (Demo)
// ============================================

export async function depositSOL(client: any, solAmount: number): Promise<DepositResult> {
    return {
        signature: generateDemoSignature(),
        commitment: generateDemoCommitment(),
    };
}

export async function withdrawSOL(
    client: any,
    solAmount: number,
    recipientAddress?: string
): Promise<WithdrawResult> {
    return {
        signature: generateDemoSignature(),
        fee: 0.0001,
    };
}

export async function getSOLBalance(client: any): Promise<BalanceResult> {
    return { amount: 0, lamports: 0 };
}

// ============================================
// Utility Functions
// ============================================

export async function clearCache(client: any): Promise<void> {
    // No-op in demo mode
}

export async function getAllBalances(client: any) {
    return {
        sol: { amount: 0, lamports: 0 },
        usdc: { amount: 0 },
        usd1: { amount: 0 },
    };
}

// ============================================
// CONVENIENCE: Gasless (Demo)
// ============================================

export async function gaslessDeposit(
    client: any,
    amount: number,
    token: SupportedToken
): Promise<DepositResult> {
    return {
        signature: generateDemoSignature(),
        commitment: generateDemoCommitment(),
    };
}

export async function gaslessWithdraw(
    client: any,
    amount: number,
    token: SupportedToken,
    recipientAddress?: string
): Promise<WithdrawResult> {
    return {
        signature: generateDemoSignature(),
        fee: amount * 0.001,
    };
}
