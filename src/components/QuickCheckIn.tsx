'use client';

import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';
import { recordCheckIn } from '@/lib/streak/check-in';

export function QuickCheckIn() {
  const router = useRouter();
  const authState = useAuthStatus();

  if (!authState.isAuthenticated) {
    return null;
  }

  const handleCheckIn = async () => {
    await recordCheckIn();
    router.replace(
      '/book-of-shadows?prompt=' +
        encodeURIComponent('How am I feeling with these transits?'),
    );
  };

  return (
    <button
      onClick={handleCheckIn}
      className='w-full rounded-xl border border-zinc-800/60 bg-zinc-950/60 p-4 hover:bg-zinc-900/60 transition-colors text-left'
    >
      <div className='flex items-center gap-3'>
        <div className='rounded-lg bg-purple-500/20 p-2'>
          <Heart className='w-5 h-5 text-purple-400' />
        </div>
        <div className='flex-1'>
          <h3 className='text-sm font-semibold text-zinc-100 mb-0.5'>
            How Am I Feeling?
          </h3>
          <p className='text-xs text-zinc-400'>
            Quick check-in with personalized guidance
          </p>
        </div>
      </div>
    </button>
  );
}
