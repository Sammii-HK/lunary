/**
 * Grimoire Query Analyzer
 *
 * Intelligently detects what grimoire data is needed based on user query.
 * Optimizes context by only loading relevant data.
 */

export interface QueryContext {
  // Core data (always included)
  needsCrystals: boolean;
  needsSpells: boolean;
  needsNumerology: boolean;

  // Extended data (conditional)
  needsAspects: boolean;
  needsRetrogrades: boolean;
  needsEclipses: boolean;
  needsSabbats: boolean;
  needsTarot: boolean;
  needsRunes: boolean;
  needsLunarNodes: boolean;
  needsSynastry: boolean;
  needsDecans: boolean;
  needsWitchTypes: boolean;
  needsDivination: boolean;
  needsMeditation: boolean;
  needsPlanetaryDay: boolean;

  // Suggestions (low-priority additions)
  suggestTarot: boolean;
  suggestRunes: boolean;
  suggestDivination: boolean;
  suggestSabbat: boolean;
}

/**
 * Analyze user query to determine what grimoire data is needed
 */
export function analyzeQuery(
  userMessage: string,
  hasNatalChart: boolean = false,
  hasBirthday: boolean = false,
): QueryContext {
  const lowerMessage = userMessage.toLowerCase();

  // Keywords for detection
  const crystalKeywords = [
    'crystal',
    'stone',
    'gem',
    'chakra',
    'grounding',
    'protection',
  ];
  const spellKeywords = [
    'spell',
    'ritual',
    'ceremony',
    'magic',
    'cast',
    'brew',
  ];
  const numerologyKeywords = [
    'number',
    'numerology',
    'angel number',
    'life path',
    'karmic',
  ];
  const aspectKeywords = [
    'aspect',
    'square',
    'trine',
    'opposition',
    'conjunction',
    'sextile',
  ];
  const retrogradeKeywords = ['retrograde', 'rx', 'backward'];
  const eclipseKeywords = ['eclipse', 'solar eclipse', 'lunar eclipse'];
  const sabbatKeywords = [
    'sabbat',
    'samhain',
    'yule',
    'imbolc',
    'ostara',
    'beltane',
    'litha',
    'lughnasadh',
    'mabon',
    'wheel of the year',
  ];
  const tarotKeywords = [
    'tarot',
    'card',
    'major arcana',
    'minor arcana',
    'wands',
    'cups',
    'swords',
    'pentacles',
  ];
  const runeKeywords = [
    'rune',
    'futhark',
    'fehu',
    'uruz',
    'thurisaz',
    'norse',
    'viking',
  ];
  const nodeKeywords = [
    'node',
    'north node',
    'south node',
    'lunar node',
    'destiny',
    'karma',
    'past life',
  ];
  const synastryKeywords = [
    'compatibility',
    'relationship',
    'synastry',
    'partner',
    'love',
    'romance',
    'marriage',
    'dating',
  ];
  const decanKeywords = ['decan', 'degree', 'subdivision'];
  const witchTypeKeywords = [
    'witch type',
    'path',
    'practice',
    'green witch',
    'cosmic witch',
    'kitchen witch',
  ];
  const divinationKeywords = [
    'divination',
    'scrying',
    'pendulum',
    'oracle',
    'psychic',
    'intuition',
    'dream',
  ];
  const meditationKeywords = [
    'meditation',
    'meditate',
    'breathwork',
    'grounding',
    'mindfulness',
  ];

  const hasKeyword = (keywords: string[]) =>
    keywords.some((kw) => lowerMessage.includes(kw));

  return {
    // Core data - include if directly mentioned or if no specific request
    needsCrystals:
      hasKeyword(crystalKeywords) ||
      !hasKeyword([...spellKeywords, ...tarotKeywords, ...runeKeywords]),
    needsSpells: hasKeyword(spellKeywords),
    needsNumerology:
      hasKeyword(numerologyKeywords) ||
      (hasBirthday && lowerMessage.includes('meaning')),

    // Extended data - only include if relevant
    needsAspects: hasKeyword(aspectKeywords) || hasNatalChart,
    needsRetrogrades: hasKeyword(retrogradeKeywords),
    needsEclipses: hasKeyword(eclipseKeywords),
    needsSabbats:
      hasKeyword(sabbatKeywords) || lowerMessage.includes('seasonal'),
    needsTarot: hasKeyword(tarotKeywords),
    needsRunes: hasKeyword(runeKeywords),
    needsLunarNodes:
      hasKeyword(nodeKeywords) || lowerMessage.includes('purpose'),
    needsSynastry: hasKeyword(synastryKeywords),
    needsDecans: hasKeyword(decanKeywords),
    needsWitchTypes: hasKeyword(witchTypeKeywords),
    needsDivination: hasKeyword(divinationKeywords),
    needsMeditation: hasKeyword(meditationKeywords),
    needsPlanetaryDay:
      lowerMessage.includes('today') || lowerMessage.includes('right now'),

    // Suggestions - offer when relevant but not explicitly asked
    suggestTarot:
      !hasKeyword(tarotKeywords) &&
      (hasKeyword(['guidance', 'insight', 'message']) ||
        lowerMessage.includes('what should')),
    suggestRunes:
      !hasKeyword(runeKeywords) &&
      hasKeyword(['guidance', 'divination', 'oracle']),
    suggestDivination:
      !hasKeyword(divinationKeywords) &&
      hasKeyword(['psychic', 'intuitive', 'insight']),
    suggestSabbat:
      !hasKeyword(sabbatKeywords) &&
      hasKeyword(['ritual', 'ceremony', 'seasonal']),
  };
}

