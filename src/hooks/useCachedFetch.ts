import { useState, useEffect } from 'react';
import { DailyCache, CacheDuration } from '@/lib/cache/dailyCache';

/**
 * Hook to fetch data with caching
 * Returns cached data if available, otherwise fetches from API
 * @param cacheKey Unique cache key
 * @param fetchFn Function to fetch data
 * @param duration 'daily' = cache until midnight, 'hourly' = cache for 2 hours
 * @param dependencies Dependencies that trigger refetch
 */
export function useCachedFetch<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  duration: CacheDuration = 'daily',
  dependencies: any[] = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        // Check cache first
        const cached = DailyCache.get<T>(cacheKey);
        if (cached && isMounted) {
          setData(cached);
          setLoading(false);
          return;
        }

        // Cache miss, fetch from API
        setLoading(true);
        const result = await fetchFn();

        if (isMounted) {
          DailyCache.set(cacheKey, result, duration);
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, ...dependencies]);

  return { data, loading, error };
}
