/**
 * Cache utility functions for optimizing API responses
 * Implements smart caching strategies based on data update frequency
 */

/**
 * Calculate seconds until next midnight in a given timezone
 * Used for daily content that resets at midnight (tarot, horoscope, rituals)
 *
 * @param timezone - IANA timezone string (e.g., 'Europe/London', 'America/New_York')
 * @returns Seconds until midnight in that timezone
 */
export function getSecondsUntilMidnight(timezone = 'Europe/London'): number {
  const now = new Date();

  // Get current time in the specified timezone
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(now);
  const getPart = (type: string) =>
    parts.find((p) => p.type === type)?.value || '0';

  // Current time in target timezone
  const currentInTz = new Date(
    `${getPart('year')}-${getPart('month')}-${getPart('day')}T${getPart('hour')}:${getPart('minute')}:${getPart('second')}`,
  );

  // Next midnight in target timezone
  const midnightInTz = new Date(currentInTz);
  midnightInTz.setDate(midnightInTz.getDate() + 1);
  midnightInTz.setHours(0, 0, 0, 0);

  // Convert back to UTC for comparison
  const currentUtc = now.getTime();
  const midnightUtc =
    midnightInTz.getTime() - (currentInTz.getTime() - currentUtc);

  return Math.floor((midnightUtc - currentUtc) / 1000);
}

/**
 * Generate cache headers for daily content (resets at midnight in user's timezone)
 * Use for: tarot cards, horoscopes, rituals, daily influences
 *
 * @param timezone - IANA timezone string (defaults to London for Celeste)
 */
export function getDailyCacheHeaders(
  timezone = 'Europe/London',
): Record<string, string> {
  const secondsUntilMidnight = getSecondsUntilMidnight(timezone);

  // Ensure minimum cache time of 1 hour to prevent excessive revalidation
  const cacheTime = Math.max(secondsUntilMidnight, 3600);

  return {
    'Cache-Control': `public, s-maxage=${cacheTime}, stale-while-revalidate=3600`,
  };
}

/**
 * Generate cache headers for frequently updating content
 * Use for: moon position, current planetary positions
 */
export function getHourlyCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800', // 1 hour cache, 30 min stale
  };
}

/**
 * Generate cache headers for static/slow-changing content
 * Use for: birth charts, user profiles, reference data
 */
export function getStaticCacheHeaders(): Record<string, string> {
  return {
    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200', // 24 hour cache, 12 hour stale
  };
}

/**
 * Calculate Next.js revalidate time for daily content
 * Returns seconds until midnight for ISR
 */
export function getDailyRevalidateTime(timezone = 'Europe/London'): number {
  return Math.max(getSecondsUntilMidnight(timezone), 3600); // Minimum 1 hour
}
