import { useEffect, useState } from 'react';
import { BirthChartPlacement } from '@/context/UserContext';
import {
  calculateAge,
  ProgressedChart,
  enhanceProgressedChart,
} from '@/utils/astrology/secondary-progressions';

interface ProgressedChartData {
  progressedChart: BirthChartPlacement[];
  enhancedChart: ProgressedChart[];
  progressedDate: string;
  currentAge: number;
  loading: boolean;
  error: Error | null;
}

/**
 * Fetch and enhance progressed chart data
 * Uses caching to minimize API calls
 */
export function useProgressedChart(
  birthDate?: string,
  natalChart?: BirthChartPlacement[],
): ProgressedChartData {
  const [progressedChart, setProgressedChart] = useState<BirthChartPlacement[]>(
    [],
  );
  const [progressedDate, setProgressedDate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!birthDate) {
      setProgressedChart([]);
      setProgressedDate('');
      return;
    }

    const fetchProgressedChart = async () => {
      try {
        setLoading(true);
        setError(null);

        const currentAge = calculateAge(birthDate);

        // Check localStorage cache first
        const cacheKey = `progressedChart_${currentAge}`;
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            const { progressedChart: cachedChart, progressedDate: cachedDate } =
              JSON.parse(cached);
            setProgressedChart(cachedChart);
            setProgressedDate(cachedDate);
            return;
          } catch {
            // Cache corrupt, continue to fetch
          }
        }

        const response = await fetch(
          `/api/profile/birth-chart/progressions?age=${currentAge}`,
        );

        if (!response.ok) {
          throw new Error('Failed to fetch progressed chart');
        }

        const data = await response.json();
        setProgressedChart(data.progressedChart);
        setProgressedDate(data.progressedDate);

        // Cache the result
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            progressedChart: data.progressedChart,
            progressedDate: data.progressedDate,
          }),
        );
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        setProgressedChart([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressedChart();
  }, [birthDate]);

  const currentAge = birthDate ? calculateAge(birthDate) : 0;
  const enhancedChart =
    natalChart && progressedChart.length > 0
      ? enhanceProgressedChart(progressedChart, natalChart)
      : [];

  return {
    progressedChart,
    enhancedChart,
    progressedDate,
    currentAge,
    loading,
    error,
  };
}
