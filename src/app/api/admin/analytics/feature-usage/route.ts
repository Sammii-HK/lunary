import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { resolveDateRange, formatTimestamp } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

// Canonical event types shown in the product feature panel.
const FEATURE_EVENTS = [
  'daily_dashboard_viewed',
  'grimoire_viewed',
  'astral_chat_used',
  'tarot_drawn',
  'ritual_completed',
  'chart_viewed',
  'signup_completed',
  'trial_started',
  'subscription_started',
  'subscription_cancelled',
];

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 7);

    const [featureResult, activeUsersResult, heatmapResult] = await Promise.all(
      [
        sql.query(
          `
            SELECT
              event_type as feature,
              COUNT(*) as total_events,
              COUNT(DISTINCT user_id) as unique_users
            FROM conversion_events
            WHERE event_type = ANY($1::text[])
              AND created_at >= $2
              AND created_at <= $3
              AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
            GROUP BY event_type
            ORDER BY total_events DESC
          `,
          [
            FEATURE_EVENTS,
            formatTimestamp(range.start),
            formatTimestamp(range.end),
            TEST_EMAIL_PATTERN,
            TEST_EMAIL_EXACT,
          ],
        ),
        sql.query(
          `
            SELECT COUNT(DISTINCT user_id) as total_users
            FROM conversion_events
            WHERE event_type = ANY($1::text[])
              AND created_at >= $2
              AND created_at <= $3
              AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
          `,
          [
            FEATURE_EVENTS,
            formatTimestamp(range.start),
            formatTimestamp(range.end),
            TEST_EMAIL_PATTERN,
            TEST_EMAIL_EXACT,
          ],
        ),
        sql.query(
          `
            SELECT
              DATE(created_at) as date,
              event_type,
              COUNT(*) as count
            FROM conversion_events
            WHERE event_type = ANY($1::text[])
              AND created_at >= $2
              AND created_at <= $3
              AND (user_email IS NULL OR (user_email NOT LIKE $4 AND user_email != $5))
            GROUP BY DATE(created_at), event_type
            ORDER BY date ASC
          `,
          [
            FEATURE_EVENTS,
            formatTimestamp(range.start),
            formatTimestamp(range.end),
            TEST_EMAIL_PATTERN,
            TEST_EMAIL_EXACT,
          ],
        ),
      ],
    );

    const totalActiveUsers = Number(
      activeUsersResult.rows[0]?.total_users || 0,
    );

    const features = featureResult.rows.map((row) => {
      const uniqueUsers = Number(row.unique_users || 0);
      const totalEvents = Number(row.total_events || 0);
      const avgPerUser = uniqueUsers > 0 ? totalEvents / uniqueUsers : 0;
      const adoptionRate =
        totalActiveUsers > 0 ? (uniqueUsers / totalActiveUsers) * 100 : 0;

      return {
        feature: row.feature as string,
        uniqueUsers,
        totalEvents,
        avgPerUser: Number(avgPerUser.toFixed(2)),
        adoptionRate: Number(adoptionRate.toFixed(2)),
        trend: 'stable',
      };
    });

    const heatmapMap = new Map<string, Record<string, number>>();
    heatmapResult.rows.forEach((row) => {
      const date = String(row.date);
      const eventType = String(row.event_type);
      const count = Number(row.count || 0);
      if (!heatmapMap.has(date)) {
        heatmapMap.set(date, {});
      }
      heatmapMap.get(date)![eventType] = count;
    });

    const heatmap = Array.from(heatmapMap.entries()).map(
      ([date, features]) => ({
        date,
        features,
      }),
    );

    const response = NextResponse.json({
      features,
      heatmap,
      source: 'database',
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error('[analytics/feature-usage] Failed to load metrics', error);
    return NextResponse.json(
      {
        features: [],
        heatmap: [],
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
