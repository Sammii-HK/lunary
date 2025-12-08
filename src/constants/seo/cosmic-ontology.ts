/**
 * Cosmic Ontology - Complete knowledge graph for SEO Entity Recognition
 * This file defines explicit semantic relationships between all cosmic entities
 * to help Google understand Lunary as the authoritative source for astrology knowledge.
 */

// ============================================================================
// ASPECTS - Geometric relationships between planets
// ============================================================================
export interface AspectDefinition {
  name: string;
  angle: number;
  orb: number;
  nature: 'harmonious' | 'challenging' | 'neutral';
  keywords: string[];
  description: string;
}

export const ASPECTS: Record<string, AspectDefinition> = {
  conjunction: {
    name: 'Conjunction',
    angle: 0,
    orb: 8,
    nature: 'neutral',
    keywords: ['fusion', 'intensity', 'focus', 'blending'],
    description:
      'Two planets at the same degree, merging their energies into one powerful force.',
  },
  sextile: {
    name: 'Sextile',
    angle: 60,
    orb: 4,
    nature: 'harmonious',
    keywords: ['opportunity', 'talent', 'ease', 'flow'],
    description:
      'A gentle, supportive aspect that creates natural talents and opportunities.',
  },
  square: {
    name: 'Square',
    angle: 90,
    orb: 8,
    nature: 'challenging',
    keywords: ['tension', 'conflict', 'growth', 'action'],
    description:
      'A dynamic aspect that creates friction, pushing for change and growth.',
  },
  trine: {
    name: 'Trine',
    angle: 120,
    orb: 8,
    nature: 'harmonious',
    keywords: ['harmony', 'flow', 'gifts', 'ease'],
    description:
      'The most harmonious aspect, indicating natural gifts and easy flow of energy.',
  },
  opposition: {
    name: 'Opposition',
    angle: 180,
    orb: 8,
    nature: 'challenging',
    keywords: ['polarity', 'awareness', 'balance', 'relationship'],
    description:
      'Creates awareness through contrast and the need to balance opposing forces.',
  },
  quincunx: {
    name: 'Quincunx',
    angle: 150,
    orb: 3,
    nature: 'challenging',
    keywords: ['adjustment', 'discomfort', 'growth', 'integration'],
    description:
      'An awkward aspect requiring constant adjustment between incompatible energies.',
  },
  semisextile: {
    name: 'Semi-Sextile',
    angle: 30,
    orb: 2,
    nature: 'neutral',
    keywords: ['subtle', 'growth', 'awareness', 'connection'],
    description: 'A subtle aspect creating awareness between adjacent signs.',
  },
};

// ============================================================================
// HOUSES - The 12 areas of life
// ============================================================================
export interface HouseDefinition {
  number: number;
  name: string;
  naturalSign: string;
  naturalRuler: string;
  keywords: string[];
  lifeDomain: string;
  description: string;
}

