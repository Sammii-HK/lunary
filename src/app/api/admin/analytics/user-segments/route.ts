import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';
import { getPostHogActiveUsers } from '@/lib/posthog-server';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Get paid user IDs
    const paidUserIdsResult = await sql`
      SELECT DISTINCT user_id
      FROM subscriptions
      WHERE status IN ('active', 'trial', 'past_due')
        AND plan_type != 'free'
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;
    const paidUserIds = paidUserIdsResult.rows
      .map((r) => r.user_id)
      .filter(Boolean);

    // Get free user IDs (all users not in paid list)
    const allUserIdsResult = await sql`
      SELECT DISTINCT user_id
      FROM conversion_events
      WHERE event_type = 'signup'
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
    `;
    const allUserIds = allUserIdsResult.rows
      .map((r) => r.user_id)
      .filter(Boolean);
    const freeUserIds = allUserIds.filter((id) => !paidUserIds.includes(id));

    // Helper to convert array to PostgreSQL text array literal
    const toTextArrayLiteral = (values: string[]): string | null => {
      if (values.length === 0) return null;
      return `{${values.map((v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
    };

    const paidUserIdsArray = toTextArrayLiteral(paidUserIds);
    const freeUserIdsArray = toTextArrayLiteral(freeUserIds);

    // Get engagement metrics for paid users
    const paidEngagementResult =
      paidUserIds.length > 0 && paidUserIdsArray
        ? await sql`
          SELECT 
            COUNT(DISTINCT user_id) as dau,
            COUNT(DISTINCT DATE(created_at)) as active_days,
            COUNT(*) as total_events
          FROM conversion_events
          WHERE user_id IN (
            SELECT unnest(${paidUserIdsArray}::text[])
          )
            AND created_at >= ${formatTimestamp(range.start)}
            AND created_at <= ${formatTimestamp(range.end)}
            AND event_type IN (
              'horoscope_viewed',
              'tarot_viewed',
              'birth_chart_viewed',
              'personalized_tarot_viewed',
              'personalized_horoscope_viewed',
              'crystal_recommendations_viewed'
            )
        `
        : { rows: [{ dau: 0, active_days: 0, total_events: 0 }] };

    // Get engagement metrics for free users
    const freeEngagementResult =
      freeUserIds.length > 0 && freeUserIdsArray
        ? await sql`
          SELECT 
            COUNT(DISTINCT user_id) as dau,
            COUNT(DISTINCT DATE(created_at)) as active_days,
            COUNT(*) as total_events
          FROM conversion_events
          WHERE user_id IN (
            SELECT unnest(${freeUserIdsArray}::text[])
          )
            AND created_at >= ${formatTimestamp(range.start)}
            AND created_at <= ${formatTimestamp(range.end)}
            AND event_type IN (
              'horoscope_viewed',
              'tarot_viewed',
              'birth_chart_viewed',
              'personalized_tarot_viewed',
              'personalized_horoscope_viewed',
              'crystal_recommendations_viewed'
            )
        `
        : { rows: [{ dau: 0, active_days: 0, total_events: 0 }] };

    const paidActiveUsers =
      paidUserIds.length > 0
        ? Number(paidEngagementResult.rows[0]?.dau || 0)
        : 0;
    const freeActiveUsers =
      freeUserIds.length > 0
        ? Number(freeEngagementResult.rows[0]?.dau || 0)
        : 0;

    const paidEngagement = {
      dau: Number(paidEngagementResult.rows[0]?.dau || 0),
      activeDays: Number(paidEngagementResult.rows[0]?.active_days || 0),
      totalEvents: Number(paidEngagementResult.rows[0]?.total_events || 0),
      avgEventsPerUser:
        paidActiveUsers > 0
          ? Number(paidEngagementResult.rows[0]?.total_events || 0) /
            paidActiveUsers
          : 0,
    };

    const freeEngagement = {
      dau: Number(freeEngagementResult.rows[0]?.dau || 0),
      activeDays: Number(freeEngagementResult.rows[0]?.active_days || 0),
      totalEvents: Number(freeEngagementResult.rows[0]?.total_events || 0),
      avgEventsPerUser:
        freeActiveUsers > 0
          ? Number(freeEngagementResult.rows[0]?.total_events || 0) /
            freeActiveUsers
          : 0,
    };

    // Get feature usage by segment
    const paidFeatureUsageResult =
      paidUserIds.length > 0 && paidUserIdsArray
        ? await sql`
          SELECT 
            event_type as feature,
            COUNT(*) as count,
            COUNT(DISTINCT user_id) as unique_users
          FROM conversion_events
          WHERE user_id IN (
            SELECT unnest(${paidUserIdsArray}::text[])
          )
            AND created_at >= ${formatTimestamp(range.start)}
            AND created_at <= ${formatTimestamp(range.end)}
            AND event_type IN (
              'tarot_viewed',
              'birth_chart_viewed',
              'horoscope_viewed',
              'personalized_tarot_viewed',
              'personalized_horoscope_viewed',
              'crystal_recommendations_viewed'
            )
          GROUP BY event_type
          ORDER BY count DESC
        `
        : { rows: [] };

    const freeFeatureUsageResult =
      freeUserIds.length > 0 && freeUserIdsArray
        ? await sql`
          SELECT 
            event_type as feature,
            COUNT(*) as count,
            COUNT(DISTINCT user_id) as unique_users
          FROM conversion_events
          WHERE user_id IN (
            SELECT unnest(${freeUserIdsArray}::text[])
          )
            AND created_at >= ${formatTimestamp(range.start)}
            AND created_at <= ${formatTimestamp(range.end)}
            AND event_type IN (
              'tarot_viewed',
              'birth_chart_viewed',
              'horoscope_viewed',
              'personalized_tarot_viewed',
              'personalized_horoscope_viewed',
              'crystal_recommendations_viewed'
            )
          GROUP BY event_type
          ORDER BY count DESC
        `
        : { rows: [] };

    // Get PostHog data for WAU/MAU comparison
    const posthogData = await getPostHogActiveUsers(range.end);

    return NextResponse.json({
      free: {
        totalUsers: freeUserIds.length,
        dau: freeEngagement.dau,
        wau: posthogData?.wau || 0, // Approximate
        mau: posthogData?.mau || 0, // Approximate
        engagement: freeEngagement,
        featureUsage: freeFeatureUsageResult.rows.map((row) => ({
          feature: row.feature as string,
          count: Number(row.count || 0),
          uniqueUsers: Number(row.unique_users || 0),
        })),
      },
      paid: {
        totalUsers: paidUserIds.length,
        dau: paidEngagement.dau,
        wau: 0, // Would need separate PostHog query filtered by paid users
        mau: 0, // Would need separate PostHog query filtered by paid users
        engagement: paidEngagement,
        featureUsage: paidFeatureUsageResult.rows.map((row) => ({
          feature: row.feature as string,
          count: Number(row.count || 0),
          uniqueUsers: Number(row.unique_users || 0),
        })),
      },
    });
  } catch (error) {
    console.error('[analytics/user-segments] Failed to load metrics', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        free: {
          totalUsers: 0,
          dau: 0,
          wau: 0,
          mau: 0,
          engagement: {
            dau: 0,
            activeDays: 0,
            totalEvents: 0,
            avgEventsPerUser: 0,
          },
          featureUsage: [],
        },
        paid: {
          totalUsers: 0,
          dau: 0,
          wau: 0,
          mau: 0,
          engagement: {
            dau: 0,
            activeDays: 0,
            totalEvents: 0,
            avgEventsPerUser: 0,
          },
          featureUsage: [],
        },
      },
      { status: 500 },
    );
  }
}
