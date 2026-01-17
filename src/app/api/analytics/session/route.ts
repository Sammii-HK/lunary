import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user-session';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { forwardEventToPostHog } from '@/lib/posthog-forward';
import { sql } from '@vercel/postgres';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId, anonymousId, eventId, pagePath, metadata } = body as {
      userId?: string;
      anonymousId?: string;
      eventId?: string;
      pagePath?: string;
      metadata?: Record<string, unknown>;
    };

    const currentUser = await getCurrentUser(request);
    const resolvedUserId = userId || currentUser?.id;
    const resolvedEmail = currentUser?.email;

    if (
      resolvedEmail &&
      (resolvedEmail.endsWith('@test.lunary.app') ||
        resolvedEmail === TEST_EMAIL_EXACT)
    ) {
      return NextResponse.json({ success: true, skipped: true });
    }

    const canonical = canonicaliseEvent({
      eventType: 'app_opened',
      eventId,
      userId: resolvedUserId,
      anonymousId,
      userEmail: resolvedEmail,
      pagePath,
      metadata,
    });

    if (!canonical.ok) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: canonical.reason,
      });
    }

    // Identity stitching: if we have both a real user id and an anonymous id, link them.
    if (
      canonical.row.userId &&
      canonical.row.anonymousId &&
      !canonical.row.userId.startsWith('anon:')
    ) {
      try {
        await sql.query(
          `
            INSERT INTO analytics_identity_links (user_id, anonymous_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING
          `,
          [canonical.row.userId, canonical.row.anonymousId],
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

    const { inserted } = await insertCanonicalEvent(canonical.row);

    if (inserted) {
      const distinctId =
        canonical.row.anonymousId || canonical.row.userId || 'unknown';
      forwardEventToPostHog({
        distinctId,
        event: canonical.row.eventType,
        properties: {
          ...canonical.row.metadata,
          event_id: canonical.row.eventId,
          plan_type: canonical.row.planType,
          trial_days_remaining: canonical.row.trialDaysRemaining,
          feature_name: canonical.row.featureName,
          page_path: canonical.row.pagePath,
          entity_type: canonical.row.entityType,
          entity_id: canonical.row.entityId,
          authenticated: !canonical.row.userId.startsWith('anon:'),
        },
      });
    }

    return NextResponse.json({ success: true, skipped: !inserted });
  } catch (error) {
    console.error('Error tracking session:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
