/**
 * Statistical weighting for Major vs Minor Arcana
 *
 * Standard Tarot Deck Composition:
 * - 22 Major Arcana cards (28.2% of deck)
 * - 56 Minor Arcana cards (71.8% of deck)
 *
 * When calculating percentages, Major Arcana appearances are statistically
 * more significant due to lower availability.
 */

export const DECK_COMPOSITION = {
  MAJOR_ARCANA_COUNT: 22,
  MINOR_ARCANA_COUNT: 56,
  TOTAL_CARDS: 78,
} as const;

export const EXPECTED_FREQUENCIES = {
  MAJOR_ARCANA:
    DECK_COMPOSITION.MAJOR_ARCANA_COUNT / DECK_COMPOSITION.TOTAL_CARDS, // ~28.2%
  MINOR_ARCANA:
    DECK_COMPOSITION.MINOR_ARCANA_COUNT / DECK_COMPOSITION.TOTAL_CARDS, // ~71.8%
} as const;

/**
 * Calculate weighted percentage accounting for deck composition
 *
 * A Major Arcana appearing 10% of the time is more significant than
 * Minor Arcana appearing 10% of the time, because there are fewer Major cards.
 */
export function calculateWeightedPercentage(
  actualPercentage: number,
  cardType: 'major' | 'minor',
): {
  actual: number;
  expected: number;
  deviation: number;
  significance: 'high' | 'moderate' | 'normal';
} {
  const expected =
    cardType === 'major'
      ? EXPECTED_FREQUENCIES.MAJOR_ARCANA * 100
      : EXPECTED_FREQUENCIES.MINOR_ARCANA * 100;

  const deviation = actualPercentage - expected;
  const deviationPercent = (deviation / expected) * 100;

  // Determine significance
  let significance: 'high' | 'moderate' | 'normal';
  if (Math.abs(deviationPercent) > 50) {
    significance = 'high';
  } else if (Math.abs(deviationPercent) > 25) {
    significance = 'moderate';
  } else {
    significance = 'normal';
  }

  return {
    actual: actualPercentage,
    expected: Math.round(expected * 10) / 10,
    deviation: Math.round(deviation * 10) / 10,
    significance,
  };
}

/**
 * Get a human-readable interpretation of arcana balance
 */
export function interpretArcanaBalance(
  majorCount: number,
  minorCount: number,
): {
  interpretation: string;
  focus: string;
  color: 'primary' | 'secondary' | 'success';
} {
  const total = majorCount + minorCount;
  if (total === 0) {
    return {
      interpretation: 'No readings yet',
      focus: 'Start your first reading',
      color: 'secondary',
    };
  }

  const majorPercentage = (majorCount / total) * 100;
  const stats = calculateWeightedPercentage(majorPercentage, 'major');

  if (stats.deviation > 15) {
    // Significantly more Major Arcana than expected
    return {
      interpretation: `${Math.round(majorPercentage)}% Major Arcana (${stats.deviation > 0 ? '+' : ''}${stats.deviation}% above average)`,
      focus: 'Big life themes and transformations are present',
      color: 'primary',
    };
  } else if (stats.deviation < -10) {
    // Significantly fewer Major Arcana than expected
    return {
      interpretation: `${Math.round(majorPercentage)}% Major Arcana (${stats.deviation}% below average)`,
      focus: 'Focus on everyday experiences and practical matters',
      color: 'secondary',
    };
  } else {
    // Balanced
    return {
      interpretation: `${Math.round(majorPercentage)}% Major Arcana (balanced)`,
      focus: 'Healthy mix of major themes and daily life',
      color: 'success',
    };
  }
}
