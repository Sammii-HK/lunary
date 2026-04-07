'use client';

import Link from 'next/link';
import { Gift } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';

export function BetaBanner() {
  const authState = useAuthStatus();

  if (authState.loading || authState.isAuthenticated) {
    return null;
  }

  return (
    <div
      data-global-nav
      className='bg-surface-elevated border-b border-stroke-subtle/50 px-4 py-1 md:py-2 fixed top-0 left-0 right-0 z-[60]'
    >
      <Link
        href='/referrals'
        className='flex items-center justify-center gap-2 text-center text-[11px] md:text-sm text-content-secondary hover:text-content-primary transition-colors'
      >
        <Gift className='w-3 h-3 text-lunary-highlight' />
        <span>
          Give a friend{' '}
          <span className='text-lunary-highlight font-medium'>
            30 days of Pro free
          </span>{' '}
          <span className='text-content-muted'>
            — earn a bonus week for every referral
          </span>
        </span>
      </Link>
    </div>
  );
}
