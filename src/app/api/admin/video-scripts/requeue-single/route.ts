import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const runtime = 'nodejs';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json().catch(() => ({}));
    const postId = body?.postId as string | undefined;
    const scriptIdParam = body?.scriptId as number | undefined;
    const processNow = Boolean(body?.processNow);
    const forceRebuild = Boolean(body?.forceRebuild);

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Missing postId' },
        { status: 400 },
      );
    }

    const postResult = await sql`
      SELECT id, topic, scheduled_date, week_theme
      FROM social_posts
      WHERE id = ${postId}
      LIMIT 1
    `;
    const postRow = postResult.rows[0] as
      | {
          id: string;
          topic: string | null;
          scheduled_date: string | Date;
          week_theme: string | null;
        }
      | undefined;
    if (!postRow || !postRow.topic) {
      return NextResponse.json(
        { success: false, error: 'Post not found or missing topic' },
        { status: 404 },
      );
    }

    const scheduledDate = new Date(postRow.scheduled_date);
    const dateKey = scheduledDate.toISOString().split('T')[0];
    const weekStart = getWeekStart(scheduledDate).toISOString().split('T')[0];

    // Use provided scriptId directly, or look up by topic+date
    let scriptId = scriptIdParam;
    if (!scriptId) {
      const scriptResult = await sql`
        SELECT id
        FROM video_scripts
        WHERE platform = 'tiktok'
          AND facet_title = ${postRow.topic}
          AND scheduled_date = ${dateKey}
        ORDER BY id DESC
        LIMIT 1
      `;
      const scriptRow = scriptResult.rows[0] as { id: number } | undefined;
      if (!scriptRow) {
        return NextResponse.json(
          { success: false, error: 'No matching video script found' },
          { status: 404 },
        );
      }
      scriptId = scriptRow.id;
    }

    await sql`
      UPDATE social_posts
      SET video_url = NULL, updated_at = NOW()
      WHERE topic = ${postRow.topic}
        AND scheduled_date::date = ${dateKey}
        AND post_type = 'video'
    `;

    await sql`
      INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
      VALUES (${scriptId}, ${weekStart}, ${dateKey}, ${postRow.topic}, 'pending', NOW(), NOW())
      ON CONFLICT (script_id)
      DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
    `;

    if (processNow) {
      const baseUrl = process.env.VERCEL
        ? 'https://lunary.app'
        : 'http://localhost:3000';
      const cronSecret = process.env.CRON_SECRET;
      await fetch(
        `${baseUrl}/api/cron/process-video-jobs?limit=1${forceRebuild ? '&force=true' : ''}`,
        {
          method: 'POST',
          headers: cronSecret ? { Authorization: `Bearer ${cronSecret}` } : {},
        },
      );
    }

    return NextResponse.json({
      success: true,
      scriptId,
      weekStart,
      dateKey,
      topic: postRow.topic,
    });
  } catch (error) {
    console.error('Failed to requeue single video:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
