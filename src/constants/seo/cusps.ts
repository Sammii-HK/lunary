export const ZODIAC_CUSPS = [
  {
    id: 'aries-taurus',
    sign1: 'Aries',
    sign2: 'Taurus',
    dates: 'April 16-22',
    name: 'Cusp of Power',
  },
  {
    id: 'taurus-gemini',
    sign1: 'Taurus',
    sign2: 'Gemini',
    dates: 'May 17-23',
    name: 'Cusp of Energy',
  },
  {
    id: 'gemini-cancer',
    sign1: 'Gemini',
    sign2: 'Cancer',
    dates: 'June 17-23',
    name: 'Cusp of Magic',
  },
  {
    id: 'cancer-leo',
    sign1: 'Cancer',
    sign2: 'Leo',
    dates: 'July 19-25',
    name: 'Cusp of Oscillation',
  },
  {
    id: 'leo-virgo',
    sign1: 'Leo',
    sign2: 'Virgo',
    dates: 'August 19-25',
    name: 'Cusp of Exposure',
  },
  {
    id: 'virgo-libra',
    sign1: 'Virgo',
    sign2: 'Libra',
    dates: 'September 19-25',
    name: 'Cusp of Beauty',
  },
  {
    id: 'libra-scorpio',
    sign1: 'Libra',
    sign2: 'Scorpio',
    dates: 'October 19-25',
    name: 'Cusp of Drama',
  },
  {
    id: 'scorpio-sagittarius',
    sign1: 'Scorpio',
    sign2: 'Sagittarius',
    dates: 'November 18-24',
    name: 'Cusp of Revolution',
  },
  {
    id: 'sagittarius-capricorn',
    sign1: 'Sagittarius',
    sign2: 'Capricorn',
    dates: 'December 18-24',
    name: 'Cusp of Prophecy',
  },
  {
    id: 'capricorn-aquarius',
    sign1: 'Capricorn',
    sign2: 'Aquarius',
    dates: 'January 16-22',
    name: 'Cusp of Mystery',
  },
  {
    id: 'aquarius-pisces',
    sign1: 'Aquarius',
    sign2: 'Pisces',
    dates: 'February 15-21',
    name: 'Cusp of Sensitivity',
  },
  {
    id: 'pisces-aries',
    sign1: 'Pisces',
    sign2: 'Aries',
    dates: 'March 17-23',
    name: 'Cusp of Rebirth',
  },
] as const;

export type CuspId = (typeof ZODIAC_CUSPS)[number]['id'];

export interface CuspData {
  id: string;
  sign1: string;
  sign2: string;
  dates: string;
  name: string;
  element1: string;
  element2: string;
  traits: string[];
  strengths: string[];
  challenges: string[];
  celebrities: string[];
  compatibility: string[];
  description: string;
}

const SIGN_ELEMENTS: Record<string, string> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

export const CUSP_DETAILS: Record<
  CuspId,
  Omit<
    CuspData,
    'id' | 'sign1' | 'sign2' | 'dates' | 'name' | 'element1' | 'element2'
  >
