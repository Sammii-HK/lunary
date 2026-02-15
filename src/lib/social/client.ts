/**
 * Unified social posting client
 *
 * Routes posts to the appropriate backend:
 * - YouTube → direct YouTube Data API (src/lib/youtube/client.ts)
 * - AYRSHARE_API_KEY set → Ayrshare API (immediate)
 * - ENABLE_POSTIZ=true → Postiz API (self-hosted, for later)
 * - Otherwise → fallback to legacy Succulent
 *
 * Usage:
 *   import { postToSocial, postToSocialMultiPlatform } from '@/lib/social/client';
 *
 *   // Single platform
 *   const result = await postToSocial({ platform: 'x', content: '...', ... });
 *
 *   // Multi-platform (like the old Succulent grouped posts)
 *   const results = await postToSocialMultiPlatform({ platforms: ['x', 'instagram'], ... });
 */

import { postToPostiz, postToPostizMultiPlatform } from './postiz';
import { postToAyrshare, postToAyrshareMultiPlatform } from './ayrshare';
import { postToYouTube } from './youtube';
import type { YouTubePostParams } from './youtube';

export interface SocialPostResult {
  success: boolean;
  postId?: string;
  videoId?: string;
  url?: string;
  error?: string;
  backend: 'youtube' | 'ayrshare' | 'postiz' | 'succulent';
}

export interface SocialPostParams {
  platform: string;
  content: string;
  scheduledDate: string;
  media?: Array<{ type: 'image' | 'video'; url: string; alt?: string }>;
  youtubeOptions?: YouTubePostParams['youtubeOptions'];
  transcript?: string;
  platformSettings?: Record<string, unknown>;
}

export interface MultiPlatformPostParams {
  platforms: string[];
  content: string;
  scheduledDate: string;
  media?: Array<{ type: 'image' | 'video'; url: string; alt?: string }>;
  variants?: Record<
    string,
    { content: string; media?: string[] | null; noImage?: boolean }
  >;
  youtubeOptions?: YouTubePostParams['youtubeOptions'];
  transcript?: string;
  platformSettings?: Record<string, Record<string, unknown>>;
  // Legacy Succulent fields (used when falling back to Succulent)
  accountGroupId?: string;
  name?: string;
  reddit?: { title?: string; subreddit?: string };
  pinterestOptions?: { boardId: string; boardName: string };
  tiktokOptions?: { type: string; coverUrl?: string; autoAddMusic?: boolean };
  instagramOptions?: { type: string; coverUrl?: string; stories?: boolean };
  facebookOptions?: { type: string };
}

type SocialBackend = 'ayrshare' | 'postiz' | 'succulent';

function getActiveBackend(): SocialBackend {
  if (process.env.AYRSHARE_API_KEY) return 'ayrshare';
  if (process.env.ENABLE_POSTIZ === 'true') return 'postiz';
  return 'succulent';
}

function isYouTubePlatform(platform: string): boolean {
  return platform.toLowerCase() === 'youtube';
}

/**
 * Post to Succulent (legacy fallback)
 */
async function postToSucculent(
  payload: Record<string, unknown>,
): Promise<SocialPostResult> {
  const apiKey = process.env.SUCCULENT_SECRET_KEY;
  const succulentApiUrl = 'https://app.succulent.social/api/posts';

  if (!apiKey) {
    return {
      success: false,
      error: 'SUCCULENT_SECRET_KEY not configured',
      backend: 'succulent',
    };
  }

  try {
    const response = await fetch(succulentApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        error: `Succulent API error (${response.status}): ${errorText}`,
        backend: 'succulent',
      };
    }

    const data = await response.json();
    return {
      success: true,
      postId: data.data?.postId || data.postId,
      backend: 'succulent',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      backend: 'succulent',
    };
  }
}

/**
 * Post to a single social platform
 *
 * Routes to YouTube direct API, Ayrshare, Postiz, or Succulent.
 */
