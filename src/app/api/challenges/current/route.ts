import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Get current week's Monday
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    const weekStart = monday.toISOString().split('T')[0];

    // Get this week's challenge
    const challenge = await sql`
      SELECT * FROM weekly_challenges
      WHERE week_start = ${weekStart}
      LIMIT 1
    `;

    if (challenge.rows.length === 0) {
      return NextResponse.json({ success: true, challenge: null });
    }

    const ch = challenge.rows[0];

    // Get user's completions for this challenge
    const completions = await sql`
      SELECT check_in_date, completed, reflection FROM challenge_completions
      WHERE user_id = ${user.id} AND challenge_id = ${ch.id}
      ORDER BY check_in_date
    `;

    // Calculate today's prompt index (0-6, Mon=0)
    const todayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const prompts = ch.daily_prompts || [];

    return NextResponse.json({
      success: true,
      challenge: {
        id: ch.id,
        weekStart: ch.week_start,
        transitKey: ch.transit_key,
        title: ch.challenge_title,
        description: ch.challenge_description,
        dailyPrompts: prompts,
        todayPrompt: prompts[todayIndex] || null,
        todayIndex,
        xpPerDay: ch.xp_per_day,
        xpBonusWeek: ch.xp_bonus_week,
        participantCount: ch.participant_count,
      },
      completions: completions.rows.map((c) => ({
        date: c.check_in_date,
        completed: c.completed,
        reflection: c.reflection,
      })),
      completedToday: completions.rows.some(
        (c) =>
          new Date(c.check_in_date).toISOString().split('T')[0] ===
          now.toISOString().split('T')[0],
      ),
    });
  } catch (error) {
    console.error('Error fetching current challenge:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
