const PLANETS = [
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
];

const ZODIAC_SIGNS = [
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
];

const CHART_TERMS = [
  'house',
  'placement',
  'natal',
  'chart',
  'transit',
  'aspect',
  'ritual',
];

const GUIDANCE_TERMS = [
  'authentically',
  'instincts',
  'transformation',
  'healing',
  'manifestation',
  'intuition',
  'wisdom',
  'strength',
  'clarity',
  'balance',
  'harmony',
  'power',
  'growth',
  'abundance',
  'passion',
  'creativity',
  'connection',
  'release',
  'embrace',
  'illuminate',
];

export const shouldRedactWord = (word: string, index: number): boolean => {
  const cleanWord = word.toLowerCase().replace(/[.,!?;:]/g, '');

  // House numbers (1st, 2nd, 3rd, 12th, etc.)
  if (/^\d+(st|nd|rd|th)$/.test(cleanWord)) return true;

  if (PLANETS.includes(cleanWord)) return true;
  if (ZODIAC_SIGNS.includes(cleanWord)) return true;
  if (CHART_TERMS.includes(cleanWord)) return true;
  if (GUIDANCE_TERMS.includes(cleanWord)) return true;

  // Every 6th word for variety
  return index % 6 === 4;
};
