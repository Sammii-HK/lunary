import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sanitizeForLog as sanitize } from '@/lib/security/log-sanitize';
import { postToSocial } from '@/lib/social/client';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface PostToPlatformsRequest {
  videoId: string;
  platforms?: ('tiktok' | 'instagram' | 'youtube')[];
}

interface PlatformResult {
  success: boolean;
  error?: string;
}

function sanitizeForLog(value: unknown, maxLength = 200) {
  const sanitized = sanitize(value);
  return sanitized.length > maxLength
    ? `${sanitized.slice(0, maxLength)}…`
    : sanitized;
}

export async function POST(request: NextRequest) {
  try {
    let body: PostToPlatformsRequest;
    try {
      body = (await request.json()) as PostToPlatformsRequest;
    } catch (parseError) {
      console.error(
        'Invalid JSON body for video post-to-platforms:',
        parseError,
      );
      return NextResponse.json(
        { error: 'Invalid request body; expected JSON' },
        { status: 400 },
      );
    }

    const { videoId, platforms = ['tiktok', 'instagram', 'youtube'] } = body;
    const sanitizedVideoId = sanitizeForLog(videoId);

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId is required' },
        { status: 400 },
      );
    }

    // Look up video from database
    const videoResult = await sql`
      SELECT * FROM videos WHERE id = ${videoId}
    `;

    if (videoResult.rows.length === 0) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const video = videoResult.rows[0];
    const videoUrl = video.video_url;
    const title = video.title || 'Weekly Cosmic Forecast';
    const description =
      video.post_content ||
      video.description ||
      'Your cosmic forecast from Lunary';
    const postContent =
      video.post_content ||
      `${title}\n\n${description}\n\n#astrology #cosmicforecast #lunary`;
    const videoType = video.type as 'short' | 'medium' | 'long';

    const results: {
      tiktok?: PlatformResult;
      instagram?: PlatformResult;
      youtube?: PlatformResult;
    } = {};

    const dateStr = new Date().toISOString().split('T')[0];
    const now = new Date();
    const scheduledDate = new Date(now);
    scheduledDate.setHours(21, 30, 0, 0);
    if (scheduledDate < now) {
      scheduledDate.setDate(scheduledDate.getDate() + 1);
    }
    const scheduledDateIso = scheduledDate.toISOString();

    // Post to TikTok
    if (platforms.includes('tiktok')) {
      try {
        const result = await postToSocial({
          platform: 'tiktok',
          content: postContent,
          scheduledDate: scheduledDateIso,
          media: [{ type: 'video', url: videoUrl, alt: title }],
        });
        results.tiktok = { success: result.success, error: result.error };
        if (result.success) {
          console.log(`✅ Posted video ${sanitizedVideoId} to TikTok`);
        } else {
          console.error(`❌ Failed to post to TikTok: ${result.error}`);
        }
      } catch (error) {
        results.tiktok = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Post to Instagram Reels/Stories
    if (platforms.includes('instagram')) {
      try {
        const result = await postToSocial({
          platform: 'instagram',
          content: postContent,
          scheduledDate: scheduledDateIso,
          media: [{ type: 'video', url: videoUrl, alt: title }],
          platformSettings:
            videoType === 'short'
              ? { stories: true }
              : { type: 'reel' as const },
        });
        results.instagram = { success: result.success, error: result.error };
        if (result.success) {
          console.log(
            `✅ Posted video ${sanitizedVideoId} to Instagram ${videoType === 'short' ? 'Stories' : 'Reels'}`,
          );
        } else {
          console.error(`❌ Failed to post to Instagram: ${result.error}`);
        }
      } catch (error) {
        results.instagram = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Upload to YouTube via direct API
    if (platforms.includes('youtube')) {
      try {
        const result = await postToSocial({
          platform: 'youtube',
          content: postContent,
          scheduledDate: scheduledDateIso,
          media: [{ type: 'video', url: videoUrl, alt: title }],
          youtubeOptions: {
            title,
            visibility: 'public',
            isShort: videoType !== 'long',
            madeForKids: false,
            playlistId:
              videoType === 'short'
                ? process.env.YOUTUBE_SHORTS_PLAYLIST_ID
                : videoType === 'long'
                  ? process.env.YOUTUBE_LONG_FORM_PLAYLIST_ID
                  : process.env.YOUTUBE_WEEKLY_SERIES_PLAYLIST_ID,
          },
        });
        results.youtube = { success: result.success, error: result.error };
        if (result.success) {
          console.log(`✅ Posted video ${sanitizedVideoId} to YouTube`);
          if (videoType === 'long') {
            await sql`
              UPDATE videos SET status = 'uploaded' WHERE id = ${videoId}
            `;
          }
        } else {
          console.error(`❌ Failed to post to YouTube: ${result.error}`);
        }
      } catch (error) {
        results.youtube = {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    // Check if any platform succeeded
    const anySuccess = Object.values(results).some((r) => r?.success);

    // Update video status if any platform succeeded
    if (anySuccess) {
      try {
        await sql`
          UPDATE videos
          SET status = 'scheduled'
          WHERE id = ${videoId}
        `;
        console.log(
          `✅ Updated video ${sanitizedVideoId} status to 'scheduled'`,
        );
      } catch (updateError) {
        console.error('Failed to update video status:', updateError);
      }
    }

    return NextResponse.json({
      success: anySuccess,
      results,
      video: {
        id: videoId,
        type: videoType,
        title,
      },
    });
  } catch (error) {
    console.error('Error posting to platforms:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 },
    );
  }
}
