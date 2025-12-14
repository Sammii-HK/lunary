'use client';

import { useMemo } from 'react';
import { classifyDream, isDreamEntry } from '@/lib/journal/dream-classifier';

interface DreamTagChipsProps {
  entry: {
    content: string;
    moodTags?: string[];
    source?: string;
  };
  className?: string;
}

const TAG_COLORS: Record<string, string> = {
  water: 'bg-blue-900/30 text-blue-300',
  fire: 'bg-orange-900/30 text-orange-300',
  flying: 'bg-sky-900/30 text-sky-300',
  falling: 'bg-red-900/30 text-red-300',
  animals: 'bg-emerald-900/30 text-emerald-300',
  nature: 'bg-green-900/30 text-green-300',
  darkness: 'bg-zinc-800/50 text-zinc-300',
  light: 'bg-yellow-900/30 text-yellow-300',
  anxious: 'bg-rose-900/30 text-rose-300',
  peaceful: 'bg-teal-900/30 text-teal-300',
  joyful: 'bg-amber-900/30 text-amber-300',
  sad: 'bg-indigo-900/30 text-indigo-300',
};

export function DreamTagChips({ entry, className = '' }: DreamTagChipsProps) {
  const tags = useMemo(() => {
    if (!isDreamEntry(entry)) {
      return [];
    }

    const classification = classifyDream(entry.content);
    return [
      ...classification.thematicTags,
      ...classification.emotionalTags,
    ].slice(0, 4);
  }, [entry]);

  if (tags.length === 0) {
    return null;
  }

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {tags.map((tag) => (
        <span
          key={tag}
          className={`text-xs px-1.5 py-0.5 rounded ${
            TAG_COLORS[tag] || 'bg-zinc-800/50 text-zinc-400'
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
