import { sql } from '@vercel/postgres';
import { UserLevel } from './types';

/**
 * Calculate user's engagement level based on data signals
 * Level 0 (Ambient): New or low-data users (< 3 journal entries, < 3 tarot pulls)
 * Level 1 (Reflection Support): Light interaction (3-10 entries/pulls, no patterns)
 * Level 2 (Pattern Awareness): Consistent users (10+ entries, recurring cards/themes, streaks)
 * Level 3 (Integrative Insight): High-trust users (sustained journaling + tarot + rituals + time)
 */
export async function calculateUserLevel(userId: string): Promise<UserLevel> {
  try {
    // Count journal entries
    const journalCount = await sql`
      SELECT COUNT(*) as count
      FROM collections
      WHERE user_id = ${userId}
    AND category IN ('journal', 'dream', 'ritual')
    `;
    const journalEntries = parseInt(journalCount.rows[0]?.count || '0', 10);

    // Count tarot readings
    const tarotCount = await sql`
      SELECT COUNT(*) as count
      FROM tarot_readings
      WHERE user_id = ${userId}
      AND archived_at IS NULL
    `;
    const tarotReadings = parseInt(tarotCount.rows[0]?.count || '0', 10);

    // Check for streaks
    const streakResult = await sql`
      SELECT current_streak, longest_streak
      FROM user_streaks
      WHERE user_id = ${userId}
    `;
    const currentStreak = streakResult.rows[0]?.current_streak || 0;
    const longestStreak = streakResult.rows[0]?.longest_streak || 0;

    // Check for patterns (recurring cards/themes)
    const patternResult = await sql`
      SELECT COUNT(*) as count
      FROM journal_patterns
      WHERE user_id = ${userId}
      AND expires_at > NOW()
    `;
    const hasPatterns = parseInt(patternResult.rows[0]?.count || '0', 10) > 0;

    // Check for rituals (recent ritual activity)
    const ritualResult = await sql`
      SELECT COUNT(*) as count
      FROM collections
      WHERE user_id = ${userId}
      AND category = 'ritual'
      AND created_at > NOW() - INTERVAL '30 days'
    `;
    const recentRituals = parseInt(ritualResult.rows[0]?.count || '0', 10);

    // Level 0: New or low-data users
    if (journalEntries < 3 && tarotReadings < 3) {
      return 0;
    }

    // Level 1: Light interaction
    if (
      (journalEntries < 10 && tarotReadings < 10) ||
      (!hasPatterns && currentStreak < 7)
    ) {
      return 1;
    }

    // Level 2: Consistent users with patterns or streaks
    if (
      (journalEntries >= 10 || tarotReadings >= 10) &&
      (hasPatterns || currentStreak >= 7 || longestStreak >= 14)
    ) {
      return 2;
    }

    // Level 3: High-trust users with sustained activity
    if (
      journalEntries >= 20 &&
      tarotReadings >= 10 &&
      (currentStreak >= 14 || longestStreak >= 30) &&
      recentRituals >= 2
    ) {
      return 3;
    }

    // Default to level 2 if we have good data but don't meet level 3 criteria
    if (journalEntries >= 10 || tarotReadings >= 10) {
      return 2;
    }

    // Default to level 1 if we have some data
    return 1;
  } catch (error) {
    console.error('[Daily Thread] Error calculating user level:', error);
    // Default to level 0 on error (safest)
    return 0;
  }
}
