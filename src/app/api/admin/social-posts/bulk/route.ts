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
      const result = await sql`
        DELETE FROM social_posts
        WHERE status = 'pending'
        RETURNING id
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
