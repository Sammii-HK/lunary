import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { sql } from '@vercel/postgres';

/**
 * GET /api/referrals/rewards
 * Auth required. Get user's earned referral rewards (milestones).
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      );
    }

    const result = await sql`
      SELECT milestone_type, milestone_key, milestone_data, achieved_at
      FROM milestones_achieved
      WHERE user_id = ${session.user.id}
        AND milestone_type IN ('referral_badge', 'referral_spread', 'referral_title')
      ORDER BY achieved_at ASC
    `;

    return NextResponse.json({
      rewards: result.rows.map((row) => ({
        type: row.milestone_type,
        key: row.milestone_key,
        data: row.milestone_data,
        achievedAt: row.achieved_at
          ? new Date(row.achieved_at).toISOString()
          : null,
      })),
    });
  } catch (error) {
    console.error('[Referrals/rewards] GET failed:', error);
    return NextResponse.json(
      { error: 'Failed to load rewards' },
      { status: 500 },
    );
  }
}
