'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles, Sunrise, Sunset } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';

interface RitualPrompt {
  time: 'morning' | 'evening';
  prompt: string;
  icon: string;
}

export function DailyRitualPrompt() {
  const authState = useAuthStatus();
  const [ritualPrompt, setRitualPrompt] = useState<RitualPrompt | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const generatePrompt = () => {
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
        {
          time: 'evening' as const,
          prompt: 'Reflect on your day',
          icon: '🌙',
        },
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
      setIsLoading(false);
    };

    generatePrompt();
  }, []);

  if (isLoading || !ritualPrompt) {
    return null;
  }

  const handleRitualClick = async () => {
    try {
      await fetch('/api/ritual/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ritualType: ritualPrompt.time,
          metadata: { prompt: ritualPrompt.prompt },
        }),
      });
    } catch (error) {
      // Silently fail - don't interrupt user experience
      console.error('[DailyRitualPrompt] Failed to track ritual:', error);
    }
  };

  return (
    <Link
      href={`/book-of-shadows?prompt=${encodeURIComponent(ritualPrompt.prompt)}`}
      onClick={handleRitualClick}
      className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 md:p-6 hover:border-purple-500/40 transition-colors'
    >
      <div className='flex items-center gap-3 mb-2'>
        {ritualPrompt.time === 'morning' ? (
          <Sunrise className='w-5 h-5 text-yellow-500' />
        ) : (
          <Sunset className='w-5 h-5 text-purple-500' />
        )}
        <h3 className='text-lg font-semibold text-zinc-100'>
          {ritualPrompt.time === 'morning' ? 'Morning' : 'Evening'} Ritual
        </h3>
      </div>
      <p className='text-sm text-zinc-300 mb-3'>{ritualPrompt.prompt}</p>
      <div className='flex items-center gap-2 text-xs text-purple-400'>
        <Sparkles className='w-4 h-4' />
        <span>Explore in Book of Shadows</span>
      </div>
    </Link>
  );
}
