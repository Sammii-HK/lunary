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

export const categoryThemes: WeeklyTheme[] = [
  ...baseCategoryThemesWithThreads,
  ...generatedThemesWithThreads,
];

export const sabbatThemes: SabbatTheme[] = withSabbatThreads(
  themes.sabbatThemes as SabbatTheme[],
);

// ============================================================================
// THEME SELECTION LOGIC
// ============================================================================

/**
 * Theme category weights for selection
 * Numerology gets 3x weight because it's the best-performing topic
 */
export const THEME_CATEGORY_WEIGHTS: Record<string, number> = {
  numerology: 3, // Best performing - boost to ~18% of weeks
  tarot: 2,
  lunar: 2,
  zodiac: 1,
  planetary: 1,
  crystals: 2,
  sabbat: 1,
  chakras: 1,
  runes: 1,
};

/**
 * Select a theme for a given week with weighted preference for numerology
 */
export function selectWeeklyTheme(
  weekNumber: number,
  customThemeIndex?: number,
): WeeklyTheme {
  if (customThemeIndex !== undefined) {
    return categoryThemes[customThemeIndex % categoryThemes.length];
  }

  // Create weighted theme pool
  const weightedThemes: WeeklyTheme[] = [];
  for (const theme of categoryThemes) {
    const weight = THEME_CATEGORY_WEIGHTS[theme.category] || 1;
    // Add theme multiple times based on weight
    for (let i = 0; i < weight; i++) {
      weightedThemes.push(theme);
    }
  }

  // Select from weighted pool using week number as seed
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
