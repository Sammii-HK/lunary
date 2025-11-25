import { sql } from '@vercel/postgres';

export interface UsagePattern {
  date: string;
  tarotReadings: number;
  journalEntries: number;
  aiChats: number;
  rituals: number;
}

export interface TrendComparison {
  thisMonth: number;
  lastMonth: number;
  change: number;
  changePercent: number;
}

export async function getUsagePatterns(
  userId: string,
  month: number,
  year: number,
): Promise<UsagePattern[]> {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get tarot readings per day
    const tarotResult = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM tarot_readings
      WHERE user_id = ${userId}
        AND created_at >= ${startDateStr}::DATE
        AND created_at <= ${endDateStr}::DATE
        AND archived_at IS NULL
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Get journal entries per day (from collections)
    const journalResult = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM collections
      WHERE user_id = ${userId}
        AND category = 'journal'
        AND created_at >= ${startDateStr}::DATE
        AND created_at <= ${endDateStr}::DATE
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Get AI chat sessions per day
    const aiResult = await sql`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM ai_threads
      WHERE user_id = ${userId}
        AND created_at >= ${startDateStr}::DATE
        AND created_at <= ${endDateStr}::DATE
      GROUP BY DATE(created_at)
      ORDER BY date
    `;

    // Get ritual completions per day
    const ritualResult = await sql`
      SELECT habit_date as date, COUNT(*) as count
      FROM ritual_habits
      WHERE user_id = ${userId}
        AND habit_date >= ${startDateStr}::DATE
        AND habit_date <= ${endDateStr}::DATE
        AND completed = TRUE
      GROUP BY habit_date
      ORDER BY habit_date
    `;

    // Create a map of all dates in the month
    const patternsMap = new Map<string, UsagePattern>();
    for (
      let d = new Date(startDate);
      d <= endDate;
      d.setDate(d.getDate() + 1)
    ) {
      const dateStr = d.toISOString().split('T')[0];
      patternsMap.set(dateStr, {
        date: dateStr,
        tarotReadings: 0,
        journalEntries: 0,
        aiChats: 0,
        rituals: 0,
      });
    }

    // Fill in tarot readings
    tarotResult.rows.forEach((row) => {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      const pattern = patternsMap.get(dateStr);
      if (pattern) {
        pattern.tarotReadings = parseInt(row.count);
      }
    });

    // Fill in journal entries
    journalResult.rows.forEach((row) => {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      const pattern = patternsMap.get(dateStr);
      if (pattern) {
        pattern.journalEntries = parseInt(row.count);
      }
    });

    // Fill in AI chats
    aiResult.rows.forEach((row) => {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      const pattern = patternsMap.get(dateStr);
      if (pattern) {
        pattern.aiChats = parseInt(row.count);
      }
    });

    // Fill in rituals
    ritualResult.rows.forEach((row) => {
      const dateStr = new Date(row.date).toISOString().split('T')[0];
      const pattern = patternsMap.get(dateStr);
      if (pattern) {
        pattern.rituals = parseInt(row.count);
      }
    });

    return Array.from(patternsMap.values());
  } catch (error) {
    console.error('[Usage Patterns] Error:', error);
    return [];
  }
}

