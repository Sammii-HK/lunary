'use client';

import { useState, useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import type { SkillTreeId } from '@/lib/progress/config';
import type { SkillTreeProgress } from '@/app/api/progress/route';
import type { LevelUpResult } from '@/app/api/progress/increment/route';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface ProgressData {
  progress: SkillTreeProgress[];
  isPro: boolean;
}

/**
 * Hook to fetch and manage user progress across all skill trees
 */
export function useProgress() {
  const { data, error, isLoading } = useSWR<ProgressData>(
    '/api/progress',
    fetcher,
  );

  return {
    progress: data?.progress || [],
    isPro: data?.isPro || false,
    isLoading,
    error,
    refetch: () => mutate('/api/progress'),
  };
}

interface IncrementResult {
  success: boolean;
  progress: SkillTreeProgress;
  levelUp: LevelUpResult;
}

/**
 * Hook to increment progress and handle level-up notifications
 */
export function useProgressIncrement() {
  const [pendingLevelUp, setPendingLevelUp] = useState<{
    skillTreeName: string;
    skillTreeIcon: string;
    newLevel: number;
    unlockMessage: string | null;
    unlockedFeature: string | null;
    featureRoute: string | null;
  } | null>(null);

  const [isIncrementing, setIsIncrementing] = useState(false);

  const increment = useCallback(
    async (
      skillTree: SkillTreeId,
      amount: number = 1,
    ): Promise<IncrementResult | null> => {
      setIsIncrementing(true);
      try {
        const response = await fetch('/api/progress/increment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillTree, amount }),
        });

        if (!response.ok) {
          throw new Error('Failed to increment progress');
        }

        const result: IncrementResult = await response.json();

        // Refresh the progress data
        mutate('/api/progress');

        // If level up occurred, set pending notification
        if (result.levelUp.leveledUp) {
          const skillTreeConfig = getSkillTreeInfo(skillTree);
          setPendingLevelUp({
            skillTreeName: skillTreeConfig.name,
            skillTreeIcon: skillTreeConfig.icon,
            newLevel: result.levelUp.newLevel,
            unlockMessage: result.levelUp.unlockMessage,
            unlockedFeature: result.levelUp.unlockedFeature,
            featureRoute: result.levelUp.featureRoute,
          });
        }

        return result;
      } catch (error) {
        console.error('[Progress] Increment error:', error);
        return null;
      } finally {
        setIsIncrementing(false);
      }
    },
    [],
  );

  const dismissLevelUp = useCallback(() => {
    setPendingLevelUp(null);
  }, []);

  return {
    increment,
    isIncrementing,
    pendingLevelUp,
    dismissLevelUp,
  };
}

function getSkillTreeInfo(skillTree: SkillTreeId): {
  name: string;
  icon: string;
} {
  const info: Record<SkillTreeId, { name: string; icon: string }> = {
    tarot: { name: 'Tarot Mastery', icon: '🎴' },
    journal: { name: 'Journal Keeper', icon: '✍️' },
    explorer: { name: 'Cosmic Explorer', icon: '🌟' },
    ritual: { name: 'Ritual Keeper', icon: '🕯️' },
  };
  return info[skillTree];
}
