/**
 * Spellcast API client for social media posting
 *
 * Routes posts through Spellcast's API so they appear in the Spellcast dashboard
 * with engagement tracking, brand voice, and grimoire context.
 *
 * Spellcast resolves platform → integration mapping via account sets,
 * so Lunary only needs the account set ID — no per-platform integration IDs.
 */

import type { SocialPostResult } from './client';

function getSpellcastConfig() {
  const url = process.env.SPELLCAST_API_URL;
  const apiKey = process.env.SPELLCAST_API_KEY;
  const accountSetId = process.env.SPELLCAST_LUNARY_ACCOUNT_SET_ID;

  if (!url || !apiKey || !accountSetId) {
    throw new Error(
      'Spellcast not configured. Set SPELLCAST_API_URL, SPELLCAST_API_KEY, and SPELLCAST_LUNARY_ACCOUNT_SET_ID.',
    );
  }

  return { url: url.replace(/\/$/, ''), apiKey, accountSetId };
}

export function isSpellcastConfigured(): boolean {
  return !!(
    process.env.SPELLCAST_API_URL &&
    process.env.SPELLCAST_API_KEY &&
    process.env.SPELLCAST_LUNARY_ACCOUNT_SET_ID
  );
}

interface SpellcastPostParams {
  platform: string;
  content: string;
  scheduledDate: string;
  media?: Array<{ type: 'image' | 'video'; url: string; alt?: string }>;
  platformSettings?: Record<string, unknown>;
  firstComment?: string;
}