export const HOUSES: Record<number, HouseDefinition> = {
  1: {
    number: 1,
    name: 'First House',
    naturalSign: 'Aries',
    naturalRuler: 'Mars',
    keywords: ['self', 'identity', 'appearance', 'beginnings'],
    lifeDomain: 'Self & Identity',
    description:
      'The house of self, representing your identity, physical appearance, and how you present yourself to the world.',
  },
  2: {
    number: 2,
    name: 'Second House',
    naturalSign: 'Taurus',
    naturalRuler: 'Venus',
    keywords: ['money', 'values', 'possessions', 'self-worth'],
    lifeDomain: 'Resources & Values',
    description:
      'The house of resources, covering money, possessions, personal values, and self-worth.',
  },
  3: {
    number: 3,
    name: 'Third House',
    naturalSign: 'Gemini',
    naturalRuler: 'Mercury',
    keywords: ['communication', 'siblings', 'learning', 'short trips'],
    lifeDomain: 'Communication & Learning',
    description:
      'The house of communication, covering daily interactions, siblings, short trips, and early education.',
  },
  4: {
    number: 4,
    name: 'Fourth House',
    naturalSign: 'Cancer',
    naturalRuler: 'Moon',
    keywords: ['home', 'family', 'roots', 'foundation'],
    lifeDomain: 'Home & Family',
    description:
      'The house of home, representing family, roots, emotional foundation, and private life.',
  },
  5: {
    number: 5,
    name: 'Fifth House',
    naturalSign: 'Leo',
    naturalRuler: 'Sun',
    keywords: ['creativity', 'romance', 'children', 'pleasure'],
    lifeDomain: 'Creativity & Joy',
    description:
      'The house of creativity, covering romance, children, artistic expression, and pleasure.',
  },
  6: {
    number: 6,
    name: 'Sixth House',
    naturalSign: 'Virgo',
    naturalRuler: 'Mercury',
    keywords: ['health', 'work', 'service', 'routines'],
    lifeDomain: 'Health & Service',
    description:
      'The house of health and service, covering daily work, routines, health habits, and service to others.',
  },
  7: {
    number: 7,
    name: 'Seventh House',
    naturalSign: 'Libra',
    naturalRuler: 'Venus',
    keywords: ['partnerships', 'marriage', 'contracts', 'others'],
    lifeDomain: 'Relationships & Partnerships',
    description:
      'The house of partnerships, covering marriage, business partners, and one-on-one relationships.',
  },
  8: {
    number: 8,
    name: 'Eighth House',
    naturalSign: 'Scorpio',
    naturalRuler: 'Pluto',
    keywords: ['transformation', 'intimacy', 'shared resources', 'death'],
    lifeDomain: 'Transformation & Shared Resources',
    description:
      'The house of transformation, covering intimacy, shared resources, inheritance, and psychological depth.',
  },
  9: {
    number: 9,
    name: 'Ninth House',
    naturalSign: 'Sagittarius',
    naturalRuler: 'Jupiter',
    keywords: ['philosophy', 'travel', 'higher education', 'beliefs'],
    lifeDomain: 'Philosophy & Expansion',
    description:
      'The house of expansion, covering higher education, long-distance travel, philosophy, and beliefs.',
  },
  10: {
    number: 10,
    name: 'Tenth House',
    naturalSign: 'Capricorn',
    naturalRuler: 'Saturn',
    keywords: ['career', 'reputation', 'authority', 'public image'],
    lifeDomain: 'Career & Public Life',
    description:
      'The house of career, covering profession, public reputation, authority, and life direction.',
  },
  11: {
    number: 11,
    name: 'Eleventh House',
    naturalSign: 'Aquarius',
    naturalRuler: 'Uranus',
    keywords: ['friends', 'groups', 'hopes', 'humanitarian'],
    lifeDomain: 'Community & Aspirations',
    description:
      'The house of community, covering friendships, groups, social causes, and hopes for the future.',
  },
  12: {
    number: 12,
    name: 'Twelfth House',
    naturalSign: 'Pisces',
    naturalRuler: 'Neptune',
    keywords: ['unconscious', 'spirituality', 'isolation', 'transcendence'],
    lifeDomain: 'Spirituality & the Unconscious',
    description:
      'The house of the unconscious, covering spirituality, hidden matters, karma, and transcendence.',
  },
};

// ============================================================================
// MODALITIES - Cardinal, Fixed, Mutable
// ============================================================================
export interface ModalityDefinition {
  name: string;
  signs: string[];
  quality: string;
  keywords: string[];
  description: string;
}

export const MODALITIES: Record<string, ModalityDefinition> = {
  cardinal: {
    name: 'Cardinal',
    signs: ['Aries', 'Cancer', 'Libra', 'Capricorn'],
    quality: 'Initiating',
    keywords: ['leadership', 'action', 'beginnings', 'initiative'],
    description:
      'Cardinal signs initiate action and lead the way. They mark the beginning of each season and are natural starters.',
  },
  fixed: {
    name: 'Fixed',
    signs: ['Taurus', 'Leo', 'Scorpio', 'Aquarius'],
    quality: 'Stabilizing',
    keywords: ['persistence', 'determination', 'stability', 'focus'],
    description:
      'Fixed signs maintain and stabilize. They occur in the middle of each season and are known for their persistence.',
  },
  mutable: {
    name: 'Mutable',
    signs: ['Gemini', 'Virgo', 'Sagittarius', 'Pisces'],
    quality: 'Adapting',
    keywords: ['flexibility', 'change', 'adaptability', 'transition'],
    description:
      'Mutable signs adapt and transform. They mark the end of each season and are known for their flexibility.',
  },
};

