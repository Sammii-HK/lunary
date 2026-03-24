/**
 * Database operations for video scripts
 */

import type { VideoScript } from './types';
import { ensureVideoHook } from './hooks';
import { categoryThemes } from '../weekly-themes';
import { ensureLinePunctuation } from '@/lib/tts/normalize-script';

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
  } catch {
    // Columns may already exist
  }
}

/**
 * Save video script to database
 */
export async function saveVideoScript(script: VideoScript): Promise<number> {
  const { sql } = await import('@vercel/postgres');

  // Ensure every line ends with punctuation for proper TTS pauses
  const punctuatedScript = ensureLinePunctuation(script.fullScript);

  const result = await sql`
    INSERT INTO video_scripts (
      theme_id, theme_name, primary_theme_id,
      facet_title, topic, angle, aspect, platform, sections,
      full_script, word_count, estimated_duration, scheduled_date, status,
      metadata, cover_image_url, part_number, written_post_content, hook_text, hook_version
    )
    VALUES (
      ${script.themeId},
      ${script.themeName},
      ${script.primaryThemeId || null},
      ${script.facetTitle},
      ${script.topic || null},
      ${script.angle || null},
      ${script.aspect || null},
      ${script.platform},
      ${JSON.stringify(script.sections)},
      ${punctuatedScript},
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
  // Script text changed — reset the video_job so the next cron re-renders,
  // and clear video_url from social_posts so the old video isn't reused.
  await sql`
    UPDATE video_jobs
    SET status = 'pending', attempts = 0, last_error = NULL, updated_at = NOW()
    WHERE script_id = ${id}
      AND status != 'processing'
  `;
  await sql`
    UPDATE social_posts sp
    SET video_url = NULL
    WHERE sp.post_type = 'video'
      AND EXISTS (
        SELECT 1 FROM video_scripts vs
        WHERE vs.id = ${id}
          AND vs.facet_title = sp.topic
          AND vs.scheduled_date::date = sp.scheduled_date::date
      )
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
    const topic = row.topic || row.theme_name;
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
    // Slot tracking for engagement slot A/B testing
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS slot VARCHAR(20)`;
    // Ayrshare post ID for deduplication
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS ayrshare_id TEXT`;
    // Account set ID for per-persona filtering
    await sql`ALTER TABLE video_performance ADD COLUMN IF NOT EXISTS account_set_id TEXT`;
  } catch {
    // Columns may already exist
  }

  // Unique index on ayrshare_id for dedup (nulls allowed — only Ayrshare-sourced rows have it)
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_video_perf_ayrshare_id
    ON video_performance(ayrshare_id) WHERE ayrshare_id IS NOT NULL
  `;

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
  await sql`
    CREATE INDEX IF NOT EXISTS idx_video_perf_account_set ON video_performance(account_set_id)
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
 * Get aggregated performance scores by content category.
 * Used by the content scoring engine to compute dynamic scheduling weights.
 *
 * Returns rolling metrics over `days` window (default 30).
 */
export async function getContentCategoryScores(
  days: number = 30,
  accountSetId?: string | null,
): Promise<
  Array<{
    category: string;
    score: number;
    count: number;
    avgViews: number;
    avgLikes: number;
    avgComments: number;
    avgShares: number;
    trend: number;
  }>
