/**
 * Database operations for video scripts
 */

import type { VideoScript } from './types';
import { ensureVideoHook } from './hooks';
import { categoryThemes } from '../weekly-themes';

const THEME_CATEGORY_BY_NAME = new Map(
  categoryThemes.map((theme) => [theme.name, theme.category]),
);

/**
 * Ensure video scripts table exists
 */
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

/**
 * Save video script to database
 */
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

/**
 * Update video script hook in database
 */
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

/**
 * Get video scripts from database
 */
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

/**
 * Update video script status
 */
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

/**
 * Ensure video_performance table exists for tracking engagement metrics
 */
export async function ensureVideoPerformanceTable(): Promise<void> {
  const { sql } = await import('@vercel/postgres');

  await sql`
    CREATE TABLE IF NOT EXISTS video_performance (
      id SERIAL PRIMARY KEY,
      video_script_id INTEGER REFERENCES video_scripts(id),
      platform TEXT NOT NULL DEFAULT 'tiktok',
      views INTEGER DEFAULT 0,
      likes INTEGER DEFAULT 0,
      comments INTEGER DEFAULT 0,
      shares INTEGER DEFAULT 0,
      saves INTEGER DEFAULT 0,
      watch_time_avg REAL,
      completion_rate REAL,
      hook_style TEXT,
      script_structure TEXT,
      content_type TEXT,
      has_loop_structure BOOLEAN DEFAULT false,
      cta_type TEXT,
      theme_category TEXT,
      recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_script ON video_performance(video_script_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_platform ON video_performance(platform)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_hook ON video_performance(hook_style)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_structure ON video_performance(script_structure)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_content ON video_performance(content_type)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_loop ON video_performance(has_loop_structure)
  `;

  // Add time-based columns for posting time optimisation
  try {
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS scheduled_hour INTEGER`;
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS day_of_week INTEGER`;
    // #1: Track aspect + angle
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS aspect TEXT`;
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS angle TEXT`;
    // #7: Track hook intro animation variant
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS hook_intro_variant TEXT`;
    // #10: Track stitch-bait separately
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS has_stitch_bait BOOLEAN DEFAULT false`;
    // #13: Retention curve checkpoints
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS retention_3s REAL`;
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS retention_6s REAL`;
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS retention_15s REAL`;
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS retention_30s REAL`;
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS retention_60s REAL`;
  } catch {
    // Columns may already exist
  }

  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_hour ON video_performance(scheduled_hour)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_dow ON video_performance(day_of_week)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_aspect ON video_performance(aspect)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_angle ON video_performance(angle)
  `;
}

/**
 * Save video performance metrics, auto-populating scheduled_hour and
 * day_of_week from the linked video script.
 */
export async function saveVideoPerformance(params: {
  videoScriptId: number;
  platform?: string;
  views?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  watchTimeAvg?: number;
  completionRate?: number;
  recordedAt?: Date;
  retention3s?: number;
  retention6s?: number;
  retention15s?: number;
  retention30s?: number;
  retention60s?: number;
}): Promise<number> {
  const { sql } = await import('@vercel/postgres');

  // Look up script to auto-populate time + tracking fields
  const scriptRow = await sql`
    SELECT scheduled_date, metadata, hook_text, theme_name
    FROM video_scripts WHERE id = ${params.videoScriptId}
  `;

  if (scriptRow.rows.length === 0) {
    throw new Error(`Video script ${params.videoScriptId} not found`);
  }

  const script = scriptRow.rows[0];
  const scheduledDate = new Date(script.scheduled_date);
  const metadata = script.metadata || {};
  const themeCategory = THEME_CATEGORY_BY_NAME.get(script.theme_name) ?? null;

  const scheduledHour: number | null = metadata.scheduledHour ?? null;
  const dayOfWeek = scheduledDate.getDay(); // 0 = Sun, 6 = Sat

  const result = await sql`
    INSERT INTO video_performance (
      video_script_id, platform,
      views, likes, comments, shares, saves,
      watch_time_avg, completion_rate,
      hook_style, script_structure, content_type,
      has_loop_structure, cta_type, theme_category,
      scheduled_hour, day_of_week,
      aspect, angle, hook_intro_variant, has_stitch_bait,
      retention_3s, retention_6s, retention_15s, retention_30s, retention_60s,
      recorded_at
    ) VALUES (
      ${params.videoScriptId},
      ${params.platform || 'tiktok'},
      ${params.views ?? 0},
      ${params.likes ?? 0},
      ${params.comments ?? 0},
      ${params.shares ?? 0},
      ${params.saves ?? 0},
      ${params.watchTimeAvg ?? null},
      ${params.completionRate ?? null},
      ${metadata.hookStyle ?? null},
      ${metadata.scriptStructureName ?? null},
      ${metadata.contentTypeKey ?? null},
      ${metadata.hasLoopStructure ?? false},
      ${metadata.ctaType ?? null},
      ${themeCategory},
      ${scheduledHour},
      ${dayOfWeek},
      ${metadata.aspect ?? null},
      ${metadata.angle ?? null},
      ${metadata.hookIntroVariant ?? null},
      ${metadata.hasStitchBait ?? false},
      ${params.retention3s ?? null},
      ${params.retention6s ?? null},
      ${params.retention15s ?? null},
      ${params.retention30s ?? null},
      ${params.retention60s ?? null},
      ${params.recordedAt?.toISOString() ?? new Date().toISOString()}
    )
    RETURNING id
  `;

  return result.rows[0].id;
}

/**
 * Get top-performing script structures for a content type (#11)
 * Scores by weighted average of views (0.4) and saves (0.6)
 * Requires at least 3 data points per structure
 */
export async function getTopPerformingStructures(
  contentType: string,
  limit: number = 5,
): Promise<Array<{ name: string; score: number; count: number }>> {
  try {
    const { sql } = await import('@vercel/postgres');
    const result = await sql`
      SELECT
        script_structure as name,
        (AVG(views) * 0.4 + AVG(saves) * 0.6) as score,
        COUNT(*)::int as count
      FROM video_performance
      WHERE content_type = ${contentType}
        AND script_structure IS NOT NULL
      GROUP BY script_structure
      HAVING COUNT(*) >= 3
      ORDER BY score DESC
      LIMIT ${limit}
    `;
    return result.rows.map((row) => ({
      name: row.name,
      score: Number(row.score),
      count: Number(row.count),
    }));
  } catch {
    return [];
  }
}

/**
 * Update video script written post content
 */
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
