/**
 * Main video script generation functions
 *
 * Primary slot uses weighted category rotation across ALL grimoire categories.
 * Each day picks a category from the grimoire pool using performance-weighted
 * selection, with diversity guarantees:
 * - No category appears more than 2 days in a row
 * - Each week covers at least 4 different categories
 * - Mini-series kept to 2-3 parts max per category per week
 *
 * When weekPlan is provided, themes/facets come from the content plan (sync mode).
 */

import {
  categoryThemes,
  GRIMOIRE_CATEGORIES,
  THEME_CATEGORY_WEIGHTS,
} from '../weekly-themes';
import type { DailyFacet, WeeklyTheme, SabbatTheme } from '../weekly-themes';
import type { WeeklyVideoScripts } from './types';
import { ensureVideoScriptsTable, saveVideoScript } from './database';
import { VIDEO_ANGLE_OPTIONS, mapAngleToAspect } from './constants';
import { generateTikTokScript } from './tiktok/generation';
import { generateYouTubeScript } from './youtube/generation';

/** A day entry from the weekly content plan */
export interface WeekPlanDay {
  date: Date;
  theme: WeeklyTheme | SabbatTheme;
  facet: DailyFacet;
}

/**
 * Select 7 categories for the week using weighted rotation.
 * Guarantees: no more than 2 consecutive same-category days,
 * at least 4 different categories per week.
 */
function selectWeeklyCategoryRotation(weekStartDate: Date): string[] {
  const daySeed =
    weekStartDate.getFullYear() * 10000 +
    (weekStartDate.getMonth() + 1) * 100 +
    weekStartDate.getDate();

  // Build weighted pool from GRIMOIRE_CATEGORIES + THEME_CATEGORY_WEIGHTS
  const weightedPool: string[] = [];
  for (const cat of GRIMOIRE_CATEGORIES) {
    const weight = THEME_CATEGORY_WEIGHTS[cat] ?? 1;
    if (weight <= 0) continue;
    for (let i = 0; i < weight; i++) {
      weightedPool.push(cat);
    }
  }

  const selected: string[] = [];
  const categoryCounts = new Map<string, number>();

  for (let day = 0; day < 7; day++) {
    const seed = daySeed + day * 37;
    const exclude = new Set<string>();

    // No more than 2 consecutive same-category days
    if (day >= 2 && selected[day - 1] === selected[day - 2]) {
      exclude.add(selected[day - 1]);
    }

    // No more than 3 of same category per week (keeps mini-series to 2-3 parts)
    for (const [cat, count] of categoryCounts) {
      if (count >= 3) exclude.add(cat);
    }

    // Filter pool
    let candidates = weightedPool.filter((c) => !exclude.has(c));
    if (candidates.length === 0) candidates = weightedPool;

    // Deterministic pick
    const pick =
      candidates[((seed * 9301 + 49297) % 233280) % candidates.length];
    selected.push(pick);
    categoryCounts.set(pick, (categoryCounts.get(pick) ?? 0) + 1);
  }

  // Diversity check: if fewer than 4 unique categories, force substitution
  const unique = new Set(selected);
  if (unique.size < 4) {
    const unused = GRIMOIRE_CATEGORIES.filter((c) => !unique.has(c));
    // Replace duplicates from the end with unused categories
    for (
      let i = selected.length - 1;
      i >= 0 && unique.size < 4 && unused.length > 0;
      i--
    ) {
      const cat = selected[i];
      const count = selected.filter((c) => c === cat).length;
      if (count > 1) {
        const replacement = unused.shift()!;
        selected[i] = replacement;
        unique.add(replacement);
      }
    }
  }

  return selected;
}

/**
 * Generate all video scripts for a week
 * Returns 7 TikTok scripts (one per day, diverse categories) and 1 YouTube script
 *
 * When weekPlan is provided, themes and facets are taken directly from the
 * content plan so video scripts always match the post copy.
 */
