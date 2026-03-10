import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL!);

async function main() {
  const posts = await sql`
    SELECT id, platform, post_type, topic, video_url, content,
           TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') as utc_time
    FROM social_posts
    WHERE platform = 'tiktok'
      AND post_type = 'video'
      AND (
        (scheduled_date = '2026-03-11T17:00:00Z')
        OR (scheduled_date = '2026-03-12T14:00:00Z')
      )
    ORDER BY scheduled_date, id
  `;
  console.log(JSON.stringify(posts, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
