/**
 * Postiz API client for social media posting
 *
 * Handles all non-YouTube platforms via self-hosted Postiz instance.
 * API docs: Postiz uses a REST API at {POSTIZ_URL}/public/v1
 *
 * 2-step video upload flow:
 *   1. POST /upload-from-url → { id, path }
 *   2. Reference { id, path } in post payload
 */

const POSTIZ_RATE_LIMIT = 30; // requests per hour
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

let rateLimitCounter = 0;
let rateLimitWindowStart = Date.now();

function checkRateLimit(): void {
  const now = Date.now();
  if (now - rateLimitWindowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitCounter = 0;
    rateLimitWindowStart = now;
  }
  if (rateLimitCounter >= POSTIZ_RATE_LIMIT) {
    throw new Error(
      `Postiz rate limit exceeded (${POSTIZ_RATE_LIMIT} requests/hour). Try again later.`,
    );
  }
  rateLimitCounter++;
}

function getPostizConfig() {
  const url = process.env.POSTIZ_URL;
  const apiKey = process.env.POSTIZ_API_KEY;
  if (!url || !apiKey) {
    throw new Error(
      'Postiz not configured. Set POSTIZ_URL and POSTIZ_API_KEY environment variables.',
    );
  }
  return { url: url.replace(/\/$/, ''), apiKey };
}

function getIntegrationId(platform: string): string {
  const envMap: Record<string, string> = {
    x: 'POSTIZ_X_INTEGRATION_ID',
    twitter: 'POSTIZ_X_INTEGRATION_ID',
    instagram: 'POSTIZ_INSTAGRAM_INTEGRATION_ID',
    tiktok: 'POSTIZ_TIKTOK_INTEGRATION_ID',
    bluesky: 'POSTIZ_BLUESKY_INTEGRATION_ID',
    threads: 'POSTIZ_THREADS_INTEGRATION_ID',
    pinterest: 'POSTIZ_PINTEREST_INTEGRATION_ID',
    reddit: 'POSTIZ_REDDIT_INTEGRATION_ID',
    linkedin: 'POSTIZ_LINKEDIN_INTEGRATION_ID',
    facebook: 'POSTIZ_FACEBOOK_INTEGRATION_ID',
  };

  const envVar = envMap[platform.toLowerCase()];
  if (!envVar) {
    throw new Error(`No Postiz integration mapping for platform: ${platform}`);
  }

  const integrationId = process.env[envVar];
  if (!integrationId) {
    throw new Error(
      `Postiz integration ID not configured. Set ${envVar} environment variable.`,
    );
  }

  return integrationId;
}

export interface PostizMediaItem {
  id: string;
  path: string;
}

export interface PostizPostParams {
  platform: string;
  content: string;
  scheduledDate: string;
  media?: Array<{ type: 'image' | 'video'; url: string; alt?: string }>;
  platformSettings?: Record<string, unknown>;
}

export interface PostizResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Upload media from a URL to Postiz
 * Returns { id, path } to reference in the post payload
 */
async function uploadMediaFromUrl(mediaUrl: string): Promise<PostizMediaItem> {
  const { url, apiKey } = getPostizConfig();
  checkRateLimit();

  const response = await fetch(`${url}/public/v1/upload-from-url`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify({ url: mediaUrl }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Postiz media upload failed (${response.status}): ${errorText}`,
    );
  }

  const data = await response.json();
  return { id: data.id, path: data.path };
}

/**
 * Build platform-specific settings for Postiz
 */
function buildPlatformSettings(
  platform: string,
  settings?: Record<string, unknown>,
): Record<string, unknown> {
  const baseSettings: Record<string, unknown> = {
    __type: platform.toLowerCase(),
  };

  if (settings) {
    Object.assign(baseSettings, settings);
  }

  return baseSettings;
}

/**
 * Post to a social platform via Postiz API
 */
export async function postToPostiz(
  params: PostizPostParams,
): Promise<PostizResult> {
  const { url, apiKey } = getPostizConfig();
  checkRateLimit();

  const integrationId = getIntegrationId(params.platform);

  // Upload media if present
  let mediaItems: PostizMediaItem[] = [];
  if (params.media && params.media.length > 0) {
    for (const item of params.media) {
      try {
        const uploaded = await uploadMediaFromUrl(item.url);
        mediaItems.push(uploaded);
      } catch (error) {
        console.error(
          `Failed to upload media to Postiz: ${error instanceof Error ? error.message : error}`,
        );
      }
    }
  }

  const postPayload = {
    type: 'schedule' as const,
    date: params.scheduledDate,
    posts: [
      {
        integration: { id: integrationId },
        value: [
          {
            content: params.content,
            ...(mediaItems.length > 0
              ? { image: mediaItems.map((m) => ({ id: m.id, path: m.path })) }
              : {}),
          },
        ],
        settings: buildPlatformSettings(
          params.platform,
          params.platformSettings,
        ),
      },
    ],
  };

  const response = await fetch(`${url}/public/v1/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: apiKey,
    },
    body: JSON.stringify(postPayload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`Postiz API error (${response.status}):`, errorText);
    return {
      success: false,
      error: `Postiz API error (${response.status}): ${errorText}`,
    };
  }

  const data = await response.json();
  return {
    success: true,
    postId: data.id || data.postId,
  };
}

/**
 * Post to multiple platforms via Postiz in a single request
 * Each platform gets its own integration and optional variant content
 */
export async function postToPostizMultiPlatform(params: {
  platforms: string[];
  content: string;
  scheduledDate: string;
  media?: Array<{ type: 'image' | 'video'; url: string; alt?: string }>;
  variants?: Record<
    string,
    { content: string; media?: string[] | null; noImage?: boolean }
  >;
  platformSettings?: Record<string, Record<string, unknown>>;
}): Promise<{ results: Record<string, PostizResult> }> {
  const results: Record<string, PostizResult> = {};

  // Filter out YouTube — it's handled by the direct API
  const postizPlatforms = params.platforms.filter(
    (p) => p.toLowerCase() !== 'youtube',
  );

  for (const platform of postizPlatforms) {
    const variant = params.variants?.[platform];
    const platformContent = variant?.content || params.content;

    // Handle media variants
    let platformMedia = params.media;
    if (variant?.noImage) {
      platformMedia = [];
    } else if (variant?.media === null) {
      platformMedia = [];
    } else if (variant?.media && variant.media.length > 0) {
      platformMedia = variant.media.map((url) => ({
        type: 'image' as const,
        url,
        alt: 'Media',
      }));
    }

    try {
      results[platform] = await postToPostiz({
        platform,
        content: platformContent,
        scheduledDate: params.scheduledDate,
        media: platformMedia,
        platformSettings: params.platformSettings?.[platform],
      });
    } catch (error) {
      results[platform] = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  return { results };
}
