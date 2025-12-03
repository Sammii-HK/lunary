import dayjs from 'dayjs';
import { Body, Ecliptic, GeoVector, MakeTime } from 'astronomy-engine';

import {
  AiMessageRole,
  BirthChartSnapshot,
  ConversationMessageMeta,
  DailyHighlight,
  MoodHistory,
  MoodTrendEntry,
  MoonSnapshot,
  TarotCard,
  TarotReading,
  TransitRecord,
} from './types';

function getCurrentMoonSign(date: Date = new Date()): string {
  const astroTime = MakeTime(date);
  const vector = GeoVector(Body.Moon, astroTime, true);
  const ecl = Ecliptic(vector);
  const longitude = ecl.elon;
  const signIndex = Math.floor(longitude / 30);
  const SIGNS = [
    'Aries',
    'Taurus',
    'Gemini',
    'Cancer',
    'Leo',
    'Virgo',
    'Libra',
    'Scorpio',
    'Sagittarius',
    'Capricorn',
    'Aquarius',
    'Pisces',
  ];
  return SIGNS[signIndex];
}

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

const PLANETS = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
];

const MOON_PHASES: Array<{
  phase: string;
  emoji: string;
  illumination: number;
}> = [
  { phase: 'New Moon', emoji: '🌑', illumination: 0.0 },
  { phase: 'Waxing Crescent', emoji: '🌒', illumination: 0.25 },
  { phase: 'First Quarter', emoji: '🌓', illumination: 0.5 },
  { phase: 'Waxing Gibbous', emoji: '🌔', illumination: 0.75 },
  { phase: 'Full Moon', emoji: '🌕', illumination: 1.0 },
  { phase: 'Waning Gibbous', emoji: '🌖', illumination: 0.75 },
  { phase: 'Last Quarter', emoji: '🌗', illumination: 0.5 },
  { phase: 'Waning Crescent', emoji: '🌘', illumination: 0.25 },
];

const MOOD_TAGS = [
  'reflective',
  'energised',
  'sensitive',
  'grounded',
  'expansive',
  'creative',
  'restful',
] as const;

const ASSISTANT_ROLES: AiMessageRole[] = ['user', 'assistant'];

const BASE_LAT = 51.5074; // London latitude
const BASE_LON = -0.1278; // London longitude

const hashStringToNumber = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

const pickFromArray = <T>(items: T[], seed: number, offset = 0): T =>
  items[(seed + offset) % items.length];

const generateMoodTrend = (seed: number, now: Date): MoodTrendEntry[] => {
  return Array.from({ length: 7 }).map((_, index) => {
    const tag = pickFromArray(MOOD_TAGS as unknown as string[], seed, index);
    const date = dayjs(now).subtract(index, 'day').startOf('day').toISOString();
    return { date, tag };
  });
};

export type BirthChartProviderParams = { userId: string };

export const getBirthChart = async ({
  userId,
}: BirthChartProviderParams): Promise<BirthChartSnapshot | null> => {
  const seed = hashStringToNumber(userId || 'lunary');

  const placements = PLANETS.map((planet, index) => ({
    planet,
    sign: pickFromArray(ZODIAC_SIGNS, seed, index),
    house: ((seed + index) % 12) + 1,
    degree: ((seed * (index + 3)) % 30) + 1,
  }));

  return {
    date: '1990-01-01',
    time: '12:00',
    lat: BASE_LAT,
    lon: BASE_LON,
    placements,
    aspects: [
      { a: 'Sun', b: 'Moon', type: 'Trine', orb: 1.4 },
      { a: 'Venus', b: 'Mars', type: 'Conjunction', orb: 3.2 },
    ],
  };
};

export type CurrentTransitsProviderParams = { userId: string; now?: Date };

export type CurrentTransitsResponse = {
  transits: TransitRecord[];
  moon: MoonSnapshot | null;
};

