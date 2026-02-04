import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function backfillUndercounted() {
  console.log('\n=== Backfilling Severely Undercounted Days ===\n');

  // Find undercounted days (< 50% coverage)
  const undercounted = await sql`
    WITH daily_counts AS (
      SELECT
        (created_at AT TIME ZONE 'UTC')::date as date,
        COUNT(DISTINCT COALESCE(user_id, 'anon:' || anonymous_id)) FILTER (WHERE event_type = 'page_viewed') as pv_users,
        COUNT(*) FILTER (WHERE event_type = 'app_opened') as ao_events
      FROM conversion_events
      WHERE event_type IN ('page_viewed', 'app_opened')
        AND created_at >= '2026-01-01'
      GROUP BY (created_at AT TIME ZONE 'UTC')::date
    )
    SELECT date
    FROM daily_counts
    WHERE pv_users > 100
      AND ao_events < (pv_users * 0.5)
    ORDER BY date;
  `;

  const dates = undercounted.rows.map((r) => r.date);
  console.log(`Found ${dates.length} days needing backfill:\n`);

  if (dates.length === 0) {
    console.log('No severely undercounted days found!');
    process.exit(0);
  }

  // Get earliest and latest date
  const minDate = dates[0];
  const maxDate = dates[dates.length - 1];

  console.log(`Date range: ${minDate} to ${maxDate}\n`);

  // Run backfill for these dates
  const result = await sql`
    INSERT INTO conversion_events (
      event_type,
      event_id,
      user_id,
      anonymous_id,
      user_email,
      page_path,
      created_at,
      metadata
    )
    SELECT DISTINCT ON (
      (created_at AT TIME ZONE 'UTC')::date,
      COALESCE(user_id, 'anon:' || anonymous_id)
    )
      'app_opened' as event_type,
      ('00000000-0000-5000-8000-' ||
        substring(md5(COALESCE(user_id, 'anon:' || anonymous_id) || ((created_at AT TIME ZONE 'UTC')::date)::text), 1, 12))::uuid as event_id,
      user_id,
      anonymous_id,
      user_email,
      page_path,
      DATE_TRUNC('day', created_at AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' + INTERVAL '1 second' as created_at,
      jsonb_build_object(
        'backfilled_from', 'page_viewed',
        'backfill_date', NOW()::text,
        'backfill_reason', 'severe_undercount',
        'canonical_event_type', 'app_opened'
      ) as metadata
    FROM conversion_events
    WHERE event_type = 'page_viewed'
      AND created_at >= ${minDate}::date
      AND created_at < (${maxDate}::date + INTERVAL '1 day')
      AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))
    ORDER BY
      (created_at AT TIME ZONE 'UTC')::date,
      COALESCE(user_id, 'anon:' || anonymous_id),
      created_at ASC
    ON CONFLICT DO NOTHING
    RETURNING (created_at AT TIME ZONE 'UTC')::date as date
  `;

  console.log(`✅ Created ${result.rowCount} app_opened events\n`);

  // Verify results
  const verification = await sql`
    WITH daily_counts AS (
      SELECT
        (created_at AT TIME ZONE 'UTC')::date as date,
        COUNT(DISTINCT COALESCE(user_id, 'anon:' || anonymous_id)) FILTER (WHERE event_type = 'page_viewed') as pv_users,
        COUNT(*) FILTER (WHERE event_type = 'app_opened') as ao_events,
        COUNT(*) FILTER (WHERE event_type = 'app_opened' AND metadata->>'backfilled_from' = 'page_viewed') as backfilled
      FROM conversion_events
      WHERE event_type IN ('page_viewed', 'app_opened')
        AND created_at >= ${minDate}::date
        AND created_at < (${maxDate}::date + INTERVAL '1 day')
      GROUP BY (created_at AT TIME ZONE 'UTC')::date
    )
    SELECT
      date,
      pv_users,
      ao_events as total_events,
      ao_events - backfilled as organic,
      backfilled,
      ROUND(100.0 * ao_events / NULLIF(pv_users, 0), 1) as coverage_pct
    FROM daily_counts
    WHERE pv_users > 100
    ORDER BY date DESC;
  `;

  console.log('📊 Coverage after backfill:\n');
  verification.rows.forEach((row) => {
    const date = new Date(row.date).toISOString().split('T')[0];
    console.log(
      `  ${date}: ${row.total_events}/${row.pv_users} (${row.coverage_pct}% coverage) - ${row.organic} organic + ${row.backfilled} backfilled`,
    );
  });

  process.exit(0);
}

backfillUndercounted().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
