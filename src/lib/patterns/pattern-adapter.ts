/**
 * Adapter functions to transform data between different pattern formats
 */

import type {
  PatternAnalysis,
  PatternTheme,
  FrequentCard,
  SuitPattern,
  CardAppearance,
} from './tarot-pattern-types';

/**
 * Transform BasicPatterns from AdvancedPatterns.tsx to PatternAnalysis format
 */
export async function transformBasicPatternsToAnalysis(basicPatterns: {
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
}): Promise<PatternAnalysis> {
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

  // Fetch actual reading data with appearances
  let readingsData: any[] = [];
  try {
    const response = await fetch(
      `/api/patterns/user-readings?days=${basicPatterns.timeFrame}`,
    );
    if (response.ok) {
      const data = await response.json();
      readingsData = data.readings || [];
    }
  } catch (error) {
    console.error('[Pattern Adapter] Failed to fetch readings:', error);
  }

  // Transform frequent cards with appearances
  const frequentCards: FrequentCard[] = basicPatterns.frequentCards.map(
    (card) => {
      // Find all appearances of this card in the readings
      const cardAppearances: CardAppearance[] = readingsData
        .filter((reading) => reading.name === card.name)
        .map((reading) => ({
          date: reading.createdAt,
          moonPhase: reading.moonPhase,
          aspects: reading.aspects,
        }))
        .sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

      return {
        name: card.name,
        count: card.count,
        percentage:
          totalCardsDrawn > 0 ? (card.count / totalCardsDrawn) * 100 : 0,
        appearances: cardAppearances,
      };
    },
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
