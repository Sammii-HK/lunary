import { readFileSync } from 'fs';
import { join } from 'path';
import type { ThreadsPillar } from './types';

/** Shape of the orbit performance data written by the optimizer agent */
interface OrbitPerformance {
  lastUpdated: string;
  pillarWeights: Record<ThreadsPillar, number>;
  hookRankings: Record<
    ThreadsPillar,
    { topPatterns: string[]; avoidPatterns: string[] }
  >;
  grimoireCategories: {
    ranked: string[];
    weights: Record<string, number>;
  };
  newHookSuggestions: Array<{
    pillar: ThreadsPillar;
    hook: string;
    source: string;
  }>;
  timingInsights: {
    bestSlots: number[];
    bestDays: string[];
    conversionNotes: string;
  };
  ctaInsights: {
    topPerformingCTAs: string[];
    conversionRate: number;
    recommendation: string;
  };
}

const DEFAULT_PERFORMANCE: OrbitPerformance = {
  lastUpdated: '',
  pillarWeights: {
    cosmic_timing: 0.35,
    conversation: 0.25,
    identity: 0.2,
    educational: 0.2,
    visual_crosspost: 0,
  },
  hookRankings: {
    cosmic_timing: { topPatterns: [], avoidPatterns: [] },
    conversation: { topPatterns: [], avoidPatterns: [] },
    identity: { topPatterns: [], avoidPatterns: [] },
    educational: { topPatterns: [], avoidPatterns: [] },
    visual_crosspost: { topPatterns: [], avoidPatterns: [] },
  },
  grimoireCategories: {
    ranked: ['numerology', 'zodiac', 'tarot', 'crystal'],
    weights: { numerology: 0.35, zodiac: 0.3, tarot: 0.2, crystal: 0.15 },
  },
  newHookSuggestions: [],
  timingInsights: {
    bestSlots: [14, 17, 21],
    bestDays: ['Wednesday', 'Thursday'],
    conversionNotes: '',
  },
  ctaInsights: {
    topPerformingCTAs: [],
    conversionRate: 0.429,
    recommendation: '',
  },
};

let cached: OrbitPerformance | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Load orbit performance data. Cached for 5 minutes to avoid
 * reading the file on every post generation.
 * Falls back to defaults if the file is missing or malformed.
 */
export function getOrbitPerformance(): OrbitPerformance {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_TTL_MS) return cached;

  try {
    const filePath = join(__dirname, 'orbit-performance.json');
    const raw = readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as Partial<OrbitPerformance>;
    cached = { ...DEFAULT_PERFORMANCE, ...parsed };
    cachedAt = now;
    return cached;
  } catch {
    cached = DEFAULT_PERFORMANCE;
    cachedAt = now;
    return cached;
  }
}

/**
 * Get grimoire category weights from orbit data.
 * Returns a weighted array where higher-performing categories appear more often.
 */
export function getWeightedGrimoireCategories(): string[] {
  const perf = getOrbitPerformance();
  const weights = perf.grimoireCategories.weights;
  const result: string[] = [];

  for (const [category, weight] of Object.entries(weights)) {
    // Convert weight to count (e.g. 0.35 → 7 entries out of 20)
    const count = Math.max(1, Math.round(weight * 20));
    for (let i = 0; i < count; i++) {
      result.push(category);
    }
  }

  return result;
}

/**
 * Get new hook suggestions for a specific pillar.
 * These come from orbit's researcher via competitor analysis.
 */
export function getOrbitHookSuggestions(pillar: ThreadsPillar): string[] {
  const perf = getOrbitPerformance();
  return perf.newHookSuggestions
    .filter((s) => s.pillar === pillar)
    .map((s) => s.hook);
}

/**
 * Check if a hook pattern should be avoided based on orbit data.
 */
export function shouldAvoidHook(pillar: ThreadsPillar, hook: string): boolean {
  const perf = getOrbitPerformance();
  const rankings = perf.hookRankings[pillar];
  if (!rankings?.avoidPatterns.length) return false;

  const lowerHook = hook.toLowerCase();
  return rankings.avoidPatterns.some((pattern) =>
    lowerHook.includes(pattern.toLowerCase()),
  );
}

/**
 * Get the best CTA suggestions from orbit performance data.
 */
export function getTopCTAs(): string[] {
  const perf = getOrbitPerformance();
  return perf.ctaInsights.topPerformingCTAs;
}
