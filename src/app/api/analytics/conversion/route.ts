import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { trackActivity } from '@/lib/analytics/tracking';
import { getCurrentUser } from '@/lib/get-user-session';

function normalizeEmail(email: unknown): string | undefined {
  if (typeof email !== 'string') {
    return undefined;
  }

  const trimmed = email.trim();
  return trimmed ? trimmed.toLowerCase() : undefined;
}

function extractEmailFromMetadata(metadata: unknown): string | undefined {
  if (metadata && typeof metadata === 'object') {
    const candidate =
      (metadata as Record<string, unknown>).userEmail ||
      (metadata as Record<string, unknown>).email ||
      (metadata as Record<string, unknown>).customerEmail ||
      (metadata as Record<string, unknown>).customer_email;

    return normalizeEmail(candidate);
  }

  return undefined;
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
      userId,
      userEmail,
      planType,
      trialDaysRemaining,
      featureName,
      pagePath,
      metadata,
    } = data;

    const normalizedEmail =
      normalizeEmail(userEmail) ?? extractEmailFromMetadata(metadata);
    const safeUserId =
      typeof userId === 'string'
        ? userId.trim() || null
        : typeof userId === 'number' || typeof userId === 'bigint'
          ? String(userId)
          : null;

    const currentUser =
      !safeUserId || !normalizedEmail ? await getCurrentUser(request) : null;
    const resolvedUserId = safeUserId || currentUser?.id || null;
    const resolvedEmail = normalizedEmail || currentUser?.email || null;

    if (event === 'signup' && resolvedUserId) {
      await sql`
        INSERT INTO conversion_events (
          event_type,
          user_id,
          user_email,
          plan_type,
          trial_days_remaining,
          feature_name,
          page_path,
          metadata,
          created_at
        )
        SELECT
          ${event},
          ${resolvedUserId},
          ${resolvedEmail || null},
          ${planType || null},
          ${trialDaysRemaining || null},
          ${featureName || null},
          ${pagePath || null},
          ${metadata ? JSON.stringify(metadata) : null},
          NOW()
        WHERE NOT EXISTS (
          SELECT 1
          FROM conversion_events
          WHERE event_type = ${event}
            AND user_id = ${resolvedUserId}
        )
      `;
    } else {
      await sql`
        INSERT INTO conversion_events (
          event_type,
          user_id,
          user_email,
          plan_type,
          trial_days_remaining,
          feature_name,
          page_path,
          metadata,
          created_at
        ) VALUES (
          ${event},
          ${resolvedUserId},
          ${resolvedEmail || null},
          ${planType || null},
          ${trialDaysRemaining || null},
          ${featureName || null},
          ${pagePath || null},
          ${metadata ? JSON.stringify(metadata) : null},
          NOW()
        )
      `;
    }

    // Also track activity for feature views to populate feature usage analytics
    if (resolvedUserId) {
      const activityTypeMap: Record<string, string> = {
        tarot_viewed: 'tarot',
        birth_chart_viewed: 'birth_chart',
        horoscope_viewed: 'cosmic_state',
        personalized_horoscope_viewed: 'cosmic_state',
        personalized_tarot_viewed: 'tarot',
        app_opened: 'session',
        ai_chat: 'ai_chat',
      };

      const activityType = activityTypeMap[event] || featureName || event;

      // Only track activity for feature-related events, not conversion events
      if (
        activityType !== 'signup' &&
        activityType !== 'trial_started' &&
        activityType !== 'trial_converted' &&
        activityType !== 'subscription_started' &&
        activityType !== 'trial_expired'
      ) {
        try {
          await trackActivity({
            userId: resolvedUserId,
            activityType,
            metadata: metadata || {},
          });
        } catch (activityError) {
          // Don't fail the conversion tracking if activity tracking fails
          console.error('[analytics] Failed to track activity:', activityError);
        }
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
