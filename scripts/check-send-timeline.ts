import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL!);

async function main() {
  // Check sent posts creation vs scheduled date
  const r = await sql`
    SELECT
      TO_CHAR(MIN(created_at), 'YYYY-MM-DD HH24:MI') as first_created,
      TO_CHAR(MAX(created_at), 'YYYY-MM-DD HH24:MI') as last_created,
      COUNT(*) as total,
      SUM(CASE WHEN status = 'sent' THEN 1 ELSE 0 END) as sent_count
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-16'::timestamptz
  `;
  console.log('Timeline:', JSON.stringify(r, null, 2));

  // Were posts created with sent status or updated?
  const sample = await sql`
    SELECT id, status,
           TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI') as created,
           TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') as scheduled,
           platform, post_type
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-16'::timestamptz
      AND status = 'sent'
    ORDER BY id
    LIMIT 5
  `;
  console.log('\nSample sent posts:', JSON.stringify(sample, null, 2));

  // Check if the send endpoint exists and what it does
  const pendingNow = await sql`
    SELECT COUNT(*) as cnt FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND status IN ('pending', 'approved')
  `;
  console.log(
    '\nCurrently pending/approved for this week:',
    JSON.stringify(pendingNow, null, 2),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
