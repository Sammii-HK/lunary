/**
 * Content scoring engine for self-healing TikTok scheduler
 *
 * Queries video_performance to compute rolling weighted scores per content
 * category. Converts raw metrics into scheduling weights (0-1 probability)
 * that the dynamic scheduler uses to pick content types for each slot.
 *
 * Falls back to hardcoded seed weights when insufficient data.
 *
 * EDA layer: viral z-scores, cross-channel blending (video + social + SEO),
 * category x slot/day/hour profiling, HHI concentration, and explore/exploit
 * for both timing and category selection.
 */

import { getContentCategoryScores, getContentEDASignals } from './database';
import type { ContentEDASignals } from './database';
import {
  SEED_WEIGHTS,
  SUPPRESS_LIST,
  MIN_DATA_POINTS_FOR_LIVE_WEIGHTS,
  PERFORMANCE_RULES,
} from './content-score-seeds';

export interface CategoryScore {
  score: number;
  count: number;
  avgViews: number;
  trend: number; // Positive = improving, negative = declining
  weight: number; // 0-1 scheduling probability
  viralScore?: number; // z-score composite (reach + engagement quality)
}

// ── EDA Signal Cache (per account set) ───────────────────────────────────

/** Cached EDA signals keyed by account set ID (refreshed every 30 minutes) */
const edaCacheMap = new Map<
  string,
  { signals: ContentEDASignals; fetchedAt: number }
>();
const EDA_CACHE_TTL = 30 * 60 * 1000;
const ALL_ACCOUNTS_KEY = '__all__';

/**
 * Get EDA signals with caching (30-min TTL), scoped to an account set.
 * Pass null/undefined for cross-account signals.
 * Never throws — returns null on failure.
 */
export async function getCachedEDASignals(
  accountSetId?: string | null,
): Promise<ContentEDASignals | null> {
  const cacheKey = accountSetId ?? ALL_ACCOUNTS_KEY;
  const cached = edaCacheMap.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < EDA_CACHE_TTL) {
    return cached.signals;
  }
  try {
    const signals = await getContentEDASignals(30, accountSetId);
    edaCacheMap.set(cacheKey, { signals, fetchedAt: Date.now() });
    return signals;
  } catch {
    return cached?.signals ?? null;
  }
}

// ── Content Type Weights ──────────────────────────────────────────────────

/**
 * Compute scheduling weights for all content categories.
 *
 * Blends live performance data with seed weights based on data availability.
 * When EDA signals are available, blends in cross-channel scores (video 50%
 * + social 30% + SEO 20%) for a unified view of what content actually works.
 *
 * @param days - Rolling window in days (default 30)
 */