export async function getTrendComparison(
  userId: string,
  month: number,
  year: number,
  activityType: 'tarot' | 'journal' | 'ai' | 'rituals',
): Promise<TrendComparison> {
  try {
    const thisMonthStart = new Date(year, month - 1, 1);
    const thisMonthEnd = new Date(year, month, 0);
    const lastMonthStart = new Date(year, month - 2, 1);
    const lastMonthEnd = new Date(year, month - 1, 0);

    let thisMonthQuery;
    let lastMonthQuery;

    switch (activityType) {
      case 'tarot':
        thisMonthQuery = sql`
          SELECT COUNT(*) as count
          FROM tarot_readings
          WHERE user_id = ${userId}
            AND created_at >= ${thisMonthStart.toISOString().split('T')[0]}::DATE
            AND created_at <= ${thisMonthEnd.toISOString().split('T')[0]}::DATE
            AND archived_at IS NULL
        `;
        lastMonthQuery = sql`
          SELECT COUNT(*) as count
          FROM tarot_readings
          WHERE user_id = ${userId}
            AND created_at >= ${lastMonthStart.toISOString().split('T')[0]}::DATE
            AND created_at <= ${lastMonthEnd.toISOString().split('T')[0]}::DATE
            AND archived_at IS NULL
        `;
        break;
      case 'journal':
        thisMonthQuery = sql`
          SELECT COUNT(*) as count
          FROM collections
          WHERE user_id = ${userId}
            AND category = 'journal'
            AND created_at >= ${thisMonthStart.toISOString().split('T')[0]}::DATE
            AND created_at <= ${thisMonthEnd.toISOString().split('T')[0]}::DATE
        `;
        lastMonthQuery = sql`
          SELECT COUNT(*) as count
          FROM collections
          WHERE user_id = ${userId}
            AND category = 'journal'
            AND created_at >= ${lastMonthStart.toISOString().split('T')[0]}::DATE
            AND created_at <= ${lastMonthEnd.toISOString().split('T')[0]}::DATE
        `;
        break;
      case 'ai':
        thisMonthQuery = sql`
          SELECT COUNT(*) as count
          FROM ai_threads
          WHERE user_id = ${userId}
            AND created_at >= ${thisMonthStart.toISOString().split('T')[0]}::DATE
            AND created_at <= ${thisMonthEnd.toISOString().split('T')[0]}::DATE
        `;
        lastMonthQuery = sql`
          SELECT COUNT(*) as count
          FROM ai_threads
          WHERE user_id = ${userId}
            AND created_at >= ${lastMonthStart.toISOString().split('T')[0]}::DATE
            AND created_at <= ${lastMonthEnd.toISOString().split('T')[0]}::DATE
        `;
        break;
      case 'rituals':
        thisMonthQuery = sql`
          SELECT COUNT(*) as count
          FROM ritual_habits
          WHERE user_id = ${userId}
            AND habit_date >= ${thisMonthStart.toISOString().split('T')[0]}::DATE
            AND habit_date <= ${thisMonthEnd.toISOString().split('T')[0]}::DATE
            AND completed = TRUE
        `;
        lastMonthQuery = sql`
          SELECT COUNT(*) as count
          FROM ritual_habits
          WHERE user_id = ${userId}
            AND habit_date >= ${lastMonthStart.toISOString().split('T')[0]}::DATE
            AND habit_date <= ${lastMonthEnd.toISOString().split('T')[0]}::DATE
            AND completed = TRUE
        `;
        break;
    }

    const thisMonthResult = await thisMonthQuery;
    const lastMonthResult = await lastMonthQuery;

    const thisMonth = parseInt(thisMonthResult.rows[0]?.count || '0');
    const lastMonth = parseInt(lastMonthResult.rows[0]?.count || '0');
    const change = thisMonth - lastMonth;
    const changePercent =
      lastMonth > 0 ? Math.round((change / lastMonth) * 100) : 0;

    return {
      thisMonth,
      lastMonth,
      change,
      changePercent,
    };
  } catch (error) {
    console.error('[Trend Comparison] Error:', error);
    return {
      thisMonth: 0,
      lastMonth: 0,
      change: 0,
      changePercent: 0,
    };
  }
}

export async function getMostActiveDay(
  userId: string,
  month: number,
  year: number,
): Promise<string | null> {
  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Get activity counts per day
    const activityResult = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM (
        SELECT created_at FROM tarot_readings WHERE user_id = ${userId} AND created_at >= ${startDateStr}::DATE AND created_at <= ${endDateStr}::DATE AND archived_at IS NULL
        UNION ALL
        SELECT created_at FROM collections WHERE user_id = ${userId} AND category = 'journal' AND created_at >= ${startDateStr}::DATE AND created_at <= ${endDateStr}::DATE
        UNION ALL
        SELECT created_at FROM ai_threads WHERE user_id = ${userId} AND created_at >= ${startDateStr}::DATE AND created_at <= ${endDateStr}::DATE
      ) as activities
      GROUP BY DATE(created_at)
      ORDER BY count DESC
      LIMIT 1
    `;

    if (activityResult.rows.length === 0) {
      return null;
    }

    const date = new Date(activityResult.rows[0].date);
    const dayNames = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return dayNames[date.getDay()];
  } catch (error) {
    console.error('[Most Active Day] Error:', error);
    return null;
  }
}
