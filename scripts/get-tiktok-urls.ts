import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL!);

async function main() {
  const posts = await sql`
    SELECT id, topic, video_url,
           TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') as utc_time
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-16'::timestamptz
      AND platform = 'tiktok'
      AND post_type = 'video'
      AND topic IN (
        'Ranking signs: most likely to ghost you',
        'Chiron in Virgo: being good enough without perfection',
        '555',
        'Why is Aries the first sign?',
        'Angel Number 777',
        'Mercury  Pisces',
        'Virgo: this week''s energy',
        'Jupiter',
        '333'
      )
    ORDER BY scheduled_date
  `;
  for (const p of posts) {
    console.log(`[${p.utc_time}] ${p.topic}`);
    console.log(`  URL: ${p.video_url}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
