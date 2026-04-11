import { useEffect, useState } from 'react';
import type {
  CurrentDashaState,
  DashaPeriod,
} from '@utils/astrology/vedic-dasha';

interface UseDashaTimelineReturn {
  currentDasha: CurrentDashaState | null;
  upcomingPeriods: DashaPeriod[];
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch and cache dasha timeline data
 * Similar to useProgressedChart but for Vedic dasha system
 *
 * @param birthday - User's birth date (ISO string or Date)
 * @param moonDegree - Natal Moon position in degrees
 * @returns Current dasha state, upcoming periods, and loading/error states
 */
export function useDashaTimeline(
  birthday?: string,
  moonDegree?: number,
): UseDashaTimelineReturn {
  const [currentDasha, setCurrentDasha] = useState<CurrentDashaState | null>(
    null,
  );
  const [upcomingPeriods, setUpcomingPeriods] = useState<DashaPeriod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!birthday || moonDegree === undefined) {
      setCurrentDasha(null);
      setUpcomingPeriods([]);
      return;
    }

    const fetchDashaData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Check localStorage cache first
        // Cache key includes moonDegree to invalidate if chart is recalculated
        const cacheKey = `dashaTimeline_${birthday}_${moonDegree.toFixed(2)}`;
        const cached = localStorage.getItem(cacheKey);

        if (cached) {
          try {
            const {
              currentDasha: cachedDasha,
              upcomingPeriods: cachedUpcoming,
            } = JSON.parse(cached);
            setCurrentDasha(cachedDasha);
            setUpcomingPeriods(cachedUpcoming);
            return;
          } catch {
            // Cache corrupt, continue to fetch
          }
        }

        // Fetch from API
        const params = new URLSearchParams({
          birthday,
          moonDegree: moonDegree.toString(),
        });

        const response = await fetch(
          `/api/profile/birth-chart/dasha?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch dasha timeline');
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setCurrentDasha(data.currentDasha);
        setUpcomingPeriods(data.upcomingPeriods);

        // Cache the result
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            currentDasha: data.currentDasha,
            upcomingPeriods: data.upcomingPeriods,
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setCurrentDasha(null);
        setUpcomingPeriods([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashaData();
  }, [birthday, moonDegree]);

  return {
    currentDasha,
    upcomingPeriods,
    loading,
    error,
  };
}
