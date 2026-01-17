import { NextRequest, NextResponse } from 'next/server';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { getCurrentUser } from '@/lib/get-user-session';

export const runtime = 'nodejs';

const ANON_ID_COOKIE = 'lunary_anon_id';

export async function POST(request: NextRequest) {
  try {
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

    const currentUser = await getCurrentUser(request);
    const userId = currentUser?.id;
    const userEmail = currentUser?.email;

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
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: canonical.reason,
      });
    }

    await insertCanonicalEvent(canonical.row);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[telemetry/pageview] Failed to record pageview', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