export async function getContentTypeWeights(
  days: number = 30,
  accountSetId?: string | null,
): Promise<Map<string, CategoryScore>> {
  const liveScores = await getContentCategoryScores(days, accountSetId);
  const liveMap = new Map(liveScores.map((s) => [s.category, s]));

  // Load EDA viral scores (non-blocking, cached, per-account)
  const eda = await getCachedEDASignals(accountSetId);
  const viralMap = new Map(
    eda?.categoryViralScores.map((v) => [v.category, v]) ?? [],
  );

  const weights = new Map<string, CategoryScore>();

  // Process all known categories (seed + live)
  const allCategories = new Set([
    ...Object.keys(SEED_WEIGHTS),
    ...liveScores.map((s) => s.category),
  ]);

  // Find max score for normalisation
  let maxScore = 1;
  for (const live of liveScores) {
    if (live.score > maxScore) maxScore = live.score;
  }

  // Find viral score range for normalisation
  const viralScores = eda?.categoryViralScores ?? [];
  const maxViral = viralScores.length
    ? Math.max(...viralScores.map((v) => v.viralScore))
    : 0;
  const minViral = viralScores.length
    ? Math.min(...viralScores.map((v) => v.viralScore))
    : 0;
  const viralRange = maxViral - minViral || 1;

  for (const category of allCategories) {
    const seed = SEED_WEIGHTS[category];
    const live = liveMap.get(category);
    const viral = viralMap.get(category);

    // Suppressed categories always get zero weight
    if (SUPPRESS_LIST.has(category)) {
      weights.set(category, {
        score: 0,
        count: live?.count ?? 0,
        avgViews: live?.avgViews ?? seed?.avgViews ?? 0,
        trend: live?.trend ?? 0,
        weight: 0,
        viralScore: viral?.viralScore,
      });
      continue;
    }

    if (!live || live.count < MIN_DATA_POINTS_FOR_LIVE_WEIGHTS) {
      // Not enough live data — use seed weight with small live adjustment
      const seedWeight = seed?.weight ?? 0.3;
      const liveAdjust =
        live && live.count >= 3
          ? (live.score / maxScore) * 0.2 // Slight live influence
          : 0;

      weights.set(category, {
        score: live?.score ?? 0,
        count: live?.count ?? 0,
        avgViews: live?.avgViews ?? seed?.avgViews ?? 0,
        trend: live?.trend ?? 0,
        weight: Math.min(1, seedWeight + liveAdjust),
        viralScore: viral?.viralScore,
      });
    } else {
      // Enough live data — compute weight blending legacy score with viral score
      const normalizedScore = live.score / maxScore;

      // Boost trending content, penalise declining
      const trendBoost = live.trend > 0 ? Math.min(live.trend * 0.15, 0.15) : 0;
      const trendPenalty =
        live.trend < -0.3 ? Math.max(live.trend * 0.1, -0.15) : 0;

      let computedWeight = normalizedScore + trendBoost + trendPenalty;

      // Blend in cross-channel score when available (video + social + SEO)
      // Falls back to viral-only score if cross-channel data missing
      if (eda && eda.confidence !== 'low') {
        const crossChannel = eda.crossChannelScores.find(
          (c) => c.category === category,
        );
        if (crossChannel) {
          // 70% legacy score, 30% unified cross-channel score
          computedWeight =
            computedWeight * 0.7 + crossChannel.unifiedScore * 0.3;
        } else if (viral) {
          const normalizedViral = (viral.viralScore - minViral) / viralRange;
          computedWeight = computedWeight * 0.7 + normalizedViral * 0.3;
        }
      }

      weights.set(category, {
        score: live.score,
        count: live.count,
        avgViews: live.avgViews,
        trend: live.trend,
        weight: Math.min(1, Math.max(0, computedWeight)),
        viralScore: viral?.viralScore,
      });
    }
  }

  return weights;
}

// ── Suppress / Promote ────────────────────────────────────────────────────

/**
 * Get categories that should be suppressed.
 * Uses viral score when available (suppress bottom quartile with enough data),
 * falls back to avg views < 100 threshold.
 */
export async function getSuppressedCategories(
  days: number = 30,
): Promise<Set<string>> {
  const suppressed = new Set(SUPPRESS_LIST);

  const eda = await getCachedEDASignals();
  const liveScores = await getContentCategoryScores(days);

  if (eda && eda.confidence !== 'low' && eda.categoryViralScores.length >= 4) {
    // Use viral score: suppress categories in bottom quartile with enough data
    const sorted = [...eda.categoryViralScores].sort(
      (a, b) => a.viralScore - b.viralScore,
    );
    const q25Index = Math.floor(sorted.length * 0.25);
    const q25Threshold = sorted[q25Index]?.viralScore ?? -Infinity;

    for (const cat of sorted) {
      if (
        cat.viralScore <= q25Threshold &&
        cat.count >= MIN_DATA_POINTS_FOR_LIVE_WEIGHTS
      ) {
        suppressed.add(cat.category);
      }
    }
  } else {
    // Fallback: raw views threshold
    for (const score of liveScores) {
      if (
        score.avgViews < 100 &&
        score.count >= MIN_DATA_POINTS_FOR_LIVE_WEIGHTS
      ) {
        suppressed.add(score.category);
      }
    }
  }

  return suppressed;
}

/**
 * Get categories performing well enough for heavy rotation.
 * Uses viral score when available (top quartile), falls back to avg views > 400.
 */
