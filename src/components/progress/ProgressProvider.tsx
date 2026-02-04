'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { mutate } from 'swr';
import type { SkillTreeId } from '@/lib/progress/config';
import { LevelUpNotification } from './LevelUpNotification';

interface LevelUpData {
  skillTreeName: string;
  skillTreeIcon: string;
  newLevel: number;
  unlockMessage: string | null;
  unlockedFeature: string | null;
  featureRoute: string | null;
}

interface ProgressContextType {
  incrementProgress: (skillTree: SkillTreeId, amount?: number) => Promise<void>;
  isIncrementing: boolean;
}

const ProgressContext = createContext<ProgressContextType | null>(null);

const SKILL_TREE_INFO: Record<SkillTreeId, { name: string; icon: string }> = {
  tarot: { name: 'Tarot Mastery', icon: '🎴' },
  chart: { name: 'Chart Explorer', icon: '🌟' },
  journal: { name: 'Journal Keeper', icon: '✍️' },
};

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [pendingLevelUp, setPendingLevelUp] = useState<LevelUpData | null>(
    null,
  );
  const [isIncrementing, setIsIncrementing] = useState(false);

  const incrementProgress = useCallback(
    async (skillTree: SkillTreeId, amount: number = 1) => {
      setIsIncrementing(true);
      try {
        const response = await fetch('/api/progress/increment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ skillTree, amount }),
        });

        if (!response.ok) {
          console.error('[Progress] Failed to increment');
          return;
        }

        const result = await response.json();

        // Refresh progress data
        mutate('/api/progress');

        // Show level up notification if applicable
        if (result.levelUp?.leveledUp) {
          const info = SKILL_TREE_INFO[skillTree];
          setPendingLevelUp({
            skillTreeName: info.name,
            skillTreeIcon: info.icon,
            newLevel: result.levelUp.newLevel,
            unlockMessage: result.levelUp.unlockMessage,
            unlockedFeature: result.levelUp.unlockedFeature,
            featureRoute: result.levelUp.featureRoute,
          });
        }
      } catch (error) {
        console.error('[Progress] Increment error:', error);
      } finally {
        setIsIncrementing(false);
      }
    },
    [],
  );

  const dismissLevelUp = useCallback(() => {
    setPendingLevelUp(null);
  }, []);

  return (
    <ProgressContext.Provider value={{ incrementProgress, isIncrementing }}>
      {children}
      {pendingLevelUp && (
        <LevelUpNotification
          isOpen={true}
          onClose={dismissLevelUp}
          skillTreeName={pendingLevelUp.skillTreeName}
          skillTreeIcon={pendingLevelUp.skillTreeIcon}
          newLevel={pendingLevelUp.newLevel}
          unlockMessage={pendingLevelUp.unlockMessage}
          unlockedFeature={pendingLevelUp.unlockedFeature}
          featureRoute={pendingLevelUp.featureRoute}
        />
      )}
    </ProgressContext.Provider>
  );
}

export function useProgressContext() {
  const context = useContext(ProgressContext);
  if (!context) {
    throw new Error('useProgressContext must be used within ProgressProvider');
  }
  return context;
}
