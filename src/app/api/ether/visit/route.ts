import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { getCurrentUser } from '@/lib/get-user-session';

export const runtime = 'nodejs';

const ANON_ID_COOKIE = 'lunary_anon_id';

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  console.log('[page_viewed] Request received');

  try {
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

    console.log('[page_viewed] Identity check:', {
      userId: userId ? 'present' : 'none',
      anonymousId: anonymousId ? 'present' : 'none',
      anonHeader: anonHeader ? 'present' : 'none',
      anonCookie: anonCookie ? 'present' : 'none',
      path,
    });

    const canonical = canonicaliseEvent({
      eventType: 'page_viewed',
      userId,
      anonymousId,
      userEmail,
      pagePath: path,
      metadata: {
        source: 'server_pageview',
        referrer: request.headers.get('referer') || undefined,
        user_agent: request.headers.get('user-agent') || undefined,
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

    const today = new Date().toISOString().split('T')[0];
    const existing = userId
      ? await sql`
          SELECT 1 FROM conversion_events
          WHERE event_type = 'page_viewed'
            AND user_id = ${userId}
            AND page_path = ${path}
            AND created_at >= ${today}::date
            AND created_at < (${today}::date + INTERVAL '1 day')
          LIMIT 1
        `
      : anonymousId
        ? await sql`
            SELECT 1 FROM conversion_events
            WHERE event_type = 'page_viewed'
              AND anonymous_id = ${anonymousId}
              AND page_path = ${path}
              AND created_at >= ${today}::date
              AND created_at < (${today}::date + INTERVAL '1 day')
            LIMIT 1
          `
        : { rows: [] };

    if (existing.rows.length > 0) {
      console.log('[page_viewed] SKIPPED - duplicate');
      return NextResponse.json({ status: 'skipped', reason: 'duplicate' });
    }

    await insertCanonicalEvent(canonical.row);

    // Server-side identity stitching: link anonymous browsing to authenticated user.
    // This runs from middleware so it's ad-blocker proof — ensures the link exists
    // even if the client-side /api/ether/cv call was blocked.
    if (userId && anonymousId && !userId.startsWith('anon:')) {
      sql
        .query(
          `INSERT INTO analytics_identity_links (user_id, anonymous_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [userId, anonymousId],
        )
        .catch((e) => {
          // Table may not exist until migrations run
          if (
            !(e instanceof Error) ||
            !e.message.includes('analytics_identity_links')
          ) {
            console.warn('[page_viewed] identity link error:', e);
          }
        });
    }

    console.log('[page_viewed] INSERT success', {
      duration: Date.now() - startTime,
      userId: userId ? 'present' : 'none',
      anonymousId: anonymousId ? 'present' : 'none',
    });
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
