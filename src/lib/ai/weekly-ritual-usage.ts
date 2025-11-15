import { sql } from '@vercel/postgres';

const getWeekStart = (date: Date = new Date()): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const weekStart = new Date(d.setDate(diff));
  weekStart.setHours(0, 0, 0, 0);
  return weekStart.toISOString().split('T')[0];
};

export async function getWeeklyRitualUsage(
  userId: string,
  now: Date = new Date(),
): Promise<{ used: number; limit: number }> {
  const weekStart = getWeekStart(now);

  try {
    const result = await sql`
      SELECT ritual_count
      FROM weekly_ritual_usage
      WHERE user_id = ${userId}
      AND week_start = ${weekStart}::date
    `;

    const used = result.rows[0]?.ritual_count || 0;
    return { used, limit: 1 };
  } catch (error) {
    console.error('[Weekly Ritual Usage] Error fetching usage:', error);
    return { used: 0, limit: 1 };
  }
}

export async function incrementWeeklyRitualUsage(
  userId: string,
  now: Date = new Date(),
): Promise<{ success: boolean; used: number; limit: number }> {
  const weekStart = getWeekStart(now);

  try {
    const result = await sql`
      INSERT INTO weekly_ritual_usage (user_id, week_start, ritual_count)
      VALUES (${userId}, ${weekStart}::date, 1)
      ON CONFLICT (user_id, week_start)
      DO UPDATE SET
        ritual_count = weekly_ritual_usage.ritual_count + 1,
        updated_at = NOW()
      RETURNING ritual_count
    `;

    const used = result.rows[0]?.ritual_count || 0;
    return { success: true, used, limit: 1 };
  } catch (error) {
    console.error('[Weekly Ritual Usage] Error incrementing usage:', error);
    return { success: false, used: 0, limit: 1 };
  }
}

export function isRitualRequest(message: string): boolean {
  const ritualKeywords = [
    'ritual',
    'give me a ritual',
    'ritual based on',
    'ritual for',
    'create a ritual',
    'ritual generator',
  ];
  const content = message.toLowerCase();
  return ritualKeywords.some((keyword) => content.includes(keyword));
}