// ============================================================================
// ELEMENTS - Fire, Earth, Air, Water
// ============================================================================
export interface ElementDefinition {
  name: string;
  signs: string[];
  quality: string;
  keywords: string[];
  crystals: string[];
  tarotSuit: string;
  description: string;
}

export const ELEMENTS: Record<string, ElementDefinition> = {
  fire: {
    name: 'Fire',
    signs: ['Aries', 'Leo', 'Sagittarius'],
    quality: 'Hot and Dry',
    keywords: ['passion', 'energy', 'enthusiasm', 'inspiration'],
    crystals: ['Carnelian', 'Citrine', 'Fire Agate', 'Sunstone'],
    tarotSuit: 'Wands',
    description:
      'Fire signs are passionate, dynamic, and temperamental. They are spontaneous, intuitive, and driven by inspiration.',
  },
  earth: {
    name: 'Earth',
    signs: ['Taurus', 'Virgo', 'Capricorn'],
    quality: 'Cold and Dry',
    keywords: ['practical', 'grounded', 'reliable', 'sensual'],
    crystals: ['Jade', 'Moss Agate', 'Petrified Wood', 'Black Tourmaline'],
    tarotSuit: 'Pentacles',
    description:
      'Earth signs are grounded, practical, and reliable. They value stability, material security, and tangible results.',
  },
  air: {
    name: 'Air',
    signs: ['Gemini', 'Libra', 'Aquarius'],
    quality: 'Hot and Wet',
    keywords: ['intellect', 'communication', 'ideas', 'social'],
    crystals: ['Clear Quartz', 'Amethyst', 'Blue Lace Agate', 'Fluorite'],
    tarotSuit: 'Swords',
    description:
      'Air signs are intellectual, communicative, and social. They live in the world of ideas, analysis, and communication.',
  },
  water: {
    name: 'Water',
    signs: ['Cancer', 'Scorpio', 'Pisces'],
    quality: 'Cold and Wet',
    keywords: ['emotion', 'intuition', 'sensitivity', 'depth'],
    crystals: ['Moonstone', 'Aquamarine', 'Pearl', 'Blue Lace Agate'],
    tarotSuit: 'Cups',
    description:
      'Water signs are emotional, intuitive, and deeply sensitive. They navigate life through feelings and psychic impressions.',
  },
};

// ============================================================================
// TAROT-ASTROLOGY CORRESPONDENCES
// ============================================================================
export interface TarotAstrologyCorrespondence {
  card: string;
  cardUrl: string;
  planet?: string;
  sign?: string;
  element?: string;
  keywords: string[];
}

