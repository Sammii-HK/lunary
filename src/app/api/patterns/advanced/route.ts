import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
} from '../../../../../utils/pricing';
import { getTarotPatternAnalysis } from '@/lib/ai/providers';
import dayjs from 'dayjs';

export const revalidate = 86400; // 24 hours cache

interface AdvancedPatternAnalysis {
  yearOverYear: {
    thisYear: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      patternInsights: string[];
    };
    lastYear: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      patternInsights: string[];
    };
    comparison: {
      themes: Array<{
        theme: string;
        change: 'increased' | 'decreased' | 'new' | 'removed';
      }>;
      insights: string[];
    };
  };
  enhancedTarot: {
    multiDimensional: {
      suitPatterns: Array<{ suit: string; count: number; percentage: number }>;
      arcanaBalance: { major: number; minor: number };
      numberPatterns: Array<{ number: string; count: number; meaning: string }>;
    };
    timeline: {
      days30: {
        dominantThemes: string[];
        frequentCards: Array<{ name: string; count: number }>;
      };
      days90?: {
        dominantThemes: string[];
        frequentCards: Array<{ name: string; count: number }>;
      };
      days365?: {
        dominantThemes: string[];
        frequentCards: Array<{ name: string; count: number }>;
      };
    };
  };
  extendedTimeline?: {
    months6?: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      trendAnalysis: string[];
    };
    months12?: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      trendAnalysis: string[];
    };
  };
}

