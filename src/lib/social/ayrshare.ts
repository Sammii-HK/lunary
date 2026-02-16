/**
 * Ayrshare API client for social media posting
 *
 * Handles all non-YouTube platforms via Ayrshare's REST API.
 * API: POST https://api.ayrshare.com/api/post
 *
 * Supports scheduling, per-platform content variants, and platform-specific options.
 */

const AYRSHARE_API_URL = 'https://api.ayrshare.com/api';

function getAyrshareConfig() {
  const apiKey = process.env.AYRSHARE_API_KEY;
  if (!apiKey) {
    throw new Error(
      'Ayrshare not configured. Set AYRSHARE_API_KEY environment variable.',
    );
  }
  const profileKey = process.env.AYRSHARE_PROFILE_KEY;
  return { apiKey, profileKey };
}

function getAyrshareHeaders() {
  const { apiKey, profileKey } = getAyrshareConfig();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  };
  if (profileKey) {
    headers['Profile-Key'] = profileKey;
  }
  return headers;
}

/** Map our platform names to Ayrshare platform names */
function toAyrsharePlatform(platform: string): string {
  const map: Record<string, string> = {
    x: 'twitter',
    twitter: 'twitter',
    instagram: 'instagram',
    facebook: 'facebook',
    linkedin: 'linkedin',
    tiktok: 'tiktok',
    pinterest: 'pinterest',
    reddit: 'reddit',
    bluesky: 'bluesky',
    threads: 'threads',
  };
  return map[platform.toLowerCase()] || platform.toLowerCase();
}

export interface AyrsharePostParams {
  platform: string;
  content: string;
  scheduledDate: string;
  media?: Array<{ type: 'image' | 'video'; url: string; alt?: string }>;
  platformSettings?: Record<string, unknown>;
}

export interface AyrshareResult {
  success: boolean;
  postId?: string;
  error?: string;
}

/**
 * Build platform-specific options from our generic platformSettings
 */
function buildPlatformOptions(
  platform: string,
  settings?: Record<string, unknown>,
): Record<string, unknown> {
  const options: Record<string, unknown> = {};

  if (!settings) return options;

  const p = platform.toLowerCase();

  if (p === 'instagram' || p === 'instagram') {
    const igOptions: Record<string, unknown> = {};
    if (settings.instagramOptions) {
      const ig = settings.instagramOptions as Record<string, unknown>;
      if (ig.isStory || ig.type === 'story') igOptions.stories = true;
      if (ig.coverUrl) igOptions.thumbNail = ig.coverUrl;
    }
    if (settings.type === 'story') igOptions.stories = true;
    if (settings.type === 'reel') igOptions.shareReelsFeed = true;
    if (Object.keys(igOptions).length > 0) options.instagramOptions = igOptions;
  }

  if (p === 'tiktok') {
    const ttOptions: Record<string, unknown> = {};
    if (settings.tiktokOptions) {
      const tt = settings.tiktokOptions as Record<string, unknown>;
      if (tt.autoAddMusic) ttOptions.autoAddMusic = true;
      if (tt.coverUrl) ttOptions.thumbNail = tt.coverUrl;
    }
    if (Object.keys(ttOptions).length > 0) options.tikTokOptions = ttOptions;
  }

  if (p === 'pinterest') {
    const pinOptions: Record<string, unknown> = {};
    if (settings.pinterestOptions) {
      const pin = settings.pinterestOptions as Record<string, unknown>;
      if (pin.boardId) pinOptions.boardId = pin.boardId;
      if (pin.boardName) pinOptions.title = pin.boardName;
      if (pin.link) pinOptions.link = pin.link;
    }
    if (Object.keys(pinOptions).length > 0)
      options.pinterestOptions = pinOptions;
  }

  if (p === 'reddit') {
    const redditOptions: Record<string, unknown> = {};
    if (settings.reddit) {
      const r = settings.reddit as Record<string, unknown>;
      if (r.subreddit) redditOptions.subreddit = r.subreddit;
      if (r.title) redditOptions.title = r.title;
    }
    if (Object.keys(redditOptions).length > 0)
      options.redditOptions = redditOptions;
  }

  if (p === 'facebook') {
    if (settings.type === 'story') {
      options.faceBookOptions = { stories: true };
    }
  }

  return options;
}

/**
 * Post to a single social platform via Ayrshare
 */
