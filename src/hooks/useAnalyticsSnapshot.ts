'use client';

import useSWR from 'swr';
import { formatDateInput } from '@/lib/analytics/utils';
import type { ConsolidatedSnapshot } from '@/lib/analytics/snapshot-extractors';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

// Re-export the consolidated type for consumers
export type AnalyticsSnapshot = ConsolidatedSnapshot;

interface UseAnalyticsSnapshotOptions {
  startDate?: string;
  endDate?: string;
}

/**
 * Fast analytics hook using single snapshot endpoint
 * Loads in <100ms instead of 30s
 */
export function useAnalyticsSnapshot(
  options: UseAnalyticsSnapshotOptions = {},
) {
  const today = new Date();
  const defaultEnd = formatDateInput(today);
  const defaultStart = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - 29);
    return formatDateInput(d);
  })();

  const startDate = options.startDate || defaultStart;
  const endDate = options.endDate || defaultEnd;

  const { data, error, isLoading, mutate } = useSWR<AnalyticsSnapshot>(
    `/api/admin/analytics/snapshot?start_date=${startDate}&end_date=${endDate}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000, // 1 minute
    },
  );

  return {
    data,
    error,
    isLoading,
    refresh: mutate,
    startDate,
    endDate,
  };
}
