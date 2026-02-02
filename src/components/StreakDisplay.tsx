'use client';

import { useEffect, useState } from 'react';
import { Flame, Trophy, Sparkles } from 'lucide-react';
import { SharePersonalized } from './SharePersonalized';

interface StreakData {
  current: number;
  longest: number;
  lastCheckIn: string | null;
  totalCheckIns: number;
}

// Milestone thresholds and their celebrations
const MILESTONES = [
  {
    days: 7,
    emoji: '🌟',
    title: 'Week Warrior!',
    message: 'A full week of cosmic connection',
  },
  {
    days: 14,
    emoji: '✨',
    title: 'Two Week Triumph!',
    message: 'Your dedication is building something beautiful',
  },
  {
    days: 30,
    emoji: '🌙',
    title: 'Moon Cycle Master!',
    message: 'A full lunar cycle of practice',
  },
  {
    days: 60,
    emoji: '💫',
    title: 'Stellar Dedication!',
    message: 'Two months of cosmic wisdom',
  },
  {
    days: 90,
    emoji: '🔮',
    title: 'Mystic Achievement!',
    message: 'Three months of spiritual growth',
  },
  {
    days: 100,
    emoji: '👑',
    title: 'Century Legend!',
    message: '100 days of cosmic mastery',
  },
  {
    days: 365,
    emoji: '🌌',
    title: 'Cosmic Champion!',
    message: 'A full year of dedication',
  },
];

function getMilestoneInfo(streak: number) {
  // Check if current streak matches a milestone exactly
  const exactMilestone = MILESTONES.find((m) => m.days === streak);
  if (exactMilestone) return { ...exactMilestone, isExact: true };

  // Find the highest milestone achieved
  const achieved = MILESTONES.filter((m) => streak >= m.days);
  if (achieved.length > 0) {
    const highest = achieved[achieved.length - 1];
    return { ...highest, isExact: false };
  }

  return null;
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
          <Flame className='w-5 h-5 text-lunary-rose' />
          <h2 className='text-lg font-semibold text-zinc-100'>Your Streak</h2>
        </div>
        <div className='space-y-3'>
          <div className='flex items-center justify-between'>
            <span className='text-sm text-zinc-400'>Current Streak</span>
            <span className='text-xl font-bold text-lunary-rose'>0 days</span>
          </div>
          <div className='pt-2 border-t border-zinc-800/60'>
            <p className='text-xs text-zinc-400'>
              Start your streak today! Check in to begin tracking.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const milestone = getMilestoneInfo(streak.current);
  const isCelebrating = milestone?.isExact;

  return (
    <div
      className={`rounded-2xl border p-4 md:p-6 transition-all duration-500 ${
        isCelebrating
          ? 'border-lunary-accent/50 bg-gradient-to-br from-lunary-primary-950/40 via-zinc-950/60 to-lunary-accent-950/30 shadow-lg shadow-lunary-accent/10'
          : 'border-zinc-800/60 bg-zinc-950/60'
      }`}
    >
      {/* Celebration Header for Milestones */}
      {isCelebrating && milestone && (
        <div className='mb-4 pb-3 border-b border-lunary-accent/20'>
          <div className='flex items-center gap-2 mb-1'>
            <span className='text-2xl animate-bounce'>{milestone.emoji}</span>
            <span className='text-lg font-bold bg-gradient-to-r from-lunary-accent to-lunary-primary-400 bg-clip-text text-transparent'>
              {milestone.title}
            </span>
            <Sparkles className='w-4 h-4 text-lunary-accent animate-pulse' />
          </div>
          <p className='text-sm text-lunary-accent-300/80'>
            {milestone.message}
          </p>
        </div>
      )}

      <div className='flex items-center gap-3 mb-3'>
        <Flame
          className={`w-5 h-5 ${isCelebrating ? 'text-lunary-accent animate-pulse' : 'text-lunary-rose'}`}
        />
        <h2 className='text-lg font-semibold text-zinc-100'>Your Streak</h2>
        {milestone && !isCelebrating && (
          <span className='ml-auto text-xs px-2 py-0.5 rounded-full bg-lunary-primary-900/40 text-lunary-primary-300'>
            {milestone.emoji} {milestone.title.replace('!', '')}
          </span>
        )}
      </div>

      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <span className='text-sm text-zinc-400'>Current Streak</span>
          <span
            className={`font-bold ${
              isCelebrating
                ? 'text-3xl bg-gradient-to-r from-lunary-accent to-lunary-primary-400 bg-clip-text text-transparent'
                : 'text-xl text-lunary-rose'
            }`}
          >
            {streak.current} {streak.current === 1 ? 'day' : 'days'}
          </span>
        </div>

        {streak.longest > streak.current && (
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-2'>
              <Trophy className='w-4 h-4 text-lunary-accent' />
              <span className='text-sm text-zinc-400'>Longest Streak</span>
            </div>
            <span className='text-lg font-semibold text-lunary-accent'>
              {streak.longest} {streak.longest === 1 ? 'day' : 'days'}
            </span>
          </div>
        )}

        {/* Next milestone progress (when not celebrating) */}
        {!isCelebrating && streak.current > 0 && (
          <NextMilestoneProgress current={streak.current} />
        )}

        <div className='pt-2 border-t border-zinc-800/60'>
          <p className='text-xs text-zinc-400 mb-3'>
            {streak.current === 0
              ? 'Start your streak today! Check in to begin tracking.'
              : isCelebrating
                ? 'Share your achievement with friends!'
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

function NextMilestoneProgress({ current }: { current: number }) {
  const nextMilestone = MILESTONES.find((m) => m.days > current);
  if (!nextMilestone) return null;

  const prevMilestone = [...MILESTONES]
    .reverse()
    .find((m) => m.days <= current);
  const startDays = prevMilestone?.days || 0;
  const progress =
    ((current - startDays) / (nextMilestone.days - startDays)) * 100;

  return (
    <div className='space-y-1.5'>
      <div className='flex items-center justify-between text-xs'>
        <span className='text-zinc-500'>Next milestone</span>
        <span className='text-zinc-400'>
          {nextMilestone.emoji} {nextMilestone.days} days
        </span>
      </div>
      <div className='h-1.5 bg-zinc-800 rounded-full overflow-hidden'>
        <div
          className='h-full bg-gradient-to-r from-lunary-primary to-lunary-accent transition-all duration-500'
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      <p className='text-[10px] text-zinc-500'>
        {nextMilestone.days - current} days to go
      </p>
    </div>
  );
}
