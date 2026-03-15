/**
 * Content scoring engine for self-healing TikTok scheduler
 *
 * Queries video_performance to compute rolling weighted scores per content
 * category. Converts raw metrics into scheduling weights (0-1 probability)
 * that the dynamic scheduler uses to pick content types for each slot.
 *
 * Falls back to hardcoded seed weights when insufficient data.
 */

import { getContentCategoryScores } from './database';
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
}

/**
 * Compute scheduling weights for all content categories.
 *
 * Blends live performance data with seed weights based on data availability.
 * Categories with more data points lean more on live scores; categories with
 * few or zero records lean on the 109-post seed analysis.
 *
 * @param days - Rolling window in days (default 30)
 */
export async function getContentTypeWeights(
  days: number = 30,
): Promise<Map<string, CategoryScore>> {
  const liveScores = await getContentCategoryScores(days);
  const liveMap = new Map(liveScores.map((s) => [s.category, s]));

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

  for (const category of allCategories) {
    const seed = SEED_WEIGHTS[category];
    const live = liveMap.get(category);

    // Suppressed categories always get zero weight
    if (SUPPRESS_LIST.has(category)) {
      weights.set(category, {
        score: 0,
        count: live?.count ?? 0,
        avgViews: live?.avgViews ?? seed?.avgViews ?? 0,
        trend: live?.trend ?? 0,
        weight: 0,
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
      });
    } else {
      // Enough live data — compute weight from performance
      const normalizedScore = live.score / maxScore;

      // Boost trending content, penalise declining
      const trendBoost = live.trend > 0 ? Math.min(live.trend * 0.15, 0.15) : 0;
      const trendPenalty =
        live.trend < -0.3 ? Math.max(live.trend * 0.1, -0.15) : 0;

      const computedWeight = Math.min(
        1,
        Math.max(0, normalizedScore + trendBoost + trendPenalty),
      );

      weights.set(category, {
        score: live.score,
        count: live.count,
        avgViews: live.avgViews,
        trend: live.trend,
        weight: computedWeight,
      });
    }
  }

  return weights;
}

/**
 * Get categories that should be suppressed (avg views < 100 over window).
 * Combines the static suppress list with dynamically detected poor performers.
 */
export async function getSuppressedCategories(
  days: number = 30,
): Promise<Set<string>> {
  const suppressed = new Set(SUPPRESS_LIST);

  const liveScores = await getContentCategoryScores(days);
  for (const score of liveScores) {
    // Auto-suppress if consistently below 100 views with enough data
    if (
      score.avgViews < 100 &&
      score.count >= MIN_DATA_POINTS_FOR_LIVE_WEIGHTS
    ) {
      suppressed.add(score.category);
    }
  }

  return suppressed;
}

/**
 * Get categories performing well enough for heavy rotation (avg views > 400).
 */
export async function getPromotedCategories(
  days: number = 30,
): Promise<Set<string>> {
  const promoted = new Set<string>();

  const liveScores = await getContentCategoryScores(days);
  for (const score of liveScores) {
    if (score.avgViews > 400 && score.count >= 3) {
      promoted.add(score.category);
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
 * Exploration windows for each slot — the hours we'll test within.
 * 80% of the time we pick the proven best hour (exploit).
 * 20% of the time we test a random hour from the window (explore).
 * This ensures we gather comparison data while mostly using what works.
 */
const SLOT_HOUR_WINDOWS: Record<string, number[]> = {
  engagementC: [10, 11, 12],
  primary: [13, 14, 15],
  engagementA: [16, 17, 18],
  engagementB: [19, 20, 21, 22],
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
 * @param slot - The video slot to optimise
 * @param minDataPoints - Minimum records per hour before trusting the result (default 10)
 */
export async function getOptimalHourBySlot(
  slot: string,
  minDataPoints: number = 10,
): Promise<number> {
  const { VIDEO_POSTING_HOURS } = await import('@/utils/posting-times');
  const defaultHour =
    VIDEO_POSTING_HOURS[slot as keyof typeof VIDEO_POSTING_HOURS];
  const window = SLOT_HOUR_WINDOWS[slot];

  if (!window) return defaultHour ?? 14;

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
