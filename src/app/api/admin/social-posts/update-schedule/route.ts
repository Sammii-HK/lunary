import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { postId, scheduledDate } = await request.json();

    if (!postId || !scheduledDate) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 },
      );
    }

    // Validate date
    const date = new Date(scheduledDate);
    if (isNaN(date.getTime())) {
      return NextResponse.json(
        { success: false, error: 'Invalid date format' },
        { status: 400 },
      );
    }

    // Update the scheduled date
    await sql`
      UPDATE social_posts
      SET scheduled_date = ${date.toISOString()}, updated_at = NOW()
      WHERE id = ${postId}
    `;

    return NextResponse.json({
      success: true,
      message: 'Schedule updated successfully',
      scheduledDate: date.toISOString(),
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
