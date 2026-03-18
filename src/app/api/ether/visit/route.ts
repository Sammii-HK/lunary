import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { deterministicEventId } from '@/lib/analytics/deterministic-event-id';
import { getCurrentUser } from '@/lib/get-user-session';
import { detectBot } from '@/lib/analytics/bot-detection';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

const ANON_ID_COOKIE = 'lunary_anon_id';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Bot detection (second layer — middleware already filters, but direct calls bypass it)
    const botReason = detectBot(request.headers);
    if (botReason) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: botReason,
      });
    }

    const payload = await request.json().catch(() => ({}));
    const path = typeof payload?.path === 'string' ? payload.path.trim() : '';

    if (!path) {
      console.warn('[page_viewed] SKIPPED - missing path');
      return NextResponse.json(
        { success: false, error: 'Missing path' },
        { status: 400 },
      );
    }

    const anonHeader = request.headers.get('x-lunary-anon-id');
    const anonCookie = request.cookies.get(ANON_ID_COOKIE)?.value;
    const anonymousId = anonHeader || anonCookie || undefined;

    const currentUser = await getCurrentUser(request);
    const userId = currentUser?.id;
    const userEmail = currentUser?.email;

    // Generate deterministic eventId so DB unique constraint handles dedup
    const today = new Date().toISOString().split('T')[0];
    const identity = userId || anonymousId || 'unknown';
    const eventId = deterministicEventId('page_viewed', identity, path, today);

    const platform =
      typeof payload?.platform === 'string' ? payload.platform : undefined;

    const canonical = canonicaliseEvent({
      eventType: 'page_viewed',
      eventId,
      userId,
      anonymousId,
      userEmail,
      pagePath: path,
      metadata: {
        source: 'server_pageview',
        referrer: request.headers.get('referer') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
        platform,
      },
    });

    if (!canonical.ok) {
      console.warn(
        '[page_viewed] SKIPPED - canonicalization failed:',
        canonical.reason,
      );
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: canonical.reason,
      });
    }

    // Identity stitching MUST run before dedup early-return.
    // When a logged-in user's page_viewed is deduplicated (anonymous event
    // already exists today), we still need the identity link so dau-wau-mau
    // can resolve their anonymous events to their real user ID.
    if (userId && anonymousId && !userId.startsWith('anon:')) {
      sql
        .query(
          `INSERT INTO analytics_identity_links (user_id, anonymous_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [userId, anonymousId],
        )
        .catch((e) => {
          if (
            !(e instanceof Error) ||
            !e.message.includes('analytics_identity_links')
          ) {
            console.warn('[page_viewed] identity link error:', e);
          }
        });
    }

    // Dedup handled by DB unique constraint on event_id — single INSERT, no SELECT needed
    const { inserted } = await insertCanonicalEvent(canonical.row);

    if (!inserted) {
      return NextResponse.json({ status: 'skipped', reason: 'duplicate' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[page_viewed] ERROR:', {
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
