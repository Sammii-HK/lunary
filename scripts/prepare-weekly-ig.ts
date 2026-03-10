/**
 * Pre-uploads all pending Instagram post images to Vercel Blob and updates the DB.
 * Run this AFTER generate-weekly so blob URLs (not OG query-param URLs) are stored.
 * When admin clicks "send", preUploadImage detects blob URLs and skips the upload step,
 * so Spellcast/Postiz receives clean static URLs that it accepts.
 *
 * Usage:
 *   pnpm ig:prepare-weekly               (fix pending posts in next 14 days)
 *   pnpm ig:prepare-weekly:dry           (preview without uploading)
 *   pnpm tsx scripts/prepare-weekly-ig.ts --days=14
 *   pnpm tsx scripts/prepare-weekly-ig.ts --include-sent   (retroactively fix sent posts too)
 */
import { put } from '@vercel/blob';
import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const sql = neon(process.env.POSTGRES_URL as string);
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN as string;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const includeSent = args.includes('--include-sent');
const daysArg = args.find((a) => a.startsWith('--days='));
const lookAheadDays = daysArg ? parseInt(daysArg.split('=')[1]) : 14;

async function preUpload(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl, { signal: AbortSignal.timeout(60000) });
  if (!res.ok)
    throw new Error(`HTTP ${res.status} for ${imageUrl.substring(0, 80)}`);
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

function isOgUrl(url: string): boolean {
  return url.includes('/api/og');
}

async function main() {
  const fromDate = new Date().toISOString().split('T')[0];
  const toDate = new Date(Date.now() + lookAheadDays * 86400000)
    .toISOString()
    .split('T')[0];

  console.log(`\nPreparing Instagram posts from ${fromDate} to ${toDate}`);
  console.log(`Mode: ${dryRun ? 'DRY RUN (no uploads)' : 'LIVE'}`);
  console.log(
    `Statuses: ${includeSent ? 'pending + sent' : 'pending only'} (use --include-sent to include already-sent)\n`,
  );

  const statusFilter = includeSent ? ['pending', 'sent'] : ['pending'];

  const posts = await sql`
    SELECT id, post_type, scheduled_date, image_url, video_metadata
    FROM social_posts
    WHERE platform = 'instagram'
      AND status = ANY(${statusFilter})
      AND scheduled_date >= ${fromDate}
      AND scheduled_date <= ${toDate}
      AND image_url IS NOT NULL
      AND image_url LIKE '%/api/og%'
    ORDER BY scheduled_date
  `;

  if (posts.length === 0) {
    console.log('No pending Instagram posts found.');
    return;
  }

  console.log(`Found ${posts.length} pending Instagram posts\n`);

  let updatedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (const post of posts) {
    const slides: string[] = (post.image_url as string).split('|');
    const hasOgUrls = slides.some(isOgUrl);

    if (!hasOgUrls) {
      skippedCount++;
      continue;
    }

    console.log(
      `\n📸 ID ${post.id} — ${post.post_type} — ${new Date(post.scheduled_date).toISOString().split('T')[0]}`,
    );
    console.log(`   ${slides.length} slide(s)`);

    if (dryRun) {
      console.log('   [dry-run] Would upload and update DB');
      continue;
    }

    const blobUrls: string[] = [];
    let failed = false;

    for (let i = 0; i < slides.length; i++) {
      const url = slides[i];
      if (!isOgUrl(url)) {
        // Already a blob URL, keep as-is
        blobUrls.push(url);
        console.log(
          `   [${i + 1}/${slides.length}] Already blob: ${url.substring(0, 60)}...`,
        );
        continue;
      }
      process.stdout.write(`   [${i + 1}/${slides.length}] Uploading... `);
      try {
        const blobUrl = await preUpload(url);
        blobUrls.push(blobUrl);
        console.log(`✅ ${blobUrl.substring(0, 60)}`);
        // Small delay to avoid hammering OG endpoint
        if (i < slides.length - 1) await new Promise((r) => setTimeout(r, 500));
      } catch (err) {
        console.error(`❌ ${err instanceof Error ? err.message : err}`);
        failed = true;
        break;
      }
    }

    if (failed) {
      console.error(
        `   ❌ Skipping update for ID ${post.id} due to upload failure`,
      );
      errorCount++;
      continue;
    }

    const newImageUrl = blobUrls.join('|');

    // Also update video_metadata.imageUrls if it has OG URLs
    let newVideoMetadata = post.video_metadata;
    if (post.video_metadata?.imageUrls?.some(isOgUrl)) {
      newVideoMetadata = {
        ...post.video_metadata,
        imageUrls: blobUrls,
      };
    }

    await sql`
      UPDATE social_posts
      SET image_url = ${newImageUrl},
          video_metadata = ${JSON.stringify(newVideoMetadata)}
      WHERE id = ${post.id}
    `;

    console.log(`   ✅ DB updated for ID ${post.id}`);
    updatedCount++;
  }

  console.log(`\n─────────────────────────────────`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Skipped: ${skippedCount}`);
  console.log(`Errors:  ${errorCount}`);
  console.log(`─────────────────────────────────\n`);

  if (errorCount > 0) {
    console.log('Some posts failed — re-run the script to retry.\n');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
