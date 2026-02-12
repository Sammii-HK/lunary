/**
 * Main video script generation functions
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

/**
 * Generate all video scripts for a week
 * Returns 7 TikTok scripts (daily) and 1 YouTube script (Sunday)
 */
export async function generateWeeklyVideoScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = '',
): Promise<WeeklyVideoScripts> {
  const theme = categoryThemes[themeIndex % categoryThemes.length];
  const facets = theme.facets;

  const totalParts = facets.length;

  // Rotate angles across the week - each day gets a different angle
  const shuffledAngles = [...VIDEO_ANGLE_OPTIONS].sort(
    () => Math.random() - 0.5,
  );

  const tiktokScripts: VideoScript[] = await Promise.all(
    facets.map(async (facet, dayOffset) => {
      const scriptDate = new Date(weekStartDate);
      scriptDate.setDate(scriptDate.getDate() + dayOffset);
      const partNumber = dayOffset + 1;

      // Assign rotated angle for this day
      const angleForDay = shuffledAngles[dayOffset % shuffledAngles.length];
      const aspectForDay = mapAngleToAspect(angleForDay);

      return await generateTikTokScript(
        facet,
        theme,
        scriptDate,
        partNumber,
        totalParts,
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
    theme,
    facets,
    youtubeDate,
    baseUrl,
  );

  return {
    theme,
    tiktokScripts,
    youtubeScript,
    weekStartDate,
  };
}

/**
 * Generate and save scripts to database
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

  // Select ONE secondary theme for the entire week (consistent across all 7 days)
  const secondaryTheme = await selectSecondaryTheme(
    scripts.theme.id,
    weekStartDate,
  );

  // Generate and save secondary daily scripts using the same theme
  for (const [index, primaryScript] of scripts.tiktokScripts.entries()) {
    const scriptDate = primaryScript.scheduledDate;
    const secondaryFacet =
      secondaryTheme.facets[index % secondaryTheme.facets.length];
    const secondaryAngle = await getAngleForTopic(
      secondaryFacet.title,
      scriptDate,
    );
    const secondaryAspect = await selectSecondaryAspect(secondaryTheme.id);
    const secondaryScript = await generateTikTokScript(
      secondaryFacet,
      secondaryTheme,
      scriptDate,
      index + 1,
      secondaryTheme.facets.length,
      baseUrl,
      {
        primaryThemeId: scripts.theme.id,
        secondaryThemeId: secondaryTheme.id,
        secondaryFacetSlug: secondaryFacet.grimoireSlug,
        secondaryAngleKey: secondaryAngle,
        secondaryAspectKey: secondaryAspect,
        angleOverride: secondaryAngle,
        aspectOverride: secondaryAspect,
      },
    );
    const secondaryId = await saveVideoScript(secondaryScript);
    secondaryScript.id = secondaryId;
  }

  // Record secondary theme usage once for the week
  await recordSecondaryThemeUsage(secondaryTheme.id, weekStartDate);

  // Category quotas — guarantee minimum representation per week
  const CATEGORY_QUOTAS: Record<string, { min: number; maxBonus: number }> = {
    numerology: { min: 2, maxBonus: 3 },
    spells: { min: 1, maxBonus: 2 },
  };

  // Count how many scripts already cover each quota category
  // Primary = 7 scripts, secondary = 7 scripts
  const categoryCount: Record<string, number> = {};
  const primaryCat = scripts.theme.category;
  const secondaryCat = secondaryTheme.category;
  if (primaryCat in CATEGORY_QUOTAS)
    categoryCount[primaryCat] = (categoryCount[primaryCat] || 0) + 7;
  if (secondaryCat in CATEGORY_QUOTAS)
    categoryCount[secondaryCat] = (categoryCount[secondaryCat] || 0) + 7;

  // Best TikTok engagement days: Tue(1), Thu(3), Mon(0), Wed(2)
  const TIKTOK_PEAK_DAYS = [1, 3, 0, 2];

  for (const [category, quota] of Object.entries(CATEGORY_QUOTAS)) {
    const current = categoryCount[category] || 0;
    if (current >= quota.min) continue;

    const needed = Math.min(quota.min, quota.maxBonus) - current;
    const themes = categoryThemes.filter((t) => t.category === category);
    if (themes.length === 0) continue;

    for (let i = 0; i < needed; i++) {
      const theme = themes[Math.floor(Math.random() * themes.length)];
      const facet = theme.facets[i % theme.facets.length];
      const bonusDate = new Date(weekStartDate);
      bonusDate.setDate(
        bonusDate.getDate() + TIKTOK_PEAK_DAYS[i % TIKTOK_PEAK_DAYS.length],
      );

      const bonusAngle = await getAngleForTopic(facet.title, bonusDate);
      const bonusAspect = await selectSecondaryAspect(theme.id);
      const bonusScript = await generateTikTokScript(
        facet,
        theme,
        bonusDate,
        i + 1,
        theme.facets.length,
        baseUrl,
        {
          primaryThemeId: scripts.theme.id,
          secondaryThemeId: theme.id,
          secondaryFacetSlug: facet.grimoireSlug,
          secondaryAngleKey: bonusAngle,
          secondaryAspectKey: bonusAspect,
          angleOverride: bonusAngle,
          aspectOverride: bonusAspect,
        },
      );
      const bonusId = await saveVideoScript(bonusScript);
      bonusScript.id = bonusId;
      scripts.tiktokScripts.push(bonusScript);
    }
  }

  // Save YouTube script and capture ID
  const youtubeId = await saveVideoScript(scripts.youtubeScript);
  scripts.youtubeScript.id = youtubeId;

  return scripts;
}

/**
 * Generate only secondary scripts for existing primary scripts
 * Use this when primary scripts already exist but secondary don't
 */
export async function generateSecondaryScriptsOnly(
  primaryTheme: (typeof categoryThemes)[number],
  primaryScripts: VideoScript[],
  baseUrl: string = 'https://lunary.app',
): Promise<VideoScript[]> {
  await ensureVideoScriptsTable();
  await ensureContentRotationSecondaryTable();

  // Select ONE secondary theme for all scripts (consistent across the week)
  const weekStartDate = primaryScripts[0]?.scheduledDate || new Date();
  const secondaryTheme = await selectSecondaryTheme(
    primaryTheme.id,
    weekStartDate,
  );

  const secondaryScripts: VideoScript[] = [];

  for (const [index, primaryScript] of primaryScripts.entries()) {
    const scriptDate = primaryScript.scheduledDate;
    const secondaryFacet =
      secondaryTheme.facets[index % secondaryTheme.facets.length];
    const secondaryAngle = await getAngleForTopic(
      secondaryFacet.title,
      scriptDate,
    );
    const secondaryAspect = await selectSecondaryAspect(secondaryTheme.id);
    const secondaryScript = await generateTikTokScript(
      secondaryFacet,
      secondaryTheme,
      scriptDate,
      index + 1,
      secondaryTheme.facets.length,
      baseUrl,
      {
        primaryThemeId: primaryTheme.id,
        secondaryThemeId: secondaryTheme.id,
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
  await recordSecondaryThemeUsage(secondaryTheme.id, weekStartDate);

  return secondaryScripts;
}
