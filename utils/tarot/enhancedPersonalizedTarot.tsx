'use client';

import { getTarotCard } from './tarot';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(dayOfYear);

type TarotCard = {
  name: string;
  keywords: string[];
  information: string;
};

type TrendAnalysis = {
  dominantThemes: string[];
  cardFrequency: { [key: string]: number };
  patternInsights: string[];
  cyclicInfluences: string[];
};

type EnhancedReading = {
  daily: TarotCard;
  weekly: TarotCard;
  personal: TarotCard;
  advice: string;
  personalCardReason: string;
  trendAnalysis?: TrendAnalysis;
};

// Get daily influences for personal card calculation
const getDailyInfluences = (today: Date, userBirthday?: string) => {
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const dateString = today.toISOString().split('T')[0]; // YYYY-MM-DD

  // Calculate Universal Day Number (numerology)
  const universalDay = dateString
    .replace(/-/g, '')
    .split('')
    .reduce((sum, digit) => sum + parseInt(digit), 0);
  let reducedUniversal = universalDay;
  while (reducedUniversal > 9 && ![11, 22, 33].includes(reducedUniversal)) {
    reducedUniversal = reducedUniversal
      .toString()
      .split('')
      .reduce((sum, digit) => sum + parseInt(digit), 0);
  }

  // Calculate Personal Day Number if birthday available
  let personalDay = 1;
  if (userBirthday) {
    const [birthYear, birthMonth, birthDay] = userBirthday
      .split('-')
      .map(Number);
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    const personalSum =
      birthMonth + birthDay + currentYear + currentMonth + currentDay;
    personalDay = personalSum;
    while (personalDay > 9 && ![11, 22, 33].includes(personalDay)) {
      personalDay = personalDay
        .toString()
        .split('')
        .reduce((sum, digit) => sum + parseInt(digit), 0);
    }
  }

  // Day of week planetary rulers
  const planetaryRulers = [
    'Sun',
    'Moon',
    'Mars',
    'Mercury',
    'Jupiter',
    'Venus',
    'Saturn',
  ];
  const todaysPlanet = planetaryRulers[dayOfWeek];

  return {
    dayOfWeek,
    universalDay: reducedUniversal,
    personalDay,
    planetaryRuler: todaysPlanet,
    dateString,
  };
};

// Enhanced personal card selection with daily variation
const getEnhancedPersonalCard = (
  userName?: string,
  userBirthday?: string,
): { card: TarotCard; reason: string } => {
  const today = new Date();
  const dailyInfluences = getDailyInfluences(today, userBirthday);

  // Create a complex seed that changes daily
  const planetaryInfluence = dailyInfluences.planetaryRuler;
  const numerologyInfluence =
    dailyInfluences.universalDay + dailyInfluences.personalDay;
  const weekInfluence = Math.floor(dayjs(today).dayOfYear() / 7); // Changes weekly

  // Combine all influences for personal card selection
  const personalSeed = `${userBirthday || 'seeker'}-${planetaryInfluence}-${numerologyInfluence}-${weekInfluence}-${dailyInfluences.dateString}`;

  const card = getTarotCard(personalSeed, userName, userBirthday);

  // Generate explanation for why this card was chosen
  const planetaryMeanings = {
    Sun: 'self-expression and vitality',
    Moon: 'intuition and emotional cycles',
    Mars: 'action and assertive energy',
    Mercury: 'communication and mental clarity',
    Jupiter: 'expansion and wisdom',
    Venus: 'love and creative harmony',
    Saturn: 'discipline and life lessons',
  };

  const numerologyMeanings = {
    1: 'new beginnings and leadership',
    2: 'cooperation and balance',
    3: 'creativity and communication',
    4: 'stability and foundation building',
    5: 'freedom and adventure',
    6: 'nurturing and responsibility',
    7: 'spiritual insight and wisdom',
    8: 'material success and power',
    9: 'completion and universal love',
    11: 'master intuition and enlightenment',
    22: 'master building and manifestation',
    33: 'master teaching and healing',
  };

  const planetMeaning =
    planetaryMeanings[planetaryInfluence as keyof typeof planetaryMeanings] ||
    'cosmic influence';
  const numberMeaning =
    numerologyMeanings[
      dailyInfluences.personalDay as keyof typeof numerologyMeanings
    ] || 'numerical vibration';

  const reason = `Selected for ${planetaryInfluence}'s influence on ${planetMeaning}, combined with Personal Day ${dailyInfluences.personalDay} energy of ${numberMeaning}. This card reflects your current cosmic alignment and daily spiritual needs.`;

  return { card, reason };
};

