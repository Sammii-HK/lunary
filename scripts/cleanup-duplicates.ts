import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function cleanupDuplicates() {
  console.log('\n=== SAFE Duplicate Cleanup ===');
  console.log(
    'This removes duplicate events, keeping the EARLIEST per user per day\n',
  );

  // Cleanup product_opened (authenticated)
  const productResult = await sql`
    DELETE FROM conversion_events
    WHERE id IN (
      SELECT ce.id
      FROM conversion_events ce
      WHERE ce.event_type = 'product_opened'
        AND ce.user_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.event_type = 'product_opened'
            AND ce2.user_id = ce.user_id
            AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
            AND ce2.id < ce.id
        )
    )
    RETURNING id
  `;
  console.log(`✓ Deleted ${productResult.rowCount} product_opened duplicates`);

  // Cleanup product_opened (anonymous)
  const productAnonResult = await sql`
    DELETE FROM conversion_events
    WHERE id IN (
      SELECT ce.id
      FROM conversion_events ce
      WHERE ce.event_type = 'product_opened'
        AND ce.user_id IS NULL
        AND ce.anonymous_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.event_type = 'product_opened'
            AND ce2.user_id IS NULL
            AND ce2.anonymous_id = ce.anonymous_id
            AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
            AND ce2.id < ce.id
        )
    )
    RETURNING id
  `;
  console.log(
    `✓ Deleted ${productAnonResult.rowCount} product_opened (anon) duplicates`,
  );

  // Cleanup daily_dashboard_viewed (authenticated)
  const dashboardResult = await sql`
    DELETE FROM conversion_events
    WHERE id IN (
      SELECT ce.id
      FROM conversion_events ce
      WHERE ce.event_type = 'daily_dashboard_viewed'
        AND ce.user_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.event_type = 'daily_dashboard_viewed'
            AND ce2.user_id = ce.user_id
            AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
            AND ce2.id < ce.id
        )
    )
    RETURNING id
  `;
  console.log(
    `✓ Deleted ${dashboardResult.rowCount} daily_dashboard_viewed duplicates`,
  );

  // Cleanup daily_dashboard_viewed (anonymous)
  const dashboardAnonResult = await sql`
    DELETE FROM conversion_events
    WHERE id IN (
      SELECT ce.id
      FROM conversion_events ce
      WHERE ce.event_type = 'daily_dashboard_viewed'
        AND ce.user_id IS NULL
        AND ce.anonymous_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.event_type = 'daily_dashboard_viewed'
            AND ce2.user_id IS NULL
            AND ce2.anonymous_id = ce.anonymous_id
            AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
            AND ce2.id < ce.id
        )
    )
    RETURNING id
  `;
  console.log(
    `✓ Deleted ${dashboardAnonResult.rowCount} daily_dashboard_viewed (anon) duplicates`,
  );

  // Also cleanup app_opened just in case
  const appResult = await sql`
    DELETE FROM conversion_events
    WHERE id IN (
      SELECT ce.id
      FROM conversion_events ce
      WHERE ce.event_type = 'app_opened'
        AND ce.user_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.event_type = 'app_opened'
            AND ce2.user_id = ce.user_id
            AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
            AND ce2.id < ce.id
        )
    )
    RETURNING id
  `;
  console.log(`✓ Deleted ${appResult.rowCount} app_opened duplicates`);

  const appAnonResult = await sql`
    DELETE FROM conversion_events
    WHERE id IN (
      SELECT ce.id
      FROM conversion_events ce
      WHERE ce.event_type = 'app_opened'
        AND ce.user_id IS NULL
        AND ce.anonymous_id IS NOT NULL
        AND EXISTS (
          SELECT 1 FROM conversion_events ce2
          WHERE ce2.event_type = 'app_opened'
            AND ce2.user_id IS NULL
            AND ce2.anonymous_id = ce.anonymous_id
            AND (ce2.created_at AT TIME ZONE 'UTC')::date = (ce.created_at AT TIME ZONE 'UTC')::date
            AND ce2.id < ce.id
        )
    )
    RETURNING id
  `;
  console.log(
    `✓ Deleted ${appAnonResult.rowCount} app_opened (anon) duplicates`,
  );

  const total =
    (productResult.rowCount || 0) +
    (productAnonResult.rowCount || 0) +
    (dashboardResult.rowCount || 0) +
    (dashboardAnonResult.rowCount || 0) +
    (appResult.rowCount || 0) +
    (appAnonResult.rowCount || 0);

  console.log(`\n✅ TOTAL deleted: ${total} duplicate events`);
  console.log('The earliest event per user per day was kept for each type.');

  process.exit(0);
}

cleanupDuplicates().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
