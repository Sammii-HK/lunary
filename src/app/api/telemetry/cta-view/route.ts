import { NextRequest, NextResponse } from 'next/server';
import { canonicaliseEvent } from '@/lib/analytics/canonical-events';
import { forwardEventToPostHog } from '@/lib/posthog-forward';

export const dynamic = 'force-dynamic';

export const runtime = 'nodejs';

const ANON_ID_COOKIE = 'lunary_anon_id';

const resolvePathFromReferer = (referer: string | null): string | null => {
  if (!referer) return null;
  try {
    return new URL(referer).pathname || null;
  } catch {
    return null;
  }
};

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
    const payload = await request.json().catch(() => ({}));
    const pagePath =
      typeof payload?.pagePath === 'string' &&
      payload.pagePath.trim().length > 0
        ? payload.pagePath.trim()
        : (resolvePathFromReferer(request.headers.get('referer')) ?? null);

    const anonHeader = request.headers.get('x-lunary-anon-id');
    const anonCookie = request.cookies.get(ANON_ID_COOKIE)?.value;
    const anonymousId =
      typeof payload?.anonymousId === 'string' && payload.anonymousId.length > 0
        ? payload.anonymousId
        : anonHeader || anonCookie || undefined;

    const canonical = canonicaliseEvent({
      eventType: 'cta_impression',
      anonymousId,
      pagePath,
      metadata: {
        source: 'cta_impression',
        hub: typeof payload?.hub === 'string' ? payload.hub : undefined,
        cta_id: typeof payload?.ctaId === 'string' ? payload.ctaId : undefined,
        cta_location:
          typeof payload?.location === 'string' ? payload.location : undefined,
        cta_label:
          typeof payload?.label === 'string' ? payload.label : undefined,
        cta_href: typeof payload?.href === 'string' ? payload.href : undefined,
        example_type:
          typeof payload?.exampleType === 'string'
            ? payload.exampleType
            : undefined,
        example_text:
          typeof payload?.exampleText === 'string'
            ? payload.exampleText
            : undefined,
        cta_variant:
          typeof payload?.ctaVariant === 'string'
            ? payload.ctaVariant
            : undefined,
        cta_headline:
          typeof payload?.ctaHeadline === 'string'
            ? payload.ctaHeadline
            : undefined,
        cta_subline:
          typeof payload?.ctaSubline === 'string'
            ? payload.ctaSubline
            : undefined,
        abTest:
          typeof payload?.abTest === 'string' ? payload.abTest : undefined,
        abVariant:
          typeof payload?.abVariant === 'string'
            ? payload.abVariant
            : undefined,
        inline_style:
          typeof payload?.inlineStyle === 'string'
            ? payload.inlineStyle
            : undefined,
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

    const currentUrl = currentUrlFromPath(request, canonical.row.pagePath);

    forwardEventToPostHog({
      distinctId: canonical.row.anonymousId || 'unknown',
      event: 'cta_impression',
      properties: {
        ...canonical.row.metadata,
        event_id: canonical.row.eventId,
        canonical_event_type: canonical.row.eventType,
        feature_name: canonical.row.featureName,
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
    console.error('[telemetry/cta-view] Failed to record CTA view', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
