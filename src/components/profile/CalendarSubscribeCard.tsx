'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Check, Copy, Lock, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';
import { useUser } from '@/context/UserContext';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

const FEED_PATH = '/api/calendar/personal-transits.ics';

/**
 * Build the absolute subscription URL.
 *
 * Calendar apps need an absolute URL — relative paths won't subscribe.
 * We prefer `window.location.origin` (real host the user is on) and only
 * fall back to the public env var on first render before hydration.
 */
function useFeedUrl(token: string | undefined): string {
  return useMemo(() => {
    if (typeof window !== 'undefined') {
      const base = window.location.origin;
      const url = new URL(FEED_PATH, base);
      if (token) url.searchParams.set('token', token);
      return url.toString();
    }
    const fallback =
      process.env.NEXT_PUBLIC_APP_URL ||
      process.env.NEXT_PUBLIC_BASE_URL ||
      'https://lunary.app';
    const url = new URL(FEED_PATH, fallback);
    if (token) url.searchParams.set('token', token);
    return url.toString();
  }, [token]);
}

/**
 * Convert an https:// URL to webcal:// for Apple Calendar deep-linking.
 * Apple/Outlook pick up `webcal://` and prompt to subscribe.
 */
function toWebcal(httpsUrl: string): string {
  return httpsUrl.replace(/^https?:\/\//, 'webcal://');
}

/**
 * Build a Google Calendar "Add by URL" link.
 * https://calendar.google.com/calendar/r?cid=<encoded-https-url>
 */
function toGoogleCalendarUrl(httpsUrl: string): string {
  const cid = encodeURIComponent(httpsUrl);
  return `https://calendar.google.com/calendar/r?cid=${cid}`;
}

export function CalendarSubscribeCard({ className }: Props) {
  const { user } = useUser();
  const { hasAccess, loading } = useSubscription();
  const [copied, setCopied] = useState(false);

  // The user's calendarToken will live on the user record once the migration
  // lands. Until then, this is undefined and the API route will fall back to
  // session auth — which is fine for the in-app preview, but calendar apps
  // outside the browser will hit a 401 because they can't carry cookies.
  const token = (user as any)?.calendarToken as string | undefined;
  const feedUrl = useFeedUrl(token);
  const tokenMissing = !token;

  const canAccess = hasAccess('personalized_transit_readings');

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }

  if (loading) {
    return (
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className='h-6 w-48 bg-surface-overlay rounded' />
          <div className='h-4 w-72 bg-surface-overlay rounded mt-2' />
        </CardHeader>
        <CardContent>
          <div className='h-10 w-full bg-surface-overlay rounded' />
        </CardContent>
      </Card>
    );
  }

  if (!canAccess) {
    return (
      <Card className={cn('border-lunary-primary-700/50', className)}>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Lock className='size-4 text-lunary-accent' aria-hidden />
            <CardTitle className='text-base md:text-lg'>
              Subscribe to your transits
            </CardTitle>
          </div>
          <CardDescription>
            A live calendar feed of your personal transits — every aspect to
            your natal chart, ingress, retrograde, and eclipse for the next 90
            days, refreshed automatically.
          </CardDescription>
        </CardHeader>
        <CardContent className='flex flex-col gap-3'>
          <p className='text-sm text-content-secondary'>
            Available on Lunary+ with personalized transit readings.
          </p>
          <Button variant='lunary-solid' asChild>
            <a href='/pricing'>
              <Sparkles className='size-4' aria-hidden />
              Upgrade to Lunary+
            </a>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const appleUrl = toWebcal(feedUrl);
  const googleUrl = toGoogleCalendarUrl(feedUrl);

  return (
    <Card className={cn('border-lunary-primary-700/50', className)}>
      <CardHeader>
        <div className='flex items-center gap-2'>
          <Calendar className='size-4 text-lunary-accent' aria-hidden />
          <CardTitle className='text-base md:text-lg'>
            Personal transit calendar
          </CardTitle>
        </div>
        <CardDescription>
          Subscribe in Apple or Google Calendar to see your aspects, ingresses,
          retrogrades, and eclipses alongside your daily schedule.
        </CardDescription>
      </CardHeader>

      <CardContent className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
          <label
            htmlFor='lunary-calendar-feed-url'
            className='text-xs uppercase tracking-wide text-content-secondary'
          >
            Subscription URL
          </label>
          <div className='flex items-center gap-2'>
            <input
              id='lunary-calendar-feed-url'
              type='text'
              readOnly
              value={feedUrl}
              onFocus={(e) => e.currentTarget.select()}
              className='flex-1 min-w-0 rounded-lg border border-lunary-primary-700/40 bg-layer-base px-3 py-2 text-sm text-content-primary font-mono'
              aria-label='Your personal transit calendar URL'
            />
            <Button
              variant='outline'
              size='sm'
              onClick={handleCopy}
              aria-label={copied ? 'Copied' : 'Copy subscription URL'}
            >
              {copied ? (
                <>
                  <Check className='size-4' aria-hidden />
                  Copied
                </>
              ) : (
                <>
                  <Copy className='size-4' aria-hidden />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>

        <div className='flex flex-col sm:flex-row gap-2'>
          <Button variant='lunary' asChild className='flex-1'>
            <a
              href={appleUrl}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Add to Apple Calendar'
            >
              <Calendar className='size-4' aria-hidden />
              Add to Apple Calendar
            </a>
          </Button>
          <Button variant='lunary' asChild className='flex-1'>
            <a
              href={googleUrl}
              target='_blank'
              rel='noopener noreferrer'
              aria-label='Add to Google Calendar'
            >
              <Calendar className='size-4' aria-hidden />
              Add to Google Calendar
            </a>
          </Button>
        </div>

        {tokenMissing ? (
          <p className='text-xs text-content-secondary leading-relaxed'>
            Your private subscription token isn’t set up yet. The link works
            inside Lunary today; once we finish provisioning, calendar apps
            outside the browser will subscribe seamlessly.
          </p>
        ) : (
          <p className='text-xs text-content-secondary leading-relaxed'>
            Keep this URL private — anyone with the link can read your transits.
            You can rotate the token from settings if it leaks.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default CalendarSubscribeCard;
