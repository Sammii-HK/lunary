/**
 * Catch-up script for carousel generation.
 * Runs locally, fetches OG images from production, uploads to blob, posts to Spellcast.
 *
 * Usage: npx tsx scripts/catch-up-carousels.ts 2026-03-22
 *        npx tsx scripts/catch-up-carousels.ts 2026-03-22 2026-03-28
 */

import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });
import { put } from '@vercel/blob';

// Register path aliases for the project

const BASE_URL = 'https://lunary.app';
const TARGET_PLATFORMS = ['instagram', 'bluesky'];

async function run() {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error(
      'Usage: npx tsx scripts/catch-up-carousels.ts <start-date> [end-date]',
    );
    process.exit(1);
  }

  const startDate = args[0];
  const endDate = args[1] || startDate;

  // Generate date range
  const dates: string[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  while (current <= end) {
    dates.push(current.toISOString().split('T')[0]);
    current.setDate(current.getDate() + 1);
  }

  console.log(
    `\n📸 Catching up carousels for ${dates.length} dates: ${dates.join(', ')}\n`,
  );

  // Dynamic import to get the orchestrator
  const { generateDailyBatch } =
    await import('../src/lib/instagram/content-orchestrator');
  const { postToSpellcastMultiPlatform } =
    await import('../src/lib/social/spellcast');

  for (const dateStr of dates) {
    console.log(`\n--- ${dateStr} ---`);
    try {
      const batch = await generateDailyBatch(dateStr, BASE_URL);
      if (batch.posts.length === 0) {
        console.log(`  No posts generated for ${dateStr}`);
        continue;
      }

      for (const post of batch.posts) {
        console.log(`  Type: ${post.type} | ${post.imageUrls.length} slides`);

        // Pre-render slides to blob
        const blobUrls: string[] = [];
        for (let i = 0; i < post.imageUrls.length; i++) {
          try {
            const res = await fetch(post.imageUrls[i], {
              signal: AbortSignal.timeout(60000),
            });
            if (!res.ok)
              throw new Error(
                `HTTP ${res.status} for ${post.imageUrls[i].slice(0, 100)}`,
              );

            const buf = await res.arrayBuffer();
            const blobPath = `carousels/${dateStr}/${post.type}-${i}.png`;
            const blob = await put(blobPath, Buffer.from(buf), {
              access: 'public',
              contentType: 'image/png',
              addRandomSuffix: true,
            });
            blobUrls.push(blob.url);
            console.log(
              `    Slide ${i}: ${(buf.byteLength / 1024).toFixed(0)}KB → ${blob.url.slice(-50)}`,
            );
          } catch (err) {
            console.error(
              `    Slide ${i} FAILED:`,
              err instanceof Error ? err.message : err,
            );
            blobUrls.push(post.imageUrls[i]); // fallback
          }
        }

        // Build caption
        const igCaption = [post.caption, post.hashtags.join(' ')]
          .filter(Boolean)
          .join('\n\n');

        // Schedule time
        const scheduledTime = new Date(post.scheduledTime);
        const now = new Date();
        if (scheduledTime < now) {
          scheduledTime.setTime(now.getTime() + 30 * 60 * 1000); // 30 min from now
        }

        // Post to Spellcast
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
          console.log(`    Spellcast: ${platformResults}`);
        } catch (err) {
          console.error(
            `    Spellcast FAILED:`,
            err instanceof Error ? err.message : err,
          );
        }
      }
    } catch (err) {
      console.error(
        `  ERROR for ${dateStr}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  console.log('\n✅ Done');
}

run().catch(console.error);
