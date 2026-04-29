'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Calendar, Check, Copy, Lock, RefreshCw, Sparkles } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CosmicSpinner } from '@/components/states/CosmicSpinner';
import { useSubscription } from '@/hooks/useSubscription';
import { cn } from '@/lib/utils';

type Props = {
  className?: string;
};

const FEED_PATH = '/api/calendar/personal-transits.ics';
const TOKEN_ENDPOINT = '/api/calendar/token';

type StatusMessage = {
  tone: 'success' | 'error';
  text: string;
};

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
  const { hasAccess, loading } = useSubscription();
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [rotating, setRotating] = useState(false);
  const [status, setStatus] = useState<StatusMessage | null>(null);

  const feedUrl = useFeedUrl(token);
  const canAccess = hasAccess('personalized_transit_readings');

  // Fetch the calendar token once the user is known to have access.
  useEffect(() => {
    if (loading || !canAccess) return;
    let cancelled = false;

    (async () => {
      setTokenLoading(true);
      try {
        const res = await fetch(TOKEN_ENDPOINT, {
          method: 'GET',
          credentials: 'same-origin',
        });
        if (!res.ok) throw new Error(`Token fetch failed: ${res.status}`);
        const data = (await res.json()) as { token?: string };
        if (cancelled) return;
        if (data.token) setToken(data.token);
        else throw new Error('Token missing in response');
      } catch (err) {
        if (cancelled) return;
        console.error('Calendar token fetch failed:', err);
        setStatus({
          tone: 'error',
          text: 'Could not load your subscription token. Refresh to try again.',
        });
      } finally {
        if (!cancelled) setTokenLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [loading, canAccess]);

  // Auto-clear the "copied" indicator.
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(id);
  }, [copied]);

  // Auto-clear status messages after a moment so the card stays calm.
  useEffect(() => {
    if (!status) return;
    const id = setTimeout(() => setStatus(null), 5000);
    return () => clearTimeout(id);
  }, [status]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setCopied(true);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [feedUrl]);

  const handleRotate = useCallback(async () => {
    const confirmed = window.confirm(
      'Rotate your calendar token? Any existing calendar subscriptions will stop syncing and you’ll need to re-subscribe with the new URL.',
    );
    if (!confirmed) return;

    setRotating(true);
    setStatus(null);
    try {
      const res = await fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error(`Rotate failed: ${res.status}`);
      const data = (await res.json()) as { token?: string };
      if (!data.token) throw new Error('Token missing in response');
      setToken(data.token);
      setStatus({
        tone: 'success',
        text: 'Token rotated. Re-subscribe in your calendar app with the new URL.',
      });
    } catch (err) {
      console.error('Calendar token rotate failed:', err);
      setStatus({
        tone: 'error',
        text: 'Could not rotate your token. Try again in a moment.',
      });
    } finally {
      setRotating(false);
    }
  }, []);

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

  const appleUrl = token ? toWebcal(feedUrl) : undefined;
  const googleUrl = token ? toGoogleCalendarUrl(feedUrl) : undefined;

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
        {tokenLoading ? (
          <div
            className='flex items-center gap-3 py-4 text-sm text-content-secondary'
            role='status'
            aria-live='polite'
          >
            <CosmicSpinner size='sm' />
            <span>Loading your private subscription URL…</span>
          </div>
        ) : (
          <>
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
                  disabled={!token}
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
              <Button
                variant='lunary'
                asChild={Boolean(appleUrl)}
                disabled={!appleUrl}
                className='flex-1'
              >
                {appleUrl ? (
                  <a
                    href={appleUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='Add to Apple Calendar'
                  >
                    <Calendar className='size-4' aria-hidden />
                    Add to Apple Calendar
                  </a>
                ) : (
                  <span>
                    <Calendar className='size-4' aria-hidden />
                    Add to Apple Calendar
                  </span>
                )}
              </Button>
              <Button
                variant='lunary'
                asChild={Boolean(googleUrl)}
                disabled={!googleUrl}
                className='flex-1'
              >
                {googleUrl ? (
                  <a
                    href={googleUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    aria-label='Add to Google Calendar'
                  >
                    <Calendar className='size-4' aria-hidden />
                    Add to Google Calendar
                  </a>
                ) : (
                  <span>
                    <Calendar className='size-4' aria-hidden />
                    Add to Google Calendar
                  </span>
                )}
              </Button>
            </div>

            <div className='flex flex-col gap-2 pt-2 border-t border-lunary-primary-700/30'>
              <p className='text-xs text-content-secondary leading-relaxed'>
                Keep this URL private — anyone with the link can read your
                transits. If it leaks, rotate the token to revoke access.
              </p>
              <div className='flex items-center justify-between gap-3'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleRotate}
                  disabled={rotating || !token}
                  aria-label='Rotate calendar subscription token'
                >
                  {rotating ? (
                    <>
                      <CosmicSpinner size='sm' />
                      Rotating…
                    </>
                  ) : (
                    <>
                      <RefreshCw className='size-4' aria-hidden />
                      Rotate token
                    </>
                  )}
                </Button>
                {status ? (
                  <p
                    className={cn(
                      'text-xs leading-relaxed text-right',
                      status.tone === 'success'
                        ? 'text-lunary-success'
                        : 'text-lunary-rose',
                    )}
                    role='status'
                    aria-live='polite'
                  >
                    {status.text}
                  </p>
                ) : null}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default CalendarSubscribeCard;
