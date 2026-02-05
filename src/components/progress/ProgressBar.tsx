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

  const heightClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className='flex justify-between items-center mb-1.5'>
          <span className='text-xs font-medium text-zinc-400'>
            Level {level}
            {isMaxLevel && (
              <span className='ml-1 text-lunary-accent'>(Max)</span>
            )}
          </span>
          <span className='text-xs text-zinc-500'>{displayProgress}%</span>
        </div>
      )}
      <div
        className={cn(
          'w-full bg-zinc-800/60 rounded-full overflow-hidden',
          heightClasses[size],
        )}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            isMaxLevel
              ? 'bg-gradient-to-r from-lunary-accent via-lunary-highlight to-lunary-rose'
              : 'bg-gradient-to-r from-lunary-primary to-lunary-accent',
          )}
          style={{ width: `${displayProgress}%` }}
        />
      </div>
    </div>
  );
}
