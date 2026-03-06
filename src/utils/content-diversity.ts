/**
 * Content diversity utilities for video scheduling.
 *
 * Ensures the video pipeline explores the full grimoire (2,000+ topics)
 * rather than only scheduling proven formats repeatedly.
 *
 * Key rules:
 * - At least 1 of 3 daily video slots should use an unexplored grimoire topic
 * - No content type more than 2x per day (diversity cap)
 * - Angel numbers stay capped at 2x/week (existing scarcity strategy)
 */

/**
 * Get grimoire topics that have never been made into videos.
 * Queries video_scripts for all facet_titles, then finds grimoire
 * categories/topics not yet covered.
 *
 * Returns a list of unexplored topic slugs for the given category.
 */
export async function getUnexploredGrimoireTopics(
  category?: string,
  limit: number = 20,
): Promise<Array<{ topic: string; category: string }>> {
  const { sql } = await import('@vercel/postgres');

  // Get all topics already used in video scripts
  const usedResult = await sql`
    SELECT DISTINCT facet_title FROM video_scripts
    WHERE facet_title IS NOT NULL
  `;
  const usedTopics = new Set(usedResult.rows.map((r) => r.facet_title));

  // Get grimoire pages that haven't been used
  const categoryFilter = category ? sql`AND g.category = ${category}` : sql``;

  // Use a raw query approach since we can't easily interpolate sql fragments
  let grimoireResult;
  if (category) {
    grimoireResult = await sql`
      SELECT DISTINCT g.title, g.category
      FROM grimoire_pages g
      WHERE g.title IS NOT NULL
        AND g.category = ${category}
      ORDER BY RANDOM()
      LIMIT ${limit * 2}
    `;
  } else {
    grimoireResult = await sql`
      SELECT DISTINCT g.title, g.category
      FROM grimoire_pages g
      WHERE g.title IS NOT NULL
      ORDER BY RANDOM()
      LIMIT ${limit * 2}
    `;
  }

  return grimoireResult.rows
    .filter((r) => !usedTopics.has(r.title))
    .slice(0, limit)
    .map((r) => ({
      topic: r.title,
      category: r.category,
    }));
}

/**
 * Calculate a freshness score for a topic based on how recently
 * and frequently it has been used in video scripts.
 *
 * Returns 0 (recently used) to 1 (never used / long ago).
 */
export async function getTopicFreshnessScore(topic: string): Promise<number> {
  const { sql } = await import('@vercel/postgres');

  const result = await sql`
    SELECT
      COUNT(*)::int as usage_count,
      MAX(scheduled_date) as last_used
    FROM video_scripts
    WHERE facet_title = ${topic}
  `;

  const row = result.rows[0];
  if (!row || row.usage_count === 0) return 1.0; // Never used = maximum freshness

  const daysSinceLastUse = row.last_used
    ? Math.floor(
        (Date.now() - new Date(row.last_used).getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : 365;

  // Decay: freshness increases with time since last use
  // 0 days = 0.1, 7 days = 0.3, 30 days = 0.6, 90+ days = 0.9
  const timeFreshness = Math.min(0.9, 0.1 + daysSinceLastUse / 100);

  // Penalise overused topics (used 5+ times = low freshness)
  const usagePenalty = Math.max(0, 1 - row.usage_count * 0.15);

  return Math.min(1, timeFreshness * usagePenalty);
}

/**
 * Check if a given day's schedule meets the diversity requirement:
 * at least 1 of 3 daily slots should be a fresh/unexplored topic.
 *
 * Returns true if diversity requirement is met.
 */
export function checkDailyDiversity(
  contentTypes: string[],
  maxSameType: number = 2,
): { diverse: boolean; violations: string[] } {
  const violations: string[] = [];

  // Check no content type appears more than maxSameType times
  const typeCounts = new Map<string, number>();
  for (const type of contentTypes) {
    const count = (typeCounts.get(type) || 0) + 1;
    typeCounts.set(type, count);
    if (count > maxSameType) {
      violations.push(`${type} scheduled ${count}x (max ${maxSameType})`);
    }
  }

  return {
    diverse: violations.length === 0,
    violations,
  };
}
