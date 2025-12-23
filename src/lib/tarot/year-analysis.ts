import { sql } from '@vercel/postgres';
import { getTarotCardByName } from '@/utils/tarot/deck';
import { getTarotCard } from '../../../utils/tarot/tarot';

type SeededTarotCard = {
  name: string;
  keywords: string[];
};

export type YearAnalysis = {
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number }>;
  patternInsights: string[];
  cardRecaps?: Array<{ cardName: string; recap: string }> | null;
  trends?: Array<{
    metric: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }> | null;
};

const buildSeededCardsForYear = (
  year: number,
  userName?: string,
  userBirthday?: string,
): SeededTarotCard[] => {
  const start = new Date(Date.UTC(year, 0, 1));
  const end = new Date(Date.UTC(year, 11, 31));
  const daysInYear =
    Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
  const cards: SeededTarotCard[] = [];

  for (let i = 0; i < daysInYear; i++) {
    const date = new Date(Date.UTC(year, 0, 1 + i));
    const dateStr = date.toISOString().split('T')[0];
    cards.push(getTarotCard(`daily-${dateStr}`, userName, userBirthday));
  }

  return cards;
};

const generateCardRecap = (
  cardName: string,
  count: number,
  context: 'year-over-year' | 'timeline' = 'year-over-year',
): string => {
  const card = getTarotCardByName(cardName);
  if (!card) {
    return `"${cardName}" has appeared ${count} times, indicating a significant pattern in your readings.`;
  }

  const topKeywords = card.keywords.slice(0, 2).join(' and ');
  const frequencyContext =
    count >= 5 ? 'frequently' : count >= 3 ? 'regularly' : 'notably';

  if (context === 'year-over-year') {
    return `"${cardName}" has appeared ${count} times ${frequencyContext} throughout this period, emphasizing ${topKeywords.toLowerCase()} themes in your journey. This card's presence suggests ${card.keywords[0]?.toLowerCase() || 'significant'} energies are woven into your path, inviting reflection on how these patterns relate to your current experiences.`;
  }
  return `"${cardName}" appears ${frequencyContext} (${count} times) in this timeline, highlighting ${topKeywords.toLowerCase()} as key themes. The card's emphasis on ${card.keywords[0]?.toLowerCase() || 'these patterns'} suggests important patterns worth exploring in your spiritual practice.`;
};

export const getYearAnalysis = async (
  userId: string,
  year: number,
  userName?: string,
  userBirthday?: string,
): Promise<YearAnalysis> => {
  let storedAnalysis;
  try {
    storedAnalysis = await sql`
      SELECT analysis_data, trends
      FROM year_analysis
      WHERE user_id = ${userId} AND year = ${year}
      LIMIT 1
    `;

    if (storedAnalysis.rows.length > 0) {
      const analysis = storedAnalysis.rows[0].analysis_data as {
        dominantThemes: string[];
        frequentCards: Array<{ name: string; count: number }>;
        patternInsights: string[];
      };
      if (process.env.NODE_ENV === 'development') {
        console.log(`[getYearAnalysis] Using cached analysis for year ${year}`);
      }
      const cardRecaps = analysis.frequentCards.slice(0, 5).map((card) => ({
        cardName: card.name,
        recap: generateCardRecap(card.name, card.count, 'year-over-year'),
      }));

      return {
        ...analysis,
        cardRecaps: cardRecaps.length > 0 ? cardRecaps : null,
        trends: storedAnalysis.rows[0].trends || null,
      };
    }
  } catch (error: any) {
    if (error?.code === '42P01') {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[getYearAnalysis] year_analysis table doesn't exist yet, will create on first store`,
        );
      }
    } else {
      throw error;
    }
  }

  if (process.env.NODE_ENV === 'development') {
    console.log(`[getYearAnalysis] Recalculating analysis for year ${year}...`);
  }

  const seededCards = buildSeededCardsForYear(year, userName, userBirthday);

  const cardFrequency: { [key: string]: number } = {};
  const keywordCounts: { [key: string]: number } = {};

  seededCards.forEach((card) => {
    cardFrequency[card.name] = (cardFrequency[card.name] || 0) + 1;
    card.keywords.forEach((keyword) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });

  const dominantThemes = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([keyword]) => keyword);

  const frequentCards = Object.entries(cardFrequency)
    .filter(([, count]) => count >= 2)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, count]) => ({ name, count: count as number }));

  const patternInsights: string[] = [];
  if (frequentCards.length > 0) {
    const topCard = frequentCards[0];
    patternInsights.push(
      `"${topCard.name}" appeared ${topCard.count} times, indicating a significant theme in your journey.`,
    );
  }

  const analysis = { dominantThemes, frequentCards, patternInsights };

  try {
    await sql`
      INSERT INTO year_analysis (user_id, year, analysis_data, last_reading_date, updated_at)
      VALUES (${userId}, ${year}, ${JSON.stringify(analysis)}::jsonb, ${null}, NOW())
      ON CONFLICT (user_id, year)
      DO UPDATE SET
        analysis_data = ${JSON.stringify(analysis)}::jsonb,
        last_reading_date = ${null},
        updated_at = NOW()
    `;
  } catch (error: any) {
    if (error?.code === '42P01') {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[getYearAnalysis] year_analysis table doesn't exist - run 'pnpm setup-db' to create it`,
        );
      }
    } else if (process.env.NODE_ENV === 'development') {
      console.error(
        `[getYearAnalysis] Failed to store analysis in database:`,
        error,
      );
    }
  }

  const cardRecaps = frequentCards.slice(0, 5).map((card) => ({
    cardName: card.name,
    recap: generateCardRecap(card.name, card.count, 'year-over-year'),
  }));

  return {
    ...analysis,
    cardRecaps: cardRecaps.length > 0 ? cardRecaps : null,
    trends: null,
  };
};