> {
  try {
    const { sql } = await import('@vercel/postgres');
    const acctFilter = accountSetId ?? null;

    // Weighted composite score: views*0.3 + likes*1.0 + comments*3.0 + shares*2.0
    // Comments weighted highest — primary TikTok algorithm signal
    const result = await sql`
      SELECT
        content_type as category,
        (AVG(views) * 0.3 + AVG(likes) * 1.0 + AVG(comments) * 3.0 + AVG(shares) * 2.0) as score,
        COUNT(*)::int as count,
        AVG(views) as avg_views,
        AVG(likes) as avg_likes,
        AVG(comments) as avg_comments,
        AVG(shares) as avg_shares
      FROM video_performance
      WHERE content_type IS NOT NULL
        AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
        AND (${acctFilter}::text IS NULL OR account_set_id = ${acctFilter})
      GROUP BY content_type
      HAVING COUNT(*) >= 2
      ORDER BY score DESC
    `;

    // Calculate trend: compare last 15 days vs previous 15 days
    const halfDays = Math.floor(days / 2);
    const trendResult = await sql`
      SELECT
        content_type as category,
        AVG(CASE WHEN recorded_at >= NOW() - INTERVAL '1 day' * ${halfDays} THEN views ELSE NULL END) as recent_avg,
        AVG(CASE WHEN recorded_at < NOW() - INTERVAL '1 day' * ${halfDays} THEN views ELSE NULL END) as older_avg
      FROM video_performance
      WHERE content_type IS NOT NULL
        AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
        AND (${acctFilter}::text IS NULL OR account_set_id = ${acctFilter})
      GROUP BY content_type
    `;

    const trendMap = new Map<string, number>();
    for (const row of trendResult.rows) {
      const recent = Number(row.recent_avg) || 0;
      const older = Number(row.older_avg) || 0;
      // Trend: positive = improving, negative = declining
      trendMap.set(row.category, older > 0 ? (recent - older) / older : 0);
    }

    return result.rows.map((row) => ({
      category: row.category,
      score: Number(row.score),
      count: Number(row.count),
      avgViews: Number(row.avg_views),
      avgLikes: Number(row.avg_likes),
      avgComments: Number(row.avg_comments),
      avgShares: Number(row.avg_shares),
      trend: trendMap.get(row.category) ?? 0,
    }));
  } catch {
    return [];
  }
}

/**
 * Bulk insert performance records (for TikTok Studio / Ayrshare data import).
 * Inserts directly without requiring a linked video_script.
 *
 * When ayrshareId is provided, uses ON CONFLICT to upsert (update metrics
 * on re-run instead of creating duplicates).
 */
export async function bulkInsertPerformance(
  records: Array<{
    platform?: string;
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves?: number;
    contentCategory: string;
    postedAt: string;
    description?: string;
    slot?: string;
    ayrshareId?: string;
    scheduledHour?: number;
    dayOfWeek?: number;
    accountSetId?: string;
  }>,
): Promise<number> {
  const { sql } = await import('@vercel/postgres');
  let inserted = 0;

  for (const record of records) {
    try {
      if (record.ayrshareId) {
        // Upsert: insert or update existing record by ayrshare_id
        await sql`
          INSERT INTO video_performance (
            platform, views, likes, comments, shares, saves,
            content_type, recorded_at, slot, ayrshare_id,
            scheduled_hour, day_of_week, account_set_id
          ) VALUES (
            ${record.platform || 'tiktok'},
            ${record.views},
            ${record.likes},
            ${record.comments},
            ${record.shares},
            ${record.saves ?? 0},
            ${record.contentCategory},
            ${record.postedAt},
            ${record.slot ?? null},
            ${record.ayrshareId},
            ${record.scheduledHour ?? null},
            ${record.dayOfWeek ?? null},
            ${record.accountSetId ?? null}
          )
          ON CONFLICT (ayrshare_id) WHERE ayrshare_id IS NOT NULL
          DO UPDATE SET
            views = EXCLUDED.views,
            likes = EXCLUDED.likes,
            comments = EXCLUDED.comments,
            shares = EXCLUDED.shares,
            saves = EXCLUDED.saves,
            slot = COALESCE(EXCLUDED.slot, video_performance.slot),
            scheduled_hour = COALESCE(EXCLUDED.scheduled_hour, video_performance.scheduled_hour),
            day_of_week = COALESCE(EXCLUDED.day_of_week, video_performance.day_of_week),
            account_set_id = COALESCE(EXCLUDED.account_set_id, video_performance.account_set_id),
            recorded_at = EXCLUDED.recorded_at
        `;
      } else {
        // Legacy insert without dedup (no ayrshare_id)
        await sql`
          INSERT INTO video_performance (
            platform, views, likes, comments, shares, saves,
            content_type, recorded_at, slot,
            scheduled_hour, day_of_week, account_set_id
          ) VALUES (
            ${record.platform || 'tiktok'},
            ${record.views},
            ${record.likes},
            ${record.comments},
            ${record.shares},
            ${record.saves ?? 0},
            ${record.contentCategory},
            ${record.postedAt},
            ${record.slot ?? null},
            ${record.scheduledHour ?? null},
            ${record.dayOfWeek ?? null},
            ${record.accountSetId ?? null}
          )
        `;
      }
      inserted++;
    } catch {
      // Skip individual record failures
    }
  }

  return inserted;
}

// ── EDA Signals ─────────────────────────────────────────────────────────────

