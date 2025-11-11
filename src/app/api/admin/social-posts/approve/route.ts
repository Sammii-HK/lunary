import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function POST(request: NextRequest) {
  try {
    const { postId, action, feedback } = await request.json();

    if (!postId || !action) {
      return NextResponse.json(
        { success: false, error: 'Missing postId or action' },
        { status: 400 },
      );
    }

    const status = action === 'approve' ? 'approved' : 'rejected';

    if (action === 'reject' && feedback) {
      await sql`
        UPDATE social_posts
        SET status = ${status}, rejection_feedback = ${feedback}, updated_at = NOW()
        WHERE id = ${postId}
      `;
    } else {
      await sql`
        UPDATE social_posts
        SET status = ${status}, updated_at = NOW()
        WHERE id = ${postId}
      `;
    }

    return NextResponse.json({
      success: true,
      message: `Post ${action}d successfully`,
    });
  } catch (error) {
    console.error('Error updating post status:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
