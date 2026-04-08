'use client';

import { useEffect, useState } from 'react';
import { useProgress } from './useProgress';
import { SkillTreeCard } from './SkillTreeCard';
import { Collapse } from '@/components/ui/Collapse';
import {
  SKILL_TREES,
  calculateLevel,
  getNextLevelConfig,
} from '@/lib/progress/config';
import type { SkillTreeId } from '@/lib/progress/config';
import type { SkillTreeProgress } from '@/app/api/progress/route';

interface SkillProgressWidgetProps {
  skillTree: SkillTreeId;
  className?: string;
  /** When true, show the condensed micro variant immediately */
  scrolled?: boolean;
}

/**
 * Compact progress widget for a single skill tree.
 * Shows the full compact card for ~5 seconds, then collapses to a single-line micro view.
 * Also collapses when `scrolled` is true.
 */
export function SkillProgressWidget({
  skillTree,
  className,
  scrolled = false,
}: SkillProgressWidgetProps) {
  const { progress, isLoading } = useProgress();
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    if (condensed || scrolled) return;
    const timer = setTimeout(() => setCondensed(true), 5000);
    return () => clearTimeout(timer);
  }, [condensed, scrolled]);

  if (isLoading) {
    return (
      <div className={className}>
        <div className='h-12 bg-surface-card/50 animate-pulse rounded-lg' />
      </div>
    );
  }

  let skill: SkillTreeProgress | undefined = progress.find(
    (p) => p.skillTree === skillTree,
  );

  // Fallback: if API failed or skill not yet in DB, build level-0 state from config
  if (!skill) {
    const config = SKILL_TREES[skillTree];
    if (!config) return null;
    const levelCalc = calculateLevel(skillTree, 0);
    const nextLevelConfig = getNextLevelConfig(skillTree, 0);
    skill = {
      skillTree: config.id,
      name: config.name,
      icon: config.icon,
      currentLevel: 0,
      totalActions: 0,
      nextLevel: levelCalc.nextLevel,
      progressToNext: 0,
      actionsToNext: levelCalc.actionsToNext,
      nextThreshold: levelCalc.nextThreshold,
      unlockedFeatures: [],
      nextUnlock:
        nextLevelConfig?.freeUnlock || nextLevelConfig?.proUnlock || null,
      nextUnlockDescription: nextLevelConfig?.unlockDescription || null,
      actionVerb: config.actionVerb,
      featureRoute: config.defaultRoute || null,
    };
  }

  const isMicro = condensed || scrolled;

  const cardProps = {
    name: skill.name,
    icon: skill.icon,
    currentLevel: skill.currentLevel,
    totalActions: skill.totalActions,
    progressToNext: skill.progressToNext,
    actionsToNext: skill.actionsToNext,
    nextUnlock: skill.nextUnlock,
    nextUnlockDescription: skill.nextUnlockDescription,
    actionVerb: skill.actionVerb,
    featureRoute: skill.featureRoute,
  };

  return (
    <div className={className}>
      <Collapse isOpen={!isMicro}>
        <SkillTreeCard {...cardProps} variant='compact' />
      </Collapse>
      <Collapse isOpen={isMicro}>
        <SkillTreeCard {...cardProps} variant='micro' />
      </Collapse>
    </div>
  );
}
