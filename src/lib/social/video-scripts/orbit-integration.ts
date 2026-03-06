import { readFileSync } from 'fs';
import { join } from 'path';

/** Shape of the orbit TikTok insights written by the optimizer agent */
interface OrbitTikTokInsights {
  lastUpdated: string;
  hookPatterns: Array<{
    pattern: string;
    hookType: string;
    score: number;
    source: string;
  }>;
  avoidHookPatterns: string[];
  ctaRankings: Array<{ text: string; type: string; score: number }>;
  categoryWeights: Record<string, number>;
  trendingAngles: Array<{
    angle: string;
    relevance: number;
    expiresApprox: string | null;
  }>;
  formatInsights: {
    optimalDurationSeconds: number | null;
    bestStructures: string[];
    trendingFormats: string[];
  };
}

const DEFAULT_INSIGHTS: OrbitTikTokInsights = {
  lastUpdated: '',
  hookPatterns: [],
  avoidHookPatterns: [],
  ctaRankings: [],
  categoryWeights: {
    numerology: 0.35,
    zodiac: 0.3,
    tarot: 0.2,
    crystal: 0.15,
  },
  trendingAngles: [],
  formatInsights: {
    optimalDurationSeconds: null,
    bestStructures: [],
    trendingFormats: [],
  },
};

let cached: OrbitTikTokInsights | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Load orbit TikTok insights. Cached for 5 minutes.
 * Falls back to defaults if the file is missing or malformed.
 */
export function getOrbitTikTokInsights(): OrbitTikTokInsights {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_TTL_MS) return cached;

  try {
    const filePath = join(__dirname, 'orbit-tiktok-insights.json');
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<OrbitTikTokInsights>;
    cached = { ...DEFAULT_INSIGHTS, ...parsed };
    cachedAt = now;
    return cached;
  } catch {
    cached = DEFAULT_INSIGHTS;
    cachedAt = now;
    return cached;
  }
}

/**
 * Orbit hook type -> HOOK_TEMPLATES key mapping.
 * Orbit uses different names than Lunary's internal hook style keys.
 */
const HOOK_TYPE_MAP: Record<string, string> = {
  declaration: 'observation',
  question: 'question',
  identity_callout: 'experiential',
  pattern_interrupt: 'challenge',
  bold_claim: 'wrong_about',
  list_tease: 'list',
  curiosity_gap: 'nobody_talks_about',
  number_reveal: 'urgency',
};

/**
 * Get hook type -> score map for merging with DB performance weights.
 * Maps orbit's hookType strings to HOOK_TEMPLATES keys.
 */
export function getOrbitHookBoosts(): Map<string, number> {
  const insights = getOrbitTikTokInsights();
  const boosts = new Map<string, number>();

  for (const hp of insights.hookPatterns) {
    const mappedType = HOOK_TYPE_MAP[hp.hookType] ?? hp.hookType;
    const existing = boosts.get(mappedType) ?? 0;
    // Average scores if multiple patterns map to same type
    boosts.set(mappedType, Math.max(existing, hp.score));
  }

  return boosts;
}

/**
 * Check if a hook text matches any avoid patterns from orbit data.
 */
export function shouldAvoidTikTokHook(hookText: string): boolean {
  const insights = getOrbitTikTokInsights();
  if (!insights.avoidHookPatterns.length) return false;

  const lowerHook = hookText.toLowerCase();
  return insights.avoidHookPatterns.some((pattern) =>
    lowerHook.includes(pattern.toLowerCase()),
  );
}

/**
 * Get ranked CTAs from orbit, optionally filtered by type.
 */
export function getOrbitCTAs(type?: string): string[] {
  const insights = getOrbitTikTokInsights();
  let ctas = insights.ctaRankings;

  if (type) {
    ctas = ctas.filter((c) => c.type === type);
  }

  return ctas.sort((a, b) => b.score - a.score).map((c) => c.text);
}

/**
 * Get category weights for TikTok topic selection.
 */
export function getOrbitCategoryWeights(): Record<string, number> {
  const insights = getOrbitTikTokInsights();
  return insights.categoryWeights;
}

/**
 * Format trending angles as a string for AI prompt injection.
 * Filters out expired angles based on current date.
 */
export function getOrbitTrendingContext(): string {
  const insights = getOrbitTikTokInsights();
  if (!insights.trendingAngles.length) return '';

  const now = new Date();
  const active = insights.trendingAngles.filter((a) => {
    if (!a.expiresApprox) return true;
    return new Date(a.expiresApprox) >= now;
  });

  if (!active.length) return '';

  const lines = active
    .sort((a, b) => b.relevance - a.relevance)
    .slice(0, 5)
    .map((a) => `- ${a.angle} (relevance: ${(a.relevance * 100).toFixed(0)}%)`);

  return lines.join('\n');
}
