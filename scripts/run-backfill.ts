import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function runBackfill() {
  console.log('\n=== Running DAU Backfill ===');
  console.log('Creating app_opened events from page_viewed events\n');

  // Run the backfill with deterministic event_id for idempotency
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
      -- Deterministic event_id for idempotency: backfill-dau-{date}-{identity_hash}
      'backfill-dau-' || ((created_at AT TIME ZONE 'UTC')::date)::text || '-' ||
        md5(COALESCE(user_id, 'anon:' || anonymous_id)) as event_id,
      user_id,
      anonymous_id,
      user_email,
      page_path,
      -- Use start of day in UTC
      DATE_TRUNC('day', created_at AT TIME ZONE 'UTC') AT TIME ZONE 'UTC' + INTERVAL '1 second' as created_at,
      jsonb_build_object(
        'backfilled_from', 'page_viewed',
        'backfill_date', NOW()::text,
        'canonical_event_type', 'app_opened'
      ) as metadata
    FROM conversion_events
    WHERE event_type = 'page_viewed'
      AND created_at >= '2026-01-01'
      -- Exclude test users
      AND (user_email IS NULL OR (user_email NOT LIKE '%@test.lunary.app' AND user_email != 'test@test.lunary.app'))
    ORDER BY
      (created_at AT TIME ZONE 'UTC')::date,
      COALESCE(user_id, 'anon:' || anonymous_id),
      created_at ASC  -- Take earliest page_viewed per day
    ON CONFLICT DO NOTHING
    RETURNING id
  `;

  console.log(
    `✅ Created ${result.rowCount} app_opened events from page_viewed data`,
  );

  // Verify the results
  const verification = await sql`
    SELECT
      (created_at AT TIME ZONE 'UTC')::date as date,
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE metadata->>'backfilled_from' = 'page_viewed') as backfilled,
      COUNT(*) FILTER (WHERE metadata->>'backfilled_from' IS NULL) as organic
    FROM conversion_events
    WHERE event_type = 'app_opened'
      AND created_at >= '2026-01-01'
    GROUP BY (created_at AT TIME ZONE 'UTC')::date
    ORDER BY date DESC
    LIMIT 10
  `;

  console.log('\n📊 Recent app_opened events (after backfill):');
  verification.rows.forEach((row) => {
    const date = new Date(row.date).toISOString().slice(0, 10);
    console.log(
      `  ${date}: ${row.total} total (${row.organic} organic, ${row.backfilled} backfilled)`,
    );
  });

  process.exit(0);
}

runBackfill().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
