import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import {
  uploadLongForm,
  uploadCaptions,
  addVideoToPlaylist,
} from '@/lib/youtube/client';
import { buildPodcastYouTubeMetadata } from '@/lib/youtube/metadata';
import { logActivity } from '@/lib/admin-activity';
import { getFfmpegPath } from '@/lib/video/compose-video';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile, readFile, mkdtemp, rm } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';

export const runtime = 'nodejs';
export const maxDuration = 300;

const COVER_IMAGE_URL =
  process.env.NEXT_PUBLIC_APP_URL + '/api/og/podcast-cover';

/**
 * Compose a simple podcast video: static cover image + audio → MP4
 * This is the standard approach for podcast YouTube uploads.
 */
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
          // Scale cover to 1920x1080 (YouTube landscape), pad if needed
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

interface PodcastUploadRequest {
  episodeId?: string;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: PodcastUploadRequest = await request.json().catch(() => ({}));

    // Find episode: use provided ID or latest without YouTube upload
    const episode = body.episodeId
      ? await prisma.podcastEpisode.findUnique({
          where: { id: body.episodeId },
        })
      : await prisma.podcastEpisode.findFirst({
          where: {
            status: 'published',
            youtubeVideoId: null,
          },
          orderBy: { publishedAt: 'desc' },
        });

    if (!episode) {
      return NextResponse.json(
        { error: 'No eligible podcast episode found' },
        { status: 404 },
      );
    }

    // Idempotent: skip if already uploaded
    if (episode.youtubeVideoId) {
      return NextResponse.json({
        success: true,
        skipped: true,
        message: `Episode ${episode.episodeNumber} already has YouTube video: ${episode.youtubeVideoId}`,
        videoId: episode.youtubeVideoId,
        videoUrl: episode.youtubeVideoUrl,
      });
    }

    console.log(
      `🎬 Starting YouTube pipeline for Episode ${episode.episodeNumber}: ${episode.title}`,
    );

    // 1. Fetch podcast cover image and audio in parallel
    console.log(`🖼️ Fetching cover image and audio...`);
    const [coverResponse, audioResponse] = await Promise.all([
      fetch(COVER_IMAGE_URL),
      fetch(episode.audioUrl),
    ]);

    if (!coverResponse.ok) {
      throw new Error(`Failed to fetch podcast cover: ${coverResponse.status}`);
    }
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch podcast audio: ${audioResponse.status}`);
    }

    const coverImage = Buffer.from(await coverResponse.arrayBuffer());
    const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());

    console.log(
      `✅ Assets ready: cover ${(coverImage.length / 1024).toFixed(0)}KB, audio ${(audioBuffer.length / 1024 / 1024).toFixed(1)}MB`,
    );

    // 2. Compose video: static cover + audio → MP4
    console.log(`🎥 Composing video (static cover + audio)...`);
    const videoBuffer = await composePodcastVideo(coverImage, audioBuffer);
    console.log(
      `✅ Video composed: ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB`,
    );

    // 3. Upload to Vercel Blob
    const blobResult = await put(
      `podcast/videos/episode-${episode.episodeNumber}.mp4`,
      videoBuffer,
      {
        access: 'public',
        contentType: 'video/mp4',
      },
    );
    console.log(`☁️ Video uploaded to blob: ${blobResult.url}`);

    // 4. Build YouTube metadata
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

    // 5. Upload to YouTube
    console.log(`📤 Uploading to YouTube...`);
    const ytResult = await uploadLongForm(videoBuffer, {
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      privacyStatus: 'public',
      categoryId: '22', // People & Blogs
    });
    console.log(`✅ YouTube upload complete: ${ytResult.videoId}`);

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
        console.log(`📝 Captions uploaded for ${ytResult.videoId}`);
      } catch (captionError) {
        console.warn('⚠️ Caption upload failed (non-fatal):', captionError);
      }
    }

    // 7. Add to podcast playlist
    const playlistId =
      process.env.YOUTUBE_PODCAST_PLAYLIST_ID ||
      process.env.YOUTUBE_LONG_FORM_PLAYLIST_ID;
    if (playlistId) {
      try {
        await addVideoToPlaylist(ytResult.videoId, playlistId);
        console.log(`📋 Video added to playlist: ${playlistId}`);
      } catch (playlistError) {
        console.warn('⚠️ Playlist add failed (non-fatal):', playlistError);
      }
    }

    // 8. Update database
    await prisma.podcastEpisode.update({
      where: { id: episode.id },
      data: {
        youtubeVideoId: ytResult.videoId,
        youtubeVideoUrl: ytResult.url,
        videoUrl: blobResult.url,
      },
    });
    console.log(`💾 Database updated for Episode ${episode.episodeNumber}`);

    const executionTime = Date.now() - startTime;

    await logActivity({
      activityType: 'content_creation',
      activityCategory: 'content',
      status: 'success',
      message: `Podcast Episode ${episode.episodeNumber} uploaded to YouTube: ${ytResult.videoId}`,
      metadata: {
        episodeNumber: episode.episodeNumber,
        youtubeVideoId: ytResult.videoId,
        youtubeUrl: ytResult.url,
        blobUrl: blobResult.url,
        videoSizeMB: (videoBuffer.length / 1024 / 1024).toFixed(1),
      },
      executionTimeMs: executionTime,
    });

    return NextResponse.json({
      success: true,
      episodeNumber: episode.episodeNumber,
      title: episode.title,
      videoId: ytResult.videoId,
      youtubeUrl: ytResult.url,
      blobUrl: blobResult.url,
      executionTimeMs: executionTime,
    });
  } catch (error) {
    const executionTime = Date.now() - startTime;
    console.error('❌ Podcast YouTube upload failed:', error);

    await logActivity({
      activityType: 'content_creation',
      activityCategory: 'content',
      status: 'failed',
      message: 'Podcast YouTube upload failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      executionTimeMs: executionTime,
    });

    return NextResponse.json(
      {
        error: 'Failed to upload podcast to YouTube',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