export const MAJOR_ARCANA_CORRESPONDENCES: TarotAstrologyCorrespondence[] = [
  {
    card: 'The Fool',
    cardUrl: '/grimoire/tarot/the-fool',
    planet: 'Uranus',
    element: 'Air',
    keywords: ['beginnings', 'innocence', 'spontaneity'],
  },
  {
    card: 'The Magician',
    cardUrl: '/grimoire/tarot/the-magician',
    planet: 'Mercury',
    keywords: ['manifestation', 'power', 'action'],
  },
  {
    card: 'The High Priestess',
    cardUrl: '/grimoire/tarot/the-high-priestess',
    planet: 'Moon',
    keywords: ['intuition', 'mystery', 'inner knowledge'],
  },
  {
    card: 'The Empress',
    cardUrl: '/grimoire/tarot/the-empress',
    planet: 'Venus',
    keywords: ['abundance', 'nature', 'nurturing'],
  },
  {
    card: 'The Emperor',
    cardUrl: '/grimoire/tarot/the-emperor',
    sign: 'Aries',
    keywords: ['authority', 'structure', 'leadership'],
  },
  {
    card: 'The Hierophant',
    cardUrl: '/grimoire/tarot/the-hierophant',
    sign: 'Taurus',
    keywords: ['tradition', 'spiritual wisdom', 'conformity'],
  },
  {
    card: 'The Lovers',
    cardUrl: '/grimoire/tarot/the-lovers',
    sign: 'Gemini',
    keywords: ['love', 'choices', 'harmony'],
  },
  {
    card: 'The Chariot',
    cardUrl: '/grimoire/tarot/the-chariot',
    sign: 'Cancer',
    keywords: ['victory', 'willpower', 'determination'],
  },
  {
    card: 'Strength',
    cardUrl: '/grimoire/tarot/strength',
    sign: 'Leo',
    keywords: ['courage', 'patience', 'inner strength'],
  },
  {
    card: 'The Hermit',
    cardUrl: '/grimoire/tarot/the-hermit',
    sign: 'Virgo',
    keywords: ['introspection', 'solitude', 'guidance'],
  },
  {
    card: 'Wheel of Fortune',
    cardUrl: '/grimoire/tarot/wheel-of-fortune',
    planet: 'Jupiter',
    keywords: ['fate', 'cycles', 'turning point'],
  },
  {
    card: 'Justice',
    cardUrl: '/grimoire/tarot/justice',
    sign: 'Libra',
    keywords: ['fairness', 'truth', 'cause and effect'],
  },
  {
    card: 'The Hanged Man',
    cardUrl: '/grimoire/tarot/the-hanged-man',
    planet: 'Neptune',
    element: 'Water',
    keywords: ['surrender', 'new perspective', 'sacrifice'],
  },
  {
    card: 'Death',
    cardUrl: '/grimoire/tarot/death',
    sign: 'Scorpio',
    keywords: ['transformation', 'endings', 'transition'],
  },
  {
    card: 'Temperance',
    cardUrl: '/grimoire/tarot/temperance',
    sign: 'Sagittarius',
    keywords: ['balance', 'moderation', 'patience'],
  },
  {
    card: 'The Devil',
    cardUrl: '/grimoire/tarot/the-devil',
    sign: 'Capricorn',
    keywords: ['bondage', 'materialism', 'shadow self'],
  },
  {
    card: 'The Tower',
    cardUrl: '/grimoire/tarot/the-tower',
    planet: 'Mars',
    keywords: ['upheaval', 'revelation', 'sudden change'],
  },
  {
    card: 'The Star',
    cardUrl: '/grimoire/tarot/the-star',
    sign: 'Aquarius',
    keywords: ['hope', 'inspiration', 'serenity'],
  },
  {
    card: 'The Moon',
    cardUrl: '/grimoire/tarot/the-moon',
    sign: 'Pisces',
    keywords: ['illusion', 'fear', 'subconscious'],
  },
  {
    card: 'The Sun',
    cardUrl: '/grimoire/tarot/the-sun',
    planet: 'Sun',
    keywords: ['joy', 'success', 'vitality'],
  },
  {
    card: 'Judgement',
    cardUrl: '/grimoire/tarot/judgement',
    planet: 'Pluto',
    element: 'Fire',
    keywords: ['rebirth', 'inner calling', 'absolution'],
  },
  {
    card: 'The World',
    cardUrl: '/grimoire/tarot/the-world',
    planet: 'Saturn',
    element: 'Earth',
    keywords: ['completion', 'integration', 'accomplishment'],
  },
];

// ============================================================================
// LUNAR PHASES
// ============================================================================
export interface LunarPhaseDefinition {
  name: string;
  illumination: string;
  energy: string;
  keywords: string[];
  rituals: string[];
  description: string;
}

