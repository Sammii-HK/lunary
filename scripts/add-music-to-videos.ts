/**
 * Add background music to existing rendered videos
 *
 * Downloads each video from Vercel Blob, mixes in the background music
 * track at low volume using FFmpeg (no video re-encoding), and re-uploads.
 *
 * Usage:
 *   pnpm tsx scripts/add-music-to-videos.ts              # Process all recent videos
 *   pnpm tsx scripts/add-music-to-videos.ts --dry-run     # Preview what would be processed
 *   pnpm tsx scripts/add-music-to-videos.ts --limit 5     # Process only 5 videos
 */

import { config } from 'dotenv';
import { resolve, join } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { sql } from '@vercel/postgres';
import { put } from '@vercel/blob';
import { execFileSync } from 'child_process';
import { writeFile, unlink, mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';

const MUSIC_PATH = join(
  process.cwd(),
  'public',
  'audio',
  'series',
  'lunary-bed-v1.mp3',
);
const MUSIC_VOLUME = 0.12; // 12% — matches Remotion composition volume
const FADE_OUT_DURATION = 2.5; // seconds

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const limitIdx = args.indexOf('--limit');
  const limit = limitIdx !== -1 ? parseInt(args[limitIdx + 1], 10) : 100;

  console.log(`🎵 Add background music to existing videos`);
  console.log(`   Music: ${MUSIC_PATH}`);
  console.log(`   Volume: ${MUSIC_VOLUME} (${MUSIC_VOLUME * 100}%)`);
  console.log(`   Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);
  console.log(`   Limit: ${limit}`);
  console.log('');

  // Find all video posts with a video_url from the current week
  const result = await sql`
    SELECT id, video_url, topic, scheduled_date
    FROM social_posts
    WHERE post_type = 'video'
      AND video_url IS NOT NULL
      AND video_url != ''
      AND scheduled_date >= NOW() - INTERVAL '14 days'
    ORDER BY scheduled_date DESC
    LIMIT ${limit}
  `;

  const posts = result.rows;
  console.log(`Found ${posts.length} videos to process\n`);

  if (posts.length === 0) {
    console.log('No videos found. Done.');
    return;
  }

  // Create secure temporary directory with unique name
  const tmpDir = await mkdtemp(join(tmpdir(), 'lunary-music-mux-'));

  let processed = 0;
  let skipped = 0;
  let failed = 0;

  for (const post of posts) {
    const label = `[${post.id}] ${post.topic || 'unknown'}`;

    if (dryRun) {
      console.log(`  Would process: ${label}`);
      console.log(`    URL: ${post.video_url}`);
      continue;
    }

    try {
      console.log(`Processing: ${label}`);

      // Download the video
      const videoResponse = await fetch(post.video_url);
      if (!videoResponse.ok) {
        console.log(`  ⚠️  Skipped (download failed: ${videoResponse.status})`);
        skipped++;
        continue;
      }

      // Validate content type
      const contentType = videoResponse.headers.get('content-type');
      if (!contentType?.startsWith('video/')) {
        console.log(`  ⚠️  Skipped (invalid content type: ${contentType})`);
        skipped++;
        continue;
      }

      const videoData = Buffer.from(await videoResponse.arrayBuffer());

      // Validate file size (max 500MB)
      const MAX_SIZE = 500 * 1024 * 1024;
      if (videoData.length > MAX_SIZE) {
        console.log(
          `  ⚠️  Skipped (file too large: ${(videoData.length / 1024 / 1024).toFixed(1)}MB)`,
        );
        skipped++;
        continue;
      }

      const inputPath = join(tmpDir, `input-${post.id}.mp4`);
      const outputPath = join(tmpDir, `output-${post.id}.mp4`);

      await writeFile(inputPath, videoData);

      // Get video duration for fade-out timing
      const durationStr = execFileSync('ffprobe', [
        '-v',
        'quiet',
        '-show_entries',
        'format=duration',
        '-of',
        'csv=p=0',
        inputPath,
      ])
        .toString()
        .trim();

      const duration = parseFloat(durationStr);
      if (isNaN(duration) || duration <= 0) {
        console.log(`  ⚠️  Skipped (couldn't determine duration)`);
        skipped++;
        await unlink(inputPath).catch(() => {});
        continue;
      }

      const fadeOutStart = Math.max(0, duration - FADE_OUT_DURATION);

      // FFmpeg: copy video stream, mix background music into audio
      execFileSync(
        'ffmpeg',
        [
          '-y',
          '-i',
          inputPath,
          '-i',
          MUSIC_PATH,
          '-filter_complex',
          `[1:a]volume=${MUSIC_VOLUME},afade=t=in:st=0:d=1.0,afade=t=out:st=${fadeOutStart}:d=${FADE_OUT_DURATION},atrim=duration=${duration}[music];[0:a][music]amix=inputs=2:duration=first:dropout_transition=0[out]`,
          '-map',
          '0:v',
          '-map',
          '[out]',
          '-c:v',
          'copy', // No video re-encoding
          '-c:a',
          'aac',
          '-b:a',
          '128k',
          outputPath,
        ],
        { timeout: 60_000 },
      );

      // Read output and upload
      const { readFile } = await import('fs/promises');
      const outputBuffer = await readFile(outputPath);

      // Upload to the same blob path pattern
      const dateKey = new Date(post.scheduled_date).toISOString().split('T')[0];
      const slug = (post.topic || 'video')
        .replace(/[^a-z0-9]+/gi, '-')
        .toLowerCase()
        .slice(0, 40);
      const blobKey = `videos/shorts/daily/${dateKey}-${slug}-music-${Date.now()}.mp4`;

      const uploadResult = await put(blobKey, outputBuffer, {
        access: 'public',
        contentType: 'video/mp4',
      });

      // Update the social_posts record with new URL
      await sql`
        UPDATE social_posts
        SET video_url = ${uploadResult.url}
        WHERE id = ${post.id}
      `;

      console.log(
        `  ✅ Done (${duration.toFixed(1)}s, ${(outputBuffer.length / 1024 / 1024).toFixed(1)}MB)`,
      );
      processed++;

      // Cleanup temp files
      await unlink(inputPath).catch(() => {});
      await unlink(outputPath).catch(() => {});
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ❌ Failed: ${msg}`);
      failed++;
    }
  }

  console.log(
    `\n🎵 Done: ${processed} processed, ${skipped} skipped, ${failed} failed`,
  );

  // Cleanup temporary directory
  try {
    await rm(tmpDir, { recursive: true, force: true });
  } catch (err) {
    console.warn('Failed to cleanup temp directory:', err);
  }
}

main()
  .catch(console.error)
  .finally(() => process.exit());
