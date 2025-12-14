'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Feather, Send, Check } from 'lucide-react';
import { useAuthStatus } from '@/components/AuthStatus';
import {
  extractMoodTags,
  extractCardReferences,
} from '@/lib/journal/extract-moments';

interface ReflectionBoxProps {
  context: 'horoscope' | 'tarot' | 'moon';
  placeholder?: string;
  className?: string;
}

const CONTEXT_TAGS: Record<string, string[]> = {
  horoscope: ['Horoscope Reflection'],
  tarot: ['Tarot Reflection'],
  moon: ['Moon Reflection'],
};

export function ReflectionBox({
  context,
  placeholder = 'How did this resonate with you?',
  className = '',
}: ReflectionBoxProps) {
  const { isAuthenticated } = useAuthStatus();
  const [reflection, setReflection] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async () => {
    if (!reflection.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const moodTags = extractMoodTags(reflection);
      const cardReferences = extractCardReferences(reflection);

      let moonPhase: string | null = null;
      try {
        const cosmicRes = await fetch('/api/gpt/cosmic-today');
        if (cosmicRes.ok) {
          const cosmicData = await cosmicRes.json();
          moonPhase = cosmicData.moonPhase?.name || null;
        }
      } catch {
        // Continue without moon phase
      }

      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: reflection,
          moodTags,
          cardReferences,
          moonPhase,
          source: 'reflection',
        }),
      });

      if (response.ok) {
        setIsSaved(true);
        setTimeout(() => {
          setReflection('');
          setIsSaved(false);
        }, 2000);
      }
    } catch (error) {
      console.error('[ReflectionBox] Failed to save:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`rounded-xl border border-zinc-800/50 bg-zinc-900/40 p-4 ${className}`}
    >
      <div className='flex items-center gap-2 mb-3'>
        <Feather className='w-4 h-4 text-lunary-primary-400' />
        <h3 className='text-sm font-medium text-zinc-100'>Quick Reflection</h3>
      </div>

      <div className='relative'>
        <textarea
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
          placeholder={placeholder}
          disabled={isSubmitting || isSaved}
          rows={3}
          className='w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-3 pr-12 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-lunary-primary-700 resize-none disabled:opacity-50'
        />

        <button
          onClick={handleSubmit}
          disabled={!reflection.trim() || isSubmitting || isSaved}
          className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
            isSaved
              ? 'bg-lunary-success-900/30 text-lunary-success-300'
              : 'bg-lunary-primary-900/30 text-lunary-primary-300 hover:bg-lunary-primary-900/50'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isSaved ? (
            <Check className='w-4 h-4' />
          ) : isSubmitting ? (
            <div className='w-4 h-4 border-2 border-lunary-primary-400 border-t-transparent rounded-full animate-spin' />
          ) : (
            <Send className='w-4 h-4' />
          )}
        </button>
      </div>

      {isSaved && (
        <p className='text-xs text-lunary-success-300 mt-2'>
          Saved to your Book of Shadows
        </p>
      )}

      <p className='text-[10px] text-zinc-500 mt-2'>
        Your reflection will be saved to your Book of Shadows with today's
        cosmic context.
      </p>
    </div>
  );
}

export function HoroscopeCrossLinks({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div className={`grid grid-cols-2 gap-3 ${className}`}>
      <a
        href='/tarot'
        className='group flex items-center gap-2 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 hover:border-lunary-primary-700/50 transition-colors'
      >
        <span className='text-xl'>🃏</span>
        <div>
          <p className='text-sm font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
            Pull a Card
          </p>
          <p className='text-xs text-zinc-500'>Get tarot guidance for today</p>
        </div>
      </a>

      <a
        href='/book-of-shadows'
        className='group flex items-center gap-2 p-3 rounded-xl border border-zinc-800/50 bg-zinc-900/40 hover:border-lunary-primary-700/50 transition-colors'
      >
        <span className='text-xl'>📔</span>
        <div>
          <p className='text-sm font-medium text-zinc-100 group-hover:text-lunary-primary-300 transition-colors'>
            Book of Shadows
          </p>
          <p className='text-xs text-zinc-500'>Record your reflections</p>
        </div>
      </a>
    </div>
  );
}

export function HoroscopeNavigationLinks({
  className = '',
}: {
  className?: string;
}) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      <Link
        href='/horoscope/tomorrow'
        className='inline-flex items-center px-3 py-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/30 text-xs text-zinc-300 hover:border-lunary-primary-700/50 hover:text-lunary-primary-300 transition-colors'
      >
        Tomorrow&apos;s Energy →
      </Link>
      <Link
        href='/horoscope/weekly'
        className='inline-flex items-center px-3 py-1.5 rounded-full border border-zinc-700/50 bg-zinc-800/30 text-xs text-zinc-300 hover:border-lunary-primary-700/50 hover:text-lunary-primary-300 transition-colors'
      >
        Your Week →
      </Link>
    </div>
  );
}
