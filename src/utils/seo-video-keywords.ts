/**
 * SEO-driven keyword suggestions for TikTok video captions.
 *
 * Queries search_console_data for high-performing queries related to a topic
 * and converts them into hashtags for video content.
 */

export interface SeoKeyword {
  query: string;
  impressions: number;
  clicks: number;
  position: number;
}

/**
 * Get top SEO queries matching a topic, sorted by impressions.
 *
 * Uses ILIKE for case-insensitive partial matching against the query column.
 * Falls back to an empty array if the search_console_data table doesn't exist.
 *
 * @param topic - Topic to match against (e.g. "mercury retrograde")
 * @param limit - Max results to return (default 10)
 */
export async function getSeoKeywordsForTopic(
  topic: string,
  limit: number = 10,
): Promise<SeoKeyword[]> {
  try {
    const { sql } = await import('@vercel/postgres');

    const pattern = `%${topic}%`;

    const result = await sql`
      SELECT
        query,
        SUM(impressions)::int AS impressions,
        SUM(clicks)::int AS clicks,
        ROUND(AVG(position)::numeric, 1) AS position
      FROM search_console_data
      WHERE query ILIKE ${pattern}
      GROUP BY query
      ORDER BY impressions DESC
      LIMIT ${limit}
    `;

    return result.rows.map((row) => ({
      query: row.query,
      impressions: Number(row.impressions),
      clicks: Number(row.clicks),
      position: Number(row.position),
    }));
  } catch {
    // Table may not exist yet; fail gracefully
    return [];
  }
}

/**
 * Convert top SEO queries for a topic into TikTok-style hashtags.
 *
 * Strips spaces, lowercases, and prefixes with #.
 * e.g. "mercury retrograde 2026" -> "#mercuryretrograde2026"
 *
 * @param topic - Topic to match against
 * @param limit - Max hashtags to return (default 10)
 */
export async function buildSeoHashtags(
  topic: string,
  limit: number = 10,
): Promise<string[]> {
  const keywords = await getSeoKeywordsForTopic(topic, limit);

  return keywords.map((kw) => {
    const tag = kw.query.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `#${tag}`;
  });
}