export const LUNAR_PHASES: Record<string, LunarPhaseDefinition> = {
  newMoon: {
    name: 'New Moon',
    illumination: '0%',
    energy: 'Initiating',
    keywords: ['beginnings', 'intention', 'planting seeds'],
    rituals: ['intention setting', 'manifestation', 'new projects'],
    description:
      'A time for new beginnings, setting intentions, and planting seeds for the future.',
  },
  waxingCrescent: {
    name: 'Waxing Crescent',
    illumination: '1-49%',
    energy: 'Building',
    keywords: ['emergence', 'intention', 'hope'],
    rituals: ['courage spells', 'setting foundations', 'declaring intentions'],
    description:
      'A time for building momentum and taking initial action on your intentions.',
  },
  firstQuarter: {
    name: 'First Quarter',
    illumination: '50%',
    energy: 'Action',
    keywords: ['decision', 'action', 'challenge'],
    rituals: ['overcoming obstacles', 'taking action', 'commitment'],
    description:
      'A time for decisive action and overcoming the first challenges.',
  },
  waxingGibbous: {
    name: 'Waxing Gibbous',
    illumination: '51-99%',
    energy: 'Refining',
    keywords: ['adjustment', 'refinement', 'perfection'],
    rituals: ['refinement', 'analysis', 'patience'],
    description:
      'A time for refinement, adjustment, and fine-tuning your approach.',
  },
  fullMoon: {
    name: 'Full Moon',
    illumination: '100%',
    energy: 'Culmination',
    keywords: ['manifestation', 'completion', 'illumination'],
    rituals: ['gratitude', 'celebration', 'charging crystals', 'release'],
    description: 'A time of culmination, manifestation, and heightened energy.',
  },
  waningGibbous: {
    name: 'Waning Gibbous',
    illumination: '99-51%',
    energy: 'Disseminating',
    keywords: ['sharing', 'gratitude', 'teaching'],
    rituals: ['sharing wisdom', 'gratitude practices', 'giving back'],
    description:
      'A time for sharing what you have learned and expressing gratitude.',
  },
  lastQuarter: {
    name: 'Last Quarter',
    illumination: '50%',
    energy: 'Releasing',
    keywords: ['release', 'forgiveness', 'letting go'],
    rituals: ['release rituals', 'forgiveness', 'clearing'],
    description:
      'A time for releasing what no longer serves you and making space.',
  },
  waningCrescent: {
    name: 'Waning Crescent',
    illumination: '49-1%',
    energy: 'Resting',
    keywords: ['rest', 'surrender', 'preparation'],
    rituals: ['rest', 'meditation', 'dream work', 'preparation'],
    description:
      'A time for rest, reflection, and preparing for the next cycle.',
  },
};

// ============================================================================
// RETROGRADE DEFINITIONS
// ============================================================================
export interface RetrogradeDefinition {
  planet: string;
  frequency: string;
  duration: string;
  themes: string[];
  doList: string[];
  avoidList: string[];
}

export const RETROGRADES: Record<string, RetrogradeDefinition> = {
  mercury: {
    planet: 'Mercury',
    frequency: '3-4 times per year',
    duration: '3 weeks',
    themes: ['communication', 'technology', 'travel', 'contracts'],
    doList: ['review', 'reflect', 'reconnect', 'revise', 'backup data'],
    avoidList: [
      'signing contracts',
      'major purchases',
      'starting new projects',
      'important decisions',
    ],
  },
  venus: {
    planet: 'Venus',
    frequency: 'Every 18 months',
    duration: '6 weeks',
    themes: ['love', 'relationships', 'values', 'beauty', 'finances'],
    doList: [
      'reflect on relationships',
      'reassess values',
      'reconnect with old friends',
    ],
    avoidList: [
      'new relationships',
      'cosmetic procedures',
      'major purchases',
      'wedding dates',
    ],
  },
  mars: {
    planet: 'Mars',
    frequency: 'Every 2 years',
    duration: '2-3 months',
    themes: ['action', 'energy', 'conflict', 'motivation'],
    doList: ['review goals', 'reassess strategies', 'physical rest'],
    avoidList: [
      'starting conflicts',
      'major initiatives',
      'surgery if possible',
    ],
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getElementForSign(sign: string): ElementDefinition | undefined {
  const signLower = sign.toLowerCase();
  for (const [, element] of Object.entries(ELEMENTS)) {
    if (element.signs.map((s) => s.toLowerCase()).includes(signLower)) {
      return element;
    }
  }
  return undefined;
}

export function getModalityForSign(
  sign: string,
): ModalityDefinition | undefined {
  const signLower = sign.toLowerCase();
  for (const [, modality] of Object.entries(MODALITIES)) {
    if (modality.signs.map((s) => s.toLowerCase()).includes(signLower)) {
      return modality;
    }
  }
  return undefined;
}

export function getHouseForSign(sign: string): HouseDefinition | undefined {
  const signLower = sign.toLowerCase();
  for (const [, house] of Object.entries(HOUSES)) {
    if (house.naturalSign.toLowerCase() === signLower) {
      return house;
    }
  }
  return undefined;
}

export function getTarotForPlanetOrSign(
  planetOrSign: string,
): TarotAstrologyCorrespondence | undefined {
  const term = planetOrSign.toLowerCase();
  return MAJOR_ARCANA_CORRESPONDENCES.find(
    (c) => c.planet?.toLowerCase() === term || c.sign?.toLowerCase() === term,
  );
}
