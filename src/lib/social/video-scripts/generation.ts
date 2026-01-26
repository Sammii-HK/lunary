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
  const tiktokScripts: VideoScript[] = await Promise.all(
    facets.map(async (facet, dayOffset) => {
      const scriptDate = new Date(weekStartDate);
      scriptDate.setDate(scriptDate.getDate() + dayOffset);
      const partNumber = dayOffset + 1;
      return await generateTikTokScript(
        facet,
        theme,
        scriptDate,
        partNumber,
        totalParts,
        baseUrl,
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

  // Save TikTok scripts
  for (const script of scripts.tiktokScripts) {
    await saveVideoScript(script);
  }

  // Generate and save secondary daily scripts
  for (const [index, primaryScript] of scripts.tiktokScripts.entries()) {
    const scriptDate = primaryScript.scheduledDate;
    const secondaryTheme = await selectSecondaryTheme(
      scripts.theme.id,
      scriptDate,
    );
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
    await saveVideoScript(secondaryScript);
    await recordSecondaryThemeUsage(secondaryTheme.id, scriptDate);
  }

  // Save YouTube script
  await saveVideoScript(scripts.youtubeScript);

  return scripts;
}
