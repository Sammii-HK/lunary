import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: 'Missing action' },
        { status: 400 },
      );
    }

    if (action === 'approve_all') {
      const result = await sql`
        UPDATE social_posts
        SET status = 'approved', updated_at = NOW()
        WHERE status = 'pending'
        RETURNING id
      `;

      return NextResponse.json({
        success: true,
        message: `Approved ${result.rows.length} posts`,
        count: result.rows.length,
      });
    }

    if (action === 'clear_all') {
      // Delete ALL posts regardless of status (pending, approved, rejected, draft)
      const result = await sql`
        DELETE FROM social_posts
        WHERE status IN ('pending', 'approved', 'rejected', 'draft')
        RETURNING id
      `;

      // Clear orphaned video jobs (best-effort — table may not exist yet)
      try {
        await sql`DELETE FROM video_jobs`;
      } catch {
        // table doesn't exist yet — safe to ignore
      }

      return NextResponse.json({
        success: true,
        message: `Cleared ${result.rows.length} posts and video jobs`,
        count: result.rows.length,
      });
    }

    if (action === 'reset_sent') {
      // Reset specific posts (by id array) from 'sent' back to 'approved'
      const ids = Array.isArray(body.postIds)
        ? body.postIds.map(Number).filter(Boolean)
        : [];

      if (ids.length === 0) {
        return NextResponse.json(
          { success: false, error: 'postIds array is required' },
          { status: 400 },
        );
      }

      const result = await sql.query(
        `UPDATE social_posts SET status = 'approved', updated_at = NOW() WHERE id = ANY($1::int[]) AND status = 'sent' RETURNING id`,
        [ids],
      );

      return NextResponse.json({
        success: true,
        message: `Reset ${result.rows.length} posts back to approved`,
        ids: result.rows.map((r: { id: number }) => r.id),
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
