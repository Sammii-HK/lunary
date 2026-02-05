'use client';

import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0-100
  level: number;
  maxLevel?: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  progress,
  level,
  maxLevel = 10,
  size = 'md',
  showLabel = true,
  className,
}: ProgressBarProps) {
  const isMaxLevel = level >= maxLevel;
  const displayProgress = isMaxLevel ? 100 : progress;

  const sizeConfig = {
    sm: { track: 'h-2 p-[1px]', label: 'text-[10px]' },
    md: { track: 'h-2.5 p-[1px]', label: 'text-xs' },
    lg: { track: 'h-3.5 p-[2px]', label: 'text-xs' },
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className='flex justify-between items-center mb-1.5'>
          <span className={cn('font-medium text-zinc-400', config.label)}>
            Level {level}
            {isMaxLevel && (
              <span className='ml-1 text-lunary-accent'>(Max)</span>
            )}
          </span>
          <span className={cn('text-zinc-500', config.label)}>
            {displayProgress}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full overflow-hidden',
          'border bg-transparent',
          config.track,
          isMaxLevel
            ? 'border-lunary-accent/60 shadow-[0_0_8px_rgba(199,125,255,0.3)]'
            : displayProgress > 0
              ? 'border-lunary-primary-600/50 shadow-[0_0_6px_rgba(132,88,216,0.2)]'
              : 'border-zinc-700/60',
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isMaxLevel
              ? 'bg-gradient-to-r from-lunary-accent/[.77] via-lunary-highlight/[.77] to-lunary-rose/[.77] shadow-[0_0_10px_rgba(199,125,255,0.3)]'
              : 'bg-gradient-to-r from-lunary-primary/[.77] to-lunary-accent/[.77] shadow-[0_0_8px_rgba(132,88,216,0.25)]',
          )}
          style={{
            width: `${Math.max(displayProgress, displayProgress > 0 ? 4 : 0)}%`,
          }}
        />
      </div>
    </div>
  );
}
