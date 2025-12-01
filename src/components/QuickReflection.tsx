'use client';

import { useState } from 'react';
import { X, Feather } from 'lucide-react';

interface QuickReflectionProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (content: string, moodTags: string[]) => Promise<void>;
  moonPhase?: string;
}

const MOOD_OPTIONS = [
  { label: 'Peaceful', value: 'peaceful' },
  { label: 'Hopeful', value: 'hopeful' },
  { label: 'Reflective', value: 'reflective' },
  { label: 'Energised', value: 'energised' },
  { label: 'Anxious', value: 'anxious' },
  { label: 'Uncertain', value: 'uncertain' },
  { label: 'Grateful', value: 'grateful' },
  { label: 'Overwhelmed', value: 'overwhelmed' },
];

export function QuickReflection({
  isOpen,
  onClose,
  onSubmit,
  moonPhase,
}: QuickReflectionProps) {
  const [content, setContent] = useState('');
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood) ? prev.filter((m) => m !== mood) : [...prev, mood],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(content.trim(), selectedMoods);
      setContent('');
      setSelectedMoods([]);
      onClose();
    } catch (error) {
      console.error('Failed to save reflection:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-end justify-center sm:items-center'>
      <div
        className='absolute inset-0 bg-black/60 backdrop-blur-sm'
        onClick={onClose}
      />
      <div className='relative w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-t-2xl sm:rounded-2xl p-4 animate-slide-up'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <Feather className='w-5 h-5 text-purple-400' />
            <h2 className='text-lg font-medium text-white'>Quick Reflection</h2>
          </div>
          <button
            onClick={onClose}
            className='p-2 hover:bg-zinc-800 rounded-lg transition-colors'
          >
            <X className='w-5 h-5 text-zinc-400' />
          </button>
        </div>

        {moonPhase && <p className='text-xs text-zinc-500 mb-3'>{moonPhase}</p>}

        <form onSubmit={handleSubmit} className='space-y-4'>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind?"
            className='w-full bg-zinc-800 border border-zinc-700 rounded-lg p-3 text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 resize-none'
            rows={4}
            autoFocus
          />

          <div>
            <p className='text-xs text-zinc-500 mb-2'>How are you feeling?</p>
            <div className='flex flex-wrap gap-2'>
              {MOOD_OPTIONS.map((mood) => (
                <button
                  key={mood.value}
                  type='button'
                  onClick={() => toggleMood(mood.value)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedMoods.includes(mood.value)
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600'
                  }`}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type='submit'
            disabled={!content.trim() || isSubmitting}
            className='w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 disabled:cursor-not-allowed text-white py-3 rounded-lg font-medium transition-colors'
          >
            {isSubmitting ? 'Saving...' : 'Save Reflection'}
          </button>
        </form>
      </div>
    </div>
  );
}
