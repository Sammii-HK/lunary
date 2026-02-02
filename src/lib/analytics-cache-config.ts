// Cache TTLs for different types of analytics data
// These use HTTP Cache-Control headers to avoid redundant DB queries

// Default cache for most analytics (4 hours)
export const ANALYTICS_CACHE_TTL_SECONDS = 14400;

// No cache for real-time metrics like DAU/WAU/MAU
export const ANALYTICS_REALTIME_TTL_SECONDS = 0;

// Historical data like cohorts - longer cache (1 day)
export const ANALYTICS_HISTORICAL_TTL_SECONDS = 86400;
