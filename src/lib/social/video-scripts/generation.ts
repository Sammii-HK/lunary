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
import type { WeeklyVideoScripts } from './types';
import { ensureVideoScriptsTable, saveVideoScript } from './database';
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
 * Generate and save scripts to database
 *
 * Primary slot: Block A (4 numerology) + Block B (3 witchtok)
 */
export async function generateAndSaveWeeklyScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = 'https://lunary.app',
): Promise<WeeklyVideoScripts> {
  await ensureVideoScriptsTable();

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

  // Save YouTube script and capture ID
  const youtubeId = await saveVideoScript(scripts.youtubeScript);
  scripts.youtubeScript.id = youtubeId;

  return scripts;
}
