'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { useSubscription } from '../hooks/useSubscription';
import { useAuthStatus } from './AuthStatus';

/**
 * PastDueBanner
 *
 * Sticky in-app banner shown when the user's Stripe subscription is in a
 * past_due state (card declined on renewal). Links to the Stripe customer
 * portal via our existing /api/stripe/portal endpoint so the user can update
 * the card in about thirty seconds.
 *
 * Dismissible for the current session only, so the next load surfaces it
 * again while the payment is still failing. As soon as a retry succeeds the
 * webhook flips status back to 'active' and this banner stops rendering.
 */
export function PastDueBanner() {
  const subscription = useSubscription();
  const authState = useAuthStatus();
  const [dismissed, setDismissed] = useState(false);

  if (
    subscription.loading ||
    subscription.status !== 'past_due' ||
    !authState.isAuthenticated ||
    dismissed
  ) {
    return null;
  }

  return (
    <div className='fixed top-0 left-0 right-0 z-50 border-b border-lunary-rose-700 bg-gradient-to-r from-layer-base to-lunary-rose-900 backdrop-blur-sm'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center justify-between gap-4 py-3'>
          <div className='flex items-center gap-3 flex-1 min-w-0'>
            <AlertTriangle className='w-5 h-5 text-lunary-accent flex-shrink-0' />
            <span className='text-sm font-medium text-content-primary truncate'>
              Your card couldn&apos;t be charged. Update it to keep your cosmic
              tools.
            </span>
          </div>
          <div className='flex items-center gap-2 flex-shrink-0'>
            <Button
              variant='lunary-white'
              size='sm'
              className='rounded-full'
              asChild
            >
              <Link href='/pricing?past_due=1'>Update card</Link>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='rounded-full text-content-secondary hover:text-content-primary'
              onClick={() => setDismissed(true)}
              aria-label='Dismiss'
            >
              Dismiss
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
