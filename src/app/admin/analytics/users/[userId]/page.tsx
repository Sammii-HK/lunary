'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type EngagementProfile = {
  user_id: string;
  first_seen: string | null;
  last_seen: string | null;
  engagement_span_days: number;
  lifetime_active_days: number;
  active_days_last_7: number;
  active_days_last_30: number;
  active_days_last_90: number;
  longest_streak_last_90: number;
  feature_usage: Array<{
    event_type: string;
    total_events: number;
    feature_days: number;
  }>;
  grimoire_top_pages: Array<{
    entity_id: string;
    views: number;
    last_viewed: string | null;
  }>;
  recent_events: Array<{
    created_at: string;
    event_type: string;
    page_path: string | null;
    entity_type: string | null;
    entity_id: string | null;
  }>;
};

export default function AdminUserEngagementPage() {
  const params = useParams() as { userId?: string };
  const userId = params.userId ? String(params.userId) : '';

  const [data, setData] = useState<EngagementProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => (userId ? `User: ${userId}` : 'User'), [userId]);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    setError(null);

    fetch(`/api/admin/analytics/users/${encodeURIComponent(userId)}/engagement`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error || 'Failed to load profile');
        }
        return res.json();
      })
      .then((profile) => setData(profile))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Unknown error'),
      )
      .finally(() => setLoading(false));
  }, [userId]);

  if (!userId) {
    return (
      <div className='p-6 text-sm text-zinc-300'>Missing userId in URL.</div>
    );
  }

  if (loading && !data) {
    return (
      <div className='flex min-h-[60vh] items-center justify-center text-zinc-400'>
        <div className='flex items-center gap-3'>
          <Loader2 className='h-5 w-5 animate-spin text-lunary-primary-400' />
          Loading profile…
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6 p-6'>
      <div>
        <h1 className='text-xl font-semibold text-zinc-100'>{title}</h1>
        <p className='mt-1 text-sm text-zinc-400'>
          Privacy-safe engagement profile derived from meaningful events only.
        </p>
      </div>

      {error && (
        <div className='rounded-lg border border-lunary-error-800/30 bg-lunary-error-950/20 px-4 py-3 text-sm text-lunary-error-300'>
          {error}
        </div>
      )}

      {data && (
        <div className='grid gap-6 lg:grid-cols-2'>
          <Card className='border-zinc-800/30 bg-zinc-900/10'>
            <CardHeader>
              <CardTitle className='text-base font-medium'>Overview</CardTitle>
              <CardDescription className='text-xs text-zinc-400'>
                First seen, last seen, and active-day signals.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-zinc-300'>
              <div className='flex items-center justify-between'>
                <span>First seen</span>
                <span className='text-zinc-400'>
                  {data.first_seen ?? 'N/A'}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Last seen</span>
                <span className='text-zinc-400'>{data.last_seen ?? 'N/A'}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Engagement span</span>
                <span className='text-zinc-400'>
                  {data.engagement_span_days} days
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Lifetime active days</span>
                <span className='text-zinc-400'>
                  {data.lifetime_active_days}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Active days (7d)</span>
                <span className='text-zinc-400'>{data.active_days_last_7}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Active days (30d)</span>
                <span className='text-zinc-400'>
                  {data.active_days_last_30}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Active days (90d)</span>
                <span className='text-zinc-400'>
                  {data.active_days_last_90}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Longest streak (90d)</span>
                <span className='text-zinc-400'>
                  {data.longest_streak_last_90} days
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className='border-zinc-800/30 bg-zinc-900/10'>
            <CardHeader>
              <CardTitle className='text-base font-medium'>
                Top Grimoire pages
              </CardTitle>
              <CardDescription className='text-xs text-zinc-400'>
                Most viewed Grimoire entity keys and last view time.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2 text-sm text-zinc-300'>
              {data.grimoire_top_pages.length === 0 && (
                <div className='text-zinc-500'>No Grimoire views found.</div>
              )}
              {data.grimoire_top_pages.map((row) => (
                <div
                  key={row.entity_id}
                  className='flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2'
                >
                  <div className='min-w-0'>
                    <div className='truncate text-zinc-200'>
                      {row.entity_id}
                    </div>
                    <div className='text-xs text-zinc-500'>
                      Last viewed: {row.last_viewed ?? 'N/A'}
                    </div>
                  </div>
                  <div className='shrink-0 text-zinc-400'>
                    {row.views.toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className='border-zinc-800/30 bg-zinc-900/10 lg:col-span-2'>
            <CardHeader>
              <CardTitle className='text-base font-medium'>
                Feature usage (lifetime)
              </CardTitle>
              <CardDescription className='text-xs text-zinc-400'>
                Counts and distinct active days per event type.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              {data.feature_usage.length === 0 && (
                <div className='text-sm text-zinc-500'>No events found.</div>
              )}
              {data.feature_usage.map((row) => (
                <div
                  key={row.event_type}
                  className='flex items-center justify-between rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 text-sm'
                >
                  <span className='text-zinc-300'>{row.event_type}</span>
                  <span className='text-zinc-400'>
                    {row.total_events.toLocaleString()} events ·{' '}
                    {row.feature_days.toLocaleString()} days
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className='border-zinc-800/30 bg-zinc-900/10 lg:col-span-2'>
            <CardHeader>
              <CardTitle className='text-base font-medium'>
                Recent activity
              </CardTitle>
              <CardDescription className='text-xs text-zinc-400'>
                Last 50 events. No chat content is stored or displayed.
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-2'>
              {data.recent_events.length === 0 && (
                <div className='text-sm text-zinc-500'>No events found.</div>
              )}
              {data.recent_events.map((row, idx) => (
                <div
                  key={`${row.created_at}-${idx}`}
                  className='grid grid-cols-1 gap-1 rounded-lg border border-zinc-800/60 bg-zinc-950/40 px-3 py-2 text-sm md:grid-cols-4'
                >
                  <span className='text-zinc-400 md:col-span-1'>
                    {row.created_at}
                  </span>
                  <span className='text-zinc-200 md:col-span-1'>
                    {row.event_type}
                  </span>
                  <span className='truncate text-zinc-400 md:col-span-1'>
                    {row.entity_id || row.page_path || 'N/A'}
                  </span>
                  <span className='truncate text-zinc-500 md:col-span-1'>
                    {row.page_path || 'N/A'}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