export async function getPromotedCategories(
  days: number = 30,
): Promise<Set<string>> {
  const promoted = new Set<string>();

  const eda = await getCachedEDASignals();
  const liveScores = await getContentCategoryScores(days);

  if (eda && eda.confidence !== 'low' && eda.categoryViralScores.length >= 4) {
    // Use viral score: promote categories in top quartile
    const sorted = [...eda.categoryViralScores].sort(
      (a, b) => b.viralScore - a.viralScore,
    );
    const q75Index = Math.floor(sorted.length * 0.25);
    const q75Threshold = sorted[q75Index]?.viralScore ?? Infinity;

    for (const cat of sorted) {
      if (cat.viralScore >= q75Threshold && cat.count >= 3) {
        promoted.add(cat.category);
      }
    }
  } else {
    // Fallback: raw views threshold
    for (const score of liveScores) {
      if (score.avgViews > 400 && score.count >= 3) {
        promoted.add(score.category);
      }
    }
  }

  // Always include seed S/A-tier if no live data contradicts
  if (promoted.size === 0) {
    for (const [category, seed] of Object.entries(SEED_WEIGHTS)) {
      if (seed.weight >= 0.7) {
        promoted.add(category);
      }
    }
  }

  return promoted;
}

// ── Category Selection ────────────────────────────────────────────────────

export type SelectionMethod =
  | 'eda-exploit-day-slot'
  | 'eda-exploit-day'
  | 'eda-explore'
  | 'fallback-weighted'
  | 'fallback-deterministic';

export interface SmartSelection {
  category: string | null;
  method: SelectionMethod;
}

/**
 * Select a content type using weighted random selection.
 * Higher-weighted categories are more likely to be picked.
 *
 * @param weights - Map of category to score data
 * @param exclude - Categories to skip (e.g. already used today)
 * @param seed - Deterministic seed for reproducible selection
 */
export function weightedSelect(
  weights: Map<string, CategoryScore>,
  exclude: Set<string>,
  seed: number,
): string | null {
  const candidates: Array<{ category: string; weight: number }> = [];

  for (const [category, data] of weights) {
    if (exclude.has(category) || data.weight <= 0) continue;
    candidates.push({ category, weight: data.weight });
  }

  if (candidates.length === 0) return null;

  const totalWeight = candidates.reduce((sum, c) => sum + c.weight, 0);
  // Use seed for deterministic selection
  const target = (((seed * 9301 + 49297) % 233280) / 233280) * totalWeight;

  let cumulative = 0;
  for (const candidate of candidates) {
    cumulative += candidate.weight;
    if (cumulative >= target) {
      return candidate.category;
    }
  }

  return candidates[candidates.length - 1].category;
}

/**
 * Smart category selection using EDA signals.
 *
 * Uses an explore/exploit strategy informed by:
 * - Category x day-of-week performance (what works on this day)
 * - Category x slot performance (what works in this time slot)
 * - Concentration (HHI) to force diversity when one category dominates
 * - 80% exploit proven winners, 20% explore underrepresented categories
 *
 * Falls back to weightedSelect when EDA data is unavailable.
 *
 * @param weights - Pre-computed category weights
 * @param exclude - Categories to skip
 * @param seed - Deterministic seed
 * @param dayOfWeek - JS day (0=Sun, 6=Sat)
 * @param slot - Optional slot name (primary, engagementA, etc.)
 */
