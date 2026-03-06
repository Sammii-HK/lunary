/**
 * Content type performance tracking and ranking utilities.
 *
 * Queries video_performance grouped by content_type to produce rankings
 * that can dynamically adjust scheduling weights.
 */

export interface ContentTypeRanking {
  contentType: string;
  compositeScore: number;
  avgViews: number;
  avgLikes: number;
  avgComments: number;
  avgShares: number;
  avgSaves: number;
  sampleCount: number;
  trend: number; // positive = improving, negative = declining
}

/**
 * Get performance rankings for all content types over a rolling window.
 *
 * Composite score: views*0.3 + likes*1.0 + comments*3.0 + shares*2.0 + saves*1.5
 * Comments weighted highest as they're the primary TikTok algorithm signal.
 *
 * @param days - Rolling window in days (default 30)
 * @param minSamples - Minimum data points required per content type (default 3)
 */
export async function getContentTypeRankings(
  days: number = 30,
  minSamples: number = 3,
): Promise<ContentTypeRanking[]> {
  const { sql } = await import('@vercel/postgres');

  const result = await sql`
    SELECT
      content_type,
      (AVG(views) * 0.3 + AVG(likes) * 1.0 + AVG(comments) * 3.0 + AVG(shares) * 2.0 + AVG(saves) * 1.5) as composite_score,
      AVG(views) as avg_views,
      AVG(likes) as avg_likes,
      AVG(comments) as avg_comments,
      AVG(shares) as avg_shares,
      AVG(saves) as avg_saves,
      COUNT(*)::int as sample_count
    FROM video_performance
    WHERE content_type IS NOT NULL
      AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
    GROUP BY content_type
    HAVING COUNT(*) >= ${minSamples}
    ORDER BY composite_score DESC
  `;

  // Calculate trend: compare recent half vs older half
  const halfDays = Math.floor(days / 2);
  const trendResult = await sql`
    SELECT
      content_type,
      AVG(CASE WHEN recorded_at >= NOW() - INTERVAL '1 day' * ${halfDays} THEN views ELSE NULL END) as recent_avg,
      AVG(CASE WHEN recorded_at < NOW() - INTERVAL '1 day' * ${halfDays} THEN views ELSE NULL END) as older_avg
    FROM video_performance
    WHERE content_type IS NOT NULL
      AND recorded_at >= NOW() - INTERVAL '1 day' * ${days}
    GROUP BY content_type
  `;

  const trendMap = new Map<string, number>();
  for (const row of trendResult.rows) {
    const recent = Number(row.recent_avg) || 0;
    const older = Number(row.older_avg) || 0;
    trendMap.set(row.content_type, older > 0 ? (recent - older) / older : 0);
  }

  return result.rows.map((row) => ({
    contentType: row.content_type,
    compositeScore: Number(row.composite_score),
    avgViews: Number(row.avg_views),
    avgLikes: Number(row.avg_likes),
    avgComments: Number(row.avg_comments),
    avgShares: Number(row.avg_shares),
    avgSaves: Number(row.avg_saves),
    sampleCount: Number(row.sample_count),
    trend: trendMap.get(row.content_type) ?? 0,
  }));
}

/**
 * Convert rankings into scheduling weight multipliers.
 *
 * Top performers get up to 1.5x weight, bottom performers get 0.7x.
 * Content types with insufficient data get 1.0x (neutral).
 */
export async function getSchedulingWeightMultipliers(
  days: number = 30,
): Promise<Map<string, number>> {
  const rankings = await getContentTypeRankings(days);
  const weights = new Map<string, number>();

  if (rankings.length === 0) return weights;

  const maxScore = rankings[0].compositeScore;
  const minScore = rankings[rankings.length - 1].compositeScore;
  const range = maxScore - minScore;

  for (const ranking of rankings) {
    // Normalise to 0-1, then map to 0.7-1.5 weight range
    const normalised =
      range > 0 ? (ranking.compositeScore - minScore) / range : 0.5;
    const weight = 0.7 + normalised * 0.8;

    // Boost trending content types (positive trend adds up to +0.2)
    const trendBoost = Math.max(0, Math.min(0.2, ranking.trend * 0.3));

    weights.set(ranking.contentType, Math.min(1.5, weight + trendBoost));
  }

  return weights;
}