export interface ContentEDASignals {
  /** Per-category viral score using z-score normalisation */
  categoryViralScores: Array<{
    category: string;
    viralScore: number;
    zViews: number;
    zEngagement: number;
    avgViews: number;
    avgSaves: number;
    avgComments: number;
    avgShares: number;
    count: number;
  }>;
  /** Per-category x slot performance (which categories work in which time slots) */
  categorySlotProfile: Array<{
    category: string;
    slot: string;
    medianEngagement: number;
    count: number;
  }>;
  /** Per-category x day-of-week performance */
  categoryDayProfile: Array<{
    category: string;
    dayOfWeek: number;
    medianEngagement: number;
    count: number;
  }>;
  /** Per-category x hour performance */
  categoryHourProfile: Array<{
    category: string;
    scheduledHour: number;
    medianEngagement: number;
    count: number;
  }>;
  /** Concentration: how evenly distributed are recent posts across categories */
  concentrationHHI: number;
  /** Category share breakdown */
  categoryShares: Array<{ category: string; share: number; count: number }>;
  /** Total posts in window */
  totalPosts: number;
  /** Data confidence */
  confidence: 'high' | 'medium' | 'low';

  // ── Cross-channel signals ──────────────────────────────────────────────

  /** Spellcast social performance by content type (Threads, IG, all platforms) */
  spellcastPerformance: {
    available: boolean;
    contentTypePerformance: Record<
      string,
      {
        count: number;
        avgEngagement: number;
        avgSaves: number;
        avgReach: number;
      }
    >;
    bestPostingTimes: Array<{
      day: string;
      hour: number;
      avgEngagement: number;
    }>;
    hookPatterns: Record<string, { count: number; avgEng: number }>;
    platformMix: Record<string, number>;
  };

