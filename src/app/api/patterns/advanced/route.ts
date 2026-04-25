import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
  FEATURE_ACCESS,
} from '../../../../../utils/pricing';

export const dynamic = 'force-dynamic';

// Don't cache this route - subscription status can change at any time
// Analysis data is cached in database, but subscription checks must be fresh
export const revalidate = 0;

type ObservedTarotCard = {
  name: string;
  keywords: string[];
  readingId: string;
  createdAt: string;
};

interface AdvancedPatternAnalysis {
  yearOverYear: {
    thisYear: {
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
    lastYear: {
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
    comparison: {
      themes: Array<{
        theme: string;
        change: 'increased' | 'decreased' | 'new' | 'removed';
      }>;
      insights: string[];
      trends: Array<{
        metric: string;
        change: number;
        direction: 'up' | 'down' | 'stable';
      }>;
    };
  };
  enhancedTarot: {
    multiDimensional: {
      suitPatterns: Array<{ suit: string; count: number; percentage: number }>;
      arcanaBalance: { major: number; minor: number };
      numberPatterns: Array<{ number: string; count: number; meaning: string }>;
      correlations: Array<{
        dimension1: string;
        dimension2: string;
        insight: string;
      }>;
    };
  };
}

type ObservedYearAnalysis = AdvancedPatternAnalysis['yearOverYear']['thisYear'];

function parseTarotCards(row: {
  id: string;
  cards: unknown;
  created_at: string;
}): ObservedTarotCard[] {
  try {
    const cardsData =
      typeof row.cards === 'string' ? JSON.parse(row.cards) : row.cards;
    if (!Array.isArray(cardsData)) return [];

    return cardsData
      .map((cardData: any) => cardData?.card ?? cardData)
      .filter((card: any) => card?.name)
      .map((card: any) => ({
        name: String(card.name),
        keywords: Array.isArray(card.keywords) ? card.keywords : [],
        readingId: row.id,
        createdAt: row.created_at,
      }));
  } catch {
    return [];
  }
}

async function fetchObservedTarotCards(
  userId: string,
  startDate: Date,
  endDate?: Date,
): Promise<ObservedTarotCard[]> {
  const params: Array<string> = [userId, startDate.toISOString()];
  let endClause = '';
  if (endDate) {
    params.push(endDate.toISOString());
    endClause = `AND created_at < $${params.length}::timestamptz`;
  }

  const result = await sql.query(
    `
      SELECT id, cards, created_at
      FROM tarot_readings
      WHERE user_id = $1
        AND archived_at IS NULL
        AND created_at >= $2::timestamptz
        ${endClause}
      ORDER BY created_at DESC
    `,
    params,
  );

  return result.rows.flatMap((row) =>
    parseTarotCards({
      id: row.id,
      cards: row.cards,
      created_at: row.created_at,
    }),
  );
}

function generateObservedCardRecap(cardName: string, count: number): string {
  return `"${cardName}" appears ${count} ${count === 1 ? 'time' : 'times'} in saved readings for this period.`;
}

function analyseObservedCards(
  cards: ObservedTarotCard[],
): ObservedYearAnalysis {
  const cardFrequency: Record<string, number> = {};
  const keywordCounts: Record<string, number> = {};

  cards.forEach((card) => {
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
    .map(([name, count]) => ({ name, count }));

  const patternInsights =
    cards.length > 0
      ? frequentCards.length > 0
        ? [
            `"${frequentCards[0].name}" is the most repeated saved card in this period.`,
          ]
        : ['Saved readings exist, but no card repeats yet.']
      : ['No saved readings recorded for this period.'];

  const cardRecaps = frequentCards.slice(0, 5).map((card) => ({
    cardName: card.name,
    recap: generateObservedCardRecap(card.name, card.count),
  }));

  return {
    dominantThemes,
    frequentCards,
    patternInsights,
    cardRecaps: cardRecaps.length > 0 ? cardRecaps : null,
    trends: null,
  };
}

async function getYearOverYearComparison(
  userId: string,
): Promise<AdvancedPatternAnalysis['yearOverYear']> {
  const now = new Date();
  const thisYear = now.getUTCFullYear();
  const lastYear = thisYear - 1;

  if (process.env.NODE_ENV === 'development') {
    console.log('[getYearOverYearComparison] Years:', { thisYear, lastYear });
  }

  const [thisYearCards, lastYearCards] = await Promise.all([
    fetchObservedTarotCards(
      userId,
      new Date(Date.UTC(thisYear, 0, 1)),
      new Date(Date.UTC(thisYear + 1, 0, 1)),
    ),
    fetchObservedTarotCards(
      userId,
      new Date(Date.UTC(lastYear, 0, 1)),
      new Date(Date.UTC(thisYear, 0, 1)),
    ),
  ]);

  const thisYearData = analyseObservedCards(thisYearCards);
  const lastYearData = analyseObservedCards(lastYearCards);

  if (process.env.NODE_ENV === 'development') {
    console.log('[getYearOverYearComparison] Analysis results:', {
      thisYear: {
        themes: thisYearData.dominantThemes.length,
        cards: thisYearData.frequentCards.length,
      },
      lastYear: {
        themes: lastYearData.dominantThemes.length,
        cards: lastYearData.frequentCards.length,
      },
    });
  }

  // Compare themes
  const thisYearThemes = new Set(thisYearData.dominantThemes);
  const lastYearThemes = new Set(lastYearData.dominantThemes);

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
    const thisYearCount = thisYearData.dominantThemes.indexOf(theme);
    const lastYearCount = lastYearData.dominantThemes.indexOf(theme);
    if (thisYearCount < lastYearCount) {
      return { theme, change: 'increased' as const };
    }
    return { theme, change: 'decreased' as const };
  });

  const insights: string[] = [];

  // Calculate trends for year-over-year comparison
  const trends: Array<{
    metric: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }> = [];

  if (lastYearCards.length === 0) {
    insights.push(
      'No saved tarot readings were recorded for the comparison year yet.',
    );
  } else {
    // Calculate trends for frequent cards
    const thisYearCardMap = new Map(
      thisYearData.frequentCards.map((card) => [card.name, card.count]),
    );
    const lastYearCardMap = new Map(
      lastYearData.frequentCards.map((card) => [card.name, card.count]),
    );

    // Compare cards that appear in both years
    const allCardNames = new Set([
      ...thisYearData.frequentCards.map((c) => c.name),
      ...lastYearData.frequentCards.map((c) => c.name),
    ]);

    allCardNames.forEach((cardName) => {
      const thisYearCount = thisYearCardMap.get(cardName) || 0;
      const lastYearCount = lastYearCardMap.get(cardName) || 0;

      if (thisYearCount > 0 && lastYearCount > 0) {
        // Card appeared in both years - calculate percentage change
        const change = ((thisYearCount - lastYearCount) / lastYearCount) * 100;
        const direction = change > 5 ? 'up' : change < -5 ? 'down' : 'stable';
        trends.push({
          metric: `${cardName} appearances`,
          change: Math.round(change * 10) / 10,
          direction,
        });
      } else if (thisYearCount > 0 && lastYearCount === 0) {
        // New card this year
        trends.push({
          metric: `${cardName} appearances`,
          change: 100,
          direction: 'up',
        });
      } else if (thisYearCount === 0 && lastYearCount > 0) {
        // Card disappeared this year
        trends.push({
          metric: `${cardName} appearances`,
          change: -100,
          direction: 'down',
        });
      }
    });

    // Calculate theme growth rate
    const themeGrowthRate =
      lastYearData.dominantThemes.length > 0
        ? ((thisYearData.dominantThemes.length -
            lastYearData.dominantThemes.length) /
            lastYearData.dominantThemes.length) *
          100
        : 0;

    if (Math.abs(themeGrowthRate) > 1) {
      trends.push({
        metric: 'Dominant themes count',
        change: Math.round(themeGrowthRate * 10) / 10,
        direction:
          themeGrowthRate > 5 ? 'up' : themeGrowthRate < -5 ? 'down' : 'stable',
      });
    }

    // Calculate total card frequency change
    const thisYearTotalCards = thisYearCards.length;
    const lastYearTotalCards = lastYearCards.length;

    if (lastYearTotalCards > 0) {
      const totalCardChange =
        ((thisYearTotalCards - lastYearTotalCards) / lastYearTotalCards) * 100;
      if (Math.abs(totalCardChange) > 1) {
        trends.push({
          metric: 'Total saved cards',
          change: Math.round(totalCardChange * 10) / 10,
          direction:
            totalCardChange > 5
              ? 'up'
              : totalCardChange < -5
                ? 'down'
                : 'stable',
        });
      }
    }

    const newThemes = themes.filter((t) => t.change === 'new');
    if (newThemes.length > 0) {
      insights.push(
        `New themes emerging this year: ${newThemes.map((t) => t.theme).join(', ')}.`,
      );
    }

    const removedThemes = themes.filter((t) => t.change === 'removed');
    if (removedThemes.length > 0) {
      insights.push(
        `Themes from last year that have faded: ${removedThemes.map((t) => t.theme).join(', ')}.`,
      );
    }

    if (insights.length === 0 && themes.length > 0) {
      insights.push(
        'Your tarot themes have remained consistent, showing continuity in your spiritual journey.',
      );
    }
  }

  return {
    thisYear: {
      ...thisYearData,
      cardRecaps: thisYearData.cardRecaps || null,
      trends: thisYearData.trends || null,
    },
    lastYear: {
      ...lastYearData,
      cardRecaps: lastYearData.cardRecaps || null,
      trends: lastYearData.trends || null,
    },
    comparison: { themes, insights, trends },
  };
}

async function getEnhancedTarotPatterns(
  userId: string,
  planType: string,
  requestedDays?: number,
): Promise<AdvancedPatternAnalysis['enhancedTarot']> {
  const days =
    requestedDays || (planType === 'lunary_plus_ai_annual' ? 365 : 90);
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[getEnhancedTarotPatterns] Using ${days} days of saved readings (plan: ${planType})`,
    );
  }

  const observedCards = await fetchObservedTarotCards(userId, startDate);

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[getEnhancedTarotPatterns] Found ${observedCards.length} saved cards`,
    );
  }

