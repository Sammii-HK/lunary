'use client';

import { useState, useEffect } from 'react';
import { useAccount } from 'jazz-tools/react';
import { Sparkles } from 'lucide-react';

export function WeeklyUsageCounter() {
  const { me } = useAccount();
  const [weeklyCount, setWeeklyCount] = useState<number | null>(null);
  const userId = (me as any)?.id;

  useEffect(() => {
    // Calculate weekly usage count
    // This would ideally come from an API that tracks user actions
    // For now, we'll use localStorage to track weekly insights accessed
    const getWeeklyCount = () => {
      const storageKey = `weekly_insights_${userId || 'anonymous'}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const { count, weekStart } = JSON.parse(stored);
        const now = new Date();
        const weekStartDate = new Date(weekStart);
        const daysSince = Math.floor(
          (now.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        // If it's a new week, reset count
        if (daysSince >= 7) {
          localStorage.setItem(
            storageKey,
            JSON.stringify({ count: 0, weekStart: now.toISOString() }),
          );
          return 0;
        }

        return count || 0;
      }

      // Initialize for new week
      localStorage.setItem(
        storageKey,
        JSON.stringify({ count: 0, weekStart: new Date().toISOString() }),
      );
      return 0;
    };

    const count = getWeeklyCount();
    setWeeklyCount(count);

    // Listen for insight access events
    const handleInsightAccess = () => {
      const storageKey = `weekly_insights_${userId || 'anonymous'}`;
      const stored = localStorage.getItem(storageKey);

      if (stored) {
        const { count, weekStart } = JSON.parse(stored);
        const weekStartDate = new Date(weekStart);
        const now = new Date();
        const daysSince = Math.floor(
          (now.getTime() - weekStartDate.getTime()) / (1000 * 60 * 60 * 24),
        );

        if (daysSince < 7) {
          const newCount = count + 1;
          localStorage.setItem(
            storageKey,
            JSON.stringify({ count: newCount, weekStart }),
          );
          setWeeklyCount(newCount);
        } else {
          // New week
          localStorage.setItem(
            storageKey,
            JSON.stringify({ count: 1, weekStart: now.toISOString() }),
          );
          setWeeklyCount(1);
        }
      } else {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ count: 1, weekStart: new Date().toISOString() }),
        );
        setWeeklyCount(1);
      }
    };

    // Listen for custom events when insights are accessed
    window.addEventListener('insight-accessed', handleInsightAccess);

    return () => {
      window.removeEventListener('insight-accessed', handleInsightAccess);
    };
  }, [userId]);

  if (weeklyCount === null) {
    return null;
  }

  return (
    <div className='flex items-center gap-2 px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 backdrop-blur-sm'>
      <Sparkles className='w-4 h-4 text-purple-300/90' strokeWidth={2} />
      <span className='text-sm font-medium text-purple-300/90'>
        This week you accessed {weeklyCount} cosmic insight
        {weeklyCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
