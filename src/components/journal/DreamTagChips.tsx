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
  water: 'dream-tag-water',
  fire: 'dream-tag-fire',
  flying: 'dream-tag-flying',
  falling: 'dream-tag-falling',
  animals: 'dream-tag-animals',
  nature: 'dream-tag-nature',
  darkness: 'bg-surface-card/50 text-content-secondary',
  light: 'dream-tag-light',
  anxious: 'dream-tag-anxious',
  peaceful: 'dream-tag-peaceful',
  joyful: 'dream-tag-joyful',
  sad: 'dream-tag-sad',
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
            TAG_COLORS[tag] || 'bg-surface-card/50 text-content-muted'
          }`}
        >
          {tag}
        </span>
      ))}
    </div>
  );
}
