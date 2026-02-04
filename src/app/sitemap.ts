import { MetadataRoute } from 'next';
import { readFileSync, statSync } from 'node:fs';
import { resolve as resolvePath, relative as relativePath } from 'node:path';
import { execFileSync } from 'node:child_process';
import { grimoire } from '@/constants/grimoire';
import { sectionToSlug } from '@/utils/grimoire';
import spellsJson from '@/data/spells.json';
import { crystalDatabase } from '@/constants/grimoire/crystals';
import { runesList } from '@/constants/runes';
import { chakras } from '@/constants/chakras';
import { tarotCards } from '../../utils/tarot/tarot-cards';
import { tarotSpreads } from '@/constants/tarot';
import { monthlyMoonPhases } from '../../utils/moon/monthlyPhases';
import { annualFullMoons } from '@/constants/moon/annualFullMoons';
import { zodiacSigns, planetaryBodies } from '../../utils/zodiac/zodiac';
import { wheelOfTheYearSabbats } from '@/constants/sabbats';
import { correspondencesData } from '@/constants/grimoire/correspondences';
import witchTypesData from '@/constants/witch-types.json';
import {
  astrologicalHouses,
  astrologicalAspects,
  retrogradeInfo,
  eclipseInfo,
} from '@/constants/grimoire/seo-data';
import { lifePathNumbers } from '@/constants/grimoire/numerology-data';
import { getAllAngelNumberSlugs } from '@/lib/angel-numbers/getAngelNumber';
import {
  mirrorHourKeys,
  doubleHourKeys,
} from '@/constants/grimoire/clock-numbers-data';
import {
  karmicDebtKeys,
  expressionKeys,
  soulUrgeKeys,
} from '@/constants/grimoire/numerology-extended-data';
import { stringToKebabCase } from '../../utils/string';
import dayjs from 'dayjs';
import { getAllProducts } from '@/lib/shop/generators';
import { getAllSynastryAspectSlugs } from '@/constants/seo/synastry-aspects';
import { getAllCompatibilitySlugs } from '@/constants/seo/compatibility-content';
import {
  signDescriptions,
  planetDescriptions,
} from '@/constants/seo/planet-sign-content';

const PROJECT_ROOT = process.cwd();
const LAST_MODIFIED_MANIFEST_PATH = resolvePath(
  PROJECT_ROOT,
  'data',
  'sitemap-last-modified.json',
);
const lastModifiedCache = new Map<string, Date | null>();
let manifestCache: Record<string, string | null> = {};
let manifestLoaded = false;

function ensureManifestCache(): Record<string, string | null> {
  if (manifestLoaded) {
    return manifestCache;
  }

  try {
    const content = readFileSync(LAST_MODIFIED_MANIFEST_PATH, 'utf8');
    manifestCache = JSON.parse(content);
  } catch {
    manifestCache = {};
  }

  manifestLoaded = true;

  return manifestCache;
}

