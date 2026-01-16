import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const utcDateExpr = `(created_at AT TIME ZONE 'UTC')::date`;

export async function GET(
  _request: NextRequest,
  context: { params: { userId: string } },
) {
  try {
    const userId = context.params.userId;
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }

    const [
      bounds,
      lifetimeActive,
      last7,
      last30,
      last90,
      featureUsage,
      grimoireTop,
      recent,
      streak,
    ] = await Promise.all([
      sql.query(
        `
          SELECT MIN(created_at) AS first_seen, MAX(created_at) AS last_seen
          FROM conversion_events
          WHERE user_id = $1
        `,
        [userId],
      ),
      sql.query(
        `
          SELECT COUNT(DISTINCT ${utcDateExpr}) AS active_days
          FROM conversion_events
          WHERE user_id = $1
            AND event_type = 'app_opened'
        `,
        [userId],
      ),
      sql.query(
        `
          SELECT COUNT(DISTINCT ${utcDateExpr}) AS active_days
          FROM conversion_events
          WHERE user_id = $1
            AND event_type = 'app_opened'
            AND created_at >= NOW() - INTERVAL '7 days'
        `,
        [userId],
      ),
      sql.query(
        `
          SELECT COUNT(DISTINCT ${utcDateExpr}) AS active_days
          FROM conversion_events
          WHERE user_id = $1
            AND event_type = 'app_opened'
            AND created_at >= NOW() - INTERVAL '30 days'
        `,
        [userId],
      ),
      sql.query(
        `
          SELECT COUNT(DISTINCT ${utcDateExpr}) AS active_days
          FROM conversion_events
          WHERE user_id = $1
            AND event_type = 'app_opened'
            AND created_at >= NOW() - INTERVAL '90 days'
        `,
        [userId],
      ),
      sql.query(
        `
          SELECT
            event_type,
            COUNT(*) AS total_events,
            COUNT(DISTINCT ${utcDateExpr}) AS feature_days
          FROM conversion_events
          WHERE user_id = $1
          GROUP BY event_type
          ORDER BY total_events DESC
        `,
        [userId],
      ),
      sql.query(
        `
          SELECT
            COALESCE(entity_id, page_path, '') AS entity_key,
            COUNT(*) AS views,
            MAX(created_at) AS last_viewed
          FROM conversion_events
          WHERE user_id = $1
            AND event_type = 'grimoire_viewed'
          GROUP BY COALESCE(entity_id, page_path, '')
          HAVING COALESCE(entity_id, page_path, '') <> ''
          ORDER BY views DESC, last_viewed DESC
          LIMIT 10
        `,
        [userId],
      ),
      sql.query(
        `
          SELECT created_at, event_type, page_path, entity_type, entity_id
          FROM conversion_events
          WHERE user_id = $1
          ORDER BY created_at DESC
          LIMIT 50
        `,
        [userId],
      ),
      sql.query(
        `
          WITH days AS (
            SELECT DISTINCT ${utcDateExpr} AS day
            FROM conversion_events
            WHERE user_id = $1
              AND event_type = 'app_opened'
              AND created_at >= NOW() - INTERVAL '90 days'
          ),
          sequenced AS (
            SELECT
              day,
              day - (ROW_NUMBER() OVER (ORDER BY day))::int AS grp
            FROM days
          ),
          streaks AS (
            SELECT COUNT(*) AS streak_len
            FROM sequenced
            GROUP BY grp
          )
          SELECT COALESCE(MAX(streak_len), 0) AS longest_streak
          FROM streaks
        `,
        [userId],
      ),
    ]);

    const firstSeen = bounds.rows[0]?.first_seen
      ? new Date(bounds.rows[0].first_seen as string)
      : null;
    const lastSeen = bounds.rows[0]?.last_seen
      ? new Date(bounds.rows[0].last_seen as string)
      : null;

    const engagementSpanDays =
      firstSeen && lastSeen
        ? Math.max(
            0,
            Math.round((lastSeen.getTime() - firstSeen.getTime()) / 86400000),
          )
        : 0;

    return NextResponse.json({
      user_id: userId,
      first_seen: firstSeen ? firstSeen.toISOString() : null,
      last_seen: lastSeen ? lastSeen.toISOString() : null,
      engagement_span_days: engagementSpanDays,
      lifetime_active_days: Number(lifetimeActive.rows[0]?.active_days || 0),
      active_days_last_7: Number(last7.rows[0]?.active_days || 0),
      active_days_last_30: Number(last30.rows[0]?.active_days || 0),
      active_days_last_90: Number(last90.rows[0]?.active_days || 0),
      longest_streak_last_90: Number(streak.rows[0]?.longest_streak || 0),
      feature_usage: featureUsage.rows.map((row) => ({
        event_type: String(row.event_type),
        total_events: Number(row.total_events || 0),
        feature_days: Number(row.feature_days || 0),
      })),
      grimoire_top_pages: grimoireTop.rows.map((row) => ({
        entity_id: String(row.entity_key),
        views: Number(row.views || 0),
        last_viewed: row.last_viewed
          ? new Date(row.last_viewed as string).toISOString()
          : null,
      })),
      recent_events: recent.rows.map((row) => ({
        created_at: new Date(row.created_at as string).toISOString(),
        event_type: String(row.event_type),
        page_path: row.page_path ? String(row.page_path) : null,
        entity_type: row.entity_type ? String(row.entity_type) : null,
        entity_id: row.entity_id ? String(row.entity_id) : null,
      })),
    });
  } catch (error) {
    console.error('[analytics/user-engagement] Failed', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