  /** GSC organic traffic signals by grimoire content category */
  seoPerformance: {
    available: boolean;
    /** Top grimoire pages by clicks (category derived from URL path) */
    categoryClicks: Array<{
      category: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
  };

  /** Unified cross-channel score: blends video + social + SEO signals per category */
  crossChannelScores: Array<{
    category: string;
    videoScore: number;
    socialScore: number;
    seoScore: number;
    unifiedScore: number;
  }>;
}

/**
 * Compute deep EDA signals from video_performance data.
 *
 * Uses z-score normalisation to rank categories by a composite viral score
 * that balances reach (views) and engagement quality (saves + comments + shares).
 * Also computes category x slot, category x day, and concentration metrics.
 */
export async function getContentEDASignals(
  days: number = 30,
  accountSetId?: string | null,
): Promise<ContentEDASignals> {
  const { sql } = await import('@vercel/postgres');
  const acctFilter = accountSetId ?? null;

  // 1. Per-category aggregates with saves
  const catResult = await sql`
    SELECT
      content_type as category,
      COUNT(*)::int as count,
      AVG(views) as avg_views,
      AVG(likes) as avg_likes,
      AVG(comments) as avg_comments,
      AVG(shares) as avg_shares,
      AVG(COALESCE(saves, 0)) as avg_saves,
      AVG(LN(GREATEST(views, 1) + 1)) as log_views,
      AVG(LN(GREATEST(likes + comments * 3 + shares * 2 + COALESCE(saves, 0) * 1.5, 1) + 1)) as log_engagement
    FROM video_performance
    WHERE content_type IS NOT NULL
      AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
      AND (${acctFilter}::text IS NULL OR account_set_id = ${acctFilter})
    GROUP BY content_type
    HAVING COUNT(*) >= 2
    ORDER BY count DESC
  `;

  // Compute z-scores across categories
  const rows = catResult.rows;
  const totalPosts = rows.reduce((s, r) => s + Number(r.count), 0);

  // Mean and std of log values
  const logViewsArr = rows.map((r) => Number(r.log_views));
  const logEngArr = rows.map((r) => Number(r.log_engagement));

  const mean = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
  const std = (arr: number[]) => {
    const m = mean(arr);
    const variance =
      arr.length > 1
        ? arr.reduce((sum, v) => sum + (v - m) ** 2, 0) / (arr.length - 1)
        : 0;
    return Math.sqrt(variance);
  };

  const meanLogViews = mean(logViewsArr);
  const stdLogViews = std(logViewsArr) || 1;
  const meanLogEng = mean(logEngArr);
  const stdLogEng = std(logEngArr) || 1;

  const categoryViralScores = rows.map((r) => {
    const zViews = (Number(r.log_views) - meanLogViews) / stdLogViews;
    const zEng = (Number(r.log_engagement) - meanLogEng) / stdLogEng;
    return {
      category: r.category,
      viralScore: Math.round((zViews + zEng) * 100) / 100,
      zViews: Math.round(zViews * 100) / 100,
      zEngagement: Math.round(zEng * 100) / 100,
      avgViews: Math.round(Number(r.avg_views)),
      avgSaves: Math.round(Number(r.avg_saves)),
      avgComments: Math.round(Number(r.avg_comments)),
      avgShares: Math.round(Number(r.avg_shares)),
      count: Number(r.count),
    };
  });
  categoryViralScores.sort((a, b) => b.viralScore - a.viralScore);

  // 2. Category x slot profile
  const slotResult = await sql`
    SELECT
      content_type as category,
      slot,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY comments * 3.0 + shares * 2.0 + likes + COALESCE(saves, 0) * 1.5) as median_engagement,
      COUNT(*)::int as count
    FROM video_performance
    WHERE content_type IS NOT NULL
      AND slot IS NOT NULL
      AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
      AND (${acctFilter}::text IS NULL OR account_set_id = ${acctFilter})
    GROUP BY content_type, slot
    HAVING COUNT(*) >= 2
    ORDER BY median_engagement DESC
  `;

  const categorySlotProfile = slotResult.rows.map((r) => ({
    category: r.category,
    slot: r.slot,
    medianEngagement: Math.round(Number(r.median_engagement)),
    count: Number(r.count),
  }));

  // 3. Category x day-of-week profile
  const dayResult = await sql`
    SELECT
      content_type as category,
      day_of_week,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY comments * 3.0 + shares * 2.0 + likes + COALESCE(saves, 0) * 1.5) as median_engagement,
      COUNT(*)::int as count
    FROM video_performance
    WHERE content_type IS NOT NULL
      AND day_of_week IS NOT NULL
      AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
      AND (${acctFilter}::text IS NULL OR account_set_id = ${acctFilter})
    GROUP BY content_type, day_of_week
    HAVING COUNT(*) >= 2
    ORDER BY median_engagement DESC
  `;

  const categoryDayProfile = dayResult.rows.map((r) => ({
    category: r.category,
    dayOfWeek: Number(r.day_of_week),
    medianEngagement: Math.round(Number(r.median_engagement)),
    count: Number(r.count),
  }));

  // 4. Category x hour profile
  const hourResult = await sql`
    SELECT
      content_type as category,
      scheduled_hour,
      PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY comments * 3.0 + shares * 2.0 + likes + COALESCE(saves, 0) * 1.5) as median_engagement,
      COUNT(*)::int as count
    FROM video_performance
    WHERE content_type IS NOT NULL
      AND scheduled_hour IS NOT NULL
      AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
      AND (${acctFilter}::text IS NULL OR account_set_id = ${acctFilter})
    GROUP BY content_type, scheduled_hour
    HAVING COUNT(*) >= 2
    ORDER BY median_engagement DESC
  `;

  const categoryHourProfile = hourResult.rows.map((r) => ({
    category: r.category,
    scheduledHour: Number(r.scheduled_hour),
    medianEngagement: Math.round(Number(r.median_engagement)),
    count: Number(r.count),
  }));

  // 5. Concentration (HHI)
  const categoryShares = rows.map((r) => ({
    category: r.category,
    share:
      totalPosts > 0
        ? Math.round((Number(r.count) / totalPosts) * 1000) / 1000
        : 0,
    count: Number(r.count),
  }));
  const concentrationHHI =
    Math.round(
      categoryShares.reduce((sum, c) => sum + c.share ** 2, 0) * 1000,
    ) / 1000;

  const confidence: 'high' | 'medium' | 'low' =
    totalPosts >= 50 ? 'high' : totalPosts >= 20 ? 'medium' : 'low';

  // ── 6. Cross-channel: Spellcast social performance ──────────────────────

  let spellcastPerformance: ContentEDASignals['spellcastPerformance'] = {
    available: false,
    contentTypePerformance: {},
    bestPostingTimes: [],
    hookPatterns: {},
    platformMix: {},
  };

  try {
    const { getWinningPatterns } = await import('../winning-patterns');
    // Lunary account set ID
    const patterns = await getWinningPatterns(
      'a190e806-5bac-497b-88bd-b1d96ed1f2e8',
      days,
    );
    if (patterns && patterns.sampleSize >= 3) {
      spellcastPerformance = {
        available: true,
        contentTypePerformance: patterns.contentTypePerformance,
        bestPostingTimes: patterns.bestPostingTimes.map((t) => ({
          day: t.day,
          hour: t.hour,
          avgEngagement: t.avgEngagement,
        })),
        hookPatterns: patterns.hookPatterns,
        platformMix: patterns.summary.platformMix,
      };
    }
  } catch {
    // Spellcast unavailable — continue with video-only signals
  }

  // ── 7. Cross-channel: GSC organic traffic by grimoire category ──────────

  let seoPerformance: ContentEDASignals['seoPerformance'] = {
    available: false,
    categoryClicks: [],
  };

  try {
    const { getTopPages } = await import('@/lib/google/search-console');
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - days * 86400000)
      .toISOString()
      .split('T')[0];

    const pages = await getTopPages(startDate, endDate, 50);

    if (pages?.length) {
      // Map grimoire URLs to content categories
      const categoryMap = new Map<
        string,
        {
          clicks: number;
          impressions: number;
          ctrSum: number;
          posSum: number;
          count: number;
        }
      >();

      for (const page of pages) {
        const url = String(page.page ?? '');
        const cat = deriveGrimoireCategoryFromUrl(url);
        if (!cat) continue;

        const existing = categoryMap.get(cat) ?? {
          clicks: 0,
          impressions: 0,
          ctrSum: 0,
          posSum: 0,
          count: 0,
        };
        existing.clicks += Number(page.clicks ?? 0);
        existing.impressions += Number(page.impressions ?? 0);
        existing.ctrSum += Number(page.ctr ?? 0);
        existing.posSum += Number(page.position ?? 0);
        existing.count++;
        categoryMap.set(cat, existing);
      }

      seoPerformance = {
        available: true,
        categoryClicks: Array.from(categoryMap.entries())
          .map(([category, data]) => ({
            category,
            clicks: data.clicks,
            impressions: data.impressions,
            ctr:
              Math.round((data.ctrSum / Math.max(data.count, 1)) * 10000) /
              10000,
            position:
              Math.round((data.posSum / Math.max(data.count, 1)) * 10) / 10,
          }))
          .sort((a, b) => b.clicks - a.clicks),
      };
    }
  } catch {
    // GSC unavailable — continue without SEO signals
  }

