/**
 * Content rotation logic for video scripts
 */

import { ContentAspect, CONTENT_ASPECTS } from '../shared/types';
import { pickRandom } from '../shared/text/normalize';
import { categoryThemes, type WeeklyTheme } from '../weekly-themes';
import {
  VIDEO_ANGLE_OPTIONS,
  SECONDARY_THEME_COOLDOWN_DAYS,
} from './constants';

/**
 * Ensure content rotation secondary table exists
 */
export async function ensureContentRotationSecondaryTable(): Promise<void> {
  const { sql } = await import('@vercel/postgres');
  await sql`
    CREATE TABLE IF NOT EXISTS content_rotation_secondary (
      theme_id TEXT PRIMARY KEY,
      secondary_usage_count INTEGER NOT NULL DEFAULT 0,
      last_secondary_used_at TIMESTAMP WITH TIME ZONE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_content_rotation_secondary_last_used
    ON content_rotation_secondary(last_secondary_used_at)
  `;
}

/**
 * Get angle for topic based on recent usage
 */
export async function getAngleForTopic(
  topic: string,
  scheduledDate: Date,
): Promise<string> {
  const { sql } = await import('@vercel/postgres');
  const result = await sql`
    SELECT angle
    FROM video_scripts
    WHERE topic = ${topic}
      AND angle IS NOT NULL
      AND scheduled_date <= ${scheduledDate.toISOString()}
    ORDER BY scheduled_date DESC NULLS LAST
    LIMIT 10
  `;
  const recentAngles = result.rows
    .map((row) => String(row.angle))
    .filter(Boolean);
  for (const option of VIDEO_ANGLE_OPTIONS) {
    if (!recentAngles.includes(option)) {
      return option;
    }
  }
  if (recentAngles.length === 0) {
    return pickRandom(VIDEO_ANGLE_OPTIONS);
  }
  const lastIndex = new Map<string, number>();
  recentAngles.forEach((angle, index) => {
    if (!lastIndex.has(angle)) lastIndex.set(angle, index);
  });
  const sorted = VIDEO_ANGLE_OPTIONS.slice().sort((a, b) => {
    const aIndex = lastIndex.get(a) ?? 999;
    const bIndex = lastIndex.get(b) ?? 999;
    return bIndex - aIndex;
  });
  return sorted[0] || VIDEO_ANGLE_OPTIONS[0];
}

/**
 * Related category groups - secondary themes should come from same/related categories
 */
const RELATED_CATEGORIES: Record<string, string[]> = {
  numerology: ['numerology'], // Keep numerology themes together
  zodiac: ['zodiac', 'planetary'], // Zodiac and planets are related
  planetary: ['zodiac', 'planetary'],
  tarot: ['tarot'], // Keep tarot themes together
  lunar: ['lunar', 'planetary'],
  crystals: ['crystals', 'chakras'], // Crystals and chakras are related
  chakras: ['crystals', 'chakras'],
  sabbat: ['sabbat', 'lunar'],
  runes: ['runes'],
};

/**
 * Select secondary theme based on usage and cooldown
 * Prefers themes from the same or related categories
 */
