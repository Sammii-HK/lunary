'use client';

import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import {
  getAstrologicalChart,
  getObserverLocation,
  AstroChartInformation,
} from './astrology';
import { constellations } from '../constellations';
import { Observer } from 'astronomy-engine';
import { getBirthChartFromProfile } from './birthChart';

dayjs.extend(dayOfYear);

type EnhancedHoroscopeReading = {
  sunSign: string;
  moonPhase: string;
  dailyGuidance: string;
  personalInsight: string;
  luckyElements: string[];
  cosmicHighlight: string;
  dailyAffirmation: string;
};

// Day of week planetary rulers
const dayRulers = {
  0: 'Sun', // Sunday
  1: 'Moon', // Monday
  2: 'Mars', // Tuesday
  3: 'Mercury', // Wednesday
  4: 'Jupiter', // Thursday
  5: 'Venus', // Friday
  6: 'Saturn', // Saturday
};

// Get daily numerology
const getDailyNumerology = (date: dayjs.Dayjs) => {
  const dateString = date.format('MM/DD/YYYY');
  const digits = dateString.replace(/\D/g, '').split('').map(Number);
  let sum = digits.reduce((acc, digit) => acc + digit, 0);

  // Reduce to single digit unless master number
  while (sum > 9 && sum !== 11 && sum !== 22 && sum !== 33) {
    sum = sum
      .toString()
      .split('')
      .map(Number)
      .reduce((acc, digit) => acc + digit, 0);
  }

  return sum;
};

// Get current moon phase with more detail
const getDetailedMoonPhase = (date: Date): string => {
  // Simplified moon phase calculation - in real app would use proper ephemeris
  const lunarMonth = 29.53;
  const knownNewMoon = new Date('2024-01-11'); // Known new moon date
  const daysSinceNew = Math.floor(
    (date.getTime() - knownNewMoon.getTime()) / (1000 * 60 * 60 * 24),
  );
  const phase = (daysSinceNew % lunarMonth) / lunarMonth;

  if (phase < 0.1 || phase > 0.9) return 'New Moon';
  if (phase < 0.25) return 'Waxing Crescent';
  if (phase < 0.35) return 'First Quarter';
  if (phase < 0.65) return 'Waxing Gibbous';
  if (phase < 0.75) return 'Full Moon';
  if (phase < 0.9) return 'Waning Gibbous';
  return 'Last Quarter';
};

// Enhanced daily guidance that changes based on multiple factors
const generateEnhancedDailyGuidance = (
  currentChart: AstroChartInformation[],
  birthChart: any,
  sunSign: string,
  userName?: string,
  today: dayjs.Dayjs = dayjs(),
): string => {
  const name = userName || 'dear soul';
  const dayOfWeek = today.day();
  const dayRuler = dayRulers[dayOfWeek as keyof typeof dayRulers];
  const universalDay = getDailyNumerology(today);

  // Get current planetary positions
  const currentSun = currentChart.find((p) => p.body === 'Sun');
  const currentMoon = currentChart.find((p) => p.body === 'Moon');
  const currentMercury = currentChart.find((p) => p.body === 'Mercury');

  // Get birth chart planets if available
  const birthSun = birthChart?.find((p: any) => p.body === 'Sun');
  const birthMoon = birthChart?.find((p: any) => p.body === 'Moon');

  // Create dynamic guidance based on multiple factors
  const dayInfluence = getDayOfWeekInfluence(dayOfWeek, dayRuler);
  const numerologyInsight = getNumerologyInsight(universalDay);
  const planetaryAspect = getPlanetaryAspect(currentSun, currentMoon, birthSun);

  return `${name}, ${dayInfluence} ${planetaryAspect} ${numerologyInsight} The cosmic currents favor ${getActionGuidance(dayRuler, currentMoon?.sign || 'transition')} today.`;
};

const getDayOfWeekInfluence = (dayOfWeek: number, ruler: string): string => {
  const influences = {
    0: `this Sunday's Solar energy illuminates new possibilities and personal power.`, // Sun
    1: `this Monday's Lunar influence heightens intuition and emotional awareness.`, // Moon
    2: `this Tuesday's Martian fire energizes action and courage.`, // Mars
    3: `this Wednesday's Mercurial energy sharpens communication and learning.`, // Mercury
    4: `this Thursday's Jupiterian expansion brings wisdom and opportunities.`, // Jupiter
    5: `this Friday's Venusian grace enhances love, beauty, and creativity.`, // Venus
    6: `this Saturday's Saturnian structure supports discipline and practical achievements.`, // Saturn
  };

  return influences[dayOfWeek as keyof typeof influences];
};

