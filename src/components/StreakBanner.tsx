'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';

interface StreakData {
  current: number;
  longest: number;
  lastCheckIn: string | null;
}

interface StreakBannerProps {
  location: 'horoscope' | 'profile';
  className?: string;
}

export function StreakBanner({ location, className = '' }: StreakBannerProps) {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const response = await fetch('/api/streak/check-in', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setStreak(
            data.streak || {
              current: 0,
              longest: 0,
              lastCheckIn: null,
            },
          );
        }
      } catch (error) {
        console.error('[StreakBanner] Failed to fetch streak:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, []);

  if (isLoading || !streak || streak.current === 0) {
    return null;
  }

  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-lunary-rose-950/30 border border-lunary-rose-800/30 ${className}`}
    >
      <Flame className='w-4 h-4 text-lunary-rose' />
      <span className='text-sm text-zinc-300'>
        <span className='font-medium text-lunary-rose'>{streak.current}</span>{' '}
        day streak
      </span>
      {streak.current === streak.longest && streak.current > 1 && (
        <span className='text-xs text-lunary-accent-400 ml-1'>
          Personal best!
        </span>
      )}
    </div>
  );
}
