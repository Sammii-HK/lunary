import fs from 'fs/promises';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import type { WeeklyTheme } from '../src/lib/social/weekly-themes';
import type { EnrichmentData } from '../src/lib/social/types';

type ThemeFacet = WeeklyTheme['facets'][number];

// ============================================================================
// DATA ENRICHMENT: Load JSON data files for richer facet generation
// ============================================================================

interface DataEntry {
  slug: string;
  name: string;
  keywords?: string[];
  description?: string;
  meaning?: string;
  element?: string;
  ruler?: string;
  affirmation?: string;
  category?: string;
  difficulty?: string;
}

type SlugDataMap = Map<string, DataEntry>;

async function loadJsonFile(filePath: string): Promise<any> {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function slugFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function buildSlugDataMap(): Promise<SlugDataMap> {
  const map: SlugDataMap = new Map();
  const dataDir = path.resolve('src/data');

  // Tarot cards
  const tarot = await loadJsonFile(path.join(dataDir, 'tarot-cards.json'));
  if (tarot) {
    for (const arcanaKey of Object.keys(tarot)) {
      const arcana = tarot[arcanaKey];
      if (typeof arcana !== 'object') continue;
      for (const cardKey of Object.keys(arcana)) {
        const card = arcana[cardKey];
        if (!card?.name) continue;
        const slug = slugFromName(card.name);
        map.set(slug, {
          slug,
          name: card.name,
          keywords: card.keywords,
          description: card.information,
          meaning: card.uprightMeaning,
          element: card.element,
          ruler: card.planet || card.zodiacSign,
          affirmation: card.affirmation,
        });
        // Also map by the card key itself
        map.set(cardKey, map.get(slug)!);
      }
    }
  }

  // Crystals
  const crystals = await loadJsonFile(path.join(dataDir, 'crystals.json'));
  if (Array.isArray(crystals)) {
    for (const crystal of crystals) {
      if (!crystal?.name) continue;
      const slug = crystal.id || slugFromName(crystal.name);
      map.set(slug, {
        slug,
        name: crystal.name,
        keywords: crystal.keywords || crystal.properties,
        description: crystal.description,
        meaning: crystal.metaphysicalProperties,
        element: crystal.elements?.[0],
        affirmation: undefined,
      });
    }
  }

  // Angel numbers
  const angels = await loadJsonFile(path.join(dataDir, 'angel-numbers.json'));
  if (angels && typeof angels === 'object') {
    for (const numKey of Object.keys(angels)) {
      const entry = angels[numKey];
      if (!entry?.name) continue;
      const slug = slugFromName(entry.name);
      map.set(slug, {
        slug,
        name: entry.name,
        keywords: entry.keywords,
        description: entry.description,
        meaning: entry.coreMeaning || entry.meaning,
        affirmation: undefined,
      });
      // Also map by number
      map.set(numKey, map.get(slug)!);
    }
  }

  // Zodiac signs
  const zodiac = await loadJsonFile(path.join(dataDir, 'zodiac-signs.json'));
  if (zodiac && typeof zodiac === 'object') {
    for (const signKey of Object.keys(zodiac)) {
      const sign = zodiac[signKey];
      if (!sign?.name) continue;
      const slug = slugFromName(sign.name);
      map.set(slug, {
        slug,
        name: sign.name,
        keywords: sign.keywords,
        description: sign.description,
        meaning: sign.mysticalProperties,
        element: sign.element,
        ruler: sign.rulingPlanet,
        affirmation: sign.affirmation,
      });
      map.set(signKey, map.get(slug)!);
    }
  }

  // Planetary bodies
  const planets = await loadJsonFile(
    path.join(dataDir, 'planetary-bodies.json'),
  );
  if (planets && typeof planets === 'object') {
    for (const planetKey of Object.keys(planets)) {
      const planet = planets[planetKey];
      if (!planet?.name) continue;
      const slug = slugFromName(planet.name);
      map.set(slug, {
        slug,
        name: planet.name,
        keywords: planet.keywords,
        description: planet.properties,
        meaning: planet.mysticalProperties,
        affirmation: planet.affirmation,
      });
      map.set(planetKey, map.get(slug)!);
    }
  }

  // Numerology
  const numerology = await loadJsonFile(path.join(dataDir, 'numerology.json'));
  if (numerology?.angelNumbers) {
    for (const numKey of Object.keys(numerology.angelNumbers)) {
      const entry = numerology.angelNumbers[numKey];
      if (!entry?.name) continue;
      const slug = slugFromName(entry.name);
      map.set(slug, {
        slug,
        name: entry.name,
        keywords: entry.keywords,
        description: entry.description,
        meaning: entry.meaning,
        affirmation: undefined,
      });
    }
  }

  // Chakras
  const chakras = await loadJsonFile(path.join(dataDir, 'chakras.json'));
  if (chakras && typeof chakras === 'object') {
    for (const chakraKey of Object.keys(chakras)) {
      const chakra = chakras[chakraKey];
      if (!chakra?.name) continue;
      const slug = slugFromName(chakra.name);
      map.set(slug, {
        slug,
        name: chakra.name,
        keywords: chakra.keywords,
        description: chakra.properties,
        meaning: chakra.mysticalProperties,
        element: chakra.element,
        affirmation: chakra.affirmation,
      });
      map.set(chakraKey, map.get(slug)!);
    }
  }

  // Sabbats
  const sabbats = await loadJsonFile(path.join(dataDir, 'sabbats.json'));
  if (Array.isArray(sabbats)) {
    for (const sabbat of sabbats) {
      if (!sabbat?.name) continue;
      const slug = slugFromName(sabbat.name);
      map.set(slug, {
        slug,
        name: sabbat.name,
        keywords: sabbat.keywords,
        description: sabbat.description,
        meaning: sabbat.spiritualMeaning,
        element: sabbat.element,
        affirmation: sabbat.affirmation,
      });
    }
  }

  // Runes
  const runes = await loadJsonFile(path.join(dataDir, 'runes.json'));
  if (runes && typeof runes === 'object') {
    for (const runeKey of Object.keys(runes)) {
      const rune = runes[runeKey];
      if (!rune?.name) continue;
      const slug = slugFromName(rune.name);
      map.set(slug, {
        slug,
        name: rune.name,
        keywords: rune.keywords,
        description: rune.magicalProperties,
        meaning: rune.meaning,
        element: rune.element,
        affirmation: rune.affirmation,
      });
      map.set(runeKey, map.get(slug)!);
    }
  }

  // Houses
  const houses = await loadJsonFile(path.join(dataDir, 'houses.json'));
  if (houses?.houseData) {
    for (const houseKey of Object.keys(houses.houseData)) {
      const house = houses.houseData[houseKey];
      if (!house?.name) continue;
      const slug = slugFromName(house.name);
      map.set(slug, {
        slug,
        name: house.name,
        keywords: house.keywords,
        description: house.description,
        meaning: house.lifeArea,
        ruler: house.naturalRuler,
      });
      map.set(houseKey, map.get(slug)!);
    }
  }

  // Spells
  const spells = await loadJsonFile(path.join(dataDir, 'spells.json'));
  if (Array.isArray(spells)) {
    for (const spell of spells) {
      if (!spell?.title) continue;
      const slug = spell.id || slugFromName(spell.title);
      map.set(slug, {
        slug,
        name: spell.title,
        keywords: spell.correspondences?.colors || [],
        description: spell.description,
        meaning: spell.purpose,
        category: spell.category,
        difficulty: spell.difficulty,
      });
    }
  }

  // Synastry aspects
  const synastry = await loadJsonFile(
    path.join(dataDir, 'synastry-aspects.json'),
  );
  if (synastry?.aspects) {
    for (const aspectKey of Object.keys(synastry.aspects)) {
      const aspect = synastry.aspects[aspectKey];
      if (!aspect?.planet1) continue;
      const name = `${aspect.planet1} ${aspect.aspect} ${aspect.planet2}`;
      const slug = slugFromName(name);
      map.set(slug, {
        slug,
        name,
        keywords: aspect.keywords,
        description: aspect.overview,
        meaning: aspect.energyDynamic,
      });
      map.set(aspectKey, map.get(slug)!);
    }
  }

  return map;
}

let _slugDataMap: SlugDataMap | null = null;

async function getSlugDataMap(): Promise<SlugDataMap> {
  if (!_slugDataMap) {
    _slugDataMap = await buildSlugDataMap();
  }
  return _slugDataMap;
}

function lookupEnrichmentData(
  slugDataMap: SlugDataMap,
  facetSlug: string,
): DataEntry | null {
  // Try the full slug
  const segments = facetSlug.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1] || '';

  // Try exact last segment
  let data = slugDataMap.get(lastSegment);
  if (data) return data;

  // Try joining last two segments
  if (segments.length >= 2) {
    data = slugDataMap.get(`${segments[segments.length - 2]}-${lastSegment}`);
    if (data) return data;
  }

  // Try the full slug path
  data = slugDataMap.get(facetSlug.replace(/\//g, '-'));
  if (data) return data;

  return null;
}

function buildHookFromKeywords(
  keywords: string[] | undefined,
  title: string,
): string {
  if (!keywords || keywords.length === 0) {
    return `${title} reveals patterns worth knowing.`;
  }
  const top3 = keywords.slice(0, 3).join(', ');
  return `${title} connects to ${top3} in ways you can track.`;
}

export type ThemeBucket = {
  key: string;
  name: string;
  subthemes: Record<
    string,
    {
      key: string;
      name: string;
      slugs: string[];
    }
  >;
};

type BuildCounts = {
  totalLocs: number;
  totalGrimoireUrls: number;
  skippedInvalid: number;
  bucketsCount: number;
  themesCount: number;
  unmappedBuckets: number;
};

const DEFAULT_INPUT = './public/sitemap.xml';
const FALLBACK_DIRS = ['./public/sitemaps', './sitemaps'];

const FLAT_BUCKETS = new Set([
  // Keep only "true index-style" buckets flat.
  // Everything else should split into subthemes so we get more weekly themes.
  'zodiac',
  'numerology',
  'chakras',
  'wheel-of-the-year',
  'angel-numbers', // All 12 angel numbers as one theme with facet pool rotation
]);

const BLOCKED_BUCKETS = new Set([
  'horoscopes',
  'events',
  'a-z',
  'birthday',
  'guides',
  'glossary',
  'beginners',
  'compatibility',
  'practices',
  'book-of-shadows',
  'archetypes',
  'astrology',
  'astronomy-vs-astrology',
  'reversed-cards-guide',
  'synastry',
  // 'card-combinations' removed — high-engagement TikTok topics
]);

const CONDITIONALLY_BLOCKED_BUCKETS = new Set([
  'manifestation',
  'protection',
  'shadow-work',
  'jar-spells',
  'sabbats',
  'seasons',
]);

type SubthemeStrategy =
  | { kind: 'segment'; index: number }
  | {
      kind: 'alphaRange';
      segmentIndex: number;
      ranges: Array<{ key: string; label: string; from: string; to: string }>;
    }
  | {
      kind: 'hourRange';
      segmentIndex: number;
      ranges: Array<{ key: string; label: string; from: number; to: number }>;
    };

const SUBTHEME_STRATEGIES: Record<string, SubthemeStrategy> = {
  crystals: {
    kind: 'alphaRange',
    segmentIndex: 1,
    ranges: [
      { key: 'a-f', label: 'A–F', from: 'a', to: 'f' },
      { key: 'g-l', label: 'G–L', from: 'g', to: 'l' },
      { key: 'm-r', label: 'M–R', from: 'm', to: 'r' },
      { key: 's-z', label: 'S–Z', from: 's', to: 'z' },
    ],
  },
  transits: {
    kind: 'segment',
    index: 1, // Split by planet (second URL segment)
  },
  'card-combinations': {
    kind: 'segment',
    index: 1, // Split by card name
  },
  'mirror-hours': {
    kind: 'hourRange',
    segmentIndex: 1,
    ranges: [
      { key: '00-05', label: '00-05', from: 0, to: 5 },
      { key: '06-11', label: '06-11', from: 6, to: 11 },
      { key: '12-17', label: '12-17', from: 12, to: 17 },
      { key: '18-23', label: '18-23', from: 18, to: 23 },
    ],
  },
  'double-hours': {
    kind: 'hourRange',
    segmentIndex: 1,
    ranges: [
      { key: '00-05', label: '00-05', from: 0, to: 5 },
      { key: '06-11', label: '06-11', from: 6, to: 11 },
      { key: '12-17', label: '12-17', from: 12, to: 17 },
      { key: '18-23', label: '18-23', from: 18, to: 23 },
    ],
  },
};

const YEAR_SEGMENT_REGEX = /^20\d{2}$/;

const SPELL_INTENT_GROUPS = [
  {
    key: 'protection',
    label: 'Protection',
    keywords: ['protection', 'shield', 'ward', 'guard'],
  },
  {
    key: 'love',
    label: 'Love & Relationships',
    keywords: ['love', 'relationship', 'heart'],
  },
  {
    key: 'abundance',
    label: 'Abundance & Money',
    keywords: ['abundance', 'money', 'prosperity', 'wealth'],
  },
  {
    key: 'cleansing',
    label: 'Cleansing & Banishing',
    keywords: ['cleanse', 'banish', 'purify', 'smudge'],
  },
  {
    key: 'moon-phase',
    label: 'Moon Phase Spells',
    keywords: ['moon', 'new-moon', 'full-moon', 'eclipse'],
  },
  {
    key: 'chakra',
    label: 'Chakra Spells',
    keywords: ['chakra'],
  },
  {
    key: 'sabbat',
    label: 'Sabbat Spells',
    keywords: ['sabbat', 'wheel-of-the-year'],
  },
  {
    key: 'emotional-healing',
    label: 'Emotional Healing',
    keywords: ['healing', 'emotional', 'grief', 'comfort'],
  },
];

const CATEGORY_MAP: Record<string, WeeklyTheme['category']> = {
  zodiac: 'zodiac',
  tarot: 'tarot',
  moon: 'lunar',
  lunar: 'lunar',
  planets: 'planetary',
  astronomy: 'planetary',
  transits: 'planetary',
  aspects: 'planetary',
  houses: 'zodiac',
  placements: 'zodiac',
  decans: 'zodiac',
  cusps: 'zodiac',
  'birth-chart': 'zodiac',
  numerology: 'numerology',
  crystals: 'crystals',
  chakras: 'chakras',
  'wheel-of-the-year': 'sabbat',
  sabbat: 'sabbat',
  seasons: 'sabbat',
  'angel-numbers': 'numerology',
  'mirror-hours': 'numerology',
  'double-hours': 'numerology',
  spells: 'spells',
  'card-combinations': 'tarot',
};

const parser = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,
  parseTagValue: true,
  trimValues: true,
});

