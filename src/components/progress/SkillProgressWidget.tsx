'use client';

import { useProgress } from './useProgress';
import { SkillTreeCard } from './SkillTreeCard';
import type { SkillTreeId } from '@/lib/progress/config';

interface SkillProgressWidgetProps {
  skillTree: SkillTreeId;
  className?: string;
}

/**
 * Compact progress widget for a single skill tree.
 * Drop into any page to show progress for that skill.
 */
export function SkillProgressWidget({
  skillTree,
  className,
}: SkillProgressWidgetProps) {
  const { progress, isLoading } = useProgress();

  if (isLoading) {
    return (
      <div className={className}>
        <div className='h-12 bg-zinc-800/50 animate-pulse rounded-lg' />
      </div>
    );
  }

  const skill = progress.find((p) => p.skillTree === skillTree);
  if (!skill) return null;

  return (
    <div className={className}>
      <SkillTreeCard
        name={skill.name}
        icon={skill.icon}
        currentLevel={skill.currentLevel}
        totalActions={skill.totalActions}
        progressToNext={skill.progressToNext}
        actionsToNext={skill.actionsToNext}
        nextUnlock={skill.nextUnlock}
        nextUnlockDescription={skill.nextUnlockDescription}
        actionVerb={skill.actionVerb}
        featureRoute={skill.featureRoute}
        variant='compact'
      />
    </div>
  );
}