const getNumerologyInsight = (universalDay: number): string => {
  const insights = {
    1: "Today's vibration (1) calls for leadership and new beginnings.",
    2: "Today's vibration (2) emphasizes cooperation and balance.",
    3: "Today's vibration (3) sparks creativity and self-expression.",
    4: "Today's vibration (4) grounds you in practical matters.",
    5: "Today's vibration (5) brings freedom and adventure.",
    6: "Today's vibration (6) focuses on nurturing and responsibility.",
    7: "Today's vibration (7) deepens spiritual understanding.",
    8: "Today's vibration (8) manifests material success.",
    9: "Today's vibration (9) completes cycles and serves others.",
    11: "Today's master vibration (11) channels divine inspiration.",
    22: "Today's master vibration (22) builds lasting foundations.",
    33: "Today's master vibration (33) radiates healing energy.",
  };

  return (
    insights[universalDay as keyof typeof insights] ||
    "Today's energy supports personal growth."
  );
};

const getPlanetaryAspect = (
  currentSun: any,
  currentMoon: any,
  birthSun: any,
): string => {
  if (!birthSun)
    return 'The current planetary alignment supports your natural rhythms.';

  const sunInSameSign = currentSun?.sign === birthSun.sign;
  const moonAspect = currentMoon?.sign;

  if (sunInSameSign) {
    return `With the Sun returning to your birth sign of ${birthSun.sign}, this is your personal new year - a time of renewal and fresh starts.`;
  }

  return `The Sun in ${currentSun?.sign || 'transition'} activates ${getSignInteraction(currentSun?.sign, birthSun.sign)} while the Moon in ${moonAspect} colors your emotional landscape.`;
};

const getSignInteraction = (currentSign: string, birthSign: string): string => {
  // Simplified sign interaction - could be expanded with full aspect calculations
  return `different energies than your natal ${birthSign}`;
};

const getActionGuidance = (dayRuler: string, moonSign: string): string => {
  const actions = {
    Sun: 'self-expression and leadership',
    Moon: 'introspection and emotional healing',
    Mars: 'taking decisive action',
    Mercury: 'learning and communication',
    Jupiter: 'expansion and philosophical thinking',
    Venus: 'love, beauty, and artistic pursuits',
    Saturn: 'discipline and long-term planning',
  };

  return (
    actions[dayRuler as keyof typeof actions] || 'following your intuition'
  );
};

// Enhanced personal insight with more birth chart integration
const generateEnhancedPersonalInsight = (
  natalChart: any,
  currentChart: AstroChartInformation[],
  userName?: string,
  today: dayjs.Dayjs = dayjs(),
): string => {
  const name = userName || 'seeker';

  if (!natalChart || natalChart.length === 0) {
    const seasonalInsight = getSeasonalInsight(today);
    return `${name}, while your birth chart isn't available, ${seasonalInsight} Trust in the natural cycles and your inner wisdom.`;
  }

  const natalSun = natalChart.find((planet: any) => planet.body === 'Sun');
  const natalMoon = natalChart.find((planet: any) => planet.body === 'Moon');
  const currentMoon = currentChart.find((planet) => planet.body === 'Moon');
  const currentVenus = currentChart.find((planet) => planet.body === 'Venus');

  // Find meaningful aspects
  const moonConnection = getMoonConnection(natalMoon, currentMoon);
  const venusInfluence = getVenusInfluence(currentVenus, natalSun);

  return `${name}, ${moonConnection} ${venusInfluence} This is an excellent time for ${getPersonalFocus(natalSun?.sign, today)}.`;
};

const getMoonConnection = (natalMoon: any, currentMoon: any): string => {
  if (!natalMoon || !currentMoon)
    return 'The lunar energies are supporting your emotional growth.';

  if (natalMoon.sign === currentMoon.sign) {
    return `The Moon returns to your birth Moon sign of ${natalMoon.sign}, heightening your natural emotional instincts.`;
  }

  return `Your natal Moon in ${natalMoon.sign} receives supportive energy from today's Moon in ${currentMoon.sign}.`;
};

const getVenusInfluence = (currentVenus: any, natalSun: any): string => {
  if (!currentVenus || !natalSun)
    return 'Venus is bringing harmony to your relationships.';

  return `Venus in ${currentVenus.sign} is ${getVenusAspect(currentVenus.sign, natalSun.sign)} your Sun sign energy.`;
};

const getVenusAspect = (venusSign: string, sunSign: string): string => {
  return venusSign === sunSign ? 'amplifying' : 'harmonizing with';
};

