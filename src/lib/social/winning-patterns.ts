/**
 * Winning Patterns — fetches performance patterns from Spellcast analytics
 *
 * Returns structured data about what content is performing best:
 * top hooks, best content types, optimal posting times, high-save content,
 * theme keywords, and hook structure patterns.
 *
 * Cached for 30 minutes to avoid hammering the API on multi-post generation runs.
 */

import { spellcastFetch, isSpellcastConfigured } from './spellcast';

export interface WinningPatterns {
  sampleSize: number;
  confidence: number;
  topHooks: Array<{
    hook: string;
    engagement: number;
    engagementRate: number;
    saves: number;
    postType: string;
  }>;
  contentTypePerformance: Record<
    string,
    { count: number; avgEngagement: number; avgSaves: number; avgReach: number }
  >;
  bestPostingTimes: Array<{
    day: string;
    hour: number;
    avgEngagement: number;
    sampleSize: number;
  }>;
  topThemes: Array<{
    theme: string;
    frequency: number;
    avgEngagement: number;
  }>;
  savesLeaders: Array<{
    hook: string;
    saves: number;
    savesRate: number;
    postType: string;
  }>;
  hookPatterns: Record<string, { count: number; avgEng: number }>;
  summary: {
    avgEngagementRate: number;
    avgSaves: number;
    platformMix: Record<string, number>;
  };
}

// In-memory cache: key = accountSetId (or "all"), value = { data, fetchedAt }
const cache = new Map<string, { data: WinningPatterns; fetchedAt: number }>();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Fetch winning patterns for an account set (or all account sets).
 * Returns null if Spellcast is not configured or the fetch fails.
 * Results are cached for 30 minutes.
 */
export async function getWinningPatterns(
  accountSetId?: string,
  days: number = 30,
): Promise<WinningPatterns | null> {
  if (!isSpellcastConfigured()) return null;

  const cacheKey = accountSetId ?? 'all';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams();
    if (accountSetId) params.set('accountSetId', accountSetId);
    params.set('days', String(days));

    const res = await spellcastFetch(
      `/api/analytics/winning-patterns?${params}`,
      { timeoutMs: 10000 },
    );

    if (!res.ok) {
      console.warn(
        `[winning-patterns] Failed to fetch: ${res.status} ${res.statusText}`,
      );
      return null;
    }

    const data = (await res.json()) as WinningPatterns;
    cache.set(cacheKey, { data, fetchedAt: Date.now() });
    return data;
  } catch (error) {
    console.warn(
      '[winning-patterns] Fetch error:',
      error instanceof Error ? error.message : 'unknown',
    );
    return null;
  }
}

/**
 * Get the best-performing hook pattern type (e.g. "question", "personal", "cliffhanger").
 * Returns null if no data available.
 */
export function getBestHookPattern(
  patterns: WinningPatterns | null,
): string | null {
  if (!patterns?.hookPatterns) return null;

  const entries = Object.entries(patterns.hookPatterns);
  if (entries.length === 0) return null;

  const best = entries.reduce((a, b) => (a[1].avgEng > b[1].avgEng ? a : b));
  return best[0];
}

/**
 * Get top N themes as a simple string array for prompt injection.
 */
export function getTopThemeWords(
  patterns: WinningPatterns | null,
  count: number = 5,
): string[] {
  if (!patterns?.topThemes) return [];
  return patterns.topThemes.slice(0, count).map((t) => t.theme);
}

/**
 * Build a concise prompt context block from winning patterns.
 * Designed to be injected into content generation prompts.
 */
export function buildWinningPatternsContext(
  patterns: WinningPatterns | null,
): string {
  if (!patterns || patterns.sampleSize < 3) return '';

  const lines: string[] = [
    '## Content Performance Insights (from last 30 published posts)',
  ];

  const bestHookType = getBestHookPattern(patterns);
  if (bestHookType) {
    lines.push(`Best-performing hook style: ${bestHookType}`);
  }

  const themes = getTopThemeWords(patterns, 5);
  if (themes.length > 0) {
    lines.push(`Top engaging themes: ${themes.join(', ')}`);
  }

  if (patterns.savesLeaders.length > 0) {
    lines.push(
      `High-save hooks: ${patterns.savesLeaders
        .slice(0, 3)
        .map((s) => `"${s.hook.slice(0, 60)}"`)
        .join('; ')}`,
    );
  }

  lines.push(
    `Avg engagement rate: ${(patterns.summary.avgEngagementRate * 100).toFixed(1)}%`,
  );

  return lines.join('\n');
}
