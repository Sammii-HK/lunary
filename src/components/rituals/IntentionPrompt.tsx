'use client';

import { useState, useEffect } from 'react';
import { Target, Check, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ActiveIntention {
  id: number;
  text: string;
  category?: string;
}

export function IntentionPrompt() {
  const [activeIntention, setActiveIntention] =
    useState<ActiveIntention | null>(null);
  const [showSetForm, setShowSetForm] = useState(false);
  const [newIntentionText, setNewIntentionText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [justSet, setJustSet] = useState(false);

  useEffect(() => {
    const fetchIntention = async () => {
      try {
        const res = await fetch('/api/collections?category=intention&limit=1', {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          const active = (data.collections || []).find(
            (c: { content: { status: string } }) =>
              c.content?.status === 'active',
          );
          if (active) {
            setActiveIntention({
              id: active.id,
              text: active.content.text,
              category: active.content.intentionCategory,
            });
          }
        }
      } catch {
        // Silent fail
      } finally {
        setIsLoading(false);
      }
    };
    fetchIntention();
  }, []);

  const handleSetIntention = async () => {
    if (!newIntentionText.trim() || isSubmitting) return;
    setIsSubmitting(true);

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
            intentionCategory: 'personal',
            status: 'active',
            source: 'morning_ritual',
            manifestedAt: null,
            releasedAt: null,
            progressNotes: [],
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setActiveIntention({
          id: data.collection.id,
          text: data.collection.content.text,
          category: data.collection.content.intentionCategory,
        });
        setShowSetForm(false);
        setNewIntentionText('');
        setJustSet(true);
      }
    } catch {
      // Silent fail
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkManifested = async () => {
    if (!activeIntention) return;
    try {
      const res = await fetch(`/api/intentions/${activeIntention.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'manifested' }),
      });
      if (res.ok) {
        setActiveIntention(null);
        setJustSet(false);
      }
    } catch {
      // Silent fail
    }
  };

  if (isLoading) return null;

  // Show active intention with quick actions
  if (activeIntention) {
    return (
      <div className='mt-2 bg-lunary-primary-900/20 border border-lunary-primary-800/30 rounded-lg px-3 py-2'>
        <div className='flex items-start gap-2'>
          <Target className='w-3.5 h-3.5 text-lunary-primary-400 mt-0.5 shrink-0' />
          <div className='flex-1 min-w-0'>
            <p className='text-[0.65rem] uppercase tracking-widest text-lunary-primary-400 mb-0.5'>
              {justSet ? 'Intention set' : 'Active intention'}
            </p>
            <p className='text-xs text-white truncate'>
              {activeIntention.text}
            </p>
            <div className='flex items-center gap-2 mt-1.5'>
              <Link
                href='/book-of-shadows?tab=intentions'
                className='text-[0.65rem] text-lunary-accent hover:text-lunary-accent-100 transition-colors flex items-center gap-0.5'
                onClick={(e) => e.stopPropagation()}
              >
                Check in <ChevronRight className='w-3 h-3' />
              </Link>
              <button
                type='button'
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleMarkManifested();
                }}
                className='text-[0.65rem] text-lunary-success hover:text-lunary-success/80 transition-colors flex items-center gap-0.5'
              >
                <Check className='w-3 h-3' />
                Manifested!
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show inline set-intention prompt
  if (showSetForm) {
    return (
      <div className='mt-2 bg-zinc-900/50 border border-zinc-800 rounded-lg px-3 py-2'>
        <p className='text-[0.65rem] uppercase tracking-widest text-zinc-500 mb-1.5'>
          Set an intention
        </p>
        <div className='flex gap-2'>
          <input
            type='text'
            value={newIntentionText}
            onChange={(e) => setNewIntentionText(e.target.value)}
            placeholder='What do you want to manifest?'
            className='flex-1 bg-zinc-800 border border-zinc-700 rounded px-2 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-lunary-primary'
            maxLength={200}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSetIntention();
              }
            }}
          />
          <Button
            size='sm'
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSetIntention();
            }}
            disabled={isSubmitting || !newIntentionText.trim()}
            className='text-xs px-2'
          >
            {isSubmitting ? '...' : 'Set'}
          </Button>
        </div>
        <button
          type='button'
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowSetForm(false);
          }}
          className='text-[0.6rem] text-zinc-500 mt-1'
        >
          Skip
        </button>
      </div>
    );
  }

  return (
    <button
      type='button'
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setShowSetForm(true);
      }}
      className='mt-2 w-full flex items-center gap-2 text-[0.65rem] text-zinc-400 hover:text-zinc-200 transition-colors'
    >
      <Target className='w-3 h-3' />
      Set an intention for today
    </button>
  );
}