export async function postToSocial(
  params: SocialPostParams,
): Promise<SocialPostResult> {
  // YouTube always goes direct (regardless of backend)
  if (isYouTubePlatform(params.platform)) {
    const result = await postToYouTube({
      content: params.content,
      media: params.media || [],
      youtubeOptions: params.youtubeOptions,
      scheduledDate: params.scheduledDate,
      transcript: params.transcript,
    });
    return {
      ...result,
      backend: 'youtube',
    };
  }

  const backend = getActiveBackend();

  if (backend === 'ayrshare') {
    try {
      const result = await postToAyrshare({
        platform: params.platform,
        content: params.content,
        scheduledDate: params.scheduledDate,
        media: params.media,
        platformSettings: params.platformSettings,
      });
      return { ...result, backend: 'ayrshare' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        backend: 'ayrshare',
      };
    }
  }

  if (backend === 'postiz') {
    try {
      const result = await postToPostiz({
        platform: params.platform,
        content: params.content,
        scheduledDate: params.scheduledDate,
        media: params.media,
        platformSettings: params.platformSettings,
      });
      return { ...result, backend: 'postiz' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        backend: 'postiz',
      };
    }
  }

  // Succulent fallback
  const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;
  if (!accountGroupId) {
    return {
      success: false,
      error: 'SUCCULENT_ACCOUNT_GROUP_ID not configured',
      backend: 'succulent',
    };
  }
  return postToSucculent({
    accountGroupId,
    content: params.content,
    platforms: [params.platform],
    scheduledDate: params.scheduledDate,
    media: params.media || [],
    ...params.platformSettings,
  });
}

/**
 * Post to multiple platforms at once
 *
 * Splits YouTube out for direct API, sends everything else to the active backend.
 */
export async function postToSocialMultiPlatform(
  params: MultiPlatformPostParams,
): Promise<{ results: Record<string, SocialPostResult> }> {
  const results: Record<string, SocialPostResult> = {};
  const platforms = params.platforms.map((p) => p.toLowerCase());

  // Handle YouTube separately (always direct API)
  if (platforms.includes('youtube')) {
    const youtubeVariant = params.variants?.youtube;
    const youtubeContent = youtubeVariant?.content || params.content;

    const ytResult = await postToYouTube({
      content: youtubeContent,
      media: params.media || [],
      youtubeOptions: params.youtubeOptions,
      scheduledDate: params.scheduledDate,
      transcript: params.transcript,
    });
    results.youtube = { ...ytResult, backend: 'youtube' };
  }

  // Handle non-YouTube platforms
  const otherPlatforms = platforms.filter((p) => p !== 'youtube');
  if (otherPlatforms.length === 0) {
    return { results };
  }

  const backend = getActiveBackend();

  // Ayrshare path
  if (backend === 'ayrshare') {
    const ayrshareResult = await postToAyrshareMultiPlatform({
      platforms: otherPlatforms,
      content: params.content,
      scheduledDate: params.scheduledDate,
      media: params.media,
      variants: params.variants,
      platformSettings: params.platformSettings,
      reddit: params.reddit,
      pinterestOptions: params.pinterestOptions,
      tiktokOptions: params.tiktokOptions,
      instagramOptions: params.instagramOptions,
      facebookOptions: params.facebookOptions,
    });

    for (const [platform, result] of Object.entries(ayrshareResult.results)) {
      results[platform] = { ...result, backend: 'ayrshare' };
    }

    return { results };
  }

  // Postiz path
  if (backend === 'postiz') {
    const postizResult = await postToPostizMultiPlatform({
      platforms: otherPlatforms,
      content: params.content,
      scheduledDate: params.scheduledDate,
      media: params.media,
      variants: params.variants,
      platformSettings: params.platformSettings,
    });

    for (const [platform, result] of Object.entries(postizResult.results)) {
      results[platform] = { ...result, backend: 'postiz' };
    }

    return { results };
  }

  // Succulent fallback
  const accountGroupId =
    params.accountGroupId || process.env.SUCCULENT_ACCOUNT_GROUP_ID;
  if (!accountGroupId) {
    for (const platform of otherPlatforms) {
      results[platform] = {
        success: false,
        error: 'SUCCULENT_ACCOUNT_GROUP_ID not configured',
        backend: 'succulent',
      };
    }
    return { results };
  }

  const succulentPayload: Record<string, unknown> = {
    accountGroupId,
    name: params.name,
    content: params.content,
    platforms: otherPlatforms,
    scheduledDate: params.scheduledDate,
    media: params.media || [],
  };

  if (params.variants) {
    const filteredVariants = { ...params.variants };
    delete filteredVariants.youtube;
    if (Object.keys(filteredVariants).length > 0) {
      succulentPayload.variants = filteredVariants;
    }
  }
  if (params.reddit) succulentPayload.reddit = params.reddit;
  if (params.pinterestOptions)
    succulentPayload.pinterestOptions = params.pinterestOptions;
  if (params.tiktokOptions)
    succulentPayload.tiktokOptions = params.tiktokOptions;
  if (params.instagramOptions)
    succulentPayload.instagramOptions = params.instagramOptions;

  const succulentResult = await postToSucculent(succulentPayload);

  for (const platform of otherPlatforms) {
    results[platform] = { ...succulentResult };
  }

  return { results };
}
