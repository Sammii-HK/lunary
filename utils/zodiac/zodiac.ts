export const ZODIAC_SIGNS = [
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

export type constellationItems =
  | 'element'
  | 'quality'
  | 'rulingPlanet'
  | 'symbol';

// Astromicon font characters (use with font-astro class)
export const bodiesSymbols = {
  sun: 'Q',
  moon: 'R',
  mercury: 'S',
  venus: 'T',
  mars: 'U',
  jupiter: 'V',
  saturn: 'W',
  uranus: 'X',
  neptune: 'Y',
  pluto: 'Z',
};

export const planetSymbols = {
  ...bodiesSymbols,
  earth: 'L',
};

// Astromicon zodiac characters (use with font-astro class)
export const zodiacSymbol = {
  aries: 'A',
  taurus: 'B',
  gemini: 'C',
  cancer: 'D',
  leo: 'E',
  virgo: 'F',
  libra: 'G',
  scorpio: 'H',
  sagittarius: 'I',
  capricorn: 'J',
  aquarius: 'K',
  pisces: 'L',
};

// Unicode zodiac symbols (readable without special font)
export const zodiacUnicode = {
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

// Unicode planet symbols (readable without special font)
export const planetUnicode = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  earth: '⊕',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

export const elementUnicode = {
  earth: '🜃',
  fire: '🜂',
  air: '🜁',
  water: '🜄',
};

export const qualityUnicode = {
  cardinal: '🜍',
  fixed: '🜔',
  mutable: '☿',
};
export const getIcon = (
  type: constellationItems,
  item: string,
  constellation: any,
) => {
  if (type === 'element') {
    return elementUnicode[
      constellation[type]?.toLowerCase() as keyof typeof elementUnicode
    ];
  }
  if (type === 'rulingPlanet') {
    return planetSymbols[
      constellation[type]?.toLowerCase() as keyof typeof planetSymbols
    ];
  }
  if (type === 'quality') {
    return qualityUnicode[
      constellation[type]?.toLowerCase() as keyof typeof qualityUnicode
    ];
  }
  if (type === 'symbol') {
    const constellationName = constellation.name?.toLowerCase();
    return zodiacSymbol[constellationName as keyof typeof zodiacSymbol];
  }
  return item;
};

export const planetaryBodies = {
  sun: {
    name: 'Sun',
    properties: 'Star at the center of our Solar System',
    mysticalProperties:
      'Represents the self, individuality, and spirit. Symbolizes power, vitality, and the essence of being.',
  },
  moon: {
    name: 'Moon',
    properties: "Earth's only natural satellite",
    mysticalProperties:
      'Controls emotions, moods, and the unconscious. It influences intuition, psychic abilities, and emotional well-being.',
  },
  mercury: {
    name: 'Mercury',
    properties: 'Smallest and closest to the Sun',
    mysticalProperties:
      'Governed by communication, intellect, and speed. Often associated with travel, writing, speaking, and all forms of communication.',
  },
  venus: {
    name: 'Venus',
    properties: 'Second planet from the Sun, similar to Earth in size',
    mysticalProperties:
      'Rules love, beauty, and finances. It influences personal charm, attractiveness, and personal relationships.',
  },
  earth: {
    name: 'Earth',
    properties: 'Third planet from the Sun, our home planet',
    mysticalProperties:
      'Symbolizes grounding, fertility, and life. In astrology, it is often related to practicality and materialism.',
  },
  mars: {
    name: 'Mars',
    properties: 'Fourth planet from the Sun, known for its red appearance',
    mysticalProperties:
      'Associated with energy, passion, and war. Influences desire, aggression, and determination.',
  },
  jupiter: {
    name: 'Jupiter',
    properties: 'Largest planet in the Solar System',
    mysticalProperties:
      'Symbolizes growth, expansion, and abundance. Known for bringing luck and wealth.',
  },
  saturn: {
    name: 'Saturn',
    properties: 'Known for its extensive ring system',
    mysticalProperties:
      'Represents discipline, responsibility, and restrictions. Teaches lessons about patience and diligence.',
  },
  uranus: {
    name: 'Uranus',
    properties: 'Ice giant with a tilted rotational axis',
    mysticalProperties:
      'Associated with change, innovation, and disruption. Represents sudden shifts and revolutions.',
  },
  neptune: {
    name: 'Neptune',
    properties: 'Ice giant, similar to Uranus, known for its blue color',
    mysticalProperties:
      'Rules dreams, imagination, and the subconscious. Linked to spirituality and intuition.',
  },
  pluto: {
    name: 'Pluto',
    properties: 'Dwarf planet, known for its elliptical orbit',
    mysticalProperties:
      'Though reclassified, still considered powerful in astrology. Represents transformation, power, and rebirth.',
  },
};

export const zodiacSigns = {
  aries: {
    name: 'Aries',
    dates: 'March 21 - April 19',
    element: 'Fire',
    mysticalProperties:
      'Represents courage, enthusiasm, and initiative. Rules beginnings and ventures, often associated with leadership qualities.',
  },
  taurus: {
    name: 'Taurus',
    dates: 'April 20 - May 20',
    element: 'Earth',
    mysticalProperties:
      'Symbolizes reliability, practicality, and determination. Influences matters of finance, comfort, and physical pleasures.',
  },
  gemini: {
    name: 'Gemini',
    dates: 'May 21 - June 20',
    element: 'Air',
    mysticalProperties:
      'Associated with communication, intellectual curiosity, and versatility. Represents dual nature and adaptability.',
  },
  cancer: {
    name: 'Cancer',
    dates: 'June 21 - July 22',
    element: 'Water',
    mysticalProperties:
      'Emphasizes emotion, nurturing, and intuition. Rules home and family, focuses on caring and protective traits.',
  },
  leo: {
    name: 'Leo',
    dates: 'July 23 - August 22',
    element: 'Fire',
    mysticalProperties:
      'Governs self-confidence, creativity, and drama. Symbolizes leadership, pride, and theatrical traits.',
  },
  virgo: {
    name: 'Virgo',
    dates: 'August 23 - September 22',
    element: 'Earth',
    mysticalProperties:
      'Represents practicality, analytical abilities, and attention to detail. Associated with service, meticulousness, and modesty.',
  },
  libra: {
    name: 'Libra',
    dates: 'September 23 - October 22',
    element: 'Air',
    mysticalProperties:
      'Rules balance, harmony, and partnerships. Focused on justice, diplomacy, and relationships.',
  },
  scorpio: {
    name: 'Scorpio',
    dates: 'October 23 - November 21',
    element: 'Water',
    mysticalProperties:
      'Symbolizes transformation, mystery, and intensity. Influences themes of sexuality, death, and rebirth.',
  },
  sagittarius: {
    name: 'Sagittarius',
    dates: 'November 22 - December 21',
    element: 'Fire',
    mysticalProperties:
      'Associated with exploration, freedom, and philosophy. Represents optimism, love for freedom, and adventurous spirit.',
  },
  capricorn: {
    name: 'Capricorn',
    dates: 'December 22 - January 19',
    element: 'Earth',
    mysticalProperties:
      'Emphasizes discipline, structure, and ambition. Rules career, determination, and careful planning.',
  },
  aquarius: {
    name: 'Aquarius',
    dates: 'January 20 - February 18',
    element: 'Air',
    mysticalProperties:
      'Represents innovation, individuality, and humanitarianism. Focuses on unconventional thinking, community, and idealism.',
  },
  pisces: {
    name: 'Pisces',
    dates: 'February 19 - March 20',
    element: 'Water',
    mysticalProperties:
      'Symbolizes empathy, compassion, and intuition. Associated with mysticism, spirituality, and sensitivity.',
  },
};
