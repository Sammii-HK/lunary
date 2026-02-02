import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function dryRunBackfill() {
  console.log('\n=== DAU Backfill DRY RUN ===');
  console.log('This shows what WOULD be created from page_viewed events\n');

  // Check current state
  const currentState = await sql`
    SELECT
      event_type,
      COUNT(*) as total_events,
      COUNT(DISTINCT (created_at AT TIME ZONE 'UTC')::date) as days_with_data,
      MIN(created_at) as earliest,
      MAX(created_at) as latest
    FROM conversion_events
    WHERE event_type IN ('page_viewed', 'app_opened')
    GROUP BY event_type
    ORDER BY event_type
  `;

  console.log('Current State:');
  currentState.rows.forEach((row) => {
    console.log(
      `  ${row.event_type}: ${row.total_events} events across ${row.days_with_data} days`,
    );
    console.log(
      `    Range: ${new Date(row.earliest).toISOString().slice(0, 10)} to ${new Date(row.latest).toISOString().slice(0, 10)}`,
    );
  });

  // Find days with page_viewed but no/few app_opened
  const gapDays = await sql`
    WITH daily_counts AS (
      SELECT
        (created_at AT TIME ZONE 'UTC')::date as date,
        COUNT(*) FILTER (WHERE event_type = 'page_viewed') as page_views,
        COUNT(*) FILTER (WHERE event_type = 'app_opened') as app_opens,
        COUNT(DISTINCT COALESCE(user_id, 'anon:' || anonymous_id)) FILTER (WHERE event_type = 'page_viewed') as pv_users,
        COUNT(DISTINCT COALESCE(user_id, 'anon:' || anonymous_id)) FILTER (WHERE event_type = 'app_opened') as ao_users
      FROM conversion_events
      WHERE event_type IN ('page_viewed', 'app_opened')
        AND created_at >= NOW() - INTERVAL '90 days'
      GROUP BY (created_at AT TIME ZONE 'UTC')::date
    )
    SELECT *
    FROM daily_counts
    WHERE page_views > 5 AND app_opens < page_views / 2
    ORDER BY date DESC
    LIMIT 15
  `;

  if (gapDays.rows.length > 0) {
    console.log('\n⚠️  Days with potential gaps (page_views >> app_opens):');
    gapDays.rows.forEach((row) => {
      console.log(
        `  ${row.date}: ${row.page_views} page_views (${row.pv_users} users) vs ${row.app_opens} app_opens (${row.ao_users} users)`,
      );
    });
  } else {
    console.log(
      '\n✅ No significant gaps found - app_opened tracking looks healthy!',
    );
  }

  // Count how many events would be created
  const backfillCount = await sql`
    WITH candidates AS (
      SELECT DISTINCT ON (
        (created_at AT TIME ZONE 'UTC')::date,
        COALESCE(user_id, 'anon:' || anonymous_id)
      )
        (created_at AT TIME ZONE 'UTC')::date as date,
        COALESCE(user_id, 'anon:' || anonymous_id) as identity
      FROM conversion_events
      WHERE event_type = 'page_viewed'
        AND created_at >= '2026-01-01'
        AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))
        -- Exclude if app_opened already exists
        AND NOT EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.event_type = 'app_opened'
            AND (ce2.created_at AT TIME ZONE 'UTC')::date = (conversion_events.created_at AT TIME ZONE 'UTC')::date
            AND COALESCE(ce2.user_id, 'anon:' || ce2.anonymous_id) = COALESCE(conversion_events.user_id, 'anon:' || conversion_events.anonymous_id)
        )
      ORDER BY
        (created_at AT TIME ZONE 'UTC')::date,
        COALESCE(user_id, 'anon:' || anonymous_id),
        created_at ASC
    )
    SELECT
      date,
      COUNT(*) as events_to_create
    FROM candidates
    GROUP BY date
    ORDER BY date DESC
    LIMIT 30
  `;

  if (backfillCount.rows.length > 0) {
    console.log('\n📊 Events that WOULD be created per day:');
    let total = 0;
    backfillCount.rows.forEach((row) => {
      console.log(`  ${row.date}: ${row.events_to_create} app_opened events`);
      total += Number(row.events_to_create);
    });
    console.log(`\n  TOTAL: ${total} events would be created`);
    console.log(
      '\n💡 To run the actual backfill, use: npx tsx scripts/run-backfill.ts',
    );
  } else {
    console.log(
      '\n✅ No backfill needed - all page_viewed events already have app_opened!',
    );
  }

  process.exit(0);
}

dryRunBackfill().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
