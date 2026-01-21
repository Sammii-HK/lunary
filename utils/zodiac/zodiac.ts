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
  ascendant: 'a',
  midheaven: 'm',
  northnode: 'n',
  southnode: 's',
  chiron: 'c',
  lilith: 'l',
};

export const planetSymbols = {
  ...bodiesSymbols,
  earth: 'L',
};

// Astromicon symbols for astrological points (use with font-astro class)
export const astroPointSymbols = {
  ascendant: 'a',
  descendant: 'f',
  midheaven: 'm',
  imumcoeli: 'i',
  northnode: 'n',
  southnode: 's',
  chiron: 'c',
  lilith: 'l',
  partoffortune: 'p',
};

// Unicode symbols for astrological points (fallback without special font)
export const astroPointUnicode = {
  ascendant: 'AC',
  descendant: 'DC',
  midheaven: 'MC',
  imumcoeli: 'IC',
  northnode: '☊',
  southnode: '☋',
  chiron: '⚷',
  lilith: '⚸',
  partoffortune: '⊗',
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

// Alchemical element symbols (may not render on all systems)
export const elementUnicode = {
  earth: '🜃',
  fire: '🜂',
  air: '🜁',
  water: '🜄',
};

// Astromicon element symbols (use with font-astro class)
export const elementAstro = {
  fire: '1',
  earth: '2',
  air: '3',
  water: '4',
};

// Standard Unicode element symbols (better cross-platform support)
export const elementSymbols = {
  fire: '△',
  earth: '▽',
  air: '△',
  water: '▽',
};

// Alchemical modality symbols (may not render on all systems)
export const qualityUnicode = {
  cardinal: '🜍',
  fixed: '🜔',
  mutable: '☿',
};

// Astromicon modality symbols (use with font-astro class)
export const modalityAstro = {
  cardinal: '5',
  fixed: '6',
  mutable: '7',
};

// Standard Unicode modality symbols (better cross-platform support)
export const modalitySymbols = {
  cardinal: '⚹',
  fixed: '□',
  mutable: '△',
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

export interface Planet {
  name: string;
  symbol: string;
  properties: string;
  keywords: string[];
  rules: string[];
  exalted?: string;
  detriment?: string;
  fall?: string;
  mysticalProperties: string;
  retrogradeEffect: string;
  transitEffect: string;
  houseMeaning: string;
  affirmation: string;
}

export const planetaryBodies: Record<string, Planet> = {
  sun: {
    name: 'Sun',
    symbol: '☉',
    properties: 'Star at the center of our Solar System',
    keywords: [
      'Identity',
      'Vitality',
      'Ego',
      'Life Force',
      'Purpose',
      'Father',
    ],
    rules: ['Leo'],
    exalted: 'Aries',
    detriment: 'Aquarius',
    fall: 'Libra',
    mysticalProperties:
      'Represents the self, individuality, and spirit. Symbolizes power, vitality, and the essence of being.',
    retrogradeEffect:
      'The Sun does not go retrograde. Its energy is constant, representing the unwavering core of self that anchors all other planetary influences.',
    transitEffect:
      'Sun transits illuminate the house it passes through, bringing focus, vitality, and attention to those life areas. Annual Sun return marks your birthday—a time of renewal.',
    houseMeaning:
      'The Sun in your natal chart shows where you shine brightest, where your ego finds expression, and where you seek recognition and purpose.',
    affirmation:
      'I shine with my authentic self and embrace my vital life force.',
  },
  moon: {
    name: 'Moon',
    symbol: '☽',
    properties: "Earth's only natural satellite",
    keywords: [
      'Emotions',
      'Instincts',
      'Nurturing',
      'Subconscious',
      'Mother',
      'Habits',
    ],
    rules: ['Cancer'],
    exalted: 'Taurus',
    detriment: 'Capricorn',
    fall: 'Scorpio',
    mysticalProperties:
      'Controls emotions, moods, and the unconscious. It influences intuition, psychic abilities, and emotional well-being.',
    retrogradeEffect:
      'The Moon does not go retrograde in the traditional sense. Its phases (New, Waxing, Full, Waning) create the lunar cycle that influences emotional tides and intuition.',
    transitEffect:
      'Moon transits change every 2.5 days, influencing daily moods and emotional responses. Track the Moon through your chart to understand your emotional rhythms.',
    houseMeaning:
      'The Moon in your natal chart reveals your emotional nature, how you nurture and need to be nurtured, and your deepest unconscious patterns.',
    affirmation: 'I honor my emotions and trust my intuitive wisdom.',
  },
  mercury: {
    name: 'Mercury',
    symbol: '☿',
    properties: 'Smallest and closest to the Sun',
    keywords: [
      'Communication',
      'Intellect',
      'Learning',
      'Travel',
      'Writing',
      'Logic',
    ],
    rules: ['Gemini', 'Virgo'],
    exalted: 'Virgo',
    detriment: 'Sagittarius',
    fall: 'Pisces',
    mysticalProperties:
      'Governed by communication, intellect, and speed. Often associated with travel, writing, speaking, and all forms of communication.',
    retrogradeEffect:
      'Mercury retrograde (3-4 times yearly, ~3 weeks each) affects communication, technology, travel, and contracts. Review, revise, and reflect rather than starting new ventures. Expect delays and miscommunications.',
    transitEffect:
      'Mercury transits bring mental focus to the house it visits. Quick-moving Mercury stimulates thinking, communication, and short trips related to that life area.',
    houseMeaning:
      'Mercury in your natal chart shows how you think, communicate, and process information. It reveals your learning style and mental approach to life.',
    affirmation: 'I communicate clearly and embrace curiosity in all learning.',
  },
  venus: {
    name: 'Venus',
    symbol: '♀',
    properties: 'Second planet from the Sun, similar to Earth in size',
    keywords: ['Love', 'Beauty', 'Harmony', 'Values', 'Money', 'Pleasure'],
    rules: ['Taurus', 'Libra'],
    exalted: 'Pisces',
    detriment: 'Aries',
    fall: 'Virgo',
    mysticalProperties:
      'Rules love, beauty, and finances. It influences personal charm, attractiveness, and personal relationships.',
    retrogradeEffect:
      'Venus retrograde (every 18 months, ~40 days) brings review of relationships, values, and finances. Ex-partners may reappear. Avoid major beauty changes or large purchases. Reassess what you truly value.',
    transitEffect:
      'Venus transits bring pleasure, beauty, and harmony to the house it visits. Good for social activities, romance, and financial matters in that life area.',
    houseMeaning:
      'Venus in your natal chart shows how you love, what you find beautiful, and your approach to pleasure and money. It reveals your romantic style.',
    affirmation: 'I attract love and beauty by honoring my values.',
  },
  earth: {
    name: 'Earth',
    symbol: '⊕',
    properties: 'Third planet from the Sun, our home planet',
    keywords: [
      'Grounding',
      'Manifestation',
      'Physical',
      'Material',
      'Fertility',
      'Life',
    ],
    rules: [],
    mysticalProperties:
      'grounding, fertility, and life. In astrology, it is often related to practicality and materialism.',
    retrogradeEffect:
      'Earth does not go retrograde from our perspective. It represents our grounded, physical experience from which we observe all other planetary movements.',
    transitEffect:
      "Earth is not used in traditional transit analysis, though some modern astrologers use the Earth's position opposite the Sun (heliocentric) for grounding insights.",
    houseMeaning:
      'Earth is our vantage point for the entire natal chart. Some modern systems place Earth opposite the Sun to understand material and physical grounding.',
    affirmation:
      'I am grounded in my physical body and connected to the Earth.',
  },
  mars: {
    name: 'Mars',
    symbol: '♂',
    properties: 'Fourth planet from the Sun, known for its red appearance',
    keywords: ['Action', 'Passion', 'Drive', 'Aggression', 'Courage', 'Desire'],
    rules: ['Aries', 'Scorpio (traditional)'],
    exalted: 'Capricorn',
    detriment: 'Libra',
    fall: 'Cancer',
    mysticalProperties:
      'Associated with energy, passion, and war. Influences desire, aggression, and determination.',
    retrogradeEffect:
      'Mars retrograde (every 2 years, ~2 months) redirects energy inward. Physical vitality may decrease. Avoid starting fights or major initiatives. Review how you assert yourself and handle conflict.',
    transitEffect:
      'Mars transits bring energy, drive, and sometimes conflict to the house it visits. Good for taking action, but watch for aggression. Activities requiring courage are favored.',
    houseMeaning:
      'Mars in your natal chart shows how you take action, assert yourself, and express desire and anger. It reveals your fighting style and energy direction.',
    affirmation: 'I channel my passion into courageous, purposeful action.',
  },
  jupiter: {
    name: 'Jupiter',
    symbol: '♃',
    properties: 'Largest planet in the Solar System',
    keywords: [
      'Expansion',
      'Luck',
      'Wisdom',
      'Growth',
      'Abundance',
      'Philosophy',
    ],
    rules: ['Sagittarius', 'Pisces (traditional)'],
    exalted: 'Cancer',
    detriment: 'Gemini',
    fall: 'Capricorn',
    mysticalProperties:
      'growth, expansion, and abundance. Known for bringing luck and wealth.',
    retrogradeEffect:
      'Jupiter retrograde (4 months yearly) turns expansion inward. Philosophical and spiritual growth emphasized over material. Reassess beliefs and where you seek meaning. Inner wisdom develops.',
    transitEffect:
      'Jupiter transits bring luck, expansion, and opportunity to the house it visits (~1 year per sign). Excellent for growth, travel, and taking risks in that life area.',
    houseMeaning:
      'Jupiter in your natal chart shows where you find luck, seek expansion, and experience abundance. It reveals your approach to faith and higher learning.',
    affirmation: "I embrace growth and trust in life's abundant opportunities.",
  },
  saturn: {
    name: 'Saturn',
    symbol: '♄',
    properties: 'Known for its extensive ring system',
    keywords: [
      'Discipline',
      'Structure',
      'Karma',
      'Lessons',
      'Time',
      'Responsibility',
    ],
    rules: ['Capricorn', 'Aquarius (traditional)'],
    exalted: 'Libra',
    detriment: 'Cancer',
    fall: 'Aries',
    mysticalProperties:
      'Represents discipline, responsibility, and restrictions. Teaches lessons about patience and diligence.',
    retrogradeEffect:
      'Saturn retrograde (4.5 months yearly) intensifies internal karmic review. Lessons feel more personal. Review structures and responsibilities. Past issues resurface for resolution.',
    transitEffect:
      'Saturn transits bring tests, structure, and maturation to the house it visits (~2.5 years per sign). Challenges lead to mastery. Saturn Return (ages 28-30, 57-60) is major life milestone.',
    houseMeaning:
      'Saturn in your natal chart shows where you face challenges, develop discipline, and ultimately achieve mastery. It reveals your karmic lessons.',
    affirmation:
      "I embrace life's lessons and build lasting foundations through discipline.",
  },
  uranus: {
    name: 'Uranus',
    symbol: '♅',
    properties: 'Ice giant with a tilted rotational axis',
    keywords: [
      'Revolution',
      'Innovation',
      'Freedom',
      'Awakening',
      'Rebellion',
      'Technology',
    ],
    rules: ['Aquarius'],
    exalted: 'Scorpio',
    detriment: 'Leo',
    fall: 'Taurus',
    mysticalProperties:
      'Associated with change, innovation, and disruption. Represents sudden shifts and revolutions.',
    retrogradeEffect:
      'Uranus retrograde (5 months yearly) internalizes revolution. Personal rather than external awakening. Review where you need more freedom and authenticity. Inner rebellion processes.',
    transitEffect:
      'Uranus transits bring sudden change, liberation, and innovation to the house it visits (~7 years per sign). Expect the unexpected. Old structures shatter to make way for new.',
    houseMeaning:
      'Uranus in your natal chart shows where you seek freedom, express uniqueness, and experience sudden changes. It reveals your revolutionary spirit.',
    affirmation: 'I embrace change and express my authentic, innovative self.',
  },
  neptune: {
    name: 'Neptune',
    symbol: '♆',
    properties: 'Ice giant, similar to Uranus, known for its blue color',
    keywords: [
      'Dreams',
      'Spirituality',
      'Illusion',
      'Compassion',
      'Intuition',
      'Transcendence',
    ],
    rules: ['Pisces'],
    exalted: 'Cancer',
    detriment: 'Virgo',
    fall: 'Capricorn',
    mysticalProperties:
      'Rules dreams, imagination, and the subconscious. Linked to spirituality and intuition.',
    retrogradeEffect:
      'Neptune retrograde (5 months yearly) lifts veils of illusion. Spiritual insights deepen but confusion may clear. Dreams become more significant. Inner spiritual work emphasized.',
    transitEffect:
      'Neptune transits dissolve boundaries and bring spiritual awareness to the house it visits (~14 years per sign). Watch for confusion and escapism alongside inspiration.',
    houseMeaning:
      'Neptune in your natal chart shows where you seek transcendence, experience intuition, and may encounter illusion. It reveals your spiritual nature.',
    affirmation: 'I trust my intuition and embrace spiritual connection.',
  },
  pluto: {
    name: 'Pluto',
    symbol: '♇',
    properties: 'Dwarf planet, known for its elliptical orbit',
    keywords: [
      'Transformation',
      'Power',
      'Death/Rebirth',
      'Shadow',
      'Intensity',
      'Regeneration',
    ],
    rules: ['Scorpio'],
    exalted: 'Aries',
    detriment: 'Taurus',
    fall: 'Libra',
    mysticalProperties:
      'Though reclassified, still considered powerful in astrology. Represents transformation, power, and rebirth.',
    retrogradeEffect:
      'Pluto retrograde (5-6 months yearly) intensifies internal transformation. Shadow work deepens. Power dynamics become internal. Deep psychological processing occurs.',
    transitEffect:
      'Pluto transits bring profound transformation to the house it visits (~12-31 years per sign). Complete destruction and rebirth of that life area. Nothing is left unchanged.',
    houseMeaning:
      'Pluto in your natal chart shows where you experience transformation, encounter power dynamics, and face your shadow. It reveals your regenerative power.',
    affirmation: 'I embrace transformation and reclaim my authentic power.',
  },
};

export interface ZodiacSign {
  name: string;
  dates: string;
  symbol: string;
  element: string;
  modality: string;
  rulingPlanet: string;
  keywords: string[];
  strengths: string[];
  weaknesses: string[];
  bestMatches: string[];
  challengingMatches: string[];
  description: string;
  mysticalProperties: string;
  loveTrait: string;
  careerTrait: string;
  affirmation: string;
}

export const zodiacSigns: Record<string, ZodiacSign> = {
  aries: {
    name: 'Aries',
    dates: 'March 21 - April 19',
    symbol: '♈',
    element: 'Fire',
    modality: 'Cardinal',
    rulingPlanet: 'Mars',
    keywords: [
      'Leadership',
      'Courage',
      'Initiative',
      'Energy',
      'Competition',
      'Pioneer',
    ],
    strengths: [
      'Courageous',
      'Determined',
      'Confident',
      'Enthusiastic',
      'Optimistic',
      'Honest',
      'Passionate',
    ],
    weaknesses: [
      'Impatient',
      'Moody',
      'Short-tempered',
      'Impulsive',
      'Aggressive',
    ],
    bestMatches: ['Leo', 'Sagittarius', 'Gemini', 'Aquarius'],
    challengingMatches: ['Cancer', 'Capricorn'],
    description:
      'Aries is the first sign of the zodiac, representing new beginnings, pioneering spirit, and the spark of creation. As a Cardinal Fire sign ruled by Mars, Aries embodies courage, initiative, and the drive to lead. Aries natives are natural trailblazers who thrive on challenge and competition.',
    mysticalProperties:
      'Represents courage, enthusiasm, and initiative. Rules beginnings and ventures, often associated with leadership qualities.',
    loveTrait:
      'Aries loves passionately and directly. They pursue what they want with characteristic boldness, preferring partners who can match their energy and independence.',
    careerTrait:
      'Aries excels in leadership roles, entrepreneurship, and careers requiring initiative. They thrive in competitive environments and pioneering fields.',
    affirmation: 'I courageously lead with passion and embrace new beginnings.',
  },
  taurus: {
    name: 'Taurus',
    dates: 'April 20 - May 20',
    symbol: '♉',
    element: 'Earth',
    modality: 'Fixed',
    rulingPlanet: 'Venus',
    keywords: [
      'Stability',
      'Sensuality',
      'Determination',
      'Patience',
      'Luxury',
      'Nature',
    ],
    strengths: [
      'Reliable',
      'Patient',
      'Practical',
      'Devoted',
      'Responsible',
      'Stable',
    ],
    weaknesses: [
      'Stubborn',
      'Possessive',
      'Uncompromising',
      'Self-indulgent',
      'Materialistic',
    ],
    bestMatches: ['Virgo', 'Capricorn', 'Cancer', 'Pisces'],
    challengingMatches: ['Leo', 'Aquarius'],
    description:
      'Taurus is the stabilizer of the zodiac, bringing patience, determination, and a love of beauty and comfort. As a Fixed Earth sign ruled by Venus, Taurus values security, sensual pleasures, and the finer things in life. Taurus natives build lasting foundations through steady, persistent effort.',
    mysticalProperties:
      'reliability, practicality, and determination. Influences matters of finance, comfort, and physical pleasures.',
    loveTrait:
      'Taurus loves deeply and loyally, seeking partners who offer security and sensual connection. They express love through physical affection and creating comfortable environments.',
    careerTrait:
      'Taurus excels in finance, arts, culinary fields, and any career requiring patience and attention to quality. They build lasting success through steady effort.',
    affirmation: 'I build lasting abundance through patience and devotion.',
  },
  gemini: {
    name: 'Gemini',
    dates: 'May 21 - June 20',
    symbol: '♊',
    element: 'Air',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    keywords: [
      'Communication',
      'Curiosity',
      'Adaptability',
      'Intelligence',
      'Wit',
      'Versatility',
    ],
    strengths: [
      'Gentle',
      'Affectionate',
      'Curious',
      'Adaptable',
      'Quick learner',
      'Witty',
    ],
    weaknesses: [
      'Nervous',
      'Inconsistent',
      'Indecisive',
      'Superficial',
      'Restless',
    ],
    bestMatches: ['Libra', 'Aquarius', 'Aries', 'Leo'],
    challengingMatches: ['Virgo', 'Pisces'],
    description:
      "Gemini is the communicator of the zodiac, bringing intellectual curiosity, adaptability, and social charm. As a Mutable Air sign ruled by Mercury, Gemini represents the mind's ability to process and share information. Gemini natives are versatile, expressive, and endlessly curious.",
    mysticalProperties:
      'Associated with communication, intellectual curiosity, and versatility. Represents dual nature and adaptability.',
    loveTrait:
      'Gemini loves through mental connection and variety. They need partners who stimulate their minds and can keep up with their ever-changing interests.',
    careerTrait:
      'Gemini excels in media, writing, teaching, sales, and any field requiring communication and adaptability. They thrive on variety and intellectual challenge.',
    affirmation: 'I embrace curiosity and express myself with clarity and wit.',
  },
  cancer: {
    name: 'Cancer',
    dates: 'June 21 - July 22',
    symbol: '♋',
    element: 'Water',
    modality: 'Cardinal',
    rulingPlanet: 'Moon',
    keywords: [
      'Nurturing',
      'Intuition',
      'Emotion',
      'Home',
      'Protection',
      'Memory',
    ],
    strengths: [
      'Tenacious',
      'Highly imaginative',
      'Loyal',
      'Emotional',
      'Sympathetic',
      'Persuasive',
    ],
    weaknesses: [
      'Moody',
      'Pessimistic',
      'Suspicious',
      'Manipulative',
      'Insecure',
    ],
    bestMatches: ['Scorpio', 'Pisces', 'Taurus', 'Virgo'],
    challengingMatches: ['Aries', 'Libra'],
    description:
      'Cancer is the nurturer of the zodiac, bringing emotional depth, intuition, and protective care. As a Cardinal Water sign ruled by the Moon, Cancer represents the realm of feelings, home, and family. Cancer natives create safe havens and form deep emotional bonds.',
    mysticalProperties:
      'Emphasizes emotion, nurturing, and intuition. Rules home and family, focuses on caring and protective traits.',
    loveTrait:
      'Cancer loves deeply and protectively, seeking partners who value home and emotional security. They express love through nurturing and creating comfortable spaces.',
    careerTrait:
      'Cancer excels in caregiving, hospitality, real estate, and creative fields. They bring emotional intelligence and protective instincts to their work.',
    affirmation: 'I nurture with love and trust my intuitive wisdom.',
  },
  leo: {
    name: 'Leo',
    dates: 'July 23 - August 22',
    symbol: '♌',
    element: 'Fire',
    modality: 'Fixed',
    rulingPlanet: 'Sun',
    keywords: [
      'Creativity',
      'Confidence',
      'Generosity',
      'Leadership',
      'Drama',
      'Warmth',
    ],
    strengths: [
      'Creative',
      'Passionate',
      'Generous',
      'Warm-hearted',
      'Cheerful',
      'Humorous',
    ],
    weaknesses: ['Arrogant', 'Stubborn', 'Self-centered', 'Lazy', 'Inflexible'],
    bestMatches: ['Aries', 'Sagittarius', 'Gemini', 'Libra'],
    challengingMatches: ['Taurus', 'Scorpio'],
    description:
      'Leo is the performer of the zodiac, bringing creativity, confidence, and generous warmth. As a Fixed Fire sign ruled by the Sun, Leo represents self-expression, leadership, and the joy of being alive. Leo natives shine brightly and inspire others with their radiant energy.',
    mysticalProperties:
      'Governs self-confidence, creativity, and drama. Symbolizes leadership, pride, and theatrical traits.',
    loveTrait:
      'Leo loves grandly and loyally, seeking partners who appreciate their warmth and can share the spotlight. They express love through grand gestures and devoted attention.',
    careerTrait:
      'Leo excels in entertainment, leadership, creative arts, and any role that allows them to shine. They naturally inspire and motivate others.',
    affirmation: 'I shine my light confidently and inspire others with joy.',
  },
  virgo: {
    name: 'Virgo',
    dates: 'August 23 - September 22',
    symbol: '♍',
    element: 'Earth',
    modality: 'Mutable',
    rulingPlanet: 'Mercury',
    keywords: [
      'Analysis',
      'Service',
      'Precision',
      'Health',
      'Improvement',
      'Practicality',
    ],
    strengths: [
      'Loyal',
      'Analytical',
      'Kind',
      'Hardworking',
      'Practical',
      'Helpful',
    ],
    weaknesses: [
      'Shy',
      'Worry',
      'Overly critical',
      'All work no play',
      'Perfectionist',
    ],
    bestMatches: ['Taurus', 'Capricorn', 'Cancer', 'Scorpio'],
    challengingMatches: ['Gemini', 'Sagittarius'],
    description:
      'Virgo is the analyst of the zodiac, bringing precision, helpfulness, and dedication to improvement. As a Mutable Earth sign ruled by Mercury, Virgo represents the practical application of intelligence. Virgo natives serve others through careful attention to detail and continuous refinement.',
    mysticalProperties:
      'Represents practicality, analytical abilities, and attention to detail. Associated with service, meticulousness, and modesty.',
    loveTrait:
      'Virgo loves through service and practical care. They seek partners who appreciate their thoughtfulness and share their values of improvement and health.',
    careerTrait:
      'Virgo excels in healthcare, editing, analysis, research, and any field requiring precision. They bring meticulous care and practical solutions.',
    affirmation:
      'I serve with excellence and embrace healthy self-improvement.',
  },
  libra: {
    name: 'Libra',
    dates: 'September 23 - October 22',
    symbol: '♎',
    element: 'Air',
    modality: 'Cardinal',
    rulingPlanet: 'Venus',
    keywords: [
      'Balance',
      'Harmony',
      'Partnership',
      'Justice',
      'Beauty',
      'Diplomacy',
    ],
    strengths: [
      'Cooperative',
      'Diplomatic',
      'Gracious',
      'Fair-minded',
      'Social',
      'Charming',
    ],
    weaknesses: [
      'Indecisive',
      'Avoids confrontations',
      'Self-pity',
      'People-pleasing',
      'Unreliable',
    ],
    bestMatches: ['Gemini', 'Aquarius', 'Leo', 'Sagittarius'],
    challengingMatches: ['Cancer', 'Capricorn'],
    description:
      'Libra is the harmonizer of the zodiac, bringing balance, beauty, and a gift for partnership. As a Cardinal Air sign ruled by Venus, Libra represents the pursuit of fairness, aesthetics, and relationship. Libra natives create beauty and balance wherever they go.',
    mysticalProperties:
      'Rules balance, harmony, and partnerships. Focused on justice, diplomacy, and relationships.',
    loveTrait:
      'Libra loves through partnership and harmony. They seek relationships of equality and beauty, expressing love through romantic gestures and attentive partnership.',
    careerTrait:
      'Libra excels in law, diplomacy, arts, design, and any field requiring balance and beauty. They bring fairness and aesthetic sensibility.',
    affirmation: 'I create harmony and beauty in all my relationships.',
  },
  scorpio: {
    name: 'Scorpio',
    dates: 'October 23 - November 21',
    symbol: '♏',
    element: 'Water',
    modality: 'Fixed',
    rulingPlanet: 'Pluto',
    keywords: [
      'Intensity',
      'Transformation',
      'Power',
      'Passion',
      'Mystery',
      'Depth',
    ],
    strengths: [
      'Resourceful',
      'Brave',
      'Passionate',
      'Stubborn',
      'Loyal',
      'Strategic',
    ],
    weaknesses: [
      'Distrusting',
      'Jealous',
      'Secretive',
      'Violent',
      'Manipulative',
    ],
    bestMatches: ['Cancer', 'Pisces', 'Virgo', 'Capricorn'],
    challengingMatches: ['Leo', 'Aquarius'],
    description:
      'Scorpio is the transformer of the zodiac, bringing intensity, depth, and the power of regeneration. As a Fixed Water sign ruled by Pluto, Scorpio represents the hidden depths, psychological insight, and the cycle of death and rebirth. Scorpio natives probe beneath surfaces to discover truth.',
    mysticalProperties:
      'transformation, mystery, and intensity. Influences themes of sexuality, death, and rebirth.',
    loveTrait:
      'Scorpio loves with total intensity and devotion. They seek deep, transformative connections and express love through passionate loyalty and emotional depth.',
    careerTrait:
      'Scorpio excels in psychology, investigation, healing, and any field requiring depth and strategy. They bring transformative power to their work.',
    affirmation: 'I embrace transformation and the power of emotional depth.',
  },
  sagittarius: {
    name: 'Sagittarius',
    dates: 'November 22 - December 21',
    symbol: '♐',
    element: 'Fire',
    modality: 'Mutable',
    rulingPlanet: 'Jupiter',
    keywords: [
      'Adventure',
      'Philosophy',
      'Freedom',
      'Optimism',
      'Exploration',
      'Truth',
    ],
    strengths: [
      'Generous',
      'Idealistic',
      'Great sense of humor',
      'Adventurous',
      'Philosophical',
    ],
    weaknesses: [
      'Impatient',
      'Promises more than can deliver',
      'Tactless',
      'Restless',
      'Irresponsible',
    ],
    bestMatches: ['Aries', 'Leo', 'Libra', 'Aquarius'],
    challengingMatches: ['Virgo', 'Pisces'],
    description:
      'Sagittarius is the explorer of the zodiac, bringing optimism, adventure, and a quest for meaning. As a Mutable Fire sign ruled by Jupiter, Sagittarius represents expansion, higher learning, and the search for truth. Sagittarius natives seek wisdom through experience and adventure.',
    mysticalProperties:
      'Associated with exploration, freedom, and philosophy. Represents optimism, love for freedom, and adventurous spirit.',
    loveTrait:
      'Sagittarius loves with freedom and adventure. They seek partners who share their love of exploration and can give them space to grow.',
    careerTrait:
      'Sagittarius excels in travel, education, publishing, and philosophy. They bring optimism and expansive vision to their work.',
    affirmation: 'I explore life with optimism and seek truth in all things.',
  },
  capricorn: {
    name: 'Capricorn',
    dates: 'December 22 - January 19',
    symbol: '♑',
    element: 'Earth',
    modality: 'Cardinal',
    rulingPlanet: 'Saturn',
    keywords: [
      'Ambition',
      'Discipline',
      'Responsibility',
      'Structure',
      'Achievement',
      'Mastery',
    ],
    strengths: [
      'Responsible',
      'Disciplined',
      'Self-control',
      'Good managers',
      'Ambitious',
      'Patient',
    ],
    weaknesses: [
      'Know-it-all',
      'Unforgiving',
      'Condescending',
      'Expecting the worst',
      'Pessimistic',
    ],
    bestMatches: ['Taurus', 'Virgo', 'Scorpio', 'Pisces'],
    challengingMatches: ['Aries', 'Libra'],
    description:
      'Capricorn is the achiever of the zodiac, bringing discipline, ambition, and the determination to reach the top. As a Cardinal Earth sign ruled by Saturn, Capricorn represents mastery, structure, and the patient climb to success. Capricorn natives build lasting legacies through persistent effort.',
    mysticalProperties:
      'Emphasizes discipline, structure, and ambition. Rules career, determination, and careful planning.',
    loveTrait:
      'Capricorn loves with loyalty and long-term commitment. They seek partners who share their values of stability and are willing to build together.',
    careerTrait:
      'Capricorn excels in management, government, finance, and any field requiring discipline. They naturally climb to positions of authority.',
    affirmation:
      'I achieve my goals through discipline and patient determination.',
  },
  aquarius: {
    name: 'Aquarius',
    dates: 'January 20 - February 18',
    symbol: '♒',
    element: 'Air',
    modality: 'Fixed',
    rulingPlanet: 'Uranus',
    keywords: [
      'Innovation',
      'Individuality',
      'Humanitarianism',
      'Rebellion',
      'Progress',
      'Vision',
    ],
    strengths: [
      'Progressive',
      'Original',
      'Independent',
      'Humanitarian',
      'Intellectual',
      'Inventive',
    ],
    weaknesses: [
      'Runs from emotional expression',
      'Temperamental',
      'Uncompromising',
      'Aloof',
      'Detached',
    ],
    bestMatches: ['Gemini', 'Libra', 'Aries', 'Sagittarius'],
    challengingMatches: ['Taurus', 'Scorpio'],
    description:
      'Aquarius is the visionary of the zodiac, bringing innovation, individuality, and humanitarian ideals. As a Fixed Air sign ruled by Uranus, Aquarius represents progress, revolution, and the advancement of humanity. Aquarius natives see beyond convention to imagine better futures.',
    mysticalProperties:
      'Represents innovation, individuality, and humanitarianism. Focuses on unconventional thinking, community, and idealism.',
    loveTrait:
      'Aquarius loves through friendship and intellectual connection. They seek partners who respect their independence and share their progressive ideals.',
    careerTrait:
      'Aquarius excels in technology, science, social causes, and innovation. They bring revolutionary thinking and humanitarian vision.',
    affirmation: 'I embrace my uniqueness and work for the good of humanity.',
  },
  pisces: {
    name: 'Pisces',
    dates: 'February 19 - March 20',
    symbol: '♓',
    element: 'Water',
    modality: 'Mutable',
    rulingPlanet: 'Neptune',
    keywords: [
      'Intuition',
      'Compassion',
      'Creativity',
      'Spirituality',
      'Empathy',
      'Dreams',
    ],
    strengths: [
      'Compassionate',
      'Artistic',
      'Intuitive',
      'Gentle',
      'Wise',
      'Musical',
    ],
    weaknesses: [
      'Fearful',
      'Overly trusting',
      'Sad',
      'Desire to escape reality',
      'Victim mentality',
    ],
    bestMatches: ['Cancer', 'Scorpio', 'Taurus', 'Capricorn'],
    challengingMatches: ['Gemini', 'Sagittarius'],
    description:
      'Pisces is the mystic of the zodiac, bringing compassion, creativity, and spiritual depth. As a Mutable Water sign ruled by Neptune, Pisces represents the dissolution of boundaries, artistic inspiration, and connection to the divine. Pisces natives feel deeply and create beauty from their inner visions.',
    mysticalProperties:
      'empathy, compassion, and intuition. Associated with mysticism, spirituality, and sensitivity.',
    loveTrait:
      'Pisces loves with unconditional compassion and romantic idealism. They seek soulmate connections and express love through artistic gestures and emotional attunement.',
    careerTrait:
      'Pisces excels in arts, healing, spirituality, and creative fields. They bring imagination and compassion to their work.',
    affirmation: 'I flow with compassion and trust my intuitive creativity.',
  },
};

export const astrologicalPoints = {
  ascendant: {
    name: 'Rising',
    alias: 'Ascendant',
    mysticalProperties:
      'Your outer personality and first impression. How others perceive you and how you approach new situations.',
  },
  descendant: {
    name: 'Descendant',
    alias: 'DC',
    mysticalProperties:
      'Your partnerships, close relationships, and what you project onto others. It reveals your approach to committed one-on-one dynamics.',
  },
  midheaven: {
    name: 'Midheaven',
    alias: 'MC',
    mysticalProperties:
      'Your career path, public image, and life direction. How you want to be seen by the world.',
  },
  northnode: {
    name: 'North Node',
    alias: "Dragon's Head",
    mysticalProperties:
      "Your soul's purpose and destiny. The lessons you're meant to learn and the direction of growth.",
  },
  southnode: {
    name: 'South Node',
    alias: "Dragon's Tail",
    mysticalProperties:
      'Your past life karma and innate talents. What comes naturally but may hold you back if overused.',
  },
  chiron: {
    name: 'Chiron',
    alias: 'The Wounded Healer',
    mysticalProperties:
      'Your deepest wound and greatest healing gift. Where you can help others through your own struggles.',
  },
  lilith: {
    name: 'Lilith',
    alias: 'Black Moon Lilith',
    mysticalProperties:
      'Your shadow self and suppressed desires. Raw, untamed feminine energy and hidden power.',
  },
};

export const houseThemes: Record<
  number,
  { name: string; theme: string; keywords: string[] }
> = {
  1: {
    name: 'First House',
    theme: 'Self & Identity',
    keywords: [
      'appearance',
      'personality',
      'self-expression',
      'first impressions',
    ],
  },
  2: {
    name: 'Second House',
    theme: 'Values & Resources',
    keywords: ['money', 'possessions', 'self-worth', 'material security'],
  },
  3: {
    name: 'Third House',
    theme: 'Communication & Mind',
    keywords: ['siblings', 'short trips', 'learning', 'writing', 'neighbors'],
  },
  4: {
    name: 'Fourth House',
    theme: 'Home & Roots',
    keywords: ['family', 'ancestry', 'private life', 'emotional foundation'],
  },
  5: {
    name: 'Fifth House',
    theme: 'Creativity & Joy',
    keywords: ['romance', 'children', 'play', 'self-expression', 'hobbies'],
  },
  6: {
    name: 'Sixth House',
    theme: 'Health & Service',
    keywords: ['daily routines', 'work', 'health habits', 'pets', 'duty'],
  },
  7: {
    name: 'Seventh House',
    theme: 'Partnerships',
    keywords: ['marriage', 'business partners', 'contracts', 'open enemies'],
  },
  8: {
    name: 'Eighth House',
    theme: 'Transformation',
    keywords: ['shared resources', 'intimacy', 'death', 'rebirth', 'occult'],
  },
  9: {
    name: 'Ninth House',
    theme: 'Philosophy & Travel',
    keywords: ['higher education', 'long journeys', 'beliefs', 'publishing'],
  },
  10: {
    name: 'Tenth House',
    theme: 'Career & Status',
    keywords: ['public image', 'achievements', 'authority', 'reputation'],
  },
  11: {
    name: 'Eleventh House',
    theme: 'Community & Dreams',
    keywords: ['friendships', 'groups', 'hopes', 'humanitarian goals'],
  },
  12: {
    name: 'Twelfth House',
    theme: 'Spirituality & Hidden',
    keywords: ['subconscious', 'isolation', 'dreams', 'secrets', 'karma'],
  },
};
