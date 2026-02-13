'use client';

import { Sparkles, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, typeof Sparkles> = {
  Sparkles,
  Heart,
};

interface GiftTypeCardProps {
  id: string;
  name: string;
  description: string;
  icon: string;
  selected: boolean;
  onSelect: (id: string) => void;
}

export function GiftTypeCard({
  id,
  name,
  description,
  icon,
  selected,
  onSelect,
}: GiftTypeCardProps) {
  const Icon = ICON_MAP[icon] || Sparkles;

  return (
    <button
      type='button'
      onClick={() => onSelect(id)}
      className={cn(
        'w-full rounded-xl border p-4 text-left transition-all',
        selected
          ? 'border-lunary-primary-500 bg-lunary-primary-900/20 ring-1 ring-lunary-primary-500/50'
          : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700',
      )}
    >
      <div className='flex items-start gap-3'>
        <div
          className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
            selected
              ? 'bg-lunary-primary-500/20 text-lunary-primary-400'
              : 'bg-zinc-800 text-zinc-400',
          )}
        >
          <Icon className='w-5 h-5' />
        </div>
        <div>
          <p className='text-sm font-medium text-white'>{name}</p>
          <p className='text-xs text-zinc-400 mt-0.5'>{description}</p>
        </div>
      </div>
    </button>
  );
}
