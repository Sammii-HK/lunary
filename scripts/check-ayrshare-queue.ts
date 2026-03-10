/**
 * Check Ayrshare for scheduled posts this week (Mar 9-15 2026)
 * to see how many duplicates are queued.
 *
 * Run: npx tsx scripts/check-ayrshare-queue.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const AYRSHARE_API_URL = 'https://api.ayrshare.com/api';

async function main() {
  const apiKey = process.env.AYRSHARE_API_KEY;
  if (!apiKey) throw new Error('AYRSHARE_API_KEY not set');

  // List all scheduled posts
  const profileKey = process.env.AYRSHARE_PROFILE_KEY;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };
  if (profileKey) headers['Profile-Key'] = profileKey;

  const res = await fetch(`${AYRSHARE_API_URL}/post`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Ayrshare API error ${res.status}:`, text);
    return;
  }

  const data = await res.json();
  console.log('Ayrshare response keys:', Object.keys(data));
  console.log('Total scheduled posts:', data.posts?.length || 0);

  // Filter to this week
  const weekStart = new Date('2026-03-09T00:00:00Z');
  const weekEnd = new Date('2026-03-16T00:00:00Z');

  const thiweek = (data.posts || []).filter((p: any) => {
    const d = new Date(p.scheduleDate || p.created);
    return d >= weekStart && d < weekEnd;
  });

  console.log('\nPosts scheduled for this week:', thiweek.length);

  // Group by platform + scheduleDate to find duplicates
  const byKey = new Map<string, any[]>();
  for (const p of thiweek) {
    const key = `${p.platforms?.join(',') || 'unknown'}|${p.scheduleDate || p.created}`;
    if (!byKey.has(key)) byKey.set(key, []);
    byKey.get(key)!.push(p);
  }

  let dupeCount = 0;
  for (const [key, posts] of byKey) {
    if (posts.length > 1) {
      dupeCount++;
      console.log(`\nDuplicate: ${key} (${posts.length} copies)`);
      for (const p of posts) {
        console.log(
          `  id=${p.id} platform=${p.platforms} text="${(p.post || '').substring(0, 40)}"`,
        );
      }
    }
  }

  if (dupeCount === 0) {
    console.log('No duplicates found in Ayrshare queue');
  } else {
    console.log(`\nTotal duplicate groups: ${dupeCount}`);
  }

  // Show first 3 posts to understand structure
  console.log('\nFirst 3 posts sample:');
  for (const p of thiweek.slice(0, 3)) {
    console.log(JSON.stringify(p, null, 2));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