const getPersonalFocus = (sunSign: string, today: dayjs.Dayjs): string => {
  const focuses = {
    Aries: 'initiating new projects',
    Taurus: 'building stability',
    Gemini: 'connecting and learning',
    Cancer: 'nurturing relationships',
    Leo: 'creative self-expression',
    Virgo: 'organizing and perfecting',
    Libra: 'seeking balance and beauty',
    Scorpio: 'deep transformation',
    Sagittarius: 'expanding horizons',
    Capricorn: 'achieving goals',
    Aquarius: 'innovative thinking',
    Pisces: 'spiritual connection',
  };

  return focuses[sunSign as keyof typeof focuses] || 'personal growth';
};

const getSeasonalInsight = (today: dayjs.Dayjs): string => {
  const month = today.month();

  if (month >= 2 && month <= 4)
    return "spring's renewal energy is awakening fresh possibilities.";
  if (month >= 5 && month <= 7)
    return "summer's vibrant energy supports growth and expansion.";
  if (month >= 8 && month <= 10)
    return "autumn's wisdom encourages reflection and harvest.";
  return "winter's introspective energy supports inner work and planning.";
};

// Enhanced lucky elements with daily variation (no crystals/metals)
const generateEnhancedLuckyElements = (
  sunSign: string,
  moonPhase: string,
  today: dayjs.Dayjs = dayjs(),
  birthChart?: any,
): string[] => {
  const dayOfWeek = today.day();
  const universalDay = getDailyNumerology(today);

  const elements: string[] = [];

  // Base lucky numbers by sun sign
  const baseLuckyNumbers = {
    Aries: 'Number 1',
    Taurus: 'Number 6',
    Gemini: 'Number 5',
    Cancer: 'Number 2',
    Leo: 'Number 1',
    Virgo: 'Number 6',
    Libra: 'Number 7',
    Scorpio: 'Number 8',
    Sagittarius: 'Number 9',
    Capricorn: 'Number 10',
    Aquarius: 'Number 11',
    Pisces: 'Number 12',
  };

  elements.push(
    baseLuckyNumbers[sunSign as keyof typeof baseLuckyNumbers] || 'Number 7',
  );

  // Day-specific colors
  const dayColors = [
    'Sunday color: Gold',
    'Monday color: Silver',
    'Tuesday color: Red',
    'Wednesday color: Yellow',
    'Thursday color: Purple',
    'Friday color: Green',
    'Saturday color: Indigo',
  ];
  elements.push(dayColors[dayOfWeek]);

  // Moon phase herbs/scents
  const moonScents = {
    'New Moon': 'Sage for clearing',
    'Waxing Crescent': 'Mint for growth',
    'First Quarter': 'Lemon for clarity',
    'Waxing Gibbous': 'Orange for abundance',
    'Full Moon': 'Jasmine for manifestation',
    'Waning Gibbous': 'Lavender for release',
    'Last Quarter': 'Cedar for grounding',
  };

  elements.push(
    moonScents[moonPhase as keyof typeof moonScents] || 'Rose for love',
  );

  // Numerology-based herb
  elements.push(
    `Universal Day ${universalDay} herb: ${getNumerologyHerb(universalDay)}`,
  );

  // Birth chart specific guidance (if available)
  if (birthChart) {
    const venus = birthChart.find((p: any) => p.body === 'Venus');
    if (venus) {
      elements.push(
        `Venus in ${venus.sign} theme: ${getVenusTheme(venus.sign)}`,
      );
    }
  }

  // Time-based element
  const hour = today.hour();
  if (hour >= 6 && hour < 12) {
    elements.push('Morning energy: Fresh intentions');
  } else if (hour >= 12 && hour < 18) {
    elements.push('Afternoon energy: Active manifestation');
  } else if (hour >= 18 && hour < 22) {
    elements.push('Evening energy: Reflection and gratitude');
  } else {
    elements.push('Night energy: Dreams and intuition');
  }

  return elements;
};

const getNumerologyHerb = (number: number): string => {
  const herbs = {
    1: 'Cinnamon',
    2: 'Jasmine',
    3: 'Mint',
    4: 'Sage',
    5: 'Lavender',
    6: 'Rose',
    7: 'Frankincense',
    8: 'Basil',
    9: 'Sandalwood',
    11: 'Myrrh',
    22: 'Cedar',
    33: 'Lotus',
  };

  return herbs[number as keyof typeof herbs] || 'Rosemary';
};

const getVenusTheme = (venusSign: string): string => {
  const themes = {
    Aries: 'Passionate pursuits',
    Taurus: 'Sensual pleasures',
    Gemini: 'Social connections',
    Cancer: 'Emotional nurturing',
    Leo: 'Creative expression',
    Virgo: 'Practical beauty',
    Libra: 'Harmony and balance',
    Scorpio: 'Deep intimacy',
    Sagittarius: 'Adventure and freedom',
    Capricorn: 'Traditional values',
    Aquarius: 'Unique perspectives',
    Pisces: 'Spiritual love',
  };

  return themes[venusSign as keyof typeof themes] || 'Beauty and love';
};

