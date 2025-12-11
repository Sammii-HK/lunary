'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Flame } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';

interface StreakData {
  current: number;
  longest: number;
  lastCheckIn: string | null;
}

interface StreakBannerProps {
  location: 'horoscope' | 'profile' | 'tarot';
  className?: string;
  variant?: 'default' | 'compact';
}

export function StreakBanner({
  location,
  className = '',
  variant = 'default',
}: StreakBannerProps) {
  const { isAuthenticated, loading: authLoading } = useAuthStatus();
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setIsLoading(false);
      return;
    }

    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/streak/check-in', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setStreak(
            data.streak || { current: 0, longest: 0, lastCheckIn: null },
          );
        }
      } catch (error) {
        console.error('[StreakBanner] Failed to fetch streak:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, [isAuthenticated, authLoading]);

  if (authLoading || isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Link
        href='/auth'
        className={`group flex items-center gap-2 rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-4 py-3 transition-all hover:border-lunary-primary-700/50 hover:bg-zinc-900/60 ${className}`}
      >
        <Flame className='w-4 h-4 text-zinc-500 group-hover:text-lunary-rose' />
        <span className='text-sm text-zinc-400 group-hover:text-zinc-200'>
          Start your cosmic streak — create a free Lunary profile
        </span>
      </Link>
    );
  }

  if (!streak || streak.current === 0) {
    if (variant === 'compact') {
      return (
        <div className={`flex items-center gap-2 ${className}`}>
          <Flame className='w-4 h-4 text-zinc-500' />
          <span className='text-xs text-zinc-500'>Start your streak today</span>
        </div>
      );
    }

    return (
      <div
        className={`flex items-center gap-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 px-4 py-3 ${className}`}
      >
        <Flame className='w-5 h-5 text-zinc-500' />
        <div>
          <p className='text-sm text-zinc-300'>Begin your cosmic streak</p>
          <p className='text-xs text-zinc-500'>
            Check in daily to build momentum
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Flame className='w-4 h-4 text-lunary-rose' />
        <span className='text-xs text-lunary-rose font-medium'>
          {streak.current}-day streak
        </span>
      </div>
    );
  }

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-lunary-rose/20 bg-gradient-to-r from-lunary-rose/5 to-zinc-900/60 px-4 py-3 ${className}`}
    >
      <div className='shrink-0 w-10 h-10 rounded-full bg-lunary-rose/10 border border-lunary-rose/20 flex items-center justify-center'>
        <Flame className='w-5 h-5 text-lunary-rose' />
      </div>
      <div className='flex-1'>
        <p className='text-sm font-medium text-zinc-100'>
          Your {streak.current}-day Lunary streak is alive
        </p>
        <p className='text-xs text-zinc-400'>
          {streak.current >= 7
            ? 'Your consistency is building cosmic momentum'
            : 'Keep showing up to deepen your practice'}
        </p>
      </div>
      {streak.longest > streak.current && (
        <div className='text-right'>
          <p className='text-xs text-zinc-500'>Best</p>
          <p className='text-sm font-medium text-lunary-accent'>
            {streak.longest} days
          </p>
        </div>
      )}
    </div>
  );
}
