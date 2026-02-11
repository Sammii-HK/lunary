import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const milestones = await sql`
      SELECT * FROM milestones_achieved
      WHERE user_id = ${user.id}
      ORDER BY achieved_at DESC
    `;

    // Check for uncelebrated milestones
    const uncelebrated = await sql`
      SELECT * FROM milestones_achieved
      WHERE user_id = ${user.id} AND celebrated = false
      ORDER BY achieved_at DESC
      LIMIT 1
    `;

    return NextResponse.json({
      success: true,
      milestones: milestones.rows.map((m) => ({
        id: m.id,
        type: m.milestone_type,
        key: m.milestone_key,
        data: m.milestone_data,
        achievedAt: m.achieved_at,
        celebrated: m.celebrated,
      })),
      uncelebrated: uncelebrated.rows[0]
        ? {
            id: uncelebrated.rows[0].id,
            type: uncelebrated.rows[0].milestone_type,
            key: uncelebrated.rows[0].milestone_key,
            data: uncelebrated.rows[0].milestone_data,
            achievedAt: uncelebrated.rows[0].achieved_at,
          }
        : null,
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
