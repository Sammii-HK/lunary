/**
 * Unified social posting client
 *
 * Routes posts to the appropriate backend:
 * - YouTube → direct YouTube Data API (src/lib/youtube/client.ts)
 * - SPELLCAST_PLATFORMS → Spellcast API (posts appear in Spellcast dashboard)
 * - AYRSHARE_API_KEY set → Ayrshare API (immediate)
 * - ENABLE_POSTIZ=true → Postiz API (self-hosted)
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
import {
  postToSpellcast,
  postToSpellcastMultiPlatform,
  isSpellcastConfigured,
} from './spellcast';
import { postToYouTube } from './youtube';
import type { YouTubePostParams } from './youtube';

export interface SocialPostResult {
  success: boolean;
  postId?: string;
  videoId?: string;
  url?: string;
  error?: string;
  rawResponse?: unknown;
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
  firstComment?: string;
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
  firstComments?: Record<string, string>;
  // Legacy Succulent fields (used when falling back to Succulent)
  accountGroupId?: string;
  name?: string;
  reddit?: { title?: string; subreddit?: string };
  pinterestOptions?: { boardId: string; boardName: string };
  pinterestLink?: string;
  tiktokOptions?: { type: string; coverUrl?: string; autoAddMusic?: boolean };
  instagramOptions?: { type: string; coverUrl?: string; stories?: boolean };
  facebookOptions?: { type: string };
}

type SocialBackend = 'ayrshare' | 'postiz' | 'spellcast' | 'succulent';

/**
 * Platforms that should route through Spellcast (or Postiz) instead of Ayrshare.
 * Set SPELLCAST_PLATFORMS=instagram,facebook,threads in env.
 */
const spellcastPlatforms: Set<string> = new Set(
  (process.env.SPELLCAST_PLATFORMS ?? '')
    .split(',')
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean),
);

function getActiveBackend(): SocialBackend {
  if (process.env.AYRSHARE_API_KEY) return 'ayrshare';
  if (process.env.ENABLE_POSTIZ === 'true') return 'postiz';
  return 'succulent';
}

/**
 * Get the backend for a specific platform.
 * If SPELLCAST_PLATFORMS includes this platform and Spellcast is configured, route through Spellcast.
 * Otherwise fall back to the default active backend.
 */
function getBackendForPlatform(platform: string): SocialBackend {
  if (
    spellcastPlatforms.has(platform.toLowerCase()) &&
    isSpellcastConfigured()
  ) {
    return 'spellcast';
  }
  return getActiveBackend();
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

  const backend = getBackendForPlatform(params.platform);

  if (backend === 'ayrshare') {
    try {
      const result = await postToAyrshare({
        platform: params.platform,
        content: params.content,
        scheduledDate: params.scheduledDate,
        media: params.media,
        platformSettings: params.platformSettings,
        firstComment: params.firstComment,
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

  if (backend === 'spellcast') {
    try {
      return await postToSpellcast({
        platform: params.platform,
        content: params.content,
        scheduledDate: params.scheduledDate,
        media: params.media,
        platformSettings: params.platformSettings,
        firstComment: params.firstComment,
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        backend: 'postiz',
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

  // Split platforms by backend
  const backendGroups = new Map<SocialBackend, string[]>();
  for (const p of otherPlatforms) {
    const backend = getBackendForPlatform(p);
    const group = backendGroups.get(backend) ?? [];
    group.push(p);
    backendGroups.set(backend, group);
  }

  const spellcastGroup = backendGroups.get('spellcast') ?? [];
  const postizGroup = backendGroups.get('postiz') ?? [];
  const ayrshareGroup = backendGroups.get('ayrshare') ?? [];
  const succulentGroup = backendGroups.get('succulent') ?? [];

  // Derive per-backend first comments (pick first available from each group)
  const spellcastFirstComment = spellcastGroup.reduce<string | undefined>(
    (found, p) => found ?? params.firstComments?.[p],
    undefined,
  );
  const ayrshareFirstComment = ayrshareGroup.reduce<string | undefined>(
    (found, p) => found ?? params.firstComments?.[p],
    undefined,
  );

  // Spellcast group (posts appear in Spellcast dashboard)
  if (spellcastGroup.length > 0) {
    const spellcastResult = await postToSpellcastMultiPlatform({
      platforms: spellcastGroup,
      content: params.content,
      scheduledDate: params.scheduledDate,
      media: params.media,
      variants: params.variants,
      platformSettings: params.platformSettings,
      firstComment: spellcastFirstComment,
    });

    for (const [platform, result] of Object.entries(spellcastResult.results)) {
      results[platform] = result;
    }
  }

  // Postiz group (direct to Postiz, bypasses Spellcast dashboard)
  if (postizGroup.length > 0) {
    const postizResult = await postToPostizMultiPlatform({
      platforms: postizGroup,
      content: params.content,
      scheduledDate: params.scheduledDate,
      media: params.media,
      variants: params.variants,
      platformSettings: params.platformSettings,
    });

    for (const [platform, result] of Object.entries(postizResult.results)) {
      results[platform] = { ...result, backend: 'postiz' };
    }
  }

  // Ayrshare group
  if (ayrshareGroup.length > 0) {
    const ayrshareResult = await postToAyrshareMultiPlatform({
      platforms: ayrshareGroup,
      content: params.content,
      scheduledDate: params.scheduledDate,
      media: params.media,
      variants: params.variants,
      platformSettings: params.platformSettings,
      reddit: params.reddit,
      pinterestOptions: params.pinterestOptions
        ? {
            ...params.pinterestOptions,
            ...(params.pinterestLink ? { link: params.pinterestLink } : {}),
          }
        : undefined,
      tiktokOptions: params.tiktokOptions,
      instagramOptions: params.instagramOptions,
      facebookOptions: params.facebookOptions,
      firstComment: ayrshareFirstComment,
    });

    for (const [platform, result] of Object.entries(ayrshareResult.results)) {
      results[platform] = { ...result, backend: 'ayrshare' };
    }
  }

  if (succulentGroup.length === 0) {
    return { results };
  }

  // Succulent fallback (only for platforms not handled above)
  const accountGroupId =
    params.accountGroupId || process.env.SUCCULENT_ACCOUNT_GROUP_ID;
  if (!accountGroupId) {
    for (const platform of succulentGroup) {
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
    platforms: succulentGroup,
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

  for (const platform of succulentGroup) {
    results[platform] = { ...succulentResult };
  }

  return { results };
}
