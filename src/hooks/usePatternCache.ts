/**
 * Custom hook for client-side pattern caching
 * Provides automatic caching with sessionStorage
 */

import { useState, useEffect, useCallback } from 'react';
import { ClientCache } from '@/lib/patterns/snapshot/cache';

interface UsePatternsOptions {
  userId?: string;
  patternType?: string;
  limit?: number;
  currentOnly?: boolean;
  cacheMaxAge?: number; // milliseconds
}

interface PatternResponse {
  success: boolean;
  totalSnapshots: number;
  byType: Array<{
    type: string;
    count: number;
  }>;
  snapshots: Record<string, any[]>;
  cached?: boolean;
}

export function usePatternCache(options: UsePatternsOptions = {}) {
  const {
    patternType,
    limit = 50,
    currentOnly = false,
    cacheMaxAge = 3600000, // 1 hour default
  } = options;

  const [data, setData] = useState<PatternResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFromCache, setIsFromCache] = useState(false);

  // Generate cache key
  const cacheKey = `lunary_patterns${patternType ? `_${patternType}` : ''}${currentOnly ? '_current' : ''}`;

  // Fetch patterns from API
  const fetchPatterns = useCallback(
    async (skipCache = false) => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to get from cache first (unless skipCache is true)
        // Only access cache on client-side (avoid SSR issues)
        if (!skipCache && typeof window !== 'undefined') {
          const cached = ClientCache.get<PatternResponse>(
            cacheKey,
            cacheMaxAge,
          );
          if (cached) {
            setData(cached);
            setIsFromCache(true);
            setIsLoading(false);
            return;
          }
        }

        // Build query params
        const params = new URLSearchParams();
        if (patternType) params.set('type', patternType);
        if (limit) params.set('limit', limit.toString());
        if (currentOnly) params.set('current', 'true');

        // Fetch from API
        const response = await fetch(`/api/patterns/history?${params}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch patterns: ${response.statusText}`);
        }

        const result: PatternResponse = await response.json();

        // Save to cache (only on client-side)
        if (typeof window !== 'undefined') {
          ClientCache.set(cacheKey, result);
        }

        setData(result);
        setIsFromCache(false);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    },
    [cacheKey, cacheMaxAge, patternType, limit, currentOnly],
  );

  // Refresh (bypass cache)
  const refresh = useCallback(() => {
    ClientCache.clear(cacheKey);
    return fetchPatterns(true);
  }, [cacheKey, fetchPatterns]);

  // Clear cache
  const clearCache = useCallback(() => {
    ClientCache.clear(cacheKey);
  }, [cacheKey]);

  // Initial fetch (only on client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchPatterns();
    }
  }, [fetchPatterns]);

  return {
    data,
    isLoading,
    error,
    isFromCache,
    refresh,
    clearCache,
  };
}
