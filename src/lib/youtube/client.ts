import { google } from 'googleapis';
import { Readable } from 'stream';
import { sendDiscordNotification } from '@/lib/discord';

const YOUTUBE_SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube',
];

export interface YouTubeVideoMetadata {
  title: string;
  description: string;
  tags?: string[];
  categoryId?: string;
  privacyStatus?: 'private' | 'unlisted' | 'public';
  publishAt?: string; // ISO 8601 date string
  isShort?: boolean; // For YouTube Shorts
}

/**
 * Get authenticated YouTube client
 * Supports OAuth2 with refresh token
 */
function getYouTubeClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'Missing YouTube OAuth credentials. Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REFRESH_TOKEN in environment variables.',
    );
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);

  // Set credentials with refresh token
  // The OAuth2 client will automatically refresh the access token when needed
  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  });

  // Add error handler for token refresh failures
  oauth2Client.on('tokens', (tokens) => {
    if (tokens.refresh_token) {
      // If a new refresh token is provided, it should be saved
      // (though Google typically only provides this on first authorization)
      console.log('YouTube OAuth: New refresh token received');
    }
  });

  return google.youtube({
    version: 'v3',
    auth: oauth2Client,
  });
}

/**
 * Upload a video to YouTube
 */
export async function uploadVideo(
  videoBuffer: Buffer,
  metadata: YouTubeVideoMetadata,
): Promise<{ videoId: string; url: string }> {
  const youtube = getYouTubeClient();

  // Prepare video metadata
  const videoMetadata = {
    snippet: {
      title: metadata.title,
      description: metadata.description,
      tags: metadata.tags || [],
      categoryId: metadata.categoryId || '22', // People & Blogs
    },
    status: {
      privacyStatus: metadata.privacyStatus || 'private',
      publishAt: metadata.publishAt,
      selfDeclaredMadeForKids: false,
    },
  };

  // For YouTube Shorts, add #Shorts to title and description
  if (metadata.isShort) {
    videoMetadata.snippet.title = `#Shorts ${videoMetadata.snippet.title}`;
    videoMetadata.snippet.description = `#Shorts\n\n${videoMetadata.snippet.description}`;
  }

  try {
    // Convert Buffer to stream (YouTube API requires a stream)
    const videoStream = Readable.from(videoBuffer);

    // Upload video
    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: videoMetadata,
      media: {
        body: videoStream,
        mimeType: 'video/mp4',
      },
    });

    const videoId = response.data.id;
    if (!videoId) {
      throw new Error('YouTube upload succeeded but no video ID returned');
    }

    const url = `https://www.youtube.com/watch?v=${videoId}`;

    return { videoId, url };
  } catch (error: any) {
    console.error('YouTube upload error:', error);

    // Provide helpful error message for invalid_grant (expired refresh token)
    if (error.message?.includes('invalid_grant') || error.code === 400) {
      const errorMessage = `YouTube OAuth authentication failed: The refresh token has expired or is invalid. Please regenerate it by running: npx tsx scripts/regenerate-google-token.ts (make sure to use YouTube scopes: ${YOUTUBE_SCOPES.join(', ')})`;

      // Send Discord notification for urgent OAuth errors
      await sendDiscordNotification({
        category: 'urgent',
        title: '🚨 YouTube OAuth Token Expired',
        description: errorMessage,
        color: 'error',
        minPriority: 'high',
      }).catch((discordError) => {
        console.error('Failed to send Discord notification:', discordError);
      });

      throw new Error(errorMessage);
    }

    throw new Error(
      `Failed to upload video to YouTube: ${error.message || 'Unknown error'}`,
    );
  }
}

/**
 * Update video metadata (title, description, tags, etc.)
 */
export async function updateVideoMetadata(
  videoId: string,
  metadata: Partial<YouTubeVideoMetadata>,
): Promise<void> {
  const youtube = getYouTubeClient();

  try {
    // First, get existing video details
    const existingVideo = await youtube.videos.list({
      part: ['snippet', 'status'],
      id: [videoId],
    });

    if (!existingVideo.data.items || existingVideo.data.items.length === 0) {
      throw new Error(`Video ${videoId} not found`);
    }

    const existing = existingVideo.data.items[0];

    // Update with new metadata
    await youtube.videos.update({
      part: ['snippet', 'status'],
      requestBody: {
        id: videoId,
        snippet: {
          ...existing.snippet,
          title: metadata.title || existing.snippet?.title,
          description: metadata.description || existing.snippet?.description,
          tags: metadata.tags || existing.snippet?.tags,
        },
        status: {
          ...existing.status,
          privacyStatus:
            metadata.privacyStatus || existing.status?.privacyStatus,
          publishAt: metadata.publishAt || existing.status?.publishAt,
        },
      },
    });
  } catch (error: any) {
    console.error('YouTube metadata update error:', error);
    throw new Error(
      `Failed to update video metadata: ${error.message || 'Unknown error'}`,
    );
  }
}

/**
 * Schedule a video to publish at a specific time
 */
export async function scheduleVideo(
  videoId: string,
  publishDate: Date,
): Promise<void> {
  await updateVideoMetadata(videoId, {
    publishAt: publishDate.toISOString(),
    privacyStatus: 'private', // Must be private to schedule
  });
}

/**
 * Upload a YouTube Short
 */
export async function uploadShort(
  videoBuffer: Buffer,
  metadata: Omit<YouTubeVideoMetadata, 'isShort'>,
): Promise<{ videoId: string; url: string }> {
  return uploadVideo(videoBuffer, {
    ...metadata,
    isShort: true,
  });
}

/**
 * Upload a long-form YouTube video
 */
export async function uploadLongForm(
  videoBuffer: Buffer,
  metadata: Omit<YouTubeVideoMetadata, 'isShort'>,
): Promise<{ videoId: string; url: string }> {
  return uploadVideo(videoBuffer, {
    ...metadata,
    isShort: false,
  });
}