export async function spellcastFetch(
  path: string,
  options: RequestInit = {},
): Promise<Response> {
  const { url, apiKey } = getSpellcastConfig();

  return fetch(`${url}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...options.headers,
    },
    signal: AbortSignal.timeout(15000),
  });
}

/**
 * Resolve a list of platform names to social account IDs within the account set.
 * Returns undefined if the lookup fails (post will go to all accounts as fallback).
 */
async function resolveSelectedAccountIds(
  accountSetId: string,
  platforms: string[],
): Promise<string[] | undefined> {
  if (platforms.length === 0) return undefined;
  try {
    const res = await spellcastFetch(`/api/account-sets/${accountSetId}`);
    if (!res.ok) return undefined;
    const accountSet = await res.json();
    const accounts: Array<{ id: string; platform: string }> =
      accountSet.socialAccounts ?? [];
    const platformSet = new Set(platforms);
    const ids = accounts
      .filter((a) => platformSet.has(a.platform))
      .map((a) => a.id);
    return ids.length > 0 ? ids : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Post to a single platform via Spellcast.
 * Creates a draft, then schedules it.
 */
export async function postToSpellcast(
  params: SpellcastPostParams,
): Promise<SocialPostResult> {
  const { accountSetId } = getSpellcastConfig();

  try {
    const selectedAccountIds = await resolveSelectedAccountIds(accountSetId, [
      params.platform,
    ]);

    // Detect story format from platformSettings
    const instagramOpts = (params.platformSettings as any)?.instagramOptions;
    const isStory = instagramOpts?.isStory === true;
    const postType = isStory ? 'story' : 'post';

    // 1. Create draft post
    const createRes = await spellcastFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        content: params.content,
        mediaUrls: params.media?.map((m) => m.url) ?? [],
        scheduledFor: params.scheduledDate,
        accountSetId,
        postType,
        ...(selectedAccountIds ? { selectedAccountIds } : {}),
        ...(params.platformSettings
          ? { platformSettings: params.platformSettings }
          : {}),
        ...(params.firstComment ? { first_comment: params.firstComment } : {}),
      }),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      return {
        success: false,
        error: `Spellcast create failed (${createRes.status}): ${errorText}`,
        backend: 'postiz', // Spellcast routes through Postiz
      };
    }

    const draft = await createRes.json();

    // 2. Schedule the draft
    const scheduleRes = await spellcastFetch(
      `/api/posts/${draft.id}/schedule`,
      { method: 'POST' },
    );

    if (!scheduleRes.ok) {
      const errorText = await scheduleRes.text();
      return {
        success: false,
        error: `Spellcast schedule failed (${scheduleRes.status}): ${errorText}`,
        backend: 'postiz',
      };
    }

    const scheduled = await scheduleRes.json();

    return {
      success: true,
      postId: scheduled.postizPostId || scheduled.id,
      backend: 'postiz',
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      backend: 'postiz',
    };
  }
}

/**
 * Post to multiple platforms via Spellcast in a single request.
 * Creates one post targeting the account set — Spellcast handles fan-out to the
 * specified platforms only.
 */
const ALLOWED_PLATFORMS = new Set([
  'instagram',
  'twitter',
  'x',
  'threads',
  'facebook',
  'bluesky',
  'tiktok',
  'linkedin',
  'youtube',
  'pinterest',
]);

export async function postToSpellcastMultiPlatform(params: {
  platforms: string[];
  content: string;
  scheduledDate: string;
  media?: Array<{ type: 'image' | 'video'; url: string; alt?: string }>;
  variants?: Record<
    string,
    { content: string; media?: string[] | null; noImage?: boolean }
  >;
  platformSettings?: Record<string, Record<string, unknown>>;
  firstComment?: string;
}): Promise<{ results: Record<string, SocialPostResult> }> {
  const results: Record<string, SocialPostResult> = {};
  const { accountSetId } = getSpellcastConfig();

  // Validate all platforms against allow-list before use as object keys
  const safePlatforms = params.platforms.filter((p) =>
    ALLOWED_PLATFORMS.has(p),
  );

  try {
    // Resolve platform names to specific account IDs so only the requested
    // platforms receive the post (not the entire account set).
    const selectedAccountIds = await resolveSelectedAccountIds(
      accountSetId,
      safePlatforms,
    );

    // Build platform variations if present
    const platformVariations: Record<string, string> = {};
    if (params.variants) {
      for (const [platform, variant] of Object.entries(params.variants)) {
        if (variant.content && ALLOWED_PLATFORMS.has(platform)) {
          platformVariations[platform] = variant.content;
        }
      }
    }

    // Flatten platform-keyed settings (e.g. { facebook: { who_can_reply_post } })
    // into a single flat object that Postiz understands.
    // Also always set who_can_reply_post explicitly — Postiz's default is invalid.
    const flatPostizSettings: Record<string, unknown> = {
      who_can_reply_post: 'everyone',
    };
    if (params.platformSettings) {
      for (const platformSpecific of Object.values(params.platformSettings)) {
        if (
          typeof platformSpecific === 'object' &&
          platformSpecific !== null &&
          !Array.isArray(platformSpecific)
        ) {
          Object.assign(flatPostizSettings, platformSpecific);
        }
      }
    }

    // 1. Create draft
    const createRes = await spellcastFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        content: params.content,
        mediaUrls: params.media?.map((m) => m.url) ?? [],
        scheduledFor: params.scheduledDate,
        accountSetId,
        postType: 'post',
        ...(selectedAccountIds ? { selectedAccountIds } : {}),
        ...(Object.keys(platformVariations).length > 0
          ? { platformVariations }
          : {}),
        platformSettings: flatPostizSettings,
        ...(params.firstComment ? { first_comment: params.firstComment } : {}),
      }),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      for (const platform of safePlatforms) {
        results[platform] = {
          success: false,
          error: `Spellcast create failed (${createRes.status}): ${errorText}`,
          backend: 'postiz',
        };
      }
      return { results };
    }

    const draft = await createRes.json();

    // 2. Schedule
    const scheduleRes = await spellcastFetch(
      `/api/posts/${draft.id}/schedule`,
      { method: 'POST' },
    );

    if (!scheduleRes.ok) {
      const errorText = await scheduleRes.text();
      for (const platform of safePlatforms) {
        results[platform] = {
          success: false,
          error: `Spellcast schedule failed (${scheduleRes.status}): ${errorText}`,
          backend: 'postiz',
        };
      }
      return { results };
    }

    const scheduled = await scheduleRes.json();
    const postId = scheduled.postizPostId || scheduled.id;

    for (const platform of safePlatforms) {
      results[platform] = {
        success: true,
        postId,
        backend: 'postiz',
      };
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    for (const platform of safePlatforms) {
      results[platform] = {
        success: false,
        error: errMsg,
        backend: 'postiz',
      };
    }
  }

  return { results };
}
