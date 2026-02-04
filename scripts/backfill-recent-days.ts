import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function backfillRecent() {
  console.log('\n=== Backfilling app_opened for Yesterday + Today ===\n');

  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  console.log(`Date range: ${yesterday} to ${today}`);

  // Show what will be created
  const preview = await sql`
    SELECT
      (created_at AT TIME ZONE 'UTC')::date as date,
      COUNT(DISTINCT COALESCE(user_id, 'anon:' || anonymous_id)) as unique_users
    FROM conversion_events
    WHERE event_type = 'page_viewed'
      AND created_at >= ${yesterday}::date
      AND created_at < (${today}::date + INTERVAL '1 day')
      AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))
      AND NOT EXISTS (
        SELECT 1 FROM conversion_events ce2
        WHERE ce2.event_type = 'app_opened'
          AND (ce2.created_at AT TIME ZONE 'UTC')::date = (conversion_events.created_at AT TIME ZONE 'UTC')::date
          AND COALESCE(ce2.user_id, 'anon:' || ce2.anonymous_id) = COALESCE(conversion_events.user_id, 'anon:' || conversion_events.anonymous_id)
      )
    GROUP BY date
    ORDER BY date;
  `;

  console.log('\nUnique users needing app_opened events:');
  preview.rows.forEach((row) => {
    console.log(`  ${row.date}: ${row.unique_users} users`);
  });

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
        'canonical_event_type', 'app_opened'
      ) as metadata
    FROM conversion_events
    WHERE event_type = 'page_viewed'
      AND created_at >= ${yesterday}::date
      AND created_at < (${today}::date + INTERVAL '1 day')
      AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))
    ORDER BY
      (created_at AT TIME ZONE 'UTC')::date,
      COALESCE(user_id, 'anon:' || anonymous_id),
      created_at ASC
    ON CONFLICT DO NOTHING
    RETURNING id, (created_at AT TIME ZONE 'UTC')::date as date
  `;

  console.log(`\n✅ Created ${result.rowCount} app_opened events`);

  // Verify
  const verification = await sql`
    SELECT
      (created_at AT TIME ZONE 'UTC')::date as date,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE metadata->>'backfilled_from' = 'page_viewed') as backfilled,
      COUNT(*) FILTER (WHERE metadata->>'backfilled_from' IS NULL) as organic
    FROM conversion_events
    WHERE event_type = 'app_opened'
      AND created_at >= ${yesterday}::date
      AND created_at < (${today}::date + INTERVAL '1 day')
    GROUP BY date
    ORDER BY date;
  `;

  console.log('\n📊 app_opened events after backfill:');
  verification.rows.forEach((row) => {
    console.log(
      `  ${row.date}: ${row.total} total (${row.organic} organic, ${row.backfilled} backfilled)`,
    );
  });

  process.exit(0);
}

backfillRecent().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
