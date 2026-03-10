import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
const sql = neon(process.env.POSTGRES_URL as string);
async function main() {
  const posts =
    await sql`SELECT id, post_type, scheduled_date, image_url, content FROM social_posts WHERE id IN (8884, 8886, 8887)`;
  for (const p of posts) {
    console.log(`\nID ${p.id} — ${p.post_type}`);
    console.log(`image_url: ${p.image_url}`);
    console.log(`content: ${String(p.content).substring(0, 200)}`);
  }
}
main().catch(console.error);
