import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { getCurrentUser } from '@/lib/get-user-session';

export const dynamic = 'force-dynamic';

/**
 * Generate deterministic eventId for deduplication
 * Same identity + date = same eventId, so DB unique constraint catches races
 */
function generateDeterministicEventId(
  eventType: string,
  userId: string | undefined,
  anonymousId: string | undefined,
  date: string,
): string {
  const identity = userId || anonymousId || 'unknown';
  const input = `${eventType}:${identity}:${date}`;
  const hash = createHash('sha256').update(input).digest('hex');
  // Convert hash to UUID format (take first 32 chars and format as UUID v5-like)
  return `00000000-0000-5000-8000-${hash.substring(0, 12)}`;
}

export const runtime = 'nodejs';

const ANON_ID_COOKIE = 'lunary_anon_id';

/**
 * Server-side app_opened tracking
 * Tracks one event per user per UTC day
 * Called from middleware to ensure reliable tracking (bypasses ad blockers)
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[app_opened] Request received');

  try {
    const payload = await request.json().catch(() => ({}));
    const path = typeof payload?.path === 'string' ? payload.path.trim() : '/';

    const anonHeader = request.headers.get('x-lunary-anon-id');
    const anonCookie = request.cookies.get(ANON_ID_COOKIE)?.value;
    const anonymousId = anonHeader || anonCookie || undefined;

    const currentUser = await getCurrentUser(request);
    const userId = currentUser?.id;
    const userEmail = currentUser?.email;

    console.log('[app_opened] Identity check:', {
      userId: userId ? 'present' : 'none',
      anonymousId: anonymousId ? 'present' : 'none',
      anonHeader: anonHeader ? 'present' : 'none',
      anonCookie: anonCookie ? 'present' : 'none',
      path,
    });

    // Must have either userId or anonymousId
    if (!userId && !anonymousId) {
      console.warn('[app_opened] SKIPPED - no identity');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'no_identity',
      });
    }

    // Check for existing app_opened today (UTC day) - daily deduplication
    // Check BOTH user_id AND anonymous_id to prevent double-counting when user logs in mid-session
    const today = new Date().toISOString().split('T')[0];

    // Generate deterministic eventId so DB unique constraint catches race conditions
    const eventId = generateDeterministicEventId(
      'app_opened',
      userId,
      anonymousId,
      today,
    );

    const canonical = canonicaliseEvent({
      eventType: 'app_opened',
      eventId,
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
      console.warn(
        '[app_opened] SKIPPED - canonicalization failed:',
        canonical.reason,
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: canonical.reason,
      });
    }

    // Deterministic eventId + ON CONFLICT DO NOTHING handles deduplication —
    // no need for a SELECT first.
    const { inserted } = await insertCanonicalEvent(canonical.row);

    if (!inserted) {
      console.log('[app_opened] SKIPPED - already tracked today');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'already_tracked_today',
      });
    }

    console.log('[app_opened] INSERT success', {
      duration: Date.now() - startTime,
      userId: userId ? 'present' : 'none',
      anonymousId: anonymousId ? 'present' : 'none',
    });
    return NextResponse.json({ success: true, tracked: true });
  } catch (error) {
    console.error('[app_opened] ERROR:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
