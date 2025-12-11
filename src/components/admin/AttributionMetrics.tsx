'use client';

import { useEffect, useState } from 'react';
import { Loader2, Search, TrendingUp, Users, Globe } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface AttributionData {
  summary: {
    totalUsers: number;
    organicUsers: number;
    organicPercentage: number;
  };
  sourceBreakdown: Array<{
    source: string;
    user_count: number;
    percentage: number;
  }>;
  topLandingPages: Array<{
    page: string;
    source: string;
    user_count: number;
  }>;
  keywordBreakdown: Array<{
    keyword: string;
    user_count: number;
  }>;
  conversionBySource: Array<{
    source: string;
    total_users: number;
    paying_users: number;
    conversion_rate: number;
  }>;
}

interface Props {
  startDate?: string;
  endDate?: string;
}

const SOURCE_LABELS: Record<string, string> = {
  seo: 'Organic Search',
  social: 'Social Media',
  email: 'Email',
  direct: 'Direct',
  referral: 'Referral',
  paid: 'Paid Ads',
};

const SOURCE_COLORS: Record<string, string> = {
  seo: 'bg-green-500',
  social: 'bg-blue-500',
  email: 'bg-purple-500',
  direct: 'bg-zinc-500',
  referral: 'bg-orange-500',
  paid: 'bg-red-500',
};

export function AttributionMetrics({ startDate, endDate }: Props) {
  const [data, setData] = useState<AttributionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams();
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);

        const res = await fetch(`/api/admin/analytics/attribution?${params}`);
        if (!res.ok) throw new Error('Failed to fetch');

        const json = await res.json();
        setData(json);
      } catch (err) {
        setError('Failed to load attribution data');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [startDate, endDate]);

  if (loading) {
    return (
      <Card>
        <CardContent className='flex items-center justify-center py-12'>
          <Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
        </CardContent>
      </Card>
    );
  }

  if (error || !data) {
    return (
      <Card>
        <CardContent className='py-12 text-center text-muted-foreground'>
          {error || 'No attribution data available'}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-3'>
        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground'>
              Total Attributed Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{data.summary.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <Search className='h-4 w-4' />
              Organic (SEO) Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-500'>
              {data.summary.organicUsers}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='pb-2'>
            <CardTitle className='text-sm font-medium text-muted-foreground flex items-center gap-2'>
              <TrendingUp className='h-4 w-4' />
              Organic %
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-green-500'>
              {data.summary.organicPercentage}%
            </div>
            <p className='text-xs text-muted-foreground mt-1'>
              of all attributed signups
            </p>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Globe className='h-5 w-5' />
              Traffic Source Breakdown
            </CardTitle>
            <CardDescription>Where your users are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {data.sourceBreakdown.map((source) => (
                <div key={source.source} className='space-y-1'>
                  <div className='flex items-center justify-between text-sm'>
                    <span className='font-medium'>
                      {SOURCE_LABELS[source.source] || source.source}
                    </span>
                    <span className='text-muted-foreground'>
                      {source.user_count} ({source.percentage}%)
                    </span>
                  </div>
                  <div className='h-2 bg-zinc-800 rounded-full overflow-hidden'>
                    <div
                      className={`h-full ${SOURCE_COLORS[source.source] || 'bg-zinc-500'}`}
                      style={{ width: `${source.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Users className='h-5 w-5' />
              Conversion by Source
            </CardTitle>
            <CardDescription>
              Which sources convert to paid users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-3'>
              {data.conversionBySource.map((source) => (
                <div
                  key={source.source}
                  className='flex items-center justify-between py-2 border-b border-zinc-800 last:border-0'
                >
                  <div>
                    <div className='font-medium'>
                      {SOURCE_LABELS[source.source] || source.source}
                    </div>
                    <div className='text-xs text-muted-foreground'>
                      {source.paying_users} / {source.total_users} users
                    </div>
                  </div>
                  <div
                    className={`text-lg font-bold ${
                      source.conversion_rate >= 5
                        ? 'text-green-500'
                        : source.conversion_rate >= 2
                          ? 'text-yellow-500'
                          : 'text-zinc-400'
                    }`}
                  >
                    {source.conversion_rate}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>Top Landing Pages</CardTitle>
            <CardDescription>Pages where users first arrive</CardDescription>
          </CardHeader>
          <CardContent>
            <div className='space-y-2 max-h-64 overflow-y-auto'>
              {data.topLandingPages.slice(0, 10).map((page, i) => (
                <div
                  key={`${page.page}-${i}`}
                  className='flex items-center justify-between py-1.5 text-sm'
                >
                  <div className='flex items-center gap-2 truncate flex-1 mr-4'>
                    <span
                      className={`w-2 h-2 rounded-full ${SOURCE_COLORS[page.source] || 'bg-zinc-500'}`}
                    />
                    <span className='truncate font-mono text-xs'>
                      {page.page}
                    </span>
                  </div>
                  <span className='text-muted-foreground whitespace-nowrap'>
                    {page.user_count} users
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Search className='h-5 w-5' />
              Top Search Keywords
            </CardTitle>
            <CardDescription>
              Keywords that brought users from search
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.keywordBreakdown.length === 0 ? (
              <p className='text-sm text-muted-foreground py-4'>
                No keyword data captured yet. Keywords are captured from search
                engine referrers when available.
              </p>
            ) : (
              <div className='space-y-2 max-h-64 overflow-y-auto'>
                {data.keywordBreakdown.slice(0, 10).map((kw, i) => (
                  <div
                    key={`${kw.keyword}-${i}`}
                    className='flex items-center justify-between py-1.5 text-sm'
                  >
                    <span className='truncate flex-1 mr-4'>{kw.keyword}</span>
                    <span className='text-muted-foreground whitespace-nowrap'>
                      {kw.user_count} users
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
