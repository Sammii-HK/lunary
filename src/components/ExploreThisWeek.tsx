'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown,
  ChevronUp,
  Calendar,
  Sparkles,
  BookOpen,
  Lightbulb,
  Target,
  Sunrise,
  Sunset,
} from 'lucide-react';

interface WeekDay {
  date: string;
  moonPhase: {
    name: string;
    emoji: string;
    sign: string;
    isSignificant: boolean;
  };
  topTransits: Array<{
    name: string;
    aspect: string;
    energy: string;
  }>;
  actionableInsight: string;
  bestActivity: {
    activity: string;
    icon: string;
  };
}

interface WeeklyData {
  weekData: WeekDay[];
  weeklyTheme: string;
  personalInsights: string[];
}

export function ExploreThisWeek() {
  const [data, setData] = useState<WeeklyData | null>(null);
  const [isExpanded, setIsExpanded] = useState(false); // Collapsed by default to reduce clutter
  const [isLoading, setIsLoading] = useState(true);
  const [ritualPrompt, setRitualPrompt] = useState<{
    time: 'morning' | 'evening';
    prompt: string;
    icon: string;
  } | null>(null);

  useEffect(() => {
    const fetchWeekData = async () => {
      try {
        const response = await fetch('/api/cosmic/weekly', {
          credentials: 'include',
        });
        if (response.ok) {
          const result = await response.json();
          setData(result);
        }
      } catch (error) {
        console.error('[ExploreThisWeek] Failed to fetch data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    // Generate ritual prompt
    const generateRitualPrompt = () => {
      const hour = new Date().getHours();
      const isMorning = hour >= 6 && hour < 14;
      const time = isMorning ? 'morning' : 'evening';

      const morningPrompts = [
        {
          time: 'morning' as const,
          prompt: 'Set your intention for today',
          icon: '🌅',
        },
        {
          time: 'morning' as const,
          prompt: 'What energy do you want to invite in today?',
          icon: '✨',
        },
        {
          time: 'morning' as const,
          prompt: 'Begin your day with mindful intention',
          icon: '🌄',
        },
      ];

      const eveningPrompts = [
        { time: 'evening' as const, prompt: 'Reflect on your day', icon: '🌙' },
        {
          time: 'evening' as const,
          prompt: 'What are you grateful for today?',
          icon: '💫',
        },
        {
          time: 'evening' as const,
          prompt: 'Release what no longer serves you',
          icon: '🌆',
        },
      ];

      const prompts = isMorning ? morningPrompts : eveningPrompts;
      const dayOfYear = Math.floor(
        (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
          86400000,
      );
      const selected = prompts[dayOfYear % prompts.length];
      setRitualPrompt(selected);
    };

    fetchWeekData();
    generateRitualPrompt();
  }, []);

  if (isLoading) {
    return (
      <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 md:p-6'>
        <div className='h-32 bg-zinc-900/50 rounded-lg animate-pulse' />
      </div>
    );
  }

  if (!data || data.weekData.length === 0) {
    return null;
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    }
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const significantDays = data.weekData.filter(
    (day: WeekDay) =>
      day.moonPhase.isSignificant ||
      day.topTransits.some(
        (t: { aspect: string }) =>
          t.aspect === 'ingress' || t.aspect === 'retrograde',
      ),
  );

  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-3 md:p-4'>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex w-full items-center justify-between mb-3'
      >
        <div className='flex items-center gap-2'>
          <Calendar className='w-4 h-4 text-lunary-accent' />
          <h2 className='text-base font-semibold text-zinc-100'>
            Explore This Week
          </h2>
        </div>
        {isExpanded ? (
          <ChevronUp className='w-4 h-4 text-zinc-400' />
        ) : (
          <ChevronDown className='w-4 h-4 text-zinc-400' />
        )}
      </button>

      {isExpanded && (
        <div className='space-y-3'>
          {/* Weekly Theme */}
          {data.weeklyTheme && (
            <div className='rounded-lg border border-lunary-primary-700 bg-lunary-primary-950 p-2.5'>
              <div className='flex items-start gap-2'>
                <Sparkles className='w-3.5 h-3.5 text-lunary-accent mt-0.5 flex-shrink-0' />
                <p className='text-xs text-zinc-200 leading-relaxed'>
                  {data.weeklyTheme}
                </p>
              </div>
            </div>
          )}

          {/* Best Days for Action - More Compact */}
          {significantDays.length > 0 && (
            <div className='space-y-1.5'>
              <h3 className='text-xs font-medium text-zinc-300 flex items-center gap-1.5'>
                <Target className='w-3.5 h-3.5' />
                Best Days This Week
              </h3>
              <div className='space-y-1.5'>
                {significantDays
                  .slice(0, 3)
                  .map((day: WeekDay, idx: number) => (
                    <div
                      key={idx}
                      className='rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-2'
                    >
                      <div className='flex items-center justify-between mb-1'>
                        <span className='text-xs font-medium text-zinc-200'>
                          {formatDate(day.date)}
                        </span>
                        <span className='text-base'>{day.moonPhase.emoji}</span>
                      </div>
                      <div className='flex items-center gap-1.5 mb-1'>
                        <span className='text-xs'>{day.bestActivity.icon}</span>
                        <p className='text-xs text-lunary-accent-300 font-medium'>
                          {day.bestActivity.activity}
                        </p>
                      </div>
                      <p className='text-xs text-zinc-500 leading-tight'>
                        {day.actionableInsight}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Quick Actions with Ritual */}
          <div className='flex flex-wrap gap-1.5 pt-2 border-t border-zinc-800/60'>
            {ritualPrompt && (
              <Link
                href={`/book-of-shadows?prompt=${encodeURIComponent(ritualPrompt.prompt)}`}
                className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800/60 hover:border-lunary-primary-600'
              >
                {ritualPrompt.time === 'morning' ? (
                  <Sunrise className='w-3.5 h-3.5 text-lunary-accent' />
                ) : (
                  <Sunset className='w-3.5 h-3.5 text-lunary-primary' />
                )}
                <span className='text-xs'>
                  {ritualPrompt.time === 'morning' ? 'Morning' : 'Evening'}{' '}
                  Ritual
                </span>
              </Link>
            )}
            <Link
              href='/book-of-shadows?prompt=weekly overview'
              className='inline-flex items-center gap-1.5 rounded-lg border border-lunary-primary-600 bg-lunary-primary-950 px-2.5 py-1.5 text-xs text-lunary-accent-300 transition hover:bg-lunary-primary-900 hover:border-lunary-primary'
            >
              <Sparkles className='w-3.5 h-3.5' />
              Weekly Overview
            </Link>
            <Link
              href='/tarot'
              className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800/60 hover:border-lunary-primary-600'
            >
              <BookOpen className='w-3.5 h-3.5' />
              Tarot
            </Link>
            <Link
              href='/horoscope'
              className='inline-flex items-center gap-1.5 rounded-lg border border-zinc-700/60 bg-zinc-900/40 px-2.5 py-1.5 text-xs text-zinc-300 transition hover:bg-zinc-800/60 hover:border-lunary-primary-600'
            >
              <Calendar className='w-3.5 h-3.5' />
              Horoscope
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