export async function selectSmartCategory(
  weights: Map<string, CategoryScore>,
  exclude: Set<string>,
  seed: number,
  dayOfWeek: number,
  slot?: string,
  accountSetId?: string | null,
): Promise<SmartSelection> {
  const eda = await getCachedEDASignals(accountSetId);

  // No EDA data — fall back to basic weighted selection
  if (!eda || eda.confidence === 'low') {
    return {
      category: weightedSelect(weights, exclude, seed),
      method: 'fallback-weighted',
    };
  }

  // Check concentration — if one category dominates, force diversity
  const concentration = eda.concentrationHHI;
  const forceExplore = concentration > 0.25;

  // 80/20 explore/exploit (forced explore if HHI too high)
  const exploreRoll = ((seed * 7919 + 104729) % 233280) / 233280;
  const shouldExplore = forceExplore || exploreRoll < 0.2;

  if (!shouldExplore) {
    // EXPLOIT: pick the best category for this day + slot combo
    const dayBest = await getBestCategoriesForDay(
      dayOfWeek,
      exclude,
      accountSetId,
    );
    const slotBest = slot
      ? await getBestCategoriesForSlot(slot, exclude, accountSetId)
      : null;

    // Intersect day-best and slot-best if both available
    if (dayBest && slotBest) {
      const slotSet = new Set(slotBest);
      const intersection = dayBest.filter((c) => slotSet.has(c));
      if (intersection.length > 0) {
        // Pick top from intersection, weighted by score
        const topPick = intersection[0];
        if (weights.has(topPick) && (weights.get(topPick)?.weight ?? 0) > 0) {
          return { category: topPick, method: 'eda-exploit-day-slot' };
        }
      }
    }

    // Use day-best alone
    if (dayBest) {
      for (const cat of dayBest) {
        if (weights.has(cat) && (weights.get(cat)?.weight ?? 0) > 0) {
          return { category: cat, method: 'eda-exploit-day' };
        }
      }
    }

    // Fall back to weighted selection
    return {
      category: weightedSelect(weights, exclude, seed),
      method: 'fallback-weighted',
    };
  }

  // EXPLORE: pick an underrepresented category to test
  // Find categories with low post count (bottom half by volume)
  const categoryCounts = new Map(
    eda.categoryShares.map((s) => [s.category, s.count]),
  );
  const medianCount = eda.totalPosts / Math.max(eda.categoryShares.length, 1);

  const underrepresented: Array<{ category: string; weight: number }> = [];
  for (const [category, data] of weights) {
    if (exclude.has(category) || data.weight <= 0) continue;
    const count = categoryCounts.get(category) ?? 0;
    if (count < medianCount) {
      // Boost weight for exploration — less-tested categories get more chance
      const explorationBoost = 1 + (1 - count / Math.max(medianCount, 1));
      underrepresented.push({
        category,
        weight: data.weight * explorationBoost,
      });
    }
  }

  if (underrepresented.length > 0) {
    // Weighted random from underrepresented pool
    const totalWeight = underrepresented.reduce((s, c) => s + c.weight, 0);
    const target = (((seed * 3571 + 49297) % 233280) / 233280) * totalWeight;
    let cumulative = 0;
    for (const c of underrepresented) {
      cumulative += c.weight;
      if (cumulative >= target) {
        console.log(
          `[EDA Explore] Picking underrepresented category: ${c.category} (count: ${categoryCounts.get(c.category) ?? 0}, median: ${Math.round(medianCount)}, HHI: ${concentration.toFixed(3)})`,
        );
        return { category: c.category, method: 'eda-explore' as const };
      }
    }
    return {
      category: underrepresented[underrepresented.length - 1].category,
      method: 'eda-explore' as const,
    };
  }

  // No underrepresented candidates — standard weighted selection
  return {
    category: weightedSelect(weights, exclude, seed),
    method: 'fallback-weighted' as const,
  };
}

// ── Timing Optimisation ───────────────────────────────────────────────────

/**
 * Exploration windows for each slot — the hours we'll test within.
 * 80% of the time we pick the proven best hour (exploit).
 * 20% of the time we test a random hour from the window (explore).
 * This ensures we gather comparison data while mostly using what works.
 */
const SLOT_HOUR_WINDOWS: Record<string, number[]> = {
  primary: [14, 15, 16],
  engagementA: [17, 18, 19],
  engagementB: [21, 22, 23],
  engagementC: [0, 1, 2],
};

/** Probability of exploring a new hour vs exploiting the known best */
const EXPLORE_RATE = 0.2;

