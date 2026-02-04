import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function findUndercountedDays() {
  const result = await sql`
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
    SELECT
      date,
      pv_users as expected_events,
      ao_events as actual_events,
      ROUND(100.0 * ao_events / NULLIF(pv_users, 0), 1) as coverage_pct,
      pv_users - ao_events as missing_events
    FROM daily_counts
    WHERE pv_users > 100
      AND ao_events < (pv_users * 0.5)
    ORDER BY date DESC;
  `;

  console.log('\nSeverely undercounted days (< 50% coverage):\n');
  result.rows.forEach((row) => {
    const date = new Date(row.date).toISOString().split('T')[0];
    console.log(
      `  ${date}: ${row.actual_events}/${row.expected_events} events (${row.coverage_pct}% coverage, missing ${row.missing_events})`,
    );
  });
  console.log(`\nTotal: ${result.rows.length} days need backfill`);

  process.exit(0);
}

findUndercountedDays().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