export async function postToAyrshare(
  params: AyrsharePostParams,
): Promise<AyrshareResult> {
  const headers = getAyrshareHeaders();
  const ayrsharePlatform = toAyrsharePlatform(params.platform);

  const mediaUrls =
    params.media?.map((m) => m.url).filter(Boolean) || undefined;

  const payload: Record<string, unknown> = {
    post: params.content,
    platforms: [ayrsharePlatform],
    scheduleDate: params.scheduledDate,
  };

  if (mediaUrls && mediaUrls.length > 0) {
    payload.mediaUrls = mediaUrls;
    // Flag videos explicitly
    const hasVideo = params.media?.some((m) => m.type === 'video');
    if (hasVideo) payload.isVideo = true;
  }

  // Add platform-specific options
  const platformOptions = buildPlatformOptions(
    ayrsharePlatform,
    params.platformSettings,
  );
  Object.assign(payload, platformOptions);

  try {
    const response = await fetch(`${AYRSHARE_API_URL}/post`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ayrshare API error (${response.status}):`, errorText);
      return {
        success: false,
        error: `Ayrshare API error (${response.status}): ${errorText}`,
      };
    }

    const data = await response.json();

    // Ayrshare returns errors in the response body for individual platforms
    if (data.status === 'error') {
      return {
        success: false,
        error: data.message || 'Ayrshare post failed',
      };
    }

    return {
      success: true,
      postId: data.id || data.refId,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Post to multiple platforms via Ayrshare in a single API call
 * Ayrshare natively supports multi-platform posting with per-platform content
 */
export async function postToAyrshareMultiPlatform(params: {
  platforms: string[];
  content: string;
  scheduledDate: string;
  media?: Array<{ type: 'image' | 'video'; url: string; alt?: string }>;
  variants?: Record<
    string,
    { content: string; media?: string[] | null; noImage?: boolean }
  >;
  platformSettings?: Record<string, Record<string, unknown>>;
  reddit?: { title?: string; subreddit?: string };
  pinterestOptions?: { boardId: string; boardName: string };
  tiktokOptions?: { type: string; coverUrl?: string; autoAddMusic?: boolean };
  instagramOptions?: { type: string; coverUrl?: string; stories?: boolean };
  facebookOptions?: { type: string };
}): Promise<{ results: Record<string, AyrshareResult> }> {
  const headers = getAyrshareHeaders();
  const results: Record<string, AyrshareResult> = {};

  const allPlatforms = params.platforms.filter(
    (p) => p.toLowerCase() !== 'youtube',
  );

  if (allPlatforms.length === 0) {
    return { results };
  }

  // Split text-only platforms (noImage variants) into a separate call
  // so they don't block image platforms with media validation errors
  const textOnlyPlatforms: string[] = [];
  const mediaPlatforms: string[] = [];
  const hasMedia = params.media && params.media.length > 0;

  for (const platform of allPlatforms) {
    const variant = params.variants?.[platform];
    if (hasMedia && (variant?.noImage || variant?.media === null)) {
      textOnlyPlatforms.push(platform);
    } else {
      mediaPlatforms.push(platform);
    }
  }

  // Send text-only platforms separately (no media)
  if (textOnlyPlatforms.length > 0) {
    const textPlatformsMapped = textOnlyPlatforms.map(toAyrsharePlatform);
    const textContent: string | Record<string, string> =
      textOnlyPlatforms.length === 1
        ? params.variants?.[textOnlyPlatforms[0]]?.content || params.content
        : (() => {
            const contentMap: Record<string, string> = {
              default: params.content,
            };
            for (const platform of textOnlyPlatforms) {
              const mapped = toAyrsharePlatform(platform);
              const variantContent = params.variants?.[platform]?.content;
              if (variantContent) contentMap[mapped] = variantContent;
            }
            return contentMap;
          })();

    const textPayload: Record<string, unknown> = {
      post: textContent,
      platforms: textPlatformsMapped,
      scheduleDate: params.scheduledDate,
    };

    try {
      const response = await fetch(`${AYRSHARE_API_URL}/post`, {
        method: 'POST',
        headers,
        body: JSON.stringify(textPayload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Ayrshare text-only API error (${response.status}):`,
          errorText,
        );
        for (const platform of textOnlyPlatforms) {
          results[platform] = {
            success: false,
            error: `Ayrshare API error (${response.status}): ${errorText}`,
          };
        }
      } else {
        const data = await response.json();
        const postId = data.id || data.refId;
        for (const platform of textOnlyPlatforms) {
          const mapped = toAyrsharePlatform(platform);
          const platformResult = data[mapped];
          if (platformResult?.status === 'error') {
            results[platform] = {
              success: false,
              postId,
              error: platformResult.message || `${platform} post failed`,
            };
          } else {
            results[platform] = {
              success: true,
              postId: platformResult?.id || postId,
            };
          }
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      for (const platform of textOnlyPlatforms) {
        results[platform] = { success: false, error: errorMsg };
      }
    }
  }

  // If no media platforms left, we're done
  const ayrsharePlatforms = mediaPlatforms.map(toAyrsharePlatform);
  if (ayrsharePlatforms.length === 0) {
    return { results };
  }

  // Build per-platform content if variants exist
  const hasVariants =
    params.variants && Object.keys(params.variants).length > 0;
  let postContent: string | Record<string, string> = params.content;

  if (hasVariants) {
    const contentMap: Record<string, string> = { default: params.content };
    for (const [platform, variant] of Object.entries(params.variants!)) {
      if (textOnlyPlatforms.includes(platform)) continue;
      const mapped = toAyrsharePlatform(platform);
      if (variant.content) {
        contentMap[mapped] = variant.content;
      }
    }
    postContent = contentMap;
  }

  // Build per-platform mediaUrls if variants have different media
  const rawMediaUrls = params.media?.map((m) => m.url).filter(Boolean) || [];
  const baseMediaUrls = rawMediaUrls.length > 0 ? rawMediaUrls : undefined;
  let mediaUrlsPayload: string[] | Record<string, string[]> | undefined =
    baseMediaUrls;

  if (hasVariants) {
    const hasMediaVariants = Object.values(params.variants!).some(
      (v) => !v.noImage && v.media !== undefined && v.media !== null,
    );
    if (hasMediaVariants && baseMediaUrls) {
      const mediaMap: Record<string, string[]> = {
        default: baseMediaUrls,
      };
      for (const [platform, variant] of Object.entries(params.variants!)) {
        if (textOnlyPlatforms.includes(platform)) continue;
        const mapped = toAyrsharePlatform(platform);
        if (variant.media && variant.media.length > 0) {
          mediaMap[mapped] = variant.media;
        }
      }
      mediaUrlsPayload = mediaMap;
    }
  }

  const payload: Record<string, unknown> = {
    post: postContent,
    platforms: ayrsharePlatforms,
    scheduleDate: params.scheduledDate,
  };

  if (mediaUrlsPayload) {
    payload.mediaUrls = mediaUrlsPayload;
    const hasVideo = params.media?.some((m) => m.type === 'video');
    if (hasVideo) payload.isVideo = true;
  }

  // Add platform-specific options from top-level params
  if (params.reddit) {
    payload.redditOptions = {
      subreddit: params.reddit.subreddit,
      title: params.reddit.title,
    };
  }

  if (params.pinterestOptions) {
    payload.pinterestOptions = {
      boardId: params.pinterestOptions.boardId,
      title: params.pinterestOptions.boardName,
    };
  }

  if (params.tiktokOptions) {
    const ttOpts: Record<string, unknown> = {};
    if (params.tiktokOptions.autoAddMusic) ttOpts.autoAddMusic = true;
    if (params.tiktokOptions.coverUrl)
      ttOpts.thumbNail = params.tiktokOptions.coverUrl;
    if (Object.keys(ttOpts).length > 0) payload.tikTokOptions = ttOpts;
  }

  if (params.instagramOptions) {
    const igOpts: Record<string, unknown> = {};
    if (
      params.instagramOptions.stories ||
      params.instagramOptions.type === 'story'
    )
      igOpts.stories = true;
    if (params.instagramOptions.type === 'reel') igOpts.shareReelsFeed = true;
    if (params.instagramOptions.coverUrl)
      igOpts.thumbNail = params.instagramOptions.coverUrl;
    if (Object.keys(igOpts).length > 0) payload.instagramOptions = igOpts;
  }

  if (params.facebookOptions?.type === 'story') {
    payload.faceBookOptions = { stories: true };
  }

  // Add per-platform settings if provided
  if (params.platformSettings) {
    for (const [platform, settings] of Object.entries(
      params.platformSettings,
    )) {
      const mapped = toAyrsharePlatform(platform);
      const opts = buildPlatformOptions(mapped, settings);
      Object.assign(payload, opts);
    }
  }

  try {
    const response = await fetch(`${AYRSHARE_API_URL}/post`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Ayrshare API error (${response.status}):`, errorText);
      for (const platform of mediaPlatforms) {
        results[platform] = {
          success: false,
          error: `Ayrshare API error (${response.status}): ${errorText}`,
        };
      }
      return { results };
    }

    const data = await response.json();
    const postId = data.id || data.refId;

    // Ayrshare returns per-platform status in the response
    for (const platform of mediaPlatforms) {
      const mapped = toAyrsharePlatform(platform);
      const platformResult = data[mapped];

      if (platformResult?.status === 'error') {
        results[platform] = {
          success: false,
          postId,
          error: platformResult.message || `${platform} post failed`,
        };
      } else {
        results[platform] = {
          success: true,
          postId: platformResult?.id || postId,
        };
      }
    }

    return { results };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    for (const platform of mediaPlatforms) {
      results[platform] = { success: false, error: errorMsg };
    }
    return { results };
  }
}
