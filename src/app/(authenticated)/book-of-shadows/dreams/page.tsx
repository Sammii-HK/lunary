'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Moon, ChevronLeft, Feather, Sparkles } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import { DreamTagChips } from '@/components/journal/DreamTagChips';

interface DreamEntry {
  id: number;
  content: string;
  moodTags: string[];
  moonPhase?: string;
  source: string;
  createdAt: string;
  dreamTags: string[];
}

function DreamCard({ entry }: { entry: DreamEntry }) {
  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='border-l-2 border-indigo-700/50 pl-4 py-4'>
      <div className='flex items-center gap-2 mb-2'>
        <span className='text-sm text-zinc-400'>{formattedDate}</span>
        {entry.moonPhase && (
          <span className='text-xs text-zinc-500 flex items-center gap-1'>
            <Moon className='w-3 h-3' />
            {entry.moonPhase}
          </span>
        )}
        {entry.source === 'astral-guide' && (
          <span className='text-xs bg-indigo-900/30 text-indigo-300 px-2 py-0.5 rounded'>
            via guide
          </span>
        )}
      </div>
      <p className='text-white text-sm leading-relaxed line-clamp-4'>
        {entry.content}
      </p>
      <DreamTagChips entry={entry} className='mt-2' />
    </div>
  );
}

export default function DreamsPage() {
  const { user, loading: authLoading } = useAuthStatus();
  const [entries, setEntries] = useState<DreamEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDreams = useCallback(async () => {
    try {
      const response = await fetch('/api/journal/dreams?limit=50', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setEntries(data.entries || []);
      }
    } catch (error) {
      console.error('Failed to load dreams:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadDreams();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [authLoading, user, loadDreams]);

  if (authLoading || isLoading) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='animate-pulse text-zinc-400'>
          Gathering your dreams...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center p-4'>
        <div className='text-center max-w-sm'>
          <Moon className='w-12 h-12 text-indigo-400 mx-auto mb-4' />
          <h1 className='text-xl font-bold text-white mb-2'>Your Dreams</h1>
          <p className='text-zinc-400 mb-6'>
            Track your dreams and discover patterns in your subconscious
          </p>
          <Link
            href='/auth'
            className='inline-block bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white px-6 py-3 rounded-lg transition-colors'
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 pb-24'>
      <header className='sticky top-0 z-10 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800'>
        <div className='px-4 py-4'>
          <div className='flex items-center gap-3'>
            <Link
              href='/book-of-shadows'
              className='p-2 -ml-2 text-zinc-400 hover:text-white transition-colors'
            >
              <ChevronLeft className='w-5 h-5' />
            </Link>
            <div>
              <h1 className='text-lg font-bold text-white flex items-center gap-2'>
                <Moon className='w-5 h-5 text-indigo-400' />
                Your Dreams
              </h1>
              <p className='text-xs text-zinc-400'>
                {entries.length} dream{entries.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className='px-4 py-6'>
        {entries.length === 0 ? (
          <div className='text-center py-16'>
            <Moon className='w-12 h-12 text-zinc-700 mx-auto mb-4' />
            <p className='text-zinc-400 mb-2'>No dreams recorded yet</p>
            <p className='text-xs text-zinc-500 max-w-xs mx-auto mb-6'>
              When you record dreams, they will appear here, tagged with symbols
              and feelings so you can track patterns over time.
            </p>
            <div className='space-y-3 max-w-xs mx-auto'>
              <Link
                href='/book-of-shadows'
                className='flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-zinc-300 transition-colors'
              >
                <Feather className='w-4 h-4' />
                Write about a dream
              </Link>
              <Link
                href='/guide'
                className='flex items-center justify-center gap-2 bg-indigo-900/30 hover:bg-indigo-900/50 border border-indigo-700/50 rounded-lg p-3 text-indigo-300 transition-colors'
              >
                <Sparkles className='w-4 h-4' />
                Talk to Astral Guide about a dream
              </Link>
            </div>
          </div>
        ) : (
          <div className='space-y-1'>
            {entries.map((entry) => (
              <DreamCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
