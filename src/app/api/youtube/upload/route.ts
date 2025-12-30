import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  uploadShort,
  uploadLongForm,
  scheduleVideo,
  uploadCaptions,
  addVideoToPlaylist,
  type YouTubeVideoMetadata,
} from '@/lib/youtube/client';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for video upload

interface UploadVideoRequest {
  videoUrl: string;
  videoId?: string; // Database video ID
  title: string;
  description: string;
  type: 'short' | 'long';
  tags?: string[];
  publishDate?: string; // ISO 8601 date string
  script?: string; // Optional script for captions
}

export async function POST(request: NextRequest) {
  let body: UploadVideoRequest | null = null;
  try {
    body = await request.json();
    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }
    const {
      videoUrl,
      videoId,
      title,
      description,
      type,
      tags,
      publishDate,
      script,
    } = body;

    if (!videoUrl || !title || !description || !type) {
      return NextResponse.json(
        {
          error: 'Missing required fields: videoUrl, title, description, type',
        },
        { status: 400 },
      );
    }

    // Download video from Vercel Blob
    console.log(`📥 Downloading video from: ${videoUrl}`);
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(
        `Failed to download video: ${videoResponse.status} ${videoResponse.statusText}`,
      );
    }

    const videoBuffer = Buffer.from(await videoResponse.arrayBuffer());
    console.log(`✅ Video downloaded: ${videoBuffer.length} bytes`);

    // Prepare metadata
    const metadata: YouTubeVideoMetadata = {
      title,
      description,
      tags: tags || [],
      privacyStatus: publishDate ? 'private' : 'public', // Private if scheduling
      publishAt: publishDate,
    };

    // Upload to YouTube
    console.log(`📤 Uploading ${type} video to YouTube...`);
    let result;
    if (type === 'short') {
      result = await uploadShort(videoBuffer, metadata);
    } else {
      result = await uploadLongForm(videoBuffer, metadata);
    }

    console.log(`✅ Video uploaded to YouTube: ${result.videoId}`);

    // Upload captions if script is available
    if (script || videoId) {
      try {
        let scriptForCaptions = script?.trim() || '';

        if (!scriptForCaptions && videoId) {
          const videoResult = await sql`
            SELECT script FROM videos WHERE id = ${videoId}
          `;
          if (videoResult.rows.length > 0 && videoResult.rows[0].script) {
            scriptForCaptions = videoResult.rows[0].script;
          }
        }

        if (scriptForCaptions) {
          console.log(`📝 Uploading captions for video ${result.videoId}...`);
          await uploadCaptions(result.videoId, scriptForCaptions);
          console.log(`✅ Captions uploaded for video ${result.videoId}`);
        } else if (videoId) {
          console.log(
            `ℹ️ No script found for video ${videoId}, skipping captions`,
          );
        }
      } catch (captionError) {
        console.warn('⚠️ Failed to upload captions:', captionError);
        // Don't fail the upload if captions fail
      }
    }

    // If scheduled, update the video to be scheduled
    if (publishDate) {
      await scheduleVideo(result.videoId, new Date(publishDate));
      console.log(`📅 Video scheduled for: ${publishDate}`);
    }

    // Add video to appropriate playlist
    try {
      if (type === 'short') {
        // Short and medium-form videos go to Shorts playlist
        const shortsPlaylistId =
          process.env.YOUTUBE_SHORTS_PLAYLIST_ID ||
          process.env.YOUTUBE_WEEKLY_SERIES_PLAYLIST_ID;
        if (shortsPlaylistId) {
          console.log(
            `📋 Adding ${type} video to Shorts playlist: ${shortsPlaylistId}`,
          );
          await addVideoToPlaylist(result.videoId, shortsPlaylistId);
        } else {
          console.warn(
            '⚠️ YOUTUBE_SHORTS_PLAYLIST_ID not set, skipping playlist addition',
          );
        }
      } else {
        // Long-form videos go to weekly series playlist if set, otherwise long-form playlist
        const longFormPlaylistId =
          process.env.YOUTUBE_WEEKLY_SERIES_PLAYLIST_ID ||
          process.env.YOUTUBE_LONG_FORM_PLAYLIST_ID;
        if (longFormPlaylistId) {
          console.log(
            `📋 Adding ${type} video to long-form playlist: ${longFormPlaylistId}`,
          );
          await addVideoToPlaylist(result.videoId, longFormPlaylistId);
        } else {
          console.warn(
            '⚠️ YOUTUBE_LONG_FORM_PLAYLIST_ID not set, skipping playlist addition',
          );
        }
      }
    } catch (playlistError) {
      console.warn('⚠️ Failed to add video to playlist:', playlistError);
      // Don't fail the upload if playlist addition fails
    }

    // Update database record if videoId provided
    if (videoId) {
      await sql`
        UPDATE videos
        SET
          youtube_video_id = ${result.videoId},
          status = 'uploaded',
          updated_at = NOW()
        WHERE id = ${videoId}
      `;
      console.log(`✅ Database record updated for video: ${videoId}`);
    }

    return NextResponse.json({
      success: true,
      videoId: result.videoId,
      url: result.url,
      scheduled: !!publishDate,
    });
  } catch (error) {
    console.error('YouTube upload error:', error);

    // Update database status to 'failed' if videoId provided
    if (body?.videoId) {
      try {
        await sql`
          UPDATE videos
          SET status = 'failed'
          WHERE id = ${body.videoId}
        `;
      } catch (dbError) {
        console.error('Failed to update database status:', dbError);
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to upload video to YouTube',
        message:
          error instanceof Error ? error.message : 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
