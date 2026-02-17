/**
 * Batch upload existing podcast episodes to YouTube via direct API
 *
 * Flow: compose video → upload to Vercel Blob → upload to YouTube API → update DB
 *
 * Usage:
 *   pnpm exec tsx scripts/upload-podcasts-to-youtube.ts
 *   pnpm exec tsx scripts/upload-podcasts-to-youtube.ts --dry-run
 */

import { config } from 'dotenv';
config({ path: '.env.local' });

import { prisma } from '../src/lib/prisma';
import { put } from '@vercel/blob';
import { buildPodcastYouTubeMetadata } from '../src/lib/youtube/metadata';
import {
  uploadLongForm,
  uploadCaptions,
  addVideoToPlaylist,
} from '../src/lib/youtube/client';
import { getFfmpegPath } from '../src/lib/video/compose-video';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile, readFile, mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

const DRY_RUN = process.argv.includes('--dry-run');
const DELAY_BETWEEN_UPLOADS_MS = 10_000; // 10s between uploads to avoid rate limits
const COVER_IMAGE_URLS = [
  'http://localhost:3000/api/og/podcast-cover',
  'https://lunary.app/api/og/podcast-cover',
];

async function composePodcastVideo(
  coverImage: Buffer,
  audioBuffer: Buffer,
): Promise<Buffer> {
  await getFfmpegPath();

  const tempDir = await mkdtemp(join(tmpdir(), 'podcast-video-'));
  const imagePath = join(tempDir, 'cover.png');
  const audioPath = join(tempDir, 'audio.mp3');
  const outputPath = join(tempDir, 'output.mp4');

  try {
    await writeFile(imagePath, coverImage);
    await writeFile(audioPath, audioBuffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg()
        .input(imagePath)
        .inputOptions(['-loop', '1'])
        .input(audioPath)
        .outputOptions([
          '-c:v',
          'libx264',
          '-tune',
          'stillimage',
          '-c:a',
          'aac',
          '-b:a',
          '192k',
          '-pix_fmt',
          'yuv420p',
          '-shortest',
          '-vf',
          'scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=black',
        ])
        .output(outputPath)
        .on('end', () => resolve())
        .on('error', (err) => reject(err))
        .run();
    });

    return await readFile(outputPath);
  } finally {
    await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  if (
    !process.env.GOOGLE_CLIENT_ID ||
    !process.env.GOOGLE_CLIENT_SECRET ||
    !process.env.GOOGLE_REFRESH_TOKEN
  ) {
    throw new Error(
      'Missing YouTube OAuth credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in .env.local',
    );
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN in .env.local');
  }

  console.log(
    DRY_RUN
      ? '🧪 DRY RUN — will not upload\n'
      : '🚀 LIVE RUN — uploading to YouTube via direct API\n',
  );

  // Find all episodes without YouTube uploads
  const episodes = await prisma.podcastEpisode.findMany({
    where: {
      status: 'published',
      youtubeVideoId: null,
    },
    orderBy: { episodeNumber: 'asc' },
  });

  if (episodes.length === 0) {
    console.log('✅ All episodes already have YouTube videos!');
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${episodes.length} episodes to upload:\n`);
  for (const ep of episodes) {
    console.log(`  Ep ${ep.episodeNumber}: ${ep.title} (${ep.durationSecs}s)`);
  }
  console.log('');

  // Fetch cover image once (reused for all episodes)
  console.log('📥 Fetching podcast cover image...');
  let coverImage: Buffer | null = null;
  for (const url of COVER_IMAGE_URLS) {
    try {
      console.log(`   Trying ${url}...`);
      const coverResponse = await fetch(url);
      if (coverResponse.ok) {
        coverImage = Buffer.from(await coverResponse.arrayBuffer());
        console.log(`   Cover: ${(coverImage.length / 1024).toFixed(0)}KB\n`);
        break;
      }
    } catch {
      // Try next URL
    }
  }
  if (!coverImage) {
    throw new Error(
      'Failed to fetch cover image from any URL. Is the dev server running? (pnpm dev)',
    );
  }

  const playlistId =
    process.env.YOUTUBE_PODCAST_PLAYLIST_ID ||
    process.env.YOUTUBE_LONG_FORM_PLAYLIST_ID;

  let uploaded = 0;
  let failed = 0;

  for (const episode of episodes) {
    const label = `Ep ${episode.episodeNumber}: ${episode.title}`;
    console.log(`━━━ ${label} ━━━`);

    try {
      let videoBuffer: Buffer;
      let blobUrl: string;

      // If video already exists in Blob, download it instead of recomposing
      if (episode.videoUrl) {
        console.log(`  📥 Downloading existing video from Blob...`);
        const videoResponse = await fetch(episode.videoUrl);
        if (!videoResponse.ok) {
          throw new Error(`Video fetch failed: ${videoResponse.status}`);
        }
        videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
        blobUrl = episode.videoUrl;
        console.log(
          `     ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB video (cached)`,
        );
      } else {
        // Compose from scratch: audio + cover → video → Blob
        console.log(`  📥 Downloading audio...`);
        const audioResponse = await fetch(episode.audioUrl);
        if (!audioResponse.ok) {
          throw new Error(`Audio fetch failed: ${audioResponse.status}`);
        }
        const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
        console.log(
          `     ${(audioBuffer.length / 1024 / 1024).toFixed(1)}MB audio`,
        );

        console.log(`  🎬 Composing video...`);
        videoBuffer = await composePodcastVideo(coverImage, audioBuffer);
        console.log(
          `     ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB video`,
        );

        if (!DRY_RUN) {
          console.log(`  ☁️  Uploading to Vercel Blob...`);
          const blobResult = await put(
            `podcast/videos/episode-${episode.episodeNumber}.mp4`,
            videoBuffer,
            { access: 'public', contentType: 'video/mp4' },
          );
          blobUrl = blobResult.url;
          console.log(`     ${blobUrl}`);
        } else {
          blobUrl = '';
        }
      }

      if (DRY_RUN) {
        console.log(`  ⏭️  Skipping upload (dry run)\n`);
        uploaded++;
        continue;
      }

      // 4. Build metadata
      const transcript = episode.transcript as
        | { speaker: string; text: string }[]
        | null;

      const metadata = buildPodcastYouTubeMetadata({
        episodeNumber: episode.episodeNumber,
        title: episode.title,
        description: episode.description,
        slug: episode.slug,
        grimoireSlugs: episode.grimoireSlugs,
        transcript,
        durationSecs: episode.durationSecs,
      });

      // 5. Upload to YouTube via direct API
      console.log(`  📤 Uploading to YouTube...`);
      const ytResult = await uploadLongForm(videoBuffer, {
        title: metadata.title,
        description: metadata.description,
        tags: metadata.tags,
        privacyStatus: 'public',
        categoryId: '22', // People & Blogs
      });
      console.log(`  ✅ YouTube upload complete: ${ytResult.videoId}`);
      console.log(`     ${ytResult.url}`);

      // 6. Upload captions from transcript
      if (transcript && transcript.length > 0) {
        const scriptText = transcript
          .map(
            (line) =>
              `${line.speaker === 'HOST_A' ? 'Luna' : 'Sol'}: ${line.text}`,
          )
          .join('\n');

        try {
          await uploadCaptions(ytResult.videoId, scriptText);
          console.log(`  📝 Captions uploaded`);
        } catch (captionError) {
          console.warn(`  ⚠️ Caption upload failed (non-fatal):`, captionError);
        }
      }

      // 7. Add to podcast playlist
      if (playlistId) {
        try {
          await addVideoToPlaylist(ytResult.videoId, playlistId);
          console.log(`  📋 Added to playlist: ${playlistId}`);
        } catch (playlistError) {
          console.warn(`  ⚠️ Playlist add failed (non-fatal):`, playlistError);
        }
      }

      // 8. Update DB
      await prisma.podcastEpisode.update({
        where: { id: episode.id },
        data: {
          videoUrl: blobUrl,
          youtubeVideoId: ytResult.videoId,
          youtubeVideoUrl: ytResult.url,
        },
      });
      console.log(`  💾 Database updated\n`);

      uploaded++;

      // Delay between uploads
      if (episode !== episodes[episodes.length - 1]) {
        console.log(
          `  ⏳ Waiting ${DELAY_BETWEEN_UPLOADS_MS / 1000}s before next...\n`,
        );
        await sleep(DELAY_BETWEEN_UPLOADS_MS);
      }
    } catch (error) {
      failed++;
      console.error(
        `  ❌ Failed: ${error instanceof Error ? error.message : error}\n`,
      );
    }
  }

  console.log(`\n━━━ SUMMARY ━━━`);
  console.log(`  ✅ Uploaded: ${uploaded}`);
  console.log(`  ❌ Failed: ${failed}`);
  console.log(`  📊 Total: ${episodes.length}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
