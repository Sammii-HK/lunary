import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/get-user-session';
import {
  canonicaliseEvent,
  insertCanonicalEvent,
} from '@/lib/analytics/canonical-events';
import { forwardEventToPostHog, aliasPostHogUser } from '@/lib/posthog-forward';
import { sql } from '@vercel/postgres';

function normalizeEmail(email: unknown): string | null {
  if (typeof email !== 'string') return null;
  const trimmed = email.trim().toLowerCase();
  return trimmed ? trimmed : null;
}

export async function POST(request: NextRequest) {
  try {
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

    const safeUserId =
      typeof userId === 'string'
        ? userId.trim()
        : typeof userId === 'number' || typeof userId === 'bigint'
          ? String(userId)
          : '';

    const normalizedEmail = normalizeEmail(userEmail);

    const currentUser =
      !safeUserId || !normalizedEmail ? await getCurrentUser(request) : null;
    const resolvedUserId = safeUserId || currentUser?.id || null;
    const resolvedEmail = normalizedEmail || currentUser?.email || null;

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
      metadata,
    });

    if (!canonical.ok) {
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: canonical.reason,
      });
    }

    const { inserted } = await insertCanonicalEvent(canonical.row);

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
        canonical.row.eventType === 'user_signed_up'
      ) {
        aliasPostHogUser(canonical.row.userId, canonical.row.anonymousId);
      }
      if (
        canonical.row.userId &&
        canonical.row.anonymousId &&
        canonical.row.eventType === 'user_logged_in'
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
