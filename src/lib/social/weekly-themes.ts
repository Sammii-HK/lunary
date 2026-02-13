/**
 * Weekly Thematic Content System
 *
 * Defines weekly themes with daily facets for educational content generation.
 * Each theme has 7 facets that build understanding cumulatively across the week.
 */

import { generatedCategoryThemes } from '@/constants/seo/generated-category-themes';
import themes from './themes.base-category-themes.json';
import { withSabbatThreads, withThreads } from './with-threads';
import type {
  DailyFacet,
  SabbatTheme,
  ThemeCategory,
  WeeklyTheme,
} from './types';

export type { DailyFacet, SabbatTheme, WeeklyTheme } from './types';

// Domain hashtags for 3-layer system
export const domainHashtags: Record<ThemeCategory, string> = {
  zodiac: '#astrology',
  tarot: '#tarot',
  lunar: '#moonphases',
  planetary: '#astrology',
  sabbat: '#wheeloftheyear',
  numerology: '#numerology',
  crystals: '#crystalhealing',
  chakras: '#spirituality',
  runes: '#runes',
  spells: '#witchtok',
};

// ============================================================================
// CATEGORY THEMES - 7 facets each, rotate weekly
// ============================================================================

const baseCategoryThemesWithThreads = withThreads(
  themes.baseCategoryThemes as WeeklyTheme[],
);
const generatedThemesWithThreads = withThreads(
  generatedCategoryThemes as WeeklyTheme[],
);

/**
 * Prefixes for generated themes that are too granular for social media.
 * These are SEO grimoire topics (e.g. "Chiron in Cancer", "Sun in 3rd House")
 * that produce generic, unhelpful social posts. Keep them for SEO but exclude
 * from the social content theme pool.
 */
const SOCIAL_EXCLUDED_THEME_PREFIXES = [
  'placements-',
  'houses-',
  'decans-',
  'cusps-',
];

const isSocialSuitableTheme = (theme: WeeklyTheme): boolean =>
  !SOCIAL_EXCLUDED_THEME_PREFIXES.some((prefix) => theme.id.startsWith(prefix));

export const categoryThemes: WeeklyTheme[] = [
  ...baseCategoryThemesWithThreads,
  ...generatedThemesWithThreads.filter(isSocialSuitableTheme),
];

export const sabbatThemes: SabbatTheme[] = withSabbatThreads(
  themes.sabbatThemes as SabbatTheme[],
);

// ============================================================================
// THEME SELECTION LOGIC
// ============================================================================

/**
 * Theme category weights for selection — aligned with TikTok audience size
 * tarot (#tarot 73.9B views), zodiac (#astrology 84.2B), numerology (fast-growing)
 * Sabbat seasonal only (handled by getSabbatForDate), chakras/runes too niche
 */
export const THEME_CATEGORY_WEIGHTS: Record<string, number> = {
  tarot: 4, // 73.9B views — massively underserved
  zodiac: 3, // 84.2B views — largest audience
  numerology: 4, // Fast-growing, high per-video engagement
  spells: 3, // 201 spells, #witchtok growing, practical 'how to' content
  planetary: 2, // Feeds into #astrology, transit content
  lunar: 2, // Dedicated audience
  crystals: 2, // Growing via #witchtok
  sabbat: 0, // Seasonal only — handled by getSabbatForDate()
  chakras: 0, // Too niche for TikTok rotation
  runes: 0, // Extremely niche
};

/**
 * Select a theme for a given week.
 * Primary block is always numerology (the #1 performer).
 * Falls back to weighted selection if no numerology themes exist.
 */
export function selectWeeklyTheme(
  weekNumber: number,
  customThemeIndex?: number,
): WeeklyTheme {
  if (customThemeIndex !== undefined) {
    return categoryThemes[customThemeIndex % categoryThemes.length];
  }

  // Primary block is always numerology
  const numerologyThemes = categoryThemes.filter(
    (t) => t.category === 'numerology',
  );
  if (numerologyThemes.length > 0) {
    return numerologyThemes[weekNumber % numerologyThemes.length];
  }

  // Fallback: weighted selection if no numerology themes
  const weightedThemes: WeeklyTheme[] = [];
  for (const theme of categoryThemes) {
    const weight = THEME_CATEGORY_WEIGHTS[theme.category] || 1;
    for (let i = 0; i < weight; i++) {
      weightedThemes.push(theme);
    }
  }
  return weightedThemes[weekNumber % weightedThemes.length];
}

