'use client';

import { TrendingUp, Search, ExternalLink } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SearchConsoleData {
  performance: {
    totalClicks: number;
    totalImpressions: number;
    averageCtr: number;
    averagePosition: number;
    metrics: Array<{
      date: string;
      clicks: number;
      impressions: number;
      ctr: number;
      position: number;
    }>;
  };
  topQueries: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
  topPages: Array<{
    page: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

interface SearchConsoleMetricsProps {
  data: SearchConsoleData | null;
  loading?: boolean;
}

export function SearchConsoleMetrics({
  data,
  loading,
}: SearchConsoleMetricsProps) {
  if (loading || !data) {
    return (
      <Card className='border-zinc-800/30 bg-zinc-900/10'>
        <CardHeader>
          <CardTitle className='text-base font-medium'>
            Search Console Performance
          </CardTitle>
          <CardDescription className='text-xs text-zinc-500'>
            Loading search data...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { performance, topQueries, topPages } = data;

  return (
    <div className='grid gap-6 lg:grid-cols-2'>
      <Card className='border-zinc-800/30 bg-zinc-900/10'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Search className='h-4 w-4 text-lunary-primary-400/70' />
            <CardTitle className='text-base font-medium'>
              Search Performance
            </CardTitle>
          </div>
          <CardDescription className='text-xs text-zinc-500'>
            Google Search Console metrics
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/40 p-3'>
              <div className='text-xs text-zinc-500'>Total Clicks</div>
              <div className='mt-1 text-xl font-light text-white'>
                {performance.totalClicks.toLocaleString()}
              </div>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/40 p-3'>
              <div className='text-xs text-zinc-500'>Total Impressions</div>
              <div className='mt-1 text-xl font-light text-white'>
                {performance.totalImpressions.toLocaleString()}
              </div>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/40 p-3'>
              <div className='text-xs text-zinc-500'>Avg CTR</div>
              <div className='mt-1 text-xl font-light text-white'>
                {(performance.averageCtr * 100).toFixed(2)}%
              </div>
            </div>
            <div className='rounded-xl border border-zinc-800 bg-zinc-900/40 p-3'>
              <div className='text-xs text-zinc-500'>Avg Position</div>
              <div className='mt-1 text-xl font-light text-white'>
                {performance.averagePosition.toFixed(1)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className='border-zinc-800/30 bg-zinc-900/10'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4 text-lunary-primary-400/70' />
            <CardTitle className='text-base font-medium'>Top Queries</CardTitle>
          </div>
          <CardDescription className='text-xs text-zinc-500'>
            Most searched terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {topQueries.slice(0, 5).map((query, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-2.5'
              >
                <div className='flex-1'>
                  <div className='text-sm font-medium text-white'>
                    {query.query}
                  </div>
                  <div className='mt-1 flex items-center gap-3 text-xs text-zinc-500'>
                    <span>{query.clicks} clicks</span>
                    <span>•</span>
                    <span>{query.impressions} impressions</span>
                    <span>•</span>
                    <span>Pos {query.position.toFixed(1)}</span>
                  </div>
                </div>
                <div className='ml-3 text-right'>
                  <div className='text-xs font-medium text-lunary-primary-400'>
                    {(query.ctr * 100).toFixed(1)}%
                  </div>
                  <div className='text-xs text-zinc-600'>CTR</div>
                </div>
              </div>
            ))}
            {topQueries.length === 0 && (
              <div className='py-8 text-center text-sm text-zinc-500'>
                No search data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className='border-zinc-800/30 bg-zinc-900/10 lg:col-span-2'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <ExternalLink className='h-4 w-4 text-lunary-primary-400/70' />
            <CardTitle className='text-base font-medium'>Top Pages</CardTitle>
          </div>
          <CardDescription className='text-xs text-zinc-500'>
            Best performing pages in search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {topPages.slice(0, 10).map((page, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-900/40 p-3'
              >
                <div className='flex-1 min-w-0'>
                  <div className='truncate text-sm font-medium text-white'>
                    {page.page
                      .replace('https://lunary.app', '')
                      .replace('https://www.lunary.app', '') || '/'}
                  </div>
                  <div className='mt-1 flex items-center gap-3 text-xs text-zinc-500'>
                    <span>{page.clicks} clicks</span>
                    <span>•</span>
                    <span>{page.impressions} impressions</span>
                    <span>•</span>
                    <span>Pos {page.position.toFixed(1)}</span>
                  </div>
                </div>
                <div className='ml-4 flex items-center gap-4'>
                  <div className='text-right'>
                    <div className='text-xs font-medium text-lunary-primary-400'>
                      {(page.ctr * 100).toFixed(1)}%
                    </div>
                    <div className='text-xs text-zinc-600'>CTR</div>
                  </div>
                </div>
              </div>
            ))}
            {topPages.length === 0 && (
              <div className='py-8 text-center text-sm text-zinc-500'>
                No page data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
