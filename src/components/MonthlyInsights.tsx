'use client';

import { useEffect, useState } from 'react';
import { Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { useAuthStatus } from './AuthStatus';

interface MonthlyInsight {
  month: number;
  year: number;
  frequentCards: Array<{ name: string; count: number }>;
  moodTrend: string;
  themes: string[];
}

export function MonthlyInsights() {
  const authState = useAuthStatus();
  const [insight, setInsight] = useState<MonthlyInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchMonthlyInsight = async () => {
      try {
        const response = await fetch('/api/insights/monthly', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          setInsight(data.insight);
        }
      } catch (error) {
        console.error('[MonthlyInsights] Failed to fetch:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMonthlyInsight();
  }, [authState.isAuthenticated]);

  if (!authState.isAuthenticated || isLoading || !insight) {
    return null;
  }

  const monthName = new Date(
    insight.year,
    insight.month - 1,
  ).toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className='rounded-2xl border border-zinc-800/60 bg-zinc-950/60 p-4 md:p-6'>
      <div className='flex items-center gap-3 mb-4'>
        <Calendar className='w-5 h-5 text-purple-400' />
        <h2 className='text-lg font-semibold text-zinc-100'>
          {monthName} Insights
        </h2>
      </div>

      <div className='space-y-4'>
        {insight.frequentCards.length > 0 ? (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='w-4 h-4 text-purple-400' />
              <h3 className='text-sm font-medium text-zinc-300'>
                Frequent Cards
              </h3>
            </div>
            <div className='flex flex-wrap gap-2'>
              {insight.frequentCards.slice(0, 3).map((card, idx) => (
                <span
                  key={idx}
                  className='text-xs px-2 py-1 rounded-lg border border-zinc-700/60 bg-zinc-900/40 text-zinc-300'
                >
                  {card.name} ({card.count}x)
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <TrendingUp className='w-4 h-4 text-purple-400' />
              <h3 className='text-sm font-medium text-zinc-300'>
                Frequent Cards
              </h3>
            </div>
            <p className='text-xs text-zinc-500'>
              No frequent cards yet this month. Start pulling cards to see your
              patterns!
            </p>
          </div>
        )}

        {insight.themes.length > 0 && (
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <Sparkles className='w-4 h-4 text-purple-400' />
              <h3 className='text-sm font-medium text-zinc-300'>Themes</h3>
            </div>
            <p className='text-xs text-zinc-400'>{insight.themes.join(', ')}</p>
          </div>
        )}

        {insight.moodTrend && (
          <div>
            <p className='text-xs text-zinc-400'>
              <span className='text-zinc-300 font-medium'>Mood trend:</span>{' '}
              {insight.moodTrend}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