function titleCase(input: string) {
  return input
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0]?.toUpperCase() + word.slice(1))
    .join(' ');
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-');
}

function normalizeLoc(loc: string): string | null {
  const raw = loc.trim();
  if (!raw) return null;
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw;
  }
  if (raw.startsWith('/')) {
    return `https://lunary.app${raw}`;
  }
  return `https://lunary.app/${raw}`;
}

function extractLocsFromParsed(parsed: any): string[] {
  const locs: string[] = [];
  const urlset = parsed?.urlset?.url;
  const sitemapIndex = parsed?.sitemapindex?.sitemap;
  const toArray = (value: any) =>
    Array.isArray(value) ? value : value ? [value] : [];

  for (const item of toArray(urlset)) {
    if (typeof item?.loc === 'string') {
      locs.push(item.loc);
    }
  }

  for (const item of toArray(sitemapIndex)) {
    if (typeof item?.loc === 'string') {
      locs.push(item.loc);
    }
  }

  return locs;
}

export function extractLocsFromXml(xml: string): string[] {
  try {
    const parsed = parser.parse(xml);
    const locs = extractLocsFromParsed(parsed);
    if (locs.length > 0) return locs;
  } catch (error) {
    console.warn('XML parse failed, falling back to regex:', error);
  }

  const matches = xml.match(/<loc>(.*?)<\/loc>/g) || [];
  return matches
    .map((match) => match.replace(/<\/?loc>/g, '').trim())
    .filter(Boolean);
}