export const getCurrentTransits = async ({
  userId,
  now = new Date(),
  personalizeForNotifications = false,
  isPayingUser = false,
}: CurrentTransitsProviderParams & {
  personalizeForNotifications?: boolean;
  isPayingUser?: boolean;
}): Promise<CurrentTransitsResponse> => {
  const { getGlobalCosmicData } = await import(
    '../cosmic-snapshot/global-cache'
  );
  const globalData = await getGlobalCosmicData(now);

  if (!globalData) {
    return {
      transits: [],
      moon: null,
    };
  }

  const moon: MoonSnapshot = {
    phase: globalData.moonPhase.name,
    sign: globalData.planetaryPositions.Moon?.sign || 'Unknown',
    emoji: globalData.moonPhase.emoji,
    illumination: globalData.moonPhase.illumination / 100,
  };

  const transits: TransitRecord[] = globalData.generalTransits
    .slice(0, 10)
    .map((transit) => {
      // Handle ingresses specially - they have planetB as null, sign is in planetA.constellation
      if (transit.aspect === 'ingress') {
        const planet =
          transit.planetA?.name || transit.planetA?.planet || 'Unknown';
        const sign = transit.planetA?.constellation || 'Unknown';
        return {
          aspect: transit.aspect,
          from: planet,
          to: sign !== 'Unknown' ? sign : 'Unknown',
          exactUtc: now.toISOString(),
          applying: true,
          strength: Math.min(transit.priority / 10, 1),
        };
      }

      return {
        aspect: transit.aspect,
        from: transit.planetA?.name || transit.planetA?.planet || 'Unknown',
        to: transit.planetB?.name || transit.planetB?.planet || 'Unknown',
        exactUtc: now.toISOString(),
        applying: true,
        strength: Math.min(transit.priority / 10, 1),
      };
    });

  if (personalizeForNotifications && isPayingUser) {
    const birthChart = await getBirthChart({ userId });
    if (birthChart && transits.length > 0) {
      const personalizedTransits = personalizeTransits(transits, birthChart);
      return {
        transits: personalizedTransits,
        moon,
      };
    }
  }

  return {
    transits,
    moon,
  };
};

export function personalizeTransits(
  transits: TransitRecord[],
  birthChart: BirthChartSnapshot,
): TransitRecord[] {
  return transits.map((transit) => {
    const natalPlanet = birthChart.placements?.find(
      (p) => p.planet === transit.from,
    );

    if (natalPlanet) {
      return {
        ...transit,
        strength: transit.strength * 1.1,
      };
    }

    return transit;
  });
}

export type TarotProviderParams = { userId: string; now?: Date };

export const getTarotLastReading = async ({
  userId,
  now = new Date(),
}: TarotProviderParams): Promise<
  | (TarotReading & {
      id?: string;
      aiInterpretation?: string;
      positionMeanings?: Record<string, string>;
    })
  | null
