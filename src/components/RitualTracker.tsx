'use client';

import { useEffect, useState, useCallback } from 'react';
import { Flame, Sunrise, Sunset, CheckCircle2, Circle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStatus } from './AuthStatus';

interface RitualStatus {
  morning: boolean;
  evening: boolean;
  ritualStreak: number;
  longestRitualStreak: number;
}

export function RitualTracker() {
  const authState = useAuthStatus();
  const [status, setStatus] = useState<RitualStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!authState.isAuthenticated) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        '/api/ritual/complete?date=' + new Date().toISOString().split('T')[0],
      );
      if (response.ok) {
        const data = await response.json();
        setStatus(
          data.status || {
            morning: false,
            evening: false,
            ritualStreak: 0,
            longestRitualStreak: 0,
          },
        );
      } else {
        // Set default status if API fails
        setStatus({
          morning: false,
          evening: false,
          ritualStreak: 0,
          longestRitualStreak: 0,
        });
      }
    } catch (error) {
      console.error('[RitualTracker] Error fetching status:', error);
      // Set default status on error
      setStatus({
        morning: false,
        evening: false,
        ritualStreak: 0,
        longestRitualStreak: 0,
      });
    } finally {
      setIsLoading(false);
    }
  }, [authState.isAuthenticated]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (!authState.isAuthenticated || isLoading || !status) {
    return null;
  }

  const hour = new Date().getHours();
  const isMorning = hour >= 6 && hour < 14;
  const currentRitual = isMorning ? 'morning' : 'evening';

  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 md:p-6'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <Flame className='w-5 h-5 text-lunary-rose' />
          <h3 className='text-lg font-semibold text-zinc-100'>Ritual Streak</h3>
        </div>
        <div className='text-right'>
          <div className='text-2xl font-bold text-lunary-rose'>
            {status.ritualStreak}
          </div>
          <div className='text-xs text-zinc-400'>days</div>
        </div>
      </div>

      {status.longestRitualStreak > 0 && (
        <div className='text-xs text-zinc-400 mb-4'>
          Longest: {status.longestRitualStreak} days
        </div>
      )}

      <div className='space-y-3'>
        <Link
          href={`/book-of-shadows?prompt=${encodeURIComponent('Set your intention for today')}`}
          onClick={async () => {
            try {
              const res = await fetch('/api/ritual/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ritualType: 'morning',
                  metadata: { prompt: 'Set your intention for today' },
                }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.ritualStreak !== undefined) {
                  setStatus((prev) =>
                    prev
                      ? {
                          ...prev,
                          morning: true,
                          ritualStreak: data.ritualStreak,
                          longestRitualStreak: data.longestRitualStreak,
                        }
                      : prev,
                  );
                }
              }
            } catch (error) {
              console.error('[RitualTracker] Failed to track ritual:', error);
            }
          }}
          className='flex items-center justify-between p-3 rounded-lg border border-zinc-800/40 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors'
        >
          <div className='flex items-center gap-3'>
            <Sunrise className='w-4 h-4 text-lunary-accent' />
            <span className='text-sm text-zinc-300'>Morning Ritual</span>
          </div>
          {status.morning ? (
            <CheckCircle2 className='w-5 h-5 text-lunary-success' />
          ) : (
            <Circle className='w-5 h-5 text-zinc-600' />
          )}
        </Link>

        <Link
          href={`/book-of-shadows?prompt=${encodeURIComponent('Reflect on your day')}`}
          onClick={async () => {
            try {
              const res = await fetch('/api/ritual/complete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ritualType: 'evening',
                  metadata: { prompt: 'Reflect on your day' },
                }),
              });
              if (res.ok) {
                const data = await res.json();
                if (data.ritualStreak !== undefined) {
                  setStatus((prev) =>
                    prev
                      ? {
                          ...prev,
                          evening: true,
                          ritualStreak: data.ritualStreak,
                          longestRitualStreak: data.longestRitualStreak,
                        }
                      : prev,
                  );
                }
              }
            } catch (error) {
              console.error('[RitualTracker] Failed to track ritual:', error);
            }
          }}
          className='flex items-center justify-between p-3 rounded-lg border border-zinc-800/40 bg-zinc-900/30 hover:bg-zinc-900/50 transition-colors'
        >
          <div className='flex items-center gap-3'>
            <Sunset className='w-4 h-4 text-lunary-primary-500' />
            <span className='text-sm text-zinc-300'>Evening Ritual</span>
          </div>
          {status.evening ? (
            <CheckCircle2 className='w-5 h-5 text-lunary-success' />
          ) : (
            <Circle className='w-5 h-5 text-zinc-600' />
          )}
        </Link>
      </div>

      {status.ritualStreak > 0 && (
        <div className='mt-4 text-xs text-zinc-400 text-center'>
          Keep your streak going! Complete your {currentRitual} ritual today.
        </div>
      )}
    </div>
  );
}
