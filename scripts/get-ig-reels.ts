import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL!);

async function main() {
  const reels = await sql`
    SELECT DISTINCT ON (scheduled_date::date)
      id,
      TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') as utc_time,
      topic,
      video_url,
      content,
      status
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-16'::timestamptz
      AND platform = 'instagram'
      AND post_type = 'video'
      AND video_url IS NOT NULL
    ORDER BY scheduled_date::date, id
  `;
  console.log(JSON.stringify(reels, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
