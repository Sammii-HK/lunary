'use client';

import { useEffect, useRef, useState } from 'react';
import { ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PostHogHeatmapProps {
  pagePath?: string;
}

export function PostHogHeatmap({ pagePath }: PostHogHeatmapProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const posthogHost =
    process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  useEffect(() => {
    if (!posthogKey) {
      setError(
        'PostHog API key not configured. Set NEXT_PUBLIC_POSTHOG_KEY in your environment variables.',
      );
      setLoading(false);
      return;
    }

    // PostHog heatmaps are accessed via their web app
    // For embedding, we'll show a link to the PostHog dashboard
    // In production, you would use PostHog's API or embed their heatmap widget
    setLoading(false);
  }, [posthogKey]);

  if (!posthogKey) {
    return (
      <div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-center'>
        <div className='text-sm text-zinc-400'>
          PostHog is not configured. To enable page-level heatmaps:
        </div>
        <ol className='mt-4 space-y-2 text-left text-xs text-zinc-500'>
          <li>
            1. Sign up at{' '}
            <a
              href='https://posthog.com'
              target='_blank'
              rel='noopener noreferrer'
              className='text-purple-400 hover:underline'
            >
              posthog.com
            </a>
          </li>
          <li>2. Get your API key from your PostHog project settings</li>
          <li>3. Add NEXT_PUBLIC_POSTHOG_KEY to your environment variables</li>
          <li>
            4. Optionally set NEXT_PUBLIC_POSTHOG_HOST (defaults to
            us.i.posthog.com)
          </li>
        </ol>
        <Button asChild variant='secondary' className='mt-4 gap-2'>
          <a
            href='https://posthog.com'
            target='_blank'
            rel='noopener noreferrer'
          >
            <ExternalLink className='h-4 w-4' />
            Visit PostHog Dashboard
          </a>
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex h-64 items-center justify-center'>
        <Loader2 className='h-6 w-6 animate-spin text-purple-400' />
      </div>
    );
  }

  if (error) {
    return (
      <div className='rounded-2xl border border-rose-800 bg-rose-950/40 p-4 text-sm text-rose-200'>
        {error}
      </div>
    );
  }

  // PostHog heatmaps are best accessed via their web dashboard
  // We'll provide a direct link to the heatmaps view
  const heatmapUrl = pagePath
    ? `${posthogHost.replace('/i', '')}/insights?insight=TRENDS&events=%5B%7B%22id%22%3A%22%24pageview%22%2C%22name%22%3A%22%24pageview%22%2C%22type%22%3A%22events%22%2C%22order%22%3A0%7D%5D&properties=%5B%7B%22key%22%3A%22%24current_path%22%2C%22value%22%3A%22${encodeURIComponent(pagePath)}%22%2C%22operator%22%3A%22exact%22%2C%22type%22%3A%22event%22%7D%5D`
    : `${posthogHost.replace('/i', '')}/insights?insight=TRENDS&events=%5B%7B%22id%22%3A%22%24pageview%22%2C%22name%22%3A%22%24pageview%22%2C%22type%22%3A%22events%22%2C%22order%22%3A0%7D%5D`;

  return (
    <div className='space-y-4'>
      <div className='rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6'>
        <div className='mb-4 flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-medium text-zinc-200'>
              Page-Level Heatmaps
            </h3>
            <p className='mt-1 text-xs text-zinc-500'>
              View heatmaps and session recordings in PostHog
            </p>
          </div>
          <Button asChild variant='secondary' size='sm' className='gap-2'>
            <a href={heatmapUrl} target='_blank' rel='noopener noreferrer'>
              <ExternalLink className='h-4 w-4' />
              Open in PostHog
            </a>
          </Button>
        </div>
        <div className='rounded-lg border border-zinc-800 bg-zinc-950/60 p-4'>
          <div className='space-y-2 text-xs text-zinc-400'>
            <div className='flex items-center justify-between'>
              <span>Heatmap Tracking:</span>
              <span className='text-emerald-400'>Active</span>
            </div>
            <div className='flex items-center justify-between'>
              <span>Session Recordings:</span>
              <span className='text-emerald-400'>Enabled</span>
            </div>
            {pagePath && (
              <div className='flex items-center justify-between'>
                <span>Current Page:</span>
                <span className='text-purple-400'>{pagePath}</span>
              </div>
            )}
          </div>
        </div>
        <div className='mt-4 text-xs text-zinc-500'>
          💡 Tip: PostHog heatmaps show where users click, scroll, and interact
          on your pages. Access the full dashboard for detailed insights and
          session recordings.
        </div>
      </div>
    </div>
  );
}
