import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { getCurrentUser } from '@/lib/get-user-session';

export const runtime = 'nodejs';

const ANON_ID_COOKIE = 'lunary_anon_id';

/**
 * Server-side app_opened tracking
 * Tracks one event per user per UTC day
 * Called from middleware to ensure reliable tracking (bypasses ad blockers)
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));
    const path = typeof payload?.path === 'string' ? payload.path.trim() : '/';

    const anonHeader = request.headers.get('x-lunary-anon-id');
    const anonCookie = request.cookies.get(ANON_ID_COOKIE)?.value;
    const anonymousId = anonHeader || anonCookie || undefined;

    const currentUser = await getCurrentUser(request);
    const userId = currentUser?.id;
    const userEmail = currentUser?.email;

    // Must have either userId or anonymousId
    if (!userId && !anonymousId) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'no_identity',
      });
    }

    const canonical = canonicaliseEvent({
      eventType: 'app_opened',
      userId,
      anonymousId,
      userEmail,
      pagePath: path,
      metadata: {
        source: 'server_middleware',
        referrer: request.headers.get('referer') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
      },
    });

    if (!canonical.ok) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: canonical.reason,
      });
    }

    // Check for existing app_opened today (UTC day) - daily deduplication
    const today = new Date().toISOString().split('T')[0];

    const existing = userId
      ? await sql`
          SELECT 1 FROM conversion_events
          WHERE event_type = 'app_opened'
            AND user_id = ${userId}
            AND created_at >= ${today}::date
            AND created_at < (${today}::date + INTERVAL '1 day')
          LIMIT 1
        `
      : await sql`
          SELECT 1 FROM conversion_events
          WHERE event_type = 'app_opened'
            AND anonymous_id = ${anonymousId}
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
    console.error('[telemetry/app-opened] Failed to record app_opened', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
