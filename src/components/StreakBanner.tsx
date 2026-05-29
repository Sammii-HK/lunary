'use client';

import { useEffect, useState } from 'react';
import { Flame } from 'lucide-react';
import {
  getNextMilestone,
  getDaysUntilNextMilestone,
} from '@/lib/notifications/streak-notifications';

interface StreakData {
  current: number;
  longest: number;
  lastCheckIn: string | null;
}

interface StreakBannerProps {
  location: 'horoscope' | 'profile';
  className?: string;
  /**
   * When true, surfaces a small come-back-tomorrow hook beneath the streak
   * (progress toward the next milestone) so the daily visit becomes something
   * to protect. Uses only the already-fetched streak — no extra request.
   */
  showNextMilestone?: boolean;
}

export function StreakBanner({
  location,
  className = '',
  showNextMilestone = false,
}: StreakBannerProps) {
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

  // Come-back-tomorrow hook: how many more daily check-ins until the next
  // milestone. Derived from the streak we already have — no extra request.
  const nextMilestone = getNextMilestone(streak.current);
  const daysToNextMilestone = getDaysUntilNextMilestone(streak.current);
  const milestoneHook =
    showNextMilestone && nextMilestone !== null && daysToNextMilestone !== null
      ? daysToNextMilestone === 1
        ? `Check in tomorrow to reach your ${nextMilestone}-day milestone.`
        : `${daysToNextMilestone} more days to your ${nextMilestone}-day milestone.`
      : null;

  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      <div className='flex items-center gap-2 px-3 py-2 rounded-lg bg-layer-deep/30 border border-lunary-rose-800/30'>
        <Flame className='w-4 h-4 text-lunary-rose' />
        <span className='text-sm text-content-secondary'>
          <span className='font-medium text-lunary-rose'>{streak.current}</span>{' '}
          day streak
        </span>
        {streak.current === streak.longest && streak.current > 1 && (
          <span className='text-xs text-lunary-accent-400 ml-1'>
            Personal best!
          </span>
        )}
      </div>
      {milestoneHook && (
        <p className='px-3 text-xs text-content-muted'>{milestoneHook}</p>
      )}
    </div>
  );
}
