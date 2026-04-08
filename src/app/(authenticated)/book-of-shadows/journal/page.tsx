'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Plus, Sparkles, ArrowLeft, Moon, Star } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import { JournalEntry } from '@/app/api/journal/route';
import { JournalPattern } from '@/lib/journal/pattern-analyzer';
import { RecurringThemesCard } from '@/components/RecurringThemesCard';
import { ReferralShareCTA } from '@/components/referrals/ReferralShareCTA';

interface PatternCardProps {
  pattern: JournalPattern;
}

function PatternCard({ pattern }: PatternCardProps) {
  return (
    <div className='bg-gradient-to-br from-layer-base/30 to-indigo-900/30 border border-lunary-primary-700 rounded-lg p-4'>
      <div className='flex items-center gap-2 mb-2'>
        <Sparkles className='w-4 h-4 text-lunary-primary-400' />
        <span className='text-sm font-medium text-content-brand'>Pattern</span>
      </div>
      <p className='text-content-primary font-medium mb-1'>{pattern.title}</p>
      <p className='text-sm text-content-muted'>{pattern.description}</p>
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
    <div className='border-l-2 border-stroke-default pl-4 py-2'>
      <div className='flex items-center gap-2 mb-1'>
        <span className='text-sm text-content-muted'>{formattedDate}</span>
        {entry.moonPhase && (
          <span className='text-xs text-content-muted flex items-center gap-1'>
            <Moon className='w-3 h-3' />
            {entry.moonPhase}
          </span>
        )}
        {entry.source === 'chat' && (
          <span className='text-xs bg-surface-card px-2 py-0.5 rounded text-content-muted'>
            from chat
          </span>
        )}
      </div>
      <p className='text-content-primary'>{entry.content}</p>
      {(entry.moodTags.length > 0 || entry.cardReferences.length > 0) && (
        <div className='flex flex-wrap gap-2 mt-2'>
          {entry.moodTags.map((tag) => (
            <span
              key={tag}
              className='text-xs bg-layer-base/50 text-content-brand px-2 py-0.5 rounded'
            >
              {tag}
            </span>
          ))}
          {entry.cardReferences.map((card) => (
            <span
              key={card}
              className='text-xs bg-layer-base/50 text-content-brand px-2 py-0.5 rounded flex items-center gap-1'
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
      <div className='min-h-screen bg-surface-base flex items-center justify-center'>
        <div className='animate-pulse text-content-muted'>
          Loading your journal...
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-surface-base flex items-center justify-center p-4'>
        <div className='text-center'>
          <BookOpen className='w-12 h-12 text-lunary-primary-400 mx-auto mb-4' />
          <h1 className='text-xl font-bold text-content-primary mb-2'>
            Living Book of Shadows
          </h1>
          <p className='text-content-muted mb-4'>
            Sign in to view your reflections and patterns
          </p>
          <button
            onClick={() => router.push('/auth')}
            className='bg-lunary-primary-600 hover:bg-layer-high text-white px-6 py-2 rounded-lg transition-colors'
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-surface-base pb-24'>
      <header className='sticky top-0 z-10 bg-surface-base/90 backdrop-blur-sm border-b border-stroke-subtle px-4 py-4'>
        <div className='flex items-center gap-3'>
          <button
            onClick={() => router.push('/book-of-shadows')}
            className='p-2 -ml-2 hover:bg-surface-card rounded-lg transition-colors'
          >
            <ArrowLeft className='w-5 h-5 text-content-muted' />
          </button>
          <div>
            <h1 className='text-lg font-bold text-content-primary flex items-center gap-2'>
              <BookOpen className='w-5 h-5 text-lunary-primary-400' />
              Living Book of Shadows
            </h1>
            <p className='text-xs text-content-muted'>
              Your reflections and patterns connected
            </p>
          </div>
        </div>
      </header>

      <div className='px-4 py-3 space-y-4'>
        {showAddForm ? (
          <form onSubmit={handleSubmit} className='space-y-3'>
            <textarea
              value={newReflection}
              onChange={(e) => setNewReflection(e.target.value)}
              placeholder="What's on your mind today?"
              className='w-full bg-surface-elevated border border-stroke-default rounded-lg p-4 text-content-primary placeholder-zinc-500 focus:outline-none focus:border-lunary-primary resize-none'
              rows={4}
              autoFocus
            />
            <div className='flex gap-2'>
              <button
                type='submit'
                disabled={isSubmitting || !newReflection.trim()}
                className='flex-1 bg-lunary-primary-600 hover:bg-layer-high disabled:bg-lunary-primary-600/50 disabled:cursor-not-allowed text-white py-2 rounded-lg transition-colors'
              >
                {isSubmitting ? 'Saving...' : 'Save Reflection'}
              </button>
              <button
                type='button'
                onClick={() => {
                  setShowAddForm(false);
                  setNewReflection('');
                }}
                className='px-4 py-2 bg-surface-card hover:bg-surface-overlay text-content-secondary rounded-lg transition-colors'
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowAddForm(true)}
            className='w-full flex items-center justify-center gap-2 bg-surface-elevated hover:bg-surface-card border border-stroke-default rounded-lg p-4 text-content-secondary transition-colors'
          >
            <Plus className='w-5 h-5' />
            Add Reflection
          </button>
        )}

        {patterns.length > 0 && (
          <RecurringThemesCard
            title='Recurring themes'
            subtitle='Signals emerging from your recent reflections'
            items={patterns.slice(0, 3).map((pattern) => ({
              label: pattern.title,
              detail: pattern.description,
            }))}
          />
        )}

        {patterns.length > 0 && (
          <div className='space-y-3'>
            <h2 className='text-sm font-medium text-content-muted uppercase tracking-wide'>
              Patterns Detected
            </h2>
            {patterns.map((pattern, i) => (
              <PatternCard key={i} pattern={pattern} />
            ))}
          </div>
        )}

        <ReferralShareCTA
          compact
          message='Know someone who journals? They get 30 days of Pro free when they join Lunary.'
        />

        <div className='space-y-4'>
          <h2 className='text-sm font-medium text-content-muted uppercase tracking-wide'>
            Recent Reflections
          </h2>
          {entries.length === 0 ? (
            <div className='text-center py-8'>
              <Moon className='w-10 h-10 text-content-muted mx-auto mb-3' />
              <p className='text-content-muted'>No reflections yet</p>
              <p className='text-xs text-content-muted mt-1'>
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
      </div>
    </div>
  );
}
