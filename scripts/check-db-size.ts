import { config } from 'dotenv';
import { resolve } from 'path';
import { sql } from '@vercel/postgres';

config({ path: resolve(process.cwd(), '.env.local') });

async function check() {
  const counts = await sql`
    SELECT
      (SELECT COUNT(*) FROM conversion_events) as events,
      (SELECT COUNT(*) FROM conversion_events WHERE created_at >= NOW() - INTERVAL '30 days') as events_30d,
      (SELECT COUNT(DISTINCT event_type) FROM conversion_events) as event_types
  `;
  console.log('Conversion events total:', counts.rows[0].events);
  console.log('Last 30 days:', counts.rows[0].events_30d);
  console.log('Distinct event types:', counts.rows[0].event_types);
}

check().then(() => process.exit(0));
