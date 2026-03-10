/**
 * Reads all pending Instagram carousel posts from the DB for this week,
 * pre-uploads their slides to blob storage (no Vercel self-reference from here),
 * and submits each to Spellcast at the correct scheduled time.
 */
import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.POSTGRES_URL!);
const API_URL = (process.env.SPELLCAST_API_URL || '').replace(/\s/g, '');
const API_KEY = (process.env.SPELLCAST_API_KEY || '').replace(/\s/g, '');
const ACCOUNT_SET_ID = process.env.SPELLCAST_LUNARY_ACCOUNT_SET_ID!;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN!;
const IG_ACCOUNT_ID = '7a229f88-3160-4adc-9b00-2e9dc4c5e76f';

async function preUpload(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(25000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = await res.arrayBuffer();
  const ct = res.headers.get('content-type') || 'image/png';
  const ext = ct.includes('jpeg') ? 'jpg' : 'png';
  const hash = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const blob = await put(`social-images/${hash}.${ext}`, buf, {
    access: 'public',
    contentType: ct,
    token: BLOB_TOKEN,
  });
  return blob.url;
}

async function submitToSpellcast(
  mediaUrls: string[],
  content: string,
  scheduledFor: string,
) {
  const createRes = await fetch(`${API_URL}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      content,
      mediaUrls,
      scheduledFor,
      accountSetId: ACCOUNT_SET_ID,
      postType: 'post',
      selectedAccountIds: [IG_ACCOUNT_ID],
    }),
  });
  const draft = (await createRes.json()) as any;
  if (!createRes.ok) throw new Error(`Create failed: ${JSON.stringify(draft)}`);

  const schedRes = await fetch(`${API_URL}/api/posts/${draft.id}/schedule`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!schedRes.ok) {
    const err = await schedRes.text();
    throw new Error(`Schedule failed: ${err}`);
  }
  return draft.id;
}

async function main() {
  // Get all instagram carousel posts for this week that aren't yet in Spellcast
  const posts = await sql`
    SELECT id, image_url, content, scheduled_date,
           TO_CHAR(scheduled_date AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI') as utc_time
    FROM social_posts
    WHERE scheduled_date >= '2026-03-09'::timestamptz
      AND scheduled_date < '2026-03-16'::timestamptz
      AND platform = 'instagram'
      AND post_type = 'instagram_carousel'
      AND status IN ('pending', 'approved', 'sent')
      AND image_url IS NOT NULL
    ORDER BY scheduled_date
  `;

  console.log(`Found ${posts.length} carousel posts for this week\n`);

  for (const post of posts) {
    console.log(`\n[${post.utc_time}] Post ID ${post.id}`);
    const slideUrls: string[] = post.image_url
      .split('|')
      .map((u: string) => u.trim())
      .filter(Boolean);
    console.log(`  ${slideUrls.length} slides`);

    try {
      // Upload all slides in parallel
      process.stdout.write('  Uploading slides... ');
      const blobUrls = await Promise.all(slideUrls.map(preUpload));
      console.log('✅');

      // Schedule in Spellcast — skip if time already passed, push to 22:00 UTC same day
      let scheduledFor = new Date(post.scheduled_date).toISOString();
      const now = new Date();
      const schedTime = new Date(post.scheduled_date);
      if (schedTime < now) {
        // Reschedule to 22:30 UTC today if it's today, otherwise keep original
        const dateStr = schedTime.toISOString().split('T')[0];
        const todayStr = now.toISOString().split('T')[0];
        if (dateStr === todayStr) {
          scheduledFor = `${dateStr}T22:30:00.000Z`;
          console.log(`  ⏩ Time passed, rescheduling to 22:30 UTC today`);
        } else {
          // Past day — skip
          console.log(`  ⚠️  Skipping — past day`);
          continue;
        }
      }

      const spellcastId = await submitToSpellcast(
        blobUrls,
        post.content,
        scheduledFor,
      );
      console.log(`  ✅ Spellcast ID: ${spellcastId} → ${scheduledFor}`);
    } catch (err) {
      console.error(`  ❌ Failed:`, err instanceof Error ? err.message : err);
    }

    // Small delay between posts
    await new Promise((r) => setTimeout(r, 500));
  }

  console.log('\nDone.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
