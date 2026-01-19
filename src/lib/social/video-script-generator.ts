/**
 * Video Script Generator
 *
 * Generates TikTok (30-45s) and YouTube (3-4min) scripts from weekly themes.
 * Scripts are complete, flowing narratives that can be read naturally.
 */

import { getOpenAI } from '@/lib/openai-client';
import { buildScopeGuard } from '@/lib/social/topic-scope';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import { FACTUAL_GUARDRAIL_INSTRUCTION } from '@/lib/social/prompt-guards';
import {
  type WeeklyTheme,
  type DailyFacet,
  categoryThemes,
} from './weekly-themes';

const THEME_CATEGORY_BY_NAME = new Map(
  categoryThemes.map((theme) => [theme.name, theme.category]),
);

// Import data sources
import zodiacSigns from '@/data/zodiac-signs.json';
import tarotCards from '@/data/tarot-cards.json';
import crystals from '@/data/crystals.json';
import numerology from '@/data/numerology.json';
import chakras from '@/data/chakras.json';
import sabbats from '@/data/sabbats.json';
import planetaryBodies from '@/data/planetary-bodies.json';
import { capitalizeThematicTitle } from '../../../utils/og/text';
import { validateSpokenHook } from './caption-utils';

// ============================================================================
// TYPES
// ============================================================================

export interface ScriptSection {
  name: string;
  duration: string;
  content: string;
}

export interface TikTokMetadata {
  theme: string; // Uppercase category e.g. "PLANETS"
  title: string; // Facet title e.g. "The Sun"
  series: string; // Series part e.g. "Part 1 of 3"
  summary: string; // Short description from facet focus
  angle?: string;
  topic?: string;
  aspect?: string;
}

export interface VideoScript {
  id?: number;
  themeId: string;
  themeName: string;
  primaryThemeId?: string;
  secondaryThemeId?: string;
  secondaryFacetSlug?: string;
  secondaryAngleKey?: string;
  secondaryAspectKey?: string;
  facetTitle: string;
  topic?: string;
  angle?: string;
  aspect?: string;
  platform: 'tiktok' | 'youtube';
  sections: ScriptSection[];
  fullScript: string;
  wordCount: number;
  estimatedDuration: string;
  scheduledDate: Date;
  status: 'draft' | 'approved' | 'used';
  createdAt?: Date;
  hookText?: string;
  hookVersion?: number;
  // TikTok-specific fields
  metadata?: TikTokMetadata;
  coverImageUrl?: string;
  partNumber?: number; // 1, 2, or 3
  writtenPostContent?: string; // Social media post content for this video
}

export interface WeeklyVideoScripts {
  theme: WeeklyTheme;
  tiktokScripts: VideoScript[];
  youtubeScript: VideoScript;
  weekStartDate: Date;
}

export enum ContentAspect {
  CORE_MEANING = 'core_meaning',
  COMMON_MISCONCEPTION = 'common_misconception',
  EMOTIONAL_IMPACT = 'emotional_impact',
  REAL_LIFE_EXPRESSION = 'real_life_expression',
  TIMING_AND_CONTEXT = 'timing_and_context',
  PRACTICAL_APPLICATION = 'practical_application',
  WHEN_TO_AVOID = 'when_to_avoid',
  SUBTLE_INSIGHT = 'subtle_insight',
}

const VIDEO_ANGLE_OPTIONS = [
  'Misconception',
  'Felt experience',
  'Pattern recognition',
  'Timing nuance',
  'Practical observation',
];

const CONTENT_ASPECTS: ContentAspect[] = [
  ContentAspect.CORE_MEANING,
  ContentAspect.COMMON_MISCONCEPTION,
  ContentAspect.EMOTIONAL_IMPACT,
  ContentAspect.REAL_LIFE_EXPRESSION,
  ContentAspect.TIMING_AND_CONTEXT,
  ContentAspect.PRACTICAL_APPLICATION,
  ContentAspect.WHEN_TO_AVOID,
  ContentAspect.SUBTLE_INSIGHT,
];

const SECONDARY_THEME_COOLDOWN_DAYS = 10;

const SEARCH_PHRASE_MAP: Record<string, string> = {};

// ============================================================================
// DATABASE
// ============================================================================

export async function ensureVideoScriptsTable(): Promise<void> {
  const { sql } = await import('@vercel/postgres');

  await sql`
    CREATE TABLE IF NOT EXISTS video_scripts (
      id SERIAL PRIMARY KEY,
      theme_id TEXT NOT NULL,
      theme_name TEXT NOT NULL,
      primary_theme_id TEXT,
      secondary_theme_id TEXT,
      secondary_facet_slug TEXT,
      secondary_angle_key TEXT,
      secondary_aspect_key TEXT,
      facet_title TEXT NOT NULL,
      topic TEXT,
      angle TEXT,
      aspect TEXT,
      platform TEXT NOT NULL,
      sections JSONB NOT NULL,
      full_script TEXT NOT NULL,
      word_count INTEGER NOT NULL,
      estimated_duration TEXT NOT NULL,
      scheduled_date DATE NOT NULL,
      status TEXT NOT NULL DEFAULT 'draft',
      metadata JSONB,
      cover_image_url TEXT,
      part_number INTEGER,
      written_post_content TEXT,
      hook_text TEXT,
      hook_version INTEGER DEFAULT 1,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_scripts_platform ON video_scripts(platform)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_scripts_status ON video_scripts(status)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_scripts_scheduled ON video_scripts(scheduled_date)
  `;

  // Add new columns if they don't exist (for existing tables)
  try {
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS metadata JSONB`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS cover_image_url TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS part_number INTEGER`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS written_post_content TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS hook_text TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS hook_version INTEGER DEFAULT 1`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS topic TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS angle TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS aspect TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS primary_theme_id TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS secondary_theme_id TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS secondary_facet_slug TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS secondary_angle_key TEXT`;
    await sql`ALTER TABLE video_scripts ADD COLUMN IF NOT EXISTS secondary_aspect_key TEXT`;
  } catch {
    // Columns may already exist
  }
}

export async function saveVideoScript(script: VideoScript): Promise<number> {
  const { sql } = await import('@vercel/postgres');

  const result = await sql`
    INSERT INTO video_scripts (
      theme_id, theme_name, primary_theme_id, secondary_theme_id,
      secondary_facet_slug, secondary_angle_key, secondary_aspect_key,
      facet_title, topic, angle, aspect, platform, sections,
      full_script, word_count, estimated_duration, scheduled_date, status,
      metadata, cover_image_url, part_number, written_post_content, hook_text, hook_version
    )
    VALUES (
      ${script.themeId},
      ${script.themeName},
      ${script.primaryThemeId || null},
      ${script.secondaryThemeId || null},
      ${script.secondaryFacetSlug || null},
      ${script.secondaryAngleKey || null},
      ${script.secondaryAspectKey || null},
      ${script.facetTitle},
      ${script.topic || null},
      ${script.angle || null},
      ${script.aspect || null},
      ${script.platform},
      ${JSON.stringify(script.sections)},
      ${script.fullScript},
      ${script.wordCount},
      ${script.estimatedDuration},
      ${script.scheduledDate.toISOString()},
      ${script.status},
      ${script.metadata ? JSON.stringify(script.metadata) : null},
      ${script.coverImageUrl || null},
      ${script.partNumber || null},
      ${script.writtenPostContent || null},
      ${script.hookText || null},
      ${script.hookVersion || 1}
    )
    RETURNING id
  `;

  return result.rows[0].id;
}

