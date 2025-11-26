'use client';

import { useEffect, useState } from 'react';
import { Flame, Trophy, Share2 } from 'lucide-react';
import { SharePersonalized } from './SharePersonalized';

interface StreakData {
  current: number;
  longest: number;
  lastCheckIn: string | null;
  totalCheckIns: number;
}

export function StreakDisplay() {
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
              totalCheckIns: 0,
            },
          );
        } else {
          // If API fails, show default empty streak
          setStreak({
            current: 0,
            longest: 0,
            lastCheckIn: null,
            totalCheckIns: 0,
          });
        }
      } catch (error) {
        console.error('[StreakDisplay] Failed to fetch streak:', error);
        // Show default empty streak on error
        setStreak({
          current: 0,
          longest: 0,
          lastCheckIn: null,
          totalCheckIns: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStreak();
  }, []);

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 md:p-6'>
        <div className='h-20 bg-zinc-900/50 rounded-lg animate-pulse' />
      </div>
    );
  }

  // Always show component, even if streak is 0
  if (!streak) {
    return (
      <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 md:p-6'>
        <div className='flex items-center gap-3 mb-3'>
          <Flame className='w-5 h-5 text-orange-500' />
          <h2 className='text-lg font-semibold text-zinc-100'>Your Streak</h2>
        </div>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-zinc-400'>Current Streak</span>
            <span className='text-xl font-bold text-orange-500'>0 days</span>
          </div>
          <div className='pt-2 border-t border-zinc-800/60'>
            <p className='text-xs text-zinc-500'>
              Start your streak today! Check in to begin tracking.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 md:p-6'>
      <div className='flex items-center gap-3 mb-3'>
        <Flame className='w-5 h-5 text-orange-500' />
        <h2 className='text-lg font-semibold text-zinc-100'>Your Streak</h2>
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-zinc-400'>Current Streak</span>
          <span className='text-xl font-bold text-orange-500'>
            {streak.current} {streak.current === 1 ? 'day' : 'days'}
          </span>
        </div>

        {streak.longest > streak.current && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Trophy className='w-4 h-4 text-yellow-500' />
              <span className='text-sm text-zinc-400'>Longest Streak</span>
            </div>
            <span className='text-lg font-semibold text-yellow-500'>
              {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
            </span>
          </div>
        )}

        <div className='pt-2 border-t border-zinc-800/60'>
          <p className='text-xs text-zinc-500 mb-3'>
            {streak.current === 0
              ? 'Start your streak today! Check in to begin tracking.'
              : 'Keep it going! Check in today to maintain your streak.'}
          </p>
          {streak.current > 0 && (
            <SharePersonalized
              type='streak'
              data={{
                streak: streak.current,
                longestStreak: streak.longest,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