// Generate cosmic highlight - a special daily insight
const generateCosmicHighlight = (
  currentChart: AstroChartInformation[],
  today: dayjs.Dayjs = dayjs(),
): string => {
  const dayOfWeek = today.day();
  const universalDay = getDailyNumerology(today);

  const mercury = currentChart.find((p) => p.body === 'Mercury');
  const mars = currentChart.find((p) => p.body === 'Mars');

  // Create unique daily highlight
  const highlights = [
    `Mercury in ${mercury?.sign || 'transition'} enhances communication and learning opportunities.`,
    `Mars in ${mars?.sign || 'motion'} energizes your drive and ambition.`,
    `The cosmic dance today favors ${getDayOfWeekFocus(dayOfWeek)}.`,
    `Universal Day ${universalDay} brings ${getNumerologyTheme(universalDay)} to the forefront.`,
  ];

  // Rotate based on day of year for variety
  const highlightIndex = today.dayOfYear() % highlights.length;
  return highlights[highlightIndex];
};

const getDayOfWeekFocus = (dayOfWeek: number): string => {
  const focuses = [
    'self-discovery and leadership',
    'emotional healing and intuition',
    'action and courage',
    'learning and communication',
    'expansion and wisdom',
    'love and creativity',
    'structure and achievement',
  ];

  return focuses[dayOfWeek];
};

const getNumerologyTheme = (number: number): string => {
  const themes = {
    1: 'new beginnings and independence',
    2: 'cooperation and partnership',
    3: 'creativity and joy',
    4: 'stability and hard work',
    5: 'freedom and adventure',
    6: 'love and responsibility',
    7: 'spirituality and introspection',
    8: 'material success and power',
    9: 'completion and service',
    11: 'inspiration and enlightenment',
    22: 'master building and manifestation',
    33: 'healing and compassion',
  };

  return themes[number as keyof typeof themes] || 'personal growth';
};

// Generate daily affirmation
const generateDailyAffirmation = (
  sunSign: string,
  today: dayjs.Dayjs = dayjs(),
): string => {
  const affirmations = {
    Aries: 'I embrace my pioneering spirit and lead with courage.',
    Taurus: 'I am grounded in abundance and trust in natural timing.',
    Gemini: 'I communicate with clarity and embrace new learning.',
    Cancer: 'I nurture myself and others with loving compassion.',
    Leo: 'I shine my authentic light and inspire others.',
    Virgo: 'I perfect my craft with patience and dedication.',
    Libra: 'I create harmony and beauty in all I do.',
    Scorpio: 'I transform challenges into wisdom and strength.',
    Sagittarius: 'I expand my horizons with optimism and faith.',
    Capricorn: 'I achieve my goals through persistent effort.',
    Aquarius: 'I innovate for the highest good of all.',
    Pisces: 'I trust my intuition and flow with divine guidance.',
  };

  return (
    affirmations[sunSign as keyof typeof affirmations] ||
    'I am aligned with my highest potential.'
  );
};

export const getEnhancedPersonalizedHoroscope = (
  userBirthday?: string,
  userName?: string,
  profile?: any,
): EnhancedHoroscopeReading => {
  const today = dayjs();
  const birthDate = userBirthday ? dayjs(userBirthday) : null;

  // Default observer
  const observer = new Observer(51.4769, 0.0005, 0);

  // Get current astrological chart
  const currentChart = getAstrologicalChart(today.toDate(), observer);

  // Get birth chart from profile
  const birthChart = getBirthChartFromProfile(profile);

  // Determine sun sign
  const sunSign = birthDate
    ? getSunSign(birthDate.month() + 1, birthDate.date())
    : 'Unknown';

  // Get detailed moon phase
  const moonPhase = getDetailedMoonPhase(today.toDate());

  // Generate enhanced content
  const dailyGuidance = generateEnhancedDailyGuidance(
    currentChart,
    birthChart,
    sunSign,
    userName,
    today,
  );
  const personalInsight = generateEnhancedPersonalInsight(
    birthChart,
    currentChart,
    userName,
    today,
  );
  const luckyElements = generateEnhancedLuckyElements(
    sunSign,
    moonPhase,
    today,
    birthChart,
  );
  const cosmicHighlight = generateCosmicHighlight(currentChart, today);
  const dailyAffirmation = generateDailyAffirmation(sunSign, today);

  return {
    sunSign,
    moonPhase,
    dailyGuidance,
    personalInsight,
    luckyElements,
    cosmicHighlight,
    dailyAffirmation,
  };
};

const getSunSign = (month: number, day: number): string => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21))
    return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21))
    return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19))
    return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18))
    return 'Aquarius';
  return 'Pisces';
};
