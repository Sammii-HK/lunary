import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL as string);
async function main() {
  const posts = await sql`
    SELECT id, post_type, status, scheduled_date, video_url, SUBSTRING(image_url, 1, 80) as img_preview
    FROM social_posts
    WHERE platform = 'instagram'
      AND post_type = 'video'
      AND scheduled_date >= '2026-03-09' AND scheduled_date <= '2026-03-15'
    ORDER BY scheduled_date
  `;
  console.log(`\nIG reels this week: ${posts.length}`);
  for (const p of posts) {
    console.log(
      `  ID ${p.id} | ${p.status} | ${new Date(p.scheduled_date).toISOString()} | ${p.video_url ? p.video_url.substring(0, 80) : '(no video_url)'}`,
    );
  }
}
main().catch(console.error);
