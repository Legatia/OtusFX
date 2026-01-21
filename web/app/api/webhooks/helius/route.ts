/**
 * Helius Webhook Handler
 * 
 * Receives real-time transaction notifications from Helius
 * Use this to update UI in real-time for deposits, trades, etc.
 */

import { NextRequest, NextResponse } from "next/server";

// Types for Helius webhook payloads
interface HeliusWebhookPayload {
    type: string;
    timestamp: number;
    signature: string;
    slot: number;
    source: string;
    tokenTransfers?: TokenTransfer[];
    nativeTransfers?: NativeTransfer[];
    accountData?: AccountData[];
}

interface TokenTransfer {
    fromUserAccount: string;
    toUserAccount: string;
    fromTokenAccount: string;
    toTokenAccount: string;
    tokenAmount: number;
    mint: string;
    tokenStandard: string;
}

interface NativeTransfer {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
}

interface AccountData {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: any[];
}

// In-memory store for demo (use Redis/database in production)
const recentNotifications: HeliusWebhookPayload[] = [];
const MAX_NOTIFICATIONS = 100;

/**
 * POST /api/webhooks/helius
 * Receives webhook events from Helius
 */
export async function POST(request: NextRequest) {
    try {
        const payload = await request.json() as HeliusWebhookPayload[];

        // Helius sends an array of events
        for (const event of payload) {
            console.log(`[Helius Webhook] Received ${event.type}:`, event.signature);

            // Add to recent notifications
            recentNotifications.unshift(event);
            if (recentNotifications.length > MAX_NOTIFICATIONS) {
                recentNotifications.pop();
            }

            // Process different event types
            switch (event.type) {
                case "TRANSFER":
                    // Handle token/SOL transfer
                    await handleTransfer(event);
                    break;
                case "SWAP":
                    // Handle swap event
                    await handleSwap(event);
                    break;
                case "NFT_MINT":
                case "NFT_SALE":
                    // Handle NFT events
                    await handleNFT(event);
                    break;
                default:
                    console.log(`[Helius Webhook] Unhandled type: ${event.type}`);
            }
        }

        return NextResponse.json({ success: true, processed: payload.length });
    } catch (error) {
        console.error("[Helius Webhook] Error:", error);
        return NextResponse.json(
            { error: "Webhook processing failed" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/webhooks/helius
 * Returns recent webhook notifications (for debugging/SSE fallback)
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "10");

    return NextResponse.json({
        notifications: recentNotifications.slice(0, limit),
        total: recentNotifications.length,
    });
}

// Event handlers
async function handleTransfer(event: HeliusWebhookPayload) {
    // TODO: Emit to WebSocket/SSE for real-time UI updates
    // Example: Notify user of incoming deposits
    if (event.tokenTransfers?.length) {
        for (const transfer of event.tokenTransfers) {
            console.log(`[Transfer] ${transfer.tokenAmount} of ${transfer.mint}`);
            console.log(`  From: ${transfer.fromUserAccount}`);
            console.log(`  To: ${transfer.toUserAccount}`);
        }
    }

    if (event.nativeTransfers?.length) {
        for (const transfer of event.nativeTransfers) {
            console.log(`[SOL Transfer] ${transfer.amount / 1e9} SOL`);
            console.log(`  From: ${transfer.fromUserAccount}`);
            console.log(`  To: ${transfer.toUserAccount}`);
        }
    }
}

async function handleSwap(event: HeliusWebhookPayload) {
    console.log(`[Swap] Transaction: ${event.signature}`);
    // TODO: Update trading positions in real-time
}

async function handleNFT(event: HeliusWebhookPayload) {
    console.log(`[NFT ${event.type}] Transaction: ${event.signature}`);
    // TODO: Handle NFT events if relevant
}