function formatFacetTitle(segment: string): string {
  const cleaned = segment.replace(/[-_]+/g, ' ').trim();
  if (!cleaned) return '';
  const camelized = cleaned
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
    .trim();
  return titleCase(camelized);
}

function buildFacet(
  facetSlug: string,
  dayIndex: number,
  slugDataMap?: SlugDataMap,
): ThemeFacet | null {
  const segment = facetSlug.split('/').filter(Boolean).pop() || '';
  const title = formatFacetTitle(segment);
  if (!title) return null;

  // Try to enrich with JSON data
  const data = slugDataMap
    ? lookupEnrichmentData(slugDataMap, facetSlug)
    : null;

  let focus: string;
  let shortFormHook: string;
  let enrichmentData: EnrichmentData | undefined;

  if (data) {
    const descSnippet = data.description || data.meaning || '';
    const keywordsSnippet =
      data.keywords && data.keywords.length > 0
        ? ` Key themes: ${data.keywords.slice(0, 3).join(', ')}.`
        : '';
    focus = descSnippet
      ? `${descSnippet.slice(0, 120)}${descSnippet.length > 120 ? '...' : ''}.${keywordsSnippet}`
      : `Meaning, themes, and how to work with ${title}.${keywordsSnippet}`;
    shortFormHook =
      data.affirmation || buildHookFromKeywords(data.keywords, title);

    enrichmentData = {
      keywords: data.keywords,
      element: data.element,
      ruler: data.ruler,
      affirmation: data.affirmation,
      meaning: data.meaning,
      description: data.description,
      category: data.category,
      difficulty: data.difficulty,
    };
  } else {
    focus = `Meaning, themes, and how to work with ${title}.`;
    shortFormHook = `In Lunary's Grimoire, ${title} is explained through meaning, themes, and practical reflection.`;
  }

  const facet: ThemeFacet = {
    dayIndex,
    title,
    grimoireSlug: facetSlug,
    focus,
    shortFormHook,
    threads: {
      keyword: title,
      angles: [],
    },
  };

  if (enrichmentData) {
    facet.enrichmentData = enrichmentData;
  }

  return facet;
}

