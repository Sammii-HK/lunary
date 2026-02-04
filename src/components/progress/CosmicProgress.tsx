'use client';

import { useProgress, SkillTreeCard } from '@/components/progress';
import { Sparkles } from 'lucide-react';

interface CosmicProgressProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function CosmicProgress({
  className,
  variant = 'full',
}: CosmicProgressProps) {
  const { progress, isLoading, error } = useProgress();

  if (isLoading) {
    return (
      <div className={className}>
        <div className='w-full max-w-3xl space-y-3'>
          <div className='flex items-center gap-2 mb-4'>
            <Sparkles className='w-5 h-5 text-lunary-accent' />
            <h2 className='text-lg font-semibold text-white'>
              Your Cosmic Progress
            </h2>
          </div>
          <div className='grid gap-3 sm:grid-cols-3'>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className='h-32 bg-zinc-800/50 animate-pulse rounded-xl'
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !progress?.length) {
    return null;
  }

  const totalLevel = progress.reduce((sum, p) => sum + p.currentLevel, 0);
  const maxTotalLevel = progress.length * 4; // 4 levels per tree

  return (
    <div className={className}>
      <div className='w-full max-w-3xl'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <Sparkles className='w-5 h-5 text-lunary-accent' />
            <h2 className='text-lg font-semibold text-white'>
              Your Cosmic Progress
            </h2>
          </div>
          <span className='text-sm text-zinc-400'>
            Level {totalLevel}/{maxTotalLevel}
          </span>
        </div>

        <div
          className={
            variant === 'compact' ? 'space-y-2' : 'grid gap-3 sm:grid-cols-3'
          }
        >
          {progress.map((p) => (
            <SkillTreeCard
              key={p.skillTree}
              name={p.name}
              icon={p.icon}
              currentLevel={p.currentLevel}
              totalActions={p.totalActions}
              progressToNext={p.progressToNext}
              actionsToNext={p.actionsToNext}
              nextUnlock={p.nextUnlock}
              actionVerb={p.actionVerb}
              variant={variant}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
