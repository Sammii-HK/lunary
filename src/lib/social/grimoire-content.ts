import {
  searchGrimoireIndex,
  type GrimoireEntry,
} from '@/constants/seo/grimoire-search-index';

// Import ALL rich content data files
import zodiacSigns from '@/data/zodiac-signs.json';
import tarotCards from '@/data/tarot-cards.json';
import crystals from '@/data/crystals.json';
import numerology from '@/data/numerology.json';
import runes from '@/data/runes.json';
import chakras from '@/data/chakras.json';
import spells from '@/data/spells.json';
import correspondences from '@/data/correspondences.json';
import sabbats from '@/data/sabbats.json';
import planetaryBodies from '@/data/planetary-bodies.json';

export interface GrimoireSnippet {
  title: string;
  slug: string;
  category: string;
  summary: string;
  keyPoints: string[];
  url: string;
  // Rich content from actual data
  fullContent?: {
    description?: string;
    keywords?: string[];
    strengths?: string[];
    loveTrait?: string;
    careerTrait?: string;
    affirmation?: string;
    metaphysicalProperties?: string;
    historicalUse?: string;
    uprightMeaning?: string;
    reversedMeaning?: string;
    symbolism?: string;
    element?: string;
    planet?: string;
    modality?: string;
    spiritualMeaning?: string;
    message?: string;
    magicalUses?: string[];
    healingPractices?: string[];
    colors?: string[];
    herbs?: string[];
    traditions?: string[];
    rituals?: string[];
    history?: string;
  };
}

export type TopicSelectionStrategy =
  | 'seasonal'
  | 'trending'
  | 'foundational'
  | 'random'
  | 'mixed';

/**
 * Get current cosmic timing context for seasonal selection
 */
function getCurrentCosmicContext(): {
  moonPhase?: string;
  zodiacSeason?: string;
  currentMonth?: number;
  upcomingSabbat?: string;
} {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Zodiac seasons (approximate)
  const zodiacSeasons: Record<number, string> = {
    3: 'Aries',
    4: 'Taurus',
    5: 'Gemini',
    6: 'Cancer',
    7: 'Leo',
    8: 'Virgo',
    9: 'Libra',
    10: 'Scorpio',
    11: 'Sagittarius',
    12: 'Capricorn',
    1: 'Aquarius',
    2: 'Pisces',
  };

  // Upcoming sabbats based on date
  let upcomingSabbat = '';
  if (month === 10 && day >= 25) upcomingSabbat = 'Samhain';
  else if (month === 12 && day >= 15) upcomingSabbat = 'Yule';
  else if (month === 2 && day >= 1 && day <= 7) upcomingSabbat = 'Imbolc';
  else if (month === 3 && day >= 15) upcomingSabbat = 'Ostara';
  else if (month === 4 && day >= 25) upcomingSabbat = 'Beltane';
  else if (month === 6 && day >= 15) upcomingSabbat = 'Litha';
  else if (month === 7 && day >= 25) upcomingSabbat = 'Lughnasadh';
  else if (month === 9 && day >= 15) upcomingSabbat = 'Mabon';

  return {
    zodiacSeason: zodiacSeasons[month],
    currentMonth: month,
    upcomingSabbat,
  };
}

// ============================================================================
// DATA EXTRACTORS - Pull rich content from each data source
// ============================================================================

function getZodiacData(signKey: string): GrimoireSnippet['fullContent'] | null {
  const sign = zodiacSigns[signKey as keyof typeof zodiacSigns];
  if (!sign) return null;
  return {
    description: sign.description,
    keywords: sign.keywords,
    strengths: sign.strengths,
    loveTrait: sign.loveTrait,
    careerTrait: sign.careerTrait,
    affirmation: sign.affirmation,
    element: sign.element,
    modality: sign.modality,
    planet: sign.rulingPlanet,
  };
}

