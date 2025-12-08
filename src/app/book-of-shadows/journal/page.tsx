'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Sparkles, ArrowLeft, Moon, Star } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import { JournalEntry } from '@/app/api/journal/route';
import { JournalPattern } from '@/lib/journal/pattern-analyzer';

interface PatternCardProps {
  pattern: JournalPattern;
}

function PatternCard({ pattern }: PatternCardProps) {
  return (
    <div className='bg-gradient-to-br from-lunary-primary-900/30 to-indigo-900/30 border border-lunary-primary-700 rounded-lg p-4'>
      <div className='flex items-center gap-2 mb-2'>
        <Sparkles className='w-4 h-4 text-lunary-primary-400' />
        <span className='text-sm font-medium text-lunary-primary-300'>
          Pattern
        </span>
      </div>
      <p className='text-white font-medium mb-1'>{pattern.title}</p>
      <p className='text-sm text-zinc-400'>{pattern.description}</p>
    </div>
  );
}

interface EntryCardProps {
  entry: JournalEntry;
}

function EntryCard({ entry }: EntryCardProps) {
  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className='border-l-2 border-zinc-700 pl-4 py-2'>
      <div className='flex items-center gap-2 mb-1'>
        <span className='text-sm text-zinc-400'>{formattedDate}</span>
        {entry.moonPhase && (
          <span className='text-xs text-zinc-500 flex items-center gap-1'>
            <Moon className='w-3 h-3' />
            {entry.moonPhase}
          </span>
        )}
        {entry.source === 'chat' && (
          <span className='text-xs bg-zinc-800 px-2 py-0.5 rounded text-zinc-400'>
            from chat
          </span>
        )}
      </div>
      <p className='text-white'>{entry.content}</p>
      {(entry.moodTags.length > 0 || entry.cardReferences.length > 0) && (
        <div className='flex flex-wrap gap-2 mt-2'>
          {entry.moodTags.map((tag) => (
            <span
              key={tag}
              className='text-xs bg-lunary-primary-900/50 text-lunary-primary-300 px-2 py-0.5 rounded'
            >
              {tag}
            </span>
          ))}
          {entry.cardReferences.map((card) => (
            <span
              key={card}
              className='text-xs bg-lunary-primary-900/50 text-lunary-primary-300 px-2 py-0.5 rounded flex items-center gap-1'
            >
              <Star className='w-3 h-3' />
              {card}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function JournalPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuthStatus();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [patterns, setPatterns] = useState<JournalPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newReflection, setNewReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [entriesRes, patternsRes] = await Promise.all([
        fetch('/api/journal', { credentials: 'include' }),
        fetch('/api/journal/patterns', { credentials: 'include' }).catch(
          () => null,
        ),
      ]);

      if (entriesRes.ok) {
        const data = await entriesRes.json();
        setEntries(data.entries || []);
      }

      if (patternsRes?.ok) {
        const data = await patternsRes.json();
        setPatterns(data.patterns || []);
      }
    } catch (error) {
      console.error('Failed to load journal data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadData();
    } else if (!authLoading && !user) {
      setIsLoading(false);
    }
  }, [authLoading, user, loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReflection.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: newReflection }),
      });

      if (response.ok) {
        const data = await response.json();
        setEntries((prev) => [data.entry, ...prev]);
        setNewReflection('');
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Failed to save reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center'>
        <div className='animate-pulse text-zinc-400'>
          Loading your journal...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-zinc-950 flex items-center justify-center p-4'>
        <div className='text-center'>
          <BookOpen className='w-12 h-12 text-lunary-primary-400 mx-auto mb-4' />
          <h1 className='text-xl font-bold text-white mb-2'>
            Living Book of Shadows
          </h1>
          <p className='text-zinc-400 mb-4'>
            Sign in to view your reflections and patterns
          </p>
          <button
            onClick={() => router.push('/auth')}
            className='bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white px-6 py-2 rounded-lg transition-colors'
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-zinc-950 pb-24'>
      <header className='sticky top-0 z-10 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800 px-4 py-4'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => router.push('/book-of-shadows')}
            className='p-2 -ml-2 hover:bg-zinc-800 rounded-lg transition-colors'
          >
            <ArrowLeft className='w-5 h-5 text-zinc-400' />
          </button>
          <div>
            <h1 className='text-lg font-bold text-white flex items-center gap-2'>
              <BookOpen className='w-5 h-5 text-lunary-primary-400' />
              Living Book of Shadows
            </h1>
            <p className='text-xs text-zinc-500'>
              Your reflections and patterns connected
            </p>
          </div>
        </div>
      </header>

      <main className='px-4 py-6 space-y-6'>
        {showAddForm ? (
          <form onSubmit={handleSubmit} className='space-y-3'>
            <textarea
              value={newReflection}
              onChange={(e) => setNewReflection(e.target.value)}
              placeholder="What's on your mind today?"
              className='w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-lunary-primary resize-none'
              rows={4}
              autoFocus
            />
            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={isSubmitting || !newReflection.trim()}
                className='flex-1 bg-lunary-primary-600 hover:bg-lunary-primary-700 disabled:bg-lunary-primary-600/50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors'
              >
                {isSubmitting ? 'Saving...' : 'Save Reflection'}
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowAddForm(false);
                  setNewReflection('');
                }}
                className='px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg transition-colors'
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className='w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-zinc-300 transition-colors'
          >
            <Plus className='w-5 h-5' />
            Add Reflection
          </button>
        )}

        {patterns.length > 0 && (
          <div className='space-y-3'>
            <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-wide'>
              Patterns Detected
            </h2>
            {patterns.map((pattern, i) => (
              <PatternCard key={i} pattern={pattern} />
            ))}
          </div>
        )}

        <div className='space-y-4'>
          <h2 className='text-sm font-medium text-zinc-400 uppercase tracking-wide'>
            Recent Reflections
          </h2>
          {entries.length === 0 ? (
            <div className='text-center py-8'>
              <Moon className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
              <p className='text-zinc-500'>No reflections yet</p>
              <p className='text-xs text-zinc-600 mt-1'>
                Add a reflection or chat with your Astral Guide
              </p>
            </div>
          ) : (
            <div className='space-y-4'>
              {entries.map((entry) => (
                <EntryCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
