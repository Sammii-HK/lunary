'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  BookOpen,
  Star,
  Sparkles,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface JournalEntry {
  id: number;
  content: string;
  moodTags: string[];
  cardReferences: string[];
  moonPhase: string | null;
  category: string;
  createdAt: string;
}

interface TarotReading {
  id: string;
  spreadSlug: string;
  cards: any[];
  summary: string;
  highlights: string[];
  createdAt: string;
}

interface ThisTimeLastYearData {
  hasData: boolean;
  dateRange: {
    start: string;
    end: string;
    centerDate: string;
  };
  summary: {
    journalCount: number;
    tarotCount: number;
    frequentCards: Array<{ name: string; count: number }>;
    dominantMoods: Array<{ mood: string; count: number }>;
  };
  journalEntries: JournalEntry[];
  tarotReadings: TarotReading[];
}

interface ThisTimeLastYearProps {
  className?: string;
}

export function ThisTimeLastYear({ className = '' }: ThisTimeLastYearProps) {
  const [data, setData] = useState<ThisTimeLastYearData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/history/this-time-last-year', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        setError('Unable to load historical data');
        console.error('[ThisTimeLastYear] Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div
        className={`rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 ${className}`}
      >
        <div className='flex items-center gap-2 mb-3'>
          <Clock className='w-4 h-4 text-zinc-600' />
          <div className='h-4 w-32 bg-zinc-800 rounded animate-pulse' />
        </div>
        <div className='h-16 bg-zinc-800/50 rounded animate-pulse' />
      </div>
    );
  }

  if (error || !data) {
    return null; // Silently fail if no data
  }

  if (!data.hasData) {
    return (
      <div
        className={`rounded-xl border border-zinc-800/60 bg-zinc-950/40 p-4 ${className}`}
      >
        <div className='flex items-center gap-2 mb-2'>
          <Clock className='w-4 h-4 text-zinc-600' />
          <h3 className='text-sm font-medium text-zinc-400'>
            This Time Last Year
          </h3>
        </div>
        <p className='text-xs text-zinc-500'>
          Keep using Lunary and you'll see your journey from a year ago here.
        </p>
      </div>
    );
  }

  const centerDate = new Date(data.dateRange.centerDate);
  const formattedDate = centerDate.toLocaleDateString('en-GB', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      className={`rounded-xl border border-lunary-secondary-800/50 bg-gradient-to-br from-lunary-secondary-950/30 to-zinc-950 overflow-hidden ${className}`}
    >
      {/* Header - Always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className='w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/20 transition-colors'
      >
        <div className='flex items-center gap-3'>
          <div className='p-2 rounded-lg bg-lunary-secondary-900/50'>
            <Clock className='w-4 h-4 text-lunary-secondary-400' />
          </div>
          <div>
            <h3 className='text-sm font-medium text-zinc-200'>
              This Time Last Year
            </h3>
            <p className='text-xs text-zinc-500'>{formattedDate}</p>
          </div>
        </div>
        <div className='flex items-center gap-3'>
          <div className='flex items-center gap-2 text-xs text-zinc-400'>
            {data.summary.journalCount > 0 && (
              <span className='flex items-center gap-1'>
                <BookOpen className='w-3 h-3' />
                {data.summary.journalCount}
              </span>
            )}
            {data.summary.tarotCount > 0 && (
              <span className='flex items-center gap-1'>
                <Star className='w-3 h-3' />
                {data.summary.tarotCount}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronDown className='w-4 h-4 text-zinc-500' />
          ) : (
            <ChevronRight className='w-4 h-4 text-zinc-500' />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className='px-4 pb-4 space-y-4 border-t border-zinc-800/50'>
          {/* Summary Stats */}
          <div className='pt-4 grid grid-cols-2 gap-3'>
            {data.summary.frequentCards.length > 0 && (
              <div className='rounded-lg bg-zinc-900/50 p-3'>
                <p className='text-[10px] uppercase tracking-wide text-zinc-500 mb-2'>
                  Cards You Were Pulling
                </p>
                <div className='flex flex-wrap gap-1'>
                  {data.summary.frequentCards.slice(0, 3).map((card) => (
                    <span
                      key={card.name}
                      className='text-xs px-2 py-0.5 rounded bg-lunary-primary-900/40 text-lunary-primary-300'
                    >
                      {card.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {data.summary.dominantMoods.length > 0 && (
              <div className='rounded-lg bg-zinc-900/50 p-3'>
                <p className='text-[10px] uppercase tracking-wide text-zinc-500 mb-2'>
                  How You Were Feeling
                </p>
                <div className='flex flex-wrap gap-1'>
                  {data.summary.dominantMoods.slice(0, 3).map((mood) => (
                    <span
                      key={mood.mood}
                      className='text-xs px-2 py-0.5 rounded bg-lunary-secondary-900/40 text-lunary-secondary-300'
                    >
                      {mood.mood}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Journal Entries Preview */}
          {data.journalEntries.length > 0 && (
            <div className='space-y-2'>
              <p className='text-[10px] uppercase tracking-wide text-zinc-500'>
                What You Wrote
              </p>
              {data.journalEntries.slice(0, 2).map((entry) => (
                <div
                  key={entry.id}
                  className='rounded-lg bg-zinc-900/30 p-3 border-l-2 border-lunary-secondary-700'
                >
                  <p className='text-xs text-zinc-300 line-clamp-2'>
                    {entry.content}
                  </p>
                  <p className='text-[10px] text-zinc-500 mt-1'>
                    {new Date(entry.createdAt).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                    })}
                    {entry.moonPhase && ` • ${entry.moonPhase}`}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Tarot Readings Preview */}
          {data.tarotReadings.length > 0 && (
            <div className='space-y-2'>
              <p className='text-[10px] uppercase tracking-wide text-zinc-500'>
                Readings You Did
              </p>
              {data.tarotReadings.slice(0, 2).map((reading) => (
                <div
                  key={reading.id}
                  className='rounded-lg bg-zinc-900/30 p-3 border-l-2 border-lunary-primary-700'
                >
                  <div className='flex items-center gap-2 mb-1'>
                    <Sparkles className='w-3 h-3 text-lunary-primary-400' />
                    <span className='text-xs text-zinc-300'>
                      {reading.spreadSlug?.replace(/-/g, ' ') ||
                        'Tarot Reading'}
                    </span>
                  </div>
                  {reading.summary && (
                    <p className='text-xs text-zinc-400 line-clamp-2'>
                      {reading.summary}
                    </p>
                  )}
                  <p className='text-[10px] text-zinc-500 mt-1'>
                    {new Date(reading.createdAt).toLocaleDateString('en-GB', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Reflection Prompt */}
          <div className='rounded-lg bg-lunary-secondary-950/50 border border-lunary-secondary-800/30 p-3'>
            <p className='text-xs text-lunary-secondary-300'>
              <span className='font-medium'>Reflect:</span> How have things
              changed since then? What themes are still present in your life?
            </p>
          </div>

          {/* Link to full journal */}
          <Link
            href='/book-of-shadows?tab=journal'
            className='block text-center text-xs text-lunary-secondary-400 hover:text-lunary-secondary-300 transition-colors'
          >
            View your full journal →
          </Link>
        </div>
      )}
    </div>
  );
}
