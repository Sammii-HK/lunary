'use client';

import { useEffect, useState } from 'react';
import {
  CalendarDays,
  Loader2,
  MousePointerClick,
  Percent,
  Search,
  Users,
  type LucideIcon,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type BreakdownRow = {
  key: string;
  visitors: number;
  uniqueVisitors: number;
  pageViews: number;
  percentage: number;
};

type AcquisitionResponse = {
  source?: 'posthog' | 'neon_fallback';
  cached?: boolean;
  generatedAt?: string;
  range: {
    days: number;
    start: string;
    end: string;
  };
  semantics: {
    note: string;
    visitorDefinition: string;
    pageViewDefinition: string;
  };
  summary: {
    visitors: number;
    uniqueVisitors: number;
    pageViews: number;
    sessions: number;
    singlePageSessions: number;
    bounceRate: number;
    pagesPerVisitor: number;
    pagesPerUniqueVisitor: number;
  };
  daily: Array<{
    date: string;
    visitors: number;
    uniqueVisitors: number;
    pageViews: number;
    sessions: number;
    bounceRate: number;
  }>;
  breakdowns: {
    referrers: BreakdownRow[];
    routes: BreakdownRow[];
    pages: BreakdownRow[];
    countries: BreakdownRow[];
    devices: BreakdownRow[];
    operatingSystems: BreakdownRow[];
    browsers: BreakdownRow[];
    events: BreakdownRow[];
  };
};

type AcquisitionTabProps = {
  startDate: string;
  endDate: string;
  active: boolean;
};

const numberFormatter = new Intl.NumberFormat('en-GB');

function formatNumber(value: number): string {
  return numberFormatter.format(value);
}

function formatPercent(value: number): string {
  if (value > 0 && value < 0.5) return '<0.5%';
  return `${value.toFixed(value >= 10 ? 0 : 1)}%`;
}

function labelForEmpty(value: string): string {
  return value.trim() ? value : '(direct)';
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sublabel: string;
}) {
  return (
    <Card>
      <CardContent className='flex items-start gap-4 p-5'>
        <div className='rounded-xl border border-stroke-subtle/50 bg-surface-elevated/40 p-3'>
          <Icon className='h-5 w-5 text-lunary-primary' />
        </div>
        <div className='space-y-1'>
          <p className='text-xs uppercase tracking-wide text-content-muted'>
            {label}
          </p>
          <p className='text-2xl font-semibold text-content-primary'>{value}</p>
          <p className='text-sm text-content-muted'>{sublabel}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function BreakdownTable({
  title,
  description,
  rows,
  limit = 20,
  keyLabel = 'Source',
  valueLabel = 'Page Views',
}: {
  title: string;
  description: string;
  rows: BreakdownRow[];
  limit?: number;
  keyLabel?: string;
  valueLabel?: string;
}) {
  const displayRows = rows.slice(0, limit);

  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead>
              <tr className='border-b border-stroke-subtle/40 text-left text-content-muted'>
                <th className='pb-3 pr-4 font-medium'>{keyLabel}</th>
                <th className='pb-3 pr-4 font-medium'>Share</th>
                <th className='pb-3 pr-4 font-medium'>Visitors</th>
                <th className='pb-3 pr-4 font-medium'>People</th>
                <th className='pb-3 font-medium'>{valueLabel}</th>
              </tr>
            </thead>
            <tbody>
              {displayRows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className='py-6 text-center text-content-muted'
                  >
                    No tracked data in this range.
                  </td>
                </tr>
              ) : (
                displayRows.map((row) => (
                  <tr
                    key={`${title}-${row.key}`}
                    className='border-b border-stroke-subtle/20 align-top last:border-b-0'
                  >
                    <td className='py-3 pr-4 text-content-primary'>
                      <span className='break-all'>
                        {labelForEmpty(row.key)}
                      </span>
                    </td>
                    <td className='py-3 pr-4 text-content-muted'>
                      {formatPercent(row.percentage)}
                    </td>
                    <td className='py-3 pr-4 text-content-primary'>
                      {formatNumber(row.visitors)}
                    </td>
                    <td className='py-3 pr-4 text-content-primary'>
                      {formatNumber(row.uniqueVisitors)}
                    </td>
                    <td className='py-3 text-content-primary'>
                      {formatNumber(row.pageViews)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function DailyTrafficTable({ rows }: { rows: AcquisitionResponse['daily'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='text-base'>Daily Traffic</CardTitle>
        <CardDescription>
          Day-by-day visitor-days, people, page views, sessions, and bounce.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className='overflow-x-auto'>
          <table className='min-w-full text-sm'>
            <thead>
              <tr className='border-b border-stroke-subtle/40 text-left text-content-muted'>
                <th className='pb-3 pr-4 font-medium'>Date</th>
                <th className='pb-3 pr-4 font-medium'>Visitors</th>
                <th className='pb-3 pr-4 font-medium'>People</th>
                <th className='pb-3 pr-4 font-medium'>Page Views</th>
                <th className='pb-3 pr-4 font-medium'>Sessions</th>
                <th className='pb-3 font-medium'>Bounce</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className='py-6 text-center text-content-muted'
                  >
                    No tracked page views in this range.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr
                    key={row.date}
                    className='border-b border-stroke-subtle/20 last:border-b-0'
                  >
                    <td className='py-3 pr-4 text-content-primary'>
                      {row.date}
                    </td>
                    <td className='py-3 pr-4 text-content-primary'>
                      {formatNumber(row.visitors)}
                    </td>
                    <td className='py-3 pr-4 text-content-primary'>
                      {formatNumber(row.uniqueVisitors)}
                    </td>
                    <td className='py-3 pr-4 text-content-primary'>
                      {formatNumber(row.pageViews)}
                    </td>
                    <td className='py-3 pr-4 text-content-primary'>
                      {formatNumber(row.sessions)}
                    </td>
                    <td className='py-3 text-content-primary'>
                      {formatPercent(row.bounceRate)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function AcquisitionTab({
  startDate,
  endDate,
  active,
}: AcquisitionTabProps) {
  const [data, setData] = useState<AcquisitionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!active) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          start_date: startDate,
          end_date: endDate,
        });
        const response = await fetch(
          `/api/admin/analytics/acquisition-breakdown?${params.toString()}`,
        );
        const json = (await response.json()) as AcquisitionResponse & {
          error?: string;
        };

        if (!response.ok) {
          throw new Error(json.error || 'Failed to load acquisition breakdown');
        }

        if (!cancelled) {
          setData(json);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError instanceof Error
              ? fetchError.message
              : 'Unknown acquisition breakdown error',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [active, endDate, startDate]);

  if (!active) return null;

  if (loading && !data) {
    return (
      <div className='flex min-h-[240px] items-center justify-center rounded-xl border border-stroke-subtle/40 bg-surface-elevated/10'>
        <div className='flex items-center gap-3 text-sm text-content-muted'>
          <Loader2 className='h-4 w-4 animate-spin' />
          Loading acquisition breakdown…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-xl border border-lunary-error-700/40 bg-layer-deep/40 px-4 py-3 text-sm text-lunary-error-200'>
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className='space-y-6'>
      <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
        <SummaryCard
          icon={Users}
          label='Visitors'
          value={formatNumber(data.summary.visitors)}
          sublabel='Vercel-like daily unique visitors'
        />
        <SummaryCard
          icon={CalendarDays}
          label='Unique People'
          value={formatNumber(data.summary.uniqueVisitors)}
          sublabel={`${data.range.days}-day deduped identities`}
        />
        <SummaryCard
          icon={MousePointerClick}
          label='Page Views'
          value={formatNumber(data.summary.pageViews)}
          sublabel='Tracked Lunary page_viewed events'
        />
        <SummaryCard
          icon={Percent}
          label='Bounce Rate'
          value={formatPercent(data.summary.bounceRate)}
          sublabel={`${formatNumber(data.summary.singlePageSessions)} of ${formatNumber(data.summary.sessions)} sessions viewed one page`}
        />
        <SummaryCard
          icon={Search}
          label='Pages / Visitor'
          value={data.summary.pagesPerVisitor.toFixed(2)}
          sublabel={`${data.summary.pagesPerUniqueVisitor.toFixed(2)} per unique person`}
        />
      </div>

      <Card className='border-stroke-subtle/40 bg-surface-elevated/10'>
        <CardContent className='flex flex-col gap-2 p-5 text-sm text-content-muted'>
          <p>{data.semantics.visitorDefinition}</p>
          <p>{data.semantics.pageViewDefinition}</p>
          <p>{data.semantics.note}</p>
          <p>
            Range: {startDate} to {endDate}
            {' · '}Source:{' '}
            {data.source === 'neon_fallback' ? 'Neon fallback' : 'PostHog'}
            {data.cached ? ' · cached fast path' : ''}
            {data.generatedAt
              ? ` · generated ${new Date(data.generatedAt).toLocaleTimeString()}`
              : ''}
          </p>
        </CardContent>
      </Card>

      <DailyTrafficTable rows={data.daily} />

      <div className='grid gap-6 xl:grid-cols-2'>
        <BreakdownTable
          title='Referrers'
          description='Search engines, social, direct, and other senders'
          rows={data.breakdowns.referrers}
          keyLabel='Referrer'
          limit={25}
        />
        <BreakdownTable
          title='Routes'
          description='Collapsed route families for grimoire and app traffic'
          rows={data.breakdowns.routes}
          keyLabel='Route'
          limit={25}
        />
        <BreakdownTable
          title='Pages'
          description='Concrete page paths ranked by unique visitors'
          rows={data.breakdowns.pages}
          keyLabel='Page'
          limit={25}
        />
        <BreakdownTable
          title='Countries'
          description='Visitor geography from request metadata'
          rows={data.breakdowns.countries}
          keyLabel='Country'
          limit={25}
        />
        <BreakdownTable
          title='Devices'
          description='Mobile, desktop, and tablet split'
          rows={data.breakdowns.devices}
          keyLabel='Device'
          limit={10}
        />
        <BreakdownTable
          title='Operating Systems'
          description='OS split for the selected range'
          rows={data.breakdowns.operatingSystems}
          keyLabel='OS'
          limit={10}
        />
        <BreakdownTable
          title='Browsers'
          description='Browser split for the selected range'
          rows={data.breakdowns.browsers}
          keyLabel='Browser'
          limit={10}
        />
        <BreakdownTable
          title='Events'
          description='App and product event types from conversion_events'
          rows={data.breakdowns.events}
          keyLabel='Event'
          valueLabel='Events'
          limit={20}
        />
      </div>
    </div>
  );
}
