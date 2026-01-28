/**
 * Client-side cache for data with configurable expiration
 * Reduces API calls by caching data with time-based invalidation
 *
 * Cache Strategy:
 * - 'daily' (expires at midnight local time):
 *   - Daily tarot cards, horoscopes, insights
 *   - Spells for moon phases
 *   - Journal entries and patterns
 *   - Transit readings (the interpretation, not the data)
 *
 * - 'hourly' (expires after 2 hours):
 *   - Current moon phase data (from /api/cosmic/global)
 *   - Sky now / current planetary positions
 *   - Real-time astronomical calculations
 */

interface CacheEntry<T> {
  data: T;
  timestamp: string; // Date string (YYYY-MM-DD)
  expiresAt: number; // Unix timestamp
}

const CACHE_PREFIX = 'lunary_cache_';

export type CacheDuration = 'daily' | 'hourly';

export class DailyCache {
  /**
   * Get cached data if still valid
   */
  static get<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(CACHE_PREFIX + key);
      if (!cached) return null;

      const entry: CacheEntry<T> = JSON.parse(cached);

      // Check if cache is not expired
      if (Date.now() < entry.expiresAt) {
        return entry.data;
      }

      // Cache is stale, remove it
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    } catch (err) {
      console.error('[DailyCache] Error reading cache:', err);
      return null;
    }
  }

  /**
   * Set cached data with custom expiration
   * @param key Cache key
   * @param data Data to cache
   * @param duration 'daily' = expires at midnight local time, 'hourly' = expires in 2 hours
   */
  static set<T>(key: string, data: T, duration: CacheDuration = 'daily'): void {
    if (typeof window === 'undefined') return;

    try {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      let expiresAt: number;

      if (duration === 'hourly') {
        // Expire in 2 hours for "live" data
        expiresAt = now.getTime() + 2 * 60 * 60 * 1000;
      } else {
        // Expire at midnight local timezone for daily data
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        expiresAt = endOfDay.getTime();
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: today,
        expiresAt,
      };

      localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
    } catch (err) {
      console.error('[DailyCache] Error setting cache:', err);
    }
  }

  /**
   * Clear specific cache entry
   */
  static remove(key: string): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(CACHE_PREFIX + key);
  }

  /**
   * Clear all daily cache entries
   */
  static clear(): void {
    if (typeof window === 'undefined') return;

    try {
      Object.keys(localStorage)
        .filter((key) => key.startsWith(CACHE_PREFIX))
        .forEach((key) => localStorage.removeItem(key));
    } catch (err) {
      console.error('[DailyCache] Error clearing cache:', err);
    }
  }
}

/**
 * Wrap an async function with caching
 * @param key Cache key
 * @param fetchFn Function to fetch data
 * @param duration 'daily' = cache until midnight, 'hourly' = cache for 2 hours
 */
export function withDailyCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  duration: CacheDuration = 'daily',
): () => Promise<T> {
  return async () => {
    // Try to get from cache first
    const cached = DailyCache.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss, fetch fresh data
    const data = await fetchFn();
    DailyCache.set(key, data, duration);
    return data;
  };
}
