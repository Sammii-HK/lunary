import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import { getTarotCard } from './tarot';

dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);

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

// Daily tarot selection based on cosmic energy (not personal data)
export const getGeneralTarotReading = (): GeneralTarotReading => {
  const today = dayjs();

  // Use the day of year and cosmic factors for card selection
  const dayOfYear = today.dayOfYear();
  const dayOfWeek = today.day(); // 0 = Sunday, 1 = Monday, etc.
  const monthDay = today.date();

  // Create seeds for consistent daily cards with more variation
  const dailySeed = `cosmic-${today.format('YYYY-MM-DD')}-${dayOfYear}-energy`;

  // Calculate week start for stable weekly seed (same for entire week)
  const weekStart = today.startOf('isoWeek');
  const weekNumber = weekStart.isoWeek();
  const weekYear = weekStart.year();
  const weekStartDate = weekStart.format('YYYY-MM-DD');
  const weeklySeed = `universal-${weekYear}-W${weekNumber}-${weekStartDate}-guidance`;

  // Get cards using the existing tarot system
  const dailyCard = getTarotCard(dailySeed, 'cosmic-daily-energy');
  const weeklyCard = getTarotCard(weeklySeed, 'universal-weekly-guidance');

  // Generate guidance based on cosmic themes
  const dailyMessage = `Today's cosmic energy through ${dailyCard.name} suggests ${getDailyTheme(dayOfWeek)}. The universe encourages you to ${getActionTheme(dailyCard.keywords)}.`;

  const weeklyMessage = `This week's energy through ${weeklyCard.name} highlights themes of ${weeklyCard.keywords.slice(0, 2).join(' and ')}. Focus on ${getWeeklyFocus(weeklyCard.keywords)}.`;

  const actionPoints = [
    `Embrace the energy of ${dailyCard.keywords[0]}`,
    `Consider how ${weeklyCard.keywords[0]} applies to your current situation`,
    `Reflect on the cosmic message of ${dailyCard.name}`,
  ];

  return {
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
