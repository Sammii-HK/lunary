import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL!);

async function main() {
  const posts = await sql`
    SELECT
      id,
      TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'HH24:MI') as utc_time,
      post_type,
      status,
      image_url,
      video_url,
      content,
      topic,
      story_category,
      content_type,
      rejection_feedback
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-10'::timestamptz
      AND platform = 'instagram'
    ORDER BY scheduled_date
  `;
  console.log(JSON.stringify(posts, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
