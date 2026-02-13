/**
 * Main video script generation functions
 *
 * Primary slot uses a dual mini-series structure:
 * - Block A (Mon-Thu): 4 facets from a numerology theme (totalParts=4)
 * - Block B (Fri-Sun): 3 facets from a rotating witchtok category (totalParts=3)
 *
 * This keeps series at the optimal 3-5 part length (research shows 7 is too long)
 * while guaranteeing numerology (the #1 performer) appears every week.
 */

import { categoryThemes } from '../weekly-themes';
import type { WeeklyVideoScripts, VideoScript } from './types';
import { ensureVideoScriptsTable, saveVideoScript } from './database';
import {
  ensureContentRotationSecondaryTable,
  getAngleForTopic,
  selectSecondaryTheme,
  selectSecondaryAspect,
  recordSecondaryThemeUsage,
} from './rotation';
import { VIDEO_ANGLE_OPTIONS, mapAngleToAspect } from './constants';
import { generateTikTokScript } from './tiktok/generation';
import { generateYouTubeScript } from './youtube/generation';

/** Categories that rotate in the witchtok slot (Block B) */
const WITCHTOK_ROTATION_CATEGORIES = [
  'spells',
  'tarot',
  'crystals',
  'zodiac',
  'lunar',
  'planetary',
];

/**
 * Generate all video scripts for a week
 * Returns 7 TikTok scripts (4 from Block A + 3 from Block B) and 1 YouTube script
 *
 * Block A (Mon-Thu): 4 facets from a numerology theme
 * Block B (Fri-Sun): 3 facets from a rotating witchtok category
 */
