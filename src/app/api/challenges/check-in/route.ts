import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { challengeId, reflection } = body;

    if (!challengeId) {
      return NextResponse.json(
        { success: false, error: 'challengeId is required' },
        { status: 400 },
      );
    }

    const today = new Date().toISOString().split('T')[0];

    // Verify challenge exists
    const challenge = await sql`
      SELECT id, xp_per_day, xp_bonus_week FROM weekly_challenges WHERE id = ${challengeId}
    `;
    if (challenge.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Challenge not found' },
        { status: 404 },
      );
    }

    // Record check-in
    await sql`
      INSERT INTO challenge_completions (user_id, challenge_id, check_in_date, completed, reflection)
      VALUES (${user.id}, ${challengeId}, ${today}, true, ${reflection || null})
      ON CONFLICT (user_id, challenge_id, check_in_date) DO NOTHING
    `;

    // Check if all 7 days are complete for bonus XP
    const completionCount = await sql`
      SELECT COUNT(*) as count FROM challenge_completions
      WHERE user_id = ${user.id} AND challenge_id = ${challengeId} AND completed = true
    `;
    const daysCompleted = parseInt(completionCount.rows[0]?.count || '0', 10);
    const allComplete = daysCompleted >= 7;

    // Track progress (ritual skill tree for challenge completions)
    try {
      const { incrementProgress } = await import('@/lib/progress/server');
      const subResult = await sql`
        SELECT status FROM subscriptions WHERE user_id = ${user.id} ORDER BY created_at DESC LIMIT 1
      `;
      const isPro = ['active', 'trial', 'trialing'].includes(
        subResult.rows[0]?.status,
      );

      // Daily check-in XP
      await incrementProgress(
        user.id,
        'ritual',
        challenge.rows[0].xp_per_day,
        isPro,
      );

      // Bonus XP for completing all 7 days
      if (allComplete) {
        await incrementProgress(
          user.id,
          'ritual',
          challenge.rows[0].xp_bonus_week,
          isPro,
        );

        // Update challenge streak
        const weekStart = new Date();
        const dayOfWeek = weekStart.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        weekStart.setDate(weekStart.getDate() + mondayOffset);
        const weekStartStr = weekStart.toISOString().split('T')[0];

        await sql`
          INSERT INTO user_streaks (user_id, challenge_streak, longest_challenge_streak, last_challenge_week)
          VALUES (${user.id}, 1, 1, ${weekStartStr})
          ON CONFLICT (user_id) DO UPDATE SET
            challenge_streak = CASE
              WHEN user_streaks.last_challenge_week IS NULL
                OR user_streaks.last_challenge_week = (${weekStartStr}::date - INTERVAL '7 days')::date
                THEN COALESCE(user_streaks.challenge_streak, 0) + 1
              ELSE 1
            END,
            longest_challenge_streak = GREATEST(
              COALESCE(user_streaks.longest_challenge_streak, 0),
              CASE
                WHEN user_streaks.last_challenge_week IS NULL
                  OR user_streaks.last_challenge_week = (${weekStartStr}::date - INTERVAL '7 days')::date
                  THEN COALESCE(user_streaks.challenge_streak, 0) + 1
                ELSE 1
              END
            ),
            last_challenge_week = ${weekStartStr}
        `;
      }
    } catch (progressError) {
      console.warn('[Challenges] Failed to track progress:', progressError);
    }

    return NextResponse.json({
      success: true,
      daysCompleted,
      allComplete,
      bonusAwarded: allComplete,
    });
  } catch (error) {
    console.error('Error recording challenge check-in:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
