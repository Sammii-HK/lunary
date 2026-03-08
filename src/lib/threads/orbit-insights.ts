import type { ThreadsPillar } from './types';

const OPEN_WEBUI_URL = process.env.OPEN_WEBUI_URL || 'http://localhost:8080';
const OPEN_WEBUI_API_KEY = process.env.OPEN_WEBUI_API_KEY || '';
const ORBIT_PERFORMANCE_MEMORY_ID = 'a67fc9fe-61a2-4902-b7cb-38a4481206a0';

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
 * Load orbit performance data from Open WebUI hive mind.
 * Cached for 5 minutes. Falls back to defaults if unavailable.
 */
export async function getOrbitPerformance(): Promise<OrbitPerformance> {
  const now = Date.now();
  if (cached && now - cachedAt < CACHE_TTL_MS) return cached;

  try {
    const res = await fetch(
      `${OPEN_WEBUI_URL}/api/v1/memories/${ORBIT_PERFORMANCE_MEMORY_ID}`,
      {
        headers: { Authorization: `Bearer ${OPEN_WEBUI_API_KEY}` },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const memory = (await res.json()) as { content: string };
    const jsonStr = memory.content.replace(/^\[orbit-performance\]\s*/, '');
    const parsed = JSON.parse(jsonStr) as Partial<OrbitPerformance>;
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
export async function getWeightedGrimoireCategories(): Promise<string[]> {
  const perf = await getOrbitPerformance();
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
export async function getOrbitHookSuggestions(
  pillar: ThreadsPillar,
): Promise<string[]> {
  const perf = await getOrbitPerformance();
  return perf.newHookSuggestions
    .filter((s) => s.pillar === pillar)
    .map((s) => s.hook);
}

/**
 * Check if a hook pattern should be avoided based on orbit data.
 */
export async function shouldAvoidHook(
  pillar: ThreadsPillar,
  hook: string,
): Promise<boolean> {
  const perf = await getOrbitPerformance();
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
export async function getTopCTAs(): Promise<string[]> {
  const perf = await getOrbitPerformance();
  return perf.ctaInsights.topPerformingCTAs;
}
