import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user-session';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { forwardEventToPostHog, aliasPostHogUser } from '@/lib/posthog-forward';
import { sql } from '@vercel/postgres';
import { detectBot } from '@/lib/analytics/bot-detection';
import type { CanonicalEventType } from '@/lib/analytics/canonical-events';

export const dynamic = 'force-dynamic';

const POSTHOG_ONLY_EVENTS = new Set<CanonicalEventType>([
  'page_viewed',
  'cta_impression',
]);

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

function normalizeOriginField(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function extractOriginMetadata(
  metadata: unknown,
  pagePath: string | null,
): {
  originHub: string | null;
  originPage: string | null;
  originType: string | null;
} {
  const input =
    metadata && typeof metadata === 'object'
      ? (metadata as Record<string, unknown>)
      : null;

  const originHub = normalizeOriginField(input?.origin_hub);
  const originPage = normalizeOriginField(input?.origin_page) || pagePath;
  const originType = normalizeOriginField(input?.origin_type);

  return { originHub, originPage, originType };
}

function detectDeviceType(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (/ipad|tablet|sm-t|kindle|silk/i.test(userAgent)) return 'tablet';
  if (/mobile|iphone|ipod|android/i.test(userAgent)) return 'mobile';
  return 'desktop';
}

function detectOs(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (/android/i.test(userAgent)) return 'Android';
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'iOS';
  if (/windows/i.test(userAgent)) return 'Windows';
  if (/mac os x|macintosh/i.test(userAgent)) return 'Mac';
  if (/cros/i.test(userAgent)) return 'ChromeOS';
  if (/linux/i.test(userAgent)) return 'GNU/Linux';
  return null;
}

function detectBrowser(userAgent: string | null): string | null {
  if (!userAgent) return null;
  if (/edg\//i.test(userAgent)) return 'Edge';
  if (/samsungbrowser/i.test(userAgent)) return 'Samsung Internet';
  if (/firefox|fxios/i.test(userAgent)) return 'Firefox';
  if (/crios/i.test(userAgent)) return 'Chrome iOS';
  if (/chrome/i.test(userAgent)) return 'Chrome';
  if (/safari/i.test(userAgent)) return 'Safari';
  return null;
}

function enrichMetadataFromRequest(
  metadata: unknown,
  request: NextRequest,
): Record<string, unknown> | null {
  const input =
    metadata && typeof metadata === 'object'
      ? ({ ...(metadata as Record<string, unknown>) } as Record<
          string,
          unknown
        >)
      : {};

  const userAgent = request.headers.get('user-agent');
  const referrer = request.headers.get('referer');
  const country =
    request.headers.get('x-vercel-ip-country') ||
    request.headers.get('x-country');
  const device = detectDeviceType(userAgent);
  const os = detectOs(userAgent);
  const browser = detectBrowser(userAgent);

  if (!input.referrer && referrer) input.referrer = referrer;
  if (!input.user_agent && userAgent) input.user_agent = userAgent;
  if (!input.country && country) input.country = country;
  if (!input.device && device) input.device = device;
  if (!input.os && os) input.os = os;
  if (!input.browser && browser) input.browser = browser;

  return Object.keys(input).length > 0 ? input : null;
}

function buildCurrentUrl(
  request: NextRequest,
  pagePath: string | null,
): string | null {
  if (!pagePath) return null;
  try {
    return new URL(pagePath, request.nextUrl.origin).toString();
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Bot detection — reject before any DB work
    const botReason = detectBot(request.headers);
    if (botReason) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: botReason,
      });
    }

    // Handle empty body gracefully
    const bodyText = await request.text();
    if (!bodyText || bodyText.trim() === '') {
      return NextResponse.json(
        { error: 'Request body is required' },
        { status: 400 },
      );
    }

    const data = JSON.parse(bodyText);

    const {
      event,
      eventId,
      userId,
      anonymousId,
      userEmail,
      planType,
      trialDaysRemaining,
      featureName,
      pagePath,
      entityType,
      entityId,
      metadata,
    } = data;

    const enrichedMetadata = enrichMetadataFromRequest(metadata, request);

    const normalizedEmail = normalizeEmail(userEmail);

    if (POSTHOG_ONLY_EVENTS.has(event)) {
      const canonical = canonicaliseEvent({
        eventType: event,
        eventId,
        anonymousId,
        userEmail: normalizedEmail,
        planType,
        trialDaysRemaining,
        featureName,
        pagePath,
        entityType,
        entityId,
        metadata: enrichedMetadata,
      });

      if (!canonical.ok) {
        return NextResponse.json({
          success: true,
          skipped: true,
          reason: canonical.reason,
        });
      }

      const distinctId =
        canonical.row.anonymousId || canonical.row.userId || 'unknown';
      const currentUrl = buildCurrentUrl(request, canonical.row.pagePath);

      forwardEventToPostHog({
        distinctId,
        event:
          canonical.row.eventType === 'page_viewed'
            ? '$pageview'
            : canonical.row.eventType,
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
          $session_id:
            typeof canonical.row.metadata?.analytics_session_id === 'string'
              ? canonical.row.metadata.analytics_session_id
              : undefined,
          authenticated: false,
        },
      });

      return NextResponse.json({ success: true, source: 'posthog' });
    }

    // Always resolve identity from the session — never trust userId from the
    // request body. Accepting arbitrary body userIds was the bot attack vector:
    // bots posted random UUIDs as userId and bypassed the session check.
    const currentUser = await getCurrentUser(request);
    const resolvedUserId = currentUser?.id || null;
    const resolvedEmail = currentUser?.email || normalizedEmail || null;

    // Identity stitching: if we have both a real user id and an anonymous id, link them.
    // This lets retention treat anonymous "returns" as belonging to the signed-in user.
    if (
      resolvedUserId &&
      typeof anonymousId === 'string' &&
      anonymousId.trim().length > 0 &&
      !String(resolvedUserId).startsWith('anon:')
    ) {
      try {
        await sql.query(
          `
            INSERT INTO analytics_identity_links (user_id, anonymous_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `,
          [String(resolvedUserId), anonymousId.trim()],
        );
      } catch (e) {
        // Backwards compatible: table may not exist until migrations run.
        if (
          !(e instanceof Error) ||
          !String(e.message).includes('analytics_identity_links')
        ) {
          throw e;
        }
      }
    }

    const canonical = canonicaliseEvent({
      eventType: event,
      eventId,
      userId: resolvedUserId,
      anonymousId,
      userEmail: resolvedEmail,
      planType,
      trialDaysRemaining,
      featureName,
      pagePath,
      entityType,
      entityId,
      metadata: enrichedMetadata,
    });

    if (!canonical.ok) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: canonical.reason,
      });
    }

    const { inserted } = await insertCanonicalEvent(canonical.row);

    if (
      canonical.row.eventType === 'signup_completed' &&
      resolvedUserId &&
      !String(resolvedUserId).startsWith('anon:')
    ) {
      const { originHub, originPage, originType } = extractOriginMetadata(
        enrichedMetadata,
        canonical.row.pagePath,
      );
      const signupAt = canonical.row.createdAt ?? new Date();

      try {
        await sql.query(
          `
            INSERT INTO user_profiles (
              user_id,
              origin_hub,
              origin_page,
              origin_type,
              signup_at
            )
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (user_id) DO UPDATE
            SET
              origin_hub = COALESCE(user_profiles.origin_hub, EXCLUDED.origin_hub),
              origin_page = COALESCE(user_profiles.origin_page, EXCLUDED.origin_page),
              origin_type = COALESCE(user_profiles.origin_type, EXCLUDED.origin_type),
              signup_at = COALESCE(user_profiles.signup_at, EXCLUDED.signup_at)
          `,
          [String(resolvedUserId), originHub, originPage, originType, signupAt],
        );
      } catch (e: any) {
        if (e?.code !== '42P01') {
          throw e;
        }
      }
    }

    if (inserted) {
      const distinctId =
        canonical.row.anonymousId || canonical.row.userId || 'unknown';

      const forwardProps = {
        ...canonical.row.metadata,
        event_id: canonical.row.eventId,
        plan_type: canonical.row.planType,
        trial_days_remaining: canonical.row.trialDaysRemaining,
        feature_name: canonical.row.featureName,
        page_path: canonical.row.pagePath,
        entity_type: canonical.row.entityType,
        entity_id: canonical.row.entityId,
        authenticated: !canonical.row.userId.startsWith('anon:'),
      };

      forwardEventToPostHog({
        distinctId,
        event: canonical.row.eventType,
        properties: forwardProps,
      });

      if (
        canonical.row.userId &&
        canonical.row.anonymousId &&
        (canonical.row.eventType === 'user_signed_up' ||
          canonical.row.eventType === 'signup_completed' ||
          canonical.row.eventType === 'user_logged_in')
      ) {
        aliasPostHogUser(canonical.row.userId, canonical.row.anonymousId);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking conversion event:', error);

    if (
      error instanceof Error &&
      error.message.includes('relation "conversion_events" does not exist')
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conversion events table not initialized',
          message:
            'Run the database setup script to create the conversion_events table',
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get('event');
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') || '100');

    let result;
    if (eventType && userId) {
      result = await sql`
        SELECT 
          id,
          event_type,
          user_id,
          user_email,
          plan_type,
          trial_days_remaining,
          feature_name,
          page_path,
          metadata,
          created_at
        FROM conversion_events
        WHERE event_type = ${eventType}
        AND user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (eventType) {
      result = await sql`
        SELECT 
          id,
          event_type,
          user_id,
          user_email,
          plan_type,
          trial_days_remaining,
          feature_name,
          page_path,
          metadata,
          created_at
        FROM conversion_events
        WHERE event_type = ${eventType}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else if (userId) {
      result = await sql`
        SELECT 
          id,
          event_type,
          user_id,
          user_email,
          plan_type,
          trial_days_remaining,
          feature_name,
          page_path,
          metadata,
          created_at
        FROM conversion_events
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      result = await sql`
        SELECT 
          id,
          event_type,
          user_id,
          user_email,
          plan_type,
          trial_days_remaining,
          feature_name,
          page_path,
          metadata,
          created_at
        FROM conversion_events
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({
      success: true,
      events: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error('Error fetching conversion events:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
