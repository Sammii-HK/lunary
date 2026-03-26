/**
 * Post pre-generated carousel images to Spellcast.
 * Run AFTER catch-up-carousels.ts has uploaded all images to blob.
 * Adds a delay between posts to avoid Postiz rate limits.
 *
 * Usage: npx tsx scripts/post-carousels-to-spellcast.ts 2026-03-22 2026-03-28
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

import { list } from '@vercel/blob';

const DELAY_MS = 15_000; // 15 seconds between Spellcast calls
const TARGET_PLATFORMS = ['instagram', 'bluesky'];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function run() {
  const args = process.argv.slice(2);
  if (args.length < 2) {
    console.error(
      'Usage: npx tsx scripts/post-carousels-to-spellcast.ts <start-date> <end-date>',
    );
    process.exit(1);
  }

  const [startDate, endDate] = args;
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  const { generateDailyBatch } =
    await import('../src/lib/instagram/content-orchestrator');
  const { postToSpellcastMultiPlatform } =
    await import('../src/lib/social/spellcast');

  console.log(
    `\n📮 Posting carousels to Spellcast for ${dates.length} dates (${DELAY_MS / 1000}s delay between posts)\n`,
  );

  for (const dateStr of dates) {
    console.log(`\n--- ${dateStr} ---`);

    // Find existing blob URLs for this date
    const prefix = `carousels/${dateStr}/`;
    const blobs = await list({ prefix });
    const blobUrls = blobs.blobs
      .sort((a, b) => a.pathname.localeCompare(b.pathname))
      .map((b) => b.url);

    if (blobUrls.length === 0) {
      console.log(`  No blob images found for ${dateStr}, skipping`);
      continue;
    }

    console.log(`  Found ${blobUrls.length} blob images`);

    // Regenerate the batch to get captions (deterministic, same output)
    const batch = await generateDailyBatch(dateStr, 'https://lunary.app');
    const post = batch.posts[0];
    if (!post) {
      console.log(`  No post generated, skipping`);
      continue;
    }

    const igCaption = [post.caption, post.hashtags.join(' ')]
      .filter(Boolean)
      .join('\n\n');

    // Schedule for the right time (push to future if past)
    const scheduledTime = new Date(post.scheduledTime);
    const now = new Date();
    if (scheduledTime < now) {
      // Schedule at 10am UTC on the target date, or 30 min from now if today
      if (dateStr === now.toISOString().split('T')[0]) {
        scheduledTime.setTime(now.getTime() + 30 * 60 * 1000);
      } else {
        // Past date — schedule 30 min from now
        scheduledTime.setTime(now.getTime() + 30 * 60 * 1000);
      }
    }

    console.log(
      `  Type: ${post.type} | Scheduled: ${scheduledTime.toISOString()}`,
    );
    console.log(`  Waiting ${DELAY_MS / 1000}s before posting...`);
    await sleep(DELAY_MS);

    try {
      const result = await postToSpellcastMultiPlatform({
        platforms: TARGET_PLATFORMS,
        content: igCaption,
        media: blobUrls.map((url) => ({ type: 'image' as const, url })),
        scheduledDate: scheduledTime.toISOString(),
        accountSet: 'lunary',
      });

      const platformResults = Object.entries(result.results)
        .map(([p, r]) => `${p}:${r.success ? 'ok' : r.error || 'fail'}`)
        .join(' | ');
      console.log(`  Spellcast: ${platformResults}`);
    } catch (err) {
      console.error(
        `  Spellcast FAILED:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  console.log('\n✅ Done');
}

run().catch(console.error);
