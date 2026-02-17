import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

/**
 * One-time backfill: populate daily_unique_users for the last 30 days
 * from existing conversion_events data.
 *
 * Run once after deploying the migration, then the daily compute-metrics
 * cron will keep it up to date.
 *
 * Usage: GET /api/cron/compute-metrics/backfill-snapshots?days=30
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = Math.min(Number(searchParams.get('days') || 30), 90);

    // Check for identity links
    const identityLinksCheck = await sql.query(
      `SELECT to_regclass('analytics_identity_links') IS NOT NULL AS exists`,
    );
    const hasIdentityLinks = Boolean(identityLinksCheck.rows[0]?.exists);

    const idJoin = hasIdentityLinks
      ? 'LEFT JOIN analytics_identity_links ail ON ce.anonymous_id IS NOT NULL AND ail.anonymous_id = ce.anonymous_id'
      : '';

    const anyId = hasIdentityLinks
      ? `COALESCE(CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END, ail.user_id, ce.anonymous_id)`
      : `COALESCE(CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END, ce.anonymous_id)`;

    const signedInId = hasIdentityLinks
      ? `COALESCE(CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id END, ail.user_id)`
      : `CASE WHEN ce.user_id IS NOT NULL AND ce.user_id <> '' AND ce.user_id NOT LIKE 'anon:%' THEN ce.user_id ELSE NULL END`;

    const whereBase = `(ce.user_id IS NOT NULL OR ce.anonymous_id IS NOT NULL)
      AND (ce.user_email IS NULL OR (ce.user_email NOT LIKE $3 AND ce.user_email != $4))`;

    let backfilledDays = 0;

    for (let i = 1; i <= days; i++) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      d.setUTCHours(0, 0, 0, 0);
      const dateStr = d.toISOString().split('T')[0];
      const dayStart = d.toISOString();
      const dayEnd = new Date(d);
      dayEnd.setUTCHours(23, 59, 59, 999);

      const params = [
        dayStart,
        dayEnd.toISOString(),
        TEST_EMAIL_PATTERN,
        TEST_EMAIL_EXACT,
        dateStr,
      ];

      // Run all 5 segment inserts in parallel for this day
      await Promise.all([
        sql.query(
          `INSERT INTO daily_unique_users (metric_date, segment, user_ids, user_count)
           SELECT $5::date, 'all',
             COALESCE(array_agg(DISTINCT resolved_id) FILTER (WHERE resolved_id IS NOT NULL), '{}'),
             COUNT(DISTINCT resolved_id)
           FROM (
             SELECT ${anyId} as resolved_id
             FROM conversion_events ce ${idJoin}
             WHERE ce.created_at >= $1 AND ce.created_at <= $2 AND ${whereBase}
           ) sub
           ON CONFLICT (metric_date, segment) DO UPDATE SET
             user_ids = EXCLUDED.user_ids, user_count = EXCLUDED.user_count`,
          params,
        ),
        sql.query(
          `INSERT INTO daily_unique_users (metric_date, segment, user_ids, user_count)
           SELECT $5::date, 'product',
             COALESCE(array_agg(DISTINCT resolved_id) FILTER (WHERE resolved_id IS NOT NULL), '{}'),
             COUNT(DISTINCT resolved_id)
           FROM (
             SELECT ${signedInId} as resolved_id
             FROM conversion_events ce ${idJoin}
             WHERE ce.created_at >= $1 AND ce.created_at <= $2
               AND ce.event_type NOT IN ('app_opened', 'page_viewed')
               AND ${whereBase}
           ) sub
           ON CONFLICT (metric_date, segment) DO UPDATE SET
             user_ids = EXCLUDED.user_ids, user_count = EXCLUDED.user_count`,
          params,
        ),
        sql.query(
          `INSERT INTO daily_unique_users (metric_date, segment, user_ids, user_count)
           SELECT $5::date, 'app_opened',
             COALESCE(array_agg(DISTINCT resolved_id) FILTER (WHERE resolved_id IS NOT NULL), '{}'),
             COUNT(DISTINCT resolved_id)
           FROM (
             SELECT ${anyId} as resolved_id
             FROM conversion_events ce ${idJoin}
             WHERE ce.created_at >= $1 AND ce.created_at <= $2
               AND ce.event_type = 'app_opened'
               AND ${whereBase}
           ) sub
           ON CONFLICT (metric_date, segment) DO UPDATE SET
             user_ids = EXCLUDED.user_ids, user_count = EXCLUDED.user_count`,
          params,
        ),
        sql.query(
          `INSERT INTO daily_unique_users (metric_date, segment, user_ids, user_count)
           SELECT $5::date, 'reach',
             COALESCE(array_agg(DISTINCT resolved_id) FILTER (WHERE resolved_id IS NOT NULL), '{}'),
             COUNT(DISTINCT resolved_id)
           FROM (
             SELECT ${anyId} as resolved_id
             FROM conversion_events ce ${idJoin}
             WHERE ce.created_at >= $1 AND ce.created_at <= $2
               AND ce.event_type = 'page_viewed'
               AND ${whereBase}
           ) sub
           ON CONFLICT (metric_date, segment) DO UPDATE SET
             user_ids = EXCLUDED.user_ids, user_count = EXCLUDED.user_count`,
          params,
        ),
        sql.query(
          `INSERT INTO daily_unique_users (metric_date, segment, user_ids, user_count)
           SELECT $5::date, 'grimoire',
             COALESCE(array_agg(DISTINCT resolved_id) FILTER (WHERE resolved_id IS NOT NULL), '{}'),
             COUNT(DISTINCT resolved_id)
           FROM (
             SELECT ${anyId} as resolved_id
             FROM conversion_events ce ${idJoin}
             WHERE ce.created_at >= $1 AND ce.created_at <= $2
               AND ce.event_type = 'page_viewed'
               AND ce.page_path LIKE '/grimoire%'
               AND ${whereBase}
           ) sub
           ON CONFLICT (metric_date, segment) DO UPDATE SET
             user_ids = EXCLUDED.user_ids, user_count = EXCLUDED.user_count`,
          params,
        ),
      ]);

      backfilledDays++;
    }

    const duration = Date.now() - startTime;
    console.log(
      `Backfilled ${backfilledDays} days of daily_unique_users in ${duration}ms`,
    );

    return NextResponse.json({
      success: true,
      backfilledDays,
      duration,
    });
  } catch (error) {
    console.error('[backfill-snapshots] Failed', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: Date.now() - startTime,
      },
      { status: 500 },
    );
  }
}
