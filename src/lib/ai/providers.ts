import dayjs from 'dayjs';

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

const TAROT_CARDS = [
  'The High Priestess',
  'The Empress',
  'The Emperor',
  'The Hierophant',
  'The Lovers',
  'The Chariot',
  'Strength',
  'The Hermit',
  'Wheel of Fortune',
  'Justice',
  'The Hanged One',
  'Death',
  'Temperance',
  'The Devil',
  'The Tower',
  'The Star',
  'The Moon',
  'The Sun',
  'Judgement',
  'The World',
] as const;

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

const generateTarotSpread = (seed: number): TarotCard[] => {
  return Array.from({ length: 3 }).map((_, index) => {
    const card = pickFromArray(TAROT_CARDS as unknown as string[], seed, index);
    const reversed = (seed + index) % 2 === 0;
    return {
      name: card,
      position:
        index === 0 ? 'Present' : index === 1 ? 'Challenge' : 'Potential',
      reversed,
    };
  });
};

const generateMoodTrend = (seed: number, now: Date): MoodTrendEntry[] => {
  return Array.from({ length: 7 }).map((_, index) => {
    const tag = pickFromArray(MOOD_TAGS as unknown as string[], seed, index);
    const date = dayjs(now).subtract(index, 'day').startOf('day').toISOString();
    return { date, tag };
  });
};

export type BirthChartProviderParams = {
  userId: string;
};

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
      {
        a: 'Sun',
        b: 'Moon',
        type: 'Trine',
        orb: 1.4,
      },
      {
        a: 'Venus',
        b: 'Mars',
        type: 'Conjunction',
        orb: 3.2,
      },
    ],
  };
};

export type CurrentTransitsProviderParams = {
  userId: string;
  now?: Date;
};

export type CurrentTransitsResponse = {
  transits: TransitRecord[];
  moon: MoonSnapshot | null;
};

export const getCurrentTransits = async ({
  userId,
  now = new Date(),
}: CurrentTransitsProviderParams): Promise<CurrentTransitsResponse> => {
  const seed = hashStringToNumber(userId || 'lunary');
  const exactBase = dayjs(now).startOf('hour');

  const transits: TransitRecord[] = [
    {
      aspect: 'Trine',
      from: 'Sun',
      to: 'Moon',
      exactUtc: exactBase.add((seed % 6) + 6, 'hour').toISOString(),
      applying: true,
      strength: 0.72,
    },
    {
      aspect: 'Square',
      from: 'Venus',
      to: 'Saturn',
      exactUtc: exactBase.add((seed % 4) + 18, 'hour').toISOString(),
      applying: false,
      strength: 0.58,
    },
  ];

  const moon = (() => {
    const phaseInfo = pickFromArray(MOON_PHASES, seed);
    return {
      phase: phaseInfo.phase,
      sign: pickFromArray(ZODIAC_SIGNS, seed, 5),
      emoji: phaseInfo.emoji,
      illumination: phaseInfo.illumination,
    };
  })();

  return {
    transits,
    moon,
  };
};

export type TarotProviderParams = {
  userId: string;
  now?: Date;
};

