import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

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

export async function POST(request: NextRequest) {
  try {
    const body: PostToPlatformsRequest = await request.json();
    const { videoId, platforms = ['tiktok', 'instagram', 'youtube'] } = body;

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
    const description = video.description || 'Your cosmic forecast from Lunary';
    const postContent =
      video.post_content ||
      `${title}\n\n${description}\n\n#astrology #cosmicforecast #lunary`;
    const videoType = video.type as 'short' | 'medium' | 'long';

    const results: {
      tiktok?: PlatformResult;
      instagram?: PlatformResult;
      youtube?: PlatformResult;
    } = {};

    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;
    const succulentApiUrl = 'https://app.succulent.social/api/posts';

    // Post to TikTok
    if (platforms.includes('tiktok')) {
      if (!apiKey || !accountGroupId) {
        results.tiktok = {
          success: false,
          error: 'Succulent API not configured',
        };
      } else {
        try {
          const tiktokPost = {
            accountGroupId,
            content: postContent,
            mediaUrls: [videoUrl],
            platforms: ['tiktok'],
          };

          const response = await fetch(succulentApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
            },
            body: JSON.stringify(tiktokPost),
          });

          if (response.ok) {
            results.tiktok = { success: true };
            console.log(`✅ Posted video ${videoId} to TikTok`);
          } else {
            const error = await response.text();
            results.tiktok = {
              success: false,
              error: `${response.status}: ${error}`,
            };
            console.error(`❌ Failed to post to TikTok: ${error}`);
          }
        } catch (error) {
          results.tiktok = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }
    }

    // Post to Instagram Reels
    if (platforms.includes('instagram')) {
      if (!apiKey || !accountGroupId) {
        results.instagram = {
          success: false,
          error: 'Succulent API not configured',
        };
      } else {
        try {
          const instagramPost = {
            accountGroupId,
            content: postContent,
            mediaUrls: [videoUrl],
            platforms: ['instagram'],
            // For short form, use stories; for medium/long, use reels
            instagramOptions:
              videoType === 'short' ? { stories: true } : { reels: true },
          };

          const response = await fetch(succulentApiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': apiKey,
            },
            body: JSON.stringify(instagramPost),
          });

          if (response.ok) {
            results.instagram = { success: true };
            console.log(
              `✅ Posted video ${videoId} to Instagram ${videoType === 'short' ? 'Stories' : 'Reels'}`,
            );
          } else {
            const error = await response.text();
            results.instagram = {
              success: false,
              error: `${response.status}: ${error}`,
            };
            console.error(`❌ Failed to post to Instagram: ${error}`);
          }
        } catch (error) {
          results.instagram = {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
          };
        }
      }
    }

    // Upload to YouTube
    if (platforms.includes('youtube')) {
      try {
        const baseUrl =
          process.env.NODE_ENV === 'production'
            ? 'https://lunary.app'
            : `${request.nextUrl.protocol}//${request.nextUrl.host}`;

        const youtubeResponse = await fetch(`${baseUrl}/api/youtube/upload`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            videoUrl,
            videoId,
            title,
            description,
            type: videoType === 'long' ? 'long' : 'short', // medium goes to Shorts
          }),
        });

        if (youtubeResponse.ok) {
          results.youtube = { success: true };
          console.log(`✅ Uploaded video ${videoId} to YouTube`);

          // Update video status to uploaded
          await sql`
            UPDATE videos SET status = 'uploaded' WHERE id = ${videoId}
          `;
        } else {
          const error = await youtubeResponse.text();
          results.youtube = {
            success: false,
            error: `${youtubeResponse.status}: ${error}`,
          };
          console.error(`❌ Failed to upload to YouTube: ${error}`);
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
