'use client';

import useSWR from 'swr';
import { formatDateInput } from '@/lib/analytics/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export interface AnalyticsSnapshot {
  source: 'hybrid' | 'snapshot';
  snapshot_date: string;
  range: { start: Date; end: Date };

  // Core engagement
  dau: number;
  wau: number;
  mau: number;
  signed_in_product_dau: number;
  signed_in_product_wau: number;
  signed_in_product_mau: number;
  app_opened_mau: number;

  // Stickiness
  stickiness: number;
  stickiness_dau_mau: number;
  stickiness_wau_mau: number;
  avg_active_days_per_week: number;

  // Growth
  new_signups: number;
  activated_users: number;
  activation_rate: number;

  // Revenue
  mrr: number;
  active_subscriptions: number;
  trial_subscriptions: number;
  new_conversions: number;

  // Feature adoption
  feature_adoption: {
    dashboard: number;
    horoscope: number;
    tarot: number;
    chart: number;
    guide: number;
    ritual: number;
  };

  is_realtime_dau: boolean;
}

interface UseAnalyticsSnapshotOptions {
  startDate?: string;
  endDate?: string;
}

/**
 * Fast analytics hook using single snapshot endpoint
 * Loads in <1s instead of 30s
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
