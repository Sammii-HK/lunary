'use client';

import { useAuthStatus } from '@/components/AuthStatus';

export function BetaBanner() {
  const authState = useAuthStatus();

  if (authState.loading || authState.isAuthenticated) {
    return null;
  }

  return (
    <div className='bg-zinc-900 border-b border-zinc-800/50 px-4 py-2 fixed top-0 left-0 right-0 z-[60]'>
      <p className='text-center text-sm text-zinc-300'>
        <span className='text-zinc-400'>Beta launch: </span>
        use code{' '}
        <span className='text-lunary-highlight font-medium'>
          STARGAZER
        </span>{' '}
        <span className='text-zinc-400'>for 12 months of Lunary+ free</span>
      </p>
    </div>
  );
}
