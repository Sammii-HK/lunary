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
import { AuthComponent } from '@/components/Auth';
import { useAuthStatus } from '@/components/AuthStatus';
import { useAnalyticsDataSWR } from '@/hooks/useAnalyticsDataSWR';
import { useAnalyticsComputations } from '@/hooks/useAnalyticsComputations';
import { SnapshotTab } from '@/components/admin/analytics/SnapshotTab';
import { OperationalTab } from '@/components/admin/analytics/OperationalTab';
import { AcquisitionTab } from '@/components/admin/analytics/AcquisitionTab';
import { AnalyticsDashboardSkeleton } from '@/components/admin/analytics/AnalyticsSkeleton';
import { BrandedPageLoader } from '@/components/states/BrandedPageLoader';
import { formatDateInput } from '@/lib/analytics/utils';

const DEFAULT_RANGE_DAYS = 30;

type AdminAnalyticsAuthState =
  | { status: 'checking' }
  | { status: 'signed-out'; details?: string }
  | { status: 'authorized' }
  | { status: 'denied'; details: string };

export default function AnalyticsPage() {
  const authState = useAuthStatus();
  const [adminAuth, setAdminAuth] = useState<AdminAnalyticsAuthState>({
    status: 'checking',
  });
  const [authWaitExpired, setAuthWaitExpired] = useState(false);

  useEffect(() => {
    if (!authState.loading) {
      setAuthWaitExpired(false);
      return;
    }

    const timeout = window.setTimeout(() => {
      setAuthWaitExpired(true);
    }, 6000);

    return () => window.clearTimeout(timeout);
  }, [authState.loading]);

  useEffect(() => {
    if (authState.loading) {
      setAdminAuth({ status: 'checking' });
      return;
    }

    if (!authState.isAuthenticated) {
      setAdminAuth({
        status: 'signed-out',
        details: 'Sign in with your Lunary admin account to continue.',
      });
      return;
    }

    let cancelled = false;

    const verifyAdmin = async () => {
      setAdminAuth({ status: 'checking' });

      const adminEmails = (
        process.env.NEXT_PUBLIC_ADMIN_EMAILS ||
        process.env.NEXT_PUBLIC_ADMIN_EMAIL ||
        ''
      )
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      if (adminEmails.length === 0) {
        if (!cancelled) {
          setAdminAuth({
            status: 'denied',
            details:
              'Set NEXT_PUBLIC_ADMIN_EMAILS in .env.local before loading analytics.',
          });
        }
        return;
      }

      try {
        const response = await fetch('/api/auth/get-user-email', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (response.status === 401) {
          if (!cancelled) {
            setAdminAuth({
              status: 'signed-out',
              details: 'Your admin session expired. Sign in again to continue.',
            });
          }
          return;
        }

        if (!response.ok) {
          throw new Error(`Session check failed with ${response.status}`);
        }

        const result = (await response.json()) as { email?: string };
        const email = result.email?.toLowerCase();

        if (email && adminEmails.includes(email)) {
          if (!cancelled) setAdminAuth({ status: 'authorized' });
          return;
        }

        if (!cancelled) {
          setAdminAuth({
            status: 'denied',
            details: email
              ? `Add "${email}" to NEXT_PUBLIC_ADMIN_EMAILS to enable analytics access.`
              : 'We could not verify your admin email. Sign in again.',
          });
        }
      } catch (error) {
        if (!cancelled) {
          setAdminAuth({
            status: 'denied',
            details:
              error instanceof Error
                ? error.message
                : 'Unable to verify admin access.',
          });
        }
      }
    };

    verifyAdmin();

    return () => {
      cancelled = true;
    };
  }, [authState.isAuthenticated, authState.loading]);

  if (authState.loading && authWaitExpired) {
    return (
      <AdminAnalyticsSignIn
        details='Session check is taking too long. Sign in again to continue.'
        onSuccess={authState.refreshAuth}
      />
    );
  }

  if (authState.loading || adminAuth.status === 'checking') {
    return <BrandedPageLoader message='Checking admin session...' />;
  }

  if (adminAuth.status === 'signed-out') {
    return (
      <AdminAnalyticsSignIn
        details={adminAuth.details}
        onSuccess={authState.refreshAuth}
      />
    );
  }

  if (adminAuth.status === 'denied') {
    return <AdminAnalyticsDenied details={adminAuth.details} />;
  }

  return <AnalyticsDashboardContent />;
}

function AdminAnalyticsSignIn({
  details,
  onSuccess,
}: {
  details?: string;
  onSuccess: () => void;
}) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-surface-base px-4 py-10 text-content-primary'>
      <div className='w-full max-w-xl space-y-6'>
        <div className='space-y-3 text-center'>
          <p className='text-xs uppercase tracking-[0.4em] text-content-primary/50'>
            Analytics
          </p>
          <h1 className='text-3xl font-light tracking-tight'>
            Sign in to continue
          </h1>
          <p className='text-sm text-content-primary/70'>
            {details ||
              'Use your Lunary admin account before loading analytics data.'}
          </p>
        </div>
        <div className='rounded-3xl border border-white/10 bg-surface-base/70 p-6 shadow-2xl backdrop-blur-2xl'>
          <AuthComponent onSuccess={onSuccess} />
        </div>
      </div>
    </div>
  );
}

