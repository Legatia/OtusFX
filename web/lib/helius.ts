/**
 * Helius RPC Service Module for OtusFX
 * 
 * Features:
 * - Helius RPC connection with fallback
 * - Priority fee estimation
 * - Enhanced transaction sending with staked connections
 * - Token API integration
 */

import { Connection, Keypair, Transaction, VersionedTransaction, PublicKey } from '@solana/web3.js';
import { clusterApiUrl } from '@solana/web3.js';

// ============================================
// Configuration
// ============================================

export const HELIUS_RPC_URL = process.env.NEXT_PUBLIC_HELIUS_RPC_URL;
export const HELIUS_API_KEY = process.env.HELIUS_API_KEY;

// Fallback to default Solana RPC if Helius not configured
const FALLBACK_RPC_URL = clusterApiUrl('devnet');

/**
 * Get the RPC endpoint, preferring Helius if configured
 */
export function getRpcEndpoint(): string {
    if (HELIUS_RPC_URL) {
        return HELIUS_RPC_URL;
    }
    console.warn('[Helius] No HELIUS_RPC_URL configured, using fallback RPC');
    return FALLBACK_RPC_URL;
}

/**
 * Create a Solana connection with Helius RPC
 * Falls back to default RPC if Helius not configured
 */
export function createHeliusConnection(
    commitment: 'processed' | 'confirmed' | 'finalized' = 'confirmed'
): Connection {
    const endpoint = getRpcEndpoint();
    return new Connection(endpoint, {
        commitment,
        confirmTransactionInitialTimeout: 60000,
    });
}

// ============================================
// Priority Fee Estimation (Helius Enhanced)
// ============================================

interface PriorityFeeResponse {
    priorityFeeEstimate: number;
}

/**
 * Get priority fee estimate from Helius
 * Uses Helius's priority fee API for optimal transaction landing
 * 
 * @param accountKeys - Array of account public keys involved in the transaction
 * @returns Priority fee in microlamports per compute unit
 */
export async function getPriorityFee(accountKeys: string[]): Promise<number> {
    if (!HELIUS_RPC_URL) {
        // Return default priority fee if Helius not configured
        return 10000; // 10k microlamports default
    }

    try {
        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'priority-fee-estimate',
                method: 'getPriorityFeeEstimate',
                params: [{
                    accountKeys,
                    options: {
                        priorityLevel: 'High', // Medium, High, VeryHigh
                    },
                }],
            }),
        });

        const data = await response.json();
        if (data.result?.priorityFeeEstimate) {
            return data.result.priorityFeeEstimate;
        }
        return 10000; // Default fallback
    } catch (error) {
        console.error('[Helius] Priority fee estimation failed:', error);
        return 10000;
    }
}

// ============================================
// Enhanced Transaction Sending
// ============================================

interface SendTransactionOptions {
    skipPreflight?: boolean;
    maxRetries?: number;
    preflightCommitment?: 'processed' | 'confirmed' | 'finalized';
}

/**
 * Send transaction using Helius with staked connections
 * Provides higher transaction landing rates on paid plans
 * 
 * @param transaction - Transaction or VersionedTransaction to send
 * @param signers - Array of signers (for legacy Transaction)
 * @param options - Transaction send options
 * @returns Transaction signature
 */
export async function sendWithHelius(
    transaction: Transaction | VersionedTransaction,
    signers?: Keypair[],
    options: SendTransactionOptions = {}
): Promise<string> {
    const connection = createHeliusConnection();

    const {
        skipPreflight = false,
        maxRetries = 3,
        preflightCommitment = 'confirmed',
    } = options;

    // Get latest blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

    // Sign transaction
    if (transaction instanceof Transaction) {
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = signers?.[0]?.publicKey;
        if (signers) {
            transaction.sign(...signers);
        }
    }

    // Serialize and send
    const serialized = transaction.serialize();
    const signature = await connection.sendRawTransaction(serialized, {
        skipPreflight,
        maxRetries,
        preflightCommitment,
    });

    // Confirm transaction
    await connection.confirmTransaction({
        signature,
        blockhash,
        lastValidBlockHeight,
    }, 'confirmed');

    return signature;
}

// ============================================
// Token API (Helius Enhanced)
// ============================================

export interface TokenBalance {
    mint: string;
    amount: number;
    decimals: number;
    tokenAccount: string;
    symbol?: string;
    name?: string;
    logoUri?: string;
}

/**
 * Get token balances for an address using Helius Token API
 * Provides parsed metadata and faster response than standard RPC
 * 
 * @param address - Wallet address to fetch balances for
 * @returns Array of token balances with metadata
 */
export async function getTokenBalances(address: string): Promise<TokenBalance[]> {
    if (!HELIUS_RPC_URL) {
        console.warn('[Helius] Token API requires Helius RPC URL');
        return [];
    }

    try {
        const response = await fetch(HELIUS_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: '2.0',
                id: 'get-token-accounts',
                method: 'getTokenAccountsByOwner',
                params: [
                    address,
                    { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
                    { encoding: 'jsonParsed' },
                ],
            }),
        });

        const data = await response.json();
        if (!data.result?.value) return [];

        return data.result.value.map((account: any) => ({
            mint: account.account.data.parsed.info.mint,
            amount: Number(account.account.data.parsed.info.tokenAmount.uiAmount),
            decimals: account.account.data.parsed.info.tokenAmount.decimals,
            tokenAccount: account.pubkey,
        }));
    } catch (error) {
        console.error('[Helius] Token balance fetch failed:', error);
        return [];
    }
}

/**
 * Get transaction history for an address
 * Uses Helius's enhanced transaction parsing
 * 
 * @param address - Wallet address
 * @param limit - Number of transactions to fetch (default 50)
 * @returns Array of parsed transactions
 */
export async function getTransactionHistory(
    address: string,
    limit: number = 50
): Promise<any[]> {
    // Helius transaction history API requires API key in URL
    const apiKey = HELIUS_API_KEY || new URL(HELIUS_RPC_URL || '').searchParams.get('api-key');

    if (!apiKey) {
        console.warn('[Helius] Transaction history requires API key');
        return [];
    }

    try {
        const response = await fetch(
            `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=${limit}`
        );
        const data = await response.json();
        return data || [];
    } catch (error) {
        console.error('[Helius] Transaction history fetch failed:', error);
        return [];
    }
}

// ============================================
// Webhooks (Server-side only)
// ============================================

export interface WebhookConfig {
    webhookURL: string;
    transactionTypes: string[];
    accountAddresses: string[];
    webhookType: 'enhanced' | 'raw';
}

/**
 * Create a Helius webhook for real-time notifications
 * NOTE: This should only be called from server-side code
 * 
 * @param config - Webhook configuration
 * @returns Webhook ID
 */
export async function createWebhook(config: WebhookConfig): Promise<string | null> {
    const apiKey = HELIUS_API_KEY;

    if (!apiKey) {
        console.error('[Helius] Webhook creation requires HELIUS_API_KEY');
        return null;
    }

    try {
        const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config),
        });

        const data = await response.json();
        return data.webhookID || null;
    } catch (error) {
        console.error('[Helius] Webhook creation failed:', error);
        return null;
    }
}

// ============================================
// Utility Exports
// ============================================

export const helius = {
    getRpcEndpoint,
    createConnection: createHeliusConnection,
    getPriorityFee,
    sendTransaction: sendWithHelius,
    getTokenBalances,
    getTransactionHistory,
    createWebhook,
};

export default helius;