export async function updateVideoScriptHook(
  id: number,
  payload: { fullScript: string; hookText: string; hookVersion: number },
): Promise<void> {
  const { sql } = await import('@vercel/postgres');
  await sql`
    UPDATE video_scripts
    SET full_script = ${payload.fullScript},
        hook_text = ${payload.hookText},
        hook_version = ${payload.hookVersion},
        updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function getVideoScripts(filters?: {
  platform?: string;
  status?: string;
  weekStart?: Date;
}): Promise<VideoScript[]> {
  const { sql } = await import('@vercel/postgres');

  let result;

  if (filters?.weekStart) {
    const weekEnd = new Date(filters.weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (filters.platform && filters.status) {
      result = await sql`
        SELECT * FROM video_scripts
        WHERE platform = ${filters.platform}
        AND status = ${filters.status}
        AND scheduled_date >= ${filters.weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
        ORDER BY scheduled_date ASC
      `;
    } else if (filters.platform) {
      result = await sql`
        SELECT * FROM video_scripts
        WHERE platform = ${filters.platform}
        AND scheduled_date >= ${filters.weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
        ORDER BY scheduled_date ASC
      `;
    } else if (filters.status) {
      result = await sql`
        SELECT * FROM video_scripts
        WHERE status = ${filters.status}
        AND scheduled_date >= ${filters.weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
        ORDER BY scheduled_date ASC
      `;
    } else {
      result = await sql`
        SELECT * FROM video_scripts
        WHERE scheduled_date >= ${filters.weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
        ORDER BY scheduled_date ASC
      `;
    }
  } else {
    result = await sql`
      SELECT * FROM video_scripts
      ORDER BY scheduled_date DESC
      LIMIT 50
    `;
  }

  const scripts: VideoScript[] = [];
  for (const row of result.rows) {
    const scheduledDate = new Date(row.scheduled_date);
    const topic = row.topic || row.facet_title || row.theme_name;
    const category = THEME_CATEGORY_BY_NAME.get(row.theme_name);

    const ensuredHook = ensureVideoHook(row.full_script, {
      topic,
      category,
      source: 'db',
      scriptId: row.id,
      scheduledDate,
    });

    let hookVersion = row.hook_version || 1;
    if (ensuredHook.modified) {
      hookVersion = (row.hook_version || 1) + 1;
      await updateVideoScriptHook(row.id, {
        fullScript: ensuredHook.script,
        hookText: ensuredHook.hook,
        hookVersion,
      });
    }

    scripts.push({
      id: row.id,
      themeId: row.theme_id,
      themeName: row.theme_name,
      primaryThemeId: row.primary_theme_id || undefined,
      secondaryThemeId: row.secondary_theme_id || undefined,
      secondaryFacetSlug: row.secondary_facet_slug || undefined,
      secondaryAngleKey: row.secondary_angle_key || undefined,
      secondaryAspectKey: row.secondary_aspect_key || undefined,
      facetTitle: row.facet_title,
      topic: row.topic || undefined,
      angle: row.angle || undefined,
      aspect: row.aspect || undefined,
      platform: row.platform,
      sections: row.sections,
      fullScript: ensuredHook.script,
      wordCount: row.word_count,
      estimatedDuration: row.estimated_duration,
      scheduledDate,
      status: row.status,
      createdAt: new Date(row.created_at),
      metadata: row.metadata || undefined,
      coverImageUrl: row.cover_image_url || undefined,
      partNumber: row.part_number || undefined,
      writtenPostContent: row.written_post_content || undefined,
      hookText: ensuredHook.hook,
      hookVersion,
    });
  }

  return scripts;
}

export async function updateVideoScriptStatus(
  id: number,
  status: 'draft' | 'approved' | 'used',
): Promise<void> {
  const { sql } = await import('@vercel/postgres');

  await sql`
    UPDATE video_scripts
    SET status = ${status}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

export async function updateVideoScriptWrittenPost(
  id: number,
  writtenPostContent: string,
): Promise<void> {
  const { sql } = await import('@vercel/postgres');

  await sql`
    UPDATE video_scripts
    SET written_post_content = ${writtenPostContent}, updated_at = NOW()
    WHERE id = ${id}
  `;
}

async function ensureContentRotationSecondaryTable(): Promise<void> {
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

const pickRandom = <T>(items: T[]): T => {
  return items[Math.floor(Math.random() * items.length)];
};

const aspectLabel = (aspect: ContentAspect): string => {
  const labels: Record<ContentAspect, string> = {
    [ContentAspect.CORE_MEANING]: 'Core meaning and symbolism',
    [ContentAspect.COMMON_MISCONCEPTION]: 'Common misconception',
    [ContentAspect.EMOTIONAL_IMPACT]: 'Emotional or psychological impact',
    [ContentAspect.REAL_LIFE_EXPRESSION]: 'How it shows up in daily life',
    [ContentAspect.TIMING_AND_CONTEXT]: 'Timing and context',
    [ContentAspect.PRACTICAL_APPLICATION]: 'Practical application',
    [ContentAspect.WHEN_TO_AVOID]: 'When to avoid working with it',
    [ContentAspect.SUBTLE_INSIGHT]: 'Subtle or overlooked detail',
  };
  return labels[aspect];
};

const mapAngleToAspect = (angle: string): ContentAspect => {
  switch (angle) {
    case 'Misconception':
      return ContentAspect.COMMON_MISCONCEPTION;
    case 'Felt experience':
      return ContentAspect.EMOTIONAL_IMPACT;
    case 'Pattern recognition':
      return ContentAspect.SUBTLE_INSIGHT;
    case 'Timing nuance':
      return ContentAspect.TIMING_AND_CONTEXT;
    case 'Practical observation':
      return ContentAspect.PRACTICAL_APPLICATION;
    default:
      return ContentAspect.CORE_MEANING;
  }
};

async function getAngleForTopic(
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

async function selectSecondaryTheme(
  primaryThemeId: string,
  asOfDate: Date,
): Promise<WeeklyTheme> {
  const { sql } = await import('@vercel/postgres');
  await ensureContentRotationSecondaryTable();
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

  const buildCandidates = (ignoreCooldown: boolean, ignoreRecent: boolean) =>
    categoryThemes
      .filter((theme) => theme.id !== primaryThemeId)
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

  let candidates = buildCandidates(false, false);
  if (candidates.length === 0) {
    candidates = buildCandidates(true, false);
  }
  if (candidates.length === 0) {
    candidates = buildCandidates(true, true);
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

async function selectSecondaryAspect(themeId: string): Promise<ContentAspect> {
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

async function recordSecondaryThemeUsage(
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

// ============================================================================
// GRIMOIRE DATA HELPERS
// ============================================================================

function getGrimoireDataForFacet(
  facet: DailyFacet,
): Record<string, any> | null {
  const slug = facet.grimoireSlug;

  // Try zodiac signs
  if (slug.includes('zodiac/')) {
    const sign = slug.split('/').pop();
    if (sign && zodiacSigns[sign as keyof typeof zodiacSigns]) {
      return zodiacSigns[sign as keyof typeof zodiacSigns];
    }
  }

  // Try planets
  if (slug.includes('planets/') || slug.includes('astronomy/')) {
    const planet = slug.split('/').pop();
    if (planet && planetaryBodies[planet as keyof typeof planetaryBodies]) {
      return planetaryBodies[planet as keyof typeof planetaryBodies];
    }
  }

  // Try chakras
  if (slug.includes('chakras/')) {
    const chakra = slug.split('/').pop();
    if (chakra && chakras[chakra as keyof typeof chakras]) {
      return chakras[chakra as keyof typeof chakras];
    }
  }

  // Try crystals
  if (slug.includes('crystals/')) {
    const crystalId = slug.split('/').pop();
    const crystal = (crystals as any[]).find(
      (c) =>
        c.id === crystalId || c.name.toLowerCase() === crystalId?.toLowerCase(),
    );
    if (crystal) return crystal;
  }

  // Try tarot
  if (slug.includes('tarot/')) {
    const cardSlug = slug.split('/').pop();
    if (cardSlug) {
      const cardKey = cardSlug
        .split('-')
        .map((word, i) =>
          i === 0
            ? word.toLowerCase()
            : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join('');
      const card =
        tarotCards.majorArcana[cardKey as keyof typeof tarotCards.majorArcana];
      if (card) return card;
    }
  }

  // Try sabbats
  if (slug.includes('wheel-of-the-year/')) {
    const sabbatName = slug.split('/').pop();
    const sabbat = (sabbats as any[]).find(
      (s) => s.name.toLowerCase() === sabbatName?.toLowerCase(),
    );
    if (sabbat) return sabbat;
  }

  // Try numerology
  if (slug.includes('numerology') || slug.includes('angel-numbers')) {
    const match = slug.match(/(\d+)/);
    if (match) {
      const num = match[1];
      const angelNum =
        numerology.angelNumbers?.[num as keyof typeof numerology.angelNumbers];
      if (angelNum) return angelNum;
      const lifePath =
        numerology.lifePathNumbers?.[
          num as keyof typeof numerology.lifePathNumbers
        ];
      if (lifePath) return lifePath;
    }
  }

  return null;
}

function isAllowedSlugForCategory(category: string, slug: string): boolean {
  const lower = slug.toLowerCase();
  const allowedPrefixes: Record<string, string[]> = {
    lunar: ['moon', 'moon/', 'moon-', 'moon-in', 'lunar', 'eclipses'],
    planetary: ['astronomy/planets', 'astronomy/retrogrades', 'planets'],
    zodiac: ['zodiac', 'rising-sign', 'birth-chart'],
    tarot: ['tarot', 'card-combinations', 'tarot-spreads'],
    crystals: ['crystals'],
    numerology: ['numerology', 'angel-numbers', 'life-path'],
    chakras: ['chakras'],
    sabbat: ['wheel-of-the-year', 'sabbats', 'sabbat'],
  };
  const prefixes = allowedPrefixes[category] || [];
  return prefixes.some((prefix) => lower.startsWith(prefix));
}

function getSafeGrimoireDataForFacet(
  facet: DailyFacet,
  category: string,
): Record<string, any> | null {
  if (!isAllowedSlugForCategory(category, facet.grimoireSlug)) {
    return null;
  }
  return getGrimoireDataForFacet(facet);
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}

function estimateDuration(wordCount: number): string {
  // Average speaking pace: 130-150 words per minute
  const minutes = wordCount / 140;
  if (minutes < 1) {
    return `${Math.round(minutes * 60)} seconds`;
  }
  const mins = Math.floor(minutes);
  const secs = Math.round((minutes - mins) * 60);
  return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`;
}

const TRUNCATION_PATTERNS = [
  /\bthe\.$/i,
  /\beach\.$/i,
  /\bbegin at\.$/i,
  /\bcrosses the\.$/i,
  /\band the\.$/i,
  /,\s*each\.$/i,
  /:\s*$/i,
];

const DETERMINISTIC_WORDS = ['controls', 'always', 'guarantees'];

const hasDeterministicLanguage = (text: string) => {
  const lower = text.toLowerCase();
  return DETERMINISTIC_WORDS.some((word) =>
    new RegExp(`\\b${word}\\b`, 'i').test(lower),
  );
};

const LINE_DANGLING_PATTERNS = [
  /,\s*each\.$/i,
  /crosses the\.$/i,
  /begin at\.$/i,
  /\b(the|a|an|at|to|with|of|in|for|on|by|from)\.$/i,
  /,\s*(and|but|or|each|which|that)\.$/i,
  /\b(which|that|because|while|since)\.$/i,
];

const needsLineRewrite = (line: string) => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  if (hasTruncationArtifact(trimmed)) return true;
  return LINE_DANGLING_PATTERNS.some((pattern) => pattern.test(trimmed));
};

const hasTruncationArtifact = (text: string) =>
  TRUNCATION_PATTERNS.some((pattern) => pattern.test(text.trim()));

const HOOK_LIKE_PATTERNS = [
  /^most people get /i,
  /^if .+ confuses you/i,
  /this will click/i,
  /here's what matters/i,
  /here's how/i,
  /why it matters/i,
  /makes timing clearer/i,
];

const TEXTBOOK_PATTERNS = [/\bis defined as\b/i, /\brefers to\b/i];

const hasRepeatedAdjacentBigrams = (lines: string[]) => {
  const normalize = (line: string) =>
    line
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean);
  const bigrams = (words: string[]) => {
    const pairs: string[] = [];
    for (let i = 0; i < words.length - 1; i += 1) {
      pairs.push(`${words[i]} ${words[i + 1]}`);
    }
    return new Set(pairs);
  };
  for (let i = 0; i < lines.length - 1; i += 1) {
    const current = bigrams(normalize(lines[i]));
    const next = bigrams(normalize(lines[i + 1]));
    if (current.size === 0 || next.size === 0) continue;
    let overlap = 0;
    for (const pair of current) {
      if (next.has(pair)) overlap += 1;
    }
    const ratio = overlap / Math.max(current.size, next.size);
    if (overlap >= 2 && ratio > 0.35) {
      return true;
    }
  }
  return false;
};

const findSoWhatLineIndex = (lines: string[]) =>
  lines.findIndex((line) => /^\s*so what:/i.test(line.trim()));

const normaliseTopicKey = (topic: string) =>
  topic
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const VIDEO_BANNED_PHRASES = [
  'distinct rhythm worth tracking',
  'explore in the grimoire',
];

const VIDEO_BANNED_PATTERNS = [/here is how .+ shows up in real life/i];

const getSearchPhraseForTopic = (topic: string, category?: string) => {
  const key = normaliseTopicKey(topic);
  switch (category) {
    case 'zodiac':
      return `${key} explained`;
    case 'tarot':
      return `${key} meaning`;
    case 'crystals':
      return `${key} meaning`;
    case 'numerology':
      return `${key} meaning`;
    case 'chakras':
      return `${key} meaning`;
    case 'sabbat':
      return `${key} explained`;
    case 'lunar':
      return `${key} meaning`;
    case 'planetary':
      return `what is ${key}`;
    default:
      return `${key} meaning`;
  }
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const countOccurrences = (text: string, term: string) => {
  if (!term) return 0;
  const escaped = escapeRegExp(term.trim());
  const regex = new RegExp(escaped, 'gi');
  return (text.match(regex) || []).length;
};

const DEBUG_VIDEO_HOOK = process.env.DEBUG_VIDEO_HOOK === '1';

const normalizeHookLine = (value: string) =>
  value.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim();

const ensureSentenceEndsWithPunctuation = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const isHookLikeLine = (line: string, topic: string, searchPhrase: string) => {
  const trimmed = line.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  const includesKeyword =
    lower.includes(topic.toLowerCase()) ||
    lower.includes(searchPhrase.toLowerCase());
  if (!includesKeyword) return false;
  if (HOOK_LIKE_PATTERNS.some((pattern) => pattern.test(lower))) return true;
  const candidate = getFirstSentence(trimmed) || trimmed;
  return validateVideoHook(candidate, topic, searchPhrase).length === 0;
};

const getFirstSentence = (text: string): string | null => {
  const cleaned = text.trim();
  if (!cleaned) return null;
  const match = cleaned.match(/^[^.!?]+[.!?]/);
  return match ? match[0].trim() : null;
};

interface EnsureVideoHookOptions {
  topic: string;
  category?: string;
  source?: 'generation' | 'db' | 'fallback';
  scriptId?: number;
  scheduledDate?: Date;
}

interface EnsureVideoHookResult {
  script: string;
  hook: string;
  modified: boolean;
  issues?: string[];
}

const logVideoHookEvent = (
  detail: string,
  context: EnsureVideoHookOptions & { changed: boolean; issues?: string[] },
) => {
  if (!DEBUG_VIDEO_HOOK) return;
  const dateLabel = context.scheduledDate
    ? context.scheduledDate.toISOString().split('T')[0]
    : 'unknown';
  const idLabel = context.scriptId ? `id=${context.scriptId}` : 'id=unsaved';
  const issueLabel = context.issues?.length
    ? ` issues=${context.issues.join('|')}`
    : '';
  console.log(
    `[video-hook] ${detail} source=${context.source || 'unknown'} ${idLabel} topic=${context.topic} date=${dateLabel} changed=${context.changed}${issueLabel}`,
  );
};

const ensureVideoHook = (
  script: string,
  options: EnsureVideoHookOptions,
): EnsureVideoHookResult => {
  const trimmedScript = (script || '').trim();
  const topic = options.topic;
  const searchPhrase = getSearchPhraseForTopic(topic, options.category);
  const firstSentence = getFirstSentence(trimmedScript);
  let hookLine = '';
  let modified = false;
  let issues: string[] = [];

  if (firstSentence) {
    const normalized = normalizeHookLine(firstSentence);
    issues = validateVideoHook(normalized, topic, searchPhrase);
    if (issues.length === 0) {
      hookLine = normalized;
    }
  } else {
    issues = ['Hook missing'];
  }

  if (!hookLine) {
    const fallbackHook = normalizeHookLine(buildHookForTopic(topic));
    hookLine = fallbackHook;
    modified = true;
  }

  hookLine = ensureSentenceEndsWithPunctuation(hookLine);
  if (hookLine.length > 140) {
    hookLine = `${hookLine.substring(0, 140).trim()}`;
    hookLine = ensureSentenceEndsWithPunctuation(hookLine);
  }

  let bodyAfterHook = trimmedScript;
  if (modified && firstSentence) {
    bodyAfterHook = trimmedScript.slice(firstSentence.length).trim();
  }
  const normalizedHook = normalizeHookLine(hookLine);
  const bodyLinesRaw = bodyAfterHook
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  let cleanedBodyLines = bodyLinesRaw;
  while (
    cleanedBodyLines.length > 0 &&
    (normalizeHookLine(cleanedBodyLines[0]) === normalizedHook ||
      isHookLikeLine(cleanedBodyLines[0], topic, searchPhrase))
  ) {
    cleanedBodyLines = cleanedBodyLines.slice(1);
    modified = true;
  }
  while (
    cleanedBodyLines.length > 0 &&
    needsLineRewrite(cleanedBodyLines[cleanedBodyLines.length - 1])
  ) {
    cleanedBodyLines = cleanedBodyLines.slice(0, -1);
    modified = true;
  }
  if (cleanedBodyLines.length > 0) {
    bodyAfterHook = cleanedBodyLines.join('\n');
  }
  const finalScript = modified
    ? `${hookLine}\n\n${bodyAfterHook}`.trim()
    : trimmedScript;

  logVideoHookEvent('hook-check', {
    ...options,
    changed: modified,
    issues: modified ? issues : undefined,
  });

  return {
    script: finalScript,
    hook: hookLine,
    modified,
    issues: modified ? issues : undefined,
  };
};

type SanitizeScriptOptions = {
  topic: string;
  category?: string;
  sourceSnippet?: string;
  fallbackSource?: string;
};

export const sanitizeVideoScriptLines = (
  lines: string[],
  options: SanitizeScriptOptions & { allowTruncationFix?: boolean },
): string[] => {
  const buildFallbackLine = () => {
    const snippet = (options.sourceSnippet || '').trim();
    const fallback = (options.fallbackSource || '').trim();
    let candidate = snippet || fallback;
    if (!candidate) {
      candidate = `${options.topic} keeps attention on recurring timing`;
    }
    const lowerTopic = options.topic.toLowerCase();
    if (!candidate.toLowerCase().includes(lowerTopic)) {
      const normalized = candidate.replace(/^[A-Z]/, (c) => c.toLowerCase());
      candidate = `${options.topic} ${normalized}`;
    }
    return ensureSentenceEndsWithPunctuation(candidate.replace(/[.!?]+$/, ''));
  };

  const trimmedLines = lines.map((line) => line.trim()).filter(Boolean);
  const allowTruncationFix = options.allowTruncationFix !== false;
  return trimmedLines.map((line) => {
    const needsReplacement = TRUNCATION_PATTERNS.some((pattern) =>
      pattern.test(line.trim()),
    );
    if (!needsReplacement || !allowTruncationFix) {
      return ensureSentenceEndsWithPunctuation(line);
    }
    return buildFallbackLine();
  });
};

export const sanitizeVideoScriptText = (
  text: string,
  options: SanitizeScriptOptions,
): string => {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const sanitizedLines = sanitizeVideoScriptLines(lines, options);
  return sanitizedLines.join('\n');
};
export function buildHookForTopic(topic: string) {
  const safeTopic = topic.trim();
  const templates = [
    `Most people get ${safeTopic} wrong. Here's what matters.`,
    `What is ${safeTopic}, and why does it matter?`,
    `If ${safeTopic} confuses you, this will click.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)];
}

export const validateVideoHook = (
  hook: string,
  topic: string,
  searchPhrase: string,
): string[] => {
  const reasons: string[] = [];
  const trimmed = hook.trim();
  if (!trimmed) {
    return ['Hook is empty'];
  }
  const firstSentence = getFirstSentence(trimmed);
  if (!firstSentence || firstSentence !== trimmed) {
    reasons.push('Hook must be a single sentence');
  }
  if (!/[.!?]$/.test(trimmed)) {
    reasons.push('Hook must end with punctuation');
  }
  const wordCount = countWords(trimmed);
  if (wordCount < 8 || wordCount > 14) {
    reasons.push(`Hook word count out of range (${wordCount})`);
  }
  const hasTopic = trimmed.toLowerCase().includes(topic.toLowerCase());
  const hasSearch = trimmed.toLowerCase().includes(searchPhrase.toLowerCase());
  if (!hasTopic && !hasSearch) {
    reasons.push('Hook missing keyword');
  } else {
    const keyword = hasTopic ? topic : searchPhrase;
    if (countOccurrences(trimmed, keyword) !== 1) {
      reasons.push('Hook must include keyword exactly once');
    }
  }
  const lower = trimmed.toLowerCase();
  if (VIDEO_BANNED_PHRASES.some((phrase) => lower.includes(phrase))) {
    reasons.push('Hook contains banned phrase');
  }
  if (VIDEO_BANNED_PATTERNS.some((pattern) => pattern.test(trimmed))) {
    reasons.push('Hook contains banned pattern');
  }
  return reasons;
};

const validateScriptBody = (
  lines: string[],
  topic: string,
  searchPhrase: string,
): string[] => {
  const reasons: string[] = [];
  if (lines.length < 6 || lines.length > 10) {
    reasons.push(`Script body must be 6–10 lines (${lines.length})`);
  }
  const combined = lines.join(' ').trim();
  if (hasTruncationArtifact(combined)) {
    reasons.push('Script contains truncation artifact');
  }
  if (hasDeterministicLanguage(combined)) {
    reasons.push('Script contains deterministic language');
  }
  if (hasRepeatedAdjacentBigrams(lines)) {
    reasons.push('Adjacent lines repeat meaning');
  }
  if (TEXTBOOK_PATTERNS.some((pattern) => pattern.test(combined))) {
    reasons.push('Script sounds too textbook');
  }
  const soWhatIndex = findSoWhatLineIndex(lines);
  if (soWhatIndex === -1) {
    reasons.push('Missing "So what" line');
  } else {
    const soWhatCount = lines.filter((line) =>
      /^\s*so what:/i.test(line.trim()),
    ).length;
    if (soWhatCount !== 1) {
      reasons.push('Script must include exactly one "So what" line');
    }
    if (soWhatIndex < Math.max(0, lines.length - 2)) {
      reasons.push('"So what" line must be near the end');
    }
  }
  if (
    lines.some((line) =>
      LINE_DANGLING_PATTERNS.some((pattern) => pattern.test(line.trim())),
    )
  ) {
    reasons.push('Script contains a line ending with a dangling word');
  }
  if (lines.some((line) => isHookLikeLine(line, topic, searchPhrase))) {
    reasons.push('Script body contains extra hook line');
  }
  const lower = combined.toLowerCase();
  if (VIDEO_BANNED_PHRASES.some((phrase) => lower.includes(phrase))) {
    reasons.push('Script contains banned phrase');
  }
  if (VIDEO_BANNED_PATTERNS.some((pattern) => pattern.test(combined))) {
    reasons.push('Script contains banned pattern');
  }
  if (
    countOccurrences(combined, topic) > 3 ||
    countOccurrences(combined, searchPhrase) > 2
  ) {
    reasons.push('Script repeats keyword too often');
  }
  return reasons;
};

// ============================================================================
// TIKTOK SCRIPT GENERATOR (30-45 seconds, ~70-110 words)
// ============================================================================

export async function generateTikTokScript(
  facet: DailyFacet,
  theme: WeeklyTheme,
  scheduledDate: Date,
  partNumber: number = 1,
  totalParts: number = 3,
  baseUrl: string = '',
  options?: {
    primaryThemeId?: string;
    secondaryThemeId?: string;
    secondaryFacetSlug?: string;
    secondaryAngleKey?: string;
    secondaryAspectKey?: string;
    angleOverride?: string;
    aspectOverride?: ContentAspect;
  },
): Promise<VideoScript> {
  const safePartNumber = Number.isFinite(partNumber) ? partNumber : 1;
  const safeTotalParts = Number.isFinite(totalParts) ? totalParts : 7;
  const grimoireData = getSafeGrimoireDataForFacet(facet, theme.category);
  const angle =
    options?.angleOverride ||
    (await getAngleForTopic(facet.title, scheduledDate));
  const aspect =
    options?.aspectOverride ||
    options?.secondaryAspectKey ||
    mapAngleToAspect(angle);

  // Generate complete, flowing script using AI
  const { script: rawScript, hook: generatedHook } =
    await generateTikTokScriptContent(
      facet,
      theme,
      grimoireData,
      safePartNumber,
      safeTotalParts,
      angle,
      aspect as ContentAspect,
    );
  const fullScript = normalizeGeneratedContent(rawScript.trim(), {
    topicLabel: facet.title,
  });
  const hookVersion = 1;

  const wordCount = countWords(fullScript);

  // Parse script into sections for metadata (but keep full script as main content)
  const sections = parseScriptIntoSections(fullScript, 'tiktok');

  // Generate TikTok-specific metadata and cover image
  const metadata = generateTikTokMetadata(
    facet,
    theme,
    safePartNumber,
    safeTotalParts,
  );
  metadata.angle = angle;
  metadata.topic = facet.title;
  metadata.aspect = aspect;
  const coverImageUrl = generateCoverImageUrl(
    facet,
    theme,
    safePartNumber,
    baseUrl,
    safeTotalParts,
  );

  return {
    themeId: theme.id,
    themeName: theme.name,
    primaryThemeId: options?.primaryThemeId || theme.id,
    secondaryThemeId: options?.secondaryThemeId,
    secondaryFacetSlug: options?.secondaryFacetSlug,
    secondaryAngleKey: options?.secondaryAngleKey,
    secondaryAspectKey: options?.secondaryAspectKey,
    facetTitle: facet.title,
    topic: facet.title,
    angle,
    aspect,
    platform: 'tiktok',
    sections,
    fullScript,
    wordCount,
    estimatedDuration: estimateDuration(wordCount),
    scheduledDate,
    status: 'draft',
    metadata,
    coverImageUrl,
    partNumber: safePartNumber,
    writtenPostContent: undefined,
    hookText: generatedHook,
    hookVersion,
  };
}

/**
 * Generate complete TikTok script using AI
 * Creates a flowing 30-45 second narrative (70-110 words)
 */
type TikTokPostCopy = {
  hook: string;
  caption: string;
  cta: string;
  pinnedComment?: string;
};

async function generateTikTokScriptContent(
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
  angle: string,
  aspect: ContentAspect,
): Promise<{ script: string; hook: string; scriptBody: string }> {
  const openai = getOpenAI();
  const searchPhrase = getSearchPhraseForTopic(facet.title, theme.category);

  // Build context from Grimoire data
  let dataContext = '';
  if (grimoireData) {
    if (grimoireData.description) {
      dataContext += `Description: ${grimoireData.description}\n`;
    }
    if (grimoireData.element) {
      dataContext += `Element: ${grimoireData.element}\n`;
    }
    if (grimoireData.ruler || grimoireData.rulingPlanet) {
      dataContext += `Ruled by: ${grimoireData.ruler || grimoireData.rulingPlanet}\n`;
    }
    if (grimoireData.modality) {
      dataContext += `Modality: ${grimoireData.modality}\n`;
    }
    if (grimoireData.keywords && Array.isArray(grimoireData.keywords)) {
      dataContext += `Key themes: ${grimoireData.keywords.join(', ')}\n`;
    }
    if (grimoireData.meaning || grimoireData.mysticalProperties) {
      dataContext += `Meaning: ${grimoireData.meaning || grimoireData.mysticalProperties}\n`;
    }
    if (grimoireData.strengths && Array.isArray(grimoireData.strengths)) {
      dataContext += `Strengths: ${grimoireData.strengths.join(', ')}\n`;
    }
    if (grimoireData.affirmation) {
      dataContext += `Affirmation: ${grimoireData.affirmation}\n`;
    }
  }

  const snippetSource =
    grimoireData?.description ||
    grimoireData?.meaning ||
    grimoireData?.focus ||
    facet.focus ||
    facet.shortFormHook ||
    '';

  const sanitizeLines = (rawLines: string[]) =>
    sanitizeVideoScriptLines(rawLines, {
      topic: facet.title,
      category: theme.category,
      sourceSnippet: snippetSource,
      fallbackSource: facet.focus || facet.shortFormHook || facet.title,
      allowTruncationFix: false,
    });

  const guardrailNote = FACTUAL_GUARDRAIL_INSTRUCTION;

  const prompt = `You are the short-form video script generator for Lunary.

Your job is to generate ONE educational short-form video script per day for:
- Instagram Reels
- TikTok
- YouTube Shorts
- Facebook Reels

This video is independent from written posts.
Do NOT reference Threads, X, blogs, or other content.
Do NOT include hashtags, emojis, links, or CTAs.
Do NOT promote features or the app.

Tone:
- calm
- grounded
- intelligent
- authoritative without being heavy
- never hype-driven

Topic: ${facet.title}
Angle: ${angle}
Aspect focus: ${aspectLabel(aspect)}
Keyword phrase: ${searchPhrase}
Focus: ${facet.focus}
${buildScopeGuard(facet.title)}
Script body requirements (AFTER HOOK):
- 6–10 short lines total
- calm, factual, suitable for TTS
- spoken, not textbook; avoid "is defined as" or "refers to"
- no "today we're going to", no filler, no repetition loops
- Do not repeat the hook or include extra hook lines in the body.
- Each line must be exactly one complete sentence with a subject and verb.
- If a thought is long, split it into two full sentences and end the line at punctuation, never mid-sentence.
- Do not end a line with articles, prepositions, or dangling clauses (e.g., "the.", "a.", "to.", "with.", "of.", "which.", "because.").
- Do not use hook-style phrases in the body like "Most people", "If this confuses you", "Here's what matters", "Here's how it helps", or "Why it matters".
- Do not include a hook line at all. Only return the body lines.
- Avoid deterministic claims; use soft language like "can", "tends to", "may", "often", "influences", "highlights".
- Include exactly one line starting with "So what:" near the end. It should say what to notice or do today, and must stay within the topic scope guard.
${guardrailNote}

Hard bans (never include):
- "distinct rhythm worth tracking"
- "here is how X shows up in real life: X"
- "explore in the grimoire"
${dataContext ? `\nGrimoire Data (reference only):\n${dataContext}` : ''}

Return strict JSON only:
{
  "video": {
    "scriptBody": [
      "Line 1",
      "Line 2"
    ]
  }
}`;

  const requestScriptOnce = async (retryNote?: string) => {
    const retrySuffix = retryNote ? `\n\nFix these issues:\n${retryNote}` : '';
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an educational content creator writing concise, spoken video scripts. Return only valid JSON for the requested structure.',
        },
        { role: 'user', content: `${prompt}${retrySuffix}` },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 600,
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content || '';
    const parsed = JSON.parse(raw);
    return parsed as {
      video?: {
        scriptBody?: string[];
      };
    };
  };

  try {
    let primary = await requestScriptOnce();
    let video = primary.video || {};
    let scriptBodyLines = Array.isArray(video.scriptBody)
      ? video.scriptBody.map((line) => String(line).trim()).filter(Boolean)
      : [];

    scriptBodyLines = sanitizeLines(scriptBodyLines);

    let bodyIssues = validateScriptBody(
      scriptBodyLines,
      facet.title,
      searchPhrase,
    );

    if (bodyIssues.length > 0) {
      const retryNote = [...bodyIssues.map((issue) => `Body: ${issue}`)].join(
        '; ',
      );
      primary = await requestScriptOnce(retryNote);
      video = primary.video || {};
      scriptBodyLines = Array.isArray(video.scriptBody)
        ? video.scriptBody.map((line) => String(line).trim()).filter(Boolean)
        : [];
      scriptBodyLines = sanitizeLines(scriptBodyLines);
      bodyIssues = validateScriptBody(
        scriptBodyLines,
        facet.title,
        searchPhrase,
      );
    }

    if (bodyIssues.length > 0) {
      throw new Error(
        `Video script validation failed: ${bodyIssues.join('; ')}`,
      );
    }

    const scriptBody = scriptBodyLines
      .map((line) => line.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim())
      .filter(Boolean)
      .join('\n');
    const hookLine = ensureSentenceEndsWithPunctuation(
      normalizeHookLine(buildHookForTopic(facet.title)),
    );
    const script = `${hookLine}\n\n${scriptBody}`.trim();
    if (hasTruncationArtifact(script)) {
      throw new Error('Generated script contains truncation artifact');
    }
    return { script, hook: hookLine, scriptBody };
  } catch (error) {
    console.error('Failed to generate TikTok script with AI:', error);
    const fallback = buildFallbackShortScript(
      facet,
      grimoireData,
      angle,
      aspect,
    );
    const [fallbackHook, fallbackBody] = fallback.split('\n\n');
    return {
      script: fallback,
      hook: fallbackHook || '',
      scriptBody: fallbackBody || '',
    };
  }
}

function buildFallbackShortScript(
  facet: DailyFacet,
  grimoireData: Record<string, any> | null,
  angle: string,
  aspect: ContentAspect,
): string {
  const rawBase =
    grimoireData?.meaning ||
    grimoireData?.mysticalProperties ||
    grimoireData?.description ||
    facet.focus ||
    facet.shortFormHook;
  const base =
    rawBase && !hasTruncationArtifact(String(rawBase)) ? String(rawBase) : '';
  const lowerTopic = facet.title.toLowerCase();
  const searchPhrase = getSearchPhraseForTopic(facet.title);
  void searchPhrase;
  const hook = buildHookForTopic(facet.title);
  const context = `${facet.title} describes ${(
    base || 'how a pattern tends to express itself'
  )
    .replace(/[.!?]+$/, '')
    .toLowerCase()}.`;
  const takeaway = [
    grimoireData?.transitEffect,
    grimoireData?.houseMeaning,
    base,
  ]
    .filter(Boolean)
    .map((line) => String(line).trim())
    .slice(0, 2)
    .join(' ');
  const actionByAspect: Record<ContentAspect, string> = {
    [ContentAspect.CORE_MEANING]: `Notice where ${lowerTopic} shapes your focus today.`,
    [ContentAspect.COMMON_MISCONCEPTION]: `Look for ${lowerTopic} in what you repeat, not just what you claim.`,
    [ContentAspect.EMOTIONAL_IMPACT]: `Pay attention to the mood shift ${lowerTopic} brings.`,
    [ContentAspect.REAL_LIFE_EXPRESSION]: `Watch how ${lowerTopic} shows up in your routines.`,
    [ContentAspect.TIMING_AND_CONTEXT]: `Note when ${lowerTopic} feels more present than usual.`,
    [ContentAspect.PRACTICAL_APPLICATION]: `Make one small choice aligned with ${lowerTopic} today.`,
    [ContentAspect.WHEN_TO_AVOID]: `Pause if ${lowerTopic} feels rushed or brittle.`,
    [ContentAspect.SUBTLE_INSIGHT]: `Track the subtle signals ${lowerTopic} brings first.`,
  };
  const action =
    actionByAspect[aspect] || actionByAspect[ContentAspect.CORE_MEANING];
  const closing = 'Patterns make sense once you start noticing them.';
  const secondary = grimoireData?.meaning || grimoireData?.description || '';
  const lines = [
    context,
    takeaway || secondary || `It helps explain how ${lowerTopic} unfolds.`,
    `Look for ${lowerTopic} in the small, repeatable details.`,
    action,
    `Notice what shifts when you work with ${lowerTopic} intentionally.`,
    closing,
  ]
    .map((line) => line.replace(/[—–]/g, '-').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  const scriptBody = lines.slice(0, 10).join('\n');
  return `${hook}\n\n${scriptBody}`.trim();
}

/**
 * Fallback: Generate structured script if AI fails
 */
function generateTikTokScriptFallback(
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
): string {
  const hook = buildTikTokHook(facet, theme, grimoireData);
  const intro = buildTikTokIntro(facet, theme, grimoireData, partNumber);
  const core = buildTikTokCore(facet, theme, grimoireData);
  const takeaway = buildTikTokTakeaway(
    facet,
    theme,
    grimoireData,
    partNumber,
    totalParts,
  );

  // Join with smooth transitions
  return `${hook} ${intro} ${core} ${takeaway}`;
}

function ensureTikTokHookFirstSentence(
  text: string,
  facet: DailyFacet,
  theme: WeeklyTheme,
  grimoireData: Record<string, any> | null,
): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const firstSentenceMatch = trimmed.match(/^[^.!?]+[.!?]/);
  if (!firstSentenceMatch) return text;

  const firstSentence = firstSentenceMatch[0].trim();
  const hookIssues = validateSpokenHook(firstSentence);
  const desiredHook =
    hookIssues.length === 0
      ? firstSentence
      : buildSpokenHookSentence(facet, grimoireData);
  const rest = trimmed.slice(firstSentenceMatch[0].length).trim();
  return rest ? `${desiredHook} ${rest}` : desiredHook;
}

function ensureSeriesSentence(text: string, themeName: string): string {
  const sentences = splitSentencesPreservingDecimals(text);
  if (sentences.length === 0) return text;

  const seriesSentence = `Welcome back to our series on ${themeName}.`;
  const existingIndex = sentences.findIndex((sentence) =>
    /^Welcome back to our series on\b/i.test(sentence),
  );

  if (existingIndex !== -1) {
    sentences[existingIndex] = seriesSentence;
    if (existingIndex !== 1) {
      const filtered = sentences.filter((_, idx) => idx !== existingIndex);
      filtered.splice(1, 0, seriesSentence);
      return filtered.join(' ');
    }
    return sentences.join(' ');
  }

  sentences.splice(1, 0, seriesSentence);
  return sentences.join(' ');
}

function ensureThemePartSentence(
  text: string,
  themeName: string,
  partNumber: number,
  totalParts: number,
  facetTitle: string,
): string {
  const combined = `This week: ${themeName}; Part ${partNumber} of ${totalParts}: ${facetTitle}.`;
  const sentences = splitSentencesPreservingDecimals(text);
  if (sentences.length === 0) {
    return combined;
  }

  const [hook, ...rest] = sentences;
  const filtered = rest.filter(
    (sentence) => !/^(this week|part|series theme)/i.test(sentence.trim()),
  );
  const reconstructed = [hook, combined, ...filtered];
  return reconstructed.join(' ');
}

function splitSentencesPreservingDecimals(text: string): string[] {
  const protectedText = text.replace(/(\d)\.(\d)/g, '$1<DECIMAL>$2');
  const sentences =
    protectedText.match(/[^.!?]+[.!?]/g)?.map((s) => s.trim()) || [];
  const restored = sentences.map((sentence) =>
    sentence.replace(/<DECIMAL>/g, '.'),
  );
  if (restored.length > 0) {
    return restored;
  }
  const fallback = protectedText.replace(/<DECIMAL>/g, '.').trim();
  return fallback ? [fallback] : [];
}

function buildSpokenHookSentence(
  facet: DailyFacet,
  grimoireData: Record<string, any> | null,
): string {
  const titleWords = facet.title.trim().split(/\s+/).filter(Boolean);
  const baseTitle =
    titleWords.length > 6 ? titleWords.slice(0, 6).join(' ') : facet.title;
  const topicPhrase =
    titleWords.length <= 2 ? `the role of ${baseTitle}` : baseTitle;

  const baseHook = `If ${topicPhrase} feels confusing, start here.`;
  const words = baseHook
    .replace(/[.!?]+$/, '')
    .split(/\s+/)
    .filter(Boolean).length;
  if (words >= 6 && words <= 12) {
    return baseHook;
  }

  const trimmedTopic = topicPhrase
    .split(/\s+/)
    .slice(0, Math.max(1, 12 - 3))
    .join(' ');
  return `If ${trimmedTopic} feels confusing, start here.`;
}

function ensureThematicListAndClose(text: string): string {
  let script = text.trim();
  if (!script) return text;

  const hasList =
    /\bFirst\b/i.test(script) &&
    /\bSecond\b/i.test(script) &&
    /\bThird\b/i.test(script);
  if (!hasList) {
    return script;
  } else {
    script = script.replace(/([.!?])\s+(First\b)/i, '$1\n\n$2');
  }

  return script.trim();
}

function enforceThematicPacing(
  text: string,
  facet: DailyFacet,
  grimoireData: Record<string, any> | null,
  themeName?: string,
): string {
  const sentences = splitSentencesPreservingDecimals(text);
  if (sentences.length === 0) {
    return text;
  }

  sentences[0] = enforceHookLength(sentences[0], facet, grimoireData);

  const themeLineIndex = sentences.findIndex((sentence) =>
    /^This week\b/i.test(sentence),
  );
  if (themeLineIndex !== -1) {
    sentences.splice(themeLineIndex, 1);
  }

  const deduped: string[] = [];
  const seen = new Set<string>();
  for (const sentence of sentences) {
    const key = sentence
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 12)
      .join(' ');
    if (!key) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(sentence);
  }

  const outputLines: string[] = [];
  deduped.forEach((sentence, index) => {
    if (index === 0) {
      outputLines.push(sentence);
      if (deduped.length > 1) {
        outputLines.push('');
      }
      return;
    }
    if (index === 1 && deduped.length > 2) {
      outputLines.push('');
    }
    if (/^First\b/i.test(sentence)) {
      outputLines.push('');
      outputLines.push('');
      outputLines.push('');
    }
    if (index === deduped.length - 1 && deduped.length > 1) {
      outputLines.push('');
      outputLines.push('');
      outputLines.push('');
    }
    outputLines.push(sentence);
  });

  return outputLines
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function enforceHookLength(
  sentence: string,
  facet: DailyFacet,
  grimoireData: Record<string, any> | null,
): string {
  const cleanSentence = sentence.replace(/[.!?]+$/, '').trim();
  let words = cleanSentence.split(/\s+/).filter(Boolean);

  if (words.length > 10) {
    words = words.slice(0, 10);
  } else if (words.length < 6) {
    const fallbackSource =
      facet.focus ||
      grimoireData?.description ||
      grimoireData?.meaning ||
      facet.title;
    const fallbackWords = String(fallbackSource).split(/\s+/).filter(Boolean);
    for (const word of fallbackWords) {
      if (words.length >= 6) break;
      words.push(word.replace(/[.!?]+$/, ''));
    }
  }

  const normalised = words
    .join(' ')
    .replace(/[,\s]+$/, '')
    .trim();
  return normalised.endsWith('.') ? normalised : `${normalised}.`;
}

/**
 * Parse a complete script into sections for metadata
 * This is just for display - the fullScript is the main content
 */
function parseScriptIntoSections(
  script: string,
  type: 'tiktok' | 'youtube',
): ScriptSection[] {
  // For TikTok: simple parsing into hook, intro, core, takeaway
  if (type === 'tiktok') {
    const sentences = script.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const totalWords = countWords(script);
    const wordsPerSecond = 2.5;

    if (sentences.length < 4) {
      return [
        {
          name: 'Complete Script',
          duration: estimateDuration(totalWords),
          content: script,
        },
      ];
    }

    // Roughly divide into sections
    const hookEnd = Math.ceil(sentences.length * 0.1);
    const introEnd = Math.ceil(sentences.length * 0.3);
    const coreEnd = Math.ceil(sentences.length * 0.85);

    const hook = sentences.slice(0, hookEnd).join('. ') + '.';
    const intro = sentences.slice(hookEnd, introEnd).join('. ') + '.';
    const core = sentences.slice(introEnd, coreEnd).join('. ') + '.';
    const takeaway = sentences.slice(coreEnd).join('. ') + '.';

    return [
      { name: 'Hook', duration: '3 seconds', content: hook },
      { name: 'Theme Intro', duration: '6 seconds', content: intro },
      { name: 'Core Content', duration: '20-25 seconds', content: core },
      { name: 'Takeaway', duration: '5 seconds', content: takeaway },
    ];
  }

  // For YouTube: parse by natural breaks
  const paragraphs = script.split(/\n\n+/).filter((p) => p.trim().length > 0);
  const sections: ScriptSection[] = [];
  let currentTime = 0;
  const wordsPerSecond = 2.5;

  for (const para of paragraphs) {
    const wordCount = countWords(para);
    const duration = wordCount / wordsPerSecond;
    sections.push({
      name: 'Section',
      duration: `${Math.round(duration)} seconds`,
      content: para.trim(),
    });
  }

  return sections.length > 0
    ? sections
    : [
        {
          name: 'Complete Script',
          duration: estimateDuration(countWords(script)),
          content: script,
        },
      ];
}

function buildTikTokHook(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
): string {
  // Strong opening statement - no questions, no "Hey!"
  const category = theme.category;

  if (data?.name && data?.keywords) {
    const keyword = data.keywords[0] || '';
    return `${data.name}. ${keyword}. This defines ${facet.title.toLowerCase()}.`;
  }

  // Fallback based on category
  switch (category) {
    case 'zodiac':
      return `${facet.title}. The foundation of astrological understanding.`;
    case 'tarot':
      return `${facet.title}. A symbolic key to deeper wisdom.`;
    case 'lunar':
      return `${facet.title}. The moon's influence on earthly rhythms.`;
    case 'planetary':
      return `${facet.title}. Celestial forces that shape human experience.`;
    case 'crystals':
      return `${facet.title}. Earth's concentrated energy in mineral form.`;
    case 'numerology':
      return `${facet.title}. Numbers carry vibrational significance.`;
    case 'chakras':
      return `${facet.title}. Energy centers governing mind and body.`;
    case 'sabbat':
      return `${facet.title}. A sacred marker on the wheel of the year.`;
    default:
      return `${facet.title}. Essential knowledge for understanding.`;
  }
}

function buildTikTokIntro(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
  partNumber: number,
): string {
  const themeIntro =
    partNumber === 1
      ? `Welcome to the ${theme.name} series. `
      : `Welcome back to our ${theme.name} series. `;

  if (data?.description) {
    // Take first sentence or two
    const sentences = data.description.split(/[.!?]+/).filter(Boolean);
    const intro = sentences.slice(0, 2).join('. ') + '.';
    const detail = intro.length > 150 ? sentences[0] + '.' : intro;
    return `${themeIntro}${detail}`;
  }

  return `${themeIntro}${facet.focus}`;
}

function buildTikTokCore(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
): string {
  const points: string[] = [];

  if (data) {
    // Extract key educational points
    if (data.element) {
      points.push(`Element: ${data.element}.`);
    }
    if (data.ruler || data.rulingPlanet) {
      points.push(`Ruled by ${data.ruler || data.rulingPlanet}.`);
    }
    if (data.modality) {
      points.push(`${data.modality} modality.`);
    }
    if (data.keywords && Array.isArray(data.keywords)) {
      points.push(`Key themes: ${data.keywords.slice(0, 3).join(', ')}.`);
    }
    if (data.meaning || data.mysticalProperties) {
      const meaning = data.meaning || data.mysticalProperties;
      const shortened =
        meaning.length > 140 ? meaning.substring(0, 140) + '...' : meaning;
      points.push(shortened);
    }
    if (data.strengths && Array.isArray(data.strengths)) {
      points.push(
        `Strengths include ${data.strengths.slice(0, 2).join(' and ')}.`,
      );
    }
  }

  // Fill with focus content if needed
  if (points.length < 2) {
    points.push(facet.focus);
  }

  const limitedPoints = points.slice(0, 3);
  return limitedPoints.join(' ');
}

function buildTikTokTakeaway(
  facet: DailyFacet,
  theme: WeeklyTheme,
  data: Record<string, any> | null,
  partNumber: number,
  totalParts: number,
): string {
  // Single memorable insight
  let takeaway = '';

  if (data?.affirmation) {
    takeaway = data.affirmation;
  } else {
    takeaway = facet.shortFormHook;
  }

  // Add specific series callback with part number and facet title
  const seriesLine = `Part ${partNumber} of ${totalParts}: ${facet.title}. This week's theme: ${theme.name}.`;
  return `${takeaway}\n\n${seriesLine}`;
}

/**
 * Generate TikTok overlay metadata for video template
 */
function generateTikTokMetadata(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  totalParts: number,
): TikTokMetadata {
  // Map category to display theme name
  const themeDisplayMap: Record<string, string> = {
    zodiac: 'ASTROLOGY',
    tarot: 'TAROT',
    lunar: 'LUNAR CYCLES',
    planetary: 'PLANETS',
    crystals: 'CRYSTALS',
    numerology: 'NUMEROLOGY',
    chakras: 'CHAKRAS',
    sabbat: 'WHEEL OF THE YEAR',
  };

  return {
    theme: themeDisplayMap[theme.category] || theme.category.toUpperCase(),
    title: facet.title,
    series: `Part ${partNumber} of ${totalParts}`,
    summary: facet.focus,
  };
}

/**
 * Generate cover image URL for TikTok video
 */
function generateCoverImageUrl(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  baseUrl: string = '',
  totalParts: number,
): string {
  const safePartNumber = Number.isFinite(partNumber) ? partNumber : 1;
  const safeTotalParts = Number.isFinite(totalParts) ? totalParts : 7;
  const slug =
    facet.grimoireSlug.split('/').pop() ||
    facet.title.toLowerCase().replace(/\s+/g, '-');
  const subtitle = encodeURIComponent(
    `Part ${safePartNumber} of ${safeTotalParts}`,
  );
  const title = encodeURIComponent(capitalizeThematicTitle(facet.title));

  // cover=tiktok triggers larger text sizes for TikTok thumbnail legibility
  return `${baseUrl}/api/og/thematic?category=${theme.category}&slug=${slug}&title=${title}&subtitle=${subtitle}&format=story&cover=tiktok`;
}

/**
 * Generate cover image URL for YouTube thumbnail
 */
function generateYouTubeCoverUrl(
  theme: WeeklyTheme,
  baseUrl: string = '',
): string {
  // Use first facet's slug for the category symbol
  const firstFacet = theme.facets[0];
  const slug =
    firstFacet?.grimoireSlug.split('/').pop() ||
    theme.name.toLowerCase().replace(/\s+/g, '-');
  const title = encodeURIComponent(capitalizeThematicTitle(theme.name));
  const subtitle = encodeURIComponent('Weekly Deep Dive');

  // cover=youtube triggers optimized sizes for YouTube thumbnail (1280x720)
  return `${baseUrl}/api/og/thematic?category=${theme.category}&slug=${slug}&title=${title}&subtitle=${subtitle}&format=landscape&cover=youtube`;
}

// ============================================================================
// YOUTUBE SCRIPT GENERATOR (5-7 minutes, ~800-1000 words)
// ============================================================================

export async function generateYouTubeScript(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  weekStartDate: Date,
  baseUrl: string = '',
): Promise<VideoScript> {
  // Gather all Grimoire data for the week's facets
  const allData = facets.map((f) => ({
    facet: f,
    data: getSafeGrimoireDataForFacet(f, theme.category),
  }));

  // Generate complete, flowing script using AI
  const rawScript = await generateYouTubeScriptContent(theme, facets, allData);
  const ensuredHook = ensureVideoHook(rawScript, {
    topic: theme.name,
    category: theme.category,
    source: 'generation',
    scheduledDate: weekStartDate,
  });
  const fullScript = ensuredHook.script;
  const hookVersion = ensuredHook.modified ? 2 : 1;

  const wordCount = countWords(fullScript);

  // Parse script into sections for metadata (but keep full script as main content)
  const sections = parseScriptIntoSections(fullScript, 'youtube');

  // Generate YouTube thumbnail
  const coverImageUrl = generateYouTubeCoverUrl(theme, baseUrl);

  return {
    themeId: theme.id,
    themeName: theme.name,
    primaryThemeId: theme.id,
    facetTitle: `Weekly Deep Dive: ${theme.name}`,
    aspect: ContentAspect.CORE_MEANING,
    platform: 'youtube',
    sections,
    fullScript,
    wordCount,
    estimatedDuration: estimateDuration(wordCount),
    scheduledDate: weekStartDate,
    status: 'draft',
    coverImageUrl,
    hookText: ensuredHook.hook,
    hookVersion,
  };
}

/**
 * Generate complete YouTube script using AI
 * Creates a flowing 3-4 minute narrative (450-650 words)
 */
async function generateYouTubeScriptContent(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): Promise<string> {
  const openai = getOpenAI();

  // Build comprehensive context from all facets
  const facetContexts = allData.map(({ facet, data }, index) => {
    let context = `Day ${index + 1}: ${facet.title}\nFocus: ${facet.focus}\n`;
    if (data) {
      if (data.description) context += `Description: ${data.description}\n`;
      if (data.element) context += `Element: ${data.element}\n`;
      if (data.ruler || data.rulingPlanet) {
        context += `Ruled by: ${data.ruler || data.rulingPlanet}\n`;
      }
      if (data.modality) context += `Modality: ${data.modality}\n`;
      if (data.keywords && Array.isArray(data.keywords)) {
        context += `Key themes: ${data.keywords.join(', ')}\n`;
      }
      if (data.meaning || data.mysticalProperties) {
        context += `Meaning: ${data.meaning || data.mysticalProperties}\n`;
      }
      if (data.mysticalProperties) {
        context += `Mystical properties: ${data.mysticalProperties}\n`;
      }
      if (data.healingPractices && Array.isArray(data.healingPractices)) {
        context += `Healing practices: ${data.healingPractices.join(', ')}\n`;
      }
    }
    return context;
  });

  const guardrailNote = FACTUAL_GUARDRAIL_INSTRUCTION;
  const prompt = `Create a complete, flowing YouTube video script (3–4 minutes, 450–650 words) for a weekly educational deep dive on ${theme.name}.

The script should be:
- Written as a composed, authoritative narrative that can be read aloud smoothly from start to finish
- Educational and interpretive, not conversational or casual
- Designed for viewers seeking depth, clarity, and understanding
- Structured to flow naturally through: opening context, topic overview, foundational concepts, deeper meaning, practical interpretation, synthesis, and closing reflection
- Smoothly connected throughout, with no abrupt shifts or segmented feeling
- Clear, grounded, and premium in tone

Opening guidance:
- Begin by establishing why this topic matters and what it helps the viewer understand or reframe
- Avoid generic greetings or channel-style introductions
- Do not reference “this video” or the act of watching

Content guidance:
- Build understanding progressively from foundations to deeper insight
- Use explanation and interpretation, not storytelling or anecdotes
- Cover all facets listed below, integrating them naturally rather than treating them as separate sections
- Maintain clarity and pace while staying concise

Closing guidance:
- End with a reflective synthesis that reinforces meaning and understanding
- Do not include CTAs, prompts to like/subscribe, or platform references
- Leave the viewer with a sense of conceptual completion

Theme: ${theme.name}
Category: ${theme.category}
Description: ${theme.description}

Facets to cover:
${facetContexts.join('\n---\n')}

Return ONLY the complete script text. No section headers, no labels, no markdown, no formatting. The output should read as a single, cohesive spoken narrative with a calm, confident delivery.
Avoid deterministic claims; use soft language like "can", "tends to", "may", "often", "influences", "highlights".
${buildScopeGuard(theme.name)}
${guardrailNote}`;

  const requestYouTubeScript = async (retryNote?: string) => {
    const retrySuffix = retryNote ? `\n\nFix: ${retryNote}` : '';
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are an educational content creator writing complete, flowing video scripts. Write in a natural, authoritative tone that flows smoothly when read aloud. The script must be complete and coherent - all sections must flow naturally into each other with smooth transitions. Make it educational and informative. Write as a continuous narrative, not fragmented sections.',
        },
        { role: 'user', content: `${prompt}${retrySuffix}` },
      ],
      max_tokens: 1200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || '';
  };

  try {
    let script = await requestYouTubeScript();
    if (!script || script.trim().length === 0) {
      throw new Error('OpenAI returned empty script');
    }

    script = normalizeGeneratedContent(script.trim(), {
      topicLabel: theme.name,
    });

    // Clean up any section markers that might have been added
    script = script
      .replace(/\[.*?\]/g, '') // Remove [Section] markers
      .replace(/\n\n---\n\n/g, '\n\n') // Remove section dividers
      .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
      .trim();

    // Ensure outro is included
    if (
      !script.toLowerCase().includes('lunary') &&
      !script.toLowerCase().includes('until next time')
    ) {
      script += `\n\nFor deeper exploration of ${theme.name.toLowerCase()} and related topics, the Lunary Grimoire offers comprehensive reference material. It is freely available for those who wish to continue their study. Until next time.`;
    }

    if (hasDeterministicLanguage(script)) {
      script = await requestYouTubeScript(
        'Remove deterministic claims; use softer language (can, may, tends to, often, influences).',
      );
      script = script.trim();
    }

    const sanitizedScript = sanitizeVideoScriptText(script, {
      topic: theme.name,
      category: theme.category,
      sourceSnippet: theme.description || '',
      fallbackSource: theme.description || '',
    });
    const normalizedScript = ensureHookFirstSentence(sanitizedScript, theme);
    return normalizedScript;
  } catch (error) {
    console.error('Failed to generate YouTube script with AI:', error);
    // Fallback to structured script
    const fallback = generateYouTubeScriptFallback(theme, facets, allData);
    const sanitizedFallback = sanitizeVideoScriptText(fallback, {
      topic: theme.name,
      category: theme.category,
      sourceSnippet: theme.description || '',
      fallbackSource: theme.description || '',
    });
    return ensureHookFirstSentence(sanitizedFallback, theme);
  }
}

/**
 * Fallback: Generate structured script if AI fails
 */
function generateYouTubeScriptFallback(
  theme: WeeklyTheme,
  facets: DailyFacet[],
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const intro = buildYouTubeIntro(theme, allData);
  const overview = buildYouTubeOverview(theme, facets);
  const foundations = buildYouTubeFoundations(theme, allData.slice(0, 3));
  const deeperMeaning = buildYouTubeDeeperMeaning(theme, allData.slice(2, 5));
  const practical = buildYouTubePractical(theme, allData.slice(4, 7));
  const summary = buildYouTubeSummary(theme, facets);
  const outro = buildYouTubeOutro(theme);

  // Join with smooth transitions
  return `${intro}\n\n${overview}\n\n${foundations}\n\n${deeperMeaning}\n\n${practical}\n\n${summary}\n\n${outro}`;
}

function ensureHookFirstSentence(text: string, theme: WeeklyTheme): string {
  const trimmed = text.trim();
  if (!trimmed) return text;

  const firstSentenceMatch = trimmed.match(/^[^.!?]+[.!?]/);
  if (!firstSentenceMatch) return text;

  const firstSentence = firstSentenceMatch[0].trim();
  if (!needsHookRewrite(firstSentence)) {
    return text;
  }

  const rest = trimmed.slice(firstSentenceMatch[0].length).trim();
  const hookSentence = buildYouTubeHookSentence(theme);
  return rest ? `${hookSentence} ${rest}` : hookSentence;
}

function needsHookRewrite(sentence: string): boolean {
  return /^(welcome|welcome back|today|hello|hi|now|this|let's)/i.test(
    sentence,
  );
}

function buildYouTubeHookSentence(theme: WeeklyTheme): string {
  const snippet =
    theme.description
      ?.split(/[.!?]/)
      .find((segment) => segment.trim().length > 0) || theme.name;
  const normalized = snippet.trim().toLowerCase();
  const base = normalized.length > 0 ? normalized : theme.name.toLowerCase();
  const cleanSubject = base.replace(/^\s+|\s+$/g, '');
  return `Understanding ${cleanSubject} reveals why ${theme.name.toLowerCase()} matters.`;
}

function buildYouTubeIntro(
  theme: WeeklyTheme,
  allData: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const category = theme.category;

  const intros: Record<string, string> = {
    zodiac: `The zodiac is more than sun signs and daily horoscopes. It is an ancient system of celestial mapping that has guided human understanding for millennia. Today, we explore ${theme.name}, examining the fundamental principles that form the backbone of astrological practice.`,
    tarot: `The tarot is a symbolic language, a mirror for the psyche, and a tool for contemplation. In this exploration of ${theme.name}, we move beyond fortune-telling into the realm of archetypal wisdom.`,
    lunar: `The moon governs tides, cycles, and the rhythm of life on Earth. Understanding lunar phases means understanding the natural pulse of existence. This week, we examine ${theme.name}.`,
    planetary: `The planets of our solar system have been observed, named, and mythologized across every culture. Their movements correspond to patterns in human experience. Today we explore ${theme.name}.`,
    crystals: `Crystals are concentrated forms of Earth's energy, formed over millions of years under immense pressure. Each carries distinct properties and uses. We explore ${theme.name}.`,
    numerology: `Numbers are not merely quantities. In numerology, they carry vibrational frequencies and symbolic significance. This week's focus: ${theme.name}.`,
    chakras: `The chakra system maps energy centers within the body, each governing specific physical, emotional, and spiritual functions. Our topic: ${theme.name}.`,
    sabbat: `The wheel of the year turns through eight sabbats, marking the seasonal rhythms that our ancestors lived by. Today we honor ${theme.name}.`,
  };

  return (
    intros[category] || `Today we explore ${theme.name}. ${theme.description}`
  );
}

function buildYouTubeOverview(
  theme: WeeklyTheme,
  facets: DailyFacet[],
): string {
  const facetTitles = facets.slice(0, 5).map((f) => f.title);

  return `This deep dive covers several interconnected topics: ${facetTitles.join(', ')}. Each builds upon the last, creating a comprehensive understanding of ${theme.name.toLowerCase()}. We begin with foundational concepts, move into symbolic meaning, and conclude with practical applications you can integrate into your practice or study.`;
}

function buildYouTubeFoundations(
  theme: WeeklyTheme,
  data: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const paragraphs: string[] = [];

  for (const { facet, data: grimoireData } of data) {
    if (grimoireData) {
      let para = `${facet.title}: `;
      if (grimoireData.description) {
        para += grimoireData.description.split('.').slice(0, 2).join('.') + '.';
      } else {
        para += facet.focus;
      }

      if (grimoireData.element) {
        para += ` Associated with the ${grimoireData.element} element.`;
      }
      if (grimoireData.keywords && Array.isArray(grimoireData.keywords)) {
        para += ` Core themes include ${grimoireData.keywords.slice(0, 3).join(', ')}.`;
      }

      paragraphs.push(para);
    } else {
      paragraphs.push(`${facet.title}: ${facet.focus}`);
    }
  }

  return paragraphs.join('\n\n');
}

function buildYouTubeDeeperMeaning(
  theme: WeeklyTheme,
  data: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const paragraphs: string[] = [];

  paragraphs.push(
    `Moving beyond surface definitions, we examine the deeper symbolic layers of ${theme.name.toLowerCase()}.`,
  );

  for (const { facet, data: grimoireData } of data) {
    if (grimoireData) {
      let para = '';
      if (grimoireData.mysticalProperties) {
        para = grimoireData.mysticalProperties;
      } else if (grimoireData.meaning) {
        para = grimoireData.meaning;
      } else if (grimoireData.symbolism) {
        para = `The symbolism of ${facet.title}: ${grimoireData.symbolism}`;
      } else {
        para = `${facet.title} represents ${facet.focus.toLowerCase()}.`;
      }
      paragraphs.push(para);
    }
  }

  return paragraphs.join('\n\n');
}

function buildYouTubePractical(
  theme: WeeklyTheme,
  data: Array<{ facet: DailyFacet; data: Record<string, any> | null }>,
): string {
  const paragraphs: string[] = [];

  paragraphs.push(
    `How does this knowledge apply practically? Understanding ${theme.name.toLowerCase()} offers several applications.`,
  );

  for (const { facet, data: grimoireData } of data) {
    if (grimoireData) {
      if (grimoireData.transitEffect) {
        paragraphs.push(grimoireData.transitEffect);
      } else if (grimoireData.houseMeaning) {
        paragraphs.push(grimoireData.houseMeaning);
      } else if (grimoireData.healingProperties) {
        paragraphs.push(
          `Healing applications: ${grimoireData.healingProperties}`,
        );
      } else if (grimoireData.usage) {
        paragraphs.push(`Practical usage: ${grimoireData.usage}`);
      } else if (grimoireData.affirmation) {
        paragraphs.push(
          `Practice this affirmation: "${grimoireData.affirmation}"`,
        );
      }
    }
  }

  if (paragraphs.length < 3) {
    paragraphs.push(
      `Integrate this knowledge gradually. Study, observe, and reflect on how these principles manifest in your experience.`,
    );
  }

  return paragraphs.join('\n\n');
}

function buildYouTubeSummary(theme: WeeklyTheme, facets: DailyFacet[]): string {
  const keyPoints = facets
    .slice(0, 4)
    .map((f) => f.title.toLowerCase())
    .join(', ');

  return `To summarize: we have explored ${theme.name.toLowerCase()}, covering ${keyPoints}, and more. Each of these elements interconnects, forming a coherent system of understanding. The key is not memorization, but integration—allowing this knowledge to deepen your perspective over time.`;
}

function buildYouTubeOutro(theme: WeeklyTheme): string {
  return `For deeper exploration of ${theme.name.toLowerCase()} and related topics, the Lunary Grimoire offers comprehensive reference material. It is freely available for those who wish to continue their study. Until next time.`;
}

// ============================================================================
// MAIN GENERATION FUNCTION
// ============================================================================

/**
 * Generate all video scripts for a week
 * Returns 7 TikTok scripts (daily) and 1 YouTube script (Sunday)
 */
export async function generateWeeklyVideoScripts(
  weekStartDate: Date,
  themeIndex: number = 0,
  baseUrl: string = '',
): Promise<WeeklyVideoScripts> {
  // Get the theme for this week
  const theme = categoryThemes[themeIndex % categoryThemes.length];
  const facets = theme.facets;

  // Generate TikTok scripts for every day of the week
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

  // Generate YouTube script for Sunday (covers the full week's theme)
  const youtubeDate = new Date(weekStartDate);
  youtubeDate.setDate(youtubeDate.getDate() + 6); // Sunday
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

  // Generate and save secondary daily scripts without affecting weekly rotation
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
