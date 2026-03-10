/**
 * One-command weekly Instagram content workflow:
 *   1. Runs generateDailyBatch locally for each day (no HTTP, no auth needed)
 *   2. Saves posts to DB via Prisma
 *   3. Pre-uploads all OG slide images to Vercel Blob
 *   4. Updates DB with blob URLs so Spellcast accepts them on send
 *
 * Usage:
 *   pnpm ig:weekly               (auto-detects next Monday)
 *   pnpm ig:weekly 2026-03-16    (explicit start date)
 *   pnpm ig:weekly --dry-run     (generate only, no image uploads or DB writes)
 */
import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Must load env before importing app modules
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import {
  generateDailyBatch,
  generateLinkedInDidYouKnowBatch,
} from '@/lib/instagram/content-orchestrator';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const sql = neon(process.env.POSTGRES_URL as string);
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN as string;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const dateArg = args.find((a) => /^\d{4}-\d{2}-\d{2}$/.test(a));

function nextMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilMonday = day === 0 ? 1 : 8 - day;
  d.setDate(d.getDate() + daysUntilMonday);
  return d.toISOString().split('T')[0];
}

// ── Step 1: Generate posts ────────────────────────────────────────────────────

async function generateWeek(startDate: string): Promise<void> {
  const startDateObj = new Date(startDate);
  let totalPosts = 0;

  console.log('\n[1/2] Generating weekly content...');

  for (let i = 0; i < 7; i++) {
    const date = new Date(startDateObj);
    date.setDate(startDateObj.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];

    process.stdout.write(`  Day ${i + 1}/7 (${dateStr}): `);

    const batch = await generateDailyBatch(dateStr);

    if (!batch?.posts?.length) {
      console.log('(rest day, 0 posts)');
      continue;
    }

    if (dryRun) {
      console.log(`[dry-run] would save ${batch.posts.length} posts`);
      continue;
    }

    let saved = 0;
    for (const post of batch.posts) {
      const groupKey = `${dateStr}-${post.type}`;
      const isCarousel =
        post.type === 'carousel' ||
        post.type === 'angel_number_carousel' ||
        post.type === 'one_word';
      const imageUrls = post.imageUrls || [];
      const imageUrlValue =
        isCarousel && imageUrls.length > 1
          ? imageUrls.join('|')
          : imageUrls[0] || null;

      const postData = {
        content: post.caption,
        postType: isCarousel ? 'instagram_carousel' : post.type,
        scheduledDate: new Date(post.scheduledTime),
        image_url: imageUrlValue,
        video_metadata: {
          hashtags: post.hashtags || [],
          metadata: post.metadata || {},
          imageUrls,
        },
      };

      for (const platform of ['instagram', 'facebook', 'pinterest'] as const) {
        const existing = await prisma.socialPost.findFirst({
          where: { base_group_key: groupKey, platform },
        });
        if (existing) {
          await prisma.socialPost.update({
            where: { id: existing.id },
            data: postData,
          });
        } else {
          await prisma.socialPost.create({
            data: {
              ...postData,
              platform,
              status: 'pending',
              base_group_key: groupKey,
            },
          });
        }
      }
      saved++;
    }

    console.log(`${batch.posts.length} posts saved`);
    totalPosts += saved;

    if (i < 6) await new Promise((r) => setTimeout(r, 1000));
  }

  // LinkedIn DYK posts
  try {
    const dykPosts = generateLinkedInDidYouKnowBatch(startDate);
    if (!dryRun) {
      for (const post of dykPosts) {
        const dykDateStr = post.scheduledTime.split('T')[0];
        const groupKey = `linkedin-${dykDateStr}-did_you_know`;
        const postData = {
          content: post.caption,
          postType: post.type,
          scheduledDate: new Date(post.scheduledTime),
          image_url: post.imageUrls[0] || null,
          video_metadata: {
            hashtags: post.hashtags || [],
            metadata: post.metadata || {},
            imageUrls: post.imageUrls,
          },
        };
        const existing = await prisma.socialPost.findFirst({
          where: { base_group_key: groupKey },
        });
        if (existing) {
          await prisma.socialPost.update({
            where: { id: existing.id },
            data: postData,
          });
        } else {
          await prisma.socialPost.create({
            data: {
              ...postData,
              platform: 'linkedin',
              status: 'pending',
              base_group_key: groupKey,
            },
          });
        }
      }
    }
    console.log(
      `  LinkedIn DYK: ${dykPosts.length} posts${dryRun ? ' (dry-run)' : ' saved'}`,
    );
    totalPosts += dykPosts.length;
  } catch (err) {
    console.warn(
      '  LinkedIn DYK failed:',
      err instanceof Error ? err.message : err,
    );
  }

  console.log(`  Total: ${totalPosts} posts generated`);
}

