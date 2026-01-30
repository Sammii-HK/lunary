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
  // Debug: Log incoming data
  if (process.env.NODE_ENV === 'development') {
    console.log('[Pattern Adapter] Input basicPatterns:', {
      suitPatterns: basicPatterns.suitPatterns,
      arcanaPatterns: basicPatterns.arcanaPatterns,
      frequentCards: basicPatterns.frequentCards,
    });
  }

  // Calculate total cards drawn across all suits
  // This represents the total number of card positions across all readings
  const totalCardsDrawn = basicPatterns.suitPatterns.reduce(
    (sum, suit) => sum + suit.count,
    0,
  );

  // Estimate total readings based on total cards
  // Assuming average 3 cards per reading (adjust based on your app's typical spread size)
  const estimatedReadings =
    totalCardsDrawn > 0 ? Math.ceil(totalCardsDrawn / 3) : 0;

  if (process.env.NODE_ENV === 'development') {
    console.log('[Pattern Adapter] Calculated:', {
      totalCardsDrawn,
      estimatedReadings,
    });
  }

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

  // Transform frequent cards with meaningful percentages
  const frequentCards: FrequentCard[] = basicPatterns.frequentCards.map(
    (card) => ({
      name: card.name,
      count: card.count,
      // Percentage based on ALL cards drawn, not just frequent cards
      percentage:
        totalCardsDrawn > 0 ? (card.count / totalCardsDrawn) * 100 : 0,
      meaning: card.reading,
      appearances: [], // Would need to be populated from actual reading data
    }),
  );

  // Transform suit patterns with percentages (based on total cards drawn)
  const suitPatterns: SuitPattern[] = basicPatterns.suitPatterns.map(
    (suit) => ({
      suit: suit.suit,
      count: suit.count,
      percentage:
        totalCardsDrawn > 0 ? (suit.count / totalCardsDrawn) * 100 : 0,
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
    totalReadings: estimatedReadings,
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