function getTarotData(cardKey: string): GrimoireSnippet['fullContent'] | null {
  const majorCard =
    tarotCards.majorArcana[cardKey as keyof typeof tarotCards.majorArcana];
  if (majorCard) {
    return {
      description: majorCard.information,
      keywords: majorCard.keywords,
      uprightMeaning: majorCard.uprightMeaning,
      reversedMeaning: majorCard.reversedMeaning,
      symbolism: majorCard.symbolism,
      loveTrait: majorCard.loveMeaning,
      careerTrait: majorCard.careerMeaning,
      affirmation: majorCard.affirmation,
      element: majorCard.element,
      planet: majorCard.planet,
    };
  }
  return null;
}

function getCrystalData(
  crystalId: string,
): GrimoireSnippet['fullContent'] | null {
  const crystal = (crystals as any[]).find(
    (c) =>
      c.id === crystalId || c.name.toLowerCase() === crystalId.toLowerCase(),
  );
  if (!crystal) return null;
  return {
    description: crystal.description,
    keywords: crystal.keywords,
    metaphysicalProperties: crystal.metaphysicalProperties,
    historicalUse: crystal.historicalUse,
  };
}

function getAngelNumberData(
  number: string,
): GrimoireSnippet['fullContent'] | null {
  const angelNum =
    numerology.angelNumbers[number as keyof typeof numerology.angelNumbers];
  if (!angelNum) return null;
  return {
    description: angelNum.description,
    keywords: angelNum.keywords,
    spiritualMeaning: angelNum.spiritualMeaning,
    loveTrait: angelNum.loveMeaning,
    careerTrait: angelNum.careerMeaning,
    message: angelNum.message,
  };
}

function getLifePathData(
  number: string,
): GrimoireSnippet['fullContent'] | null {
  const lifePath = (numerology as any).lifePathNumbers?.[number];
  if (!lifePath) return null;
  return {
    description: lifePath.description,
    keywords: lifePath.keywords,
    strengths: lifePath.strengths,
    loveTrait: lifePath.loveMeaning,
    careerTrait: lifePath.careerMeaning,
    affirmation: lifePath.affirmation,
  };
}

function getRuneData(runeKey: string): GrimoireSnippet['fullContent'] | null {
  const rune = runes[runeKey as keyof typeof runes];
  if (!rune) return null;
  return {
    description: `${rune.name} (${rune.symbol}) means "${rune.meaning}". ${rune.notes}`,
    keywords: rune.keywords,
    uprightMeaning: rune.uprightMeaning,
    reversedMeaning: rune.reversedMeaning,
    magicalUses: rune.magicalUses,
    history: rune.history,
    affirmation: rune.affirmation,
    element: rune.element,
  };
}

function getChakraData(
  chakraKey: string,
): GrimoireSnippet['fullContent'] | null {
  const chakra = chakras[chakraKey as keyof typeof chakras];
  if (!chakra) return null;
  return {
    description: chakra.mysticalProperties,
    keywords: chakra.keywords,
    healingPractices: chakra.healingPractices,
    colors: [chakra.color],
    affirmation: (chakra as any).affirmation,
    element: chakra.element,
  };
}

function getSpellData(spellId: string): GrimoireSnippet['fullContent'] | null {
  const spell = (spells as any[]).find((s) => s.id === spellId);
  if (!spell) return null;
  return {
    description: spell.description,
    keywords: [spell.category, spell.type, spell.difficulty],
    history: spell.history,
    magicalUses: spell.variations,
  };
}

function getCorrespondenceData(
  type: string,
  key: string,
): GrimoireSnippet['fullContent'] | null {
  const category = (correspondences as any)[type];
  if (!category) return null;
  const item = category[key];
  if (!item) return null;
  return {
    description: item.description,
    keywords: item.qualities || [],
    colors: item.colors,
    herbs: item.herbs,
    magicalUses: item.magicalUses,
    rituals: item.rituals,
    affirmation: item.affirmation,
    element: key, // The element/color itself
  };
}

function getSabbatData(
  sabbatName: string,
): GrimoireSnippet['fullContent'] | null {
  const sabbat = (sabbats as any[]).find(
    (s) => s.name.toLowerCase() === sabbatName.toLowerCase(),
  );
  if (!sabbat) return null;
  return {
    description: sabbat.description,
    keywords: sabbat.keywords,
    spiritualMeaning: sabbat.spiritualMeaning,
    traditions: sabbat.traditions,
    rituals: sabbat.rituals,
    colors: sabbat.colors,
    herbs: sabbat.herbs,
    history: sabbat.history,
    affirmation: sabbat.affirmation,
  };
}

