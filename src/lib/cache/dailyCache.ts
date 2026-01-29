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

/**
 * Get user's local date string (YYYY-MM-DD) in their timezone
 * CRITICAL: Must use local date, not UTC, so each user gets new content at their midnight
 *
 * Example: User in Tokyo (JST, UTC+9) at 11:30 PM on Dec 31st
 * - getLocalDateString() returns "2024-12-31" (their local date)
 * - new Date().toISOString() would return "2024-12-31T14:30:00.000Z" (UTC date, wrong!)
 *
 * This ensures:
 * - Daily tarot cards change at user's midnight, not server's midnight
 * - Daily crystals, insights change at user's local midnight
 * - Cache expires at user's end of day
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

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
      const today = getLocalDateString(now); // User's local date in their timezone

      let expiresAt: number;

      if (duration === 'hourly') {
        // Expire in 2 hours for "live" data
        expiresAt = now.getTime() + 2 * 60 * 60 * 1000;
      } else {
        // Expire at midnight in USER'S local timezone for daily data
        const endOfDay = new Date(now);
        endOfDay.setHours(23, 59, 59, 999);
        expiresAt = endOfDay.getTime();
      }

      const entry: CacheEntry<T> = {
        data,
        timestamp: today, // Stores user's local date
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