function bucketNameFromKey(bucket: string) {
  return titleCase(bucket.replace(/-/g, ' '));
}

const MAJOR_ARCANA_KEYWORDS = new Set([
  'fool',
  'magician',
  'high-priestess',
  'empress',
  'emperor',
  'hierophant',
  'lovers',
  'chariot',
  'strength',
  'hermit',
  'wheel-of-fortune',
  'justice',
  'hanged-man',
  'death',
  'temperance',
  'devil',
  'tower',
  'star',
  'moon',
  'sun',
  'judgement',
  'world',
  'high-priest',
]);

const TAROT_SUIT_KEYWORDS = ['cups', 'swords', 'wands', 'pentacles'];
const COURT_KEYWORDS = ['mother', 'father', 'son', 'daughter'];

function getHourRangeKey(
  segment: string,
  bucket: string,
  ranges: Array<{ key: string; label: string; from: number; to: number }>,
) {
  const match = segment.match(/^(\d{2})-/);
  if (!match) return `${bucket}-core`;
  const hour = Number(match[1]);
  if (Number.isNaN(hour)) return `${bucket}-core`;
  for (const range of ranges) {
    if (range.from <= hour && hour <= range.to) {
      return `${bucket}-${range.key}`;
    }
  }
  return `${bucket}-core`;
}

function getSpellIntent(segments: string[]) {
  const normalized = segments.map((segment) => segment.toLowerCase()).join(' ');
  for (const group of SPELL_INTENT_GROUPS) {
    if (group.keywords.some((keyword) => normalized.includes(keyword))) {
      return group;
    }
  }
  return null;
}

function subthemeKey(bucket: string, segments: string[]) {
  if (bucket === 'spells') {
    const intent = getSpellIntent(segments);
    if (!intent) return null;
    return `spells-${intent.key}`;
  }

  if (bucket === 'tarot') {
    const secondSegment = (segments[1] || '').toLowerCase();
    const slug = segments.join('/').toLowerCase();

    if (secondSegment === 'spreads') {
      return 'tarot-spreads';
    }
    if (secondSegment === 'yes-or-no') {
      return 'tarot-yes-no';
    }
    if (
      secondSegment.startsWith('the-') ||
      MAJOR_ARCANA_KEYWORDS.has(secondSegment)
    ) {
      return 'tarot-major-arcana';
    }
    // Check for court cards first (more specific match)
    const isCourt = COURT_KEYWORDS.some((term) => slug.includes(`${term}-`));
    const suitMatch = TAROT_SUIT_KEYWORDS.find(
      (suit) =>
        slug.includes(`/${suit}/`) ||
        slug.includes(`-${suit}-`) ||
        slug.endsWith(`-${suit}`) ||
        slug === suit ||
        slug.endsWith(`/${suit}`),
    );
    if (suitMatch) {
      // Split suits into numbered vs court cards for more weekly themes
      if (isCourt) {
        return `tarot-${suitMatch}-court`;
      }
      return `tarot-${suitMatch}-numbered`;
    }
    if (isCourt) {
      return 'tarot-court-cards';
    }
    return 'tarot-core';
  }

  const strategy = SUBTHEME_STRATEGIES[bucket];
  if (strategy?.kind === 'alphaRange') {
    const segment = (segments[strategy.segmentIndex] || '').toLowerCase();
    const firstChar = segment[0];
    if (firstChar) {
      for (const range of strategy.ranges) {
        if (firstChar >= range.from && firstChar <= range.to) {
          return `${bucket}-${range.key}`;
        }
      }
    }
    return `${bucket}-core`;
  }
  if (strategy?.kind === 'hourRange') {
    const segment = (segments[strategy.segmentIndex] || '').toLowerCase();
    return getHourRangeKey(segment, bucket, strategy.ranges);
  }
  if (FLAT_BUCKETS.has(bucket)) {
    return `${bucket}-core`;
  }
  if (segments.length > 1) {
    return `${bucket}-${segments[1]}`;
  }
  return `${bucket}-core`;
}

