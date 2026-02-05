import { sql } from '@vercel/postgres';
import { UserLevel } from './types';

/**
 * Safely query a count, returning 0 on error instead of crashing the whole calculation
 */
async function safeCount(
  query: Promise<{ rows: Array<Record<string, unknown>> }>,
): Promise<number> {
  try {
    const result = await query;
    return parseInt((result.rows[0]?.count as string) || '0', 10);
  } catch (error) {
    console.warn('[Daily Thread] Query failed, defaulting to 0:', error);
    return 0;
  }
}

/**
 * Calculate user's engagement level based on data signals
 * Level 0 (Ambient): New or low-data users (< 3 journal entries AND < 3 tarot pulls)
 * Level 1 (Reflection Support): Some data but not yet consistent
 * Level 2 (Pattern Awareness): Consistent users (10+ entries, patterns/streaks)
 * Level 3 (Integrative Insight): High-trust users (sustained journaling + tarot + rituals + time)
 *
 * Checks from highest level down. Each level's conditions are self-contained.
 */
export async function calculateUserLevel(userId: string): Promise<UserLevel> {
  // Run all queries in parallel, each independently fault-tolerant
  const [
    journalEntries,
    tarotReadings,
    streakData,
    hasPatterns,
    recentRituals,
  ] = await Promise.all([
    // Journal + dream entries (not counting 'ritual' category here since ritual_habits is separate)
    safeCount(sql`
      SELECT COUNT(*) as count
      FROM collections
      WHERE user_id = ${userId}
      AND category IN ('journal', 'dream')
    `),

    // Tarot readings (all non-archived, including daily pulls for level purposes)
    safeCount(sql`
      SELECT COUNT(*) as count
      FROM tarot_readings
      WHERE user_id = ${userId}
      AND archived_at IS NULL
    `),

    // Streaks - fetch row directly with error handling
    (async () => {
      try {
        const result = await sql`
          SELECT current_streak, longest_streak
          FROM user_streaks
          WHERE user_id = ${userId}
        `;
        return {
          current: (result.rows[0]?.current_streak as number) || 0,
          longest: (result.rows[0]?.longest_streak as number) || 0,
        };
      } catch {
        return { current: 0, longest: 0 };
      }
    })(),

    // Active patterns
    (async () => {
      try {
        const result = await sql`
          SELECT COUNT(*) as count
          FROM journal_patterns
          WHERE user_id = ${userId}
          AND expires_at > NOW()
        `;
        return parseInt((result.rows[0]?.count as string) || '0', 10) > 0;
      } catch {
        return false;
      }
    })(),

    // Recent rituals from ritual_habits (the actual tracker, not collections)
    (async () => {
      try {
        const result = await sql`
          SELECT COUNT(*) as count
          FROM ritual_habits
          WHERE user_id = ${userId}
          AND completed = TRUE
          AND created_at > NOW() - INTERVAL '30 days'
        `;
        return parseInt((result.rows[0]?.count as string) || '0', 10);
      } catch {
        // Fallback: check collections table
        try {
          const fallback = await sql`
            SELECT COUNT(*) as count
            FROM collections
            WHERE user_id = ${userId}
            AND category = 'ritual'
            AND created_at > NOW() - INTERVAL '30 days'
          `;
          return parseInt((fallback.rows[0]?.count as string) || '0', 10);
        } catch {
          return 0;
        }
      }
    })(),
  ]);

  const { current: currentStreak, longest: longestStreak } = streakData;

  // Check from highest level down — each level is self-contained

  // Level 3: High-trust users with sustained activity across all vectors
  if (
    journalEntries >= 20 &&
    tarotReadings >= 10 &&
    (currentStreak >= 14 || longestStreak >= 30) &&
    recentRituals >= 2
  ) {
    return 3;
  }

  // Level 2: Consistent users with meaningful data AND engagement signals
  if (
    (journalEntries >= 10 || tarotReadings >= 10) &&
    (hasPatterns || currentStreak >= 7 || longestStreak >= 14)
  ) {
    return 2;
  }

  // Level 1: Has some data (at least 3 journal entries OR 3 tarot readings)
  if (journalEntries >= 3 || tarotReadings >= 3) {
    return 1;
  }

  // Level 0: New or very low-data user
  return 0;
}
