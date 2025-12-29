import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
export const runtime = 'nodejs';

function getWeekStartLocal(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const weekStartParam = body?.weekStart as string | undefined;
    const weekOffset = Number(body?.weekOffset ?? 0);
    const forceRebuild = Boolean(body?.forceRebuild);
    const forceThemeName = (body?.forceThemeName as string | undefined) || null;

    const baseDate = weekStartParam ? new Date(weekStartParam) : new Date();
    const weekStart = getWeekStartLocal(baseDate);
    if (!weekStartParam && weekOffset) {
      weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    if (forceThemeName) {
      await sql`
        UPDATE social_posts
        SET week_theme = ${forceThemeName}
        WHERE scheduled_date >= ${weekStart.toISOString()}
          AND scheduled_date < ${weekEnd.toISOString()}
      `;
    }

    if (forceThemeName) {
      await sql`
        DELETE FROM video_scripts
        WHERE platform = 'tiktok'
          AND theme_name <> ${forceThemeName}
          AND scheduled_date >= ${weekStart.toISOString()}
          AND scheduled_date < ${weekEnd.toISOString()}
      `;
      await sql`
        WITH keep AS (
          SELECT MAX(id) AS id
          FROM video_scripts
          WHERE platform = 'tiktok'
            AND theme_name = ${forceThemeName}
            AND scheduled_date >= ${weekStart.toISOString()}
            AND scheduled_date < ${weekEnd.toISOString()}
          GROUP BY facet_title, scheduled_date
        )
        DELETE FROM video_scripts
        WHERE platform = 'tiktok'
          AND theme_name = ${forceThemeName}
          AND scheduled_date >= ${weekStart.toISOString()}
          AND scheduled_date < ${weekEnd.toISOString()}
          AND id NOT IN (SELECT id FROM keep)
      `;
    }

    if (forceThemeName) {
      await sql`
        UPDATE social_posts sp
        SET video_url = NULL, updated_at = NOW()
        WHERE sp.week_theme = ${forceThemeName}
          AND sp.scheduled_date >= ${weekStart.toISOString()}
          AND sp.scheduled_date < ${weekEnd.toISOString()}
          AND EXISTS (
            SELECT 1
            FROM video_scripts vs
            WHERE vs.platform = 'tiktok'
              AND vs.scheduled_date = sp.scheduled_date::date
              AND vs.facet_title = sp.topic
              AND vs.theme_name <> ${forceThemeName}
          )
      `;
    }

    if (forceRebuild) {
      await sql`
        UPDATE social_posts
        SET video_url = NULL, updated_at = NOW()
        WHERE scheduled_date >= ${weekStart.toISOString()}
          AND scheduled_date < ${weekEnd.toISOString()}
          AND post_type IN ('educational', 'video')
      `;
    }

    await sql`
      DELETE FROM video_jobs
      WHERE week_start = ${weekStart.toISOString().split('T')[0]}
         OR (date_key >= ${weekStart.toISOString()}
             AND date_key < ${weekEnd.toISOString()})
         OR topic IN (
            SELECT DISTINCT topic
            FROM social_posts
            WHERE scheduled_date >= ${weekStart.toISOString()}
              AND scheduled_date < ${weekEnd.toISOString()}
         )
    `;

    await sql`
      WITH latest_scripts AS (
        SELECT MAX(id) AS id
        FROM video_scripts
        WHERE platform = 'tiktok'
          AND scheduled_date >= ${weekStart.toISOString()}
          AND scheduled_date < ${weekEnd.toISOString()}
        GROUP BY facet_title, scheduled_date, theme_name
      )
      INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
      SELECT vs.id,
             ${weekStart.toISOString().split('T')[0]},
             vs.scheduled_date,
             vs.facet_title,
             'pending',
             NOW(),
             NOW()
      FROM video_scripts vs
      JOIN latest_scripts ls
        ON ls.id = vs.id
      JOIN social_posts sp
        ON sp.topic = vs.facet_title
       AND sp.scheduled_date::date = vs.scheduled_date
      WHERE vs.platform = 'tiktok'
        AND vs.scheduled_date >= ${weekStart.toISOString()}
        AND vs.scheduled_date < ${weekEnd.toISOString()}
        AND sp.week_theme = vs.theme_name
        AND (${forceThemeName}::text IS NULL OR vs.theme_name = ${forceThemeName})
        AND (${forceRebuild} OR sp.video_url IS NULL OR sp.video_url = '')
      ON CONFLICT (script_id)
      DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
    `;

    return NextResponse.json({
      success: true,
      weekStart: weekStart.toISOString(),
      forceRebuild,
      forceThemeName,
    });
  } catch (error) {
    console.error('Failed to requeue videos:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