/**
 * Check if a date falls within the lead-up to a sabbat
 */
export function getSabbatForDate(date: Date): {
  sabbat: SabbatTheme;
  daysUntil: number;
} | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const sabbat of sabbatThemes) {
    // Calculate sabbat date for this year
    const sabbatDate = new Date(
      date.getFullYear(),
      sabbat.date.month - 1,
      sabbat.date.day,
    );

    // Calculate days until sabbat
    const diffTime = sabbatDate.getTime() - date.getTime();
    const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Check if within 4-day lead-up window (day -3, -2, -1, 0)
    if (daysUntil >= 0 && daysUntil <= 3) {
      return { sabbat, daysUntil };
    }
  }

  return null;
}

/**
 * Check if a date falls within ±3 days of a planetary sign ingress.
 * Uses astronomy-engine to detect when slow-moving planets change sign.
 * Returns a transit-specific theme that can override regular rotation.
 */
export function getTransitThemeForDate(date: Date): {
  planet: string;
  fromSign: string;
  toSign: string;
  ingressDate: Date;
  daysUntil: number;
  hoursUntil: number;
} | null {
  try {
    // Dynamic import to keep this lightweight when not needed
    const Astronomy = require('astronomy-engine');

    const TRACKED_PLANETS = [
      { name: 'Saturn', body: Astronomy.Body.Saturn },
      { name: 'Jupiter', body: Astronomy.Body.Jupiter },
      { name: 'Mars', body: Astronomy.Body.Mars },
      { name: 'Venus', body: Astronomy.Body.Venus },
    ];

    const ZODIAC_SIGNS = [
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

    const getEclipticSign = (body: any, t: Date): string => {
      const equator = Astronomy.Equator(body, t, true, true);
      const ecliptic = Astronomy.Ecliptic(equator.vec);
      const longitude = ecliptic.elon;
      const signIndex = Math.floor(longitude / 30) % 12;
      return ZODIAC_SIGNS[signIndex];
    };

    // Check ±3 day window around the given date
    for (const planet of TRACKED_PLANETS) {
      const before = new Date(date.getTime() - 3 * 24 * 60 * 60 * 1000);
      const after = new Date(date.getTime() + 3 * 24 * 60 * 60 * 1000);

      const signBefore = getEclipticSign(planet.body, before);
      const signAfter = getEclipticSign(planet.body, after);

      if (signBefore !== signAfter) {
        // Binary search for ingress date
        let lo = before.getTime();
        let hi = after.getTime();
        while (hi - lo > 60 * 60 * 1000) {
          // within 1 hour
          const mid = (lo + hi) / 2;
          const midSign = getEclipticSign(planet.body, new Date(mid));
          if (midSign === signBefore) {
            lo = mid;
          } else {
            hi = mid;
          }
        }
        const ingressDate = new Date((lo + hi) / 2);
        const diffMs = ingressDate.getTime() - date.getTime();
        const hoursUntil = Math.round(diffMs / (1000 * 60 * 60));
        const daysUntil =
          hoursUntil < 24 ? 0 : Math.ceil(diffMs / (1000 * 60 * 60 * 24));

        return {
          planet: planet.name,
          fromSign: signBefore,
          toSign: signAfter,
          ingressDate,
          daysUntil,
          hoursUntil,
        };
      }
    }

    return null;
  } catch {
    // astronomy-engine not available or calculation error
    return null;
  }
}

/**
 * Get the appropriate theme and facet for a specific date
 */
export function getThemeForDate(
  date: Date,
  currentThemeIndex: number = 0,
  facetOffset: number = 0,
  includeSabbats: boolean = true,
): {
  theme: WeeklyTheme | SabbatTheme;
  facet: DailyFacet;
  isSabbat: boolean;
} {
  // Check if this date falls within a sabbat lead-up
  if (includeSabbats) {
    const sabbatInfo = getSabbatForDate(date);

    if (sabbatInfo) {
      const { sabbat, daysUntil } = sabbatInfo;
      // daysUntil: 3 = day -3, 2 = day -2, 1 = day -1, 0 = day of
      const facetIndex = 3 - daysUntil;
      return {
        theme: sabbat,
        facet: sabbat.leadUpFacets[facetIndex],
        isSabbat: true,
      };
    }
  }

  // Otherwise use rotating category theme with weighted selection
  const dayOfWeek = date.getDay();
  const facetIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Mon=0, Sun=6

  // Use weighted selection to favor numerology (best performing)
  const theme = selectWeeklyTheme(currentThemeIndex);
  const facets =
    theme.facetPool && theme.facetPool.length > 0
      ? theme.facetPool
      : theme.facets;

  // Calculate week's starting position in facet pool
  // Each week gets a contiguous block of 7 unique facets
  // facetOffset rotates through the pool week-by-week
  const weekBlockStart = (facetOffset * 7) % facets.length;
  const resolvedIndex =
    facets.length > 0
      ? (weekBlockStart + facetIndex) % facets.length
      : facetIndex;

  return {
    theme,
    facet: facets[resolvedIndex] || theme.facets[facetIndex],
    isSabbat: false,
  };
}

/**
 * Generate hashtags for a theme and facet
 */
export function generateHashtags(
  theme: WeeklyTheme | SabbatTheme,
  facet: DailyFacet,
): { domain: string; topic: string; brand: string } {
  const domain = domainHashtags[theme.category] || '#spirituality';

  const categoryHashtags: Record<string, string> = {
    zodiac: '#astrology',
    planetary: '#astrology',
    lunar: '#moonmagic',
    sabbat: '#wheeloftheyear',
    numerology: '#numerology',
    crystals: '#crystalhealing',
    tarot: '#tarot',
    chakras: '#chakrahealing',
    spells: '#witchtok',
  };

  return {
    domain,
    topic: categoryHashtags[theme.category] || '#cosmicwisdom',
    brand: '#lunary',
  };
}

/**
 * Get the week's content plan
 * Filters out duplicate facets when a theme has fewer than 7 unique facets
 */
export function getWeeklyContentPlan(
  weekStartDate: Date,
  currentThemeIndex: number = 0,
  facetOffset: number = 0,
  includeSabbats: boolean = true,
): Array<{
  date: Date;
  dayName: string;
  theme: WeeklyTheme | SabbatTheme;
  facet: DailyFacet;
  isSabbat: boolean;
  hashtags: { domain: string; topic: string; brand: string };
}> {
  const plan = [];
  const dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  // Track used facet titles to prevent duplicates within the same week
  const usedFacetTitles = new Set<string>();

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);

    const { theme, facet, isSabbat } = getThemeForDate(
      date,
      currentThemeIndex,
      facetOffset,
      includeSabbats,
    );

    // Skip duplicate facets (can happen when theme has fewer than 7 facets)
    const facetKey = `${theme.id}-${facet.title}`;
    if (usedFacetTitles.has(facetKey)) {
      continue;
    }
    usedFacetTitles.add(facetKey);

    const hashtags = generateHashtags(theme, facet);

    plan.push({
      date,
      dayName: dayNames[i],
      theme,
      facet,
      isSabbat,
      hashtags,
    });
  }

  return plan;
}

export function getWeeklySabbatPlan(weekStartDate: Date): Array<{
  date: Date;
  dayName: string;
  theme: SabbatTheme;
  facet: DailyFacet;
}> {
  const plan = [];
  const dayNames = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(weekStartDate.getDate() + i);
    const sabbatInfo = getSabbatForDate(date);
    if (!sabbatInfo) continue;

    const { sabbat, daysUntil } = sabbatInfo;
    const facetIndex = 3 - daysUntil;
    const facet = sabbat.leadUpFacets[facetIndex];
    if (!facet) continue;

    plan.push({
      date,
      dayName: dayNames[i],
      theme: sabbat,
      facet,
    });
  }

  return plan;
}
