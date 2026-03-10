import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL!);

async function main() {
  // Get one copy of each unique video post for this week (deduped by topic + platform)
  const videos = await sql`
    SELECT DISTINCT ON (platform, topic, scheduled_date::date)
      id,
      platform,
      topic,
      TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') as utc_time,
      content,
      video_url
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-16'::timestamptz
      AND post_type = 'video'
      AND platform = 'tiktok'
    ORDER BY platform, topic, scheduled_date::date, id
  `;

  for (const v of videos) {
    console.log(`\n[${v.utc_time}] ${v.topic}`);
    console.log(`Content: ${v.content}`);
    console.log(`Video: ${v.video_url ? '✅' : '❌ MISSING'}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
