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
}

async function spellcastFetch(
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
 * Post to a single platform via Spellcast.
 * Creates a draft, then schedules it.
 */
export async function postToSpellcast(
  params: SpellcastPostParams,
): Promise<SocialPostResult> {
  const { accountSetId } = getSpellcastConfig();

  try {
    // 1. Create draft post
    const createRes = await spellcastFetch('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        content: params.content,
        mediaUrls: params.media?.map((m) => m.url) ?? [],
        scheduledFor: params.scheduledDate,
        accountSetId,
        postType: 'post',
        ...(params.platformSettings
          ? { platformSettings: params.platformSettings }
          : {}),
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
 * Creates one post targeting the account set — Spellcast handles fan-out.
 */
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
}): Promise<{ results: Record<string, SocialPostResult> }> {
  const results: Record<string, SocialPostResult> = {};
  const { accountSetId } = getSpellcastConfig();

  try {
    // Build platform variations if present
    const platformVariations: Record<string, string> = {};
    if (params.variants) {
      for (const [platform, variant] of Object.entries(params.variants)) {
        if (variant.content) {
          platformVariations[platform] = variant.content;
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
        ...(Object.keys(platformVariations).length > 0
          ? { platformVariations }
          : {}),
      }),
    });

    if (!createRes.ok) {
      const errorText = await createRes.text();
      for (const platform of params.platforms) {
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
      for (const platform of params.platforms) {
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

    for (const platform of params.platforms) {
      results[platform] = {
        success: true,
        postId,
        backend: 'postiz',
      };
    }
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Unknown error';
    for (const platform of params.platforms) {
      results[platform] = {
        success: false,
        error: errMsg,
        backend: 'postiz',
      };
    }
  }

  return { results };
}
