/**
 * Webhook Management API
 * 
 * Endpoints for creating/managing Helius webhooks
 */

import { NextRequest, NextResponse } from "next/server";
import { createWebhook, WebhookConfig } from "@/lib/helius";

/**
 * POST /api/webhooks/manage
 * Create a new Helius webhook
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!body.addresses || !Array.isArray(body.addresses)) {
            return NextResponse.json(
                { error: "addresses array is required" },
                { status: 400 }
            );
        }

        // Construct webhook config
        const config: WebhookConfig = {
            webhookURL: body.webhookURL || `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/helius`,
            transactionTypes: body.transactionTypes || [
                "TRANSFER",
                "SWAP",
                "ANY" // Or specific types like: "NFT_SALE", "NFT_MINT"
            ],
            accountAddresses: body.addresses,
            webhookType: body.enhanced ? "enhanced" : "raw",
        };

        const webhookId = await createWebhook(config);

        if (!webhookId) {
            return NextResponse.json(
                { error: "Failed to create webhook. Check HELIUS_API_KEY." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            webhookId,
            config: {
                ...config,
                // Don't expose full URL in response
                webhookURL: config.webhookURL.replace(/(https?:\/\/[^/]+).*/, "$1/..."),
            },
        });
    } catch (error) {
        console.error("[Webhook Manage] Error:", error);
        return NextResponse.json(
            { error: "Failed to create webhook" },
            { status: 500 }
        );
    }
}

/**
 * GET /api/webhooks/manage
 * List existing webhooks (requires API key)
 */
export async function GET() {
    const apiKey = process.env.HELIUS_API_KEY;

    if (!apiKey) {
        return NextResponse.json(
            { error: "HELIUS_API_KEY not configured" },
            { status: 500 }
        );
    }

    try {
        const response = await fetch(`https://api.helius.xyz/v0/webhooks?api-key=${apiKey}`);
        const webhooks = await response.json();

        return NextResponse.json({ webhooks });
    } catch (error) {
        console.error("[Webhook List] Error:", error);
        return NextResponse.json(
            { error: "Failed to list webhooks" },
            { status: 500 }
        );
    }
}
