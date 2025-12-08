export interface ZodiacDateRange {
  sign: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  element: string;
  modality: string;
  ruler: string;
  symbol: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  luckyNumbers: number[];
  luckyColors: string[];
  compatibleSigns: string[];
  decanRulers: string[];
}

export const ZODIAC_DATE_RANGES: ZodiacDateRange[] = [
  {
    sign: 'Aries',
    startMonth: 3,
    startDay: 21,
    endMonth: 4,
    endDay: 19,
    element: 'Fire',
    modality: 'Cardinal',
    ruler: 'Mars',
    symbol: 'Ram',
    traits: [
      'courageous',
      'determined',
      'confident',
      'enthusiastic',
      'optimistic',
      'passionate',
    ],
    strengths: [
      'natural leadership',
      'high energy',
      'pioneering spirit',
      'honesty',
    ],
    weaknesses: [
      'impatience',
      'impulsiveness',
      'short temper',
      'competitive to a fault',
    ],
    luckyNumbers: [1, 8, 17],
    luckyColors: ['red', 'orange', 'yellow'],
    compatibleSigns: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    decanRulers: ['Mars', 'Sun', 'Jupiter'],
  },
  {
    sign: 'Taurus',
    startMonth: 4,
    startDay: 20,
    endMonth: 5,
    endDay: 20,
    element: 'Earth',
    modality: 'Fixed',
    ruler: 'Venus',
    symbol: 'Bull',
    traits: [
      'reliable',
      'patient',
      'practical',
      'devoted',
      'responsible',
      'stable',
    ],
    strengths: [
      'dependability',
      'sensuality',
      'persistence',
      'financial wisdom',
    ],
    weaknesses: [
      'stubbornness',
      'possessiveness',
      'resistance to change',
      'materialism',
    ],
    luckyNumbers: [2, 6, 9, 12, 24],
    luckyColors: ['green', 'pink', 'earth tones'],
    compatibleSigns: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    decanRulers: ['Venus', 'Mercury', 'Saturn'],
  },
  {
    sign: 'Gemini',
    startMonth: 5,
    startDay: 21,
    endMonth: 6,
    endDay: 20,
    element: 'Air',
    modality: 'Mutable',
    ruler: 'Mercury',
    symbol: 'Twins',
    traits: [
      'gentle',
      'affectionate',
      'curious',
      'adaptable',
      'quick-witted',
      'versatile',
    ],
    strengths: [
      'communication skills',
      'intellectual curiosity',
      'adaptability',
      'wit',
    ],
    weaknesses: [
      'indecisiveness',
      'inconsistency',
      'nervousness',
      'superficiality',
    ],
    luckyNumbers: [3, 5, 7, 12, 23],
    luckyColors: ['yellow', 'light green', 'orange'],
    compatibleSigns: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    decanRulers: ['Mercury', 'Venus', 'Uranus'],
  },
  {
    sign: 'Cancer',
    startMonth: 6,
    startDay: 21,
    endMonth: 7,
    endDay: 22,
    element: 'Water',
    modality: 'Cardinal',
    ruler: 'Moon',
    symbol: 'Crab',
    traits: [
      'tenacious',
      'highly imaginative',
      'loyal',
      'emotional',
      'sympathetic',
      'persuasive',
    ],
    strengths: [
      'nurturing nature',
      'intuition',
      'emotional intelligence',
      'loyalty',
    ],
    weaknesses: [
      'moodiness',
      'pessimism',
      'manipulative tendencies',
      'insecurity',
    ],
    luckyNumbers: [2, 3, 15, 20],
    luckyColors: ['white', 'silver', 'pale blue'],
    compatibleSigns: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    decanRulers: ['Moon', 'Pluto', 'Neptune'],
  },
  {
    sign: 'Leo',
    startMonth: 7,
    startDay: 23,
    endMonth: 8,
    endDay: 22,
    element: 'Fire',
    modality: 'Fixed',
    ruler: 'Sun',
    symbol: 'Lion',
    traits: [
      'creative',
      'passionate',
      'generous',
      'warm-hearted',
      'cheerful',
      'humorous',
    ],
    strengths: ['natural charisma', 'creativity', 'leadership', 'generosity'],
    weaknesses: [
      'arrogance',
      'stubbornness',
      'self-centeredness',
      'inflexibility',
    ],
    luckyNumbers: [1, 3, 10, 19],
    luckyColors: ['gold', 'orange', 'yellow'],
    compatibleSigns: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    decanRulers: ['Sun', 'Jupiter', 'Mars'],
  },
  {
    sign: 'Virgo',
    startMonth: 8,
    startDay: 23,
    endMonth: 9,
    endDay: 22,
    element: 'Earth',
    modality: 'Mutable',
    ruler: 'Mercury',
    symbol: 'Virgin',
    traits: [
      'loyal',
      'analytical',
      'kind',
      'hardworking',
      'practical',
      'methodical',
    ],
    strengths: [
      'attention to detail',
      'reliability',
      'analytical mind',
      'helpfulness',
    ],
    weaknesses: ['overthinking', 'self-criticism', 'perfectionism', 'worry'],
    luckyNumbers: [5, 14, 15, 23, 32],
    luckyColors: ['green', 'brown', 'beige'],
    compatibleSigns: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    decanRulers: ['Mercury', 'Saturn', 'Venus'],
  },
  {
    sign: 'Libra',
    startMonth: 9,
    startDay: 23,
    endMonth: 10,
    endDay: 22,
    element: 'Air',
    modality: 'Cardinal',
    ruler: 'Venus',
    symbol: 'Scales',
    traits: [
      'cooperative',
      'diplomatic',
      'gracious',
      'fair-minded',
      'social',
      'idealistic',
    ],
    strengths: [
      'diplomacy',
      'aesthetic sense',
      'charm',
      'balanced perspective',
    ],
    weaknesses: [
      'indecisiveness',
      'avoiding confrontation',
      'self-pity',
      'grudges',
    ],
    luckyNumbers: [4, 6, 13, 15, 24],
    luckyColors: ['pink', 'blue', 'lavender'],
    compatibleSigns: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    decanRulers: ['Venus', 'Uranus', 'Mercury'],
  },
  {
    sign: 'Scorpio',
    startMonth: 10,
    startDay: 23,
    endMonth: 11,
    endDay: 21,
    element: 'Water',
    modality: 'Fixed',
    ruler: 'Pluto',
    symbol: 'Scorpion',
    traits: [
      'resourceful',
      'brave',
      'passionate',
      'stubborn',
      'strategic',
      'loyal',
    ],
    strengths: [
      'determination',
      'intuition',
      'emotional depth',
      'resourcefulness',
    ],
    weaknesses: [
      'jealousy',
      'secretiveness',
      'vindictiveness',
      'possessiveness',
    ],
    luckyNumbers: [8, 11, 18, 22],
    luckyColors: ['deep red', 'black', 'burgundy'],
    compatibleSigns: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    decanRulers: ['Pluto', 'Neptune', 'Moon'],
  },
  {
    sign: 'Sagittarius',
    startMonth: 11,
    startDay: 22,
    endMonth: 12,
    endDay: 21,
    element: 'Fire',
    modality: 'Mutable',
    ruler: 'Jupiter',
    symbol: 'Archer',
    traits: [
      'generous',
      'idealistic',
      'optimistic',
      'adventurous',
      'honest',
      'philosophical',
    ],
    strengths: [
      'optimism',
      'freedom-loving',
      'intellectual curiosity',
      'honesty',
    ],
    weaknesses: [
      'tactlessness',
      'restlessness',
      'irresponsibility',
      'impatience',
    ],
    luckyNumbers: [3, 7, 9, 12, 21],
    luckyColors: ['purple', 'blue', 'plum'],
    compatibleSigns: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    decanRulers: ['Jupiter', 'Mars', 'Sun'],
  },
  {
    sign: 'Capricorn',
    startMonth: 12,
    startDay: 22,
    endMonth: 1,
    endDay: 19,
    element: 'Earth',
    modality: 'Cardinal',
    ruler: 'Saturn',
    symbol: 'Goat',
    traits: [
      'responsible',
      'disciplined',
      'self-controlled',
      'ambitious',
      'patient',
      'prudent',
    ],
    strengths: ['ambition', 'discipline', 'practicality', 'reliability'],
    weaknesses: [
      'pessimism',
      'stubbornness',
      'workaholic tendencies',
      'coldness',
    ],
    luckyNumbers: [4, 8, 13, 22],
    luckyColors: ['brown', 'black', 'dark green'],
    compatibleSigns: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    decanRulers: ['Saturn', 'Venus', 'Mercury'],
  },
  {
    sign: 'Aquarius',
    startMonth: 1,
    startDay: 20,
    endMonth: 2,
    endDay: 18,
    element: 'Air',
    modality: 'Fixed',
    ruler: 'Uranus',
    symbol: 'Water Bearer',
    traits: [
      'progressive',
      'original',
      'independent',
      'humanitarian',
      'intellectual',
      'inventive',
    ],
    strengths: ['innovation', 'humanitarianism', 'independence', 'originality'],
    weaknesses: [
      'emotional detachment',
      'stubbornness',
      'unpredictability',
      'aloofness',
    ],
    luckyNumbers: [4, 7, 11, 22, 29],
    luckyColors: ['electric blue', 'turquoise', 'silver'],
    compatibleSigns: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    decanRulers: ['Uranus', 'Mercury', 'Venus'],
  },
  {
    sign: 'Pisces',
    startMonth: 2,
    startDay: 19,
    endMonth: 3,
    endDay: 20,
    element: 'Water',
    modality: 'Mutable',
    ruler: 'Neptune',
    symbol: 'Fish',
    traits: [
      'compassionate',
      'artistic',
      'intuitive',
      'gentle',
      'wise',
      'musical',
    ],
    strengths: ['empathy', 'creativity', 'intuition', 'spiritual awareness'],
    weaknesses: ['escapism', 'oversensitivity', 'self-pity', 'indecisiveness'],
    luckyNumbers: [3, 9, 12, 15, 18, 24],
    luckyColors: ['sea green', 'lavender', 'violet'],
    compatibleSigns: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    decanRulers: ['Neptune', 'Moon', 'Pluto'],
  },
];

