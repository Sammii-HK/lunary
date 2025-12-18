/**
 * Unified Grimoire OG Data Loader
 *
 * Lazy-loads data from JSON files and TS constants.
 * Only the requested category's data is imported per request.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface OgItemData {
  slug: string;
  name: string;
  symbol: string | null;
  color: string | null;
  gradient: [string, string] | null;
  attributes: string | null;
  categoryLabel: string;
  keywords?: string[];
}

export interface CategoryInfo {
  id: string;
  name: string;
  count: number;
  source: 'json' | 'ts';
}

// ============================================================================
// CATEGORY DEFINITIONS
// ============================================================================

export const CATEGORY_LIST: CategoryInfo[] = [
  { id: 'zodiac', name: 'Zodiac Signs', count: 12, source: 'json' },
  { id: 'crystals', name: 'Crystals', count: 104, source: 'json' },
  { id: 'tarot-major', name: 'Major Arcana', count: 22, source: 'json' },
  { id: 'tarot-wands', name: 'Suit of Wands', count: 14, source: 'json' },
  { id: 'tarot-cups', name: 'Suit of Cups', count: 14, source: 'json' },
  { id: 'tarot-swords', name: 'Suit of Swords', count: 14, source: 'json' },
  {
    id: 'tarot-pentacles',
    name: 'Suit of Pentacles',
    count: 14,
    source: 'json',
  },
  { id: 'runes', name: 'Elder Futhark', count: 24, source: 'json' },
  { id: 'chakras', name: 'Chakras', count: 7, source: 'json' },
  { id: 'planetary', name: 'Planetary Bodies', count: 11, source: 'json' },
  { id: 'sabbat', name: 'Sabbats', count: 8, source: 'json' },
  {
    id: 'numerology-lifepath',
    name: 'Life Path Numbers',
    count: 12,
    source: 'json',
  },
  { id: 'numerology-angel', name: 'Angel Numbers', count: 13, source: 'json' },
  { id: 'numerology-karmic', name: 'Karmic Debt', count: 4, source: 'json' },
  { id: 'numerology-mirror', name: 'Mirror Hours', count: 12, source: 'ts' },
  { id: 'numerology-double', name: 'Double Hours', count: 12, source: 'ts' },
  { id: 'houses', name: 'Astrological Houses', count: 12, source: 'ts' },
  { id: 'aspects', name: 'Aspects', count: 5, source: 'ts' },
  { id: 'lunar', name: 'Moon Phases', count: 8, source: 'ts' },
  { id: 'chinese-zodiac', name: 'Chinese Zodiac', count: 12, source: 'ts' },
  { id: 'decans', name: 'Zodiac Decans', count: 36, source: 'ts' },
  { id: 'cusps', name: 'Zodiac Cusps', count: 12, source: 'ts' },
];

// ============================================================================
// COLOR THEMES
// ============================================================================

const ELEMENT_GRADIENTS: Record<string, [string, string]> = {
  fire: ['#7f1d1d', '#0f172a'],
  water: ['#1e3a8a', '#0f172a'],
  air: ['#4c1d95', '#0f172a'],
  earth: ['#064e3b', '#0f172a'],
};

const CHAKRA_COLORS: Record<string, string> = {
  root: '#DC2626',
  sacral: '#EA580C',
  'solar-plexus': '#EAB308',
  heart: '#16A34A',
  throat: '#0EA5E9',
  'third-eye': '#6366F1',
  crown: '#A855F7',
};

const PLANET_COLORS: Record<string, string> = {
  sun: '#FCD34D',
  moon: '#E2E8F0',
  mercury: '#A78BFA',
  venus: '#F472B6',
  mars: '#EF4444',
  jupiter: '#F59E0B',
  saturn: '#6B7280',
  uranus: '#22D3EE',
  neptune: '#818CF8',
  pluto: '#78716C',
  chiron: '#A3E635',
};

const TAROT_SUIT_COLORS: Record<string, [string, string]> = {
  wands: ['#7f1d1d', '#0f172a'], // Fire
  cups: ['#1e3a8a', '#0f172a'], // Water
  swords: ['#4c1d95', '#0f172a'], // Air
  pentacles: ['#064e3b', '#0f172a'], // Earth
  major: ['#312e81', '#0f172a'], // Cosmic purple
};

const ASPECT_COLORS: Record<string, string> = {
  conjunct: '#FCD34D', // Neutral - gold
  conjunction: '#FCD34D',
  sextile: '#22C55E', // Harmonious - green
  trine: '#3B82F6', // Harmonious - blue
  square: '#EF4444', // Challenging - red
  opposite: '#F97316', // Challenging - orange
  opposition: '#F97316',
};

// ============================================================================
// LAZY LOADERS
// ============================================================================

// Astronomicon font mapping for zodiac
const ZODIAC_ASTRONOMICON: Record<string, string> = {
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

async function loadZodiac(slug: string): Promise<OgItemData | null> {
  const { default: data } = await import('../../src/data/zodiac-signs.json');
  // zodiac-signs.json is an object, not array
  const signs = data as Record<
    string,
    {
      name: string;
      symbol: string;
      element: string;
      modality: string;
      rulingPlanet: string;
    }
  >;
  const normalizedSlug = slug.toLowerCase();
  const sign = signs[normalizedSlug];
  if (!sign) return null;

  const element = sign.element?.toLowerCase() || 'fire';
  // Use Astronomicon font character instead of Unicode
  const astronomiconSymbol = ZODIAC_ASTRONOMICON[normalizedSlug];

  return {
    slug: normalizedSlug,
    name: sign.name,
    symbol: astronomiconSymbol || null, // Use Astronomicon char
    color: null,
    gradient: ELEMENT_GRADIENTS[element] || ELEMENT_GRADIENTS.fire,
    attributes:
      `${sign.modality || ''} ${sign.element || ''} • ${sign.rulingPlanet || ''}`.trim(),
    categoryLabel: `${sign.element || 'Fire'} Signs`,
  };
}

async function loadCrystal(slug: string): Promise<OgItemData | null> {
  const { default: data } = await import('../../src/data/crystals.json');
  const crystals = data as Array<{
    id: string;
    name: string;
    ogColor?: string;
    primaryChakra?: string;
    keywords?: string[];
  }>;
  const crystal = crystals.find(
    (c) =>
      c.id.toLowerCase() === slug.toLowerCase() ||
      c.name.toLowerCase() === slug.toLowerCase(),
  );
  if (!crystal) return null;

  return {
    slug: crystal.id,
    name: crystal.name,
    symbol: null, // Crystals don't use symbols
    color: crystal.ogColor || '#A78BFA',
    gradient: null,
    attributes: crystal.primaryChakra || null,
    categoryLabel: 'Crystal Guide',
    keywords: crystal.keywords,
  };
}

async function loadTarotMajor(slug: string): Promise<OgItemData | null> {
  const { default: data } = await import('../../src/data/tarot-cards.json');
  const tarot = data as {
    majorArcana: Record<
      string,
      { name: string; number: number; element?: string }
    >;
  };
  const card = Object.values(tarot.majorArcana).find(
    (c) =>
      c.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
      c.name.toLowerCase() === slug.toLowerCase().replace(/-/g, ' '),
  );
  if (!card) return null;

  const romanNumerals = [
    '0',
    'I',
    'II',
    'III',
    'IV',
    'V',
    'VI',
    'VII',
    'VIII',
    'IX',
    'X',
    'XI',
    'XII',
    'XIII',
    'XIV',
    'XV',
    'XVI',
    'XVII',
    'XVIII',
    'XIX',
    'XX',
    'XXI',
  ];
  return {
    slug: card.name.toLowerCase().replace(/\s+/g, '-'),
    name: card.name,
    symbol: romanNumerals[card.number] || String(card.number),
    color: null,
    gradient: TAROT_SUIT_COLORS.major,
    attributes: card.element ? `${card.element} Element` : 'Major Arcana',
    categoryLabel: 'Major Arcana',
  };
}

async function loadTarotSuit(
  suit: string,
  slug: string,
): Promise<OgItemData | null> {
  const { default: data } = await import('../../src/data/tarot-cards.json');
  const tarot = data as {
    minorArcana: Record<
      string,
      Record<string, { name: string; element?: string }>
    >;
  };
  const suitData = tarot.minorArcana?.[suit];
  if (!suitData) return null;

  const card = Object.values(suitData).find(
    (c) =>
      c.name.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase() ||
      c.name.toLowerCase() === slug.toLowerCase().replace(/-/g, ' '),
  );
  if (!card) return null;

  const suitName = suit.charAt(0).toUpperCase() + suit.slice(1);
  return {
    slug: card.name.toLowerCase().replace(/\s+/g, '-'),
    name: card.name,
    symbol: null,
    color: null,
    gradient: TAROT_SUIT_COLORS[suit] || TAROT_SUIT_COLORS.major,
    attributes: card.element || suitName,
    categoryLabel: `Suit of ${suitName}`,
  };
}

async function loadRune(slug: string): Promise<OgItemData | null> {
  const { default: data } = await import('../../src/data/runes.json');
  const runes = data as Record<
    string,
    { name: string; symbol: string; element?: string; aett?: string }
  >;
  const rune = runes[slug.toLowerCase()];
  if (!rune) return null;

  return {
    slug: slug.toLowerCase(),
    name: rune.name,
    symbol: rune.symbol,
    color: null,
    gradient: ['#374151', '#0f172a'], // Stone gray
    attributes: rune.aett ? `${rune.aett} Aett` : null,
    categoryLabel: 'Elder Futhark',
  };
}

async function loadChakra(slug: string): Promise<OgItemData | null> {
  const { default: data } = await import('../../src/data/chakras.json');
  const chakras = data as Record<
    string,
    { name: string; color: string; element?: string; sanskritName?: string }
  >;

  // Map hyphenated slugs to camelCase JSON keys
  const slugToKey: Record<string, string> = {
    root: 'root',
    sacral: 'sacral',
    'solar-plexus': 'solarPlexus',
    heart: 'heart',
    throat: 'throat',
    'third-eye': 'thirdEye',
    crown: 'crown',
  };

  const normalizedSlug = slug.toLowerCase();
  const jsonKey = slugToKey[normalizedSlug] || normalizedSlug;
  const chakra = chakras[jsonKey];
  if (!chakra) return null;

  return {
    slug: normalizedSlug,
    name: chakra.name + ' Chakra',
    symbol: null, // Chakras use color glow, not symbol
    color: CHAKRA_COLORS[normalizedSlug] || chakra.color || '#A855F7',
    gradient: null,
    attributes: chakra.sanskritName
      ? `${chakra.sanskritName} • ${chakra.element || ''}`
      : null,
    categoryLabel: 'Energy Centers',
  };
}

// Astronomicon font mapping for planets
const PLANET_ASTRONOMICON: Record<string, string> = {
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
  chiron: 'c',
  'north-node': 'n',
  'south-node': 's',
  lilith: 'l',
};

async function loadPlanet(slug: string): Promise<OgItemData | null> {
  const { default: data } =
    await import('../../src/data/planetary-bodies.json');
  const planets = data as Record<
    string,
    { name: string; symbol: string; rules?: string[] }
  >;
  const planet = planets[slug.toLowerCase()];
  if (!planet) return null;

  // Use Astronomicon font character instead of Unicode
  const astronomiconSymbol = PLANET_ASTRONOMICON[slug.toLowerCase()];

  return {
    slug: slug.toLowerCase(),
    name: planet.name,
    symbol: astronomiconSymbol || null, // Use Astronomicon char
    color: PLANET_COLORS[slug.toLowerCase()] || '#E2E8F0',
    gradient: null,
    attributes: planet.rules?.length
      ? `Rules ${planet.rules.join(', ')}`
      : null,
    categoryLabel: 'Celestial Bodies',
  };
}

async function loadSabbat(slug: string): Promise<OgItemData | null> {
  const { default: data } = await import('../../src/data/sabbats.json');
  const sabbats = data as Array<{
    name: string;
    date?: string;
    season?: string;
    element?: string;
  }>;
  const normalizedSlug = slug.toLowerCase().replace(/-/g, '');
  const sabbat = sabbats.find(
    (s) => s.name.toLowerCase().replace(/\s+/g, '') === normalizedSlug,
  );
  if (!sabbat) return null;

  const seasonColors: Record<string, [string, string]> = {
    winter: ['#1e3a5f', '#0f172a'],
    spring: ['#14532d', '#0f172a'],
    summer: ['#713f12', '#0f172a'],
    autumn: ['#431407', '#0f172a'],
  };

  return {
    slug: slug.toLowerCase(),
    name: sabbat.name,
    symbol: null, // Sabbats use seasonal colors
    color: null,
    gradient:
      seasonColors[sabbat.season?.toLowerCase() || 'winter'] ||
      seasonColors.winter,
    attributes: sabbat.date || null,
    categoryLabel: 'Wheel of the Year',
  };
}

async function loadNumerologyLifePath(
  slug: string,
): Promise<OgItemData | null> {
  const { default: data } = await import('../../src/data/numerology.json');
  const numerology = data as {
    lifePathNumbers: Record<
      string,
      { number: number; name: string; meaning: string }
    >;
  };
  const num = slug.replace(/\D/g, '');
  const item = numerology.lifePathNumbers?.[num];
  if (!item) return null;

  return {
    slug: num,
    name: item.name,
    symbol: num,
    color: null,
    gradient: ['#1e293b', '#0f172a'],
    attributes: item.meaning,
    categoryLabel: 'Sacred Numbers',
  };
}

async function loadNumerologyAngel(slug: string): Promise<OgItemData | null> {
  const { default: data } = await import('../../src/data/numerology.json');
  const numerology = data as {
    angelNumbers: Record<
      string,
      { number: string; name: string; meaning: string }
    >;
  };
  const num = slug.replace(/\D/g, '');
  const item = numerology.angelNumbers?.[num];
  if (!item) return null;

  return {
    slug: num,
    name: item.name,
    symbol: num,
    color: null,
    gradient: ['#312e81', '#0f172a'], // Angelic purple
    attributes: item.meaning,
    categoryLabel: 'Angel Numbers',
  };
}

async function loadNumerologyKarmic(slug: string): Promise<OgItemData | null> {
  const { default: data } =
    await import('../../src/data/numerology-extended.json');
  const numerology = data as {
    karmicDebtNumbers: Record<
      string,
      { number: number; name: string; meaning: string }
    >;
  };
  const num = slug.replace(/\D/g, '');
  const item = numerology.karmicDebtNumbers?.[num];
  if (!item) return null;

  return {
    slug: num,
    name: item.name,
    symbol: num,
    color: null,
    gradient: ['#44403c', '#0f172a'], // Karmic earth tones
    attributes: item.meaning,
    categoryLabel: 'Karmic Debt',
  };
}

async function loadMirrorHour(slug: string): Promise<OgItemData | null> {
  const { mirrorHours } =
    await import('../../src/constants/grimoire/clock-numbers-data');
  const time = slug.replace(/-/g, ':');
  const item = mirrorHours[time];
  if (!item) return null;

  return {
    slug: time,
    name: item.name,
    symbol: time,
    color: null,
    gradient: ['#1e1b4b', '#0f172a'],
    attributes: item.meaning,
    categoryLabel: 'Mirror Hours',
  };
}

async function loadDoubleHour(slug: string): Promise<OgItemData | null> {
  const { doubleHours } =
    await import('../../src/constants/grimoire/clock-numbers-data');
  const time = slug.replace(/-/g, ':');
  const item = doubleHours[time];
  if (!item) return null;

  return {
    slug: time,
    name: item.name,
    symbol: time,
    color: null,
    gradient: ['#1e1b4b', '#0f172a'],
    attributes: item.meaning,
    categoryLabel: 'Double Hours',
  };
}

async function loadHouse(slug: string): Promise<OgItemData | null> {
  const { HOUSE_DATA } = await import('../../src/constants/seo/houses');
  const num = parseInt(slug.replace(/\D/g, ''), 10);
  const house = HOUSE_DATA[num as keyof typeof HOUSE_DATA];
  if (!house) return null;

  const signElement: Record<string, string> = {
    Aries: 'fire',
    Taurus: 'earth',
    Gemini: 'air',
    Cancer: 'water',
    Leo: 'fire',
    Virgo: 'earth',
    Libra: 'air',
    Scorpio: 'water',
    Sagittarius: 'fire',
    Capricorn: 'earth',
    Aquarius: 'air',
    Pisces: 'water',
  };
  const element = signElement[house.naturalSign] || 'fire';

  return {
    slug: String(num),
    name: house.name,
    symbol: String(num),
    color: null,
    gradient: ELEMENT_GRADIENTS[element],
    attributes: `${house.naturalSign} • ${house.naturalRuler}`,
    categoryLabel: 'Astrological Houses',
  };
}

// Astronomicon font mapping for aspects
const ASPECT_ASTRONOMICON: Record<string, string> = {
  conjunct: '!',
  conjunction: '!',
  sextile: '%',
  square: '#',
  trine: '$',
  opposite: '"',
  opposition: '"',
};

async function loadAspect(slug: string): Promise<OgItemData | null> {
  const { ASPECT_DATA } = await import('../../src/constants/seo/aspects');
  const aspect = ASPECT_DATA[slug as keyof typeof ASPECT_DATA];
  if (!aspect) return null;

  // Use Astronomicon font character instead of Unicode
  const astronomiconSymbol = ASPECT_ASTRONOMICON[slug.toLowerCase()];

  return {
    slug,
    name: aspect.displayName,
    symbol: astronomiconSymbol || null, // Use Astronomicon char
    color: ASPECT_COLORS[slug] || '#FCD34D',
    gradient: null,
    attributes: `${aspect.degrees}° • ${aspect.nature.charAt(0).toUpperCase() + aspect.nature.slice(1)}`,
    categoryLabel: 'Astrological Aspects',
  };
}

async function loadMoonPhase(slug: string): Promise<OgItemData | null> {
  const { monthlyMoonPhases } = await import('../../utils/moon/monthlyPhases');
  const phase = monthlyMoonPhases[slug as keyof typeof monthlyMoonPhases];
  if (!phase) return null;

  const phaseName = slug
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();

  return {
    slug,
    name: phaseName,
    symbol: null, // Uses moon phase images
    color: null,
    gradient: ['#1e293b', '#0f172a'],
    attributes: phase.keywords?.join(' • ') || null,
    categoryLabel: 'Lunar Cycle',
  };
}

async function loadChineseZodiac(slug: string): Promise<OgItemData | null> {
  const { CHINESE_ZODIAC_DATA } =
    await import('../../src/constants/seo/chinese-zodiac');
  const animal = CHINESE_ZODIAC_DATA[slug as keyof typeof CHINESE_ZODIAC_DATA];
  if (!animal) return null;

  const elementColors: Record<string, [string, string]> = {
    Fire: ['#7f1d1d', '#0f172a'],
    Water: ['#1e3a8a', '#0f172a'],
    Earth: ['#064e3b', '#0f172a'],
    Metal: ['#374151', '#0f172a'],
    Wood: ['#14532d', '#0f172a'],
  };

  return {
    slug,
    name: animal.displayName,
    symbol: animal.emoji,
    color: null,
    gradient: elementColors[animal.element] || elementColors.Earth,
    attributes: `${animal.element} • ${animal.yinYang}`,
    categoryLabel: 'Chinese Zodiac',
  };
}

async function loadDecan(slug: string): Promise<OgItemData | null> {
  const { getDecanData, ZODIAC_SIGNS } =
    await import('../../src/constants/seo/decans');
  // Slug format: aries-1, taurus-2, etc.
  const [signPart, decanNumPart] = slug.split('-');
  const sign = signPart?.toLowerCase();
  const decanNum = parseInt(decanNumPart, 10) as 1 | 2 | 3;

  if (
    !sign ||
    !ZODIAC_SIGNS.includes(sign as (typeof ZODIAC_SIGNS)[number]) ||
    ![1, 2, 3].includes(decanNum)
  ) {
    return null;
  }

  const decan = getDecanData(sign as (typeof ZODIAC_SIGNS)[number], decanNum);
  if (!decan) return null;

  const signElements: Record<string, string> = {
    aries: 'fire',
    taurus: 'earth',
    gemini: 'air',
    cancer: 'water',
    leo: 'fire',
    virgo: 'earth',
    libra: 'air',
    scorpio: 'water',
    sagittarius: 'fire',
    capricorn: 'earth',
    aquarius: 'air',
    pisces: 'water',
  };
  const element = signElements[sign] || 'fire';

  return {
    slug,
    name: `${sign.charAt(0).toUpperCase() + sign.slice(1)} Decan ${decan.decan}`,
    symbol: null,
    color: null,
    gradient: ELEMENT_GRADIENTS[element],
    attributes: `${decan.degrees} • ${decan.subruler}`,
    categoryLabel: 'Zodiac Decans',
  };
}

async function loadCusp(slug: string): Promise<OgItemData | null> {
  const { ZODIAC_CUSPS } = await import('../../src/constants/seo/cusps');
  const cusp = ZODIAC_CUSPS.find(
    (c: { id: string }) => c.id.toLowerCase() === slug.toLowerCase(),
  );
  if (!cusp) return null;

  return {
    slug: cusp.id,
    name: cusp.name,
    symbol: null,
    color: null,
    gradient: ['#312e81', '#0f172a'], // Cusp purple blend
    attributes: `${cusp.sign1}/${cusp.sign2} • ${cusp.dates}`,
    categoryLabel: 'Zodiac Cusps',
  };
}

// ============================================================================
// MAIN API
// ============================================================================

/**
 * Get OG data for a specific category and slug.
 * Lazy-loads only the required category's data.
 */
