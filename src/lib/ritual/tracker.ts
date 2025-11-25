import { sql } from '@vercel/postgres';

export type RitualType = 'morning' | 'evening' | 'daily';

export interface RitualCompletion {
  userId: string;
  ritualType: RitualType;
  date: string; // YYYY-MM-DD format
  metadata?: Record<string, any>;
}

export async function completeRitual({
  userId,
  ritualType,
  date,
  metadata,
}: RitualCompletion): Promise<{
  success: boolean;
  ritualStreak: number;
  longestRitualStreak: number;
}> {
  try {
    // Mark ritual as completed
    await sql`
      INSERT INTO ritual_habits (user_id, habit_date, ritual_type, completed, completion_time, metadata, updated_at)
      VALUES (${userId}, ${date}::DATE, ${ritualType}, TRUE, NOW(), ${metadata ? JSON.stringify(metadata) : null}::JSONB, NOW())
      ON CONFLICT (user_id, habit_date, ritual_type)
      DO UPDATE SET
        completed = TRUE,
        completion_time = NOW(),
        metadata = COALESCE(ritual_habits.metadata, '{}'::jsonb) || COALESCE(${metadata ? JSON.stringify(metadata) : null}::JSONB, '{}'::jsonb),
        updated_at = NOW()
    `;

    // Get or create user streak record
    const streakResult = await sql`
      SELECT ritual_streak, longest_ritual_streak, last_ritual_date
      FROM user_streaks
      WHERE user_id = ${userId}
    `;

    let ritualStreak = 0;
    let longestRitualStreak = 0;
    let lastRitualDate: string | null = null;

    if (streakResult.rows.length > 0) {
      const row = streakResult.rows[0];
      ritualStreak = row.ritual_streak || 0;
      longestRitualStreak = row.longest_ritual_streak || 0;
      lastRitualDate = row.last_ritual_date
        ? new Date(row.last_ritual_date).toISOString().split('T')[0]
        : null;
    }

    // Calculate if this is a new day
    const isNewDay = lastRitualDate !== date;

    if (isNewDay) {
      // Check if ritual streak should continue or reset
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Check if user completed a ritual yesterday
      const yesterdayRitual = await sql`
        SELECT COUNT(*) as count
        FROM ritual_habits
        WHERE user_id = ${userId}
          AND habit_date = ${yesterdayStr}::DATE
          AND completed = TRUE
      `;

      const hadRitualYesterday =
        parseInt(yesterdayRitual.rows[0]?.count || '0') > 0;

      if (lastRitualDate === yesterdayStr && hadRitualYesterday) {
        // Continue ritual streak
        ritualStreak += 1;
      } else if (lastRitualDate !== null) {
        // Ritual streak broken, reset to 1
        ritualStreak = 1;
      } else {
        // First ritual completion
        ritualStreak = 1;
      }

      // Update longest ritual streak if needed
      if (ritualStreak > longestRitualStreak) {
        longestRitualStreak = ritualStreak;
      }

      // Update user_streaks record
      await sql`
        INSERT INTO user_streaks (user_id, ritual_streak, longest_ritual_streak, last_ritual_date, updated_at)
        VALUES (${userId}, ${ritualStreak}, ${longestRitualStreak}, ${date}::DATE, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          ritual_streak = ${ritualStreak},
          longest_ritual_streak = ${longestRitualStreak},
          last_ritual_date = ${date}::DATE,
          updated_at = NOW()
      `;
    }

    // Ritual completion contributes to overall streak
    // Call the check-in function to update overall streak
    await sql`
      INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_check_in, total_check_ins, updated_at)
      VALUES (${userId}, 1, 1, ${date}::DATE, 1, NOW())
      ON CONFLICT (user_id)
      DO UPDATE SET
        last_check_in = GREATEST(user_streaks.last_check_in, ${date}::DATE),
        updated_at = NOW()
    `;

    // Update overall streak if needed (similar logic to check-in)
    const overallStreakResult = await sql`
      SELECT current_streak, longest_streak, last_check_in
      FROM user_streaks
      WHERE user_id = ${userId}
    `;

    if (overallStreakResult.rows.length > 0) {
      const row = overallStreakResult.rows[0];
      let currentStreak = row.current_streak || 0;
      let longestStreak = row.longest_streak || 0;
      const lastCheckIn = row.last_check_in
        ? new Date(row.last_check_in).toISOString().split('T')[0]
        : null;

      const isNewDayForStreak = lastCheckIn !== date;

      if (isNewDayForStreak) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastCheckIn === yesterdayStr) {
          currentStreak += 1;
        } else if (lastCheckIn !== null) {
          currentStreak = 1;
        } else {
          currentStreak = 1;
        }

        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
        }

        await sql`
          UPDATE user_streaks
          SET current_streak = ${currentStreak},
              longest_streak = ${longestStreak},
              last_check_in = ${date}::DATE,
              updated_at = NOW()
          WHERE user_id = ${userId}
        `;
      }
    }

    return {
      success: true,
      ritualStreak,
      longestRitualStreak,
    };
  } catch (error) {
    console.error('[Ritual Tracker] Error completing ritual:', error);
    throw error;
  }
}

export async function getRitualStatus(
  userId: string,
  date: string,
): Promise<{
  morning: boolean;
  evening: boolean;
  ritualStreak: number;
  longestRitualStreak: number;
}> {
  try {
    const result = await sql`
      SELECT ritual_type, completed
      FROM ritual_habits
      WHERE user_id = ${userId}
        AND habit_date = ${date}::DATE
    `;

    const morning = result.rows.some(
      (row) => row.ritual_type === 'morning' && row.completed === true,
    );
    const evening = result.rows.some(
      (row) => row.ritual_type === 'evening' && row.completed === true,
    );

    const streakResult = await sql`
      SELECT ritual_streak, longest_ritual_streak
      FROM user_streaks
      WHERE user_id = ${userId}
    `;

    const ritualStreak = streakResult.rows[0]?.ritual_streak || 0;
    const longestRitualStreak =
      streakResult.rows[0]?.longest_ritual_streak || 0;

    return {
      morning,
      evening,
      ritualStreak,
      longestRitualStreak,
    };
  } catch (error) {
    console.error('[Ritual Tracker] Error getting ritual status:', error);
    return {
      morning: false,
      evening: false,
      ritualStreak: 0,
      longestRitualStreak: 0,
    };
  }
}
