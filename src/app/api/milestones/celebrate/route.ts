import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { milestoneId } = body;

    if (!milestoneId) {
      return NextResponse.json(
        { success: false, error: 'milestoneId is required' },
        { status: 400 },
      );
    }

    await sql`
      UPDATE milestones_achieved
      SET celebrated = true
      WHERE id = ${milestoneId} AND user_id = ${user.id}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error celebrating milestone:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