function findThemeBucket(key: string) {
  const bucketCandidates = [
    ...new Set([
      ...Object.keys(SUBTHEME_STRATEGIES),
      ...FLAT_BUCKETS,
      'tarot',
      'spells',
      'card-combinations',
    ]),
  ].sort((a, b) => b.length - a.length);

  for (const bucket of bucketCandidates) {
    if (key === bucket || key.startsWith(`${bucket}-`)) {
      const range = key === bucket ? '' : key.slice(bucket.length + 1);
      return { bucket, range };
    }
  }
  return { bucket: key, range: '' };
}

const THEME_NAME_OVERRIDES: Record<string, string> = {
  'Aspects Types': 'Astrological Aspect Types',
  'Astronomy Planets': 'Planets in Astronomy',
  'Spells Chakra Spells': 'Chakra Spells',
};

function cleanThemeName(raw: string) {
  const normalized = raw.replace(/-/g, ' ').replace(/\s+/g, ' ').trim();
  const override = THEME_NAME_OVERRIDES[normalized];
  if (override) {
    return override;
  }
  return titleCase(normalized);
}

function themeNameFromSubtheme(key: string) {
  const { bucket, range } = findThemeBucket(key);
  const strategy = SUBTHEME_STRATEGIES[bucket];
  if (strategy?.kind === 'alphaRange' && range) {
    const match = strategy.ranges.find((item) => item.key === range);
    if (match) {
      return cleanThemeName(
        `${titleCase(bucket)} ${formatRangeLabel(match.label)}`,
      );
    }
  }
  if (strategy?.kind === 'hourRange' && range) {
    const match = strategy.ranges.find((item) => item.key === range);
    if (match) {
      return cleanThemeName(
        `${titleCase(bucket)} ${formatRangeLabel(match.label)}`,
      );
    }
  }
  if (bucket === 'spells' && range) {
    const group = SPELL_INTENT_GROUPS.find((item) => item.key === range);
    if (group) {
      return cleanThemeName(`${titleCase(bucket)} ${group.label}`);
    }
  }
  return cleanThemeName(key);
}

function mapBucketToCategory(bucket: string, unmapped: Set<string>) {
  const mapped = CATEGORY_MAP[bucket];
  if (!mapped) {
    unmapped.add(bucket);
    return 'zodiac';
  }
  return mapped;
}

/**
 * Select facet slugs for a theme.
 * Returns { primary: 7 slugs for facets, pool: all slugs for facetPool rotation }
 */
function pickFacetSlugs(
  slugs: string[],
  bucket: string,
  fallbackSlugs: string[] = [],
): { primary: string[]; pool: string[] } {
  if (slugs.length === 0) return { primary: [], pool: [] };
  const rootSlug = bucket;
  const hasNonRoot = slugs.some((slug) => slug !== rootSlug);
  const filtered = hasNonRoot
    ? slugs.filter((slug) => slug !== rootSlug)
    : slugs;

  // If we have more than 7, return first 7 as primary and ALL as pool for rotation
  if (filtered.length > 7) {
    return {
      primary: filtered.slice(0, 7),
      pool: filtered,
    };
  }

  // If we have exactly 7, use them all
  if (filtered.length === 7) {
    return { primary: filtered, pool: [] };
  }

  // If we have fewer than 7, pad from fallbacks
  const picked = [...filtered];
  const seen = new Set(picked);

  for (const slug of fallbackSlugs) {
    if (picked.length >= 7) break;
    if (!seen.has(slug) && slug !== rootSlug) {
      seen.add(slug);
      picked.push(slug);
    }
  }

  return { primary: picked, pool: [] };
}

function formatRangeLabel(label: string) {
  return label.replace(/-/g, '–');
}

function bucketNonRootSlugCount(
  subthemes: ThemeBucket['subthemes'],
  bucket: string,
) {
  let count = 0;
  for (const subtheme of Object.values(subthemes)) {
    count += subtheme.slugs.filter((slug) => slug !== bucket).length;
  }
  return count;
}

