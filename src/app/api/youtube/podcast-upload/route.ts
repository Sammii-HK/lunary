import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { put } from '@vercel/blob';
import {
  uploadLongForm,
  uploadCaptions,
  addVideoToPlaylist,
} from '@/lib/youtube/client';
import {
  renderRemotionVideo,
  scriptToAudioSegments,
} from '@/lib/video/remotion-renderer';
import { buildPodcastYouTubeMetadata } from '@/lib/youtube/metadata';
import { logActivity } from '@/lib/admin-activity';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes — Remotion rendering takes time

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

    // Build full script text from transcript
    const transcript = episode.transcript as
      | { speaker: string; text: string }[]
      | null;

    if (!transcript || transcript.length === 0) {
      return NextResponse.json(
        {
          error: `Episode ${episode.episodeNumber} has no transcript — cannot render video`,
        },
        { status: 400 },
      );
    }

    const scriptText = transcript
      .map(
        (line) => `${line.speaker === 'HOST_A' ? 'Luna' : 'Sol'}: ${line.text}`,
      )
      .join('\n');

    // Convert to audio segments for Remotion subtitles
    const segments = scriptToAudioSegments(
      scriptText,
      episode.durationSecs,
      2.5,
    );

    // Build topic images from grimoire slugs for LongFormVideo topic cards
    const images = episode.grimoireSlugs.map((slug, i) => {
      const totalSlugs = episode.grimoireSlugs.length;
      const segmentDuration = episode.durationSecs / Math.max(totalSlugs, 1);
      return {
        url: `https://lunary.app/api/og/grimoire/${slug}`,
        startTime: i * segmentDuration,
        endTime: (i + 1) * segmentDuration,
        topic: slug
          .split('/')
          .pop()!
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      };
    });

    // Render video via Remotion
    console.log(
      `🎥 Rendering LongFormVideo (${episode.durationSecs}s) via Remotion...`,
    );
    const videoBuffer = await renderRemotionVideo({
      format: 'LongFormVideo',
      outputPath: '',
      audioUrl: episode.audioUrl,
      segments,
      durationSeconds: episode.durationSecs + 2,
      title: episode.title,
      subtitle: `Episode ${episode.episodeNumber}`,
      images: images.length > 0 ? images : undefined,
      highlightTerms: episode.grimoireSlugs.map((s) =>
        s
          .split('/')
          .pop()!
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
      ),
      lowerThirdInfo: {
        title: 'The Grimoire by Lunary',
        subtitle: 'Weekly Astrology Podcast',
      },
      seed: `podcast-ep-${episode.episodeNumber}`,
      symbolContent: scriptText.slice(0, 500),
    });

    console.log(
      `✅ Video rendered: ${(videoBuffer.length / 1024 / 1024).toFixed(1)} MB`,
    );

    // Upload rendered video to Vercel Blob
    const blobResult = await put(
      `podcast/videos/episode-${episode.episodeNumber}.mp4`,
      videoBuffer,
      {
        access: 'public',
        contentType: 'video/mp4',
      },
    );
    console.log(`☁️ Video uploaded to blob: ${blobResult.url}`);

    // Build YouTube metadata
    const metadata = buildPodcastYouTubeMetadata({
      episodeNumber: episode.episodeNumber,
      title: episode.title,
      description: episode.description,
      slug: episode.slug,
      grimoireSlugs: episode.grimoireSlugs,
      transcript,
      durationSecs: episode.durationSecs,
    });

    // Upload to YouTube
    console.log(`📤 Uploading to YouTube...`);
    const ytResult = await uploadLongForm(videoBuffer, {
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags,
      privacyStatus: 'public',
      categoryId: '22', // People & Blogs
    });
    console.log(`✅ YouTube upload complete: ${ytResult.videoId}`);

    // Upload captions for SEO
    try {
      await uploadCaptions(ytResult.videoId, scriptText);
      console.log(`📝 Captions uploaded for ${ytResult.videoId}`);
    } catch (captionError) {
      console.warn('⚠️ Caption upload failed (non-fatal):', captionError);
    }

    // Add to podcast playlist
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

    // Update database
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
