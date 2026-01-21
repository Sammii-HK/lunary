import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get or create user streak record
    const result = await sql`
      SELECT current_streak, longest_streak, last_check_in, total_check_ins
      FROM user_streaks
      WHERE user_id = ${userId}
    `;

    let currentStreak = 0;
    let longestStreak = 0;
    let lastCheckIn: string | null = null;
    let totalCheckIns = 0;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      currentStreak = row.current_streak || 0;
      longestStreak = row.longest_streak || 0;
      lastCheckIn = row.last_check_in
        ? new Date(row.last_check_in).toISOString().split('T')[0]
        : null;
      totalCheckIns = row.total_check_ins || 0;
    }

    // Calculate if this is a new day
    const isNewDay = lastCheckIn !== today;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const calculateDaysAway = (from: string, to: string) => {
      const fromDate = new Date(`${from}T00:00:00Z`);
      const toDate = new Date(`${to}T00:00:00Z`);
      return Math.round((toDate.getTime() - fromDate.getTime()) / MS_PER_DAY);
    };

    if (isNewDay) {
      // Check if streak should continue or reset
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastCheckIn === yesterdayStr) {
        // Continue streak
        currentStreak += 1;
      } else if (lastCheckIn !== null) {
        const daysAway = calculateDaysAway(lastCheckIn, today);
        if (daysAway >= 7) {
          // Reset streak after a full break
          currentStreak = 1;
        } else {
          // Pause streak during short breaks
          currentStreak = Math.max(currentStreak, 1);
        }
      } else {
        // First check-in
        currentStreak = 1;
      }

      // Update longest streak if needed
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      totalCheckIns += 1;

      // Update or insert streak record
      await sql`
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_check_in, total_check_ins, updated_at)
        VALUES (${userId}, ${currentStreak}, ${longestStreak}, ${today}::DATE, ${totalCheckIns}, NOW())
        ON CONFLICT (user_id) 
        DO UPDATE SET
          current_streak = ${currentStreak},
          longest_streak = ${longestStreak},
          last_check_in = ${today}::DATE,
          total_check_ins = ${totalCheckIns},
          updated_at = NOW()
      `;
    }

    return NextResponse.json({
      success: true,
      streak: {
        current: currentStreak,
        longest: longestStreak,
        lastCheckIn: today,
        totalCheckIns,
      },
    });
  } catch (error) {
    console.error('[Streak Check-in] Error:', error);
    return NextResponse.json(
      { error: 'Failed to record check-in' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    try {
      const result = await sql`
        SELECT current_streak, longest_streak, last_check_in, total_check_ins
        FROM user_streaks
        WHERE user_id = ${userId}
      `;

      if (result.rows.length === 0) {
        return NextResponse.json({
          streak: {
            current: 0,
            longest: 0,
            lastCheckIn: null,
            totalCheckIns: 0,
          },
        });
      }

      const row = result.rows[0];
      return NextResponse.json({
        streak: {
          current: row.current_streak || 0,
          longest: row.longest_streak || 0,
          lastCheckIn: row.last_check_in
            ? new Date(row.last_check_in).toISOString().split('T')[0]
            : null,
          totalCheckIns: row.total_check_ins || 0,
        },
      });
    } catch (dbError: any) {
      // If table doesn't exist, return empty streak instead of error
      if (
        dbError?.code === '42P01' ||
        dbError?.message?.includes('does not exist')
      ) {
        console.warn(
          '[Streak] Table does not exist yet, returning empty streak',
        );
        return NextResponse.json({
          streak: {
            current: 0,
            longest: 0,
            lastCheckIn: null,
            totalCheckIns: 0,
          },
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('[Streak] Error fetching streak:', error);
    // Return empty streak instead of error so component can still render
    return NextResponse.json({
      streak: {
        current: 0,
        longest: 0,
        lastCheckIn: null,
        totalCheckIns: 0,
      },
    });
  }
}
