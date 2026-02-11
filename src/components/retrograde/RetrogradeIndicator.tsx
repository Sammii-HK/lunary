'use client';

import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetrogradeIndicatorProps {
  planets: string[];
  className?: string;
}

/**
 * Small pill showing which planets are currently retrograde.
 * Designed for use inside SkyNowCard or other compact layouts.
 */
export function RetrogradeIndicator({
  planets,
  className,
}: RetrogradeIndicatorProps) {
  if (planets.length === 0) return null;

  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {planets.map((planet) => (
        <span
          key={planet}
          className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-900/30 text-amber-300 border border-amber-800/40'
        >
          <RotateCcw className='w-2.5 h-2.5' />
          {planet} Rx
        </span>
      ))}
    </div>
  );
}
