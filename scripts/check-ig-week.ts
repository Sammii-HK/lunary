import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL!);
async function main() {
  const posts = await sql`
    SELECT
      TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'Dy DD Mon HH24:MI') as day_time,
      post_type, status, 
      CASE WHEN image_url IS NOT NULL THEN '✅' ELSE '❌' END as has_image,
      CASE WHEN video_url IS NOT NULL THEN '✅' ELSE '❌' END as has_video,
      LEFT(content, 60) as content_preview
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-16'::timestamptz
      AND platform = 'instagram'
    ORDER BY scheduled_date
  `;
  for (const p of posts) {
    console.log(
      `${p.day_time} | ${p.post_type.padEnd(20)} | ${p.status.padEnd(8)} | img:${p.has_image} vid:${p.has_video} | ${p.content_preview}`,
    );
  }
}
main().catch(console.error);
