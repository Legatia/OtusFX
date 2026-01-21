import { PublicKey } from "@solana/web3.js";

// Supported stablecoins for OtusFX
// Primary: USDC (most liquid, Coinbase/Revolut 0% on-ramp)
// Secondary: USD1 (World Liberty Financial, ShadowWire bounty eligible)
// Future: MoonPay fiat on-ramp, Arcium private swap for other tokens

export interface TokenConfig {
    symbol: string;
    name: string;
    decimals: number;
    mint: {
        mainnet: string;
        devnet: string;
    };
    logo: string;
    color: string;
    isPrimary: boolean;
}

export const SUPPORTED_TOKENS: Record<string, TokenConfig> = {
    USDC: {
        symbol: "USDC",
        name: "USD Coin",
        decimals: 6,
        mint: {
            mainnet: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
            devnet: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU",
        },
        logo: "/tokens/usdc.svg",
        color: "#2775CA",
        isPrimary: true,
    },
    USD1: {
        symbol: "USD1",
        name: "USD1 (World Liberty)",
        decimals: 6,
        mint: {
            mainnet: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
            devnet: "USD1ttGY1N17NEEHLmELoaybftRBUSErhqYiQzvEmuB",
        },
        logo: "/tokens/usd1.svg",
        color: "#00D632",
        isPrimary: false,
    },
};

// Token order for UI display
export const TOKEN_ORDER = ["USDC", "USD1"];

// Get token config by symbol
export function getToken(symbol: string): TokenConfig | undefined {
    return SUPPORTED_TOKENS[symbol.toUpperCase()];
}

// Get token mint for current network
export function getTokenMint(symbol: string, network: "mainnet" | "devnet" = "devnet"): PublicKey {
    const token = getToken(symbol);
    if (!token) throw new Error(`Unknown token: ${symbol}`);
    return new PublicKey(token.mint[network]);
}

// Get all supported token symbols
export function getSupportedTokens(): string[] {
    return TOKEN_ORDER;
}

// Format token amount for display
export function formatTokenAmount(amount: number, symbol: string): string {
    const token = getToken(symbol);
    const decimals = token?.decimals ?? 6;
    return new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: decimals > 2 ? 2 : decimals,
    }).format(amount);
}

// Privacy SDK supported tokens
export const PRIVACY_CASH_TOKENS = ["USDC", "USD1"];
export const SHADOWWIRE_TOKENS = ["USDC", "USD1"];