/**
 * Determine if query is about relationships (synastry)
 */
export function isRelationshipQuery(userMessage: string): boolean {
  const relationshipKeywords = [
    'compatibility',
    'relationship',
    'partner',
    'boyfriend',
    'girlfriend',
    'husband',
    'wife',
    'spouse',
    'crush',
    'dating',
    'love',
    'romance',
    'marriage',
    'synastry',
  ];

  const lowerMessage = userMessage.toLowerCase();
  return relationshipKeywords.some((kw) => lowerMessage.includes(kw));
}

/**
 * Detect if query involves specific astrological placements
 */
export function detectAstrologicalFocus(userMessage: string): {
  planets: string[];
  signs: string[];
  houses: string[];
} {
  const lowerMessage = userMessage.toLowerCase();

  const planets = [
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
  ].filter((planet) => lowerMessage.includes(planet));

  const signs = [
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
  ].filter((sign) => lowerMessage.includes(sign));

  const houses: string[] = [];
  for (let i = 1; i <= 12; i++) {
    if (
      lowerMessage.includes(`${i}th house`) ||
      lowerMessage.includes(`${i} house`)
    ) {
      houses.push(i.toString());
    }
  }

  return { planets, signs, houses };
}

/**
 * Determine optimal context requirements based on query analysis
 */
export function getContextRequirements(
  userMessage: string,
  hasNatalChart: boolean = false,
  hasBirthday: boolean = false,
): {
  needsPersonalTransits: boolean;
  needsNatalPatterns: boolean;
  needsPlanetaryReturns: boolean;
  needsProgressedChart: boolean;
  needsEclipses: boolean;
} {
  const lowerMessage = userMessage.toLowerCase();
  const queryContext = analyzeQuery(userMessage, hasNatalChart, hasBirthday);

  return {
    // Only calculate personal transits if query is about current energies
    needsPersonalTransits:
      lowerMessage.includes('transit') ||
      lowerMessage.includes('current') ||
      lowerMessage.includes('now') ||
      lowerMessage.includes('today') ||
      queryContext.needsRetrogrades,

    // Only detect natal patterns if query is about birth chart or patterns
    needsNatalPatterns:
      hasNatalChart &&
      (lowerMessage.includes('natal') ||
        lowerMessage.includes('birth chart') ||
        lowerMessage.includes('pattern') ||
        queryContext.needsAspects),

    // Only calculate returns if query mentions age, birthday, or return
    needsPlanetaryReturns:
      hasBirthday &&
      (lowerMessage.includes('return') ||
        lowerMessage.includes('birthday') ||
        lowerMessage.includes('saturn') ||
        lowerMessage.includes('jupiter')),

    // Only calculate progressed chart if explicitly mentioned
    needsProgressedChart:
      lowerMessage.includes('progressed') ||
      lowerMessage.includes('progression'),

    // Only get eclipses if mentioned or asking about major events
    needsEclipses:
      queryContext.needsEclipses ||
      lowerMessage.includes('major event') ||
      lowerMessage.includes('turning point'),
  };
}
