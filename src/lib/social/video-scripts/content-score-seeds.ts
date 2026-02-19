/**
 * Seed weights for content scoring engine
 *
 * Baseline weights derived from 109-post TikTok performance analysis.
 * These are used as starting values before the system has enough
 * video_performance data to compute its own weights.
 *
 * Weights are 0-1 probability values used by the dynamic scheduler
 * to select content types for weekly slots.
 */

/** Performance tier classification */
export type PerformanceTier = 'S' | 'A' | 'B' | 'C' | 'D';

export interface SeedWeight {
  weight: number;
  tier: PerformanceTier;
  avgViews: number; // From 109-post analysis
  maxPerWeek: number; // Scheduling constraint
}

/**
 * Seed weights by content category.
 * Categories map to ContentType values used in scheduling.
 */
export const SEED_WEIGHTS: Record<string, SeedWeight> = {
  'angel-number': {
    weight: 1.0,
    tier: 'S',
    avgViews: 3000,
    maxPerWeek: 2,
  },
  'sign-identity': {
    weight: 0.85,
    tier: 'A',
    avgViews: 898,
    maxPerWeek: 7,
  },
  'chiron-sign': {
    weight: 0.75,
    tier: 'A',
    avgViews: 450,
    maxPerWeek: 3,
  },
  'numerology-sign': {
    weight: 0.75,
    tier: 'A',
    avgViews: 749,
    maxPerWeek: 3,
  },
  'sign-origin': {
    weight: 0.7,
    tier: 'A',
    avgViews: 898,
    maxPerWeek: 3,
  },
  'sign-check': {
    weight: 0.65,
    tier: 'A',
    avgViews: 400,
    maxPerWeek: 4,
  },
  ranking: {
    weight: 0.5,
    tier: 'B',
    avgViews: 280,
    maxPerWeek: 4,
  },
  'hot-take': {
    weight: 0.5,
    tier: 'B',
    avgViews: 280,
    maxPerWeek: 3,
  },
  quiz: {
    weight: 0.5,
    tier: 'B',
    avgViews: 280,
    maxPerWeek: 3,
  },
  'transit-alert': {
    weight: 0.45,
    tier: 'B',
    avgViews: 418,
    maxPerWeek: 2,
  },
  'did-you-know': {
    weight: 0.35,
    tier: 'B',
    avgViews: 280,
    maxPerWeek: 2,
  },
  myth: {
    weight: 0.3,
    tier: 'C',
    avgViews: 250,
    maxPerWeek: 1,
  },
  'aspect-educational': {
    weight: 0.15,
    tier: 'C',
    avgViews: 200,
    maxPerWeek: 1,
  },
  'crystal-healing': {
    weight: 0.1,
    tier: 'C',
    avgViews: 240,
    maxPerWeek: 1,
  },
  rune: {
    weight: 0.1,
    tier: 'C',
    avgViews: 255,
    maxPerWeek: 1,
  },
  'saturn-return': {
    weight: 0.0,
    tier: 'D',
    avgViews: 35,
    maxPerWeek: 0,
  },
  spells: {
    weight: 0.0,
    tier: 'D',
    avgViews: 5,
    maxPerWeek: 0,
  },
  'generic-educational': {
    weight: 0.0,
    tier: 'D',
    avgViews: 231,
    maxPerWeek: 0,
  },
};

/**
 * Categories that should never be scheduled.
 * Avg views < 100 over 109-post dataset.
 */
export const SUPPRESS_LIST = new Set([
  'saturn-return',
  'spells',
  'generic-educational',
]);

/**
 * Minimum number of performance records needed before
 * the system trusts computed weights over seed weights.
 */
export const MIN_DATA_POINTS_FOR_LIVE_WEIGHTS = 10;

/**
 * Content rules learned from performance data:
 * - Naming a specific sign in the hook = 2-4x views vs generic
 * - Comments are the growth multiplier (711 comments drove 7,420 views)
 * - "Save this" CTA kills reach — TikTok suppresses it
 * - Shorter videos (21s) outperform longer (28-30s)
 * - Chiron + specific sign = reliable 300-585 views
 */
export const PERFORMANCE_RULES = {
  signSpecificMultiplier: 3.0,
  commentsWeight: 3.0,
  sharesWeight: 2.0,
  likesWeight: 1.0,
  viewsWeight: 0.3,
  optimalDurationSeconds: 21,
  maxEngagementDurationSeconds: 25,
} as const;
