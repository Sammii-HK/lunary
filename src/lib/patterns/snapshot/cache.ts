/**
 * Pattern caching utilities
 * Multi-layer caching strategy for optimal performance
 */

import { sql } from '@vercel/postgres';
import { decryptJSON } from '@/lib/encryption';

/**
 * Fetch pattern history from database
 * Simplified version without unstable_cache (use route-level caching instead)
 */
export async function getCachedPatternHistory(
  userId: string,
  patternType?: string,
  limit: number = 50,
) {
  // Build query conditionally based on whether patternType is provided
  const patternsResult = patternType
    ? await sql`
        SELECT pattern_type, pattern_data, generated_at
        FROM journal_patterns
        WHERE user_id = ${userId}
          AND pattern_type = ${patternType}
          AND expires_at > NOW()
        ORDER BY generated_at DESC
        LIMIT ${limit}
      `
    : await sql`
        SELECT pattern_type, pattern_data, generated_at
        FROM journal_patterns
        WHERE user_id = ${userId}
          AND pattern_type IN ('life_themes', 'tarot_season', 'archetype', 'tarot_moon_phase', 'emotion_moon_phase')
          AND expires_at > NOW()
        ORDER BY generated_at DESC
        LIMIT ${limit}
      `;

  const snapshotsWithMeta = [];
  for (const row of patternsResult.rows) {
    const encryptedString = row.pattern_data.encrypted;
    if (encryptedString) {
      try {
        const decrypted = decryptJSON(encryptedString);
        snapshotsWithMeta.push({
          type: row.pattern_type,
          generatedAt: row.generated_at,
          data: decrypted,
        });
      } catch (error) {
        console.error('Failed to decrypt pattern:', error);
        // Skip corrupted patterns
      }
    }
  }

  // Group by pattern type
  const grouped: Record<string, any[]> = {};
  for (const snapshot of snapshotsWithMeta) {
    if (!grouped[snapshot.type]) {
      grouped[snapshot.type] = [];
    }
    grouped[snapshot.type].push(snapshot);
  }

  // Count by type
  const byType = Object.entries(grouped).map(([type, items]) => ({
    type,
    count: items.length,
  }));

  return {
    totalSnapshots: snapshotsWithMeta.length,
    byType,
    snapshots: grouped,
  };
}

/**
 * Fetch current snapshots from database
 * Gets the most recent snapshot for each pattern type
 */
export async function getCachedCurrentSnapshots(userId: string) {
  // Get the most recent snapshot for each type
  const result = await sql`
    WITH ranked_patterns AS (
      SELECT
        pattern_type,
        pattern_data,
        generated_at,
        ROW_NUMBER() OVER (
          PARTITION BY pattern_type
          ORDER BY generated_at DESC
        ) as rn
      FROM journal_patterns
      WHERE user_id = ${userId}
        AND pattern_type IN ('life_themes', 'tarot_season', 'archetype', 'tarot_moon_phase', 'emotion_moon_phase')
        AND expires_at > NOW()
    )
    SELECT pattern_type, pattern_data, generated_at
    FROM ranked_patterns
    WHERE rn = 1
  `;

  const current: Record<string, any> = {};

  for (const row of result.rows) {
    const encryptedString = row.pattern_data.encrypted;
    if (encryptedString) {
      try {
        const decrypted = decryptJSON(encryptedString);
        current[row.pattern_type] = {
          type: row.pattern_type,
          generatedAt: row.generated_at,
          data: decrypted,
        };
      } catch (error) {
        console.error('Failed to decrypt current pattern:', error);
      }
    }
  }

  return current;
}

/**
 * Invalidate pattern cache for a user
 * Note: Cache invalidation happens automatically via time-based expiration (1 hour)
 * Users can also manually refresh using the refresh button in the UI
 */
export function invalidatePatternCache(userId: string) {
  // Note: We rely on time-based cache expiration instead of manual invalidation
  // to avoid Server Component/Client Component boundary issues.
  // Cache expires after 1 hour (server-side) and 1 hour (client-side).
  // Users can manually refresh via the UI button.

  console.log(
    `[Cache] Pattern update for user ${userId} - cache will expire after 1 hour`,
  );
}

/**
 * Client-side cache utilities
 */
export const ClientCache = {
  /**
   * Get cache key for pattern data
   */
  getKey: (userId: string, type?: string) => {
    return `lunary_patterns_${userId}${type ? `_${type}` : ''}`;
  },

  /**
   * Get cached data from sessionStorage
   */
  get: <T>(key: string, maxAge: number = 3600000): T | null => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = sessionStorage.getItem(key);
      if (!cached) return null;

      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;

      // Check if cache is still valid
      if (age > maxAge) {
        sessionStorage.removeItem(key);
        return null;
      }

      return data as T;
    } catch (error) {
      console.error('Cache read error:', error);
      return null;
    }
  },

  /**
   * Set cached data in sessionStorage
   */
  set: (key: string, data: any): void => {
    if (typeof window === 'undefined') return;

    try {
      sessionStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error('Cache write error:', error);
      // Silently fail - sessionStorage might be full or disabled
    }
  },

  /**
   * Clear cached data
   */
  clear: (key: string): void => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(key);
  },

  /**
   * Clear all pattern caches
   */
  clearAll: (userId: string): void => {
    if (typeof window === 'undefined') return;

    const keys = Object.keys(sessionStorage);
    const prefix = `lunary_patterns_${userId}`;

    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        sessionStorage.removeItem(key);
      }
    });
  },
};
