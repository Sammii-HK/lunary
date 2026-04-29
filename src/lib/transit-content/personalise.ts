/**
 * Two-tier transit content orchestrator.
 *
 *   1. Look in cache — same event, same audience tier.
 *   2. Free → use template; Plus → call AI generator (if provided).
 *   3. Fall back to template, then to a generic last-resort string.
 *
 * The point: cache by *transit event*, not by user. Saturn entering Pisces
 * is the same event for every user; we should not pay for N AI calls.
 *
 * Never throws — the cron must always get *something* back.
 */
import {
  getCachedContent,
  setCachedContent,
  getDefaultTtlHours,
  type Audience,
} from './cache';
import {
  getTemplateBlurb,
  GENERIC_FALLBACK_BLURB,
  type TransitEvent,
} from './templates';

export type ContentSource = 'template' | 'cache' | 'ai';

export interface PersonalisedContentResult {
  content: string;
  source: ContentSource;
}

export interface PersonaliseOptions {
  /**
   * Optional AI generator for `audience === 'plus'`. If omitted, Plus users
   * fall back to template content. Should return its model identifier as
   * `source` so we can record it in the cache row.
   */
  aiGenerate?: (
    event: TransitEvent,
  ) => Promise<{ content: string; source: string }>;

  /**
   * Override the default TTL (hours) for this cache write. Defaults to the
   * per-kind table in `cache.ts`.
   */
  ttlHours?: number;

  /**
   * If true, skip the cache read (useful for forced regeneration). Cache is
   * still *written* unless `skipCacheWrite` is also true.
   */
  skipCacheRead?: boolean;
  skipCacheWrite?: boolean;
}

export async function getPersonalisedTransitContent(
  event: TransitEvent,
  audience: Audience,
  options: PersonaliseOptions = {},
): Promise<PersonalisedContentResult> {
  const ttlHours = options.ttlHours ?? getDefaultTtlHours(event);

  // 1. Cache hit?
  if (!options.skipCacheRead) {
    const cached = await getCachedContent(event, audience);
    if (cached) {
      return { content: cached, source: 'cache' };
    }
  }

  // 2. Tier-specific generation.
  if (audience === 'plus' && options.aiGenerate) {
    try {
      const ai = await options.aiGenerate(event);
      if (ai && ai.content) {
        if (!options.skipCacheWrite) {
          await setCachedContent(
            event,
            audience,
            ai.content,
            ai.source,
            ttlHours,
          );
        }
        return { content: ai.content, source: 'ai' };
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        '[transit-content/personalise] aiGenerate failed, falling back to template:',
        err,
      );
    }
  }

  // 3. Template fallback (also the primary path for free users).
  const templateBlurb = getTemplateBlurb(event);
  if (templateBlurb) {
    if (!options.skipCacheWrite) {
      await setCachedContent(
        event,
        audience,
        templateBlurb,
        'template',
        ttlHours,
      );
    }
    return { content: templateBlurb, source: 'template' };
  }

  // 4. Last resort — never let the cron silently fail.
  return { content: GENERIC_FALLBACK_BLURB, source: 'template' };
}