export function buildThemesFromLocs(locs: string[], slugDataMap?: SlugDataMap) {
  const buckets: Record<string, ThemeBucket> = {};
  let skippedInvalid = 0;
  let totalGrimoireUrls = 0;
  const unmappedBuckets = new Set<string>();

  for (const loc of locs) {
    const normalized = normalizeLoc(loc);
    if (!normalized) {
      skippedInvalid += 1;
      continue;
    }

    let url: URL;
    try {
      url = new URL(normalized);
    } catch {
      skippedInvalid += 1;
      continue;
    }

    const pathname = url.pathname || '';
    if (!pathname.startsWith('/grimoire')) {
      continue;
    }

    const slug = pathname
      .replace(/^\/grimoire\/?/, '')
      .replace(/^\/+|\/+$/g, '');
    if (!slug) {
      continue;
    }

    const segments = slug.split('/').filter(Boolean);
    const bucket = segments[0];
    if (!bucket) {
      skippedInvalid += 1;
      continue;
    }
    if (segments[1] && YEAR_SEGMENT_REGEX.test(segments[1])) {
      continue;
    }
    if (BLOCKED_BUCKETS.has(bucket)) {
      continue;
    }

    totalGrimoireUrls += 1;

    if (!buckets[bucket]) {
      buckets[bucket] = {
        key: bucket,
        name: bucketNameFromKey(bucket),
        subthemes: {},
      };
    }

    const subKey = subthemeKey(bucket, segments);
    if (!subKey) {
      continue;
    }
    if (!buckets[bucket].subthemes[subKey]) {
      buckets[bucket].subthemes[subKey] = {
        key: subKey,
        name: themeNameFromSubtheme(subKey),
        slugs: [],
      };
    }

    const subtheme = buckets[bucket].subthemes[subKey];
    if (!subtheme.slugs.includes(slug)) {
      subtheme.slugs.push(slug);
    }
  }

  const orderedBuckets: Record<string, ThemeBucket> = {};
  const bucketKeys = Object.keys(buckets).sort();
  for (const bucketKey of bucketKeys) {
    const bucket = buckets[bucketKey];
    const subthemesOrdered: ThemeBucket['subthemes'] = {};
    const subKeys = Object.keys(bucket.subthemes).sort();
    for (const subKey of subKeys) {
      const subtheme = bucket.subthemes[subKey];
      const slugs = [...subtheme.slugs];
      subthemesOrdered[subKey] = {
        key: subtheme.key,
        name: subtheme.name,
        slugs,
      };
    }
    orderedBuckets[bucketKey] = {
      key: bucket.key,
      name: bucket.name,
      subthemes: subthemesOrdered,
    };
  }

  const themes: WeeklyTheme[] = [];
  for (const bucketKey of Object.keys(orderedBuckets).sort()) {
    const bucket = orderedBuckets[bucketKey];
    if (
      CONDITIONALLY_BLOCKED_BUCKETS.has(bucketKey) &&
      bucketNonRootSlugCount(bucket.subthemes, bucket.key) < 3
    ) {
      continue;
    }

    // Collect all slugs from this bucket as fallback pool for padding themes to 7 facets
    const allBucketSlugs = Object.values(bucket.subthemes).flatMap(
      (sub) => sub.slugs,
    );

    for (const subKey of Object.keys(bucket.subthemes).sort()) {
      const subtheme = bucket.subthemes[subKey];
      if (subKey.endsWith('-core')) {
        const nonRootCount = subtheme.slugs.filter(
          (slug) => slug !== bucket.key,
        ).length;
        if (nonRootCount < 3) {
          continue;
        }
      }
      const { primary: selectedSlugs, pool: poolSlugs } = pickFacetSlugs(
        subtheme.slugs,
        bucket.key,
        allBucketSlugs,
      );

      const facets: ThemeFacet[] = [];
      for (const slug of selectedSlugs) {
        const facet = buildFacet(slug, facets.length, slugDataMap);
        if (facet) facets.push(facet);
      }
      if (facets.length === 0) continue;
      if (facets.length < 3) continue;

      // Build facetPool if we have more slugs than the primary 7
      const facetPool: ThemeFacet[] = [];
      if (poolSlugs.length > 0) {
        for (const slug of poolSlugs) {
          const facet = buildFacet(slug, facetPool.length, slugDataMap);
          if (facet) facetPool.push(facet);
        }
      }

      const themeName = themeNameFromSubtheme(subKey);
      const id = slugify(subKey);
      const theme: WeeklyTheme = {
        id,
        name: themeName,
        description: `A structured deep dive into ${themeName} from Lunary's Grimoire.`,
        category: mapBucketToCategory(bucketKey, unmappedBuckets),
        facets,
        threads: {
          keyword: themeName,
          angles: [],
        },
      };

      // Add facetPool for themes with more than 7 topics (enables weekly rotation)
      if (facetPool.length > 0) {
        theme.facetPool = facetPool;
      }

      themes.push(theme);
    }
  }

  const counts: BuildCounts = {
    totalLocs: locs.length,
    totalGrimoireUrls,
    skippedInvalid,
    bucketsCount: Object.keys(orderedBuckets).length,
    themesCount: themes.length,
    unmappedBuckets: unmappedBuckets.size,
  };

  return { buckets: orderedBuckets, themes, counts, unmappedBuckets };
}

// ============================================================================
// PHASE 0B: Generate new themes from JSON data entries beyond sitemap
// ============================================================================

