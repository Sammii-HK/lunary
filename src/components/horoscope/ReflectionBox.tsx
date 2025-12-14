'use client';

import { useState } from 'react';
import { BookOpen, Check, Loader2 } from 'lucide-react';

interface ReflectionBoxProps {
  className?: string;
}

export function ReflectionBox({ className = '' }: ReflectionBoxProps) {
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSave = async () => {
    if (!reflection.trim() || isSaving) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/journal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          content: reflection,
          moodTags: ['horoscope-reflection'],
          cardReferences: [],
          source: 'horoscope',
        }),
      });

      if (response.ok) {
        setIsSaved(true);
        setReflection('');
        setTimeout(() => {
          setIsSaved(false);
          setIsExpanded(false);
        }, 2000);
      }
    } catch (error) {
      console.error('[ReflectionBox] Failed to save:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={`flex items-center gap-2 text-sm text-lunary-primary-400 hover:text-lunary-primary-300 transition-colors ${className}`}
      >
        <BookOpen className='w-4 h-4' />
        Add a reflection
      </button>
    );
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <textarea
        value={reflection}
        onChange={(e) => setReflection(e.target.value)}
        placeholder="How does today's horoscope resonate with you?"
        className='w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-lunary-primary resize-none'
        rows={3}
        autoFocus
      />
      <div className='flex items-center justify-between'>
        <button
          onClick={() => {
            setIsExpanded(false);
            setReflection('');
          }}
          className='text-xs text-zinc-400 hover:text-zinc-300 transition-colors'
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!reflection.trim() || isSaving || isSaved}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            isSaved
              ? 'bg-lunary-success-900/30 text-lunary-success-400'
              : 'bg-lunary-primary-600 hover:bg-lunary-primary-700 text-white disabled:bg-zinc-700 disabled:text-zinc-400'
          }`}
        >
          {isSaving ? (
            <Loader2 className='w-3 h-3 animate-spin' />
          ) : isSaved ? (
            <Check className='w-3 h-3' />
          ) : (
            <BookOpen className='w-3 h-3' />
          )}
          {isSaved ? 'Saved' : 'Save to Journal'}
        </button>
      </div>
    </div>
  );
}
