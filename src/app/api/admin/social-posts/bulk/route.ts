import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing action' },
        { status: 400 },
      );
    }

    if (action === 'approve_all') {
      const pendingResult = await sql`
        SELECT id
        FROM social_posts
        WHERE status = 'pending'
      `;

      const baseUrl = process.env.VERCEL
        ? 'https://lunary.app'
        : 'http://localhost:3000';

      for (const row of pendingResult.rows) {
        try {
          await fetch(`${baseUrl}/api/admin/social-posts/approve`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              postId: row.id,
              action: 'approve',
            }),
          });
        } catch (error) {
          console.warn('Failed to approve post during bulk approval:', row.id);
        }
      }

      return NextResponse.json({
        success: true,
        message: `Approved ${pendingResult.rows.length} posts`,
        count: pendingResult.rows.length,
      });
    }

    if (action === 'clear_all') {
      const result = await sql`
        DELETE FROM social_posts
        WHERE status = 'pending'
        RETURNING id
      `;
      await sql`
        DELETE FROM video_jobs vj
        WHERE vj.status IN ('pending', 'failed')
          AND NOT EXISTS (
            SELECT 1
            FROM video_scripts vs
            JOIN social_posts sp
              ON sp.topic = vs.facet_title
             AND sp.scheduled_date::date = vs.scheduled_date
             AND sp.week_theme = vs.theme_name
            WHERE vs.id = vj.script_id
          )
      `;

      return NextResponse.json({
        success: true,
        message: `Cleared ${result.rows.length} pending posts`,
        count: result.rows.length,
      });
    }

    if (action === 'reject_all') {
      const result = await sql`
        UPDATE social_posts
        SET status = 'rejected', updated_at = NOW()
        WHERE status = 'pending'
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        message: `Rejected ${result.rows.length} posts`,
        count: result.rows.length,
      });
    }

    return NextResponse.json(
      { success: false, error: `Unknown action: ${action}` },
      { status: 400 },
    );
  } catch (error) {
    console.error('Error performing bulk action:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
