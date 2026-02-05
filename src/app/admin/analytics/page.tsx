'use client';

import { useEffect, useState } from 'react';
import {
  CalendarRange,
  Download,
  Loader2,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAnalyticsData } from '@/hooks/useAnalyticsData';
import { useAnalyticsComputations } from '@/hooks/useAnalyticsComputations';
import { SnapshotTab } from '@/components/admin/analytics/SnapshotTab';
import { OperationalTab } from '@/components/admin/analytics/OperationalTab';

export default function AnalyticsPage() {
  const analyticsData = useAnalyticsData();
  const computedMetrics = useAnalyticsComputations(analyticsData);

  const {
    startDate,
    endDate,
    granularity,
    includeAudit,
    loading,
    error,
    showExportMenu,
    showProductSeries,
    setStartDate,
    setEndDate,
    setGranularity,
    setIncludeAudit,
    setShowExportMenu,
    setShowProductSeries,
    fetchAnalytics,
    exportMenuRef,
  } = analyticsData;

  const { wauWindowStart, mauWindowStart, chartSeries } = computedMetrics;

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
    <div className='mx-auto max-w-7xl space-y-8 px-4 py-6'>
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
          <div className='flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2'>
            <CalendarRange className='h-4 w-4 text-zinc-400' />
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='bg-transparent text-sm text-zinc-200 outline-none'
            />
            <span className='text-zinc-500'>to</span>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='bg-transparent text-sm text-zinc-200 outline-none'
            />
          </div>

          {/* Granularity Selector */}
          <select
            value={granularity}
            onChange={(e) =>
              setGranularity(e.target.value as 'day' | 'week' | 'month')
            }
            className='rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 text-sm text-zinc-200 outline-none'
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
                className='absolute right-0 top-full z-10 mt-2 w-48 rounded-lg border border-zinc-800 bg-zinc-900 p-2 shadow-lg'
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
            onClick={fetchAnalytics}
            disabled={loading}
            className='gap-2'
          >
            {loading ? (
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
      {error && (
        <div className='rounded-xl border border-lunary-error-700/40 bg-lunary-error-950/40 px-4 py-3 text-sm text-lunary-error-200'>
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-lunary-primary' />
        </div>
      )}

      {/* Main Content */}
      {!loading && (
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as Tab)}
          className='space-y-6'
        >
          <TabsList className='rounded-xl border border-zinc-800/40 bg-zinc-900/20 p-1'>
            <TabsTrigger
              value='snapshot'
              className='rounded-lg px-4 py-2 text-sm'
            >
              Snapshot
            </TabsTrigger>
            <TabsTrigger
              value='details'
              className='rounded-lg px-4 py-2 text-sm'
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
