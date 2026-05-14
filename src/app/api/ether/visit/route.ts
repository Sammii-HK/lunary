import { NextRequest, NextResponse } from 'next/server';
import { canonicaliseEvent } from '@/lib/analytics/canonical-events';
import { deterministicEventId } from '@/lib/analytics/deterministic-event-id';
import { detectBot } from '@/lib/analytics/bot-detection';
import { forwardEventToPostHog } from '@/lib/posthog-forward';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

const ANON_ID_COOKIE = 'lunary_anon_id';

function currentUrlFromPath(request: NextRequest, pagePath: string | null) {
  if (!pagePath) return null;
  try {
    return new URL(pagePath, request.nextUrl.origin).toString();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
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

    const today = new Date().toISOString().split('T')[0];
    const identity = anonymousId || 'unknown';
    const eventId = deterministicEventId('page_viewed', identity, path, today);

    const platform =
      typeof payload?.platform === 'string' ? payload.platform : undefined;

    const canonical = canonicaliseEvent({
      eventType: 'page_viewed',
      eventId,
      anonymousId,
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

    const currentUrl = currentUrlFromPath(request, canonical.row.pagePath);
    forwardEventToPostHog({
      distinctId: canonical.row.anonymousId || 'unknown',
      event: '$pageview',
      properties: {
        ...canonical.row.metadata,
        event_id: canonical.row.eventId,
        canonical_event_type: canonical.row.eventType,
        page_path: canonical.row.pagePath,
        $pathname: canonical.row.pagePath,
        $current_url: currentUrl,
        $referrer:
          typeof canonical.row.metadata?.referrer === 'string'
            ? canonical.row.metadata.referrer
            : undefined,
        authenticated: false,
      },
    });

    return NextResponse.json({ success: true, source: 'posthog' });
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
