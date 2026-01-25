import fs from 'fs/promises';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import type { WeeklyTheme } from '../src/lib/social/weekly-themes';

type ThemeFacet = WeeklyTheme['facets'][number];

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
  // Keep only “true index-style” buckets flat.
  // Everything else should split into subthemes so we get more weekly themes.
  'zodiac',
  'numerology',
  'chakras',
  'wheel-of-the-year',
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
  'card-combinations',
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

const digitRanges = [
  { key: '0-3', label: '0-3', from: '0', to: '3' },
  { key: '4-6', label: '4-6', from: '4', to: '6' },
  { key: '7-9', label: '7-9', from: '7', to: '9' },
];

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
  'angel-numbers': {
    kind: 'alphaRange',
    segmentIndex: 1,
    ranges: digitRanges,
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
  spells: 'tarot',
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

function buildFacet(facetSlug: string, dayIndex: number): ThemeFacet | null {
  const segment = facetSlug.split('/').filter(Boolean).pop() || '';
  const title = formatFacetTitle(segment);
  if (!title) return null;
  return {
    dayIndex,
    title,
    grimoireSlug: facetSlug,
    focus: `Meaning, themes, and how to work with ${title}.`,
    shortFormHook: `In Lunary's Grimoire, ${title} is explained through meaning, themes, and practical reflection.`,
    threads: {
      keyword: title,
      angles: [],
    },
  };
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
    const suitMatch = TAROT_SUIT_KEYWORDS.find(
      (suit) =>
        slug.includes(`/${suit}/`) ||
        slug.includes(`-${suit}-`) ||
        slug.endsWith(`-${suit}`) ||
        slug === suit ||
        slug.endsWith(`/${suit}`),
    );
    if (suitMatch) {
      return `tarot-${suitMatch}`;
    }
    if (COURT_KEYWORDS.some((term) => slug.includes(`${term}-`))) {
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

function pickFacetSlugs(slugs: string[], bucket: string): string[] {
  if (slugs.length === 0) return [];
  const rootSlug = bucket;
  const hasNonRoot = slugs.some((slug) => slug !== rootSlug);
  const filtered = hasNonRoot
    ? slugs.filter((slug) => slug !== rootSlug)
    : slugs;
  if (filtered.length <= 7) {
    return filtered;
  }
  const total = filtered.length;
  const step = Math.max(1, Math.floor(total / 7));
  const picked: string[] = [];
  const seen = new Set<string>();
  for (let i = 0; i < total && picked.length < 7; i += step) {
    const slug = filtered[Math.min(i, total - 1)];
    if (!seen.has(slug)) {
      seen.add(slug);
      picked.push(slug);
    }
  }
  if (picked.length < 7) {
    for (const slug of filtered) {
      if (picked.length >= 7) break;
      if (!seen.has(slug)) {
        seen.add(slug);
        picked.push(slug);
      }
    }
  }
  return picked;
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

export function buildThemesFromLocs(locs: string[]) {
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
      const facets: ThemeFacet[] = [];
      const selectedSlugs = pickFacetSlugs(subtheme.slugs, bucket.key);
      for (const slug of selectedSlugs) {
        const facet = buildFacet(slug, facets.length);
        if (facet) facets.push(facet);
      }
      if (facets.length === 0) continue;
      if (facets.length < 3) continue;

      const themeName = themeNameFromSubtheme(subKey);
      const id = slugify(subKey);
      themes.push({
        id,
        name: themeName,
        description: `A structured deep dive into ${themeName} from Lunary's Grimoire.`,
        category: mapBucketToCategory(bucketKey, unmappedBuckets),
        facets,
        threads: {
          keyword: themeName,
          angles: [],
        },
      });
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
  const parsed: { input?: string; output?: string } = {};
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--input') {
      parsed.input = args[i + 1];
      i += 1;
    } else if (arg === '--output') {
      parsed.output = args[i + 1];
      i += 1;
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
  const { input, output } = parseArgs(args);
  const inputPaths = await resolveInputPaths(input);
  if (inputPaths.length === 0) {
    throw new Error(
      'No sitemap XML files found. Provide --input or add ./public/sitemap.xml.',
    );
  }

  const xmlContents = await Promise.all(
    inputPaths.map((filePath) => fs.readFile(filePath, 'utf8')),
  );
  const locs = xmlContents.flatMap(extractLocsFromXml);

  const { buckets, themes, counts } = buildThemesFromLocs(locs);
  printCounts(counts);

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
