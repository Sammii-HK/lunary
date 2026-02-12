'use client';

import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FriendTransitBadgeProps {
  label: string;
  variant?: 'retrograde' | 'transit';
  className?: string;
}

/**
 * Small badge showing transit info: "Mercury Rx", "Venus in Pisces", etc.
 */
export function FriendTransitBadge({
  label,
  variant = 'transit',
  className,
}: FriendTransitBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-medium',
        variant === 'retrograde'
          ? 'bg-amber-900/30 text-amber-300 border border-amber-800/40'
          : 'bg-lunary-primary-900/30 text-lunary-primary-300 border border-lunary-primary-800/40',
        className,
      )}
    >
      {variant === 'retrograde' && <RotateCcw className='w-2 h-2' />}
      {label}
    </span>
  );
}
