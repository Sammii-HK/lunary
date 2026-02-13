'use client';

import { useState, useEffect } from 'react';
import {
  Trophy,
  Star,
  Sparkles,
  Calendar,
  BookOpen,
  Flame,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Milestone {
  id: number;
  type: string;
  key: string;
  data: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
  achievedAt: string;
  celebrated: boolean;
}

const TYPE_ICONS: Record<string, typeof Trophy> = {
  solar_return: Star,
  lunar_return: Star,
  saturn_return: Star,
  app_anniversary: Calendar,
  reading_count: Sparkles,
  journal_count: BookOpen,
  streak: Flame,
};

const TYPE_COLORS: Record<string, string> = {
  solar_return: 'text-amber-400 bg-amber-900/30',
  lunar_return: 'text-indigo-400 bg-indigo-900/30',
  saturn_return: 'text-zinc-300 bg-zinc-800',
  app_anniversary: 'text-lunary-primary-400 bg-lunary-primary-900/30',
  reading_count: 'text-lunary-accent bg-lunary-accent/20',
  journal_count: 'text-emerald-400 bg-emerald-900/30',
  streak: 'text-orange-400 bg-orange-900/30',
};

export function MilestonesTimeline() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMilestones = async () => {
      try {
        const res = await fetch('/api/milestones', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMilestones(data.milestones || []);
        }
      } catch {
        // Silent
      } finally {
        setIsLoading(false);
      }
    };
    fetchMilestones();
  }, []);

  if (isLoading) {
    return (
      <div className='space-y-3'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-16 bg-zinc-900/50 rounded-lg animate-pulse'
          />
        ))}
      </div>
    );
  }

  if (milestones.length === 0) {
    return (
      <div className='text-center py-8'>
        <Trophy className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
        <p className='text-zinc-400 text-sm'>No milestones yet</p>
        <p className='text-xs text-zinc-500 mt-1'>
          Keep practicing to unlock cosmic milestones
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-0'>
      {milestones.map((milestone, index) => {
        const Icon = TYPE_ICONS[milestone.type] || Trophy;
        const colorClass =
          TYPE_COLORS[milestone.type] || 'text-zinc-400 bg-zinc-800';
        const date = new Date(milestone.achievedAt);
        const formattedDate = date.toLocaleDateString('en-GB', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
        const title = milestone.data.title || milestone.key.replace(/_/g, ' ');

        return (
          <div key={milestone.id} className='flex gap-3'>
            {/* Timeline line */}
            <div className='flex flex-col items-center'>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                  colorClass,
                )}
              >
                <Icon className='w-4 h-4' />
              </div>
              {index < milestones.length - 1 && (
                <div className='w-px h-full bg-zinc-800 min-h-[24px]' />
              )}
            </div>

            {/* Content */}
            <div className='pb-4'>
              <p className='text-sm font-medium text-white'>{title}</p>
              <p className='text-xs text-zinc-500 mt-0.5'>{formattedDate}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
