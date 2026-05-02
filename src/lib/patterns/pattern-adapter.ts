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

  const uniqueReadingIds = new Set(
    readingsData
      .map((reading) => reading.readingId)
      .filter((readingId): readingId is string => Boolean(readingId)),
  );
  const hasObservedReadings = observedCardCount > 0 && readingsData.length > 0;
  const totalCardsDrawn = hasObservedReadings
    ? observedCardCount
    : (basicPatterns.totalCardsDrawn ??
      basicPatterns.suitPatterns.reduce((sum, suit) => sum + suit.count, 0));
  const totalReadings =
    hasObservedReadings || observedReadingCount > 0
      ? observedReadingCount || uniqueReadingIds.size
      : (basicPatterns.totalReadings ?? 0);
  const dataSource: PatternAnalysis['dataSource'] =
    basicPatterns.dataSource ??
    (hasObservedReadings ? 'observed' : 'generated_preview');

  const isMajorArcana = (name: string) => !name.includes(' of ');
  const getSuit = (name: string) => {
    if (name.includes('Wands')) return 'Wands';
    if (name.includes('Cups')) return 'Cups';
    if (name.includes('Swords')) return 'Swords';
    if (name.includes('Pentacles')) return 'Pentacles';
    return 'Major Arcana';
  };

  const observedCardCounts = new Map<string, number>();
  const observedSuitCounts = new Map<string, number>();
  const observedThemeCounts = new Map<string, number>();

  readingsData.forEach((reading) => {
    observedCardCounts.set(
      reading.name,
      (observedCardCounts.get(reading.name) || 0) + 1,
    );
    const suit = getSuit(reading.name);
    observedSuitCounts.set(suit, (observedSuitCounts.get(suit) || 0) + 1);
    reading.keywords?.slice(0, 2).forEach((keyword) => {
      observedThemeCounts.set(
        keyword,
        (observedThemeCounts.get(keyword) || 0) + 1,
      );
    });
  });

  const sourceFrequentCards =
    dataSource === 'observed' && readingsData.length > 0
      ? Array.from(observedCardCounts.entries())
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
      : basicPatterns.frequentCards;

  const sourceDominantThemes =
    dataSource === 'observed' && observedThemeCounts.size > 0
      ? Array.from(observedThemeCounts.entries())
          .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
          .map(([theme]) => theme)
      : basicPatterns.dominantThemes;

  const allSuits = ['Cups', 'Wands', 'Swords', 'Pentacles', 'Major Arcana'];
  const sourceSuitPatterns =
    dataSource === 'observed' && readingsData.length > 0
      ? allSuits.map((suit) => ({
          suit,
          count: observedSuitCounts.get(suit) || 0,
          cards: [],
        }))
      : basicPatterns.suitPatterns;

  const sourceArcanaPatterns =
    dataSource === 'observed' && readingsData.length > 0
      ? [
          {
            type: 'Major Arcana',
            count: readingsData.filter((reading) => isMajorArcana(reading.name))
              .length,
          },
          {
            type: 'Minor Arcana',
            count: readingsData.filter(
              (reading) => !isMajorArcana(reading.name),
            ).length,
          },
        ]
      : basicPatterns.arcanaPatterns;

  // Transform dominant themes
  const dominantThemes: PatternTheme[] = sourceDominantThemes
    .slice(0, 5)
    .map((theme, index) => {
      // Calculate strength based on position (first theme = 100%, gradually decrease)
      const strength = Math.max(30, 100 - index * 15);
      return {
        label: theme,
        strength,
      };
    });

  if (process.env.NODE_ENV === 'development') {
    console.log('[Pattern Adapter] Calculated:', {
      totalCardsDrawn,
      totalReadings,
      dataSource,
    });
  }

  // Transform frequent cards with appearances
  const frequentCards: FrequentCard[] = sourceFrequentCards.map((card) => {
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
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      name: card.name,
      count: card.count,
      percentage:
        totalCardsDrawn > 0 ? (card.count / totalCardsDrawn) * 100 : 0,
      appearances: cardAppearances,
    };
  });

  // Transform suit patterns with percentages (based on total cards drawn)
  const suitPatterns: SuitPattern[] = sourceSuitPatterns.map((suit) => ({
    suit: suit.suit,
    count: suit.count,
    percentage: totalCardsDrawn > 0 ? (suit.count / totalCardsDrawn) * 100 : 0,
  }));

  // Calculate arcana balance
  const majorArcana = sourceArcanaPatterns.find(
    (p) => p.type === 'Major Arcana',
  );
  const minorArcana = sourceArcanaPatterns.find(
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
