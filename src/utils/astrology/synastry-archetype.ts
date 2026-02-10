/**
 * Generates a relationship archetype headline from sign combinations.
 * Deterministic lookup table based on Sun sign element pairings.
 */

const ELEMENT_MAP: Record<string, string> = {
  Aries: 'Fire',
  Leo: 'Fire',
  Sagittarius: 'Fire',
  Taurus: 'Earth',
  Virgo: 'Earth',
  Capricorn: 'Earth',
  Gemini: 'Air',
  Libra: 'Air',
  Aquarius: 'Air',
  Cancer: 'Water',
  Scorpio: 'Water',
  Pisces: 'Water',
};

/** Archetype headlines indexed by sorted element pair */
const ELEMENT_PAIR_ARCHETYPES: Record<string, string[]> = {
  'Fire+Fire': [
    'The Spark & The Flame',
    'Double Fire: Passion Ignites',
    'Blazing Hearts',
  ],
  'Earth+Earth': [
    'Roots Entwined',
    'Double Earth: Solid Ground',
    'The Foundation Builders',
  ],
  'Air+Air': [
    'Minds in Motion',
    'Double Air: Endless Dialogue',
    'The Idea Weavers',
  ],
  'Water+Water': [
    'Deep Currents',
    'Double Water: Soul Mirror',
    'The Emotional Depths',
  ],
  'Air+Fire': ['Wind & Flame', 'The Visionary Duo', 'Spark of Inspiration'],
  'Earth+Water': ['River & Shore', 'The Nurturing Bond', 'Grounded Depths'],
  'Earth+Fire': [
    'Forge & Foundation',
    'The Builder & The Spark',
    'Steady Flame',
  ],
  'Air+Water': [
    'Mist & Moonlight',
    'The Dreamer & The Thinker',
    'Tides of Thought',
  ],
  'Air+Earth': ['Sky & Soil', 'The Planner & The Doer', 'Grounded Ideas'],
  'Fire+Water': [
    'Steam & Passion',
    'The Alchemists',
    'Intensity Meets Intuition',
  ],
};

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getElementPairKey(element1: string, element2: string): string {
  const sorted = [element1, element2].sort();
  return `${sorted[0]}+${sorted[1]}`;
}

/**
 * Generate a relationship archetype headline from two Sun signs.
 * Returns a deterministic archetype based on element pairing.
 */
export function getSynastryArchetype(
  person1SunSign?: string,
  person2SunSign?: string,
): string {
  if (!person1SunSign || !person2SunSign) {
    return 'A Cosmic Connection';
  }

  const element1 = ELEMENT_MAP[person1SunSign];
  const element2 = ELEMENT_MAP[person2SunSign];

  if (!element1 || !element2) {
    return 'A Cosmic Connection';
  }

  const pairKey = getElementPairKey(element1, element2);
  const archetypes = ELEMENT_PAIR_ARCHETYPES[pairKey];

  if (!archetypes || archetypes.length === 0) {
    return 'A Cosmic Connection';
  }

  // Deterministic selection based on sign combination
  const seed = simpleHash(`${person1SunSign}-${person2SunSign}`);
  return archetypes[seed % archetypes.length];
}

/**
 * Get the dominant element from a combined element balance.
 */
export function getDominantElement(elementBalance: {
  fire: { combined: number };
  earth: { combined: number };
  air: { combined: number };
  water: { combined: number };
}): string {
  const entries = [
    { element: 'Fire', value: elementBalance.fire.combined },
    { element: 'Earth', value: elementBalance.earth.combined },
    { element: 'Air', value: elementBalance.air.combined },
    { element: 'Water', value: elementBalance.water.combined },
  ];

  entries.sort((a, b) => b.value - a.value);
  return entries[0].element;
}
