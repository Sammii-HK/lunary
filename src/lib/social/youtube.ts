/**
 * YouTube direct API wrapper for the social posting client
 *
 * Thin layer that accepts the social client's payload shape and delegates
 * to the existing YouTube client functions in src/lib/youtube/client.ts
 */

import {
  uploadShort,
  uploadLongForm,
  uploadCaptions,
  addVideoToPlaylist,
} from '@/lib/youtube/client';
import type { YouTubeVideoMetadata } from '@/lib/youtube/client';

export interface YouTubePostParams {
  content: string;
  media: Array<{ type: 'image' | 'video'; url: string; alt?: string }>;
  youtubeOptions?: {
    title: string;
    visibility?: string;
    isShort?: boolean;
    madeForKids?: boolean;
    playlistId?: string;
    categoryId?: string;
    tags?: string[];
  };
  scheduledDate?: string;
  transcript?: string;
}

export interface YouTubePostResult {
  success: boolean;
  videoId?: string;
  url?: string;
  error?: string;
}

/**
 * Download a video from a URL and return it as a Buffer
 */
async function downloadVideoBuffer(videoUrl: string): Promise<Buffer> {
  const { validateFetchUrl } = await import('@/lib/utils');
  const safeUrl = validateFetchUrl(videoUrl);
  const response = await fetch(safeUrl);
  if (!response.ok) {
    throw new Error(
      `Failed to download video: ${response.status} ${response.statusText}`,
    );
  }
  return Buffer.from(await response.arrayBuffer());
}

/**
 * Post a video to YouTube via direct API
 *
 * Handles the full flow:
 * 1. Download video from URL
 * 2. Upload via uploadVideo/uploadShort/uploadLongForm
 * 3. Add to playlist if specified
 * 4. Upload captions if transcript available
 */
export async function postToYouTube(
  params: YouTubePostParams,
): Promise<YouTubePostResult> {
  const videoMedia = params.media.find((m) => m.type === 'video');
  if (!videoMedia) {
    return {
      success: false,
      error: 'No video media found in payload. YouTube requires video content.',
    };
  }

  const options = params.youtubeOptions;
  if (!options) {
    return {
      success: false,
      error:
        'Missing youtubeOptions. Title and visibility settings are required.',
    };
  }

  try {
    // 1. Download the video
    console.log(`📥 Downloading video for YouTube upload: ${videoMedia.url}`);
    const videoBuffer = await downloadVideoBuffer(videoMedia.url);
    console.log(
      `   Downloaded ${(videoBuffer.length / 1024 / 1024).toFixed(1)}MB`,
    );

    // 2. Build metadata
    // YouTube requires privacyStatus=private when using publishAt for scheduling
    const isFutureSchedule =
      params.scheduledDate && new Date(params.scheduledDate) > new Date();
    const metadata: YouTubeVideoMetadata = {
      title: options.title,
      description: params.content,
      tags: options.tags || [],
      categoryId: options.categoryId || '22', // People & Blogs
      privacyStatus: isFutureSchedule
        ? 'private'
        : (options.visibility as 'private' | 'unlisted' | 'public') || 'public',
      publishAt: isFutureSchedule ? params.scheduledDate : undefined,
      isShort: options.isShort,
    };

    // 3. Upload video
    let result: { videoId: string; url: string };

    if (options.isShort) {
      console.log(`📤 Uploading YouTube Short: "${options.title}"`);
      result = await uploadShort(videoBuffer, metadata);
    } else {
      console.log(`📤 Uploading YouTube long-form: "${options.title}"`);
      result = await uploadLongForm(videoBuffer, metadata);
    }

    console.log(`✅ YouTube upload complete: ${result.url}`);

    // 4. Add to playlist if specified
    if (options.playlistId) {
      try {
        await addVideoToPlaylist(result.videoId, options.playlistId);
        console.log(`📋 Added to playlist: ${options.playlistId}`);
      } catch (playlistError) {
        console.warn(
          `⚠️ Failed to add to playlist (non-fatal):`,
          playlistError,
        );
      }
    }

    // 5. Upload captions if transcript available
    if (params.transcript) {
      try {
        await uploadCaptions(result.videoId, params.transcript);
        console.log(`📝 Captions uploaded`);
      } catch (captionError) {
        console.warn(`⚠️ Caption upload failed (non-fatal):`, captionError);
      }
    }

    return {
      success: true,
      videoId: result.videoId,
      url: result.url,
    };
  } catch (error) {
    console.error('YouTube post error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown YouTube error',
    };
  }
}