> = {
  'aries-taurus': {
    traits: [
      'determined',
      'pioneering',
      'persistent',
      'authoritative',
      'grounded ambition',
    ],
    strengths: [
      'Leadership with staying power',
      'Practical action',
      'Strong willpower',
    ],
    challenges: [
      'Stubbornness',
      'Impatience with slow progress',
      'Ego clashes',
    ],
    celebrities: ['Queen Elizabeth II', 'Adolf Hitler', 'Kourtney Kardashian'],
    compatibility: [
      'Virgo-Libra cusp',
      'Capricorn-Aquarius cusp',
      'Cancer-Leo cusp',
    ],
    description:
      "The Cusp of Power combines Aries' pioneering spirit with Taurus' determination, creating individuals with exceptional drive and staying power.",
  },
  'taurus-gemini': {
    traits: ['adaptable', 'charming', 'witty', 'social', 'versatile'],
    strengths: [
      'Communication skills',
      'Social charm',
      'Mental and physical stamina',
    ],
    challenges: ['Restlessness', 'Inconsistency', 'Scattered focus'],
    celebrities: ['Cher', 'Naomi Campbell', 'Mark Zuckerberg'],
    compatibility: [
      'Scorpio-Sagittarius cusp',
      'Aquarius-Pisces cusp',
      'Leo-Virgo cusp',
    ],
    description:
      "The Cusp of Energy blends Taurus' sensuality with Gemini's mental agility, producing dynamic, charming individuals.",
  },
  'gemini-cancer': {
    traits: [
      'intuitive',
      'expressive',
      'nurturing',
      'curious',
      'emotionally intelligent',
    ],
    strengths: [
      'Emotional depth with articulation',
      'Nurturing communication',
      'Adaptability',
    ],
    challenges: ['Mood swings', 'Over-sensitivity', 'Indecision'],
    celebrities: ['Ariana Grande', 'Nicole Kidman', 'Chris Pratt'],
    compatibility: [
      'Sagittarius-Capricorn cusp',
      'Pisces-Aries cusp',
      'Virgo-Libra cusp',
    ],
    description:
      "The Cusp of Magic combines Gemini's communication gifts with Cancer's emotional depth, creating deeply intuitive and expressive individuals.",
  },
  'cancer-leo': {
    traits: ['dramatic', 'nurturing', 'confident', 'protective', 'creative'],
    strengths: [
      'Leadership with empathy',
      'Creative expression',
      'Protective nature',
    ],
    challenges: ['Emotional volatility', 'Need for attention', 'Mood swings'],
    celebrities: ['Robin Williams', 'Selena Gomez', 'Will Ferrell'],
    compatibility: [
      'Capricorn-Aquarius cusp',
      'Aries-Taurus cusp',
      'Libra-Scorpio cusp',
    ],
    description:
      "The Cusp of Oscillation swings between Cancer's sensitivity and Leo's confidence, creating passionate, emotionally expressive individuals.",
  },
  'leo-virgo': {
    traits: [
      'analytical',
      'charismatic',
      'hardworking',
      'perfectionist',
      'detail-oriented',
    ],
    strengths: [
      'Creative precision',
      'Leadership with humility',
      'Practical creativity',
    ],
    challenges: ['Self-criticism', 'High standards', 'Overthinking'],
    celebrities: ['Madonna', 'Bill Clinton', 'Ben Affleck'],
    compatibility: [
      'Aquarius-Pisces cusp',
      'Taurus-Gemini cusp',
      'Scorpio-Sagittarius cusp',
    ],
    description:
      "The Cusp of Exposure combines Leo's creativity with Virgo's precision, producing talented individuals who perfect their craft.",
  },
  'virgo-libra': {
    traits: ['aesthetic', 'balanced', 'analytical', 'graceful', 'refined'],
    strengths: [
      'Artistic sensibility',
      'Diplomatic analysis',
      'Harmonious approach',
    ],
    challenges: ['Indecision', 'People-pleasing', 'Over-analyzing'],
    celebrities: ['Bill Murray', 'Jimmy Fallon', 'Gwyneth Paltrow'],
    compatibility: [
      'Pisces-Aries cusp',
      'Gemini-Cancer cusp',
      'Sagittarius-Capricorn cusp',
    ],
    description:
      "The Cusp of Beauty merges Virgo's analytical eye with Libra's aesthetic sensibility, creating individuals with refined taste and balanced judgment.",
  },
  'libra-scorpio': {
    traits: ['magnetic', 'intense', 'charming', 'passionate', 'perceptive'],
    strengths: ['Social intuition', 'Charismatic depth', 'Investigative charm'],
    challenges: ['Jealousy', 'Power struggles', 'Manipulation'],
    celebrities: ['Kim Kardashian', 'Zac Efron', 'John Krasinski'],
    compatibility: [
      'Aries-Taurus cusp',
      'Cancer-Leo cusp',
      'Capricorn-Aquarius cusp',
    ],
    description:
      "The Cusp of Drama fuses Libra's charm with Scorpio's intensity, creating magnetic, powerful personalities.",
  },
  'scorpio-sagittarius': {
    traits: [
      'rebellious',
      'adventurous',
      'intense',
      'philosophical',
      'transformative',
    ],
    strengths: [
      'Deep exploration',
      'Fearless truth-seeking',
      'Transformative vision',
    ],
    challenges: ['Impatience', 'Bluntness', 'Extreme views'],
    celebrities: ['Miley Cyrus', 'Scarlett Johansson', 'Owen Wilson'],
    compatibility: [
      'Taurus-Gemini cusp',
      'Leo-Virgo cusp',
      'Aquarius-Pisces cusp',
    ],
    description:
      "The Cusp of Revolution combines Scorpio's depth with Sagittarius' quest for truth, creating fearless seekers of transformation.",
  },
  'sagittarius-capricorn': {
    traits: ['visionary', 'ambitious', 'wise', 'determined', 'prophetic'],
    strengths: ['Long-term vision', 'Practical optimism', 'Wise leadership'],
    challenges: ['Pessimism', 'Workaholism', 'Impatience'],
    celebrities: ['Taylor Swift', 'Brad Pitt', 'John Legend'],
    compatibility: [
      'Gemini-Cancer cusp',
      'Virgo-Libra cusp',
      'Pisces-Aries cusp',
    ],
    description:
      "The Cusp of Prophecy merges Sagittarius' vision with Capricorn's practicality, creating determined individuals who manifest big dreams.",
  },
  'capricorn-aquarius': {
    traits: [
      'innovative',
      'disciplined',
      'eccentric',
      'determined',
      'visionary',
    ],
    strengths: [
      'Structured innovation',
      'Practical revolution',
      'Responsible leadership',
    ],
    challenges: ['Emotional detachment', 'Stubbornness', 'Superiority'],
    celebrities: ['Ellen DeGeneres', 'Dolly Parton', 'Alicia Keys'],
    compatibility: [
      'Cancer-Leo cusp',
      'Libra-Scorpio cusp',
      'Aries-Taurus cusp',
    ],
    description:
      "The Cusp of Mystery blends Capricorn's ambition with Aquarius' innovation, creating unique individuals who revolutionize traditions.",
  },
  'aquarius-pisces': {
    traits: [
      'compassionate',
      'visionary',
      'intuitive',
      'humanitarian',
      'creative',
    ],
    strengths: [
      'Empathic vision',
      'Creative humanitarianism',
      'Intuitive innovation',
    ],
    challenges: ['Escapism', 'Over-sensitivity', 'Impracticality'],
    celebrities: ['Rihanna', 'Steve Jobs', 'Jennifer Aniston'],
    compatibility: [
      'Leo-Virgo cusp',
      'Scorpio-Sagittarius cusp',
      'Taurus-Gemini cusp',
    ],
    description:
      "The Cusp of Sensitivity combines Aquarius' vision with Pisces' compassion, creating deeply intuitive humanitarian spirits.",
  },
  'pisces-aries': {
    traits: ['intuitive', 'pioneering', 'dreamy', 'courageous', 'imaginative'],
    strengths: ['Intuitive action', 'Creative courage', 'Spiritual pioneering'],
    challenges: ['Impatience', 'Escapism', 'Impulsivity'],
    celebrities: ['Bruce Willis', 'Reese Witherspoon', 'Gary Oldman'],
    compatibility: [
      'Virgo-Libra cusp',
      'Sagittarius-Capricorn cusp',
      'Gemini-Cancer cusp',
    ],
    description:
      "The Cusp of Rebirth combines Pisces' spiritual depth with Aries' action, creating intuitive pioneers who manifest dreams into reality.",
  },
};

export function getCuspData(cuspId: CuspId): CuspData {
  const cusp = ZODIAC_CUSPS.find((c) => c.id === cuspId);
  if (!cusp) throw new Error(`Cusp not found: ${cuspId}`);

  const details = CUSP_DETAILS[cuspId];

  return {
    id: cusp.id,
    sign1: cusp.sign1,
    sign2: cusp.sign2,
    dates: cusp.dates,
    name: cusp.name,
    element1: SIGN_ELEMENTS[cusp.sign1],
    element2: SIGN_ELEMENTS[cusp.sign2],
    ...details,
  };
}

export function generateAllCuspParams(): { cusp: string }[] {
  return ZODIAC_CUSPS.map((c) => ({ cusp: c.id }));
}
