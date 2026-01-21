/**
 * ShadowWire SDK Wrapper
 * 
 * ⚠️ SERVER-SIDE ONLY - Do not import in client components
 * 
 * Real integration with @radr/shadowwire v1.1.2
 * Provides privacy-preserving transfers using Bulletproofs ZK
 * 
 * Supported tokens: USDC, USD1
 * Features: Deposit, Withdraw, Internal Transfer (amount hidden)
 */

// Supported tokens for ShadowWire
export const SHADOWWIRE_TOKENS = ['USDC', 'USD1'] as const;
export type ShadowWireToken = typeof SHADOWWIRE_TOKENS[number];

// Types (re-exported for convenience without importing SDK)
export interface PoolBalance {
    wallet: string;
    available: number;
    deposited: number;
    pool_address: string;
}

export interface DepositResponse {
    success: boolean;
    unsigned_tx_base64: string;
    pool_address: string;
    amount: number;
}

export interface WithdrawResponse {
    success: boolean;
    unsigned_tx_base64: string;
    amount_withdrawn: number;
    fee: number;
}

export interface InternalTransferResponse {
    success: boolean;
    tx_signature: string;
    proof_pda: string;
}

// Lazy-loaded client to avoid WASM bundling issues
let clientInstance: any = null;

/**
 * Get or create ShadowWire client (lazy loaded)
 * Only call this on the server side
 */
async function getShadowWireClient(): Promise<any> {
    if (!clientInstance) {
        // Dynamic import to avoid WASM bundling in client
        const { ShadowWireClient } = await import('@radr/shadowwire');
        clientInstance = new ShadowWireClient({
            debug: process.env.NODE_ENV === 'development',
            network: 'mainnet-beta',
        });
    }
    return clientInstance;
}

// ============================================
// DEPOSIT: Public → Private Pool
// ============================================

export interface PrivateDepositParams {
    wallet: string;
    amount: number;
    token?: ShadowWireToken;
}

/**
 * Deposit stablecoins into the ShadowWire privacy pool
 */
export async function privateDeposit({
    wallet,
    amount,
    token = 'USDC'
}: PrivateDepositParams): Promise<DepositResponse> {
    const client = await getShadowWireClient();
    const rawAmount = Math.floor(amount * 1_000_000);

    try {
        const result = await client.deposit({
            wallet,
            amount: rawAmount,
            token,
        });
        console.log(`[ShadowWire] Deposited ${amount} ${token}:`, result);
        return result;
    } catch (error) {
        console.error('[ShadowWire] Deposit failed:', error);
        throw error;
    }
}

// ============================================
// WITHDRAW: Private Pool → Public
// ============================================

export interface PrivateWithdrawParams {
    wallet: string;
    amount: number;
    token?: ShadowWireToken;
    recipient?: string;
}

/**
 * Withdraw from privacy pool to public wallet
 */
export async function privateWithdraw({
    wallet,
    amount,
    token = 'USDC',
    recipient
}: PrivateWithdrawParams): Promise<WithdrawResponse> {
    const client = await getShadowWireClient();
    const rawAmount = Math.floor(amount * 1_000_000);

    try {
        const result = await client.withdraw({
            wallet,
            amount: rawAmount,
            token,
            recipient: recipient || wallet,
        });
        console.log(`[ShadowWire] Withdrew ${amount} ${token}`);
        return result;
    } catch (error) {
        console.error('[ShadowWire] Withdraw failed:', error);
        throw error;
    }
}

// ============================================
// INTERNAL TRANSFER: Private → Private (Amount Hidden)
// ============================================

/**
 * Pay a hidden commission to a copy trader lead
 * Uses Bulletproofs ZK - amount is never revealed on-chain
 */
export async function payPrivateCommission(
    fromWallet: string,
    toWallet: string,
    amount: number,
    token: ShadowWireToken = 'USDC'
): Promise<InternalTransferResponse> {
    const client = await getShadowWireClient();

    try {
        const result = await client.internalTransfer({
            sender: fromWallet,
            recipient: toWallet,
            amount,
            token,
        });
        console.log(`[ShadowWire] Private transfer:`, result.tx_signature);
        return result;
    } catch (error) {
        console.error('[ShadowWire] Private transfer failed:', error);
        throw error;
    }
}

// ============================================
// BALANCE: Get Private Balance
// ============================================

/**
 * Get private balance from ShadowWire pool
 */
export async function getPrivateBalance(
    wallet: string,
    token: ShadowWireToken = 'USDC'
): Promise<{ available: number; raw: number; poolAddress?: string }> {
    const client = await getShadowWireClient();

    try {
        const balance: PoolBalance = await client.getBalance(wallet, token);
        return {
            available: balance.available / 1_000_000,
            raw: balance.available,
            poolAddress: balance.pool_address,
        };
    } catch (error) {
        console.error('[ShadowWire] Failed to fetch balance:', error);
        return { available: 0, raw: 0 };
    }
}

/**
 * Get all private balances (USDC, USD1)
 */
export async function getAllPrivateBalances(wallet: string) {
    const [usdc, usd1] = await Promise.all([
        getPrivateBalance(wallet, 'USDC'),
        getPrivateBalance(wallet, 'USD1'),
    ]);

    return { usdc, usd1 };
}
