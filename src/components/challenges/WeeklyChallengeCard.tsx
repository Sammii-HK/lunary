'use client';

import { useState, useEffect } from 'react';
import { Flame, Check, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  todayPrompt: string | null;
  todayIndex: number;
  participantCount: number;
  dailyPrompts: string[];
}

interface CompletionData {
  date: string;
  completed: boolean;
}

export function WeeklyChallengeCard() {
  const [challenge, setChallenge] = useState<ChallengeData | null>(null);
  const [completions, setCompletions] = useState<CompletionData[]>([]);
  const [completedToday, setCompletedToday] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    const fetchChallenge = async () => {
      try {
        const res = await fetch('/api/challenges/current', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setChallenge(data.challenge);
          setCompletions(data.completions || []);
          setCompletedToday(data.completedToday || false);
        }
      } catch {
        // Silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallenge();
  }, []);

  const handleCheckIn = async () => {
    if (!challenge || isCheckingIn || completedToday) return;
    setIsCheckingIn(true);

    try {
      const res = await fetch('/api/challenges/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ challengeId: challenge.id }),
      });

      if (res.ok) {
        setCompletedToday(true);
        const today = new Date().toISOString().split('T')[0];
        setCompletions((prev) => [...prev, { date: today, completed: true }]);
      }
    } catch {
      // Silent
    } finally {
      setIsCheckingIn(false);
    }
  };

  if (isLoading) {
    return <div className='h-24 bg-zinc-900/50 rounded-xl animate-pulse' />;
  }

  if (!challenge) return null;

  // Build 7-day progress dots
  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  const completedDates = new Set(
    completions
      .filter((c) => c.completed)
      .map((c) => new Date(c.date).toISOString().split('T')[0]),
  );

  // Calculate dates for each day of the week
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);

  return (
    <div className='bg-gradient-to-br from-amber-950/20 to-zinc-900/50 border border-amber-900/30 rounded-xl p-4'>
      <div className='flex items-start gap-3'>
        <div className='w-8 h-8 bg-amber-900/30 rounded-lg flex items-center justify-center shrink-0'>
          <Flame className='w-4 h-4 text-amber-400' />
        </div>
        <div className='flex-1 min-w-0'>
          <p className='text-[0.65rem] uppercase tracking-widest text-amber-400/70 mb-0.5'>
            Weekly Challenge
          </p>
          <p className='text-sm font-medium text-white truncate'>
            {challenge.title}
          </p>
          {challenge.todayPrompt && (
            <p className='text-xs text-zinc-400 mt-1 line-clamp-2'>
              {challenge.todayPrompt}
            </p>
          )}
        </div>
      </div>

      {/* 7-day progress */}
      <div className='flex items-center gap-1.5 mt-3'>
        {dayLabels.map((label, i) => {
          const dayDate = new Date(monday);
          dayDate.setDate(monday.getDate() + i);
          const dateStr = dayDate.toISOString().split('T')[0];
          const isCompleted = completedDates.has(dateStr);
          const isToday = i === (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
          const isFuture = dayDate > now;

          return (
            <div key={i} className='flex flex-col items-center gap-0.5 flex-1'>
              <span className='text-[0.55rem] text-zinc-500'>{label}</span>
              <div
                className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center',
                  isCompleted
                    ? 'bg-amber-500 text-white'
                    : isToday
                      ? 'border-2 border-amber-500/50 text-amber-400'
                      : isFuture
                        ? 'border border-zinc-800 text-zinc-700'
                        : 'border border-zinc-700 text-zinc-600',
                )}
              >
                {isCompleted ? (
                  <Check className='w-3 h-3' />
                ) : (
                  <Circle className='w-2 h-2' />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Check-in button */}
      <div className='mt-3 flex items-center justify-between'>
        <span className='text-[0.6rem] text-zinc-500'>
          {challenge.participantCount} participant
          {challenge.participantCount !== 1 ? 's' : ''}
        </span>
        {completedToday ? (
          <span className='text-xs text-amber-400 flex items-center gap-1'>
            <Check className='w-3 h-3' />
            Done today
          </span>
        ) : (
          <Button
            size='sm'
            onClick={handleCheckIn}
            disabled={isCheckingIn}
            className='text-xs bg-amber-600/20 text-amber-300 hover:bg-amber-600/30 border border-amber-700/30'
          >
            {isCheckingIn ? '...' : 'Check In'}
          </Button>
        )}
      </div>
    </div>
  );
}
