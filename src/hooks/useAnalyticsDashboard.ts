'use client';

import useSWR from 'swr';

// Generic fetcher for SWR
const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch ${url}`);
  }
  return res.json();
};

// Manual refresh only; this dashboard fans out to analytics queries and should
// not keep Neon compute warm in a background tab.
const SWR_CONFIG = {
  refreshInterval: 0,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
  dedupingInterval: 5 * 60 * 1000,
};

export interface DashboardMetrics {
  date: string;
  dau: number;
  wau: number;
  mau: number;
  productDau: number;
  productWau?: number;
  productMau: number;
  signups: number;
  activationRate?: number;
  mrr: number;
  stickiness: number;
  activeSubscriptions?: number;
  trialSubscriptions?: number;
  isLive?: boolean;
  featureAdoption?: {
    dashboard: number;
    horoscope: number;
    tarot: number;
    chart: number;
    guide: number;
    ritual: number;
  };
}

export interface DashboardResponse {
  dateRange: {
    start: string;
    end: string;
  };
  summary: {
    mau: number;
    mrr: number;
    totalSignups: number;
    stickiness: number;
  };
  timeseries: DashboardMetrics[];
  dataSource: {
    historical: number;
    live: number;
    message: string;
  };
}

export interface UseAnalyticsDashboardOptions {
  startDate: string;
  endDate: string;
}

export function useAnalyticsDashboard(options: UseAnalyticsDashboardOptions) {
  const { startDate, endDate } = options;

  const queryParams = `start_date=${startDate}&end_date=${endDate}`;

  const { data, error, isLoading } = useSWR<DashboardResponse>(
    `/api/admin/analytics/dashboard?${queryParams}`,
    fetcher,
    SWR_CONFIG,
  );

  return {
    data,
    summary: data?.summary || null,
    timeseries: data?.timeseries || [],
    dataSource: data?.dataSource || null,
    loading: isLoading,
    error: error ? 'Failed to load dashboard metrics' : null,
  };
}