export const getTarotLastReading = async ({
  userId,
  now = new Date(),
}: TarotProviderParams): Promise<TarotReading | null> => {
  try {
    const { sql } = await import('@vercel/postgres');

    // Fetch the most recent tarot reading from database
    const result = await sql`
      SELECT cards, spread_name, created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND archived_at IS NULL
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      const cards = Array.isArray(row.cards)
        ? row.cards
        : JSON.parse(row.cards || '[]');

      return {
        spread: row.spread_name || 'Three Card Insight',
        cards: cards.map((card: any) => ({
          name: card.name || card.cardName,
          position: card.position,
          reversed: card.reversed || false,
        })),
        timestamp: row.created_at || dayjs(now).toISOString(),
      };
    }
  } catch (error) {
    console.error('[Tarot Provider] Failed to fetch from database:', error);
  }

  // Fallback: return null if no reading found (don't generate mock data)
  return null;
};

export type TarotPatternAnalysisParams = {
  userId: string;
  userName?: string;
  userBirthday?: string;
  now?: Date;
};

// Server-safe tarot trend analysis (duplicated from client-side version)
const analyzeTarotTrends = (
  getTarotCard: (
    date: string,
    userName?: string,
    userBirthday?: string,
  ) => TarotCard,
  userName?: string,
  days: number = 30,
  userBirthday?: string,
): {
  dominantThemes: string[];
  cardFrequency: { [key: string]: number };
  patternInsights: string[];
} => {
  const pastReadings: { date: string; card: TarotCard }[] = [];
  const today = dayjs();

  // Collect past readings
  for (let i = 0; i < days; i++) {
    const date = today.subtract(i, 'day');
    const card = getTarotCard(
      date.toDate().toDateString(),
      userName,
      userBirthday,
    );
    pastReadings.push({
      date: date.format('YYYY-MM-DD'),
      card,
    });
  }

  // Analyze card frequency
  const cardFrequency: { [key: string]: number } = {};
  const keywordCounts: { [key: string]: number } = {};

  pastReadings.forEach((reading) => {
    cardFrequency[reading.card.name] =
      (cardFrequency[reading.card.name] || 0) + 1;

    reading.card.keywords.forEach((keyword) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });

  // Find dominant themes (top 5 keywords)
  const dominantThemes = Object.entries(keywordCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([keyword]) => keyword);

  // Generate pattern insights
  const patternInsights: string[] = [];

  // Check for frequently appearing cards
  const frequentCards = Object.entries(cardFrequency)
    .filter(([, count]) => count >= 3)
    .sort(([, a], [, b]) => b - a);

  if (frequentCards.length > 0) {
    const [cardName, count] = frequentCards[0];
    patternInsights.push(
      `"${cardName}" has appeared ${count} times in ${days} days, suggesting this theme is particularly relevant to your current life path.`,
    );
  }

  // Check for theme patterns
  if (keywordCounts['Love'] && keywordCounts['Love'] >= 5) {
    patternInsights.push(
      'Love and relationship themes have been prominent, indicating a focus on heart matters and connections.',
    );
  }

  if (keywordCounts['Transformation'] && keywordCounts['Transformation'] >= 3) {
    patternInsights.push(
      "Transformation energies suggest you're in a significant period of personal growth and change.",
    );
  }

  if (keywordCounts['Wisdom'] && keywordCounts['Wisdom'] >= 4) {
    patternInsights.push(
      "Wisdom themes indicate you're being called to integrate important life lessons.",
    );
  }

  return {
    dominantThemes,
    cardFrequency,
    patternInsights,
  };
};

export const getTarotPatternAnalysis = async ({
  userId,
  userName,
  userBirthday,
  now = new Date(),
}: TarotPatternAnalysisParams): Promise<{
  daily: TarotCard;
  weekly: TarotCard;
  personal: TarotCard;
  trends: {
    dominantThemes: string[];
    frequentCards: Array<{ name: string; count: number }>;
    patternInsights: string[];
  };
} | null> => {
  try {
    const { getTarotCard } = await import('../../../utils/tarot/tarot');

    const today = new Date();
    const todayString = today.toDateString();

    // Calculate weekly seed
    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekStartYear = weekStart.getFullYear();
    const weekStartMonth = weekStart.getMonth() + 1;
    const weekStartDate = weekStart.getDate();
    const dayOfYear = Math.floor(
      (weekStart.getTime() - new Date(weekStartYear, 0, 0).getTime()) /
        86400000,
    );
    const weekNumber = Math.floor(dayOfYear / 7);
    const weeklySeed = `weekly-${weekStartYear}-W${weekNumber}-${weekStartMonth}-${weekStartDate}`;

    // Get daily card
    const daily = getTarotCard(`daily-${todayString}`, userName, userBirthday);

    // Get weekly card
    const weekly = getTarotCard(weeklySeed, userName, userBirthday);

    // Get personal card (based on birthday)
    const currentMonth = new Date().getMonth().toString();
    const personalSeed = userBirthday
      ? userBirthday + currentMonth
      : currentMonth;
    const personal = getTarotCard(personalSeed, userName, userBirthday);

    // Analyze trends using server-safe function
    const trendAnalysis = analyzeTarotTrends(
      getTarotCard,
      userName,
      30,
      userBirthday,
    );

    // Convert cardFrequency object to array
    const frequentCards = trendAnalysis.cardFrequency
      ? Object.entries(trendAnalysis.cardFrequency)
          .map(([name, count]) => ({ name, count }))
          .filter(({ count }) => count >= 2)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
      : [];

    return {
      daily,
      weekly,
      personal,
      trends: {
        dominantThemes: trendAnalysis.dominantThemes || [],
        frequentCards,
        patternInsights: trendAnalysis.patternInsights || [],
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

export type DailyHighlightProviderParams = {
  userId: string;
  now?: Date;
};

export const getDailyHighlight = async ({
  userId,
  now = new Date(),
}: DailyHighlightProviderParams): Promise<DailyHighlight | null> => {
  const seed = hashStringToNumber(userId || 'lunary');
  const sign = pickFromArray(ZODIAC_SIGNS, seed, 3);
  return {
    primaryEvent: `${sign} moon invites gentle reflection`,
    date: dayjs(now).format('YYYY-MM-DD'),
  };
};

export type MoodHistoryProviderParams = {
  userId: string;
  now?: Date;
};

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

  return {
    lastMessages: messages,
  };
};
