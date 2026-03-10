import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL as string);
async function main() {
  const posts = await sql`
    SELECT id, post_type, status, scheduled_date, SUBSTRING(image_url, 1, 80) as img_preview
    FROM social_posts
    WHERE platform = 'instagram'
      AND scheduled_date >= '2026-03-09' AND scheduled_date <= '2026-03-20'
    ORDER BY scheduled_date
  `;
  for (const p of posts)
    console.log(
      `ID ${p.id} | ${p.post_type} | ${p.status} | ${new Date(p.scheduled_date).toISOString().split('T')[0]} | ${p.img_preview}`,
    );
}
main().catch(console.error);
