import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  hasFeatureAccess,
  normalizePlanType,
} from '../../../../../utils/pricing';
import { getTarotPatternAnalysis } from '@/lib/ai/providers';
import dayjs from 'dayjs';
import { unstable_cache } from 'next/cache';
import { generateSpreadReading } from '@/utils/tarot/spreadReading';
import { TAROT_SPREAD_MAP } from '@/constants/tarotSpreads';
import { getTarotCardByName } from '@/utils/tarot/deck';

export const revalidate = 86400; // 24 hours cache

async function generateHistoricalReadingsForYear(
  userId: string,
  year: number,
  userName?: string,
): Promise<void> {
  const spreadSlug = 'past-present-future';
  const spread = TAROT_SPREAD_MAP[spreadSlug];
  if (!spread) {
    console.error(
      `[generateHistoricalReadingsForYear] Spread not found: ${spreadSlug}`,
    );
    return;
  }

  const yearStart = dayjs(`${year}-01-01T00:00:00Z`);
  const yearEnd = dayjs(`${year}-12-31T23:59:59Z`);
  const daysInYear = yearEnd.diff(yearStart, 'day') + 1;

  const readingsToGenerate = Math.min(daysInYear, 30);

  let successCount = 0;
  let errorCount = 0;

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[generateHistoricalReadingsForYear] Starting generation for year ${year}, will create ${readingsToGenerate} readings`,
    );
  }

  for (let i = 0; i < readingsToGenerate; i++) {
    const date = yearStart.add(
      i * Math.floor(daysInYear / readingsToGenerate),
      'day',
    );
    const seed = `historical-${userId}-${year}-${date.format('YYYY-MM-DD')}`;
    const dateISO = date.toISOString();

    try {
      const reading = generateSpreadReading({
        spreadSlug,
        userId,
        userName,
        seed,
      });

      const cardsForStorage = reading.cards.map((item) => ({
        positionId: item.positionId,
        positionLabel: item.positionLabel,
        positionPrompt: item.positionPrompt,
        card: item.card,
        insight: item.insight,
      }));

      await sql`
        INSERT INTO tarot_readings (
          user_id,
          spread_slug,
          spread_name,
          plan_snapshot,
          cards,
          summary,
          highlights,
          journaling_prompts,
          metadata,
          created_at
        ) VALUES (
          ${userId},
          ${reading.spreadSlug},
          ${reading.spreadName},
          'free',
          ${JSON.stringify(cardsForStorage)}::jsonb,
          ${reading.summary},
          ${JSON.stringify(reading.highlights)}::jsonb,
          ${JSON.stringify(reading.journalingPrompts)}::jsonb,
          ${JSON.stringify({ ...reading.metadata, historical: true, generatedYear: year })}::jsonb,
          ${dateISO}
        )
      `;
      successCount++;
    } catch (error) {
      errorCount++;
      console.error(
        `[generateHistoricalReadingsForYear] Failed to generate reading for ${date.format('YYYY-MM-DD')} (${dateISO}):`,
        error,
      );
      if (error instanceof Error) {
        console.error(`[generateHistoricalReadingsForYear] Error details:`, {
          message: error.message,
          stack: error.stack,
        });
      }
    }
  }

  console.log(
    `[generateHistoricalReadingsForYear] Completed generation for year ${year}: ${successCount} successful, ${errorCount} failed`,
  );
}

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
      elementPatterns: Array<{
        element: string;
        count: number;
        percentage: number;
        suits: string[];
      }>;
      colorPatterns: Array<{
        color: string;
        count: number;
        percentage: number;
      }>;
      correlations: Array<{
        dimension1: string;
        dimension2: string;
        insight: string;
      }>;
    };
    timeline: {
      days30: {
        dominantThemes: string[];
        frequentCards: Array<{ name: string; count: number }>;
      };
      days180?: {
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
      timelineData?: Array<{
        date: string;
        cards: Array<{ name: string; suit: string }>;
      }>;
    };
    months12?: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      trendAnalysis: string[];
      timelineData?: Array<{
        date: string;
        cards: Array<{ name: string; suit: string }>;
      }>;
    };
  };
}

async function getCachedYearAnalysis(
  userId: string,
  year: number,
  startDate: string,
  endDate: string,
  userName?: string,
): Promise<{
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number }>;
  patternInsights: string[];
  cardRecaps?: Array<{ cardName: string; recap: string }> | null;
  trends?: Array<{
    metric: string;
    change: number;
    direction: 'up' | 'down' | 'stable';
  }> | null;
}> {
  // Check database first for stored analysis (persistent cache)
  // Handle gracefully if table doesn't exist yet
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
      if (
        analysis.dominantThemes.length > 0 ||
        analysis.frequentCards.length > 0
      ) {
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[getCachedYearAnalysis] Using stored analysis for year ${year} from database`,
          );
        }
        // Generate card recaps on-the-fly from frequentCards (no need to store in DB)
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
    }
  } catch (error: any) {
    // Table doesn't exist yet - that's okay, we'll create it when we store results
    if (error?.code === '42P01') {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[getCachedYearAnalysis] year_analysis table doesn't exist yet, will create on first store`,
        );
      }
    } else {
      throw error;
    }
  }

  // Cache key includes version to invalidate old cached empty results
  // v4: Added database storage for persistent caching
  const cacheKey = `year-analysis-${userId}-${year}-v4`;
  const tags = [`year-analysis-${userId}`, `year-analysis-${userId}-${year}`];

  // Cache full calendar years (Jan 1 - Dec 31) for 1 year since they're complete and don't change
  // Both current and historical years use full calendar year boundaries
  // Use 1 year cache for all years - if cache is empty, it will be refreshed on next request
  const revalidateTime = 31536000; // 1 year for all years

  const cached = unstable_cache(
    async () => {
      let result = await sql`
        SELECT cards, created_at
        FROM tarot_readings
        WHERE user_id = ${userId}
          AND archived_at IS NULL
          AND created_at >= ${startDate}
          AND created_at <= ${endDate}
        ORDER BY created_at DESC
      `;

      // IMPORTANT: Check for historical data BEFORE caching empty results
      // If no data for specific year and it's a past year, use all historical data before CURRENT year starts
      // This ensures we always have data for comparison even if user didn't have readings in that specific year
      // We check before current year (not end of last year) to include all historical readings
      if (result.rows.length === 0 && year < dayjs().year()) {
        const currentYearStart = dayjs(`${dayjs().year()}-01-01T00:00:00Z`);
        const historicalResult = await sql`
          SELECT cards, created_at
          FROM tarot_readings
          WHERE user_id = ${userId}
            AND archived_at IS NULL
            AND created_at < ${currentYearStart.toISOString()}
          ORDER BY created_at DESC
          LIMIT 1000
        `;
        if (historicalResult.rows.length > 0) {
          result = historicalResult;
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[getCachedYearAnalysis] Using ${historicalResult.rows.length} historical readings for year ${year} (before ${currentYearStart.toISOString()})`,
            );
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[getCachedYearAnalysis] No data found for year ${year} and no historical data before current year`,
            );
          }
        }
      }

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

      const patternInsights: string[] = [];
      if (frequentCards.length > 0) {
        const topCard = frequentCards[0];
        patternInsights.push(
          `"${topCard.name}" appeared ${topCard.count} times, indicating a significant theme in your journey.`,
        );
      }

      const analysis = { dominantThemes, frequentCards, patternInsights };

      // Store analysis in database for persistent caching
      // Handle gracefully if table doesn't exist yet
      try {
        await sql`
          INSERT INTO year_analysis (user_id, year, analysis_data, updated_at)
          VALUES (${userId}, ${year}, ${JSON.stringify(analysis)}::jsonb, NOW())
          ON CONFLICT (user_id, year)
          DO UPDATE SET
            analysis_data = ${JSON.stringify(analysis)}::jsonb,
            updated_at = NOW()
        `;
      } catch (error: any) {
        // If table doesn't exist, that's okay - user needs to run setup-db
        if (error?.code === '42P01') {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[getCachedYearAnalysis] year_analysis table doesn't exist - run 'pnpm setup-db' to create it`,
            );
          }
        } else {
          if (process.env.NODE_ENV === 'development') {
            console.error(
              `[getCachedYearAnalysis] Failed to store analysis in database:`,
              error,
            );
          }
        }
      }

      // Generate card recaps on-the-fly from frequentCards (no need to store in DB)
      const cardRecaps = frequentCards.slice(0, 5).map((card) => ({
        cardName: card.name,
        recap: generateCardRecap(card.name, card.count, 'year-over-year'),
      }));

      return {
        ...analysis,
        cardRecaps: cardRecaps.length > 0 ? cardRecaps : null,
        trends: null,
      };
    },
    [cacheKey],
    {
      tags,
      revalidate: revalidateTime,
    },
  );

  // Get cached result first
  const cachedResult = await cached();

  if (process.env.NODE_ENV === 'development') {
    console.log(`[getCachedYearAnalysis] Cached result for year ${year}:`, {
      themes: cachedResult.dominantThemes.length,
      cards: cachedResult.frequentCards.length,
      isEmpty:
        cachedResult.dominantThemes.length === 0 &&
        cachedResult.frequentCards.length === 0,
      isPastYear: year < dayjs().year(),
    });
  }

  // CRITICAL: Overwrite empty cache results by checking database directly
  // If cache returned empty but database has data, process and return it
  // This ensures empty cache doesn't block historical data from being shown
  const isEmpty =
    cachedResult.dominantThemes.length === 0 &&
    cachedResult.frequentCards.length === 0;

  if (isEmpty && year < dayjs().year()) {
    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[getCachedYearAnalysis] Cache is empty for year ${year}, checking database for historical data...`,
      );
    }
    // Bypass cache and check database directly for historical data
    const currentYearStart = dayjs(`${dayjs().year()}-01-01T00:00:00Z`);

    // First, check ALL readings to see what we have
    const allReadingsCheck = await sql`
      SELECT created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND archived_at IS NULL
      ORDER BY created_at DESC
      LIMIT 10
    `;

    const freshCheck = await sql`
      SELECT cards, created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND archived_at IS NULL
        AND created_at < ${currentYearStart.toISOString()}
      ORDER BY created_at DESC
      LIMIT 1000
    `;

    if (process.env.NODE_ENV === 'development') {
      console.log(
        `[getCachedYearAnalysis] Historical data check for year ${year}:`,
        {
          rowsFound: freshCheck.rows.length,
          currentYearStart: dayjs(
            `${dayjs().year()}-01-01T00:00:00Z`,
          ).toISOString(),
          allReadingsCount: allReadingsCheck.rows.length,
          sampleDates: allReadingsCheck.rows
            .slice(0, 5)
            .map((r: any) => r.created_at),
        },
      );
    }

    if (freshCheck.rows.length > 0) {
      // Data exists now! Process it and return (this will eventually update cache)
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[getCachedYearAnalysis] Overwriting empty cache with ${freshCheck.rows.length} historical readings for year ${year}`,
        );
      }

      const cardFrequency: { [key: string]: number } = {};
      const keywordCounts: { [key: string]: number } = {};

      freshCheck.rows.forEach((row) => {
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
        const topCard = frequentCards[0];
        patternInsights.push(
          `"${topCard.name}" appeared ${topCard.count} times, indicating a significant theme in your journey.`,
        );
      }

      // Invalidate cache so next request gets fresh data from cache
      const { revalidateTag } = await import('next/cache');
      revalidateTag(`year-analysis-${userId}-${year}`);

      return { dominantThemes, frequentCards, patternInsights };
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[getCachedYearAnalysis] No historical data found for year ${year}, generating synchronously...`,
        );
      }

      // For past years, generate synchronously since they're static and won't change
      // This ensures we return actual data instead of empty results
      // Use userName passed to function, or try to get from subscriptions table
      try {
        let finalUserName = userName;
        if (!finalUserName) {
          try {
            const subscriptionResult = await sql`
              SELECT user_name
              FROM subscriptions
              WHERE user_id = ${userId}
              LIMIT 1
            `;
            finalUserName = subscriptionResult.rows[0]?.user_name;
          } catch {
            // Subscriptions table might not have user_name, that's okay
            finalUserName = undefined;
          }
        }

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[getCachedYearAnalysis] Generating historical readings for year ${year} synchronously...`,
          );
        }

        // Generate synchronously for past years - they're static so this is safe
        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[getCachedYearAnalysis] About to generate readings for year ${year}, date range: ${startDate} to ${endDate}`,
          );
        }

        await generateHistoricalReadingsForYear(userId, year, finalUserName);

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[getCachedYearAnalysis] Generation complete, checking database...`,
          );
        }

        // After generation, re-check database for the newly created readings
        const afterGenerationCheck = await sql`
          SELECT cards, created_at
          FROM tarot_readings
          WHERE user_id = ${userId}
            AND archived_at IS NULL
            AND created_at >= ${startDate}
            AND created_at <= ${endDate}
          ORDER BY created_at DESC
        `;

        if (process.env.NODE_ENV === 'development') {
          console.log(
            `[getCachedYearAnalysis] After generation check: found ${afterGenerationCheck.rows.length} readings`,
          );
        }

        if (afterGenerationCheck.rows.length > 0) {
          if (process.env.NODE_ENV === 'development') {
            console.log(
              `[getCachedYearAnalysis] Found ${afterGenerationCheck.rows.length} readings after generation, processing...`,
            );
          }

          // Process the newly generated readings
          const cardFrequency: { [key: string]: number } = {};
          const keywordCounts: { [key: string]: number } = {};

          afterGenerationCheck.rows.forEach((row) => {
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
            const topCard = frequentCards[0];
            patternInsights.push(
              `"${topCard.name}" appeared ${topCard.count} times, indicating a significant theme in your journey.`,
            );
          }

          const analysis = { dominantThemes, frequentCards, patternInsights };

          // Store in database cache
          try {
            await sql`
              INSERT INTO year_analysis (user_id, year, analysis_data, updated_at)
              VALUES (${userId}, ${year}, ${JSON.stringify(analysis)}::jsonb, NOW())
              ON CONFLICT (user_id, year)
              DO UPDATE SET
                analysis_data = ${JSON.stringify(analysis)}::jsonb,
                updated_at = NOW()
            `;
          } catch (error: any) {
            if (error?.code !== '42P01') {
              // Only log if it's not a missing table error
              if (process.env.NODE_ENV === 'development') {
                console.error(
                  `[getCachedYearAnalysis] Failed to store analysis:`,
                  error,
                );
              }
            }
          }

          // Generate card recaps on-the-fly from frequentCards
          const cardRecaps = frequentCards.slice(0, 5).map((card) => ({
            cardName: card.name,
            recap: generateCardRecap(card.name, card.count, 'year-over-year'),
          }));

          // Invalidate cache so next request uses fresh data
          const { revalidateTag } = await import('next/cache');
          revalidateTag(`year-analysis-${userId}-${year}`);

          return {
            ...analysis,
            cardRecaps: cardRecaps.length > 0 ? cardRecaps : null,
            trends: null,
          };
        }
      } catch (error) {
        console.error(
          `[getCachedYearAnalysis] Failed to generate historical readings:`,
          error,
        );
        // Log full error details
        if (error instanceof Error) {
          console.error(
            `[getCachedYearAnalysis] Error message:`,
            error.message,
          );
          console.error(`[getCachedYearAnalysis] Error stack:`, error.stack);
        }
        // Continue to return empty result if generation fails
      }
    }
  }

  // Return cached result (empty or not)
  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[getCachedYearAnalysis] Returning cached result for year ${year}:`,
      {
        themes: cachedResult.dominantThemes.length,
        cards: cachedResult.frequentCards.length,
      },
    );
  }
  return cachedResult;
}

async function getYearOverYearComparison(
  userId: string,
  userName?: string,
  userBirthday?: string,
): Promise<AdvancedPatternAnalysis['yearOverYear']> {
  const now = dayjs();
  const thisYear = now.year();
  const lastYear = thisYear - 1;

  // Use full calendar years (Jan 1 - Dec 31) for consistency
  // This ensures the analysis doesn't change every day and can be cached for a full year
  const thisYearStart = dayjs(`${thisYear}-01-01T00:00:00Z`);
  const thisYearEnd = dayjs(`${thisYear}-12-31T23:59:59Z`);
  const lastYearStart = dayjs(`${lastYear}-01-01T00:00:00Z`);
  const lastYearEnd = dayjs(`${lastYear}-12-31T23:59:59Z`);

  if (process.env.NODE_ENV === 'development') {
    console.log('[getYearOverYearComparison] Date ranges:', {
      thisYear: {
        start: thisYearStart.toISOString(),
        end: thisYearEnd.toISOString(),
      },
      lastYear: {
        start: lastYearStart.toISOString(),
        end: lastYearEnd.toISOString(),
      },
    });
  }

  // Use cached analysis for both years
  // Both years use full calendar year boundaries and are cached for 1 year
  const [thisYearAnalysis, lastYearAnalysis] = await Promise.all([
    getCachedYearAnalysis(
      userId,
      thisYear,
      thisYearStart.toISOString(),
      thisYearEnd.toISOString(),
      userName,
    ),
    getCachedYearAnalysis(
      userId,
      lastYear,
      lastYearStart.toISOString(),
      lastYearEnd.toISOString(),
      userName,
    ),
  ]);

  const thisYearData = thisYearAnalysis;
  const lastYearData = lastYearAnalysis;

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

  // Check if last year has data by checking if dominant themes or cards exist
  if (
    lastYearData.dominantThemes.length === 0 &&
    lastYearData.frequentCards.length === 0
  ) {
    insights.push(
      "This is your first year of tarot readings. As you continue your journey, you'll be able to see how your themes evolve year over year.",
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
    const thisYearTotalCards = thisYearData.frequentCards.reduce(
      (sum, card) => sum + card.count,
      0,
    );
    const lastYearTotalCards = lastYearData.frequentCards.reduce(
      (sum, card) => sum + card.count,
      0,
    );

    if (lastYearTotalCards > 0) {
      const totalCardChange =
        ((thisYearTotalCards - lastYearTotalCards) / lastYearTotalCards) * 100;
      if (Math.abs(totalCardChange) > 1) {
        trends.push({
          metric: 'Total card frequency',
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
  userName?: string,
  userBirthday?: string,
): Promise<AdvancedPatternAnalysis['enhancedTarot']> {
  const days = planType === 'lunary_plus_ai_annual' ? 365 : 90;
  const startDate = dayjs().subtract(days, 'day');

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[getEnhancedTarotPatterns] Querying ${days} days (plan: ${planType}): from ${startDate.toISOString()} to now`,
    );
  }

  const result = await sql`
    SELECT cards, created_at
    FROM tarot_readings
    WHERE user_id = ${userId}
      AND archived_at IS NULL
      AND created_at >= NOW() - (${days} || ' days')::INTERVAL
    ORDER BY created_at DESC
  `;

  if (process.env.NODE_ENV === 'development') {
    console.log(
      `[getEnhancedTarotPatterns] Found ${result.rows.length} readings for ${days}-day period`,
    );
  }

  const suitCounts: { [key: string]: number } = {};
  const arcanaCounts = { major: 0, minor: 0 };
  const numberCounts: { [key: string]: number } = {};
  const elementCounts: { [key: string]: number } = {};
  const colorCounts: { [key: string]: number } = {};
  const elementToSuits: { [key: string]: Set<string> } = {};
  const suitToNumberCounts: { [key: string]: { [key: string]: number } } = {};
  const elementToNumberCounts: { [key: string]: { [key: string]: number } } =
    {};
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

      // Map suit to element
      const element = getSuitElement(suit);
      elementCounts[element] = (elementCounts[element] || 0) + 1;
      if (!elementToSuits[element]) {
        elementToSuits[element] = new Set();
      }
      elementToSuits[element].add(suit);

      // Map suit to color
      const color = getSuitColor(suit);
      colorCounts[color] = (colorCounts[color] || 0) + 1;

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

  // Calculate element patterns
  const elementPatterns = Object.entries(elementCounts)
    .map(([element, count]) => ({
      element,
      count,
      percentage: totalCards > 0 ? Math.round((count / totalCards) * 100) : 0,
      suits: Array.from(elementToSuits[element] || []),
    }))
    .sort((a, b) => b.count - a.count);

  // Calculate color patterns
  const colorPatterns = Object.entries(colorCounts)
    .map(([color, count]) => ({
      color,
      count,
      percentage: totalCards > 0 ? Math.round((count / totalCards) * 100) : 0,
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
      correlations.push({
        dimension1: element,
        dimension2: `${topNumber[0]} cards`,
        insight: `${element} energy frequently appears with ${topNumber[0]} cards, suggesting ${getNumberMeaning(topNumber[0]).toLowerCase()} themes in ${element.toLowerCase()} aspects of your life.`,
      });
    }
  });

  // Suit-Arcana correlations
  const majorArcanaSuits =
    Object.entries(suitCounts)
      .filter(([suit]) => suit === 'Major Arcana')
      .map(([, count]) => count)[0] || 0;
  const minorArcanaTotal = totalCards - majorArcanaSuits;

  if (majorArcanaSuits > 0 && minorArcanaTotal > 0) {
    const majorPercentage = Math.round((majorArcanaSuits / totalCards) * 100);
    if (majorPercentage > 30) {
      correlations.push({
        dimension1: 'Major Arcana',
        dimension2: 'Minor Arcana',
        insight: `Major Arcana cards represent ${majorPercentage}% of your readings, indicating significant life lessons and transformative energies are prominent in your journey.`,
      });
    }
  }

  // Get timeline analysis
  const timeline: AdvancedPatternAnalysis['enhancedTarot']['timeline'] = {
    days30: await getTimelineAnalysis(userId, 30, userName, userBirthday),
  };

  if (planType === 'lunary_plus_ai_annual') {
    // Query readings separately to verify date ranges are different
    const days180Start = dayjs().subtract(180, 'day');
    const days365Start = dayjs().subtract(365, 'day');

    const days180CountResult = await sql`
      SELECT COUNT(*) as count, MIN(created_at) as oldest, MAX(created_at) as newest
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND archived_at IS NULL
        AND created_at >= ${days180Start.toISOString()}
    `;

    const days365CountResult = await sql`
      SELECT COUNT(*) as count, MIN(created_at) as oldest, MAX(created_at) as newest
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND archived_at IS NULL
        AND created_at >= ${days365Start.toISOString()}
    `;

    if (process.env.NODE_ENV === 'development') {
      console.log('[getEnhancedTarotPatterns] Reading counts by date range:', {
        days180: {
          startDate: days180Start.toISOString(),
          count: days180CountResult.rows[0]?.count || 0,
          oldestReading: days180CountResult.rows[0]?.oldest || 'none',
          newestReading: days180CountResult.rows[0]?.newest || 'none',
        },
        days365: {
          startDate: days365Start.toISOString(),
          count: days365CountResult.rows[0]?.count || 0,
          oldestReading: days365CountResult.rows[0]?.oldest || 'none',
          newestReading: days365CountResult.rows[0]?.newest || 'none',
        },
      });
    }

    const [days180Analysis, days365Analysis] = await Promise.all([
      getTimelineAnalysis(userId, 180, userName, userBirthday),
      getTimelineAnalysis(userId, 365, userName, userBirthday),
    ]);

    timeline.days180 = days180Analysis;
    timeline.days365 = days365Analysis;
  }

  return {
    multiDimensional: {
      suitPatterns,
      arcanaBalance: arcanaCounts,
      numberPatterns,
      elementPatterns,
      colorPatterns,
      correlations,
    },
    timeline,
  };
}