async function generateDataThemes(
  slugDataMap: SlugDataMap,
): Promise<WeeklyTheme[]> {
  const themes: WeeklyTheme[] = [];
  const dataDir = path.resolve('src/data');

  // 1. SPELLS: Group 201 spells by category into weekly themes
  const spells = await loadJsonFile(path.join(dataDir, 'spells.json'));
  if (Array.isArray(spells)) {
    const spellsByCategory: Record<string, any[]> = {};
    for (const spell of spells) {
      const cat = spell.category || 'general';
      if (!spellsByCategory[cat]) spellsByCategory[cat] = [];
      spellsByCategory[cat].push(spell);
    }

    for (const [category, categorySpells] of Object.entries(spellsByCategory)) {
      if (categorySpells.length < 3) continue;
      const facets: ThemeFacet[] = [];
      const pool: ThemeFacet[] = [];

      for (let i = 0; i < categorySpells.length; i++) {
        const spell = categorySpells[i];
        const slug = spell.id || slugFromName(spell.title);
        const facet: ThemeFacet = {
          dayIndex: facets.length < 7 ? facets.length : pool.length,
          title: spell.title,
          grimoireSlug: `spells/${slug}`,
          focus: spell.purpose
            ? `${spell.purpose}. ${spell.difficulty || 'beginner'} level.`
            : `A ${spell.difficulty || 'beginner'} ${category} spell.`,
          shortFormHook: spell.description
            ? spell.description.slice(0, 100)
            : `Learn to cast ${spell.title} with practical ingredients and timing.`,
          threads: { keyword: spell.title, angles: [] },
          enrichmentData: {
            keywords: spell.correspondences?.colors || [],
            description: spell.description,
            meaning: spell.purpose,
            category: spell.category,
            difficulty: spell.difficulty,
          },
        };

        if (facets.length < 7) {
          facets.push(facet);
        } else {
          pool.push(facet);
        }
      }

      if (facets.length < 3) continue;

      const themeName = `${titleCase(category)} Spells`;
      const id = slugify(`spells-${category}`);
      const theme: WeeklyTheme = {
        id,
        name: themeName,
        description: `A collection of ${category} spells with practical rituals and timing.`,
        category: 'spells',
        facets,
        threads: { keyword: themeName, angles: [] },
      };
      if (pool.length > 0) {
        theme.facetPool = pool;
      }
      themes.push(theme);
    }
  }

  // 2. PLANET-SIGN COMBINATIONS from planet-sign-content.ts
  try {
    const { planetDescriptions, signDescriptions } =
      await import('../src/constants/seo/planet-sign-content');

    if (planetDescriptions && signDescriptions) {
      const signKeys = Object.keys(signDescriptions);

      for (const planetSlug of Object.keys(planetDescriptions)) {
        const planet = planetDescriptions[planetSlug];
        if (!planet?.name) continue;

        const facets: ThemeFacet[] = [];
        const pool: ThemeFacet[] = [];

        for (const signSlug of signKeys) {
          const sign = signDescriptions[signSlug];
          if (!sign?.name) continue;
          const title = `${planet.name} in ${sign.name}`;
          const slug = `placements/${planetSlug}-in-${signSlug}`;
          const facet: ThemeFacet = {
            dayIndex: facets.length < 7 ? facets.length : pool.length,
            title,
            grimoireSlug: slug,
            focus: `How ${planet.name} expresses through ${sign.name}. ${sign.element} element, ${sign.modality} modality.`,
            shortFormHook: `${planet.name} in ${sign.name} creates a distinct pattern in how ${planet.themes?.split(',')[0]?.trim() || 'energy'} operates.`,
            threads: { keyword: title, angles: [] },
            enrichmentData: {
              element: sign.element,
              ruler: sign.ruler,
              meaning: `${planet.name} governs ${planet.themes || 'key life themes'}. In ${sign.name}, this energy becomes ${sign.traits?.split(',')[0]?.trim() || 'distinctive'}.`,
            },
          };

          if (facets.length < 7) {
            facets.push(facet);
          } else {
            pool.push(facet);
          }
        }

        if (facets.length < 3) continue;

        const themeName = `${planet.name} Through the Signs`;
        const id = slugify(`planetary-${planetSlug}-signs`);
        const theme: WeeklyTheme = {
          id,
          name: themeName,
          description: `How ${planet.name} expresses differently in each zodiac sign.`,
          category: 'planetary',
          facets,
          threads: { keyword: themeName, angles: [] },
        };
        if (pool.length > 0) {
          theme.facetPool = pool;
        }
        themes.push(theme);
      }
    }
  } catch {
    // planet-sign-content not available
  }

  // 3. SYNASTRY ASPECTS: Group by aspect type
  const synastry = await loadJsonFile(
    path.join(dataDir, 'synastry-aspects.json'),
  );
  if (synastry?.aspects) {
    const byType: Record<string, any[]> = {};
    for (const key of Object.keys(synastry.aspects)) {
      const aspect = synastry.aspects[key];
      const type = aspect.aspectType || aspect.aspect || 'other';
      if (!byType[type]) byType[type] = [];
      byType[type].push({ ...aspect, _key: key });
    }

    for (const [aspectType, aspectList] of Object.entries(byType)) {
      if (aspectList.length < 3) continue;
      const facets: ThemeFacet[] = [];
      const pool: ThemeFacet[] = [];

      for (const aspect of aspectList) {
        const title = `${aspect.planet1} ${aspectType} ${aspect.planet2}`;
        const slug = `synastry/${aspect._key}`;
        const facet: ThemeFacet = {
          dayIndex: facets.length < 7 ? facets.length : pool.length,
          title,
          grimoireSlug: slug,
          focus:
            aspect.overview ||
            `The ${aspectType} between ${aspect.planet1} and ${aspect.planet2}.`,
          shortFormHook:
            aspect.energyDynamic ||
            `${title} creates a specific relational dynamic.`,
          threads: { keyword: title, angles: [] },
          enrichmentData: {
            keywords: aspect.keywords,
            meaning: aspect.energyDynamic,
            description: aspect.overview,
          },
        };

        if (facets.length < 7) {
          facets.push(facet);
        } else {
          pool.push(facet);
        }
      }

      if (facets.length < 3) continue;

      const themeName = `Synastry ${titleCase(aspectType)} Aspects`;
      const id = slugify(`synastry-${aspectType}`);
      const theme: WeeklyTheme = {
        id,
        name: themeName,
        description: `${titleCase(aspectType)} aspects in synastry — how they shape relationships.`,
        category: 'zodiac',
        facets,
        threads: { keyword: themeName, angles: [] },
      };
      if (pool.length > 0) {
        theme.facetPool = pool;
      }
      themes.push(theme);
    }
  }

  return themes;
}