// Analyze past tarot readings for trends
const analyzeTarotTrends = (
  userName?: string,
  days: number = 30,
  userBirthday?: string,
): TrendAnalysis => {
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

  // Analyze weekly cycles
  const cyclicInfluences: string[] = [];
  const weeklyPatterns: { [key: number]: TarotCard[] } = {};

  pastReadings.forEach((reading) => {
    const dayOfWeek = dayjs(reading.date).day();
    if (!weeklyPatterns[dayOfWeek]) weeklyPatterns[dayOfWeek] = [];
    weeklyPatterns[dayOfWeek].push(reading.card);
  });

  // Find patterns in specific days
  Object.entries(weeklyPatterns).forEach(([day, cards]) => {
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayKeywords: { [key: string]: number } = {};

    cards.forEach((card) => {
      card.keywords.forEach((keyword) => {
        dayKeywords[keyword] = (dayKeywords[keyword] || 0) + 1;
      });
    });

    const topKeyword = Object.entries(dayKeywords).sort(
      ([, a], [, b]) => b - a,
    )[0];

    if (topKeyword && topKeyword[1] >= 2) {
      cyclicInfluences.push(
        `${dayNames[parseInt(day)]}s often bring themes of "${topKeyword[0]}", suggesting this day of the week carries special significance for you.`,
      );
    }
  });

  return {
    dominantThemes,
    cardFrequency,
    patternInsights,
    cyclicInfluences,
  };
};

// Enhanced advice generation
const generateEnhancedAdvice = (
  daily: TarotCard,
  weekly: TarotCard,
  personal: TarotCard,
  userName?: string,
  trendAnalysis?: TrendAnalysis,
): string => {
  const name = userName || 'seeker';

  // Base advice
  let advice = `${name}, today's cosmic currents bring forth "${daily.name}" as your daily guide, emphasizing ${daily.keywords[0].toLowerCase()} and ${daily.keywords[1]?.toLowerCase() || 'inner wisdom'}. `;

  // Weekly influence
  advice += `Your weekly influence, "${weekly.name}", creates a backdrop of ${weekly.keywords[0].toLowerCase()}, shaping how you approach the days ahead. `;

  // Personal card with deeper meaning
  advice += `Your personal card, "${personal.name}", reveals that ${personal.keywords[0].toLowerCase()} is awakening within your spiritual journey right now. `;

  // Add trend insights if available
  if (trendAnalysis && trendAnalysis.patternInsights.length > 0) {
    advice += `\n\nLooking at your recent patterns, ${trendAnalysis.patternInsights[0]} `;

    if (trendAnalysis.dominantThemes.length > 0) {
      advice += `The themes of ${trendAnalysis.dominantThemes.slice(0, 3).join(', ')} have been particularly active in your readings, suggesting these energies are calling for your attention and integration.`;
    }
  }

  // Add cyclical insight
  if (trendAnalysis && trendAnalysis.cyclicInfluences.length > 0) {
    advice += `\n\n${trendAnalysis.cyclicInfluences[0]}`;
  }

  return advice;
};

export const getEnhancedPersonalizedTarotReading = (
  userName?: string,
  userBirthday?: string,
  includeTrends: boolean = true,
): EnhancedReading => {
  const today = new Date();
  const todayString = today.toDateString();

  // Calculate week start and week number for unique weekly seed
  const weekStart = new Date(today);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());

  // Get week number of year and other date components
  const weekStartYear = weekStart.getFullYear();
  const weekStartMonth = weekStart.getMonth() + 1;
  const weekStartDate = weekStart.getDate();
  const dayOfYear = Math.floor(
    (weekStart.getTime() - new Date(weekStartYear, 0, 0).getTime()) / 86400000,
  );
  const weekNumber = Math.floor(dayOfYear / 7);

  // Create UNIQUE weekly seed - must be completely different from daily seed
  const weeklySeed = `weekly-${weekStartYear}-W${weekNumber}-${weekStartMonth}-${weekStartDate}`;

  // Daily card for today - prefix with "daily-" to ensure uniqueness
  const daily = getTarotCard(`daily-${todayString}`, userName, userBirthday);

  // Weekly card based on week number and date
  const weekly = getTarotCard(weeklySeed, userName, userBirthday);

  // Enhanced personal card with daily variation
  const { card: personal, reason: personalCardReason } =
    getEnhancedPersonalCard(userName, userBirthday);

  // Analyze trends if requested
  let trendAnalysis: TrendAnalysis | undefined;
  if (includeTrends) {
    trendAnalysis = analyzeTarotTrends(userName, 30, userBirthday);
  }

  // Generate enhanced advice
  const advice = generateEnhancedAdvice(
    daily,
    weekly,
    personal,
    userName,
    trendAnalysis,
  );

  return {
    daily,
    weekly,
    personal,
    advice,
    personalCardReason,
    trendAnalysis,
  };
};
