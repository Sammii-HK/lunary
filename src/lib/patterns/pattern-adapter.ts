/**
 * Adapter functions to transform data between different pattern formats
 */

import type {
  PatternAnalysis,
  PatternTheme,
  FrequentCard,
  SuitPattern,
} from './tarot-pattern-types';

/**
 * Transform BasicPatterns from AdvancedPatterns.tsx to PatternAnalysis format
 */
export function transformBasicPatternsToAnalysis(basicPatterns: {
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number; reading?: string }>;
  suitPatterns: Array<{
    suit: string;
    count: number;
    reading?: string;
    cards: Array<{ name: string; count: number }>;
  }>;
  numberPatterns: Array<{
    number: string;
    count: number;
    reading?: string;
    cards: string[];
  }>;
  arcanaPatterns: Array<{ type: string; count: number; reading?: string }>;
  timeFrame: number;
}): PatternAnalysis {
  // Calculate total readings from suit patterns
  const totalReadings = basicPatterns.suitPatterns.reduce(
    (sum, suit) => sum + suit.count,
    0,
  );

  // Calculate total cards for percentages
  const totalCards = basicPatterns.frequentCards.reduce(
    (sum, card) => sum + card.count,
    0,
  );

  // Transform dominant themes
  const dominantThemes: PatternTheme[] = basicPatterns.dominantThemes
    .slice(0, 5)
    .map((theme, index) => {
      // Calculate strength based on position (first theme = 100%, gradually decrease)
      const strength = Math.max(30, 100 - index * 15);
      return {
        label: theme,
        strength,
      };
    });

  // Transform frequent cards
  const frequentCards: FrequentCard[] = basicPatterns.frequentCards.map(
    (card) => ({
      name: card.name,
      count: card.count,
      percentage: totalCards > 0 ? (card.count / totalCards) * 100 : 0,
      meaning: card.reading,
      appearances: [], // Would need to be populated from actual reading data
    }),
  );

  // Transform suit patterns with percentages
  const suitPatterns: SuitPattern[] = basicPatterns.suitPatterns.map(
    (suit) => ({
      suit: suit.suit,
      count: suit.count,
      percentage: totalReadings > 0 ? (suit.count / totalReadings) * 100 : 0,
    }),
  );

  // Calculate arcana balance
  const majorArcana = basicPatterns.arcanaPatterns.find(
    (p) => p.type === 'Major Arcana',
  );
  const minorArcana = basicPatterns.arcanaPatterns.find(
    (p) => p.type === 'Minor Arcana',
  );

  const arcanaBalance = {
    major: majorArcana?.count || 0,
    minor: minorArcana?.count || 0,
  };

  // Calculate date range
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - basicPatterns.timeFrame);

  return {
    dominantThemes,
    frequentCards,
    suitPatterns,
    arcanaBalance,
    totalReadings,
    dateRange: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
  };
}

/**
 * Map user subscription plan to UserTier type
 */
export function mapSubscriptionPlanToUserTier(
  plan?: string,
): 'free' | 'lunary_plus' | 'lunary_plus_ai' | 'lunary_plus_ai_annual' {
  if (!plan || plan === 'free') return 'free';
  if (plan === 'lunary_plus') return 'lunary_plus';
  if (plan === 'lunary_plus_ai') return 'lunary_plus_ai';
  if (plan === 'lunary_plus_ai_annual' || plan === 'yearly')
    return 'lunary_plus_ai_annual';

  // Default to free for unknown plans
  return 'free';
}