function printCounts(counts: BuildCounts) {
  console.log('[themes] totalLocs:', counts.totalLocs);
  console.log('[themes] totalGrimoireUrls:', counts.totalGrimoireUrls);
  console.log('[themes] skippedInvalid:', counts.skippedInvalid);
  console.log('[themes] bucketsCount:', counts.bucketsCount);
  console.log('[themes] themesCount:', counts.themesCount);
  if (counts.unmappedBuckets > 0) {
    console.log('[themes] unmappedBuckets:', counts.unmappedBuckets);
  }
}

function toGeneratedFileContent(
  buckets: Record<string, ThemeBucket>,
  themes: WeeklyTheme[],
) {
  const header =
    '// AUTO-GENERATED. Do not edit by hand. Run pnpm generate:themes\n';
  const bucketsJson = JSON.stringify(buckets, null, 2);
  const themesJson = JSON.stringify(themes, null, 2);
  return `${header}
import type { WeeklyTheme } from '@/lib/social/weekly-themes';

export type ThemeBucket = {
  key: string;
  name: string;
  subthemes: Record<
    string,
    {
      key: string;
      name: string;
      slugs: string[];
    }
  >;
};

export const generatedThemeBuckets: Record<string, ThemeBucket> = ${bucketsJson};

export const generatedCategoryThemes: WeeklyTheme[] = ${themesJson};
`;
}

function parseArgs(args: string[]) {
  const parsed: {
    input?: string;
    output?: string;
    includeDataThemes?: boolean;
  } = { includeDataThemes: true };
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--input') {
      parsed.input = args[i + 1];
      i += 1;
    } else if (arg === '--output') {
      parsed.output = args[i + 1];
      i += 1;
    } else if (arg === '--no-data-themes') {
      parsed.includeDataThemes = false;
    } else if (arg === '--include-data-themes') {
      parsed.includeDataThemes = true;
    }
  }
  return parsed;
}

async function resolveInputPaths(input?: string) {
  if (input) {
    const stats = await fs.stat(input);
    if (stats.isDirectory()) {
      const files = await fs.readdir(input);
      return files
        .filter((file) => file.endsWith('.xml'))
        .sort()
        .map((file) => path.join(input, file));
    }
    return [input];
  }

  try {
    await fs.access(DEFAULT_INPUT);
    return [DEFAULT_INPUT];
  } catch {
    // Continue to fallback directories.
  }

  const fallbackFiles: string[] = [];
  for (const dir of FALLBACK_DIRS) {
    try {
      const files = await fs.readdir(dir);
      for (const file of files) {
        if (file.endsWith('.xml')) {
          fallbackFiles.push(path.join(dir, file));
        }
      }
    } catch {
      // Ignore missing directories.
    }
  }

  return fallbackFiles.sort();
}

export async function runCli(args = process.argv.slice(2)) {
  const { input, output, includeDataThemes } = parseArgs(args);
  const inputPaths = await resolveInputPaths(input);
  if (inputPaths.length === 0) {
    throw new Error(
      'No sitemap XML files found. Provide --input or add ./public/sitemap.xml.',
    );
  }

  // Load enrichment data from JSON files
  const slugDataMap = await getSlugDataMap();
  console.log(
    `[themes] loaded ${slugDataMap.size} data entries for enrichment`,
  );

  const xmlContents = await Promise.all(
    inputPaths.map((filePath) => fs.readFile(filePath, 'utf8')),
  );
  const locs = xmlContents.flatMap(extractLocsFromXml);

  const { buckets, themes, counts } = buildThemesFromLocs(locs, slugDataMap);
  printCounts(counts);

  // Second pass: generate themes from JSON data entries beyond sitemap
  if (includeDataThemes !== false) {
    const dataThemes = await generateDataThemes(slugDataMap);
    themes.push(...dataThemes);
    console.log(
      `[themes] added ${dataThemes.length} data-driven themes (spells, planet-sign, synastry)`,
    );
    console.log(`[themes] total themes: ${themes.length}`);
  }

  const outputPath = output || 'src/constants/seo/generated-category-themes.ts';
  const fileContent = toGeneratedFileContent(buckets, themes);
  await fs.writeFile(outputPath, fileContent, 'utf8');
  console.log('[themes] wrote', outputPath);
}

if (process.argv[1]?.includes('generateThemesFromSitemap')) {
  runCli().catch((error) => {
    console.error('[themes] failed:', error);
    process.exit(1);
  });
}
