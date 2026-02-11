'use client';

import { useEffect, useRef, useState } from 'react';
import {
  CalendarRange,
  Download,
  Loader2,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsDataSWR } from '@/hooks/useAnalyticsDataSWR';
import { useAnalyticsComputations } from '@/hooks/useAnalyticsComputations';
import { SnapshotTab } from '@/components/admin/analytics/SnapshotTab';
import { OperationalTab } from '@/components/admin/analytics/OperationalTab';
import { AnalyticsDashboardSkeleton } from '@/components/admin/analytics/AnalyticsSkeleton';
import { formatDateInput } from '@/lib/analytics/utils';

const DEFAULT_RANGE_DAYS = 30;

export default function AnalyticsPage() {
  const today = new Date();
  const defaultEnd = formatDateInput(today);
  const defaultStart = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() - (DEFAULT_RANGE_DAYS - 1));
    return formatDateInput(d);
  })();

  // Date & UI state (owned by the page component)
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>(
    'day',
  );
  const [includeAudit, setIncludeAudit] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showProductSeries, setShowProductSeries] = useState(false);
  const [insightTypeFilter, setInsightTypeFilter] = useState<string>('all');
  const [insightCategoryFilter, setInsightCategoryFilter] =
    useState<string>('all');
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const VALID_TABS = ['snapshot', 'details'] as const;
  type Tab = (typeof VALID_TABS)[number];

  const [activeTab, setActiveTab] = useState<Tab>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as Tab;
      if (VALID_TABS.includes(hash)) return hash;
    }
    return 'snapshot';
  });

  useEffect(() => {
    window.location.hash = activeTab;
  }, [activeTab]);

  // SWR-based data fetching — Tier 2 endpoints only load when Operational tab is active
  const swrData = useAnalyticsDataSWR({
    startDate,
    endDate,
    granularity,
    includeAudit,
    operationalTabActive: activeTab === 'details',
  });

  // Compose the analyticsData object for downstream components
  const analyticsData = {
    ...swrData,
    startDate,
    endDate,
    granularity,
    includeAudit,
    showExportMenu,
    showProductSeries,
    insightTypeFilter,
    insightCategoryFilter,
    setStartDate,
    setEndDate,
    setGranularity,
    setIncludeAudit,
    setShowExportMenu,
    setShowProductSeries,
    setInsightTypeFilter,
    setInsightCategoryFilter,
    fetchAnalytics: swrData.refresh,
    exportMenuRef,
  };

  const computedMetrics = useAnalyticsComputations(analyticsData);
  const { wauWindowStart, mauWindowStart } = computedMetrics;

  // Close export menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportMenuRef.current &&
        !exportMenuRef.current.contains(e.target as Node)
      ) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  const handleExportInsights = () => {
    const insightsJson = JSON.stringify(analyticsData.insights, null, 2);
    const blob = new Blob([insightsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lunary-insights-${startDate}-${endDate}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = async () => {
    try {
      const res = await fetch(
        `/api/admin/analytics/export?start_date=${startDate}&end_date=${endDate}&format=csv`,
      );
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lunary-analytics-${startDate}-${endDate}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
    setShowExportMenu(false);
  };

  const handleExportJson = async () => {
    try {
      const res = await fetch(
        `/api/admin/analytics/export?start_date=${startDate}&end_date=${endDate}&format=json`,
      );
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lunary-analytics-${startDate}-${endDate}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
    setShowExportMenu(false);
  };

  return (
    <div className='mx-auto max-w-7xl space-y-8 overflow-x-hidden px-4 py-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-white'>
            Analytics Dashboard
          </h1>
          <p className='mt-1 text-sm text-zinc-400'>
            Monitor user engagement, retention, and growth metrics
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {/* Date Range Picker */}
          <div className='flex w-full flex-col gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 sm:w-auto sm:flex-row sm:items-center'>
            <CalendarRange className='hidden h-4 w-4 text-zinc-400 sm:block' />
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none sm:flex-none'
            />
            <span className='hidden text-zinc-500 sm:inline'>to</span>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='min-w-0 flex-1 bg-transparent text-sm text-zinc-200 outline-none sm:flex-none'
            />
          </div>

          {/* Granularity Selector */}
          <select
            value={granularity}
            onChange={(e) =>
              setGranularity(e.target.value as 'day' | 'week' | 'month')
            }
            className='w-full rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 outline-none sm:w-auto'
          >
            <option value='day'>Daily</option>
            <option value='week'>Weekly</option>
            <option value='month'>Monthly</option>
          </select>

          {/* Settings Dropdown */}
          <div className='relative'>
            <Button
              variant='ghost'
              size='sm'
              className='gap-2'
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Settings className='h-4 w-4' />
            </Button>
            {showExportMenu && (
              <div
                ref={exportMenuRef}
                className='absolute right-0 top-full z-10 mt-2 w-44 max-w-[calc(100vw-2rem)] rounded-lg border border-zinc-800 bg-zinc-900 p-2 shadow-lg sm:w-48'
              >
                <button
                  onClick={handleExportCsv}
                  className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800'
                >
                  <Download className='h-4 w-4' />
                  Export CSV
                </button>
                <button
                  onClick={handleExportJson}
                  className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800'
                >
                  <Download className='h-4 w-4' />
                  Export JSON
                </button>
                <div className='my-2 border-t border-zinc-800' />
                <label className='flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
                  <input
                    type='checkbox'
                    checked={showProductSeries}
                    onChange={(e) => setShowProductSeries(e.target.checked)}
                    className='rounded border-zinc-600'
                  />
                  Show product series
                </label>
                <label className='flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800'>
                  <input
                    type='checkbox'
                    checked={includeAudit}
                    onChange={(e) => setIncludeAudit(e.target.checked)}
                    className='rounded border-zinc-600'
                  />
                  Show audit data
                </label>
              </div>
            )}
          </div>

          {/* Refresh Button */}
          <Button
            variant='outline'
            size='sm'
            onClick={swrData.refresh}
            disabled={swrData.loading}
            className='gap-2'
          >
            {swrData.loading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <RefreshCw className='h-4 w-4' />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Window Info */}
      <div className='text-xs text-zinc-500'>
        WAU window: {wauWindowStart} to {endDate} | MAU window: {mauWindowStart}{' '}
        to {endDate}
      </div>

      {/* Error Display */}
      {analyticsData.error && (
        <div className='rounded-xl border border-lunary-error-700/40 bg-lunary-error-950/40 px-4 py-3 text-sm text-lunary-error-200'>
          {analyticsData.error}
        </div>
      )}

      {/* Loading State */}
      {swrData.loading && <AnalyticsDashboardSkeleton />}

      {/* Main Content */}
      {!swrData.loading && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as Tab)}
          className='space-y-6'
        >
          <TabsList className='w-full rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-1'>
            <TabsTrigger
              value='snapshot'
              className='rounded-lg px-4 py-2 text-xs sm:text-sm'
            >
              Investor Snapshot
            </TabsTrigger>
            <TabsTrigger
              value='details'
              className='rounded-lg px-4 py-2 text-xs sm:text-sm'
            >
              Operational Details
            </TabsTrigger>
          </TabsList>

          <TabsContent value='snapshot'>
            <SnapshotTab
              data={analyticsData}
              computed={computedMetrics}
              handleExportInsights={handleExportInsights}
            />
          </TabsContent>

          <TabsContent value='details'>
            <OperationalTab data={analyticsData} computed={computedMetrics} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
