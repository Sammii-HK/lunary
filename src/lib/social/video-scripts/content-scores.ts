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

export { PERFORMANCE_RULES };
