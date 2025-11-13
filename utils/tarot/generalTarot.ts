import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import utc from 'dayjs/plugin/utc';
import { getTarotCard } from './tarot';

dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);
dayjs.extend(utc);

export type GeneralTarotReading = {
  daily: {
    name: string;
    keywords: string[];
  };
  weekly: {
    name: string;
    keywords: string[];
  };
  guidance: {
    dailyMessage: string;
    weeklyMessage: string;
    actionPoints: string[];
  };
};

type GeneralTarotCacheEntry = {
  dailySeed: string;
  weeklySeed: string;
  reading: GeneralTarotReading;
};

const CACHE_KEY = 'general-tarot-reading:v1';
let memoryCache: GeneralTarotCacheEntry | null = null;

const readCache = (): GeneralTarotCacheEntry | null => {
  if (typeof window !== 'undefined') {
    try {
      const cached = window.localStorage.getItem(CACHE_KEY);
      if (cached) {
        memoryCache = JSON.parse(cached) as GeneralTarotCacheEntry;
      }
    } catch {
      // Ignore storage errors silently to avoid hard crashes in restricted environments
    }
  }
  return memoryCache;
};

const writeCache = (entry: GeneralTarotCacheEntry) => {
  memoryCache = entry;
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(CACHE_KEY, JSON.stringify(entry));
    } catch {
      // Ignore storage errors silently to avoid hard crashes in restricted environments
    }
  }
};

// Daily tarot selection based on cosmic energy (not personal data)
export const getGeneralTarotReading = (): GeneralTarotReading => {
  const nowLocal = dayjs();
  const nowUtc = nowLocal.utc();

  // Use UTC based seeds so server/client renders stay in sync, while local time drives messaging
  const dayOfYearUtc = nowUtc.dayOfYear();
  const dayOfWeekLocal = nowLocal.day(); // 0 = Sunday, 1 = Monday, etc.

  const dailySeed = `cosmic-${nowUtc.format('YYYY-MM-DD')}-${dayOfYearUtc}-energy`;

  const weekStartUtc = nowUtc.startOf('isoWeek');
  const weekNumber = weekStartUtc.isoWeek();
  const weekYear = weekStartUtc.year();
  const weekStartDate = weekStartUtc.format('YYYY-MM-DD');
  const weeklySeed = `universal-${weekYear}-W${weekNumber}-${weekStartDate}-guidance`;

  const cached = readCache();
  if (
    cached &&
    cached.dailySeed === dailySeed &&
    cached.weeklySeed === weeklySeed
  ) {
    return cached.reading;
  }

  // Get cards using the existing tarot system
  const dailyCard = getTarotCard(dailySeed, 'cosmic-daily-energy');
  const weeklyCard = getTarotCard(weeklySeed, 'universal-weekly-guidance');

  // Generate guidance based on cosmic themes
  const dailyMessage = `Today's cosmic energy through ${dailyCard.name} suggests ${getDailyTheme(dayOfWeekLocal)}. The universe encourages you to ${getActionTheme(dailyCard.keywords)}.`;

  const weeklyMessage = `This week's energy through ${weeklyCard.name} highlights themes of ${weeklyCard.keywords.slice(0, 2).join(' and ')}. Focus on ${getWeeklyFocus(weeklyCard.keywords)}.`;

  const actionPoints = [
    `Embrace the energy of ${dailyCard.keywords[0]}`,
    `Consider how ${weeklyCard.keywords[0]} applies to your current situation`,
    `Reflect on the cosmic message of ${dailyCard.name}`,
  ];

  const reading: GeneralTarotReading = {
    daily: {
      name: dailyCard.name,
      keywords: dailyCard.keywords,
    },
    weekly: {
      name: weeklyCard.name,
      keywords: weeklyCard.keywords,
    },
    guidance: {
      dailyMessage,
      weeklyMessage,
      actionPoints,
    },
  };

  writeCache({
    dailySeed,
    weeklySeed,
    reading,
  });

  return reading;
};

const getDailyTheme = (dayOfWeek: number): string => {
  const themes = [
    'reflection and spiritual renewal', // Sunday
    'new beginnings and emotional insight', // Monday
    'communication and mental clarity', // Tuesday
    'action and personal power', // Wednesday
    'expansion and growth opportunities', // Thursday
    'harmony and creative expression', // Friday
    'structure and practical wisdom', // Saturday
  ];
  return themes[dayOfWeek];
};

const getActionTheme = (keywords: string[]): string => {
  const firstKeyword = keywords[0]?.toLowerCase() || 'balance';

  if (
    firstKeyword.includes('change') ||
    firstKeyword.includes('transformation')
  ) {
    return 'embrace transformation with an open heart';
  }
  if (firstKeyword.includes('love') || firstKeyword.includes('relationship')) {
    return 'nurture meaningful connections';
  }
  if (
    firstKeyword.includes('success') ||
    firstKeyword.includes('achievement')
  ) {
    return 'take confident steps toward your goals';
  }
  if (firstKeyword.includes('wisdom') || firstKeyword.includes('knowledge')) {
    return 'trust your inner wisdom';
  }

  return 'stay present and trust the cosmic flow';
};

const getWeeklyFocus = (keywords: string[]): string => {
  const combinedKeywords = keywords.slice(0, 3).join(' ').toLowerCase();

  if (
    combinedKeywords.includes('creativity') ||
    combinedKeywords.includes('inspiration')
  ) {
    return 'creative expression and artistic pursuits';
  }
  if (
    combinedKeywords.includes('healing') ||
    combinedKeywords.includes('recovery')
  ) {
    return 'emotional healing and self-care';
  }
  if (
    combinedKeywords.includes('abundance') ||
    combinedKeywords.includes('prosperity')
  ) {
    return 'manifesting abundance and recognizing opportunities';
  }

  return 'finding balance and inner harmony';
};
