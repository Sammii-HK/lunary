'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShareRouteErrorProps {
  /** The error thrown during render, provided by the Next.js error boundary. */
  error: Error & { digest?: string };
  /** Resets the error boundary and re-renders the segment. */
  reset: () => void;
  /** Tag used for logging which share surface failed. */
  boundary: string;
}

/**
 * Themed, on-brand fallback for the public share/viral routes (shared charts,
 * public profiles, sky-of-the-day). These are async Server Components, so a
 * render throw would otherwise fall through to the unstyled global-error page.
 * This keeps a cold visitor on-brand and routes them into the funnel via the
 * free birth chart instead of hitting a dead end.
 */
export function ShareRouteError({
  error,
  reset,
  boundary,
}: ShareRouteErrorProps) {
  useEffect(() => {
    console.error(`[${boundary}] route error:`, error);
  }, [error, boundary]);

  return (
    <main className='flex min-h-[100dvh] w-full flex-col items-center justify-center bg-surface-base px-6 py-16 text-center'>
      <div className='flex max-w-md flex-col items-center gap-4'>
        <h1 className='text-xl font-medium text-content-primary sm:text-2xl'>
          The cosmos is recalibrating
        </h1>
        <p className='text-sm leading-relaxed text-content-secondary'>
          We could not load this page just now. The skies will clear, or you can
          map your own chart in the meantime.
        </p>
        <div className='mt-1 flex flex-col items-center gap-3 sm:flex-row'>
          <Button type='button' onClick={reset} variant='lunary-solid'>
            <RefreshCcw className='h-4 w-4' aria-hidden='true' />
            Try again
          </Button>
          <Button asChild variant='outline'>
            <Link href='/free-chart'>Get your free birth chart</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