  const suitCounts: { [key: string]: number } = {};
  const arcanaCounts = { major: 0, minor: 0 };
  const numberCounts: { [key: string]: number } = {};
  const elementToSuits: { [key: string]: Set<string> } = {};
  const suitToNumberCounts: { [key: string]: { [key: string]: number } } = {};
  const elementToNumberCounts: { [key: string]: { [key: string]: number } } =
    {};
  let totalCards = 0;

  observedCards.forEach((card) => {
    totalCards++;
    const cardName = card.name;
    const suit = getCardSuit(cardName);
    suitCounts[suit] = (suitCounts[suit] || 0) + 1;

    // Map suit to element for correlations
    const element = getSuitElement(suit);
    if (!elementToSuits[element]) {
      elementToSuits[element] = new Set();
    }
    elementToSuits[element].add(suit);

    if (suit === 'Major Arcana') {
      arcanaCounts.major++;
    } else {
      arcanaCounts.minor++;
    }

    const numberMatch = cardName.match(
      /\b(Ace|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\b/,
    );
    if (numberMatch) {
      const number = numberMatch[1];
      numberCounts[number] = (numberCounts[number] || 0) + 1;

      // Track suit-to-number correlations
      if (!suitToNumberCounts[suit]) {
        suitToNumberCounts[suit] = {};
      }
      suitToNumberCounts[suit][number] =
        (suitToNumberCounts[suit][number] || 0) + 1;

      // Track element-to-number correlations
      if (!elementToNumberCounts[element]) {
        elementToNumberCounts[element] = {};
      }
      elementToNumberCounts[element][number] =
        (elementToNumberCounts[element][number] || 0) + 1;
    }
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
      percentage:
        totalCards > 0 ? Math.round(((count as number) / totalCards) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate correlations
  const correlations: Array<{
    dimension1: string;
    dimension2: string;
    insight: string;
  }> = [];

  // Element-Number correlations
  Object.entries(elementToNumberCounts).forEach(([element, numberCounts]) => {
    const topNumber = Object.entries(numberCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];
    if (topNumber && topNumber[1] >= 2) {
      const elementTotal = Object.values(numberCounts).reduce(
        (a, b) => a + b,
        0,
      );
      const percentage = Math.round((topNumber[1] / elementTotal) * 100);
      correlations.push({
        dimension1: element,
        dimension2: `${topNumber[0]} cards`,
        insight: `${element} energy frequently appears with ${topNumber[0]} cards (${percentage}% of ${element} cards), suggesting ${getNumberMeaning(topNumber[0]).toLowerCase()} themes in ${element.toLowerCase()} aspects of your life.`,
      });
    }
  });

  // Suit-Number correlations
  Object.entries(suitToNumberCounts).forEach(([suit, numberCounts]) => {
    const topNumber = Object.entries(numberCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];
    if (topNumber && topNumber[1] >= 2 && suit !== 'Major Arcana') {
      const suitTotal = Object.values(numberCounts).reduce((a, b) => a + b, 0);
      const percentage = Math.round((topNumber[1] / suitTotal) * 100);
      correlations.push({
        dimension1: suit,
        dimension2: `${topNumber[0]} cards`,
        insight: `${suit} cards frequently feature ${topNumber[0]}s (${percentage}% of ${suit} cards), indicating ${getNumberMeaning(topNumber[0]).toLowerCase()} patterns within ${suit.toLowerCase()} energy.`,
      });
    }
  });

  // Arcana-Number correlations
  const majorArcanaSuits =
    Object.entries(suitCounts)
      .filter(([suit]) => suit === 'Major Arcana')
      .map(([, count]) => count)[0] || 0;
  const minorArcanaTotal = totalCards - majorArcanaSuits;

  if (majorArcanaSuits > 0 && minorArcanaTotal > 0) {
    const majorPercentage = Math.round((majorArcanaSuits / totalCards) * 100);
    const minorPercentage = Math.round((minorArcanaTotal / totalCards) * 100);
    correlations.push({
      dimension1: 'Major Arcana',
      dimension2: 'Minor Arcana',
      insight: `Your readings show ${majorPercentage}% Major Arcana and ${minorPercentage}% Minor Arcana cards, ${majorPercentage > 40 ? 'indicating significant life lessons and transformative energies are prominent' : majorPercentage > 25 ? 'suggesting a balance between major life themes and daily experiences' : 'reflecting a focus on practical, day-to-day energies'}.`,
    });
  }

  // Suit-Arcana balance correlations
  Object.entries(suitCounts).forEach(([suit, count]) => {
    if (suit !== 'Major Arcana' && count > 0) {
      const suitPercentage = Math.round((count / totalCards) * 100);
      const arcanaType =
        suitPercentage > 30
          ? 'dominant'
          : suitPercentage > 20
            ? 'prominent'
            : 'present';
      if (suitPercentage >= 15) {
        correlations.push({
          dimension1: suit,
          dimension2: 'Arcana Balance',
          insight: `${suit} cards represent ${suitPercentage}% of your readings, making them ${arcanaType} in your tarot patterns. This suggests ${suit.toLowerCase()} energy is ${arcanaType === 'dominant' ? 'a central theme' : arcanaType === 'prominent' ? 'an important influence' : 'present'} in your current journey.`,
        });
      }
    }
  });

  return {
    multiDimensional: {
      suitPatterns,
      arcanaBalance: arcanaCounts,
      numberPatterns,
      correlations,
    },
  };
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

function getSuitElement(suit: string): string {
  if (suit === 'Wands') return 'Fire';
  if (suit === 'Cups') return 'Water';
  if (suit === 'Swords') return 'Air';
  if (suit === 'Pentacles') return 'Earth';
  return 'Spirit';
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
    const userPlanRaw = user.plan;

    const { searchParams } = request.nextUrl;
    const daysParam = searchParams.get('days');
    const requestedDays = daysParam ? parseInt(daysParam, 10) : undefined;

    const [subscriptionResult, conversionPlanResult] = await Promise.all([
      sql`
        SELECT plan_type, status, stripe_customer_id
        FROM subscriptions
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 1
      `,
      sql`
        SELECT plan_type
        FROM conversion_events
        WHERE user_id = ${user.id}
          AND plan_type IS NOT NULL
          AND plan_type <> ''
        ORDER BY created_at DESC
        LIMIT 1
      `,
    ]);

    const subscription = subscriptionResult.rows[0];
    const conversionPlan = conversionPlanResult.rows[0]?.plan_type;
    let customerId = subscription?.stripe_customer_id;

    let planType = normalizePlanType(userPlanRaw);
    let planSource: 'session' | 'subscription' | 'conversion' | 'stripe' =
      'session';
    let subscriptionStatus:
      | 'free'
      | 'trial'
      | 'active'
      | 'cancelled'
      | 'past_due' = planType !== 'free' ? 'active' : 'free';
    if ((!planType || planType === 'free') && subscription?.plan_type) {
      const dbPlan = normalizePlanType(subscription.plan_type);
      if (dbPlan !== 'free') {
        planType = dbPlan;
        planSource = 'subscription';
        const rawStatus = subscription.status || 'free';
        subscriptionStatus =
          rawStatus === 'trialing'
            ? 'trial'
            : (rawStatus as typeof subscriptionStatus);
      }
    }

    if (
      (!planType || planType === 'free') &&
      conversionPlan &&
      normalizePlanType(conversionPlan) !== 'free'
    ) {
      planType = normalizePlanType(conversionPlan);
      planSource = 'conversion';
      subscriptionStatus = 'active';
    }

    // Use hardcoded baseUrl to prevent SSRF attacks
    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';

    // Always check Stripe if we have customer ID (Stripe is source of truth)
    // This ensures we get correct plan even if database is stale
    if (customerId) {
      try {
        // Pass userId so get-subscription route can update database automatically
        const stripeResponse = await fetch(
          `${baseUrl}/api/stripe/get-subscription`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId, userId: user.id }),
            // Allow Next.js to cache for 5 minutes (matches Stripe route)
            next: { revalidate: 300 },
          },
        );

        if (stripeResponse.ok) {
          const stripeData = await stripeResponse.json();
          if (
            (stripeData.success || stripeData.hasSubscription) &&
            stripeData.subscription
          ) {
            const stripeSub = stripeData.subscription;
            // Normalize status: 'trialing' -> 'trial' for consistency
            const rawStripeStatus = stripeSub.status;
            subscriptionStatus =
              rawStripeStatus === 'trialing'
                ? 'trial'
                : (rawStripeStatus as typeof subscriptionStatus);
            planType = normalizePlanType(stripeSub.plan);
            planSource = 'stripe';
            console.log(
              `[patterns/advanced] Fetched from Stripe: rawStatus=${rawStripeStatus}, status=${subscriptionStatus}, plan=${stripeSub.plan}, normalized=${planType}, hasAccess=${hasFeatureAccess(subscriptionStatus, planType, 'advanced_patterns')}`,
            );
          } else {
            console.log(
              '[patterns/advanced] Stripe response missing subscription data, using database subscription',
            );
          }
        } else {
          // Check if Stripe is unavailable (503) - this is expected in preview/dev
          const stripeData =
            stripeResponse.status === 503
              ? await stripeResponse.json().catch(() => null)
              : null;

          if (stripeData?.useDatabaseFallback) {
            console.log(
              '[patterns/advanced] Stripe not configured in this environment, using database subscription',
            );
            // Continue with database subscription (already set above)
          } else {
            console.log(
              `[patterns/advanced] Stripe fetch failed: ${stripeResponse.status}, using database subscription`,
            );
            // Continue with database subscription (already set above)
          }
        }
      } catch (error) {
        console.error(
          '[patterns/advanced] Failed to fetch from Stripe:',
          error,
        );
      }
    } else {
      console.log(
        '[patterns/advanced] No customer ID, using database subscription',
      );
    }

    const normalizedPlan = normalizePlanType(planType);
    const isAnnualPlan = normalizedPlan === 'lunary_plus_ai_annual';
    const isAiPlan = normalizedPlan === 'lunary_plus_ai' || isAnnualPlan;
    if (planSource !== 'subscription' && normalizedPlan !== 'free') {
      subscriptionStatus =
        subscriptionStatus === 'active' || subscriptionStatus === 'trial'
          ? subscriptionStatus
          : 'active';
    }

    let hasAccess = false;
    if (isAiPlan) {
      hasAccess =
        FEATURE_ACCESS[
          isAnnualPlan ? 'lunary_plus_ai_annual' : 'lunary_plus_ai'
        ].includes('advanced_patterns');
    } else {
      hasAccess = hasFeatureAccess(
        subscriptionStatus,
        normalizedPlan,
        'advanced_patterns',
      );
    }

    console.log(
      `[patterns/advanced] Access decision for user ${user.id}: hasAccess=${hasAccess}, plan=${normalizedPlan}, planSource=${planSource}, status=${subscriptionStatus}`,
    );

    if (!hasAccess) {
      console.error(
        `[patterns/advanced] Access denied for user ${user.id}: status=${subscriptionStatus}, planType=${planType}, normalized=${normalizedPlan}`,
      );
      return NextResponse.json(
        {
          error:
            'Advanced pattern analysis is available for Lunary+ Pro subscribers',
          requiresUpgrade: true,
        },
        { status: 403 },
      );
    }

    const [yearOverYear, enhancedTarot] = await Promise.all([
      getYearOverYearComparison(user.id),
      getEnhancedTarotPatterns(user.id, planType, requestedDays),
    ]);

    const analysis: AdvancedPatternAnalysis = {
      yearOverYear,
      enhancedTarot,
    };

    return NextResponse.json(
      { success: true, analysis },
      {
        headers: {
          // Don't cache subscription checks - status can change at any time
          // Analysis data is cached in database, but subscription checks must be fresh
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
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
