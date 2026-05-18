'use client';

import {
  TrendingUp,
  Search,
  ExternalLink,
  Link2,
  Sparkles,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SearchPerformance {
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
}

interface SearchConsoleData {
  performance: SearchPerformance;
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
  sources?: {
    google?: {
      performance: SearchPerformance;
    } | null;
    bing?: {
      performance: SearchPerformance;
      backlinks?: Array<{
        url: string;
        count: number;
      }>;
      aiPerformance?: {
        generatedAt: string | null;
        source: string;
        summary: {
          totalCitations: number;
          averageCitedPages: number;
          totalClicks: number;
          totalImpressions: number;
          averageCtr: number;
        };
        citedPages: Array<{
          url: string;
          citations: number;
          clicks?: number;
          impressions?: number;
          recommendation?: 'protect' | 'expand' | 'protect-expand';
        }>;
      };
    } | null;
  };
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
      <Card className='border-stroke-subtle/30 bg-surface-elevated/10'>
        <CardHeader>
          <CardTitle className='text-base font-medium'>
            Search Console Performance
          </CardTitle>
          <CardDescription className='text-xs text-content-muted'>
            Loading search data...
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const { performance, topQueries, topPages, sources } = data;
  const bingBacklinks = sources?.bing?.backlinks || [];
  const bingAiPerformance = sources?.bing?.aiPerformance;
  const hasBingAiPerformance = Boolean(
    bingAiPerformance &&
    (bingAiPerformance.summary.totalCitations > 0 ||
      bingAiPerformance.summary.averageCitedPages > 0 ||
      bingAiPerformance.summary.totalClicks > 0 ||
      bingAiPerformance.summary.totalImpressions > 0 ||
      bingAiPerformance.citedPages.length > 0),
  );

  return (
    <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
      <Card className='border-stroke-subtle/30 bg-surface-elevated/10'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Search className='h-4 w-4 text-lunary-primary-400/70' />
            <CardTitle className='text-base font-medium'>
              Search Performance
            </CardTitle>
          </div>
          <CardDescription className='text-xs text-content-muted'>
            Combined Google Search Console + Bing Webmaster metrics
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-3'>
              <div className='text-xs text-content-muted'>Total Clicks</div>
              <div className='mt-1 text-xl font-light text-content-primary'>
                {performance.totalClicks.toLocaleString()}
              </div>
            </div>
            <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-3'>
              <div className='text-xs text-content-muted'>
                Total Impressions
              </div>
              <div className='mt-1 text-xl font-light text-content-primary'>
                {performance.totalImpressions.toLocaleString()}
              </div>
            </div>
            <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-3'>
              <div className='text-xs text-content-muted'>Avg CTR</div>
              <div className='mt-1 text-xl font-light text-content-primary'>
                {(performance.averageCtr * 100).toFixed(2)}%
              </div>
            </div>
            <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-3'>
              <div className='text-xs text-content-muted'>Avg Position</div>
              <div className='mt-1 text-xl font-light text-content-primary'>
                {performance.averagePosition.toFixed(1)}
              </div>
            </div>
          </div>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
            <div className='rounded-lg border border-stroke-subtle bg-surface-elevated/30 p-2.5'>
              <div className='text-[11px] uppercase tracking-wide text-content-muted'>
                Google clicks
              </div>
              <div className='mt-1 text-sm font-medium text-content-primary'>
                {(
                  sources?.google?.performance.totalClicks ?? 0
                ).toLocaleString()}
              </div>
            </div>
            <div className='rounded-lg border border-stroke-subtle bg-surface-elevated/30 p-2.5'>
              <div className='text-[11px] uppercase tracking-wide text-content-muted'>
                Bing clicks
              </div>
              <div className='mt-1 text-sm font-medium text-content-primary'>
                {(sources?.bing?.performance.totalClicks ?? 0).toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {hasBingAiPerformance && (
        <Card className='border-stroke-subtle/30 bg-surface-elevated/10'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Sparkles className='h-4 w-4 text-lunary-primary-400/70' />
              <CardTitle className='text-base font-medium'>
                Bing AI Citations
              </CardTitle>
            </div>
            <CardDescription className='text-xs text-content-muted'>
              Bing Webmaster Tools AI Performance snapshot
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-3'>
                <div className='text-xs text-content-muted'>
                  Total Citations
                </div>
                <div className='mt-1 text-xl font-light text-content-primary'>
                  {bingAiPerformance?.summary.totalCitations.toLocaleString()}
                </div>
              </div>
              <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-3'>
                <div className='text-xs text-content-muted'>
                  Avg Cited Pages
                </div>
                <div className='mt-1 text-xl font-light text-content-primary'>
                  {bingAiPerformance?.summary.averageCitedPages.toLocaleString()}
                </div>
              </div>
              <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-3'>
                <div className='text-xs text-content-muted'>Total Clicks</div>
                <div className='mt-1 text-xl font-light text-content-primary'>
                  {bingAiPerformance?.summary.totalClicks.toLocaleString()}
                </div>
              </div>
              <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-3'>
                <div className='text-xs text-content-muted'>
                  Total Impressions
                </div>
                <div className='mt-1 text-xl font-light text-content-primary'>
                  {bingAiPerformance?.summary.totalImpressions.toLocaleString()}
                </div>
              </div>
              <div className='rounded-xl border border-stroke-subtle bg-surface-elevated/40 p-3 sm:col-span-2'>
                <div className='text-xs text-content-muted'>Avg CTR</div>
                <div className='mt-1 text-xl font-light text-content-primary'>
                  {((bingAiPerformance?.summary.averageCtr || 0) * 100).toFixed(
                    1,
                  )}
                  %
                </div>
              </div>
            </div>
            <p className='text-xs leading-relaxed text-content-muted'>
              This is citation visibility, not search clicks. Bing currently
              exposes this report in Webmaster Tools, but not through the public
              Webmaster API.
            </p>
            {(bingAiPerformance?.citedPages.length || 0) > 0 && (
              <div className='space-y-2'>
                {bingAiPerformance?.citedPages.slice(0, 5).map((page) => (
                  <div
                    key={page.url}
                    className='rounded-lg border border-stroke-subtle bg-surface-elevated/30 p-2.5'
                  >
                    <div className='truncate text-sm font-medium text-content-primary'>
                      {page.url
                        .replace('https://lunary.app', '')
                        .replace('https://www.lunary.app', '') || '/'}
                    </div>
                    <div className='mt-1 flex flex-wrap gap-2 text-xs text-content-muted'>
                      <span>{page.citations.toLocaleString()} citations</span>
                      {page.clicks != null && (
                        <span>{page.clicks.toLocaleString()} clicks</span>
                      )}
                      {page.impressions != null && (
                        <span>
                          {page.impressions.toLocaleString()} impressions
                        </span>
                      )}
                      {page.recommendation && (
                        <span className='text-lunary-primary-300'>
                          {page.recommendation}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className='border-stroke-subtle/30 bg-surface-elevated/10'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4 text-lunary-primary-400/70' />
            <CardTitle className='text-base font-medium'>Top Queries</CardTitle>
          </div>
          <CardDescription className='text-xs text-content-muted'>
            Most searched terms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {topQueries.slice(0, 5).map((query, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-2.5'
              >
                <div className='flex-1'>
                  <div className='text-sm font-medium text-content-primary'>
                    {query.query}
                  </div>
                  <div className='mt-1 flex items-center gap-3 text-xs text-content-muted'>
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
                  <div className='text-xs text-content-muted'>CTR</div>
                </div>
              </div>
            ))}
            {topQueries.length === 0 && (
              <div className='py-8 text-center text-sm text-content-muted'>
                No search data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className='border-stroke-subtle/30 bg-surface-elevated/10 col-span-1 lg:col-span-2'>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <ExternalLink className='h-4 w-4 text-lunary-primary-400/70' />
            <CardTitle className='text-base font-medium'>Top Pages</CardTitle>
          </div>
          <CardDescription className='text-xs text-content-muted'>
            Best performing pages in search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            {topPages.slice(0, 10).map((page, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-3'
              >
                <div className='flex-1 min-w-0'>
                  <div className='truncate text-sm font-medium text-content-primary'>
                    {page.page
                      .replace('https://lunary.app', '')
                      .replace('https://www.lunary.app', '') || '/'}
                  </div>
                  <div className='mt-1 flex items-center gap-3 text-xs text-content-muted'>
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
                    <div className='text-xs text-content-muted'>CTR</div>
                  </div>
                </div>
              </div>
            ))}
            {topPages.length === 0 && (
              <div className='py-8 text-center text-sm text-content-muted'>
                No page data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {bingBacklinks.length > 0 && (
        <Card className='border-stroke-subtle/30 bg-surface-elevated/10 col-span-1 lg:col-span-2'>
          <CardHeader>
            <div className='flex items-center gap-2'>
              <Link2 className='h-4 w-4 text-lunary-primary-400/70' />
              <CardTitle className='text-base font-medium'>
                Bing Backlink Pages
              </CardTitle>
            </div>
            <CardDescription className='text-xs text-content-muted'>
              Pages Bing reports with inbound links
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {bingBacklinks.map((link, idx) => (
                <div
                  key={`${link.url}-${idx}`}
                  className='flex items-center justify-between gap-4 rounded-lg border border-stroke-subtle bg-surface-elevated/40 p-3'
                >
                  <div className='min-w-0 truncate text-sm font-medium text-content-primary'>
                    {link.url
                      .replace('https://lunary.app', '')
                      .replace('https://www.lunary.app', '') || '/'}
                  </div>
                  <div className='shrink-0 text-right'>
                    <div className='text-xs font-medium text-lunary-primary-400'>
                      {link.count.toLocaleString()}
                    </div>
                    <div className='text-xs text-content-muted'>links</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