export async function getOgData(
  category: string,
  slug: string,
): Promise<OgItemData | null> {
  try {
    switch (category) {
      case 'zodiac':
        return await loadZodiac(slug);
      case 'crystals':
        return await loadCrystal(slug);
      case 'tarot-major':
        return await loadTarotMajor(slug);
      case 'tarot-wands':
        return await loadTarotSuit('wands', slug);
      case 'tarot-cups':
        return await loadTarotSuit('cups', slug);
      case 'tarot-swords':
        return await loadTarotSuit('swords', slug);
      case 'tarot-pentacles':
        return await loadTarotSuit('pentacles', slug);
      case 'runes':
        return await loadRune(slug);
      case 'chakras':
        return await loadChakra(slug);
      case 'planetary':
        return await loadPlanet(slug);
      case 'sabbat':
        return await loadSabbat(slug);
      case 'numerology-lifepath':
        return await loadNumerologyLifePath(slug);
      case 'numerology-angel':
        return await loadNumerologyAngel(slug);
      case 'numerology-karmic':
        return await loadNumerologyKarmic(slug);
      case 'numerology-mirror':
        return await loadMirrorHour(slug);
      case 'numerology-double':
        return await loadDoubleHour(slug);
      case 'houses':
        return await loadHouse(slug);
      case 'aspects':
        return await loadAspect(slug);
      case 'lunar':
        return await loadMoonPhase(slug);
      case 'chinese-zodiac':
        return await loadChineseZodiac(slug);
      case 'decans':
        return await loadDecan(slug);
      case 'cusps':
        return await loadCusp(slug);
      default:
        console.warn(`Unknown category: ${category}`);
        return null;
    }
  } catch (error) {
    console.error(`Error loading OG data for ${category}/${slug}:`, error);
    return null;
  }
}