export function getZodiacForDate(month: number, day: number): ZodiacDateRange {
  for (const zodiac of ZODIAC_DATE_RANGES) {
    if (zodiac.sign === 'Capricorn') {
      if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) {
        return zodiac;
      }
    } else {
      const inRange =
        (month === zodiac.startMonth && day >= zodiac.startDay) ||
        (month === zodiac.endMonth && day <= zodiac.endDay) ||
        (month > zodiac.startMonth && month < zodiac.endMonth);
      if (inRange) return zodiac;
    }
  }
  return ZODIAC_DATE_RANGES[0];
}

export function getDecanForDate(
  month: number,
  day: number,
  zodiac: ZodiacDateRange,
): { decan: number; ruler: string } {
  let daysIntoSign = 0;

  if (zodiac.sign === 'Capricorn') {
    if (month === 12) {
      daysIntoSign = day - 22;
    } else {
      daysIntoSign = 31 - 22 + day;
    }
  } else {
    if (month === zodiac.startMonth) {
      daysIntoSign = day - zodiac.startDay;
    } else {
      const daysInStartMonth =
        getDaysInMonth(zodiac.startMonth) - zodiac.startDay + 1;
      daysIntoSign = daysInStartMonth + day;
    }
  }

  if (daysIntoSign < 10) {
    return { decan: 1, ruler: zodiac.decanRulers[0] };
  } else if (daysIntoSign < 20) {
    return { decan: 2, ruler: zodiac.decanRulers[1] };
  } else {
    return { decan: 3, ruler: zodiac.decanRulers[2] };
  }
}

function getDaysInMonth(month: number): number {
  const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return daysPerMonth[month - 1];
}

export function getNumerologyNumber(month: number, day: number): number {
  const sum =
    String(month)
      .split('')
      .reduce((a, b) => a + parseInt(b), 0) +
    String(day)
      .split('')
      .reduce((a, b) => a + parseInt(b), 0);
  if (sum <= 9) return sum;
  if (sum === 11 || sum === 22 || sum === 33) return sum;
  return String(sum)
    .split('')
    .reduce((a, b) => a + parseInt(b), 0);
}

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export function generateAllBirthdates(): string[] {
  const dates: string[] = [];
  const daysPerMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  for (let month = 1; month <= 12; month++) {
    for (let day = 1; day <= daysPerMonth[month - 1]; day++) {
      const monthName = MONTH_NAMES[month - 1].toLowerCase();
      dates.push(`${monthName}-${day}`);
    }
  }

  return dates;
}
