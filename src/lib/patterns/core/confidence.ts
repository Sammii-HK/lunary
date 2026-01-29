/**
 * Confidence scoring algorithm for cosmic patterns
 * Calculates how confident we are that a pattern is real vs random
 */

import {
  CONFIDENCE_WEIGHTS,
  PATTERN_CONSTANTS,
  EXPECTED_FREQUENCY,
} from './constants';
import {
  chiSquaredTest,
  frequencyRatio,
  normalizeConfidence,
} from '../utils/statistical';
import type { ConfidenceFactors } from '../types';

/**
 * Calculate confidence score for a pattern
 *
 * Formula components:
 * 1. Base frequency: How much observed differs from expected
 * 2. Sample size bonus: Reward patterns with more occurrences
 * 3. Time window penalty: Penalize insufficient analysis window
 * 4. Statistical significance: Chi-squared test result
 *
 * @returns Confidence score 0-1 (minimum 0.6 to be considered valid)
 */
export function calculateConfidence(params: {
  occurrences: number;
  totalEvents: number;
  expectedFrequency: number;
  daysAnalyzed: number;
}): { confidence: number; factors: ConfidenceFactors } {
  const { occurrences, totalEvents, expectedFrequency, daysAnalyzed } = params;

  // 1. Base frequency score (how much more than expected)
  const ratio = frequencyRatio(occurrences, totalEvents, expectedFrequency);
  const baseFrequency = Math.min(
    ratio * CONFIDENCE_WEIGHTS.FREQUENCY_RATIO_WEIGHT,
    0.5,
  );

  // 2. Sample size bonus (more occurrences = more confidence)
  const sampleSizeBonus = Math.min(
    occurrences / CONFIDENCE_WEIGHTS.SAMPLE_SIZE_BONUS_DIVISOR,
    CONFIDENCE_WEIGHTS.SAMPLE_SIZE_BONUS_MAX,
  );

  // 3. Time window penalty (insufficient data range)
  const timeWindowPenalty =
    daysAnalyzed < CONFIDENCE_WEIGHTS.TIME_WINDOW_PENALTY_THRESHOLD
      ? CONFIDENCE_WEIGHTS.TIME_WINDOW_PENALTY
      : 0;

  // 4. Statistical significance (chi-squared test)
  const chiSquared = chiSquaredTest(
    occurrences,
    totalEvents,
    expectedFrequency,
  );
  const statisticalSignificance = Math.min(
    chiSquared * CONFIDENCE_WEIGHTS.CHI_SQUARED_WEIGHT,
    0.3,
  );

  // Combine all factors
  const rawConfidence =
    baseFrequency +
    sampleSizeBonus -
    timeWindowPenalty +
    statisticalSignificance;

  const confidence = normalizeConfidence(rawConfidence);

  return {
    confidence,
    factors: {
      baseFrequency,
      sampleSizeBonus,
      timeWindowPenalty,
      statisticalSignificance,
    },
  };
}

/**
 * Check if a pattern meets minimum confidence threshold
 */
export function meetsConfidenceThreshold(confidence: number): boolean {
  return confidence >= PATTERN_CONSTANTS.MIN_CONFIDENCE;
}

/**
 * Check if a pattern meets minimum occurrence threshold
 */
export function meetsOccurrenceThreshold(occurrences: number): boolean {
  return occurrences >= PATTERN_CONSTANTS.MIN_OCCURRENCES;
}

/**
 * Get expected frequency for moon phase patterns
 */
export function getMoonPhaseExpectedFrequency(moonPhase: string): number {
  const frequency =
    EXPECTED_FREQUENCY.moonPhase[
      moonPhase as keyof typeof EXPECTED_FREQUENCY.moonPhase
    ];
  return frequency || 1 / 8; // Default to 1/8 if unknown phase
}

/**
 * Get expected frequency for planetary sign patterns
 */
export function getPlanetarySignExpectedFrequency(planet: string): number {
  const frequency =
    EXPECTED_FREQUENCY.planetarySign[
      planet as keyof typeof EXPECTED_FREQUENCY.planetarySign
    ];
  return frequency || 1 / 12; // Default to 1/12 if unknown planet
}

/**
 * Get expected frequency for aspect patterns
 */
export function getAspectExpectedFrequency(aspectType: string): number {
  const normalizedType = aspectType.toLowerCase();
  const frequency =
    EXPECTED_FREQUENCY.aspects[
      normalizedType as keyof typeof EXPECTED_FREQUENCY.aspects
    ];
  return frequency || 0.05; // Default to 5% if unknown aspect
}

/**
 * Get expected frequency for natal transit patterns
 */
export function getNatalTransitExpectedFrequency(aspectType: string): number {
  const normalizedType = aspectType.toLowerCase();
  const frequency =
    EXPECTED_FREQUENCY.natalTransit[
      normalizedType as keyof typeof EXPECTED_FREQUENCY.natalTransit
    ];
  return frequency || 0.03; // Default to 3% if unknown aspect
}
