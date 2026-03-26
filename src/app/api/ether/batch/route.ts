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

/**
 * Batch analytics endpoint — replaces 3 separate middleware calls
 * (visit + open + product) with a single request.
 * Saves ~2 function invocations per page view.
 */
export async function POST(request: NextRequest) {
  try {
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
      return NextResponse.json(
        { success: false, error: 'Missing path' },
        { status: 400 },
      );
    }

    const anonHeader = request.headers.get('x-lunary-anon-id');
    const anonCookie = request.cookies.get(ANON_ID_COOKIE)?.value;
    const anonymousId = anonHeader || anonCookie || undefined;

    // Single auth lookup instead of 3 separate ones
    const currentUser = await getCurrentUser(request);
    const userId = currentUser?.id;
    const userEmail = currentUser?.email;

    const today = new Date().toISOString().split('T')[0];
    const identity = userId || anonymousId || 'unknown';
    const platform =
      typeof payload?.platform === 'string' ? payload.platform : undefined;

    const sharedMeta = {
      source: 'server_middleware',
      referrer: request.headers.get('referer') || undefined,
      user_agent: request.headers.get('user-agent') || undefined,
      platform,
    };

    // Identity stitching (once, not 2-3 times)
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
            console.warn('[batch] identity link error:', e);
          }
        });
    }

    const results: Record<string, string> = {};

    // 1. page_viewed
    const visitEventId = deterministicEventId(
      'page_viewed',
      identity,
      path,
      today,
    );
    const visitCanonical = canonicaliseEvent({
      eventType: 'page_viewed',
      eventId: visitEventId,
      userId,
      anonymousId,
      userEmail,
      pagePath: path,
      metadata: { ...sharedMeta, source: 'server_pageview' },
    });
    if (visitCanonical.ok) {
      const { inserted } = await insertCanonicalEvent(visitCanonical.row);
      results.visit = inserted ? 'tracked' : 'duplicate';
    }

    // 2. app_opened (once per identity per day)
    if (userId || anonymousId) {
      const openEventId = deterministicEventId('app_opened', identity, today);
      const openCanonical = canonicaliseEvent({
        eventType: 'app_opened',
        eventId: openEventId,
        userId,
        anonymousId,
        userEmail,
        pagePath: path,
        metadata: sharedMeta,
      });
      if (openCanonical.ok) {
        const { inserted } = await insertCanonicalEvent(openCanonical.row);
        results.open = inserted ? 'tracked' : 'duplicate';
      }
    }

    // 3. product_opened (authenticated users only, once per day)
    if (userId) {
      const productEventId = deterministicEventId(
        'product_opened',
        userId,
        today,
      );
      const productCanonical = canonicaliseEvent({
        eventType: 'product_opened',
        eventId: productEventId,
        userId,
        userEmail,
        pagePath: path,
        metadata: {
          source: 'server_middleware',
          referrer: request.headers.get('referer') || undefined,
          platform,
        },
      });
      if (productCanonical.ok) {
        const { inserted } = await insertCanonicalEvent(productCanonical.row);
        results.product = inserted ? 'tracked' : 'duplicate';
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error) {
    console.error('[ether/batch] ERROR:', {
      error: error instanceof Error ? error.message : 'Unknown error',
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