> => {
  try {
    const { sql } = await import('@vercel/postgres');
    const { TAROT_SPREADS } = await import('@/constants/tarotSpreads');

    const result = await sql`
      SELECT id, cards, spread_name, spread_slug, ai_interpretation, created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND archived_at IS NULL
        AND spread_name NOT IN ('Daily', 'Weekly', 'Personal')
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      const cards = Array.isArray(row.cards)
        ? row.cards
        : JSON.parse(row.cards || '[]');

      // Look up spread definition to get position meanings
      const spreadDef = TAROT_SPREADS.find(
        (s) => s.slug === row.spread_slug || s.name === row.spread_name,
      );
      const positionMeanings: Record<string, string> = {};
      if (spreadDef) {
        spreadDef.positions.forEach((pos) => {
          positionMeanings[pos.id] = pos.prompt;
          positionMeanings[pos.label] = pos.prompt;
        });
      }

      const reading = {
        id: row.id,
        spread: row.spread_name || 'Three Card Insight',
        cards: cards
          .map((card: any) => {
            const cardName = card.card?.name || card.name;
            const cardPositionId =
              card.positionId || card.positionLabel || card.position;
            const cardReversed = card.card?.reversed || card.reversed || false;

            if (!cardName) {
              console.warn('[Tarot Provider] Card missing name:', card);
              return null;
            }

            // Get position meaning from spread definition
            const positionMeaning = cardPositionId
              ? positionMeanings[cardPositionId] || cardPositionId
              : undefined;

            return {
              name: cardName,
              position: cardPositionId,
              positionMeaning,
              reversed: cardReversed,
            };
          })
          .filter(
            (
              card: {
                name: string;
                position?: string;
                positionMeaning?: string;
                reversed: boolean;
              } | null,
            ): card is {
              name: string;
              position?: string;
              positionMeaning?: string;
              reversed: boolean;
            } => card !== null,
          ),
        timestamp: row.created_at || dayjs(now).toISOString(),
        aiInterpretation: row.ai_interpretation || undefined,
        positionMeanings:
          Object.keys(positionMeanings).length > 0
            ? positionMeanings
            : undefined,
      };

      console.log(
        `[Tarot Provider] Found reading for user ${userId}: spread=${reading.spread}, cards=${reading.cards.length}, hasInterpretation=${!!reading.aiInterpretation}`,
      );
      return reading;
    }

    console.log(`[Tarot Provider] No tarot readings found for user ${userId}`);
  } catch (error) {
    console.error('[Tarot Provider] Failed to fetch from database:', error);
  }

  return null;
};

export type TarotRecentReadingsParams = {
  userId: string;
  limit?: number;
  now?: Date;
};

export type TarotReadingWithInsights = TarotReading & {
  summary?: string;
  highlights?: string[];
  journalingPrompts?: string[];
};

export const getTarotRecentReadings = async ({
  userId,
  limit = 5,
  now = new Date(),
  dailyPullsOnly = false,
}: TarotRecentReadingsParams & { dailyPullsOnly?: boolean }): Promise<
  TarotReadingWithInsights[]
> => {
  try {
    const { sql } = await import('@vercel/postgres');
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch recent tarot readings - either daily pulls only or all
    const result = dailyPullsOnly
      ? await sql`
          SELECT cards, spread_name, spread_slug, summary, highlights, journaling_prompts, created_at
          FROM tarot_readings
          WHERE user_id = ${userId}
            AND archived_at IS NULL
            AND spread_name IN ('Daily', 'Weekly')
            AND created_at >= ${sevenDaysAgo.toISOString()}
          ORDER BY created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT cards, spread_name, spread_slug, summary, highlights, journaling_prompts, created_at
          FROM tarot_readings
          WHERE user_id = ${userId}
            AND archived_at IS NULL
          ORDER BY created_at DESC
          LIMIT ${limit}
        `;

    console.log(
      `[Tarot Provider] Query mode: ${dailyPullsOnly ? 'DAILY PULLS ONLY' : 'ALL READINGS'}, found: ${result.rows.length}`,
    );

    if (result.rows.length > 0) {
      const readings: TarotReadingWithInsights[] = result.rows.map((row) => {
        const cards = Array.isArray(row.cards)
          ? row.cards
          : JSON.parse(row.cards || '[]');

        return {
          spread: row.spread_name || 'Three Card Insight',
          cards: cards
            .map((card: any) => {
              const cardName = card.card?.name || card.name;
              const cardPosition =
                card.positionId || card.positionLabel || card.position;
              const cardReversed =
                card.card?.reversed || card.reversed || false;

              if (!cardName) {
                return null;
              }

              return {
                name: cardName,
                position: cardPosition,
                reversed: cardReversed,
              };
            })
            .filter(
              (
                card: {
                  name: string;
                  position?: string;
                  reversed: boolean;
                } | null,
              ): card is {
                name: string;
                position?: string;
                reversed: boolean;
              } => card !== null,
            ),
          timestamp: row.created_at || dayjs(now).toISOString(),
          summary: row.summary || undefined,
          highlights: Array.isArray(row.highlights)
            ? row.highlights
            : row.highlights
              ? JSON.parse(row.highlights)
              : undefined,
          journalingPrompts: Array.isArray(row.journaling_prompts)
            ? row.journaling_prompts
            : row.journaling_prompts
              ? JSON.parse(row.journaling_prompts)
              : undefined,
        };
      });

      console.log(
        `[Tarot Provider] Found ${readings.length} recent readings for user ${userId}`,
      );
      return readings;
    }

    return [];
  } catch (error) {
    console.error('[Tarot Provider] Failed to fetch recent readings:', error);
    return [];
  }
};

export type TarotPatternAnalysisParams = {
  userId: string;
  userName?: string;
  userBirthday?: string;
  now?: Date;
};

export const getTarotPatternAnalysis = async ({
  userId,
  userName,
  userBirthday,
  now = new Date(),
}: TarotPatternAnalysisParams): Promise<{
  daily: TarotCard | null;
  weekly: TarotCard | null;
  recentDailyCards: Array<{ date: string; day: string; card: TarotCard }>;
  trends: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
    patternInsights: string[];
  };
} | null> => {
  try {
    // Import getTarotCard and dayjs - MUST match exactly how tarot page generates cards
    const { getTarotCard } = await import('../../../utils/tarot/tarot');
    const dayjs = (await import('dayjs')).default;

    // Use dayjs for date formatting - EXACTLY like the tarot page does
    const currentDate = dayjs(now);

    // Generate today's daily card using the EXACT same format as tarot page
    const todayStr = currentDate.format('YYYY-MM-DD');
    const dailyCard = getTarotCard(`daily-${todayStr}`, userName, userBirthday);
    const daily: TarotCard = {
      name: dailyCard.name,
      keywords: dailyCard.keywords || [],
      reversed: false,
    };

    // Generate weekly card (using Monday of this week)
    const weekStart = currentDate.startOf('week').add(1, 'day'); // Monday
    const weekStartStr = weekStart.format('YYYY-MM-DD');
    const weeklyCard = getTarotCard(
      `weekly-${weekStartStr}`,
      userName,
      userBirthday,
    );
    const weekly: TarotCard = {
      name: weeklyCard.name,
      keywords: weeklyCard.keywords || [],
      reversed: false,
    };

    // Generate last 7 days of daily cards - EXACTLY like tarot page (starts from yesterday, i=1)
    const recentDailyCards: Array<{
      date: string;
      day: string;
      card: TarotCard;
    }> = [];

    // Match tarot page: for (let i = 1; i < 8; i++) { currentDate.subtract(i, 'day') }
    for (let i = 1; i < 8; i++) {
      const day = currentDate.subtract(i, 'day');
      const dateStr = day.format('YYYY-MM-DD');
      const card = getTarotCard(`daily-${dateStr}`, userName, userBirthday);
      recentDailyCards.push({
        date: dateStr,
        day: day.format('dddd'), // Full day name like "Monday"
        card: {
          name: card.name,
          keywords: card.keywords || [],
          reversed: false,
        },
      });
    }

    console.log(
      `[Tarot Provider] Generated ${recentDailyCards.length} daily cards (birthday=${userBirthday}):`,
      recentDailyCards.map((r) => `${r.day}: ${r.card.name}`).join(', '),
    );

    // Analyze patterns from the generated daily cards
    const cardCounts: Record<string, number> = {};
    const suitCounts: Record<string, number> = {};

    for (const { card } of recentDailyCards) {
      const cardName = card.name;
      cardCounts[cardName] = (cardCounts[cardName] || 0) + 1;

      // Track suits
      if (cardName.includes('Cups'))
        suitCounts['Cups'] = (suitCounts['Cups'] || 0) + 1;
      else if (cardName.includes('Wands'))
        suitCounts['Wands'] = (suitCounts['Wands'] || 0) + 1;
      else if (cardName.includes('Swords'))
        suitCounts['Swords'] = (suitCounts['Swords'] || 0) + 1;
      else if (cardName.includes('Pentacles'))
        suitCounts['Pentacles'] = (suitCounts['Pentacles'] || 0) + 1;
      else suitCounts['Major Arcana'] = (suitCounts['Major Arcana'] || 0) + 1;
    }

    const frequentCards = Object.entries(cardCounts)
      .map(([name, count]) => ({ name, count }))
      .filter(({ count }) => count >= 2)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Determine dominant themes from suits
    const dominantThemes: string[] = [];
    const topSuits = Object.entries(suitCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2);

    for (const [suit] of topSuits) {
      if (suit === 'Cups') dominantThemes.push('Emotions and relationships');
      else if (suit === 'Wands') dominantThemes.push('Creativity and action');
      else if (suit === 'Swords')
        dominantThemes.push('Thoughts and challenges');
      else if (suit === 'Pentacles')
        dominantThemes.push('Material and practical matters');
      else if (suit === 'Major Arcana')
        dominantThemes.push('Major life transitions');
    }

    const patternInsights: string[] = [];
    if (frequentCards.length > 0) {
      patternInsights.push(
        `${frequentCards[0].name} appearing ${frequentCards[0].count}x suggests this energy is particularly significant right now.`,
      );
    }

    return {
      daily,
      weekly,
      recentDailyCards,
      trends: {
        dominantThemes,
        frequentCards,
        patternInsights,
      },
    };
  } catch (error) {
    console.error(
      '[Tarot Provider] Failed to generate pattern analysis:',
      error,
    );
    return null;
  }
};

export type DailyHighlightProviderParams = { userId: string; now?: Date };

export const getDailyHighlight = async ({
  userId,
  now = new Date(),
}: DailyHighlightProviderParams): Promise<DailyHighlight | null> => {
  const moonSign = getCurrentMoonSign(now);
  return {
    primaryEvent: `${moonSign} moon invites gentle reflection`,
    date: dayjs(now).format('YYYY-MM-DD'),
  };
};

export type MoodHistoryProviderParams = { userId: string; now?: Date };

export const getMoodHistory = async ({
  userId,
  now = new Date(),
}: MoodHistoryProviderParams): Promise<MoodHistory | null> => {
  const seed = hashStringToNumber(userId || 'lunary');
  const trend = generateMoodTrend(seed, now);
  return { last7d: trend };
};

export type ConversationHistoryProviderParams = {
  userId: string;
  limit?: number;
  now?: Date;
};

export type ConversationHistoryResponse = {
  lastMessages: ConversationMessageMeta[];
};

export const getConversationHistory = async ({
  userId,
  limit = 10,
  now = new Date(),
}: ConversationHistoryProviderParams): Promise<ConversationHistoryResponse> => {
  const seed = hashStringToNumber(userId || 'lunary');
  const messages: ConversationMessageMeta[] = [];
  const baseTimestamp = dayjs(now);

  for (let index = 0; index < limit; index += 1) {
    const role = ASSISTANT_ROLES[index % ASSISTANT_ROLES.length];
    const ts = baseTimestamp.subtract(index * 45, 'minute').toISOString();
    const tokens = ((seed + index * 13) % 200) + 20;
    messages.push({ role, ts, tokens });
  }

  return { lastMessages: messages };
};
