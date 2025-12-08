'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  MessageCircle,
  RefreshCcw,
  SortAsc,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { InsightCard, InsightSource } from '@/components/InsightCard';
import { ShareInsightForm } from '@/components/ShareInsightForm';

type SortOrder = 'newest' | 'oldest';

interface Insight {
  id: number;
  insight_text: string;
  created_at?: string | null;
  source?: InsightSource | null;
}

export interface MoonCircleInsightsProps {
  moonCircleId: number;
  moonPhase: string;
  date?: string | null;
  insightCount?: number;
  initialInsights?: Insight[];
  initialTotal?: number;
  pageSize?: number;
  defaultSort?: SortOrder;
  collapsedByDefault?: boolean;
  showShareForm?: boolean;
  autoFocusShareForm?: boolean;
  autoFetch?: boolean;
  className?: string;
}

const formatDate = (value?: string | null) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export function MoonCircleInsights({
  moonCircleId,
  moonPhase,
  date,
  insightCount,
  initialInsights = [],
  initialTotal,
  pageSize = 3,
  defaultSort = 'newest',
  collapsedByDefault = false,
  showShareForm = true,
  autoFocusShareForm = false,
  autoFetch = true,
  className,
}: MoonCircleInsightsProps) {
  const [insights, setInsights] = useState<Insight[]>(initialInsights);
  const [total, setTotal] = useState<number>(
    initialTotal ?? insightCount ?? initialInsights.length ?? 0,
  );
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortOrder>(defaultSort);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(collapsedByDefault);
  const [hasFetched, setHasFetched] = useState(false);
  const prevInitialInsightsRef = useRef<string>('');
  const sortRef = useRef<SortOrder>(defaultSort);

  const initialInsightsKey = useMemo(
    () => JSON.stringify(initialInsights.map((i) => i.id)),
    [initialInsights],
  );

  useEffect(() => {
    if (prevInitialInsightsRef.current !== initialInsightsKey) {
      prevInitialInsightsRef.current = initialInsightsKey;
      setInsights(initialInsights);
      setTotal(initialTotal ?? insightCount ?? initialInsights.length ?? 0);
      setPage(0);
      setSort(defaultSort);
      sortRef.current = defaultSort;
      setHasFetched(initialInsights.length > 0);
    }
  }, [
    initialInsightsKey,
    initialTotal,
    insightCount,
    defaultSort,
    initialInsights,
  ]);

  useEffect(() => {
    sortRef.current = sort;
  }, [sort]);

  const fetchInsights = useCallback(
    async (overridePage = 0, overrideSort?: SortOrder, bustCache = false) => {
      const sortOrder = overrideSort ?? sortRef.current;
      try {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams({
          limit: String(pageSize),
          offset: String(overridePage * pageSize),
          sort: sortOrder,
        });
        // Add cache-busting param when refetching after submission
        if (bustCache) {
          params.set('_t', String(Date.now()));
        }
        const response = await fetch(
          `/api/moon-circles/${moonCircleId}/insights?${params.toString()}`,
          { cache: 'no-store' },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            data?.error ?? 'We could not load community insights right now.',
          );
        }
        const fetchedInsights = data.insights ?? [];
        const fetchedTotal = data.total ?? 0;
        setInsights(fetchedInsights);
        setTotal(fetchedTotal);
        setPage(overridePage);
        setSort(sortOrder);
        setHasFetched(true);

        // Debug logging
        if (fetchedTotal > 0 && fetchedInsights.length === 0) {
          console.warn(
            `[MoonCircleInsights] Total is ${fetchedTotal} but fetched ${fetchedInsights.length} insights`,
          );
        }
      } catch (fetchError) {
        console.error('Failed to load insights', fetchError);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Failed to load insights. Please try again.',
        );
      } finally {
        setIsLoading(false);
      }
    },
    [moonCircleId, pageSize],
  );

  useEffect(() => {
    if (!isCollapsed && autoFetch) {
      // Always fetch if collapsed state changes or on mount
      fetchInsights(0, sort);
    }
  }, [autoFetch, fetchInsights, isCollapsed]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ moonCircleId: number }>).detail;
      if (detail?.moonCircleId === moonCircleId) {
        // Small delay to ensure database has updated, then bust cache
        setTimeout(() => {
          fetchInsights(0, 'newest', true);
        }, 500);
      }
    };
    const deleteHandler = () => {
      // Refresh insights when one is deleted
      setTimeout(() => {
        fetchInsights(page, sort);
      }, 300);
    };
    window.addEventListener(
      'moon-circle-insight:submitted',
      handler as EventListener,
    );
    window.addEventListener(
      'moon-circle-insight:deleted',
      deleteHandler as EventListener,
    );
    return () => {
      window.removeEventListener(
        'moon-circle-insight:submitted',
        handler as EventListener,
      );
      window.removeEventListener(
        'moon-circle-insight:deleted',
        deleteHandler as EventListener,
      );
    };
  }, [fetchInsights, moonCircleId, page, sort]);

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(Math.max(total, 1) / pageSize));
  }, [pageSize, total]);

  const handlePageChange = (direction: 'next' | 'prev') => {
    const nextPage =
      direction === 'next'
        ? Math.min(page + 1, totalPages - 1)
        : Math.max(page - 1, 0);
    if (nextPage !== page) {
      fetchInsights(nextPage);
    }
  };

  const handleSortChange = (nextSort: SortOrder) => {
    if (nextSort === sort) return;
    fetchInsights(0, nextSort);
  };

  const handleToggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    if (!nextState && !hasFetched) {
      fetchInsights(0, sort);
    }
  };

  const handleManualRefresh = () => fetchInsights(page, sort);

  const displayDate = formatDate(date);
  const displayTotal = total ?? insightCount ?? insights.length ?? 0;

  return (
    <section
      className={cn(
        'rounded-3xl border border-lunary-primary-700 bg-black/40 p-6 shadow-lg shadow-lunary-primary-800 backdrop-blur',
        className,
      )}
    >
      <header className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <p className='text-xs uppercase tracking-[0.2em] text-lunary-accent-200/70'>
            Community reflections
          </p>
          <h3 className='text-2xl font-semibold text-white'>
            {moonPhase} insights
          </h3>
          {displayDate && (
            <p className='text-sm text-lunary-accent-100/70'>
              Shared for {displayDate}
            </p>
          )}
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='rounded-full border border-lunary-primary-700 px-3 py-1 text-sm text-lunary-accent-100'>
            {displayTotal} insight{displayTotal === 1 ? '' : 's'}
          </span>
          <Button
            type='button'
            variant='ghost'
            className='text-sm text-lunary-accent-100 hover:bg-lunary-primary-950'
            onClick={handleToggleCollapse}
          >
            {isCollapsed ? (
              <span className='flex items-center gap-1'>
                Expand
                <ChevronDown className='h-4 w-4' />
              </span>
            ) : (
              <span className='flex items-center gap-1'>
                Collapse
                <ChevronUp className='h-4 w-4' />
              </span>
            )}
          </Button>
        </div>
      </header>

      {!isCollapsed && (
        <div className='mt-6 space-y-6'>
          <div className='flex flex-wrap items-center justify-between gap-3'>
            <div className='flex items-center gap-2 text-sm text-lunary-accent-100/80'>
              <MessageCircle className='h-4 w-4 text-lunary-accent-300' />
              Voices from the circle
            </div>
            <div className='flex flex-wrap items-center gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => handleSortChange('newest')}
                className={cn(
                  'gap-1 text-xs',
                  sort === 'newest'
                    ? 'bg-lunary-primary-950 text-white'
                    : 'text-lunary-accent-100',
                )}
              >
                <SortAsc className='h-4 w-4' />
                Newest
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => handleSortChange('oldest')}
                className={cn(
                  'gap-1 text-xs',
                  sort === 'oldest'
                    ? 'bg-lunary-primary-950 text-white'
                    : 'text-lunary-accent-100',
                )}
              >
                <SortAsc className='h-4 w-4 rotate-180' />
                Oldest
              </Button>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={handleManualRefresh}
                className='gap-1 text-xs text-lunary-accent-100 hover:text-white'
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className='h-4 w-4 animate-spin' />
                ) : (
                  <RefreshCcw className='h-4 w-4' />
                )}
                Refresh
              </Button>
            </div>
          </div>

          {showShareForm && (
            <ShareInsightForm
              moonCircleId={moonCircleId}
              autoFocus={autoFocusShareForm}
              onSuccess={() => fetchInsights(0, 'newest')}
            />
          )}

          {error && (
            <div className='rounded-2xl border border-lunary-error-600 bg-lunary-error-950 px-4 py-3 text-sm text-lunary-error-100'>
              {error}
            </div>
          )}

          {isLoading && insights.length === 0 && (
            <div className='space-y-3'>
              {[0, 1].map((key) => (
                <div
                  key={key}
                  className='h-24 animate-pulse rounded-2xl bg-lunary-primary-950'
                />
              ))}
            </div>
          )}

          {!isLoading && insights.length === 0 && (
            <div className='rounded-2xl border border-dashed border-lunary-primary-600 bg-lunary-primary-950 p-6 text-center text-sm text-lunary-accent-100/80'>
              No insights yet. Be the first to share how this{' '}
              {moonPhase.toLowerCase()} is showing up for you.
            </div>
          )}

          {insights.length > 0 && (
            <div className='space-y-4'>
              {insights.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  moonCircle={{ moon_phase: moonPhase, date }}
                  moonCircleId={moonCircleId}
                  onDelete={() => {
                    fetchInsights(page, sort);
                  }}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className='flex items-center justify-between rounded-2xl border border-lunary-primary-700 px-4 py-3 text-sm text-lunary-accent-100/80'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => handlePageChange('prev')}
                disabled={page === 0 || isLoading}
                className='gap-1 text-lunary-accent-100 disabled:opacity-40'
              >
                <ChevronLeft className='h-4 w-4' />
                Newer
              </Button>
              <span>
                Page {page + 1} of {totalPages}
              </span>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => handlePageChange('next')}
                disabled={page >= totalPages - 1 || isLoading}
                className='gap-1 text-lunary-accent-100 disabled:opacity-40'
              >
                Older
                <ChevronRight className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      )}

      {isCollapsed && (
        <div className='mt-4 rounded-2xl border border-dashed border-lunary-primary-600 bg-lunary-primary-950 p-4 text-sm text-lunary-accent-100/80'>
          <p>
            Tap expand to read what others experienced during this{' '}
            {moonPhase.toLowerCase()} circle.
          </p>
          <Button
            type='button'
            onClick={handleToggleCollapse}
            className='mt-3 w-full justify-center gap-2 rounded-2xl bg-lunary-primary text-white hover:bg-lunary-primary-400'
          >
            View insights
            <ArrowRight className='h-4 w-4' />
          </Button>
        </div>
      )}
    </section>
  );
}
