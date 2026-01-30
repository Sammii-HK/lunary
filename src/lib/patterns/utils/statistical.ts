/**
 * Statistical utilities for pattern confidence scoring
 */

import { STATISTICAL_THRESHOLDS } from '../core/constants';

/**
 * Chi-squared test for statistical significance
 * Tests if observed frequency differs significantly from expected
 *
 * @param observed Number of observed occurrences
 * @param total Total number of events
 * @param expectedFrequency Expected frequency (0-1)
 * @returns Chi-squared statistic (higher = more significant)
 */
export function chiSquaredTest(
  observed: number,
  total: number,
  expectedFrequency: number,
): number {
  const expected = total * expectedFrequency;

  // Chi-squared test requires minimum expected count
  if (expected < STATISTICAL_THRESHOLDS.MIN_EXPECTED_COUNT) {
    return 0;
  }

  // Chi-squared formula: Σ((observed - expected)² / expected)
  const chiSquared = Math.pow(observed - expected, 2) / expected;

  return chiSquared;
}

/**
 * Check if chi-squared result is statistically significant
 * p < 0.05 threshold (95% confidence)
 */
export function isStatisticallySignificant(chiSquared: number): boolean {
  return chiSquared >= STATISTICAL_THRESHOLDS.CHI_SQUARED_CRITICAL_VALUE;
}

/**
 * Calculate percentage deviation from expected
 * Positive = more than expected, Negative = less than expected
 */
export function percentageDeviation(
  observed: number,
  total: number,
  expectedFrequency: number,
): number {
  const expected = total * expectedFrequency;
  if (expected === 0) return 0;

  const observedPercentage = (observed / total) * 100;
  const expectedPercentage = expectedFrequency * 100;

  return ((observedPercentage - expectedPercentage) / expectedPercentage) * 100;
}

/**
 * Calculate frequency ratio (observed / expected)
 * 1.0 = exactly as expected
 * > 1.0 = more than expected
 * < 1.0 = less than expected
 */
export function frequencyRatio(
  observed: number,
  total: number,
  expectedFrequency: number,
): number {
  const expected = total * expectedFrequency;
  if (expected === 0) return 0;

  const observedFrequency = observed / total;
  return observedFrequency / expectedFrequency;
}

/**
 * Normalize confidence score to 0-1 range
 */
export function normalizeConfidence(score: number): number {
  return Math.max(0, Math.min(1, score));
}
