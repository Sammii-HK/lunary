'use client';

import { useEffect, useState } from 'react';
import { useAstronomyContext } from '@/context/AstronomyContext';

/**
 * A safer version of useAstronomyContext that:
 * 1. Retries fetching context if initially unavailable
 * 2. Tracks loading state
 * 3. Provides explicit error state
 *
 * Use this in components where astronomy data is critical but might
 * load asynchronously or have initialization delays.
 */
export function useSafeAstronomyContext() {
  const context = useAstronomyContext();
  const [retryCount, setRetryCount] = useState(0);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if we have real context data (not fallback)
    const hasRealData =
      context.currentAstrologicalChart.length > 0 ||
      context.currentMoonPosition !== undefined ||
      context.generalTransits !== undefined;

    if (hasRealData) {
      setIsReady(true);
    } else if (retryCount < 3) {
      // Retry up to 3 times with exponential backoff
      const timeout = setTimeout(
        () => {
          setRetryCount((prev) => prev + 1);
        },
        Math.pow(2, retryCount) * 1000,
      );

      return () => clearTimeout(timeout);
    }
  }, [context, retryCount]);

  return {
    ...context,
    isReady,
    isUsingFallback: !isReady && retryCount >= 3,
  };
}

/**
 * Type guard to check if astronomy context has real data
 */
export function hasAstronomyData(
  context: ReturnType<typeof useAstronomyContext>,
): boolean {
  return (
    context.currentAstrologicalChart.length > 0 ||
    context.currentMoonPosition !== undefined
  );
}
