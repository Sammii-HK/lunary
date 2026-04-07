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
  variant?: 'compact' | 'full' | 'micro';
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

  if (variant === 'micro') {
    const microContent = (
      <div className={cn('flex items-center gap-2', className)}>
        <SkillIcon
          icon={icon}
          className='w-3 h-3 shrink-0 text-lunary-primary-400'
        />
        <div className='flex-1 min-w-0'>
          <ProgressBar
            progress={progressToNext}
            level={currentLevel}
            size='sm'
            showLabel={false}
          />
        </div>
        <span className='text-[10px] text-content-muted shrink-0 tabular-nums'>
          Lv.{currentLevel}
        </span>
      </div>
    );
    if (featureRoute) return <Link href={featureRoute}>{microContent}</Link>;
    return microContent;
  }

  if (variant === 'compact') {
    const compactContent = (
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-lg bg-surface-elevated/50 border border-stroke-subtle/50',
          featureRoute && 'hover:border-stroke-default/50 transition-colors',
          className,
        )}
      >
        <SkillIcon icon={icon} className='w-6 h-6' />
        <div className='flex-1 min-w-0'>
          <div className='flex items-center justify-between mb-1'>
            <span className='text-sm font-medium text-content-primary truncate'>
              {name}
            </span>
            <span className='text-xs text-content-muted'>
              Lv. {currentLevel}
            </span>
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
        'p-4 rounded-xl bg-surface-elevated/50 border border-stroke-subtle/50 hover:border-stroke-default/50 transition-colors',
        className,
      )}
    >
      {/* Header */}
      <div className='flex items-start justify-between mb-3'>
        <div className='flex items-center gap-3'>
          <SkillIcon icon={icon} className='w-8 h-8' />
          <div>
            <h3 className='font-semibold text-content-primary'>{name}</h3>
            <p className='text-xs text-content-muted'>
              {totalActions} {actionVerb}
            </p>
          </div>
        </div>
        {featureRoute && (
          <ChevronRight className='w-5 h-5 text-content-muted' />
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar
        progress={progressToNext}
        level={currentLevel}
        className='mb-3'
      />

      {/* Next Unlock */}
      {!isMaxLevel && actionsToNext !== null && (
        <div className='flex items-center gap-2 p-2 rounded-lg bg-surface-card/30 border border-stroke-default/30'>
          {unlockText ? (
            <>
              <Sparkles className='w-4 h-4 text-lunary-accent shrink-0' />
              <span className='text-xs text-content-secondary'>
                <span className='text-lunary-accent font-medium'>
                  {actionsToNext}
                </span>{' '}
                more to unlock:{' '}
                <span className='text-content-primary'>{unlockText}</span>
              </span>
            </>
          ) : (
            <>
              <Sparkles className='w-4 h-4 text-content-muted shrink-0' />
              <span className='text-xs text-content-muted'>
                <span className='text-content-secondary font-medium'>
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
