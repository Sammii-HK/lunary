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
  totalReadings?: number;
  totalCardsDrawn?: number;
  dataSource?: 'observed' | 'generated_preview';
}): Promise<PatternAnalysis> {
  // Debug: Log incoming data
  if (process.env.NODE_ENV === 'development') {
    console.log('[Pattern Adapter] Input basicPatterns:', {
      suitPatterns: basicPatterns.suitPatterns,
      arcanaPatterns: basicPatterns.arcanaPatterns,
      frequentCards: basicPatterns.frequentCards,
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

  // Fetch actual reading data with appearances. If this is unavailable, the
  // incoming basic patterns are treated as a generated preview, not observed behaviour.
  let readingsData: Array<{
    name: string;
    createdAt: string;
    readingId?: string;
    keywords?: string[];
    information?: string;
    moonPhase?: CardAppearance['moonPhase'];
    aspects?: CardAppearance['aspects'];
  }> = [];
  let observedReadingCount = 0;
  let observedCardCount = 0;
  try {
    const response = await fetch(
      `/api/patterns/user-readings?days=${basicPatterns.timeFrame}`,
    );
    if (response.ok) {
      const data = await response.json();
      readingsData = data.readings || [];
      observedReadingCount =
        typeof data.readingCount === 'number' ? data.readingCount : 0;
      observedCardCount =
        typeof data.cardCount === 'number'
          ? data.cardCount
          : readingsData.length;
    }
  } catch (error) {
    console.error('[Pattern Adapter] Failed to fetch readings:', error);
  }

  const totalCardsDrawn =
    basicPatterns.totalCardsDrawn ??
    (observedCardCount > 0
      ? observedCardCount
      : basicPatterns.suitPatterns.reduce((sum, suit) => sum + suit.count, 0));

  const uniqueReadingIds = new Set(
    readingsData
      .map((reading) => reading.readingId)
      .filter((readingId): readingId is string => Boolean(readingId)),
  );
  const totalReadings =
    basicPatterns.totalReadings ??
    (observedReadingCount || uniqueReadingIds.size || 0);
  const dataSource: PatternAnalysis['dataSource'] =
    basicPatterns.dataSource ??
    (totalReadings > 0 && readingsData.length > 0
      ? 'observed'
      : 'generated_preview');

  if (process.env.NODE_ENV === 'development') {
    console.log('[Pattern Adapter] Calculated:', {
      totalCardsDrawn,
      totalReadings,
      dataSource,
    });
  }

  // Transform frequent cards with appearances
  const frequentCards: FrequentCard[] = basicPatterns.frequentCards.map(
    (card) => {
      // Find all appearances of this card in the readings
      const cardAppearances: CardAppearance[] = readingsData
        .filter((reading) => reading.name === card.name)
        .map((reading) => ({
          date: reading.createdAt,
          readingId: reading.readingId,
          keywords: reading.keywords,
          information: reading.information,
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
    totalReadings,
    totalCardsDrawn,
    dataSource,
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