/**
 * Get all items for a category (for preview page).
 * Lazy-loads only the requested category.
 */
export async function getAllItemsForCategory(
  category: string,
): Promise<Array<{ slug: string; name: string }>> {
  try {
    switch (category) {
      case 'zodiac': {
        const { default: data } =
          await import('../../src/data/zodiac-signs.json');
        // zodiac-signs.json is an object, not array
        const signs = data as Record<string, { name: string }>;
        return Object.entries(signs).map(([slug, s]) => ({
          slug,
          name: s.name,
        }));
      }
      case 'crystals': {
        const { default: data } = await import('../../src/data/crystals.json');
        return (data as Array<{ id: string; name: string }>).map((c) => ({
          slug: c.id,
          name: c.name,
        }));
      }
      case 'tarot-major': {
        const { default: data } =
          await import('../../src/data/tarot-cards.json');
        const tarot = data as { majorArcana: Record<string, { name: string }> };
        return Object.values(tarot.majorArcana).map((c) => ({
          slug: c.name.toLowerCase().replace(/\s+/g, '-'),
          name: c.name,
        }));
      }
      case 'tarot-wands':
      case 'tarot-cups':
      case 'tarot-swords':
      case 'tarot-pentacles': {
        const suit = category.replace('tarot-', '');
        const { default: data } =
          await import('../../src/data/tarot-cards.json');
        const tarot = data as {
          minorArcana: Record<string, Record<string, { name: string }>>;
        };
        const suitData = tarot.minorArcana?.[suit] || {};
        return Object.values(suitData).map((c) => ({
          slug: c.name.toLowerCase().replace(/\s+/g, '-'),
          name: c.name,
        }));
      }
      case 'runes': {
        const { default: data } = await import('../../src/data/runes.json');
        const runes = data as Record<string, { name: string }>;
        return Object.entries(runes).map(([slug, r]) => ({
          slug,
          name: r.name,
        }));
      }
      case 'chakras': {
        const { default: data } = await import('../../src/data/chakras.json');
        const chakras = data as Record<string, { name: string }>;
        return Object.entries(chakras).map(([slug, c]) => ({
          slug,
          name: c.name,
        }));
      }
      case 'planetary': {
        const { default: data } =
          await import('../../src/data/planetary-bodies.json');
        const planets = data as Record<string, { name: string }>;
        return Object.entries(planets).map(([slug, p]) => ({
          slug,
          name: p.name,
        }));
      }
      case 'sabbat': {
        const { default: data } = await import('../../src/data/sabbats.json');
        const sabbats = data as Array<{ name: string }>;
        return sabbats.map((s) => ({
          slug: s.name.toLowerCase().replace(/\s+/g, '-'),
          name: s.name,
        }));
      }
      case 'numerology-lifepath': {
        const { default: data } =
          await import('../../src/data/numerology.json');
        const numerology = data as {
          lifePathNumbers: Record<string, { name: string }>;
        };
        return Object.entries(numerology.lifePathNumbers || {}).map(
          ([num, n]) => ({
            slug: num,
            name: n.name,
          }),
        );
      }
      case 'numerology-angel': {
        const { default: data } =
          await import('../../src/data/numerology.json');
        const numerology = data as {
          angelNumbers: Record<string, { name: string }>;
        };
        return Object.entries(numerology.angelNumbers || {}).map(
          ([num, n]) => ({
            slug: num,
            name: n.name,
          }),
        );
      }
      case 'numerology-karmic': {
        const { default: data } =
          await import('../../src/data/numerology-extended.json');
        const numerology = data as {
          karmicDebtNumbers: Record<string, { name: string }>;
        };
        return Object.entries(numerology.karmicDebtNumbers || {}).map(
          ([num, n]) => ({
            slug: num,
            name: n.name,
          }),
        );
      }
      case 'numerology-mirror': {
        const { mirrorHours } =
          await import('../../src/constants/grimoire/clock-numbers-data');
        return Object.entries(mirrorHours).map(([time, m]) => ({
          slug: time.replace(/:/g, '-'),
          name: (m as { name: string }).name,
        }));
      }
      case 'numerology-double': {
        const { doubleHours } =
          await import('../../src/constants/grimoire/clock-numbers-data');
        return Object.entries(doubleHours).map(([time, d]) => ({
          slug: time.replace(/:/g, '-'),
          name: (d as { name: string }).name,
        }));
      }
      case 'houses': {
        const { HOUSE_DATA } = await import('../../src/constants/seo/houses');
        return Object.entries(HOUSE_DATA).map(([num, h]) => ({
          slug: num,
          name: (h as { name: string }).name,
        }));
      }
      case 'aspects': {
        const { ASPECT_DATA } = await import('../../src/constants/seo/aspects');
        return Object.entries(ASPECT_DATA).map(([slug, a]) => ({
          slug,
          name: (a as { displayName: string }).displayName,
        }));
      }
      case 'lunar': {
        const { monthlyMoonPhases } =
          await import('../../utils/moon/monthlyPhases');
        return Object.keys(monthlyMoonPhases).map((slug) => ({
          slug,
          name: slug
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, (s) => s.toUpperCase())
            .trim(),
        }));
      }
      case 'chinese-zodiac': {
        const { CHINESE_ZODIAC_DATA } =
          await import('../../src/constants/seo/chinese-zodiac');
        return Object.entries(CHINESE_ZODIAC_DATA).map(([slug, a]) => ({
          slug,
          name: (a as { displayName: string }).displayName,
        }));
      }
      case 'decans': {
        const { ZODIAC_SIGNS } = await import('../../src/constants/seo/decans');
        const items: Array<{ slug: string; name: string }> = [];
        for (const sign of ZODIAC_SIGNS) {
          for (const decan of [1, 2, 3]) {
            items.push({
              slug: `${sign}-${decan}`,
              name: `${sign.charAt(0).toUpperCase() + sign.slice(1)} Decan ${decan}`,
            });
          }
        }
        return items;
      }
      case 'cusps': {
        const { ZODIAC_CUSPS } = await import('../../src/constants/seo/cusps');
        return ZODIAC_CUSPS.map((c: { id: string; name: string }) => ({
          slug: c.id,
          name: c.name,
        }));
      }
      default:
        return [];
    }
  } catch (error) {
    console.error(`Error loading items for category ${category}:`, error);
    return [];
  }
}

/**
 * Get list of all available categories.
 */
export function getCategoryList(): CategoryInfo[] {
  return CATEGORY_LIST;
}

/**
 * Check if a category requires runic font.
 */
export function needsRunicFont(category: string): boolean {
  return category === 'runes';
}

/**
 * Check if a category uses Astronomicon font.
 */
export function needsAstronomiconFont(category: string): boolean {
  return (
    category === 'zodiac' || category === 'planetary' || category === 'aspects'
  );
}

/**
 * Check if a category uses moon phase images.
 */
export function usesMoonImages(category: string): boolean {
  return category === 'lunar';
}
