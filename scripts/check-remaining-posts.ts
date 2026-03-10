import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL!);
async function main() {
  const posts = await sql`
    SELECT id, post_type, scheduled_date, image_url, content
    FROM social_posts
    WHERE id IN (8884, 8886, 8887)
  `;
  for (const p of posts) {
    const slides = p.image_url?.split('|') || [];
    console.log(
      `\nID ${p.id} — ${p.post_type} — ${new Date(p.scheduled_date).toISOString()}`,
    );
    console.log(`Slides: ${slides.length}`);
    slides.forEach((s: string, i: number) =>
      console.log(`  [${i}] ${s.substring(0, 100)}`),
    );
    console.log(`Content: ${String(p.content).substring(0, 80)}`);
  }
}
main().catch(console.error);
