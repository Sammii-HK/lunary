import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.POSTGRES_URL!);

async function main() {
  const stories = await sql`
    SELECT id, TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') as dt,
           platform, post_type, status, base_group_key,
           image_url, rejection_feedback, content_type
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-16'::timestamptz
      AND platform = 'instagram'
      AND post_type = 'story'
    ORDER BY scheduled_date
  `;
  console.log('Instagram stories:', JSON.stringify(stories, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