export async function generateWeeklyVideoScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = '',
): Promise<WeeklyVideoScripts> {
  // Block A: Mon-Thu (4 parts) — ALWAYS numerology
  const numerologyThemes = categoryThemes.filter(
    (t) => t.category === 'numerology',
  );
  const themeA =
    numerologyThemes.length > 0
      ? numerologyThemes[themeIndex % numerologyThemes.length]
      : categoryThemes[themeIndex % categoryThemes.length];
  const facetsA = themeA.facets.slice(0, 4);

  // Block B: Fri-Sun (3 parts) — rotate through witchtok categories
  const witchtokCategory =
    WITCHTOK_ROTATION_CATEGORIES[
      themeIndex % WITCHTOK_ROTATION_CATEGORIES.length
    ];
  const witchtokThemes = categoryThemes.filter(
    (t) => t.category === witchtokCategory,
  );
  const themeB =
    witchtokThemes.length > 0
      ? witchtokThemes[themeIndex % witchtokThemes.length]
      : categoryThemes[(themeIndex + 1) % categoryThemes.length];
  const facetsB = themeB.facets.slice(0, 3);

  // Rotate angles across the week - each day gets a different angle
  const shuffledAngles = [...VIDEO_ANGLE_OPTIONS].sort(
    () => Math.random() - 0.5,
  );

  // Generate Block A scripts (Mon-Thu, parts 1-4)
  const blockAScripts = await Promise.all(
    facetsA.map(async (facet, dayOffset) => {
      const scriptDate = new Date(weekStartDate);
      scriptDate.setDate(scriptDate.getDate() + dayOffset);

      const angleForDay = shuffledAngles[dayOffset % shuffledAngles.length];
      const aspectForDay = mapAngleToAspect(angleForDay);

      return await generateTikTokScript(
        facet,
        themeA,
        scriptDate,
        dayOffset + 1,
        4, // totalParts=4 for Block A
        baseUrl,
        {
          angleOverride: angleForDay,
          aspectOverride: aspectForDay,
        },
      );
    }),
  );

  // Generate Block B scripts (Fri-Sun, parts 1-3)
  const blockBScripts = await Promise.all(
    facetsB.map(async (facet, i) => {
      const scriptDate = new Date(weekStartDate);
      scriptDate.setDate(scriptDate.getDate() + 4 + i); // Day 4,5,6 = Fri,Sat,Sun

      const angleForDay = shuffledAngles[(4 + i) % shuffledAngles.length];
      const aspectForDay = mapAngleToAspect(angleForDay);

      return await generateTikTokScript(
        facet,
        themeB,
        scriptDate,
        i + 1,
        3, // totalParts=3 for Block B
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
    themeA,
    facetsA,
    youtubeDate,
    baseUrl,
  );

  return {
    theme: themeA, // Numerology = primary theme for YouTube summary
    tiktokScripts: [...blockAScripts, ...blockBScripts],
    youtubeScript,
    weekStartDate,
  };
}

/**
 * Select a secondary theme from a different category than the given ones.
 * Used to ensure secondary slot has different categories than primary.
 */
function selectDifferentCategoryTheme(
  excludeCategories: string[],
  themeIndex: number,
): (typeof categoryThemes)[number] {
  const candidates = categoryThemes.filter(
    (t) => !excludeCategories.includes(t.category),
  );
  if (candidates.length === 0) {
    return categoryThemes[themeIndex % categoryThemes.length];
  }
  return candidates[themeIndex % candidates.length];
}

/**
 * Generate and save scripts to database
 *
 * Primary slot: Block A (4 numerology) + Block B (3 witchtok)
 * Secondary slot: mirrors the dual block pattern with different categories
 */
export async function generateAndSaveWeeklyScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = 'https://lunary.app',
): Promise<WeeklyVideoScripts> {
  await ensureVideoScriptsTable();
  await ensureContentRotationSecondaryTable();

  const scripts = await generateWeeklyVideoScripts(
    weekStartDate,
    themeIndex,
    baseUrl,
  );

  // Save TikTok scripts and capture IDs
  for (const script of scripts.tiktokScripts) {
    const id = await saveVideoScript(script);
    script.id = id;
  }

  // Determine primary categories used (numerology for Block A, witchtok for Block B)
  const primaryBlockACategory = scripts.theme.category;
  const primaryBlockBCategory =
    WITCHTOK_ROTATION_CATEGORIES[
      themeIndex % WITCHTOK_ROTATION_CATEGORIES.length
    ];

  // Secondary Block A (Mon-Thu): different category from primary Block B
  const secondaryThemeA = selectDifferentCategoryTheme(
    [primaryBlockACategory, primaryBlockBCategory],
    themeIndex,
  );
  const secondaryFacetsA = secondaryThemeA.facets.slice(0, 4);

  // Secondary Block B (Fri-Sun): different category again
  const secondaryThemeB = selectDifferentCategoryTheme(
    [primaryBlockACategory, primaryBlockBCategory, secondaryThemeA.category],
    themeIndex + 1,
  );
  const secondaryFacetsB = secondaryThemeB.facets.slice(0, 3);

  // Generate secondary Block A scripts (Mon-Thu, parts 1-4)
  for (const [i, facet] of secondaryFacetsA.entries()) {
    const scriptDate = new Date(weekStartDate);
    scriptDate.setDate(scriptDate.getDate() + i);
    const secondaryAngle = await getAngleForTopic(facet.title, scriptDate);
    const secondaryAspect = await selectSecondaryAspect(secondaryThemeA.id);
    const secondaryScript = await generateTikTokScript(
      facet,
      secondaryThemeA,
      scriptDate,
      i + 1,
      4, // totalParts=4 for Block A
      baseUrl,
      {
        primaryThemeId: scripts.theme.id,
        secondaryThemeId: secondaryThemeA.id,
        secondaryFacetSlug: facet.grimoireSlug,
        secondaryAngleKey: secondaryAngle,
        secondaryAspectKey: secondaryAspect,
        angleOverride: secondaryAngle,
        aspectOverride: secondaryAspect,
      },
    );
    const secondaryId = await saveVideoScript(secondaryScript);
    secondaryScript.id = secondaryId;
  }

  // Generate secondary Block B scripts (Fri-Sun, parts 1-3)
  for (const [i, facet] of secondaryFacetsB.entries()) {
    const scriptDate = new Date(weekStartDate);
    scriptDate.setDate(scriptDate.getDate() + 4 + i);
    const secondaryAngle = await getAngleForTopic(facet.title, scriptDate);
    const secondaryAspect = await selectSecondaryAspect(secondaryThemeB.id);
    const secondaryScript = await generateTikTokScript(
      facet,
      secondaryThemeB,
      scriptDate,
      i + 1,
      3, // totalParts=3 for Block B
      baseUrl,
      {
        primaryThemeId: scripts.theme.id,
        secondaryThemeId: secondaryThemeB.id,
        secondaryFacetSlug: facet.grimoireSlug,
        secondaryAngleKey: secondaryAngle,
        secondaryAspectKey: secondaryAspect,
        angleOverride: secondaryAngle,
        aspectOverride: secondaryAspect,
      },
    );
    const secondaryId = await saveVideoScript(secondaryScript);
    secondaryScript.id = secondaryId;
  }

  // Record secondary theme usage for both blocks
  await recordSecondaryThemeUsage(secondaryThemeA.id, weekStartDate);
  await recordSecondaryThemeUsage(secondaryThemeB.id, weekStartDate);

  // Save YouTube script and capture ID
  const youtubeId = await saveVideoScript(scripts.youtubeScript);
  scripts.youtubeScript.id = youtubeId;

  return scripts;
}

/**
 * Generate only secondary scripts for existing primary scripts
 * Use this when primary scripts already exist but secondary don't.
 * Uses dual block pattern: Block A (first 4) + Block B (last 3).
 */
export async function generateSecondaryScriptsOnly(
  primaryTheme: (typeof categoryThemes)[number],
  primaryScripts: VideoScript[],
  baseUrl: string = 'https://lunary.app',
): Promise<VideoScript[]> {
  await ensureVideoScriptsTable();
  await ensureContentRotationSecondaryTable();

  const weekStartDate = primaryScripts[0]?.scheduledDate || new Date();

  // Select two different secondary themes for Block A and Block B
  const secondaryThemeA = await selectSecondaryTheme(
    primaryTheme.id,
    weekStartDate,
  );
  const secondaryFacetsA = secondaryThemeA.facets.slice(0, 4);
  const secondaryFacetsB = secondaryThemeA.facets.slice(4, 7);

  // If the theme has enough facets, use them for both blocks
  // Otherwise fall back to using the same theme with wrapping
  const secondaryScripts: VideoScript[] = [];
  const blockACount = Math.min(primaryScripts.length, 4);
  const blockBCount = Math.max(primaryScripts.length - 4, 0);

  // Block A scripts (first 4 primary scripts)
  for (let i = 0; i < blockACount; i++) {
    const scriptDate = primaryScripts[i].scheduledDate;
    const secondaryFacet = secondaryFacetsA[i % secondaryFacetsA.length];
    const secondaryAngle = await getAngleForTopic(
      secondaryFacet.title,
      scriptDate,
    );
    const secondaryAspect = await selectSecondaryAspect(secondaryThemeA.id);
    const secondaryScript = await generateTikTokScript(
      secondaryFacet,
      secondaryThemeA,
      scriptDate,
      i + 1,
      4,
      baseUrl,
      {
        primaryThemeId: primaryTheme.id,
        secondaryThemeId: secondaryThemeA.id,
        secondaryFacetSlug: secondaryFacet.grimoireSlug,
        secondaryAngleKey: secondaryAngle,
        secondaryAspectKey: secondaryAspect,
        angleOverride: secondaryAngle,
        aspectOverride: secondaryAspect,
      },
    );
    const id = await saveVideoScript(secondaryScript);
    secondaryScript.id = id;
    secondaryScripts.push(secondaryScript);
  }

  // Block B scripts (remaining primary scripts)
  for (let i = 0; i < blockBCount; i++) {
    const scriptDate = primaryScripts[4 + i].scheduledDate;
    const facetPool =
      secondaryFacetsB.length > 0 ? secondaryFacetsB : secondaryThemeA.facets;
    const secondaryFacet = facetPool[i % facetPool.length];
    const secondaryAngle = await getAngleForTopic(
      secondaryFacet.title,
      scriptDate,
    );
    const secondaryAspect = await selectSecondaryAspect(secondaryThemeA.id);
    const secondaryScript = await generateTikTokScript(
      secondaryFacet,
      secondaryThemeA,
      scriptDate,
      i + 1,
      3,
      baseUrl,
      {
        primaryThemeId: primaryTheme.id,
        secondaryThemeId: secondaryThemeA.id,
        secondaryFacetSlug: secondaryFacet.grimoireSlug,
        secondaryAngleKey: secondaryAngle,
        secondaryAspectKey: secondaryAspect,
        angleOverride: secondaryAngle,
        aspectOverride: secondaryAspect,
      },
    );
    const id = await saveVideoScript(secondaryScript);
    secondaryScript.id = id;
    secondaryScripts.push(secondaryScript);
  }

  // Record secondary theme usage once for the week
  await recordSecondaryThemeUsage(secondaryThemeA.id, weekStartDate);

  return secondaryScripts;
}
