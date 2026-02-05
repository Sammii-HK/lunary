import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';

/**
 * GET /api/debug/user-level
 * Show all data used to calculate daily thread level for debugging
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Collect all data points independently (don't let one failure kill the rest)
    const results: Record<string, unknown> = { userId: user.id };

    // Journal entries by category
    try {
      const journalResult = await sql`
        SELECT category, COUNT(*) as count
        FROM collections
        WHERE user_id = ${user.id}
        GROUP BY category
        ORDER BY count DESC
      `;
      results.collections = journalResult.rows;
      results.totalJournalDreamRitual = journalResult.rows
        .filter((r) =>
          ['journal', 'dream', 'ritual'].includes(r.category as string),
        )
        .reduce((sum, r) => sum + parseInt(r.count as string, 10), 0);
    } catch (e) {
      results.collectionsError = (e as Error).message;
    }

    // Tarot readings
    try {
      const tarotResult = await sql`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE jsonb_array_length(cards) > 1) as spreads,
          COUNT(*) FILTER (WHERE jsonb_array_length(cards) = 1) as daily_pulls,
          COUNT(*) FILTER (WHERE archived_at IS NOT NULL) as archived
        FROM tarot_readings
        WHERE user_id = ${user.id}
      `;
      results.tarotReadings = tarotResult.rows[0];
      results.tarotCountForLevel = parseInt(
        tarotResult.rows[0]?.total as string,
        10,
      );
    } catch (e) {
      results.tarotError = (e as Error).message;
    }

    // Streaks
    try {
      const streakResult = await sql`
        SELECT *
        FROM user_streaks
        WHERE user_id = ${user.id}
      `;
      results.streaks = streakResult.rows[0] || null;
      results.hasStreakRow = streakResult.rows.length > 0;
    } catch (e) {
      results.streaksError = (e as Error).message;
    }

    // Journal patterns
    try {
      const patternResult = await sql`
        SELECT COUNT(*) as total,
               COUNT(*) FILTER (WHERE expires_at > NOW()) as active,
               COUNT(*) FILTER (WHERE expires_at <= NOW()) as expired
        FROM journal_patterns
        WHERE user_id = ${user.id}
      `;
      results.journalPatterns = patternResult.rows[0];
      results.hasActivePatterns =
        parseInt(patternResult.rows[0]?.active as string, 10) > 0;
    } catch (e) {
      results.journalPatternsError = (e as Error).message;
    }

    // Ritual habits (the ACTUAL ritual tracker)
    try {
      const ritualResult = await sql`
        SELECT
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE completed = TRUE) as completed,
          COUNT(*) FILTER (WHERE completed = TRUE AND created_at > NOW() - INTERVAL '30 days') as recent_completed
        FROM ritual_habits
        WHERE user_id = ${user.id}
      `;
      results.ritualHabits = ritualResult.rows[0];
    } catch (e) {
      results.ritualHabitsError = (e as Error).message;
    }

    // Collections with category='ritual' (what level calc currently checks)
    try {
      const ritualCollResult = await sql`
        SELECT COUNT(*) as count
        FROM collections
        WHERE user_id = ${user.id}
        AND category = 'ritual'
        AND created_at > NOW() - INTERVAL '30 days'
      `;
      results.ritualCollections30d = parseInt(
        ritualCollResult.rows[0]?.count as string,
        10,
      );
    } catch (e) {
      results.ritualCollectionsError = (e as Error).message;
    }

    // Cached daily thread modules for today
    try {
      const today = new Date().toISOString().split('T')[0];
      const modulesResult = await sql`
        SELECT modules_json, created_at, updated_at
        FROM daily_thread_modules
        WHERE user_id = ${user.id}
        AND date = ${today}::DATE
      `;
      if (modulesResult.rows.length > 0) {
        const modules = modulesResult.rows[0].modules_json as Array<{
          type: string;
          level: number;
          title: string;
        }>;
        results.cachedModules = {
          date: today,
          createdAt: modulesResult.rows[0].created_at,
          updatedAt: modulesResult.rows[0].updated_at,
          modules: modules.map((m) => ({
            type: m.type,
            level: m.level,
            title: m.title,
          })),
        };
      } else {
        results.cachedModules = null;
      }
    } catch (e) {
      results.cachedModulesError = (e as Error).message;
    }

    // User progress table
    try {
      const progressResult = await sql`
        SELECT skill_tree, current_level, total_actions
        FROM user_progress
        WHERE user_id = ${user.id}
      `;
      results.userProgress = progressResult.rows;
    } catch (e) {
      results.userProgressError = (e as Error).message;
    }

    // Calculate level
    try {
      const { calculateUserLevel } = await import('@/lib/daily-thread/levels');
      const level = await calculateUserLevel(user.id);
      results.calculatedLevel = level;
    } catch (e) {
      results.levelError = (e as Error).message;
    }

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('[Debug User Level] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch debug data' },
      { status: 500 },
    );
  }
}
