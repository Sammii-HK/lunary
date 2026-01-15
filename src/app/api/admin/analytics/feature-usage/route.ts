import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const FEATURE_EVENTS = [
  'birth_chart_viewed',
  'tarot_viewed',
  'horoscope_viewed',
  'crystal_recommendations_viewed',
  'personalized_tarot_viewed',
  'personalized_horoscope_viewed',
  'pricing_page_viewed',
  'upgrade_clicked',
];

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

const toTextArrayLiteral = (values: string[]): string | null => {
  if (values.length === 0) return null;
  return `{${values.map((v) => `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`).join(',')}}`;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const daysBack = parseInt(searchParams.get('days') || '7', 10);

    const eventsArray = toTextArrayLiteral(FEATURE_EVENTS)!;

    const [featureResult, activeUsersResult, heatmapResult] = await Promise.all(
      [
        sql`
          SELECT
            event_type as feature,
            COUNT(*) as total_events,
            COUNT(DISTINCT user_id) as unique_users
          FROM conversion_events
          WHERE event_type = ANY(SELECT unnest(${eventsArray}::text[]))
            AND created_at >= NOW() - INTERVAL '${daysBack} days'
            AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
          GROUP BY event_type
          ORDER BY total_events DESC
        `,
        sql`
          SELECT COUNT(DISTINCT user_id) as total_users
          FROM conversion_events
          WHERE event_type = ANY(SELECT unnest(${eventsArray}::text[]))
            AND created_at >= NOW() - INTERVAL '${daysBack} days'
            AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
        `,
        sql`
          SELECT
            DATE(created_at) as date,
            event_type,
            COUNT(*) as count
          FROM conversion_events
          WHERE event_type = ANY(SELECT unnest(${eventsArray}::text[]))
            AND created_at >= NOW() - INTERVAL '${daysBack} days'
            AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
          GROUP BY DATE(created_at), event_type
          ORDER BY date ASC
        `,
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

    return NextResponse.json({
      features,
      heatmap,
      source: 'database',
    });
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
