import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { formatDate, resolveDateRange } from '@/lib/analytics/date-range';

const FEATURE_PREFIX = 'feature:';

const normalizeFeatureName = (activityType: string) =>
  activityType.startsWith(FEATURE_PREFIX)
    ? activityType.slice(FEATURE_PREFIX.length)
    : activityType;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);
    const startDate = formatDate(range.start);
    const endDate = formatDate(range.end);

    const featureRows = await sql`
      SELECT
        activity_type,
        COUNT(DISTINCT user_id) AS unique_users,
        COALESCE(SUM(activity_count), 0) AS total_events
      FROM analytics_user_activity
      WHERE activity_date BETWEEN ${startDate} AND ${endDate}
        AND activity_type <> 'session'
      GROUP BY activity_type
      ORDER BY total_events DESC
    `;

    const recentWindowStart = formatDate(
      new Date(
        Math.max(
          range.start.getTime(),
          range.end.getTime() - 6 * 24 * 60 * 60 * 1000,
        ),
      ),
    );
    const previousWindowEnd = formatDate(
      new Date(new Date(recentWindowStart).getTime() - 24 * 60 * 60 * 1000),
    );
    const previousWindowStart = formatDate(
      new Date(new Date(recentWindowStart).getTime() - 7 * 24 * 60 * 60 * 1000),
    );

    const recentCountsResult = await sql`
      SELECT activity_type, COALESCE(SUM(activity_count), 0) AS total
      FROM analytics_user_activity
      WHERE activity_date BETWEEN ${recentWindowStart} AND ${endDate}
        AND activity_type <> 'session'
      GROUP BY activity_type
    `;

    const previousCountsResult = await sql`
      SELECT activity_type, COALESCE(SUM(activity_count), 0) AS total
      FROM analytics_user_activity
      WHERE activity_date BETWEEN ${previousWindowStart} AND ${previousWindowEnd}
        AND activity_type <> 'session'
      GROUP BY activity_type
    `;

    const recentCounts = new Map(
      recentCountsResult.rows.map((row) => [
        row.activity_type,
        Number(row.total || 0),
      ]),
    );
    const previousCounts = new Map(
      previousCountsResult.rows.map((row) => [
        row.activity_type,
        Number(row.total || 0),
      ]),
    );

    const features = featureRows.rows.map((row) => {
      const uniqueUsers = Number(row.unique_users || 0);
      const totalEvents = Number(row.total_events || 0);
      const recent = recentCounts.get(row.activity_type) ?? 0;
      const previous = previousCounts.get(row.activity_type) ?? 0;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (previous === 0 && recent > 0) {
        trend = 'up';
      } else if (recent === 0 && previous > 0) {
        trend = 'down';
      } else if (previous > 0) {
        const change = (recent - previous) / previous;
        if (change > 0.1) {
          trend = 'up';
        } else if (change < -0.1) {
          trend = 'down';
        }
      }

      return {
        feature: normalizeFeatureName(row.activity_type),
        unique_users: uniqueUsers,
        total_events: totalEvents,
        avg_per_user:
          uniqueUsers > 0 ? Number((totalEvents / uniqueUsers).toFixed(2)) : 0,
        trend,
      };
    });

    const heatmapRows = await sql`
      SELECT
        activity_date,
        activity_type,
        COALESCE(SUM(activity_count), 0) AS total
      FROM analytics_user_activity
      WHERE activity_date BETWEEN ${startDate} AND ${endDate}
        AND activity_type <> 'session'
      GROUP BY activity_date, activity_type
      ORDER BY activity_date ASC
    `;

    const heatmapMap = new Map<
      string,
      {
        [feature: string]: number;
      }
    >();

    for (const row of heatmapRows.rows) {
      const dateKey = formatDate(new Date(row.activity_date));
      const feature = normalizeFeatureName(row.activity_type);
      const current = heatmapMap.get(dateKey) ?? {};
      current[feature] = Number(row.total || 0);
      heatmapMap.set(dateKey, current);
    }

    const heatmap = Array.from(heatmapMap.entries()).map(([date, data]) => ({
      date,
      features: data,
    }));

    return NextResponse.json({
      features: features.length > 0 ? features : [],
      heatmap,
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
