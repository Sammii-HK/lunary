export const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

export const MONTHS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

export type Month = (typeof MONTHS)[number];

export const SIGN_DISPLAY_NAMES: Record<ZodiacSign, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces',
};

export const MONTH_DISPLAY_NAMES: Record<Month, string> = {
  january: 'January',
  february: 'February',
  march: 'March',
  april: 'April',
  may: 'May',
  june: 'June',
  july: 'July',
  august: 'August',
  september: 'September',
  october: 'October',
  november: 'November',
  december: 'December',
};

export const SIGN_SYMBOLS: Record<ZodiacSign, string> = {
  aries: '♈',
  taurus: '♉',
  gemini: '♊',
  cancer: '♋',
  leo: '♌',
  virgo: '♍',
  libra: '♎',
  scorpio: '♏',
  sagittarius: '♐',
  capricorn: '♑',
  aquarius: '♒',
  pisces: '♓',
};

export const SIGN_ELEMENTS: Record<ZodiacSign, string> = {
  aries: 'Fire',
  taurus: 'Earth',
  gemini: 'Air',
  cancer: 'Water',
  leo: 'Fire',
  virgo: 'Earth',
  libra: 'Air',
  scorpio: 'Water',
  sagittarius: 'Fire',
  capricorn: 'Earth',
  aquarius: 'Air',
  pisces: 'Water',
};

export const SIGN_RULERS: Record<ZodiacSign, string> = {
  aries: 'Mars',
  taurus: 'Venus',
  gemini: 'Mercury',
  cancer: 'Moon',
  leo: 'Sun',
  virgo: 'Mercury',
  libra: 'Venus',
  scorpio: 'Pluto',
  sagittarius: 'Jupiter',
  capricorn: 'Saturn',
  aquarius: 'Uranus',
  pisces: 'Neptune',
};

export interface MonthlyTheme {
  focus: string;
  challenges: string;
  opportunities: string;
  luckyDays: number[];
  powerColor: string;
}

export function getMonthlyTheme(
  sign: ZodiacSign,
  month: Month,
  year: number,
): MonthlyTheme {
  const monthIndex = MONTHS.indexOf(month);
  const signIndex = ZODIAC_SIGNS.indexOf(sign);

  const offset = (monthIndex + signIndex + year) % 12;

  const focuses = [
    'career advancement and professional recognition',
    'financial growth and material security',
    'communication and learning new skills',
    'home, family, and emotional foundations',
    'creativity, romance, and self-expression',
    'health, daily routines, and service to others',
    'relationships and partnerships',
    'transformation and shared resources',
    'travel, education, and expanding horizons',
    'public image and long-term goals',
    'friendships, community, and future visions',
    'spirituality, rest, and inner reflection',
  ];

  const challenges = [
    'balancing ambition with patience',
    'avoiding impulsive spending decisions',
    'focusing scattered mental energy',
    'setting healthy emotional boundaries',
    'ego management in creative pursuits',
    'perfectionism and self-criticism',
    'compromise without losing yourself',
    'trust and letting go of control',
    'staying grounded while dreaming big',
    'work-life balance under pressure',
    'detachment vs meaningful connection',
    'escapism and facing reality',
  ];

  const opportunities = [
    'leadership roles and recognition',
    'building lasting financial foundations',
    'networking and making valuable connections',
    'deepening family bonds',
    'artistic projects gaining momentum',
    'health breakthroughs and new habits',
    'meaningful partnership developments',
    'deep healing and release',
    'educational achievements',
    'career milestones',
    'community involvement paying off',
    'spiritual insights and intuition',
  ];

  const colors = [
    'red',
    'green',
    'yellow',
    'silver',
    'gold',
    'navy',
    'pink',
    'burgundy',
    'purple',
    'black',
    'electric blue',
    'sea green',
  ];

  const baseLucky = [
    ((offset * 3 + 1) % 28) + 1,
    ((offset * 7 + 5) % 28) + 1,
    ((offset * 11 + 10) % 28) + 1,
  ];

  return {
    focus: focuses[offset],
    challenges: challenges[(offset + 3) % 12],
    opportunities: opportunities[(offset + 6) % 12],
    luckyDays: baseLucky.sort((a, b) => a - b),
    powerColor: colors[offset],
  };
}

export function generateAllHoroscopeParams(): {
  sign: string;
  year: string;
  month: string;
}[] {
  const params: { sign: string; year: string; month: string }[] = [];

  // Skip static generation during build to reduce build time
  // Pages will be generated on-demand (ISR)
  if (process.env.SKIP_STATIC_GENERATION === 'true') {
    return [];
  }

  // Only generate for current and next year to reduce build time
  // Other years will be generated on-demand (ISR)
  const currentYear = new Date().getFullYear();
  const years = [currentYear.toString(), (currentYear + 1).toString()];

  for (const year of years) {
    for (const sign of ZODIAC_SIGNS) {
      for (const month of MONTHS) {
        params.push({ sign, year, month });
      }
    }
  }

  return params;
}