/**
 * Get the optimal posting hour for a given engagement slot based on
 * actual performance data. Uses an explore/exploit strategy:
 *
 * - When a proven best hour exists (10+ data points), use it 80% of the time
 * - 20% of the time, test a different hour from the slot's window
 * - When no proven best exists, rotate through the window to gather data
 *
 * Level 4 enhancement: when a category is provided, checks the EDA
 * category x hour profile for category-specific optimal hours. If the
 * category has a proven best hour (different from the slot default),
 * that takes priority — the same content type may perform differently
 * at different times.
 *
 * @param slot - The video slot to optimise
 * @param minDataPoints - Minimum records per hour before trusting the result (default 10)
 * @param category - Optional content category for category-specific hour optimisation
 */
export async function getOptimalHourBySlot(
  slot: string,
  minDataPoints: number = 10,
  category?: string,
  accountSetId?: string | null,
): Promise<number> {
  const { VIDEO_POSTING_HOURS } = await import('@/utils/posting-times');
  const defaultHour =
    VIDEO_POSTING_HOURS[slot as keyof typeof VIDEO_POSTING_HOURS];
  const window = SLOT_HOUR_WINDOWS[slot];

  if (!window) return defaultHour ?? 14;

  // Level 4: check category-specific hour profile from EDA
  if (category) {
    const eda = await getCachedEDASignals(accountSetId);
    if (eda && eda.confidence !== 'low') {
      const catHours = eda.categoryHourProfile
        .filter(
          (h) =>
            h.category === category &&
            window.includes(h.scheduledHour) &&
            h.count >= 3,
        )
        .sort((a, b) => b.medianEngagement - a.medianEngagement);

      if (catHours.length > 0) {
        const bestCatHour = catHours[0];
        // Exploit/explore: 80% category-specific best hour, 20% test
        if (Math.random() > EXPLORE_RATE) {
          console.log(
            `[Time A/B] ${slot}/${category}: exploiting category-best hour ${bestCatHour.scheduledHour} (median: ${bestCatHour.medianEngagement}, n=${bestCatHour.count})`,
          );
          return bestCatHour.scheduledHour;
        }
        // Explore: pick a different hour from the window
        const alternatives = window.filter(
          (h) => h !== bestCatHour.scheduledHour,
        );
        if (alternatives.length > 0) {
          const exploreHour =
            alternatives[Math.floor(Math.random() * alternatives.length)];
          console.log(
            `[Time A/B] ${slot}/${category}: exploring hour ${exploreHour} (category-best is ${bestCatHour.scheduledHour})`,
          );
          return exploreHour;
        }
      }
    }
  }

  // Standard slot-level optimisation (no category data or fallback)
  try {
    const { sql } = await import('@vercel/postgres');

    // Get performance for all hours in this slot
    const result = await sql`
      SELECT
        scheduled_hour,
        AVG(comments * 3.0 + shares * 2.0 + likes * 1.0 + views * 0.3) as avg_engagement,
        COUNT(*)::int as sample_count
      FROM video_performance
      WHERE slot = ${slot}
        AND scheduled_hour IS NOT NULL
      GROUP BY scheduled_hour
      ORDER BY avg_engagement DESC
    `;

    // Find the proven best hour (enough data to trust)
    const provenBest = result.rows.find((r) => r.sample_count >= minDataPoints);

    if (provenBest) {
      // Exploit/explore: 80% best hour, 20% test a different hour
      if (Math.random() > EXPLORE_RATE) {
        console.log(
          `[Time A/B] ${slot}: exploiting best hour ${provenBest.scheduled_hour} (engagement: ${Math.round(provenBest.avg_engagement)}, n=${provenBest.sample_count})`,
        );
        return provenBest.scheduled_hour;
      }

      // Explore: pick a random hour from the window that ISN'T the best
      const alternatives = window.filter(
        (h) => h !== provenBest.scheduled_hour,
      );
      const exploreHour =
        alternatives[Math.floor(Math.random() * alternatives.length)];
      console.log(
        `[Time A/B] ${slot}: exploring hour ${exploreHour} (best is ${provenBest.scheduled_hour})`,
      );
      return exploreHour;
    }

    // No proven winner yet — find the least-tested hour to gather data
    const hourCounts = new Map<number, number>();
    for (const row of result.rows) {
      hourCounts.set(row.scheduled_hour, row.sample_count);
    }
    const leastTested = window.reduce((best, hour) =>
      (hourCounts.get(hour) ?? 0) < (hourCounts.get(best) ?? 0) ? hour : best,
    );
    console.log(
      `[Time A/B] ${slot}: no proven best yet, testing least-tried hour ${leastTested}`,
    );
    return leastTested;
  } catch {
    // Query failed, use default
  }

  return defaultHour ?? 14;
}

