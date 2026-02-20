import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

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

      const authHeader = request.headers.get('authorization');
      for (const row of pendingResult.rows) {
        try {
          await fetch(`${baseUrl}/api/admin/social-posts/approve`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(authHeader && { Authorization: authHeader }),
            },
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
      // Delete ALL posts regardless of status (pending, approved, rejected, draft)
      const result = await sql`
        DELETE FROM social_posts
        WHERE status IN ('pending', 'approved', 'rejected', 'draft')
        RETURNING id
      `;

      // Clear orphaned video jobs (jobs without corresponding posts)
      await sql`
        DELETE FROM video_jobs
      `;

      return NextResponse.json({
        success: true,
        message: `Cleared ${result.rows.length} posts and video jobs`,
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
