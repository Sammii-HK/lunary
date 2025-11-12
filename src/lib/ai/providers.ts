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
  const seed = hashStringToNumber(userId || 'lunary');
  const cards = generateTarotSpread(seed);

  return {
    spread: 'Three Card Insight',
    cards,
    timestamp: dayjs(now).subtract(2, 'day').toISOString(),
  };
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