async function getTimelineAnalysis(
  userId: string,
  days: number,
  userName?: string,
  userBirthday?: string,
): Promise<{
  dominantThemes: string[];
  frequentCards: Array<{ name: string; count: number }>;
  timelineData?: Array<{
    date: string;
    cards: Array<{ name: string; suit: string }>;
  }>;
}> {
  const cacheKey = `timeline-analysis-${userId}-${days}`;
  const tags = [
    `timeline-analysis-${userId}`,
    `timeline-analysis-${userId}-${days}`,
  ];

  // Cache timeline analysis - shorter periods (30 days) refresh more often than longer ones (365 days)
  // Historical data (180+ days) can be cached longer since older readings don't change
  const revalidateTime = days <= 30 ? 3600 : days <= 180 ? 86400 : 604800; // 1h, 1d, 1w

  const cached = unstable_cache(
    async () => {
      const startDate = dayjs().subtract(days, 'day');
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[getTimelineAnalysis] Analyzing ${days} days: from ${startDate.toISOString()} to now`,
        );
      }

      const displayName = userName;
      const birthday = userBirthday;

      // Generate seeded cards for each day in the range
      const tarotModule = await import('../../../../../utils/tarot/tarot');
      const getTarotCard = tarotModule.getTarotCard;
      const cardFrequency: { [key: string]: number } = {};
      const keywordCounts: { [key: string]: number } = {};

      const now = dayjs();
      for (let i = 0; i < days; i++) {
        const date = now.subtract(i, 'day');
        const dateString = date.toDate().toDateString();

        // Generate daily card for this date
        const dailyCard = getTarotCard(
          `daily-${dateString}`,
          displayName,
          birthday,
        );
        const dailyCardName = dailyCard.name;
        cardFrequency[dailyCardName] = (cardFrequency[dailyCardName] || 0) + 1;
        if (dailyCard.keywords) {
          dailyCard.keywords.forEach((keyword: string) => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          });
        }

        // Generate weekly card (once per week)
        if (i % 7 === 0) {
          const weekStart = date.startOf('week');
          const weekStartYear = weekStart.year();
          const weekStartMonth = weekStart.month() + 1;
          const weekStartDate = weekStart.date();
          // Calculate day of year manually (dayjs doesn't have dayOfYear by default)
          const startOfYear = weekStart.startOf('year');
          const dayOfYear = weekStart.diff(startOfYear, 'day') + 1;
          const weekNumber = Math.floor(dayOfYear / 7);
          const weeklySeed = `weekly-${weekStartYear}-W${weekNumber}-${weekStartMonth}-${weekStartDate}`;
          const weeklyCard = getTarotCard(weeklySeed, displayName, birthday);
          const weeklyCardName = weeklyCard.name;
          cardFrequency[weeklyCardName] =
            (cardFrequency[weeklyCardName] || 0) + 1;
          if (weeklyCard.keywords) {
            weeklyCard.keywords.forEach((keyword: string) => {
              keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
            });
          }
        }

        // Generate personal card (once per month)
        if (i % 30 === 0) {
          const month = date.month().toString();
          const personalSeed = birthday ? birthday + month : month;
          const personalCard = getTarotCard(
            personalSeed,
            displayName,
            birthday,
          );
          const personalCardName = personalCard.name;
          cardFrequency[personalCardName] =
            (cardFrequency[personalCardName] || 0) + 1;
          if (personalCard.keywords) {
            personalCard.keywords.forEach((keyword: string) => {
              keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
            });
          }
        }
      }

      // Also include saved readings from this period
      const savedReadingsResult = await sql`
        SELECT cards, created_at
        FROM tarot_readings
        WHERE user_id = ${userId}
          AND archived_at IS NULL
          AND created_at >= NOW() - (${days} || ' days')::INTERVAL
        ORDER BY created_at DESC
      `;

      // Build timeline data with reading dates
      const timelineDataMap: Map<
        string,
        Array<{ name: string; suit: string }>
      > = new Map();

      savedReadingsResult.rows.forEach((row) => {
        const cards = Array.isArray(row.cards)
          ? row.cards
          : JSON.parse(row.cards || '[]');
        const dateKey = dayjs(row.created_at).format('YYYY-MM-DD');
        const cardsForDate: Array<{ name: string; suit: string }> = [];

        cards.forEach((card: any) => {
          const cardName = card.card?.name || card.name;
          const suit = getCardSuit(cardName);
          cardFrequency[cardName] = (cardFrequency[cardName] || 0) + 1;
          cardsForDate.push({ name: cardName, suit });

          const keywords = card.card?.keywords || card.keywords || [];
          keywords.forEach((keyword: string) => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
          });
        });

        if (cardsForDate.length > 0) {
          const existing = timelineDataMap.get(dateKey) || [];
          timelineDataMap.set(dateKey, [...existing, ...cardsForDate]);
        }
      });

      if (process.env.NODE_ENV === 'development') {
        console.log(`[getTimelineAnalysis] Analysis for ${days}-day period:`, {
          seededDaysAnalyzed: days,
          savedReadingsFound: savedReadingsResult.rows.length,
          uniqueCards: Object.keys(cardFrequency).length,
          totalCardOccurrences: Object.values(cardFrequency).reduce(
            (a, b) => a + b,
            0,
          ),
        });
      }

      const dominantThemes = Object.entries(keywordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([keyword]) => keyword);

      const frequentCards = Object.entries(cardFrequency)
        .filter(([, count]) => count >= 2)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([name, count]) => ({ name, count: count as number }));

      // Convert timeline data map to array, sorted by date
      const timelineData = Array.from(timelineDataMap.entries())
        .map(([date, cards]) => ({ date, cards }))
        .sort((a, b) => a.date.localeCompare(b.date));

      return {
        dominantThemes,
        frequentCards,
        timelineData: timelineData.length > 0 ? timelineData : undefined,
      };
    },
    [cacheKey],
    {
      tags,
      revalidate: revalidateTime,
    },
  );

  return await cached();
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

function getSuitColor(suit: string): string {
  if (suit === 'Wands') return 'Red/Orange';
  if (suit === 'Cups') return 'Blue';
  if (suit === 'Swords') return 'Yellow/White';
  if (suit === 'Pentacles') return 'Green/Brown';
  return 'Purple/Gold';
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

function generateCardRecap(
  cardName: string,
  count: number,
  context: 'year-over-year' | 'timeline' = 'year-over-year',
): string {
  const card = getTarotCardByName(cardName);
  if (!card) {
    return `"${cardName}" has appeared ${count} times, indicating a significant pattern in your readings.`;
  }

  const topKeywords = card.keywords.slice(0, 2).join(' and ');
  const frequencyContext =
    count >= 5 ? 'frequently' : count >= 3 ? 'regularly' : 'notably';

  if (context === 'year-over-year') {
    return `"${cardName}" has appeared ${count} times ${frequencyContext} throughout this period, emphasizing ${topKeywords.toLowerCase()} themes in your journey. This card's presence suggests ${card.keywords[0]?.toLowerCase() || 'significant'} energies are woven into your path, inviting reflection on how these patterns relate to your current experiences.`;
  } else {
    return `"${cardName}" appears ${frequencyContext} (${count} times) in this timeline, highlighting ${topKeywords.toLowerCase()} as key themes. The card's emphasis on ${card.keywords[0]?.toLowerCase() || 'these patterns'} suggests important patterns worth exploring in your spiritual practice.`;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const subscriptionResult = await sql`
      SELECT plan_type, status, stripe_customer_id
      FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    let subscription = subscriptionResult.rows[0];
    // Normalize status: 'trialing' -> 'trial' for consistency with hasFeatureAccess
    const rawStatus = subscription?.status || 'free';
    let subscriptionStatus = rawStatus === 'trialing' ? 'trial' : rawStatus;
    let planType = normalizePlanType(subscription?.plan_type);
    const customerId = subscription?.stripe_customer_id;
    const rawPlanType = subscription?.plan_type;

    // Always check Stripe if we have customer ID (Stripe is source of truth)
    // This ensures we get correct plan even if database is stale
    if (customerId) {
      try {
        const stripeResponse = await fetch(
          `${request.nextUrl.origin}/api/stripe/get-subscription`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ customerId }),
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
              rawStripeStatus === 'trialing' ? 'trial' : rawStripeStatus;
            planType = normalizePlanType(stripeSub.plan);
            console.log(
              `[patterns/advanced] Fetched from Stripe: rawStatus=${rawStripeStatus}, status=${subscriptionStatus}, plan=${stripeSub.plan}, normalized=${planType}, hasAccess=${hasFeatureAccess(subscriptionStatus, planType, 'advanced_patterns')}`,
            );
          } else {
            console.log(
              '[patterns/advanced] Stripe response missing subscription data',
            );
          }
        } else {
          console.log(
            `[patterns/advanced] Stripe fetch failed: ${stripeResponse.status}`,
          );
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

    console.log(
      `[patterns/advanced] User ${user.id}: status=${subscriptionStatus}, planType=${planType}, hasAccess=${hasFeatureAccess(subscriptionStatus, planType, 'advanced_patterns')}`,
    );

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
      getEnhancedTarotPatterns(
        user.id,
        planType,
        user.displayName,
        user.birthday,
      ),
    ]);

    const analysis: AdvancedPatternAnalysis = {
      yearOverYear,
      enhancedTarot,
    };

    if (planType === 'lunary_plus_ai_annual') {
      // Use explicit different date ranges to ensure queries are different
      const sixMonthsDays = 183; // 6 months = ~183 days
      const twelveMonthsDays = 365; // 12 months = 365 days

      if (process.env.NODE_ENV === 'development') {
        console.log('[patterns/advanced] Fetching extended timeline:', {
          sixMonthsDays,
          twelveMonthsDays,
        });
      }

      // Query readings separately to verify date ranges
      const sixMonthsStart = dayjs().subtract(sixMonthsDays, 'day');
      const twelveMonthsStart = dayjs().subtract(twelveMonthsDays, 'day');

      // Get raw reading counts to verify queries are different
      const sixMonthsCountResult = await sql`
        SELECT COUNT(*) as count, MIN(created_at) as oldest, MAX(created_at) as newest
        FROM tarot_readings
        WHERE user_id = ${user.id}
          AND archived_at IS NULL
          AND created_at >= ${sixMonthsStart.toISOString()}
      `;

      const twelveMonthsCountResult = await sql`
        SELECT COUNT(*) as count, MIN(created_at) as oldest, MAX(created_at) as newest
        FROM tarot_readings
        WHERE user_id = ${user.id}
          AND archived_at IS NULL
          AND created_at >= ${twelveMonthsStart.toISOString()}
      `;

      if (process.env.NODE_ENV === 'development') {
        console.log('[patterns/advanced] Reading counts by date range:', {
          sixMonths: {
            days: sixMonthsDays,
            startDate: sixMonthsStart.toISOString(),
            count: sixMonthsCountResult.rows[0]?.count || 0,
            oldestReading: sixMonthsCountResult.rows[0]?.oldest || 'none',
            newestReading: sixMonthsCountResult.rows[0]?.newest || 'none',
          },
          twelveMonths: {
            days: twelveMonthsDays,
            startDate: twelveMonthsStart.toISOString(),
            count: twelveMonthsCountResult.rows[0]?.count || 0,
            oldestReading: twelveMonthsCountResult.rows[0]?.oldest || 'none',
            newestReading: twelveMonthsCountResult.rows[0]?.newest || 'none',
          },
        });
      }

      const [months6, months12] = await Promise.all([
        getTimelineAnalysis(
          user.id,
          sixMonthsDays,
          user.displayName,
          user.birthday,
        ),
        getTimelineAnalysis(
          user.id,
          twelveMonthsDays,
          user.displayName,
          user.birthday,
        ),
      ]);

      if (process.env.NODE_ENV === 'development') {
        console.log('[patterns/advanced] Extended timeline results:', {
          months6: {
            cards: months6.frequentCards.length,
            themes: months6.dominantThemes.length,
            topCards: months6.frequentCards
              .slice(0, 3)
              .map((c) => `${c.name} (${c.count}x)`),
            topThemes: months6.dominantThemes.slice(0, 3),
          },
          months12: {
            cards: months12.frequentCards.length,
            themes: months12.dominantThemes.length,
            topCards: months12.frequentCards
              .slice(0, 3)
              .map((c) => `${c.name} (${c.count}x)`),
            topThemes: months12.dominantThemes.slice(0, 3),
          },
        });
      }

      analysis.extendedTimeline = {
        months6: {
          ...months6,
          trendAnalysis: generateTrendAnalysis(months6),
          timelineData: months6.timelineData,
        },
        months12: {
          ...months12,
          trendAnalysis: generateTrendAnalysis(months12),
          timelineData: months12.timelineData,
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