// ── EDA Signal Accessors ──────────────────────────────────────────────────

/**
 * Get the best categories for a specific slot based on EDA category x slot profile.
 * Returns categories ranked by median engagement in that slot.
 * Falls back to null if no slot-specific data exists.
 */
export async function getBestCategoriesForSlot(
  slot: string,
  exclude: Set<string>,
  accountSetId?: string | null,
): Promise<string[] | null> {
  const eda = await getCachedEDASignals(accountSetId);
  if (!eda || eda.confidence === 'low') return null;

  const slotData = eda.categorySlotProfile
    .filter((s) => s.slot === slot && !exclude.has(s.category) && s.count >= 3)
    .sort((a, b) => b.medianEngagement - a.medianEngagement);

  return slotData.length >= 2 ? slotData.map((s) => s.category) : null;
}

/**
 * Get the best categories for a specific day of week based on EDA data.
 * 0 = Sunday, 1 = Monday, ..., 6 = Saturday (JS convention)
 */
export async function getBestCategoriesForDay(
  dayOfWeek: number,
  exclude: Set<string>,
  accountSetId?: string | null,
): Promise<string[] | null> {
  const eda = await getCachedEDASignals(accountSetId);
  if (!eda || eda.confidence === 'low') return null;

  const dayData = eda.categoryDayProfile
    .filter(
      (d) =>
        d.dayOfWeek === dayOfWeek && !exclude.has(d.category) && d.count >= 3,
    )
    .sort((a, b) => b.medianEngagement - a.medianEngagement);

  return dayData.length >= 2 ? dayData.map((d) => d.category) : null;
}

/**
 * Check if the content calendar is over-concentrated on one category.
 * Returns true if HHI > 0.25 (one category dominates ~50%+ of posts).
 */
export async function isOverConcentrated(
  accountSetId?: string | null,
): Promise<{
  concentrated: boolean;
  hhi: number;
  dominantCategory?: string;
}> {
  const eda = await getCachedEDASignals(accountSetId);
  if (!eda) return { concentrated: false, hhi: 0 };

  const dominant = eda.categoryShares.sort((a, b) => b.share - a.share)[0];
  return {
    concentrated: eda.concentrationHHI > 0.25,
    hhi: eda.concentrationHHI,
    dominantCategory: dominant?.category,
  };
}

// ── Platform Performance ──────────────────────────────────────────────────

/**
 * Get aggregated performance data grouped by platform.
 * Shows which platform performs best for views and engagement overall.
 */
export async function getPlatformPerformance(): Promise<
  Map<string, { avgViews: number; avgEngagement: number; count: number }>
> {
  const { sql } = await import('@vercel/postgres');

  const result = await sql`
    SELECT
      platform,
      AVG(views)::int as avg_views,
      AVG(comments * 3.0 + shares * 2.0 + likes * 1.0 + views * 0.3)::int as avg_engagement,
      COUNT(*)::int as count
    FROM video_performance
    WHERE recorded_at >= NOW() - INTERVAL '30 days'
      AND platform IS NOT NULL
    GROUP BY platform
    ORDER BY avg_engagement DESC
  `;

  const map = new Map<
    string,
    { avgViews: number; avgEngagement: number; count: number }
  >();
  for (const row of result.rows) {
    map.set(row.platform, {
      avgViews: row.avg_views,
      avgEngagement: row.avg_engagement,
      count: row.count,
    });
  }
  return map;
}

export { PERFORMANCE_RULES };
