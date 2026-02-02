import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { createHash } from 'crypto';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { getCurrentUser } from '@/lib/get-user-session';

/**
 * Generate deterministic eventId for deduplication
 * Same identity + date = same eventId, so DB unique constraint catches races
 */
function generateDeterministicEventId(
  eventType: string,
  userId: string,
  date: string,
): string {
  const input = `${eventType}:${userId}:${date}`;
  return createHash('md5').update(input).digest('hex');
}

export const runtime = 'nodejs';

/**
 * Server-side product_opened tracking
 * Tracks one event per AUTHENTICATED user per UTC day
 * Only fires for users with valid session (product_opened = logged-in app usage)
 * Called from middleware to ensure reliable tracking
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));
    const path = typeof payload?.path === 'string' ? payload.path.trim() : '/';

    // product_opened is ONLY for authenticated users
    const currentUser = await getCurrentUser(request);
    if (!currentUser?.id) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'not_authenticated',
      });
    }

    const userId = currentUser.id;
    const userEmail = currentUser.email;

    // Check for existing product_opened today (UTC day) - daily deduplication
    const today = new Date().toISOString().split('T')[0];

    // Generate deterministic eventId so DB unique constraint catches race conditions
    const eventId = generateDeterministicEventId(
      'product_opened',
      userId,
      today,
    );

    const canonical = canonicaliseEvent({
      eventType: 'product_opened',
      eventId,
      userId,
      userEmail,
      pagePath: path,
      metadata: {
        source: 'server_middleware',
        referrer: request.headers.get('referer') || undefined,
      },
    });

    if (!canonical.ok) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: canonical.reason,
      });
    }

    const existing = await sql`
      SELECT 1 FROM conversion_events
      WHERE event_type = 'product_opened'
        AND user_id = ${userId}
        AND created_at >= ${today}::date
        AND created_at < (${today}::date + INTERVAL '1 day')
      LIMIT 1
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'already_tracked_today',
      });
    }

    await insertCanonicalEvent(canonical.row);
    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error('[telemetry/product-opened] Failed to record', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