  // ── 8. Unified cross-channel score ──────────────────────────────────────

  const crossChannelScores = computeCrossChannelScores(
    categoryViralScores,
    spellcastPerformance,
    seoPerformance,
  );

  return {
    categoryViralScores,
    categorySlotProfile,
    categoryDayProfile,
    categoryHourProfile,
    concentrationHHI,
    categoryShares,
    totalPosts,
    confidence,
    spellcastPerformance,
    seoPerformance,
    crossChannelScores,
  };
}

/**
 * Derive a grimoire content category from a lunary.app URL path.
 * Maps paths like /grimoire/crystals/amethyst → crystal-healing,
 * /grimoire/tarot/the-fool → tarot, etc.
 */
function deriveGrimoireCategoryFromUrl(url: string): string | null {
  const path = url.replace(/^https?:\/\/[^/]+/, '').toLowerCase();

  if (path.includes('/grimoire/crystals') || path.includes('/crystal'))
    return 'crystal-healing';
  if (path.includes('/grimoire/tarot') || path.includes('/tarot'))
    return 'tarot';
  if (path.includes('/grimoire/runes') || path.includes('/rune')) return 'rune';
  if (path.includes('/grimoire/spells') || path.includes('/spell'))
    return 'spells';
  if (path.includes('/grimoire/numerology') || path.includes('/numerology'))
    return 'numerology-sign';
  if (
    path.includes('/grimoire/transits') ||
    path.includes('/retrograde') ||
    path.includes('/transit')
  )
    return 'transit-alert';
  if (
    path.includes('/grimoire/placements') ||
    path.includes('/houses') ||
    path.includes('/aspects')
  )
    return 'aspect-educational';
  if (path.includes('/horoscope')) return 'sign-identity';
  if (path.includes('/zodiac') || path.includes('/signs'))
    return 'sign-identity';
  if (path.includes('/chiron')) return 'chiron-sign';
  if (path.includes('/angel-number')) return 'angel-number';
  if (path.includes('/sabbat') || path.includes('/wheel-of-the-year'))
    return 'sabbat';
  if (path.includes('/glossary')) return 'glossary';
  if (path.includes('/grimoire')) return 'did-you-know'; // generic grimoire
  return null;
}