async function getYearOverYearComparison(
  userId: string,
  userName?: string,
  userBirthday?: string,
): Promise<AdvancedPatternAnalysis['yearOverYear']> {
  const now = dayjs();
  const thisYearStart = now.startOf('year');
  const lastYearStart = thisYearStart.subtract(1, 'year');
  const lastYearEnd = thisYearStart.subtract(1, 'day');

  // Get readings from this year
  const thisYearResult = await sql`
    SELECT cards, created_at
    FROM tarot_readings
    WHERE user_id = ${userId}
      AND archived_at IS NULL
      AND created_at >= ${thisYearStart.toISOString()}
    ORDER BY created_at DESC
  `;

  // Get readings from last year
  const lastYearResult = await sql`
    SELECT cards, created_at
    FROM tarot_readings
    WHERE user_id = ${userId}
      AND archived_at IS NULL
      AND created_at >= ${lastYearStart.toISOString()}
      AND created_at < ${thisYearStart.toISOString()}
    ORDER BY created_at DESC
  `;

  const analyzeReadings = (readings: any[]) => {
    const cardFrequency: { [key: string]: number } = {};
    const keywordCounts: { [key: string]: number } = {};

    readings.forEach((row) => {
      const cards = Array.isArray(row.cards)
        ? row.cards
        : JSON.parse(row.cards || '[]');
      cards.forEach((card: any) => {
        const cardName = card.card?.name || card.name;
        cardFrequency[cardName] = (cardFrequency[cardName] || 0) + 1;

        const keywords = card.card?.keywords || card.keywords || [];
        keywords.forEach((keyword: string) => {
          keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
        });
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
      const [topCard, topCount] = frequentCards[0];
      patternInsights.push(
        `"${topCard}" appeared ${topCount} times, indicating a significant theme in your journey.`,
      );
    }

    return { dominantThemes, frequentCards, patternInsights };
  };

  const thisYear = analyzeReadings(thisYearResult.rows);
  const lastYear = analyzeReadings(lastYearResult.rows);

  // Compare themes
  const thisYearThemes = new Set(thisYear.dominantThemes);
  const lastYearThemes = new Set(lastYear.dominantThemes);

  const themes = Array.from(
    new Set([...thisYearThemes, ...lastYearThemes]),
  ).map((theme) => {
    const inThisYear = thisYearThemes.has(theme);
    const inLastYear = lastYearThemes.has(theme);

    if (inThisYear && !inLastYear) {
      return { theme, change: 'new' as const };
    }
    if (!inThisYear && inLastYear) {
      return { theme, change: 'removed' as const };
    }
    const thisYearCount = thisYear.dominantThemes.indexOf(theme);
    const lastYearCount = lastYear.dominantThemes.indexOf(theme);
    if (thisYearCount < lastYearCount) {
      return { theme, change: 'increased' as const };
    }
    return { theme, change: 'decreased' as const };
  });

  const insights: string[] = [];
  const newThemes = themes.filter((t) => t.change === 'new');
  if (newThemes.length > 0) {
    insights.push(
      `New themes emerging this year: ${newThemes.map((t) => t.theme).join(', ')}.`,
    );
  }

  return {
    thisYear,
    lastYear,
    comparison: { themes, insights },
  };
}

async function getEnhancedTarotPatterns(
  userId: string,
  planType: string,
): Promise<AdvancedPatternAnalysis['enhancedTarot']> {
  const days = planType === 'lunary_plus_ai_annual' ? 365 : 90;

  const result = await sql`
    SELECT cards, created_at
    FROM tarot_readings
    WHERE user_id = ${userId}
      AND archived_at IS NULL
      AND created_at >= NOW() - INTERVAL '${days} days'
    ORDER BY created_at DESC
  `;

  const suitCounts: { [key: string]: number } = {};
  const arcanaCounts = { major: 0, minor: 0 };
  const numberCounts: { [key: string]: number } = {};
  let totalCards = 0;

  result.rows.forEach((row) => {
    const cards = Array.isArray(row.cards)
      ? row.cards
      : JSON.parse(row.cards || '[]');
    cards.forEach((card: any) => {
      totalCards++;
      const cardName = card.card?.name || card.name;
      const suit = getCardSuit(cardName);
      suitCounts[suit] = (suitCounts[suit] || 0) + 1;

      if (suit === 'Major Arcana') {
        arcanaCounts.major++;
      } else {
        arcanaCounts.minor++;
      }

      const numberMatch = cardName.match(
        /\b(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\b/,
      );
      if (numberMatch) {
        numberCounts[numberMatch[1]] = (numberCounts[numberMatch[1]] || 0) + 1;
      }
    });
  });

  const suitPatterns = Object.entries(suitCounts)
    .map(([suit, count]) => ({
      suit,
      count,
      percentage: totalCards > 0 ? Math.round((count / totalCards) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const numberPatterns = Object.entries(numberCounts)
    .filter(([, count]) => count >= 2)
    .map(([number, count]) => ({
      number,
      count: count as number,
      meaning: getNumberMeaning(number),
    }))
    .sort((a, b) => b.count - a.count);

  // Get timeline analysis
  const timeline: AdvancedPatternAnalysis['enhancedTarot']['timeline'] = {
    days30: await getTimelineAnalysis(userId, 30),
  };

  if (planType === 'lunary_plus_ai_annual') {
    timeline.days90 = await getTimelineAnalysis(userId, 90);
    timeline.days365 = await getTimelineAnalysis(userId, 365);
  }

  return {
    multiDimensional: {
      suitPatterns,
      arcanaBalance: arcanaCounts,
      numberPatterns,
    },
    timeline,
  };
}

async function getTimelineAnalysis(
  userId: string,
  days: number,
): Promise<{
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number }>;
}> {
  const result = await sql`
    SELECT cards
    FROM tarot_readings
    WHERE user_id = ${userId}
      AND archived_at IS NULL
      AND created_at >= NOW() - INTERVAL '${days} days'
  `;

  const cardFrequency: { [key: string]: number } = {};
  const keywordCounts: { [key: string]: number } = {};

  result.rows.forEach((row) => {
    const cards = Array.isArray(row.cards)
      ? row.cards
      : JSON.parse(row.cards || '[]');
    cards.forEach((card: any) => {
      const cardName = card.card?.name || card.name;
      cardFrequency[cardName] = (cardFrequency[cardName] || 0) + 1;

      const keywords = card.card?.keywords || card.keywords || [];
      keywords.forEach((keyword: string) => {
        keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
      });
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

  return { dominantThemes, frequentCards };
}

function getCardSuit(cardName: string): string {
  if (
    cardName.includes('Major') ||
    [
      'Fool',
      'Magician',
      'High Priestess',
      'Empress',
      'Emperor',
      'Hierophant',
      'Lovers',
      'Chariot',
      'Strength',
      'Hermit',
      'Wheel of Fortune',
      'Justice',
      'Hanged Man',
      'Death',
      'Temperance',
      'Devil',
      'Tower',
      'Star',
      'Moon',
      'Sun',
      'Judgement',
      'World',
    ].some((name) => cardName.includes(name))
  ) {
    return 'Major Arcana';
  }
  if (cardName.includes('Cups')) return 'Cups';
  if (cardName.includes('Wands')) return 'Wands';
  if (cardName.includes('Swords')) return 'Swords';
  if (cardName.includes('Pentacles')) return 'Pentacles';
  return 'Unknown';
}

function getNumberMeaning(number: string): string {
  const meanings: { [key: string]: string } = {
    Ace: 'New beginnings and potential',
    Two: 'Balance and partnership',
    Three: 'Creativity and growth',
    Four: 'Stability and foundation',
    Five: 'Conflict and change',
    Six: 'Harmony and resolution',
    Seven: 'Reflection and assessment',
    Eight: 'Power and achievement',
    Nine: 'Completion and fulfillment',
    Ten: 'Completion of cycles',
  };
  return meanings[number] || 'Significant number pattern';
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const subscriptionResult = await sql`
      SELECT plan_type, status
      FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    const subscription = subscriptionResult.rows[0];
    const subscriptionStatus = subscription?.status || 'free';
    const planType = normalizePlanType(subscription?.plan_type);

    if (!hasFeatureAccess(subscriptionStatus, planType, 'advanced_patterns')) {
      return NextResponse.json(
        {
          error:
            'Advanced pattern analysis is available for Lunary+ AI subscribers',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    const [yearOverYear, enhancedTarot] = await Promise.all([
      getYearOverYearComparison(user.id, user.displayName, user.birthday),
      getEnhancedTarotPatterns(user.id, planType),
    ]);

    const analysis: AdvancedPatternAnalysis = {
      yearOverYear,
      enhancedTarot,
    };

    if (planType === 'lunary_plus_ai_annual') {
      const [months6, months12] = await Promise.all([
        getTimelineAnalysis(user.id, 180),
        getTimelineAnalysis(user.id, 365),
      ]);

      analysis.extendedTimeline = {
        months6: {
          ...months6,
          trendAnalysis: generateTrendAnalysis(months6),
        },
        months12: {
          ...months12,
          trendAnalysis: generateTrendAnalysis(months12),
        },
      };
    }

    return NextResponse.json(
      { success: true, analysis },
      {
        headers: {
          'Cache-Control':
            'private, s-maxage=86400, stale-while-revalidate=43200',
        },
      },
    );
  } catch (error) {
    console.error('Failed to generate advanced pattern analysis:', error);

    if (error instanceof Error && error.message.includes('Unauthorized')) {
      return NextResponse.json(
        { error: 'Please sign in to access advanced pattern analysis' },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { error: 'Unable to generate advanced pattern analysis' },
      { status: 500 },
    );
  }
}

function generateTrendAnalysis(data: {
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number }>;
}): string[] {
  const insights: string[] = [];

  if (data.frequentCards.length > 0) {
    const topCard = data.frequentCards[0];
    insights.push(
      `"${topCard.name}" has been the most prominent card, appearing ${topCard.count} times, indicating a core theme in your journey.`,
    );
  }

  if (data.dominantThemes.length > 0) {
    insights.push(
      `The dominant themes during this period were ${data.dominantThemes.slice(0, 3).join(', ')}, reflecting the energies you've been working with.`,
    );
  }

  return insights;
}