function getPlanetData(
  planetKey: string,
): GrimoireSnippet['fullContent'] | null {
  const planet = planetaryBodies[planetKey as keyof typeof planetaryBodies];
  if (!planet) return null;
  return {
    description: planet.mysticalProperties,
    keywords: planet.keywords,
    metaphysicalProperties: planet.transitEffect,
    affirmation: planet.affirmation,
  };
}

// ============================================================================
// SLUG PARSER - Determine content type from slug
// ============================================================================

function extractKeyFromSlug(slug: string): {
  type: string;
  key: string;
  subkey?: string;
} {
  // Zodiac: zodiac/aries
  if (slug.startsWith('zodiac/')) {
    return { type: 'zodiac', key: slug.replace('zodiac/', '') };
  }
  // Tarot: tarot/the-fool
  if (slug.startsWith('tarot/')) {
    const cardSlug = slug.replace('tarot/', '');
    const key = cardSlug
      .split('-')
      .map((word, i) =>
        i === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join('');
    return { type: 'tarot', key };
  }
  // Crystals: crystals/amethyst
  if (slug.startsWith('crystals/')) {
    return { type: 'crystal', key: slug.replace('crystals/', '') };
  }
  // Numerology: numerology/angel-numbers/111 or numerology/life-path/1
  if (slug.includes('angel-number') || slug.includes('numerology')) {
    const match = slug.match(/(\d+)/);
    if (match) {
      return { type: 'angel-number', key: match[1] };
    }
  }
  // Runes: runes/fehu
  if (slug.startsWith('runes/') || slug.includes('rune')) {
    const key = slug.replace('runes/', '').replace('-rune', '');
    return { type: 'rune', key };
  }
  // Chakras: chakras/root or chakras/heart
  if (slug.startsWith('chakras/') || slug.includes('chakra')) {
    const key = slug.replace('chakras/', '').replace('-chakra', '');
    return { type: 'chakra', key };
  }
  // Spells: spells/protection or practices/protection
  if (slug.startsWith('spells/') || slug.startsWith('practices/')) {
    const key = slug.replace('spells/', '').replace('practices/', '');
    return { type: 'spell', key };
  }
  // Sabbats: wheel-of-the-year/samhain
  if (slug.includes('sabbat') || slug.includes('wheel-of-the-year')) {
    const parts = slug.split('/');
    const key = parts[parts.length - 1];
    return { type: 'sabbat', key };
  }
  // Elements: correspondences/elements/fire
  if (slug.includes('element') || slug.includes('correspondences')) {
    if (
      slug.includes('fire') ||
      slug.includes('water') ||
      slug.includes('earth') ||
      slug.includes('air')
    ) {
      const element = slug.match(/(fire|water|earth|air)/i)?.[1];
      if (element) {
        return {
          type: 'element',
          key: element.charAt(0).toUpperCase() + element.slice(1),
        };
      }
    }
  }
  // Planets: astronomy/planets/mercury
  if (slug.includes('planet') || slug.startsWith('astronomy/')) {
    const parts = slug.split('/');
    const key = parts[parts.length - 1];
    return { type: 'planet', key };
  }
  return { type: 'other', key: slug };
}

// ============================================================================
// RICH CONTENT RESOLVER
// ============================================================================

function getRichContentData(
  entry: GrimoireEntry,
): GrimoireSnippet['fullContent'] | undefined {
  const { type, key } = extractKeyFromSlug(entry.slug);

  switch (type) {
    case 'zodiac':
      return getZodiacData(key) || undefined;
    case 'tarot':
      return getTarotData(key) || undefined;
    case 'crystal':
      return getCrystalData(key) || undefined;
    case 'angel-number':
      return getAngelNumberData(key) || undefined;
    case 'life-path':
      return getLifePathData(key) || undefined;
    case 'rune':
      return getRuneData(key) || undefined;
    case 'chakra':
      return getChakraData(key) || undefined;
    case 'spell':
      return getSpellData(key) || undefined;
    case 'sabbat':
      return getSabbatData(key) || undefined;
    case 'element':
      return getCorrespondenceData('elements', key) || undefined;
    case 'planet':
      return getPlanetData(key) || undefined;
    default:
      return undefined;
  }
}

// ============================================================================
// DIRECT DATA ACCESS - Get all entries from each data source
// ============================================================================

export function getAllRichEntries(): GrimoireEntry[] {
  const entries: GrimoireEntry[] = [];

  // Zodiac signs
  Object.keys(zodiacSigns).forEach((key) => {
    const sign = zodiacSigns[key as keyof typeof zodiacSigns];
    entries.push({
      slug: `zodiac/${key}`,
      title: sign.name,
      category: 'zodiac',
      keywords: sign.keywords.map((k) => k.toLowerCase()),
      summary: sign.description,
      relatedSlugs: [],
    });
  });

  // Tarot Major Arcana
  Object.keys(tarotCards.majorArcana).forEach((key) => {
    const card =
      tarotCards.majorArcana[key as keyof typeof tarotCards.majorArcana];
    entries.push({
      slug: `tarot/${key
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')}`,
      title: card.name,
      category: 'tarot',
      keywords: card.keywords,
      summary: card.information,
      relatedSlugs: [],
    });
  });

  // Crystals
  (crystals as any[]).forEach((crystal) => {
    entries.push({
      slug: `crystals/${crystal.id}`,
      title: crystal.name,
      category: 'crystal',
      keywords: crystal.properties || [],
      summary: crystal.description,
      relatedSlugs: [],
    });
  });

  // Angel Numbers
  Object.keys(numerology.angelNumbers).forEach((num) => {
    const angel =
      numerology.angelNumbers[num as keyof typeof numerology.angelNumbers];
    entries.push({
      slug: `numerology/angel-numbers/${num}`,
      title: angel.name,
      category: 'numerology',
      keywords: angel.keywords,
      summary: angel.description,
      relatedSlugs: [],
    });
  });

  // Runes
  Object.keys(runes).forEach((key) => {
    const rune = runes[key as keyof typeof runes];
    entries.push({
      slug: `runes/${key}`,
      title: `${rune.name} Rune (${rune.symbol})`,
      category: 'concept',
      keywords: rune.keywords,
      summary: rune.divinationMeaning || rune.uprightMeaning.split('.')[0],
      relatedSlugs: [],
    });
  });

  // Chakras
  Object.keys(chakras).forEach((key) => {
    const chakra = chakras[key as keyof typeof chakras];
    entries.push({
      slug: `chakras/${key}`,
      title: `${chakra.name} Chakra (${chakra.sanskritName})`,
      category: 'concept',
      keywords: chakra.keywords,
      summary: chakra.mysticalProperties.split('.').slice(0, 2).join('.'),
      relatedSlugs: [],
    });
  });

  // Sabbats
  (sabbats as any[]).forEach((sabbat) => {
    entries.push({
      slug: `wheel-of-the-year/${sabbat.name.toLowerCase()}`,
      title: sabbat.name,
      category: 'season',
      keywords: sabbat.keywords,
      summary: sabbat.description,
      relatedSlugs: [],
    });
  });

  // Planets
  Object.keys(planetaryBodies).forEach((key) => {
    const planet = planetaryBodies[key as keyof typeof planetaryBodies];
    entries.push({
      slug: `astronomy/planets/${key}`,
      title: planet.name,
      category: 'planet',
      keywords: planet.keywords,
      summary: planet.mysticalProperties,
      relatedSlugs: [],
    });
  });

  // Elements (from correspondences)
  Object.keys(correspondences.elements).forEach((key) => {
    const element =
      correspondences.elements[key as keyof typeof correspondences.elements];
    entries.push({
      slug: `correspondences/elements/${key.toLowerCase()}`,
      title: `${key} Element`,
      category: 'concept',
      keywords: element.qualities,
      summary: element.description,
      relatedSlugs: [],
    });
  });

  return entries;
}

// ============================================================================
// TOPIC SELECTION
// ============================================================================

export function selectGrimoireTopics(
  strategy: TopicSelectionStrategy = 'mixed',
  limit: number = 5,
): GrimoireEntry[] {
  // Get entries from ALL data sources
  const allEntries = getAllRichEntries();

  if (strategy === 'random') {
    return shuffleArray(allEntries).slice(0, limit);
  }

  if (strategy === 'seasonal') {
    const context = getCurrentCosmicContext();
    const seasonalKeywords: string[] = [];

    if (context.zodiacSeason) {
      seasonalKeywords.push(context.zodiacSeason.toLowerCase());
    }
    if (context.upcomingSabbat) {
      seasonalKeywords.push(context.upcomingSabbat.toLowerCase());
    }
    seasonalKeywords.push('moon', 'lunar');

    const seasonalEntries = allEntries.filter((entry) =>
      seasonalKeywords.some(
        (keyword) =>
          entry.keywords.some((k) => k.toLowerCase().includes(keyword)) ||
          entry.title.toLowerCase().includes(keyword),
      ),
    );

    return shuffleArray(
      seasonalEntries.length > 0 ? seasonalEntries : allEntries,
    ).slice(0, limit);
  }

  if (strategy === 'trending') {
    // Popular: zodiac, crystals, tarot, angel numbers
    const trendingCategories = ['zodiac', 'crystal', 'tarot', 'numerology'];
    const trendingEntries = allEntries.filter((entry) =>
      trendingCategories.includes(entry.category),
    );
    return shuffleArray(trendingEntries).slice(0, limit);
  }

  if (strategy === 'foundational') {
    // Core concepts: chakras, elements, planets, runes
    const foundationalKeywords = [
      'chakra',
      'element',
      'planet',
      'rune',
      'birth chart',
      'house',
      'aspect',
    ];
    const foundationalEntries = allEntries.filter((entry) =>
      foundationalKeywords.some(
        (keyword) =>
          entry.keywords.some((k) => k.toLowerCase().includes(keyword)) ||
          entry.title.toLowerCase().includes(keyword) ||
          entry.slug.includes(keyword),
      ),
    );
    return shuffleArray(
      foundationalEntries.length > 0 ? foundationalEntries : allEntries,
    ).slice(0, limit);
  }

  // Mixed: diverse content from all categories
  const categories = [
    'zodiac',
    'tarot',
    'crystal',
    'numerology',
    'concept',
    'season',
    'planet',
  ];
  const mixed: GrimoireEntry[] = [];

  categories.forEach((cat) => {
    const catEntries = allEntries.filter((e) => e.category === cat);
    if (catEntries.length > 0) {
      mixed.push(shuffleArray(catEntries)[0]);
    }
  });

  // Fill remaining with random
  const remaining = limit - mixed.length;
  if (remaining > 0) {
    const others = allEntries.filter((e) => !mixed.includes(e));
    mixed.push(...shuffleArray(others).slice(0, remaining));
  }

  return shuffleArray(mixed).slice(0, limit);
}

// ============================================================================
// CONTENT CONDENSING
// ============================================================================

function condenseToKeyPoints(
  fullContent: GrimoireSnippet['fullContent'],
  title: string,
): string[] {
  if (!fullContent) return [];
  const keyPoints: string[] = [];

  // Description (first 1-2 sentences)
  if (fullContent.description) {
    const sentences = fullContent.description
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);
    if (sentences.length > 0) keyPoints.push(sentences[0] + '.');
  }

  // Element/Planet connection
  if (fullContent.element && fullContent.planet) {
    keyPoints.push(
      `${title} is associated with ${fullContent.element} and ruled by ${fullContent.planet}.`,
    );
  } else if (fullContent.element) {
    keyPoints.push(`Associated with the ${fullContent.element} element.`);
  }

  // Spiritual meaning (for numerology, sabbats)
  if (fullContent.spiritualMeaning && keyPoints.length < 3) {
    const sentences = fullContent.spiritualMeaning
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);
    if (sentences.length > 0) keyPoints.push(sentences[0] + '.');
  }

  // Message (for angel numbers)
  if (fullContent.message && keyPoints.length < 3) {
    keyPoints.push(`💫 ${fullContent.message}`);
  }

  // Upright meaning (tarot, runes)
  if (fullContent.uprightMeaning && keyPoints.length < 3) {
    const sentences = fullContent.uprightMeaning
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15 && s.length < 100);
    if (sentences.length > 0) keyPoints.push(sentences[0] + '.');
  }

  // Metaphysical properties (crystals)
  if (fullContent.metaphysicalProperties && keyPoints.length < 3) {
    const sentences = fullContent.metaphysicalProperties
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15);
    if (sentences.length > 0) keyPoints.push(sentences[0] + '.');
  }

  // Healing practices (chakras)
  if (
    fullContent.healingPractices &&
    fullContent.healingPractices.length > 0 &&
    keyPoints.length < 4
  ) {
    keyPoints.push(
      `Try: ${fullContent.healingPractices.slice(0, 3).join(', ')}.`,
    );
  }

  // Traditions (sabbats)
  if (
    fullContent.traditions &&
    fullContent.traditions.length > 0 &&
    keyPoints.length < 4
  ) {
    keyPoints.push(
      `Traditions: ${fullContent.traditions.slice(0, 2).join(', ')}.`,
    );
  }

  // Magical uses (runes, correspondences)
  if (
    fullContent.magicalUses &&
    fullContent.magicalUses.length > 0 &&
    keyPoints.length < 4
  ) {
    keyPoints.push(
      `Magical uses: ${fullContent.magicalUses.slice(0, 2).join(', ')}.`,
    );
  }

  // Affirmation
  if (fullContent.affirmation && keyPoints.length < 5) {
    keyPoints.push(`✨ "${fullContent.affirmation}"`);
  }

  // Keywords fallback
  if (
    fullContent.keywords &&
    fullContent.keywords.length > 0 &&
    keyPoints.length < 2
  ) {
    keyPoints.push(
      `Key themes: ${fullContent.keywords.slice(0, 4).join(', ')}.`,
    );
  }

  return keyPoints.slice(0, 4);
}

