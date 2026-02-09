import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { ensureVideoScriptsTable } from '@/lib/social/video-script-generator';

async function ensureVideoJobsTable() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS video_jobs (
        id SERIAL PRIMARY KEY,
        script_id INTEGER NOT NULL,
        week_start DATE,
        date_key DATE,
        topic TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_video_jobs_script_id
      ON video_jobs(script_id)
    `;
  } catch (error) {
    console.warn('Video jobs table check failed:', error);
  }
}

export async function GET(request: NextRequest) {
  try {
    try {
      await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS week_theme TEXT`;
      await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS week_start DATE`;
      await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS base_group_key TEXT`;
      await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS base_post_id INTEGER`;
      await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS source_type TEXT`;
      await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS source_id TEXT`;
      await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS source_title TEXT`;
      await ensureVideoScriptsTable();
      await ensureVideoJobsTable();
    } catch (tableError) {
      console.warn('Social posts table check failed:', tableError);
    }

    const result = await sql`
      SELECT
        sp.id,
        sp.content,
        sp.platform,
        sp.post_type as "postType",
        sp.topic,
        sp.scheduled_date as "scheduledDate",
        sp.status,
        sp.image_url as "imageUrl",
        sp.video_url as "videoUrl",
        sp.video_metadata as "videoMetadata",
        sp.week_theme as "weekTheme",
        sp.week_start as "weekStart",
        sp.base_group_key as "baseGroupKey",
        sp.base_post_id as "basePostId",
        sp.source_type as "sourceType",
        sp.source_id as "sourceId",
        sp.source_title as "sourceTitle",
        sp.created_at as "createdAt",
        vs.id as "videoScriptId",
        vs.full_script as "videoScript",
        vs.platform as "videoScriptPlatform",
        vs.theme_name as "videoThemeName",
        vs.part_number as "videoPartNumber",
        vs.cover_image_url as "videoCoverImageUrl",
        vj.status as "videoJobStatus",
        vj.attempts as "videoJobAttempts",
        vj.last_error as "videoJobError"
      FROM social_posts sp
      LEFT JOIN LATERAL (
        SELECT id, full_script, platform, theme_name, part_number, cover_image_url
        FROM video_scripts
        WHERE platform = 'tiktok'
          AND scheduled_date = sp.scheduled_date::date
          AND facet_title = sp.topic
        ORDER BY id DESC
        LIMIT 1
      ) vs ON true
      LEFT JOIN video_jobs vj
        ON vj.script_id = vs.id
      WHERE sp.status IN ('pending', 'approved')
      ORDER BY sp.post_type ASC, sp.scheduled_date ASC NULLS LAST, sp.created_at DESC
      LIMIT 200
    `;

    return NextResponse.json({
      success: true,
      posts: result.rows,
    });
  } catch (error) {
    console.error('Error fetching pending posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        posts: [],
      },
      { status: 500 },
    );
  }
}