function getManifestLastModified(path: string): Date | null {
  const manifest = ensureManifestCache();
  const entry = manifest[path];
  if (!entry) {
    return null;
  }

  const parsed = new Date(entry);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function resolveProjectPath(filePath: string) {
  return resolvePath(PROJECT_ROOT, filePath);
}

function getGitLastModified(filePath: string): Date | null {
  const relative = filePath.startsWith(PROJECT_ROOT)
    ? relativePath(PROJECT_ROOT, filePath)
    : filePath;

  try {
    const output = execFileSync(
      'git',
      ['log', '-1', '--format=%cI', '--', relative],
      {
        cwd: PROJECT_ROOT,
        stdio: ['ignore', 'pipe', 'ignore'],
      },
    )
      .toString()
      .trim();

    if (!output) {
      return new Date();
    }

    const date = new Date(output);
    return Number.isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

function getFileLastModified(filePath: string): Date | null {
  const resolvedPath = resolveProjectPath(filePath);
  if (lastModifiedCache.has(resolvedPath)) {
    return lastModifiedCache.get(resolvedPath) ?? null;
  }

  try {
    const date =
      getGitLastModified(resolvedPath) ?? statSync(resolvedPath).mtime;
    lastModifiedCache.set(resolvedPath, date);
    return date;
  } catch {
    lastModifiedCache.set(resolvedPath, null);
    return null;
  }
}

function getLastModifiedFromPaths(paths?: string[]): Date | null {
  if (!paths?.length) {
    return null;
  }

  const dates = paths
    .map((path) => getManifestLastModified(path) ?? getFileLastModified(path))
    .filter((entry): entry is Date => Boolean(entry))
    .map((date) => date.getTime());

  if (!dates.length) {
    return null;
  }

  return new Date(Math.max(...dates));
}

export default function sitemap(): MetadataRoute.Sitemap {
  // Use canonical domain (non-www)
  const baseUrl = 'https://lunary.app';
  const date =
    getLastModifiedFromPaths([
      'src/app',
      'src/constants',
      'src/lib',
      'src/data',
    ]) ?? new Date();

  type RouteConfig = {
    path: string;
    changeFrequency?: MetadataRoute.Sitemap[number]['changeFrequency'];
    priority?: number;
    sourceFiles?: string[];
    lastModified?: Date;
  };

  const normalizePath = (path: string) => {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const trimmed = path.replace(/^\/+/, '').replace(/\/+$/, '');
    if (!trimmed) {
      return baseUrl;
    }

    return `${baseUrl}/${trimmed}`;
  };

  const createRouteEntry = ({
    path,
    changeFrequency = 'monthly',
    priority = 0.6,
    sourceFiles,
    lastModified,
  }: RouteConfig): MetadataRoute.Sitemap[number] => ({
    url: normalizePath(path),
    lastModified: lastModified ?? getLastModifiedFromPaths(sourceFiles) ?? date,
    changeFrequency,
    priority,
  });

  const staticPageSources: Record<string, string[]> = {
    '': ['src/app/page.tsx'],
    pricing: ['src/app/pricing/page.tsx'],
    'comparison/best-personalized-astrology-apps': [
      'src/app/comparison/best-personalized-astrology-apps/page.tsx',
    ],
    blog: ['src/app/blog/page.tsx'],
    grimoire: ['src/app/grimoire/page.tsx'],
    'grimoire/astrology': ['src/app/grimoire/astrology/page.tsx'],
    'grimoire/tarot': ['src/app/grimoire/tarot/page.tsx'],
    'grimoire/tarot/yes-or-no': ['src/app/grimoire/tarot/yes-or-no/page.tsx'],
    'grimoire/tarot/yes-or-no/love-timeframe': [
      'src/app/grimoire/tarot/yes-or-no/love-timeframe/page.tsx',
    ],
    'grimoire/zodiac': ['src/app/grimoire/zodiac/page.tsx'],
    'grimoire/spells': ['src/app/grimoire/spells/page.tsx'],
    'grimoire/practices': ['src/app/grimoire/practices/page.tsx'],
    'grimoire/events': ['src/app/grimoire/events/page.tsx'],
    'grimoire/events/2025': ['src/app/grimoire/events/page.tsx'],
    'grimoire/guides': ['src/app/grimoire/guides/page.tsx'],
    'grimoire/compatibility': ['src/app/grimoire/compatibility/page.tsx'],
    'grimoire/eclipses': ['src/app/grimoire/eclipses/page.tsx'],
    'grimoire/houses': ['src/app/grimoire/houses/page.tsx'],
    'grimoire/aspects': ['src/app/grimoire/aspects/page.tsx'],
    'grimoire/numerology': ['src/app/grimoire/numerology/page.tsx'],
    'grimoire/astronomy/retrogrades': [
      'src/app/grimoire/astronomy/retrogrades/page.tsx',
    ],
    'grimoire/lunar-nodes': ['src/app/grimoire/lunar-nodes/page.tsx'],
    'grimoire/transits': ['src/app/grimoire/transits/page.tsx'],
    'grimoire/moon': ['src/app/grimoire/moon/page.tsx'],
    'grimoire/crystals': ['src/app/grimoire/crystals/page.tsx'],
    'grimoire/runes': ['src/app/grimoire/runes/page.tsx'],
    'grimoire/candle-magic': ['src/app/grimoire/candle-magic/page.tsx'],
    'grimoire/correspondences': ['src/app/grimoire/correspondences/page.tsx'],
    'grimoire/decans': ['src/app/grimoire/decans/page.tsx'],
    'grimoire/cusps': ['src/app/grimoire/cusps/page.tsx'],
    'grimoire/seasons': ['src/app/grimoire/seasons/page.tsx'],
    'grimoire/placements': ['src/app/grimoire/placements/page.tsx'],
    'grimoire/birthday': ['src/app/grimoire/birthday/page.tsx'],
    'grimoire/chinese-zodiac': ['src/app/grimoire/chinese-zodiac/page.tsx'],
    'grimoire/wheel-of-the-year': [
      'src/app/grimoire/wheel-of-the-year/page.tsx',
    ],
    'grimoire/chakras': ['src/app/grimoire/chakras/page.tsx'],
    'grimoire/divination': ['src/app/grimoire/divination/page.tsx'],
    'grimoire/meditation': ['src/app/grimoire/meditation/page.tsx'],
    'grimoire/modern-witchcraft': [
      'src/app/grimoire/modern-witchcraft/page.tsx',
    ],
    shop: ['src/app/shop/page.tsx'],
    comparison: ['src/app/comparison/page.tsx'],
    horoscope: ['src/app/horoscope/page.tsx'],
    tarot: ['src/app/tarot/page.tsx'],
    'birth-chart': ['src/app/birth-chart/page.tsx'],
    guide: ['src/app/guide/page.tsx'],
    help: ['src/app/help/page.tsx'],
    'press-kit': ['src/app/press-kit/page.tsx'],
    privacy: ['src/app/privacy/page.tsx'],
    terms: ['src/app/terms/page.tsx'],
    cookies: ['src/app/cookies/page.tsx'],
    refund: ['src/app/refund/page.tsx'],
    'acceptable-use': ['src/app/acceptable-use/page.tsx'],
    accessibility: ['src/app/accessibility/page.tsx'],
    'api-terms': ['src/app/api-terms/page.tsx'],
    'referral-terms': ['src/app/referral-terms/page.tsx'],
    dmca: ['src/app/dmca/page.tsx'],
    trademark: ['src/app/trademark/page.tsx'],
    'building-lunary': ['src/app/building-lunary/page.tsx'],
    'moon-circles': ['src/app/moon-circles/page.tsx'],
    launch: ['src/app/launch/page.tsx'],
    'product-hunt': ['src/app/product-hunt/page.tsx'],
    'cosmic-report-generator': ['src/app/cosmic-report-generator/page.tsx'],
    'comparison/lunary-vs-costar': [
      'src/app/comparison/lunary-vs-costar/page.tsx',
    ],
    'comparison/lunary-vs-pattern': [
      'src/app/comparison/lunary-vs-pattern/page.tsx',
    ],
    'comparison/lunary-vs-moonly': [
      'src/app/comparison/lunary-vs-moonly/page.tsx',
    ],
    'comparison/lunary-vs-lunar-guide': [
      'src/app/comparison/lunary-vs-lunar-guide/page.tsx',
    ],
    'comparison/lunary-vs-arcarae': [
      'src/app/comparison/lunary-vs-arcarae/page.tsx',
    ],
    'comparison/personalized-vs-generic-astrology': [
      'src/app/comparison/personalized-vs-generic-astrology/page.tsx',
    ],
    'grimoire/card-combinations': [
      'src/app/grimoire/card-combinations/page.tsx',
    ],
    'grimoire/moon/signs': ['src/app/grimoire/moon/signs/page.tsx'],
    'grimoire/reversed-cards-guide': [
      'src/app/grimoire/reversed-cards-guide/page.tsx',
    ],
    'grimoire/spells/fundamentals': [
      'src/app/grimoire/spells/fundamentals/page.tsx',
    ],
    'grimoire/guides/birth-chart-complete-guide': [
      'src/app/grimoire/guides/birth-chart-complete-guide/page.tsx',
    ],
    'grimoire/guides/tarot-complete-guide': [
      'src/app/grimoire/guides/tarot-complete-guide/page.tsx',
    ],
    'grimoire/guides/crystal-healing-guide': [
      'src/app/grimoire/guides/crystal-healing-guide/page.tsx',
    ],
    'grimoire/guides/moon-phases-guide': [
      'src/app/grimoire/guides/moon-phases-guide/page.tsx',
    ],
    'grimoire/glossary': ['src/app/grimoire/glossary/page.tsx'],
    transits: ['src/app/transits/page.tsx'],
    'moon-calendar': ['src/app/moon-calendar/page.tsx'],
    'about/sammii': ['src/app/about/sammii/page.tsx'],
    'about/editorial-guidelines': [
      'src/app/about/editorial-guidelines/page.tsx',
    ],
    'about/methodology': ['src/app/about/methodology/page.tsx'],
    'birth-chart/example': ['src/app/birth-chart/example/page.tsx'],
    'grimoire/a-z': ['src/app/grimoire/a-z/page.tsx'],
    'grimoire/beginners': ['src/app/grimoire/beginners/page.tsx'],
    'grimoire/astronomy-vs-astrology': [
      'src/app/grimoire/astronomy-vs-astrology/page.tsx',
    ],
  };

  const staticPageMeta: RouteConfig[] = [
    { path: '', changeFrequency: 'daily', priority: 1 },
    { path: 'pricing', changeFrequency: 'monthly', priority: 0.9 },
    {
      path: 'comparison/best-personalized-astrology-apps',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    { path: 'blog', changeFrequency: 'weekly', priority: 0.8 },
    { path: 'grimoire', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/astrology', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/tarot', changeFrequency: 'monthly', priority: 0.8 },
    {
      path: 'grimoire/tarot/yes-or-no',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      path: 'grimoire/tarot/yes-or-no/love-timeframe',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { path: 'grimoire/zodiac', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/spells', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/practices', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/events', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/events/2025', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/guides', changeFrequency: 'monthly', priority: 0.8 },
    {
      path: 'grimoire/compatibility',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { path: 'grimoire/eclipses', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/houses', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/aspects', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/numerology', changeFrequency: 'monthly', priority: 0.8 },
    {
      path: 'grimoire/astronomy/retrogrades',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { path: 'grimoire/lunar-nodes', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/transits', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/moon', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/crystals', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'grimoire/runes', changeFrequency: 'monthly', priority: 0.8 },
    {
      path: 'grimoire/candle-magic',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: 'grimoire/correspondences',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    { path: 'grimoire/decans', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'grimoire/cusps', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'grimoire/seasons', changeFrequency: 'monthly', priority: 0.7 },
    {
      path: 'grimoire/placements',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { path: 'grimoire/birthday', changeFrequency: 'monthly', priority: 0.7 },
    {
      path: 'grimoire/chinese-zodiac',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      path: 'grimoire/wheel-of-the-year',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { path: 'grimoire/chakras', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'grimoire/divination', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'grimoire/meditation', changeFrequency: 'monthly', priority: 0.7 },
    {
      path: 'grimoire/modern-witchcraft',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    { path: 'shop', changeFrequency: 'daily', priority: 0.8 },
    { path: 'comparison', changeFrequency: 'monthly', priority: 0.8 },
    { path: 'horoscope', changeFrequency: 'daily', priority: 0.7 },
    { path: 'tarot', changeFrequency: 'daily', priority: 0.7 },
    { path: 'birth-chart', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'guide', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'help', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'press-kit', changeFrequency: 'monthly', priority: 0.6 },
    { path: 'privacy', changeFrequency: 'monthly', priority: 0.5 },
    { path: 'terms', changeFrequency: 'monthly', priority: 0.5 },
    { path: 'cookies', changeFrequency: 'monthly', priority: 0.4 },
    { path: 'refund', changeFrequency: 'monthly', priority: 0.4 },
    {
      path: 'acceptable-use',
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      path: 'accessibility',
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      path: 'api-terms',
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      path: 'referral-terms',
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    { path: 'dmca', changeFrequency: 'monthly', priority: 0.4 },
    { path: 'trademark', changeFrequency: 'monthly', priority: 0.4 },
    {
      path: 'building-lunary',
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    { path: 'moon-circles', changeFrequency: 'daily', priority: 0.7 },
    { path: 'launch', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'product-hunt', changeFrequency: 'monthly', priority: 0.7 },
    {
      path: 'cosmic-report-generator',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      path: 'comparison/lunary-vs-costar',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: 'comparison/lunary-vs-pattern',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: 'comparison/lunary-vs-moonly',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: 'comparison/lunary-vs-lunar-guide',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: 'comparison/lunary-vs-arcarae',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: 'comparison/personalized-vs-generic-astrology',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: 'grimoire/card-combinations',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    { path: 'grimoire/moon/signs', changeFrequency: 'monthly', priority: 0.6 },
    {
      path: 'grimoire/reversed-cards-guide',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      path: 'grimoire/spells/fundamentals',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      path: 'grimoire/guides/birth-chart-complete-guide',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      path: 'grimoire/guides/tarot-complete-guide',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      path: 'grimoire/guides/crystal-healing-guide',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      path: 'grimoire/guides/moon-phases-guide',
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    { path: 'grimoire/glossary', changeFrequency: 'monthly', priority: 0.7 },
    { path: 'transits', changeFrequency: 'weekly', priority: 0.8 },
    {
      path: 'moon-calendar',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: 'about/sammii',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      path: 'about/editorial-guidelines',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      path: 'about/methodology',
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      path: 'birth-chart/example',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      path: 'grimoire/a-z',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      path: 'grimoire/beginners',
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      path: 'grimoire/astronomy-vs-astrology',
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ];

  const staticPageConfigs = staticPageMeta.map((entry) => ({
    ...entry,
    sourceFiles: staticPageSources[entry.path],
  }));

  const routes = staticPageConfigs.map(createRouteEntry);

  // Generate all blog week posts (from start of 2025 to current week)
  const blogRoutes: MetadataRoute.Sitemap = [];
  const startOf2025 = dayjs('2025-01-06'); // First Monday of 2025
  const today = dayjs();
  const currentWeekStart = today.startOf('week').add(1, 'day'); // Get Monday of current week

  let weekDate = startOf2025;
  let weekNumber = 1;
  const year = 2025;

  while (
    weekDate.isBefore(currentWeekStart) ||
    weekDate.isSame(currentWeekStart, 'day')
  ) {
    const weekSlug = `week-${weekNumber}-${year}`;
    blogRoutes.push({
      url: `${baseUrl}/blog/week/${weekSlug}`,
      lastModified: weekDate.toDate(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    });

    weekDate = weekDate.add(7, 'day');
    weekNumber++;
  }

  // Generate blog pagination pages
  const BLOG_POSTS_PER_PAGE = 8;
  const totalBlogPosts = blogRoutes.length;
  const totalBlogPages = Math.ceil(totalBlogPosts / BLOG_POSTS_PER_PAGE);
  const blogPaginationRoutes: MetadataRoute.Sitemap = [];

  for (let page = 2; page <= totalBlogPages; page++) {
    blogPaginationRoutes.push({
      url: `${baseUrl}/blog/page/${page}`,
      lastModified: date,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    });
  }

  // Add all grimoire sections
  const grimoireItems = Object.keys(grimoire);
  const grimoireRoutes = grimoireItems.map((item) => ({
    url: `${baseUrl}/grimoire/${sectionToSlug(item)}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add all spell pages
  const spellRoutes = spellsJson.map((spell) => ({
    url: `${baseUrl}/grimoire/spells/${spell.id}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all crystal pages
  const crystalRoutes = crystalDatabase.map((crystal) => ({
    url: `${baseUrl}/grimoire/crystals/${crystal.id}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all rune pages
  const runeRoutes = Object.keys(runesList).map((runeId) => ({
    url: `${baseUrl}/grimoire/runes/${runeId}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all chakra pages
  const chakraRoutes = Object.keys(chakras).map((chakraId) => ({
    url: `${baseUrl}/grimoire/chakras/${chakraId}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all tarot card pages (major arcana) - using slugified card names
  const majorArcanaRoutes = Object.values(tarotCards.majorArcana).map(
    (card) => ({
      url: `${baseUrl}/grimoire/tarot/${stringToKebabCase(card.name)}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add all tarot card pages (minor arcana) - using slugified card names
  const minorArcanaRoutes = Object.values(tarotCards.minorArcana).flatMap(
    (suitCards) =>
      Object.values(suitCards as Record<string, { name: string }>).map(
        (card) => ({
          url: `${baseUrl}/grimoire/tarot/${stringToKebabCase(card.name)}`,
          lastModified: date,
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        }),
      ),
  );

  // Add all moon phase pages - using slugified phase names
  const moonPhaseRoutes = Object.keys(monthlyMoonPhases).map((phaseId) => ({
    url: `${baseUrl}/grimoire/moon/phases/${stringToKebabCase(phaseId)}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all full moon pages
  const fullMoonRoutes = Object.keys(annualFullMoons).map((month) => ({
    url: `${baseUrl}/grimoire/moon/full-moons/${month.toLowerCase()}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all planet pages
  const planetRoutes = Object.keys(planetaryBodies).map((planetId) => ({
    url: `${baseUrl}/grimoire/astronomy/planets/${planetId}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all sabbat pages - using slugified names
  const sabbatRoutes = wheelOfTheYearSabbats.map((sabbat) => ({
    url: `${baseUrl}/grimoire/wheel-of-the-year/${stringToKebabCase(sabbat.name)}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all tarot spread pages (using kebab-case for SEO)
  const tarotSpreadRoutes = Object.keys(tarotSpreads).map((spreadId) => ({
    url: `${baseUrl}/grimoire/tarot/spreads/${stringToKebabCase(spreadId)}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add scrying method pages
  const scryingRoutes = [
    'crystal-ball',
    'black-mirror',
    'water-scrying',
    'fire-scrying',
  ].map((method) => ({
    url: `${baseUrl}/grimoire/divination/scrying/${method}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence element pages
  const elementRoutes = Object.keys(correspondencesData.elements).map(
    (element) => ({
      url: `${baseUrl}/grimoire/correspondences/elements/${element.toLowerCase()}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add all correspondence color pages
  const colorRoutes = Object.keys(correspondencesData.colors).map((color) => ({
    url: `${baseUrl}/grimoire/correspondences/colors/${color.toLowerCase()}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence day pages
  const dayRoutes = Object.keys(correspondencesData.days).map((day) => ({
    url: `${baseUrl}/grimoire/correspondences/days/${day.toLowerCase()}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence deity pages
  const deityRoutes = Object.entries(correspondencesData.deities).flatMap(
    ([pantheon, gods]) =>
      Object.keys(gods).map((deityName) => ({
        url: `${baseUrl}/grimoire/correspondences/deities/${pantheon.toLowerCase()}/${deityName.toLowerCase()}`,
        lastModified: date,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
  );

  // Add all correspondence flower pages
  const flowerRoutes = Object.keys(correspondencesData.flowers).map(
    (flower) => ({
      url: `${baseUrl}/grimoire/correspondences/flowers/${flower.toLowerCase()}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add all correspondence number pages
  const numberRoutes = Object.keys(correspondencesData.numbers).map((num) => ({
    url: `${baseUrl}/grimoire/correspondences/numbers/${num}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence wood pages
  const woodRoutes = Object.keys(correspondencesData.wood).map((wood) => ({
    url: `${baseUrl}/grimoire/correspondences/wood/${wood.toLowerCase()}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence herb pages
  const herbRoutes = Object.keys(correspondencesData.herbs).map((herb) => ({
    url: `${baseUrl}/grimoire/correspondences/herbs/${herb.toLowerCase()}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add all correspondence animal pages
  const animalRoutes = Object.keys(correspondencesData.animals).map(
    (animal) => ({
      url: `${baseUrl}/grimoire/correspondences/animals/${animal.toLowerCase()}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add numerology core number pages (1-9)
  const numerologyCoreRoutes = Array.from({ length: 9 }, (_, i) => i + 1).map(
    (num) => ({
      url: `${baseUrl}/grimoire/numerology/core-numbers/${num}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add numerology master number pages (11, 22, 33)
  const numerologyMasterRoutes = [11, 22, 33].map((num) => ({
    url: `${baseUrl}/grimoire/numerology/master-numbers/${num}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add numerology planetary day pages
  const numerologyDayRoutes = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
  ].map((day) => ({
    url: `${baseUrl}/grimoire/numerology/planetary-days/${day}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add candle magic color pages
  const candleColorRoutes = [
    'red',
    'pink',
    'orange',
    'yellow',
    'green',
    'blue',
    'purple',
    'indigo',
    'white',
    'black',
    'brown',
    'silver',
  ].map((color) => ({
    url: `${baseUrl}/grimoire/candle-magic/colors/${color}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add birth chart house pages (1st-12th)
  const birthChartHouseRoutes = Array.from({ length: 12 }, (_, i) => i + 1).map(
    (houseNum) => ({
      url: `${baseUrl}/grimoire/birth-chart/houses/${houseNum}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add modern witchcraft witch type pages
  const witchTypeRoutes = (witchTypesData.witchTypesOverview || []).map(
    (type) => ({
      url: `${baseUrl}/grimoire/modern-witchcraft/witch-types/${type.slug}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    }),
  );

  // Add modern witchcraft tool pages
  const witchToolRoutes = [
    'athame',
    'wand',
    'cauldron',
    'chalice',
    'pentacle',
  ].map((tool) => ({
    url: `${baseUrl}/grimoire/modern-witchcraft/tools/${tool}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add meditation technique pages
  const meditationTechniqueRoutes = [
    'guided-meditation',
    'mindfulness-meditation',
    'visualization-meditation',
    'walking-meditation',
    'mantra-meditation',
  ].map((technique) => ({
    url: `${baseUrl}/grimoire/meditation/techniques/${technique}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add meditation breathwork pages
  const breathworkRoutes = [
    'deep-belly-breathing',
    'box-breathing',
    'pranayama',
  ].map((method) => ({
    url: `${baseUrl}/grimoire/meditation/breathwork/${method}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add meditation grounding pages
  const groundingRoutes = [
    'tree-root-visualization',
    'physical-grounding',
    'crystal-grounding',
  ].map((method) => ({
    url: `${baseUrl}/grimoire/meditation/grounding/${method}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }));

  // Add divination pendulum page
  const pendulumRoute = {
    url: `${baseUrl}/grimoire/divination/pendulum`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  };

  // Add divination dream interpretation page
  const dreamInterpretationRoute = {
    url: `${baseUrl}/grimoire/divination/dream-interpretation`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  };

  // Add divination omen reading page
  const omenReadingRoute = {
    url: `${baseUrl}/grimoire/divination/omen-reading`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  };

  // Add all zodiac sign pages
  const zodiacRoutes = Object.keys(zodiacSigns).map((sign) => ({
    url: `${baseUrl}/grimoire/zodiac/${stringToKebabCase(sign)}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all house pages
  const houseRoutes = Object.keys(astrologicalHouses).map((house) => ({
    url: `${baseUrl}/grimoire/houses/overview/${stringToKebabCase(house)}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all moon in sign pages
  const moonInSignRoutes = Object.keys(zodiacSigns).map((sign) => ({
    url: `${baseUrl}/grimoire/moon-in/${stringToKebabCase(sign)}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add numerology index pages
  const numerologyIndexRoutes = [
    {
      url: `${baseUrl}/grimoire/angel-numbers`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/life-path`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/mirror-hours`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/double-hours`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/numerology/soul-urge`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/numerology/expression`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/numerology/core-numbers`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/numerology/master-numbers`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/numerology/karmic-debt`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/numerology/planetary-days`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Add moon index pages
  const moonIndexRoutes = [
    {
      url: `${baseUrl}/grimoire/moon/phases`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/moon/full-moons`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Keep historical years indexed (starting from 2025) and extend 10 years into the future
  const startYear = 2025;
  const currentYear = new Date().getFullYear();
  const endYear = Math.max(currentYear + 10, startYear + 10);
  const dynamicYears = Array.from(
    { length: endYear - startYear + 1 },
    (_, i) => startYear + i,
  );

  // Add moon year pages (generated by moon/[year]/page.tsx)
  const moonYearRoutes = dynamicYears.map((year) => ({
    url: `${baseUrl}/grimoire/moon/${year}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add astrology index pages
  const astrologyIndexRoutes = [
    {
      url: `${baseUrl}/grimoire/astronomy/retrogrades`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/lunar-nodes`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/eclipses`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Add meditation index pages
  const meditationIndexRoutes = [
    {
      url: `${baseUrl}/grimoire/meditation/techniques`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/meditation/breathwork`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/meditation/grounding`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Add witchcraft index pages
  const witchcraftIndexRoutes = [
    {
      url: `${baseUrl}/grimoire/modern-witchcraft/witch-types`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/modern-witchcraft/tools`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Add tarot/candle index pages
  const otherIndexRoutes = [
    {
      url: `${baseUrl}/grimoire/tarot/spreads`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/grimoire/candle-magic/colors`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ];

  // Add all angel number pages
  const angelNumberRoutes = getAllAngelNumberSlugs().map((number) => ({
    url: `${baseUrl}/grimoire/angel-numbers/${number}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all life path number pages
  const lifePathRoutes = Object.keys(lifePathNumbers).map((number) => ({
    url: `${baseUrl}/grimoire/life-path/${number}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all aspect pages
  const aspectRoutes = Object.keys(astrologicalAspects).map((aspect) => ({
    url: `${baseUrl}/grimoire/aspects/types/${stringToKebabCase(aspect)}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all retrograde pages
  const retrogradeRoutes = Object.keys(retrogradeInfo).map((planet) => ({
    url: `${baseUrl}/grimoire/astronomy/retrogrades/${planet}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add all eclipse pages
  const eclipseRoutes = Object.keys(eclipseInfo).map((type) => ({
    url: `${baseUrl}/grimoire/eclipses/${type}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // Add lunar node pages
  const lunarNodeRoutes = [
    {
      url: `${baseUrl}/grimoire/lunar-nodes/north-node`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/grimoire/lunar-nodes/south-node`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    },
  ];

  // Add synastry generator page
  const synastryGeneratorRoute = {
    url: `${baseUrl}/grimoire/synastry/generate`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  };

  // Add synastry aspects index and individual pages
  const synastryAspectSlugs = getAllSynastryAspectSlugs();
  const synastryAspectsIndexRoute = {
    url: `${baseUrl}/grimoire/synastry/aspects`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  };
  const synastryAspectRoutes = synastryAspectSlugs.map((slug) => ({
    url: `${baseUrl}/grimoire/synastry/aspects/${slug}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add zodiac compatibility pages (all 78 unique pairs + 12 same-sign)
  const compatibilitySlugs = getAllCompatibilitySlugs();
  const compatibilityRoutes = compatibilitySlugs.map((slug) => ({
    url: `${baseUrl}/grimoire/compatibility/${slug}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add planetary placement pages (planet-in-sign combinations)
  const planetKeys = Object.keys(planetDescriptions);
  const signKeys = Object.keys(signDescriptions);
  const placementRoutes = planetKeys.flatMap((planet) =>
    signKeys.map((sign) => ({
      url: `${baseUrl}/grimoire/placements/${planet}-in-${sign}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  );

  // Add rising sign pages
  const risingSignSlugs = [
    'aries-rising',
    'taurus-rising',
    'gemini-rising',
    'cancer-rising',
    'leo-rising',
    'virgo-rising',
    'libra-rising',
    'scorpio-rising',
    'sagittarius-rising',
    'capricorn-rising',
    'aquarius-rising',
    'pisces-rising',
  ];
  const risingSignIndexRoute = {
    url: `${baseUrl}/grimoire/rising`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  };
  const risingSignRoutes = risingSignSlugs.map((slug) => ({
    url: `${baseUrl}/grimoire/rising/${slug}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add mirror hour pages
  const mirrorHourRoutes = mirrorHourKeys.map((time) => ({
    url: `${baseUrl}/grimoire/mirror-hours/${time.replace(':', '-')}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add double hour pages
  const doubleHourRoutes = doubleHourKeys.map((time) => ({
    url: `${baseUrl}/grimoire/double-hours/${time.replace(':', '-')}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add expression number pages
  const expressionRoutes = expressionKeys.map((num) => ({
    url: `${baseUrl}/grimoire/numerology/expression/${num}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add soul urge number pages
  const soulUrgeRoutes = soulUrgeKeys.map((num) => ({
    url: `${baseUrl}/grimoire/numerology/soul-urge/${num}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add karmic debt number pages
  const karmicDebtRoutes = karmicDebtKeys.map((num) => ({
    url: `${baseUrl}/grimoire/numerology/karmic-debt/${num}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add static grimoire pages (cleaned up - removed old URLs now handled by redirects)
  const additionalGrimoirePageConfigs: RouteConfig[] = [
    { path: 'grimoire/divination/scrying', priority: 0.7 },
    { path: 'grimoire/divination/dream-interpretation', priority: 0.7 },
    { path: 'grimoire/divination/pendulum', priority: 0.7 },
    { path: 'grimoire/divination/omen-reading', priority: 0.7 },
    { path: 'grimoire/astronomy/planets', priority: 0.8 },
    { path: 'grimoire/rising-sign', priority: 0.7 },
    { path: 'grimoire/candle-magic/incantations', priority: 0.6 },
    { path: 'grimoire/candle-magic/altar-lighting', priority: 0.6 },
    { path: 'grimoire/modern-witchcraft/ethics', priority: 0.6 },
    { path: 'grimoire/candle-magic/anointing', priority: 0.6 },
    { path: 'grimoire/modern-witchcraft/tools-guide', priority: 0.7 },
    { path: 'grimoire/synastry', priority: 0.7 },
    { path: 'grimoire/numerology/year', priority: 0.7 },
    { path: 'grimoire/modern-witchcraft/famous-witches', priority: 0.6 },
    { path: 'grimoire/tarot/suits', priority: 0.7 },
    { path: 'grimoire/jar-spells', priority: 0.7 },
    { path: 'grimoire/book-of-shadows', priority: 0.7 },
    { path: 'grimoire/shadow-work', priority: 0.7 },
    { path: 'grimoire/sabbats', priority: 0.7 },
    { path: 'grimoire/protection', priority: 0.7 },
    { path: 'grimoire/manifestation', priority: 0.7 },
    { path: 'grimoire/archetypes', priority: 0.7 },
    { path: 'grimoire/moon/rituals', priority: 0.7 },
    { path: 'grimoire/witchcraft-ethics', priority: 0.7 },
    { path: 'grimoire/witchcraft-tools', priority: 0.7 },
  ];

  const additionalGrimoirePages =
    additionalGrimoirePageConfigs.map(createRouteEntry);

  // Add events year pages (dynamic route generates current year to +10 years)
  const eventsYearRoutes = dynamicYears.map((year) => ({
    url: `${baseUrl}/grimoire/events/${year}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add events subpages for all years (mercury-retrograde, venus-retrograde, mars-retrograde, retrogrades, eclipses, equinoxes-solstices)
  const eventTypes = [
    'mercury-retrograde',
    'venus-retrograde',
    'mars-retrograde',
    'retrogrades',
    'eclipses',
    'equinoxes-solstices',
  ];
  const eventSubpages = dynamicYears.flatMap((year) =>
    eventTypes.map((eventType) => ({
      url: `${baseUrl}/grimoire/events/${year}/${eventType}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  );

  // Add transits year pages
  const transitsYearRoutes = dynamicYears.map((year) => ({
    url: `${baseUrl}/grimoire/transits/year/${year}`,
    lastModified: date,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  // Add tarot suit pages
  const tarotSuitRoutes = ['cups', 'pentacles', 'swords', 'wands'].map(
    (suit) => ({
      url: `${baseUrl}/grimoire/tarot/suits/${suit}`,
      lastModified: date,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }),
  );

  // Add shop product routes
  const shopProducts = getAllProducts();
  const shopProductRoutes = shopProducts.map((product) => ({
    url: `${baseUrl}/shop/${product.slug}`,
    lastModified: date,
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Add shop pagination routes
  const PRODUCTS_PER_PAGE = 12;
  const shopTotalPages = Math.ceil(shopProducts.length / PRODUCTS_PER_PAGE);
  const shopPaginationRoutes = Array.from(
    { length: shopTotalPages },
    (_, i) => ({
      url: i === 0 ? `${baseUrl}/shop` : `${baseUrl}/shop/page/${i + 1}`,
      lastModified: date,
      changeFrequency: 'weekly' as const,
      priority: i === 0 ? 0.8 : 0.4,
    }),
  );

  const allRoutes: MetadataRoute.Sitemap = [
    ...routes,
    ...blogRoutes,
    ...blogPaginationRoutes,
    ...grimoireRoutes,
    ...spellRoutes,
    ...crystalRoutes,
    ...runeRoutes,
    ...chakraRoutes,
    ...majorArcanaRoutes,
    ...minorArcanaRoutes,
    ...moonPhaseRoutes,
    ...fullMoonRoutes,
    ...zodiacRoutes,
    ...planetRoutes,
    ...sabbatRoutes,
    ...tarotSpreadRoutes,
    ...scryingRoutes,
    ...elementRoutes,
    ...colorRoutes,
    ...dayRoutes,
    ...deityRoutes,
    ...flowerRoutes,
    ...numberRoutes,
    ...woodRoutes,
    ...herbRoutes,
    ...animalRoutes,
    ...numerologyCoreRoutes,
    ...numerologyMasterRoutes,
    ...numerologyDayRoutes,
    ...candleColorRoutes,
    ...birthChartHouseRoutes,
    ...witchTypeRoutes,
    ...witchToolRoutes,
    ...meditationTechniqueRoutes,
    ...breathworkRoutes,
    ...groundingRoutes,
    pendulumRoute,
    dreamInterpretationRoute,
    omenReadingRoute,
    ...houseRoutes,
    ...moonInSignRoutes,
    ...angelNumberRoutes,
    ...lifePathRoutes,
    ...aspectRoutes,
    ...retrogradeRoutes,
    ...eclipseRoutes,
    ...lunarNodeRoutes,
    ...mirrorHourRoutes,
    ...doubleHourRoutes,
    ...expressionRoutes,
    ...soulUrgeRoutes,
    ...karmicDebtRoutes,
    synastryGeneratorRoute,
    synastryAspectsIndexRoute,
    ...synastryAspectRoutes,
    ...compatibilityRoutes,
    ...placementRoutes,
    risingSignIndexRoute,
    ...risingSignRoutes,
    ...numerologyIndexRoutes,
    ...moonIndexRoutes,
    ...moonYearRoutes,
    ...astrologyIndexRoutes,
    ...meditationIndexRoutes,
    ...witchcraftIndexRoutes,
    ...otherIndexRoutes,
    ...additionalGrimoirePages,
    ...eventsYearRoutes,
    ...eventSubpages,
    ...transitsYearRoutes,
    ...tarotSuitRoutes,
    ...shopProductRoutes,
    ...shopPaginationRoutes,
  ];

  return dedupeRoutes(allRoutes);
}

// Keep first occurrence per URL so Search Console sees a single canonical entry.
function dedupeRoutes(entries: MetadataRoute.Sitemap): MetadataRoute.Sitemap {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    if (seen.has(entry.url)) {
      return false;
    }

    seen.add(entry.url);
    return true;
  });
}