// ============================================================================
// PUBLIC API
// ============================================================================

export function extractGrimoireSnippet(entry: GrimoireEntry): GrimoireSnippet {
  const fullContent = getRichContentData(entry);
  const keyPoints = fullContent
    ? condenseToKeyPoints(fullContent, entry.title)
    : [];

  // Fallback to summary if no rich content
  if (keyPoints.length === 0 && entry.summary) {
    keyPoints.push(entry.summary);
  }

  const summary = fullContent?.description || entry.summary;

  return {
    title: entry.title,
    slug: entry.slug,
    category: entry.category,
    summary,
    keyPoints,
    url: `https://lunary.app/grimoire/${entry.slug}`,
    fullContent,
  };
}

export async function getEducationalContent(
  strategy: TopicSelectionStrategy = 'mixed',
  count: number = 1,
): Promise<GrimoireSnippet[]> {
  const topics = selectGrimoireTopics(strategy, count);
  return topics.map(extractGrimoireSnippet);
}

export function searchGrimoireForTopic(
  query: string,
  limit: number = 3,
): GrimoireSnippet[] {
  // Search both the index and our rich entries
  const indexResults = searchGrimoireIndex(query, limit);
  const richEntries = getAllRichEntries();

  // Also search rich entries by keyword/title
  const richMatches = richEntries.filter(
    (e) =>
      e.title.toLowerCase().includes(query.toLowerCase()) ||
      e.keywords.some((k) => k.toLowerCase().includes(query.toLowerCase())),
  );

  // Combine and dedupe
  const combined = [...indexResults, ...richMatches];
  const unique = combined.filter(
    (entry, index, self) =>
      index === self.findIndex((e) => e.slug === entry.slug),
  );

  return unique.slice(0, limit).map(extractGrimoireSnippet);
}

export function getGrimoireSnippetBySlug(slug: string): GrimoireSnippet | null {
  const richEntries = getAllRichEntries();
  const exact = richEntries.find(
    (r) => r.slug === slug || r.slug.endsWith(slug),
  );
  if (exact) return extractGrimoireSnippet(exact);

  // Fallback to search index
  const results = searchGrimoireIndex(slug, 10);
  const found = results.find((r) => r.slug === slug || r.slug.endsWith(slug));
  if (found) return extractGrimoireSnippet(found);

  return null;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