function AdminAnalyticsDenied({ details }: { details: string }) {
  return (
    <div className='flex min-h-screen items-center justify-center bg-surface-base px-4 py-10 text-content-primary'>
      <div className='max-w-md space-y-3 text-center'>
        <p className='text-xs uppercase tracking-[0.4em] text-content-primary/50'>
          Analytics
        </p>
        <h1 className='text-2xl font-semibold text-lunary-error-200'>
          Access denied
        </h1>
        <p className='text-sm text-content-muted'>{details}</p>
      </div>
    </div>
  );
}

function AnalyticsDashboardContent() {
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

  const VALID_TABS = ['snapshot', 'details', 'acquisition'] as const;
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
    <div className='mx-auto w-full max-w-7xl space-y-8 px-4 py-6'>
      {/* Header */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-content-primary'>
            Analytics Dashboard
          </h1>
          <p className='mt-1 text-sm text-content-muted'>
            Monitor user engagement, retention, and growth metrics
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          {/* Date Range Picker */}
          <div className='flex w-full flex-col gap-2 rounded-lg border border-stroke-subtle bg-surface-elevated/40 px-3 py-2 sm:w-auto sm:flex-row sm:items-center'>
            <CalendarRange className='hidden h-4 w-4 text-content-muted sm:block' />
            <input
              type='date'
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className='min-w-0 flex-1 bg-transparent text-sm text-content-primary outline-none sm:flex-none'
            />
            <span className='hidden text-content-muted sm:inline'>to</span>
            <input
              type='date'
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className='min-w-0 flex-1 bg-transparent text-sm text-content-primary outline-none sm:flex-none'
            />
          </div>

          {/* Granularity Selector */}
          <select
            value={granularity}
            onChange={(e) =>
              setGranularity(e.target.value as 'day' | 'week' | 'month')
            }
            className='w-full rounded-lg border border-stroke-subtle bg-surface-elevated/40 px-3 py-2 text-sm text-content-primary outline-none sm:w-auto'
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
                className='absolute right-0 top-full z-10 mt-2 w-44 max-w-[calc(100vw-2rem)] rounded-lg border border-stroke-subtle bg-surface-elevated p-2 shadow-lg sm:w-48'
              >
                <button
                  onClick={handleExportCsv}
                  className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-content-primary hover:bg-surface-card'
                >
                  <Download className='h-4 w-4' />
                  Export CSV
                </button>
                <button
                  onClick={handleExportJson}
                  className='flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-content-primary hover:bg-surface-card'
                >
                  <Download className='h-4 w-4' />
                  Export JSON
                </button>
                <div className='my-2 border-t border-stroke-subtle' />
                <label className='flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-content-primary hover:bg-surface-card'>
                  <input
                    type='checkbox'
                    checked={showProductSeries}
                    onChange={(e) => setShowProductSeries(e.target.checked)}
                    className='rounded border-stroke-strong'
                  />
                  Show product series
                </label>
                <label className='flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-sm text-content-primary hover:bg-surface-card'>
                  <input
                    type='checkbox'
                    checked={includeAudit}
                    onChange={(e) => setIncludeAudit(e.target.checked)}
                    className='rounded border-stroke-strong'
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
      <div className='text-xs text-content-muted'>
        WAU window: {wauWindowStart} to {endDate} | MAU window: {mauWindowStart}{' '}
        to {endDate}
      </div>

      {/* Error Display */}
      {analyticsData.error && (
        <div className='rounded-xl border border-lunary-error-700/40 bg-layer-deep/40 px-4 py-3 text-sm text-lunary-error-200'>
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
          <TabsList className='w-full rounded-xl border border-stroke-subtle/40 bg-surface-elevated/20 p-1'>
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
            <TabsTrigger
              value='acquisition'
              className='rounded-lg px-4 py-2 text-xs sm:text-sm'
            >
              Acquisition
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

          <TabsContent value='acquisition'>
            <AcquisitionTab
              startDate={startDate}
              endDate={endDate}
              active={activeTab === 'acquisition'}
            />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
