import 'dotenv/config';
import { sql } from '@vercel/postgres';

async function checkDuplicates() {
  console.log('\n=== Checking for duplicate events ===\n');

  // app_opened authenticated
  const appOpenedAuth = await sql`
    SELECT COUNT(*) as count
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
  `;
  console.log(
    `app_opened (authenticated) duplicates: ${appOpenedAuth.rows[0].count}`,
  );

  // app_opened anonymous
  const appOpenedAnon = await sql`
    SELECT COUNT(*) as count
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
  `;
  console.log(
    `app_opened (anonymous) duplicates: ${appOpenedAnon.rows[0].count}`,
  );

  // product_opened authenticated
  const productOpenedAuth = await sql`
    SELECT COUNT(*) as count
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
  `;
  console.log(
    `product_opened (authenticated) duplicates: ${productOpenedAuth.rows[0].count}`,
  );

  // product_opened anonymous
  const productOpenedAnon = await sql`
    SELECT COUNT(*) as count
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
  `;
  console.log(
    `product_opened (anonymous) duplicates: ${productOpenedAnon.rows[0].count}`,
  );

  // daily_dashboard_viewed
  const dashboardAuth = await sql`
    SELECT COUNT(*) as count
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
  `;
  console.log(
    `daily_dashboard_viewed duplicates: ${dashboardAuth.rows[0].count}`,
  );

  const total =
    Number(appOpenedAuth.rows[0].count) +
    Number(appOpenedAnon.rows[0].count) +
    Number(productOpenedAuth.rows[0].count) +
    Number(productOpenedAnon.rows[0].count) +
    Number(dashboardAuth.rows[0].count);

  console.log(`\nTOTAL duplicates to remove: ${total}`);
  console.log(
    '\nThese are extra events that will be DELETED (keeping earliest per day)',
  );

  process.exit(0);
}

checkDuplicates().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
