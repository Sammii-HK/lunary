import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL!);
async function main() {
  const posts = await sql`
    SELECT id,
           TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'Dy DD HH24:MI') as day_time,
           post_type, status,
           LEFT(image_url, 120) as image_url_preview
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-16'::timestamptz
      AND platform = 'instagram'
      AND post_type NOT IN ('video', 'story')
      AND image_url IS NOT NULL
    ORDER BY scheduled_date
  `;
  for (const p of posts) {
    console.log(`[${p.day_time}] ID:${p.id} ${p.post_type}`);
    console.log(`  ${p.image_url_preview}`);
  }
}
main().catch(console.error);
