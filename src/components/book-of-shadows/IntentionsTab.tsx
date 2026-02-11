'use client';

import { useState, useEffect, useCallback } from 'react';
import { Target, Plus, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { IntentionCard } from './IntentionCard';
import { SkillProgressWidget } from '@/components/progress/SkillProgressWidget';

interface IntentionEntry {
  id: number;
  content: {
    text: string;
    intentionCategory?: string;
    status: string;
    moonPhase?: string;
    moonSign?: string;
    source?: string;
    manifestedAt?: string | null;
    releasedAt?: string | null;
    progressNotes?: Array<{ note: string; date: string }>;
  };
  createdAt: string;
}

const INTENTION_CATEGORIES = [
  { value: 'career', label: 'Career' },
  { value: 'love', label: 'Love' },
  { value: 'health', label: 'Health' },
  { value: 'spiritual', label: 'Spiritual' },
  { value: 'financial', label: 'Financial' },
  { value: 'creative', label: 'Creative' },
  { value: 'personal', label: 'Personal Growth' },
  { value: 'other', label: 'Other' },
];

export function IntentionsTab() {
  const [intentions, setIntentions] = useState<IntentionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newIntentionText, setNewIntentionText] = useState('');
  const [newCategory, setNewCategory] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const loadIntentions = useCallback(async () => {
    try {
      const res = await fetch('/api/collections?category=intention&limit=100', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        const mapped = (data.collections || []).map(
          (c: {
            id: number;
            content: IntentionEntry['content'];
            createdAt: string;
          }) => ({
            id: c.id,
            content: c.content,
            createdAt: c.createdAt,
          }),
        );
        setIntentions(mapped);
      }
    } catch (err) {
      console.error('Failed to load intentions:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIntentions();
  }, [loadIntentions]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntentionText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/collections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: newIntentionText.trim().slice(0, 80),
          category: 'intention',
          content: {
            text: newIntentionText.trim(),
            intentionCategory: newCategory,
            status: 'active',
            source: 'manual',
            manifestedAt: null,
            releasedAt: null,
            progressNotes: [],
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error?.includes('3 active')) {
          setError(
            'Free users can have up to 3 active intentions. Upgrade for unlimited.',
          );
        } else {
          setError(data.error || 'Failed to create intention');
        }
        return;
      }

      const data = await res.json();
      setIntentions((prev) => [
        {
          id: data.collection.id,
          content: data.collection.content,
          createdAt: data.collection.createdAt,
        },
        ...prev,
      ]);
      setNewIntentionText('');
      setShowCreateForm(false);
    } catch (err) {
      console.error('Failed to create intention:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      const res = await fetch(`/api/intentions/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const data = await res.json();
        setIntentions((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, content: data.intention.content } : i,
          ),
        );
      }
    } catch (err) {
      console.error('Failed to update intention:', err);
    }
  };

  const activeIntentions = intentions.filter(
    (i) =>
      i.content.status === 'active' ||
      i.content.status === 'progressing' ||
      i.content.status === 'blocked',
  );
  const completedIntentions = intentions.filter(
    (i) => i.content.status === 'manifested' || i.content.status === 'released',
  );

  if (isLoading) {
    return (
      <div className='flex items-center justify-center py-12'>
        <div className='animate-pulse text-zinc-400 text-sm'>
          Loading intentions...
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <SkillProgressWidget skillTree='manifestation' className='mb-3' />

      {showCreateForm ? (
        <form onSubmit={handleCreate} className='space-y-3'>
          <textarea
            value={newIntentionText}
            onChange={(e) => setNewIntentionText(e.target.value)}
            placeholder='What do you want to manifest? Be specific...'
            className='w-full bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-lunary-primary resize-none'
            rows={3}
            maxLength={500}
            autoFocus
          />
          <select
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className='w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-lunary-primary'
          >
            {INTENTION_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          {error && <p className='text-sm text-red-400'>{error}</p>}
          <div className='flex gap-2'>
            <Button
              type='submit'
              disabled={isSubmitting || !newIntentionText.trim()}
              className='flex-1'
            >
              {isSubmitting ? 'Setting...' : 'Set Intention'}
            </Button>
            <Button
              type='button'
              variant='outline'
              onClick={() => {
                setShowCreateForm(false);
                setNewIntentionText('');
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowCreateForm(true)}
          className='w-full flex items-center justify-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-zinc-300 transition-colors'
        >
          <Plus className='w-5 h-5' />
          Set New Intention
        </button>
      )}

      {/* Active intentions */}
      {activeIntentions.length === 0 && completedIntentions.length === 0 ? (
        <div className='text-center py-12'>
          <Target className='w-10 h-10 text-zinc-700 mx-auto mb-3' />
          <p className='text-zinc-400'>No intentions yet</p>
          <p className='text-xs text-zinc-500 mt-1'>
            Set an intention to start manifesting with cosmic alignment
          </p>
        </div>
      ) : (
        <>
          {activeIntentions.length > 0 && (
            <div className='space-y-1'>
              <p className='text-[0.65rem] uppercase tracking-widest text-zinc-500 mb-2'>
                Active intentions ({activeIntentions.length})
              </p>
              {activeIntentions.map((intention) => (
                <IntentionCard
                  key={intention.id}
                  id={intention.id}
                  content={intention.content}
                  createdAt={intention.createdAt}
                  onStatusChange={handleStatusChange}
                />
              ))}
            </div>
          )}

          {completedIntentions.length > 0 && (
            <div className='space-y-1'>
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className='flex items-center gap-2 text-[0.65rem] uppercase tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors'
              >
                <Sparkles className='w-3 h-3' />
                {showCompleted ? 'Hide' : 'Show'} completed (
                {completedIntentions.length})
              </button>
              {showCompleted && (
                <div className='space-y-1 mt-2'>
                  {completedIntentions.map((intention) => (
                    <IntentionCard
                      key={intention.id}
                      id={intention.id}
                      content={intention.content}
                      createdAt={intention.createdAt}
                      onStatusChange={handleStatusChange}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
