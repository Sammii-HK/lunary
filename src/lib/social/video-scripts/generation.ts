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

  // Guarantee at least 1 numerology video per week
  const hasNumerology =
    scripts.theme.category === 'numerology' ||
    secondaryTheme.category === 'numerology';
  if (!hasNumerology) {
    const numerologyThemes = categoryThemes.filter(
      (t) => t.category === 'numerology',
    );
    if (numerologyThemes.length > 0) {
      const numTheme =
        numerologyThemes[Math.floor(Math.random() * numerologyThemes.length)];
      const numFacet = numTheme.facets[0];
      const numDate = new Date(weekStartDate);
      // Schedule on Wednesday (day offset 2) to space it mid-week
      numDate.setDate(numDate.getDate() + 2);
      const numAngle = await getAngleForTopic(numFacet.title, numDate);
      const numAspect = await selectSecondaryAspect(numTheme.id);
      const numScript = await generateTikTokScript(
        numFacet,
        numTheme,
        numDate,
        1,
        numTheme.facets.length,
        baseUrl,
        {
          primaryThemeId: scripts.theme.id,
          secondaryThemeId: numTheme.id,
          secondaryFacetSlug: numFacet.grimoireSlug,
          secondaryAngleKey: numAngle,
          secondaryAspectKey: numAspect,
          angleOverride: numAngle,
          aspectOverride: numAspect,
        },
      );
      const numId = await saveVideoScript(numScript);
      numScript.id = numId;
      scripts.tiktokScripts.push(numScript);
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
