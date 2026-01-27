import { thematicPaletteConfig } from '@/constants/seo/thematic-palette-config';

export type ThemeCategory =
  keyof typeof thematicPaletteConfig.palettesByTopLevelCategory;

export type ThemeCategoryResolution = {
  category: ThemeCategory;
  inferredFrom: 'explicit' | 'weeklyData' | 'title' | 'fallback';
  sourceText?: string;
};

const aliasMap: Record<string, ThemeCategory> = {
  'planetary-wisdom': 'astronomy',
  'planetary-movements': 'astronomy',
  planetary: 'astronomy',
  'lunar-cycles': 'moon',
  'moon-phases': 'moon',
  'wheel-of-the-year': 'sabbats',
  sabbats: 'sabbats',
  transit: 'transits',
  transits: 'transits',
  aspect: 'aspects',
  aspects: 'aspects',
  house: 'houses',
  houses: 'houses',
  numerology: 'numerology',
  tarot: 'tarot',
  zodiac: 'zodiac',
  crystals: 'crystals',
  chakras: 'chakras',
};

const titleMatchers: Array<{ match: RegExp; category: ThemeCategory }> = [
  { match: /\btransit\b/i, category: 'transits' },
  { match: /\baspect\b/i, category: 'aspects' },
  { match: /\bhouse\b/i, category: 'houses' },
  { match: /\bplanet\b|\bplanetary\b/i, category: 'astronomy' },
  { match: /\bmoon\b|\blunar\b/i, category: 'moon' },
  { match: /\btarot\b/i, category: 'tarot' },
  { match: /\bzodiac\b/i, category: 'zodiac' },
  { match: /\bcrystal\b/i, category: 'crystals' },
  { match: /\bnumerology\b|\bangel numbers\b/i, category: 'numerology' },
  { match: /\bchakra\b/i, category: 'chakras' },
  { match: /\bsabbat\b|\bwheel of the year\b/i, category: 'sabbats' },
];

const normalizeCategory = (input?: string | null): ThemeCategory | null => {
  if (!input) return null;
  const key = input.trim().toLowerCase();
  const mapped = aliasMap[key];
  return (mapped || (key as ThemeCategory)) in
    thematicPaletteConfig.palettesByTopLevelCategory
    ? ((mapped || key) as ThemeCategory)
    : null;
};

export function resolveThemeCategory({
  explicitCategory,
  weeklyCategory,
  title,
}: {
  explicitCategory?: string | null;
  weeklyCategory?: string | null;
  title?: string | null;
}): ThemeCategoryResolution {
  const explicit = normalizeCategory(explicitCategory);
  if (explicit) {
    return { category: explicit, inferredFrom: 'explicit' };
  }

  const weekly = normalizeCategory(weeklyCategory);
  if (weekly) {
    return { category: weekly, inferredFrom: 'weeklyData' };
  }

  const rawTitle = title || '';
  for (const matcher of titleMatchers) {
    if (matcher.match.test(rawTitle)) {
      return {
        category: matcher.category,
        inferredFrom: 'title',
        sourceText: rawTitle,
      };
    }
  }

  const fallbackCategory = normalizeCategory('birth-chart') || 'birth-chart';
  return {
    category: fallbackCategory,
    inferredFrom: 'fallback',
    sourceText: rawTitle || undefined,
  };
}
