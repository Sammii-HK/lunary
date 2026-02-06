// Cache TTLs for different types of analytics data
// These use HTTP Cache-Control headers + Next.js revalidate to avoid redundant DB queries

// Real-time metrics (DAU/WAU/MAU, daily metrics) - refresh every 5 minutes
export const ANALYTICS_REALTIME_TTL_SECONDS = 300; // 5 minutes

// Default cache for most analytics (user growth, conversions) - 30 minutes
export const ANALYTICS_CACHE_TTL_SECONDS = 1800; // 30 minutes

// Historical data like cohorts, long-term trends - longer cache (4 hours)
export const ANALYTICS_HISTORICAL_TTL_SECONDS = 14400; // 4 hours

// Static/rarely changing data - 1 day
export const ANALYTICS_STATIC_TTL_SECONDS = 86400; // 24 hours

// Snapshot data (pre-computed, only changes at end of day) - 23 hours
export const ANALYTICS_SNAPSHOT_TTL_SECONDS = 82800; // 23 hours

/**
 * Get appropriate cache TTL based on whether query includes today's data
 * - If includes today: short TTL (real-time DAU can change)
 * - If historical only: long TTL (snapshots won't change until next cron run)
 */
export function getAnalyticsCacheTTL(includesToday: boolean): number {
  return includesToday
    ? ANALYTICS_REALTIME_TTL_SECONDS
    : ANALYTICS_SNAPSHOT_TTL_SECONDS;
}