/**
 * Compute a unified cross-channel score per category.
 * Blends video performance (50%), social performance (30%), SEO (20%).
 * Each channel's scores are normalised to 0-1 before blending.
 */
function computeCrossChannelScores(
  viralScores: ContentEDASignals['categoryViralScores'],
  spellcast: ContentEDASignals['spellcastPerformance'],
  seo: ContentEDASignals['seoPerformance'],
): ContentEDASignals['crossChannelScores'] {
  const allCategories = new Set(viralScores.map((v) => v.category));

  // Normalise viral scores to 0-1
  const viralMin = Math.min(...viralScores.map((v) => v.viralScore));
  const viralMax = Math.max(...viralScores.map((v) => v.viralScore));
  const viralRange = viralMax - viralMin || 1;
  const viralNorm = new Map(
    viralScores.map((v) => [
      v.category,
      (v.viralScore - viralMin) / viralRange,
    ]),
  );

  // Normalise Spellcast content type performance to 0-1
  const socialNorm = new Map<string, number>();
  if (spellcast.available) {
    const entries = Object.entries(spellcast.contentTypePerformance);
    // Map Spellcast content types to our categories where possible
    for (const [type, data] of entries) {
      const cat = mapSpellcastTypeToCategory(type);
      if (cat) {
        allCategories.add(cat);
        socialNorm.set(cat, data.avgEngagement);
      }
    }
    // Normalise
    const socialValues = Array.from(socialNorm.values());
    const sMax = Math.max(...socialValues, 1);
    for (const [k, v] of socialNorm) {
      socialNorm.set(k, v / sMax);
    }
  }

  // Normalise SEO clicks to 0-1
  const seoNorm = new Map<string, number>();
  if (seo.available && seo.categoryClicks.length > 0) {
    const maxClicks = Math.max(...seo.categoryClicks.map((c) => c.clicks), 1);
    for (const c of seo.categoryClicks) {
      allCategories.add(c.category);
      seoNorm.set(c.category, c.clicks / maxClicks);
    }
  }

  // Blend: 50% video, 30% social, 20% SEO
  const results: ContentEDASignals['crossChannelScores'] = [];
  for (const category of allCategories) {
    const videoScore = viralNorm.get(category) ?? 0;
    const socialScore = socialNorm.get(category) ?? 0;
    const seoScore = seoNorm.get(category) ?? 0;

    // Adjust weights based on data availability
    let vW = 0.5,
      sW = 0.3,
      eW = 0.2;
    if (!spellcast.available) {
      vW = 0.7;
      sW = 0;
      eW = 0.3;
    }
    if (!seo.available) {
      vW = spellcast.available ? 0.6 : 1.0;
      sW = spellcast.available ? 0.4 : 0;
      eW = 0;
    }

    const unifiedScore =
      Math.round((videoScore * vW + socialScore * sW + seoScore * eW) * 100) /
      100;

    results.push({ category, videoScore, socialScore, seoScore, unifiedScore });
  }

  results.sort((a, b) => b.unifiedScore - a.unifiedScore);
  return results;
}

/**
 * Map Spellcast content type names to Lunary category keys.
 * Spellcast uses descriptive names; we need to match our category taxonomy.
 */
function mapSpellcastTypeToCategory(type: string): string | null {
  const lower = type.toLowerCase();
  if (lower.includes('carousel')) return null; // format, not category
  if (lower.includes('thread')) return null;
  if (lower.includes('reel')) return null;
  if (lower.includes('crystal')) return 'crystal-healing';
  if (lower.includes('tarot')) return 'tarot';
  if (lower.includes('transit') || lower.includes('retrograde'))
    return 'transit-alert';
  if (lower.includes('numerology') || lower.includes('angel'))
    return 'angel-number';
  if (lower.includes('zodiac') || lower.includes('sign'))
    return 'sign-identity';
  if (lower.includes('ranking')) return 'ranking';
  if (lower.includes('quiz')) return 'quiz';
  if (lower.includes('rune')) return 'rune';
  return null;
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
