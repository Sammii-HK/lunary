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

export const SIGN_DISPLAY: Record<ZodiacSign, string> = {
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

export interface DecanData {
  sign: ZodiacSign;
  decan: 1 | 2 | 3;
  degrees: string;
  ruler: string;
  subruler: string;
  dateRange: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  tarotCard: string;
  description: string;
}

const DECAN_RULERS: Record<ZodiacSign, [string, string, string]> = {
  aries: ['Mars', 'Sun', 'Jupiter'],
  taurus: ['Venus', 'Mercury', 'Saturn'],
  gemini: ['Mercury', 'Venus', 'Uranus'],
  cancer: ['Moon', 'Pluto', 'Neptune'],
  leo: ['Sun', 'Jupiter', 'Mars'],
  virgo: ['Mercury', 'Saturn', 'Venus'],
  libra: ['Venus', 'Uranus', 'Mercury'],
  scorpio: ['Pluto', 'Neptune', 'Moon'],
  sagittarius: ['Jupiter', 'Mars', 'Sun'],
  capricorn: ['Saturn', 'Venus', 'Mercury'],
  aquarius: ['Uranus', 'Mercury', 'Venus'],
  pisces: ['Neptune', 'Moon', 'Pluto'],
};

const DECAN_DATES: Record<ZodiacSign, [string, string, string]> = {
  aries: ['March 21 - March 30', 'March 31 - April 9', 'April 10 - April 19'],
  taurus: ['April 20 - April 29', 'April 30 - May 10', 'May 11 - May 20'],
  gemini: ['May 21 - May 31', 'June 1 - June 10', 'June 11 - June 20'],
  cancer: ['June 21 - July 1', 'July 2 - July 12', 'July 13 - July 22'],
  leo: ['July 23 - August 1', 'August 2 - August 12', 'August 13 - August 22'],
  virgo: [
    'August 23 - September 2',
    'September 3 - September 12',
    'September 13 - September 22',
  ],
  libra: [
    'September 23 - October 2',
    'October 3 - October 13',
    'October 14 - October 22',
  ],
  scorpio: [
    'October 23 - November 2',
    'November 3 - November 12',
    'November 13 - November 21',
  ],
  sagittarius: [
    'November 22 - December 1',
    'December 2 - December 11',
    'December 12 - December 21',
  ],
  capricorn: [
    'December 22 - December 31',
    'January 1 - January 10',
    'January 11 - January 19',
  ],
  aquarius: [
    'January 20 - January 29',
    'January 30 - February 8',
    'February 9 - February 18',
  ],
  pisces: [
    'February 19 - February 29',
    'March 1 - March 10',
    'March 11 - March 20',
  ],
};

const DECAN_TAROT: Record<ZodiacSign, [string, string, string]> = {
  aries: ['Two of Wands', 'Three of Wands', 'Four of Wands'],
  taurus: ['Five of Pentacles', 'Six of Pentacles', 'Seven of Pentacles'],
  gemini: ['Eight of Swords', 'Nine of Swords', 'Ten of Swords'],
  cancer: ['Two of Cups', 'Three of Cups', 'Four of Cups'],
  leo: ['Five of Wands', 'Six of Wands', 'Seven of Wands'],
  virgo: ['Eight of Pentacles', 'Nine of Pentacles', 'Ten of Pentacles'],
  libra: ['Two of Swords', 'Three of Swords', 'Four of Swords'],
  scorpio: ['Five of Cups', 'Six of Cups', 'Seven of Cups'],
  sagittarius: ['Eight of Wands', 'Nine of Wands', 'Ten of Wands'],
  capricorn: ['Two of Pentacles', 'Three of Pentacles', 'Four of Pentacles'],
  aquarius: ['Five of Swords', 'Six of Swords', 'Seven of Swords'],
  pisces: ['Eight of Cups', 'Nine of Cups', 'Ten of Cups'],
};

export function getDecanData(sign: ZodiacSign, decan: 1 | 2 | 3): DecanData {
  const signDisplay = SIGN_DISPLAY[sign];
  const rulers = DECAN_RULERS[sign];
  const dates = DECAN_DATES[sign];
  const tarot = DECAN_TAROT[sign];
  const decanIndex = decan - 1;

  const decanDegrees = ['0° - 10°', '10° - 20°', '20° - 30°'];

  const baseTraits: Record<ZodiacSign, string[]> = {
    aries: ['pioneering', 'courageous', 'energetic'],
    taurus: ['stable', 'sensual', 'determined'],
    gemini: ['curious', 'communicative', 'adaptable'],
    cancer: ['nurturing', 'intuitive', 'protective'],
    leo: ['creative', 'confident', 'generous'],
    virgo: ['analytical', 'practical', 'perfectionist'],
    libra: ['harmonious', 'diplomatic', 'aesthetic'],
    scorpio: ['intense', 'transformative', 'passionate'],
    sagittarius: ['adventurous', 'philosophical', 'optimistic'],
    capricorn: ['ambitious', 'disciplined', 'responsible'],
    aquarius: ['innovative', 'humanitarian', 'independent'],
    pisces: ['intuitive', 'compassionate', 'artistic'],
  };

  const decanModifiers = [
    ['pure', 'initiating', 'raw'],
    ['developed', 'refined', 'expressed'],
    ['mature', 'evolved', 'integrated'],
  ];

  return {
    sign,
    decan,
    degrees: decanDegrees[decanIndex],
    ruler: rulers[0],
    subruler: rulers[decanIndex],
    dateRange: dates[decanIndex],
    traits: [...baseTraits[sign], ...decanModifiers[decanIndex]],
    strengths: [
      `${signDisplay} energy enhanced by ${rulers[decanIndex]}`,
      `${decanModifiers[decanIndex][0]} expression`,
    ],
    challenges: [`Balancing ${rulers[0]} and ${rulers[decanIndex]} energies`],
    tarotCard: tarot[decanIndex],
    description: `The ${decan === 1 ? 'First' : decan === 2 ? 'Second' : 'Third'} Decan of ${signDisplay} (${dates[decanIndex]}) is co-ruled by ${rulers[decanIndex]}, adding ${rulers[decanIndex].toLowerCase()} influences to the core ${signDisplay} energy.`,
  };
}

export function generateAllDecanParams(): { sign: string; decan: string }[] {
  const params: { sign: string; decan: string }[] = [];

  for (const sign of ZODIAC_SIGNS) {
    for (const decan of [1, 2, 3]) {
      params.push({ sign, decan: String(decan) });
    }
  }

  return params;
}