export async function generateWeeklyVideoScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = '',
  weekPlan?: WeekPlanDay[],
): Promise<WeeklyVideoScripts> {
  // Rotate angles across the week - each day gets a different angle
  const shuffledAngles = [...VIDEO_ANGLE_OPTIONS].sort(
    () => Math.random() - 0.5,
  );

  let dailyThemes: Array<{ theme: WeeklyTheme; facet: DailyFacet }>;
  let primaryTheme: WeeklyTheme;

  if (weekPlan && weekPlan.length >= 7) {
    // Sync mode: use exact themes/facets from the content plan
    dailyThemes = weekPlan.slice(0, 7).map((d) => ({
      theme: d.theme as WeeklyTheme,
      facet: d.facet,
    }));
    primaryTheme = dailyThemes[0].theme;
  } else {
    // Weighted category rotation across all grimoire categories
    const categorySchedule = selectWeeklyCategoryRotation(weekStartDate);

    dailyThemes = categorySchedule.map((category, i) => {
      const themesForCategory = categoryThemes.filter(
        (t) => t.category === category,
      );
      const seed = themeIndex + i;
      const theme =
        themesForCategory.length > 0
          ? themesForCategory[seed % themesForCategory.length]
          : categoryThemes[seed % categoryThemes.length];
      const facets =
        theme.facetPool && theme.facetPool.length > 0
          ? theme.facetPool
          : theme.facets;
      const facet = facets[seed % facets.length];
      return { theme, facet };
    });

    // Primary theme for YouTube = most frequently used category this week
    const categoryCounts = new Map<string, number>();
    for (const { theme } of dailyThemes) {
      categoryCounts.set(
        theme.category,
        (categoryCounts.get(theme.category) ?? 0) + 1,
      );
    }
    const topCategory = [...categoryCounts.entries()].sort(
      (a, b) => b[1] - a[1],
    )[0][0];
    primaryTheme =
      dailyThemes.find((d) => d.theme.category === topCategory)?.theme ??
      dailyThemes[0].theme;
  }

  // Group consecutive same-category days into mini-series
  const seriesTracker = new Map<string, { start: number; count: number }>();
  const partNumbers: number[] = [];
  const totalPartsPerDay: number[] = [];

  // First pass: count consecutive runs
  for (let i = 0; i < dailyThemes.length; i++) {
    const cat = dailyThemes[i].theme.category;
    if (i === 0 || dailyThemes[i - 1].theme.category !== cat) {
      // Start of new run
      let runLength = 1;
      for (
        let j = i + 1;
        j < dailyThemes.length && dailyThemes[j].theme.category === cat;
        j++
      ) {
        runLength++;
      }
      seriesTracker.set(`${cat}-${i}`, { start: i, count: runLength });
    }
  }

  // Second pass: assign part numbers
  let currentRunKey = '';
  let currentPartNum = 0;
  for (let i = 0; i < dailyThemes.length; i++) {
    const cat = dailyThemes[i].theme.category;
    const key = [...seriesTracker.entries()].find(
      ([, v]) => i >= v.start && i < v.start + v.count,
    );
    if (key) {
      const [runKey, runData] = key;
      if (runKey !== currentRunKey) {
        currentRunKey = runKey;
        currentPartNum = 1;
      } else {
        currentPartNum++;
      }
      partNumbers.push(currentPartNum);
      totalPartsPerDay.push(runData.count);
    } else {
      partNumbers.push(1);
      totalPartsPerDay.push(1);
    }
  }

  // Generate scripts for each day
  const tiktokScripts = await Promise.all(
    dailyThemes.map(async ({ theme, facet }, dayOffset) => {
      const scriptDate = new Date(weekStartDate);
      scriptDate.setDate(scriptDate.getDate() + dayOffset);

      const angleForDay = shuffledAngles[dayOffset % shuffledAngles.length];
      const aspectForDay = mapAngleToAspect(angleForDay);

      return await generateTikTokScript(
        facet,
        theme,
        scriptDate,
        partNumbers[dayOffset],
        totalPartsPerDay[dayOffset],
        baseUrl,
        {
          angleOverride: angleForDay,
          aspectOverride: aspectForDay,
        },
      );
    }),
  );

  const youtubeDate = new Date(weekStartDate);
  youtubeDate.setDate(youtubeDate.getDate() + 6);
  const youtubeScript = await generateYouTubeScript(
    primaryTheme,
    dailyThemes.map((d) => d.facet).slice(0, 4),
    youtubeDate,
    baseUrl,
  );

  return {
    theme: primaryTheme,
    tiktokScripts,
    youtubeScript,
    weekStartDate,
  };
}

/**
 * Generate and save scripts to database
 *
 * Primary slot: weighted category rotation across all grimoire categories
 */
export async function generateAndSaveWeeklyScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = 'https://lunary.app',
  weekPlan?: WeekPlanDay[],
): Promise<WeeklyVideoScripts> {
  await ensureVideoScriptsTable();

  const scripts = await generateWeeklyVideoScripts(
    weekStartDate,
    themeIndex,
    baseUrl,
    weekPlan,
  );

  // Save TikTok scripts and capture IDs
  for (const script of scripts.tiktokScripts) {
    const id = await saveVideoScript(script);
    script.id = id;
  }

  // Save YouTube script and capture ID
  const youtubeId = await saveVideoScript(scripts.youtubeScript);
  scripts.youtubeScript.id = youtubeId;

  return scripts;
}