// ── Step 2: Pre-upload OG images ─────────────────────────────────────────────

async function preUpload(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(60000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  const contentType = res.headers.get('content-type') || 'image/png';
  const ext = contentType.includes('jpeg') ? 'jpg' : 'png';
  const hash = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const blob = await put(`social-images/${hash}.${ext}`, buffer, {
    access: 'public',
    contentType,
    token: BLOB_TOKEN,
  });
  return blob.url;
}

async function prepareImages(startDate: string): Promise<void> {
  const toDate = new Date(new Date(startDate).getTime() + 10 * 86400000)
    .toISOString()
    .split('T')[0];

  console.log(`\n[2/2] Pre-uploading OG images (${startDate} → ${toDate})...`);

  const posts = await sql`
    SELECT id, post_type, scheduled_date, image_url, video_metadata
    FROM social_posts
    WHERE platform = 'instagram'
      AND status = 'pending'
      AND scheduled_date >= ${startDate}
      AND scheduled_date <= ${toDate}
      AND image_url LIKE '%/api/og%'
    ORDER BY scheduled_date
  `;

  if (posts.length === 0) {
    console.log('  No OG image posts found.');
    return;
  }

  let ok = 0;
  let failed = 0;

  for (const post of posts) {
    const slides: string[] = (post.image_url as string).split('|');
    const dateStr = new Date(post.scheduled_date).toISOString().split('T')[0];
    process.stdout.write(`  ID ${post.id} (${post.post_type}, ${dateStr}): `);

    if (dryRun) {
      console.log(`[dry-run] ${slides.length} slide(s)`);
      continue;
    }

    const blobUrls: string[] = [];
    let uploadFailed = false;

    for (let i = 0; i < slides.length; i++) {
      const url = slides[i];
      if (!url.includes('/api/og')) {
        blobUrls.push(url);
        continue;
      }
      try {
        const blobUrl = await preUpload(url);
        blobUrls.push(blobUrl);
        if (i < slides.length - 1) await new Promise((r) => setTimeout(r, 400));
      } catch (err) {
        console.error(
          `\n    ❌ Slide ${i + 1} failed: ${err instanceof Error ? err.message : err}`,
        );
        uploadFailed = true;
        break;
      }
    }

    if (uploadFailed) {
      console.log('❌ skipped');
      failed++;
      continue;
    }

    const newImageUrl = blobUrls.join('|');
    let newVideoMetadata = post.video_metadata;
    if (
      post.video_metadata?.imageUrls?.some((u: string) => u.includes('/api/og'))
    ) {
      newVideoMetadata = { ...post.video_metadata, imageUrls: blobUrls };
    }

    await sql`
      UPDATE social_posts
      SET image_url = ${newImageUrl},
          video_metadata = ${JSON.stringify(newVideoMetadata)}
      WHERE id = ${post.id}
    `;

    console.log(`✅ ${slides.length} slide(s)`);
    ok++;
  }

  console.log(`  Result: ${ok} updated, ${failed} failed`);
  if (failed > 0) {
    console.log('  Re-run to retry failed posts.\n');
    process.exit(1);
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const startDate = dateArg || nextMonday();
  console.log(
    `\nWeekly IG workflow — ${startDate}${dryRun ? ' (DRY RUN)' : ''}`,
  );

  try {
    await generateWeek(startDate);
    await prepareImages(startDate);
    console.log('\nDone. Posts are ready — click send in the admin panel.\n');
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error('\n❌', err.message || err);
  process.exit(1);
});