export async function selectSecondaryTheme(
  primaryThemeId: string,
  asOfDate: Date,
): Promise<WeeklyTheme> {
  const { sql } = await import('@vercel/postgres');
  await ensureContentRotationSecondaryTable();

  // Find primary theme to get its category
  const primaryTheme = categoryThemes.find((t) => t.id === primaryThemeId);
  const primaryCategory = primaryTheme?.category || 'default';
  const relatedCategories = RELATED_CATEGORIES[primaryCategory] || [
    primaryCategory,
  ];

  const usageResult = await sql`
    SELECT theme_id, secondary_usage_count, last_secondary_used_at
    FROM content_rotation_secondary
  `;
  const usageMap = new Map<string, { count: number; lastUsed: Date | null }>();
  usageResult.rows.forEach((row) => {
    usageMap.set(row.theme_id, {
      count: Number(row.secondary_usage_count) || 0,
      lastUsed: row.last_secondary_used_at
        ? new Date(row.last_secondary_used_at)
        : null,
    });
  });
  const recentResult = await sql`
    SELECT secondary_theme_id
    FROM video_scripts
    WHERE secondary_theme_id IS NOT NULL
    ORDER BY created_at DESC
    LIMIT 10
  `;
  const recentSecondaryIds = new Set(
    recentResult.rows
      .map((row) => String(row.secondary_theme_id))
      .filter(Boolean),
  );
  const cutoff = new Date(asOfDate);
  cutoff.setDate(cutoff.getDate() - SECONDARY_THEME_COOLDOWN_DAYS);

  const buildCandidates = (
    ignoreCooldown: boolean,
    ignoreRecent: boolean,
    allowAnyCategory: boolean,
  ) =>
    categoryThemes
      .filter((theme) => theme.id !== primaryThemeId)
      // Prefer same/related categories unless allowAnyCategory
      .filter(
        (theme) =>
          allowAnyCategory || relatedCategories.includes(theme.category),
      )
      .filter((theme) => ignoreRecent || !recentSecondaryIds.has(theme.id))
      .filter((theme) => {
        if (ignoreCooldown) return true;
        const record = usageMap.get(theme.id);
        if (!record?.lastUsed) return true;
        return record.lastUsed.getTime() < cutoff.getTime();
      })
      .map((theme) => {
        const record = usageMap.get(theme.id);
        return {
          theme,
          count: record?.count ?? 0,
        };
      });

  // Try same/related category first
  let candidates = buildCandidates(false, false, false);
  if (candidates.length === 0) {
    candidates = buildCandidates(true, false, false);
  }
  if (candidates.length === 0) {
    candidates = buildCandidates(true, true, false);
  }
  // Fall back to any category if no related themes available
  if (candidates.length === 0) {
    candidates = buildCandidates(true, true, true);
  }
  if (candidates.length === 0) {
    return (
      categoryThemes.find((theme) => theme.id !== primaryThemeId) ||
      categoryThemes[0]
    );
  }

  const minCount = Math.min(...candidates.map((item) => item.count));
  const lowest = candidates.filter((item) => item.count === minCount);
  return pickRandom(lowest).theme;
}

/**
 * Select secondary aspect based on usage
 */
export async function selectSecondaryAspect(
  themeId: string,
): Promise<ContentAspect> {
  const { sql } = await import('@vercel/postgres');
  const result = await sql`
    SELECT secondary_aspect_key, scheduled_date
    FROM video_scripts
    WHERE secondary_theme_id = ${themeId}
      AND secondary_aspect_key IS NOT NULL
    ORDER BY scheduled_date DESC NULLS LAST
    LIMIT 50
  `;
  const lastUsed = new Map<ContentAspect, Date>();
  for (const row of result.rows) {
    const aspect = row.secondary_aspect_key as ContentAspect;
    if (!aspect || lastUsed.has(aspect)) continue;
    lastUsed.set(aspect, new Date(row.scheduled_date));
  }

  const unused = CONTENT_ASPECTS.filter((aspect) => !lastUsed.has(aspect));
  if (unused.length > 0) {
    return pickRandom(unused);
  }

  let oldestAspect = CONTENT_ASPECTS[0];
  let oldestTime = Number.POSITIVE_INFINITY;
  for (const aspect of CONTENT_ASPECTS) {
    const usedAt = lastUsed.get(aspect)?.getTime() ?? 0;
    if (usedAt < oldestTime) {
      oldestTime = usedAt;
      oldestAspect = aspect;
    }
  }
  return oldestAspect;
}

/**
 * Record secondary theme usage
 */
export async function recordSecondaryThemeUsage(
  themeId: string,
  usedAt: Date,
): Promise<void> {
  const { sql } = await import('@vercel/postgres');
  await sql`
    INSERT INTO content_rotation_secondary (
      theme_id, secondary_usage_count, last_secondary_used_at, updated_at
    )
    VALUES (${themeId}, 1, ${usedAt.toISOString()}, NOW())
    ON CONFLICT (theme_id)
    DO UPDATE SET
      secondary_usage_count = content_rotation_secondary.secondary_usage_count + 1,
      last_secondary_used_at = ${usedAt.toISOString()},
      updated_at = NOW()
  `;
}
