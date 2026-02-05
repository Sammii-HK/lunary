'use client';

import { cn } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';
import {
  ChevronRight,
  Sparkles,
  MoonStar,
  PenTool,
  SquareStar,
  Shell,
} from 'lucide-react';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';

const SKILL_ICONS: Record<string, LucideIcon> = {
  'moon-star': MoonStar,
  'pen-tool': PenTool,
  'square-star': SquareStar,
  shell: Shell,
};

function SkillIcon({ icon, className }: { icon: string; className?: string }) {
  const IconComponent = SKILL_ICONS[icon];
  if (IconComponent) {
    return <IconComponent className={cn('text-lunary-accent', className)} />;
  }
  return <span className={className}>{icon}</span>;
}

interface SkillTreeCardProps {
  name: string;
  icon: string;
  currentLevel: number;
  totalActions: number;
  progressToNext: number;
  actionsToNext: number | null;
  nextUnlock: string | null;
  nextUnlockDescription?: string | null;
  actionVerb: string;
  featureRoute?: string | null;
  variant?: 'compact' | 'full';
  className?: string;
}

export function SkillTreeCard({
  name,
  icon,
  currentLevel,
  totalActions,
  progressToNext,
  actionsToNext,
  nextUnlock,
  nextUnlockDescription,
  actionVerb,
  featureRoute,
  variant = 'full',
  className,
}: SkillTreeCardProps) {
  const isMaxLevel = currentLevel >= 10;

  if (variant === 'compact') {
    const compactContent = (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50',
          featureRoute &&
            'hover:border-zinc-700/50 transition-colors cursor-pointer',
          className,
        )}
      >
        <SkillIcon icon={icon} className='w-6 h-6' />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <span className='text-sm font-medium text-white truncate'>
              {name}
            </span>
            <span className='text-xs text-zinc-400'>Lv. {currentLevel}</span>
          </div>
          <ProgressBar
            progress={progressToNext}
            level={currentLevel}
            size='sm'
            showLabel={false}
          />
        </div>
      </div>
    );

    if (featureRoute) {
      return <Link href={featureRoute}>{compactContent}</Link>;
    }
    return compactContent;
  }

  const unlockText =
    nextUnlockDescription ||
    (nextUnlock ? formatFeatureName(nextUnlock) : null);

  const content = (
    <div
      className={cn(
        'p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/50 hover:border-zinc-700/50 transition-colors',
        featureRoute && 'cursor-pointer',
        className,
      )}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-3'>
          <SkillIcon icon={icon} className='w-8 h-8' />
          <div>
            <h3 className='font-semibold text-white'>{name}</h3>
            <p className='text-xs text-zinc-400'>
              {totalActions} {actionVerb}
            </p>
          </div>
        </div>
        {featureRoute && <ChevronRight className='w-5 h-5 text-zinc-500' />}
      </div>

      {/* Progress Bar */}
      <ProgressBar
        progress={progressToNext}
        level={currentLevel}
        className='mb-3'
      />

      {/* Next Unlock */}
      {!isMaxLevel && actionsToNext !== null && (
        <div className='flex items-center gap-2 p-2 rounded-lg bg-zinc-800/30 border border-zinc-700/30'>
          {unlockText ? (
            <>
              <Sparkles className='w-4 h-4 text-lunary-accent shrink-0' />
              <span className='text-xs text-zinc-300'>
                <span className='text-lunary-accent font-medium'>
                  {actionsToNext}
                </span>{' '}
                more to unlock: <span className='text-white'>{unlockText}</span>
              </span>
            </>
          ) : (
            <>
              <Sparkles className='w-4 h-4 text-zinc-400 shrink-0' />
              <span className='text-xs text-zinc-400'>
                <span className='text-zinc-300 font-medium'>
                  {actionsToNext}
                </span>{' '}
                more to reach level {currentLevel + 1}
              </span>
            </>
          )}
        </div>
      )}

      {isMaxLevel && (
        <div className='flex items-center gap-2 p-2 rounded-lg bg-lunary-accent/10 border border-lunary-accent/20'>
          <Sparkles className='w-4 h-4 text-lunary-accent shrink-0' />
          <span className='text-xs text-lunary-accent font-medium'>
            Maximum level reached!
          </span>
        </div>
      )}
    </div>
  );

  if (featureRoute) {
    return <Link href={featureRoute}>{content}</Link>;
  }

  return content;
}

function formatFeatureName(feature: string): string {
  return feature.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}
