import { NextRequest, NextResponse } from 'next/server';

// In-memory backup (for when Google Sheets fails)
const waitlistBackup: { email: string; timestamp: string; source?: string }[] = [];

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, source } = body;

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email required' },
                { status: 400 }
            );
        }

        // Check for duplicate in backup
        if (waitlistBackup.some(entry => entry.email === email)) {
            return NextResponse.json(
                { message: 'Already on waitlist', count: waitlistBackup.length },
                { status: 200 }
            );
        }

        const entry = {
            email,
            timestamp: new Date().toISOString(),
            source: source || 'landing',
        };

        // Try to send to Google Sheets
        const webhookUrl = process.env.GOOGLE_SHEETS_WEBHOOK_URL;
        if (webhookUrl) {
            try {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(entry),
                });
                console.log(`[Waitlist] Added to Google Sheets: ${email}`);
            } catch (sheetError) {
                console.error('[Waitlist] Google Sheets error:', sheetError);
            }
        }

        // Also keep in memory backup
        waitlistBackup.push(entry);
        console.log(`[Waitlist] New signup: ${email} (Total: ${waitlistBackup.length})`);

        return NextResponse.json({
            message: 'Successfully added to waitlist',
            count: waitlistBackup.length,
        });
    } catch (error) {
        console.error('[Waitlist] Error:', error);
        return NextResponse.json(
            { error: 'Failed to join waitlist' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        count: waitlistBackup.length,
    });
}
