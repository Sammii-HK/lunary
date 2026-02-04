/**
 * Skill Tree Configuration for the Progress/Leveling System
 *
 * Each skill tree ties to REAL features in the Lunary app:
 * - Tarot: tarot_patterns, pattern visualization, AI interpretation
 * - Chart: cosmic_profile, transit_history, solar_return
 * - Journal: emotion tracking, monthly_insights, AI analysis
 */

export type SkillTreeId = 'tarot' | 'chart' | 'journal';

export interface LevelConfig {
  level: number;
  threshold: number;
  freeUnlock: string | null;
  proUnlock: string | null;
  unlockMessage: string;
  proRequired: boolean;
  featureRoute?: string; // Route to the unlocked feature
}

export interface SkillTreeConfig {
  id: SkillTreeId;
  name: string;
  icon: string;
  description: string;
  actionVerb: string;
  levels: LevelConfig[];
}

export const SKILL_TREES: Record<SkillTreeId, SkillTreeConfig> = {
  tarot: {
    id: 'tarot',
    name: 'Tarot Mastery',
    icon: '🎴',
    description: 'Master the art of tarot reading',
    actionVerb: 'cards pulled',
    levels: [
      {
        level: 1,
        threshold: 10,
        freeUnlock: 'tarot_patterns_basic',
        proUnlock: 'pattern_drill_down',
        unlockMessage:
          "You've unlocked Tarot Patterns! See which cards appear most in your readings.",
        proRequired: false,
        featureRoute: '/patterns',
      },
      {
        level: 2,
        threshold: 50,
        freeUnlock: 'card_frequency_tracker',
        proUnlock: 'card_combinations',
        unlockMessage:
          'Card Frequency Tracker unlocked! Discover recurring themes and combinations.',
        proRequired: false,
        featureRoute: '/patterns',
      },
      {
        level: 3,
        threshold: 100,
        freeUnlock: 'tarot_patterns_advanced_preview',
        proUnlock: 'tarot_patterns_advanced',
        unlockMessage:
          'Advanced Pattern Visualizations available! See heatmaps and deep analytics.',
        proRequired: true,
        featureRoute: '/patterns',
      },
      {
        level: 4,
        threshold: 250,
        freeUnlock: null,
        proUnlock: 'ai_spread_interpretation',
        unlockMessage:
          'AI Spread Interpretation unlocked! Get deep cosmic insights into your readings.',
        proRequired: true,
        featureRoute: '/tarot',
      },
    ],
  },
  chart: {
    id: 'chart',
    name: 'Chart Explorer',
    icon: '🌟',
    description: 'Explore the depths of astrological charts',
    actionVerb: 'transits checked',
    levels: [
      {
        level: 1,
        threshold: 1,
        freeUnlock: 'cosmic_profile_basic',
        proUnlock: 'cosmic_profile',
        unlockMessage:
          "You've started your cosmic journey! Explore your planet placements.",
        proRequired: false,
        featureRoute: '/profile',
      },
      {
        level: 2,
        threshold: 10,
        freeUnlock: 'transit_history_7d',
        proUnlock: 'transit_history_30d',
        unlockMessage:
          "Transit History unlocked! See how past week's transits affected you.",
        proRequired: false,
        featureRoute: '/forecast',
      },
      {
        level: 3,
        threshold: 30,
        freeUnlock: 'solar_return_preview',
        proUnlock: 'solar_return',
        unlockMessage:
          'Solar Return preview! Upgrade to see your full birthday chart.',
        proRequired: true,
        featureRoute: '/profile',
      },
      {
        level: 4,
        threshold: 100,
        freeUnlock: null,
        proUnlock: 'personalized_transit_readings',
        unlockMessage:
          'Personalized Transit Readings unlocked! See exactly how transits affect YOUR chart.',
        proRequired: true,
        featureRoute: '/forecast',
      },
    ],
  },
  journal: {
    id: 'journal',
    name: 'Journal Keeper',
    icon: '✍️',
    description: 'Chronicle your cosmic journey',
    actionVerb: 'entries written',
    levels: [
      {
        level: 1,
        threshold: 5,
        freeUnlock: 'basic_cosmic_patterns',
        proUnlock: 'moon_phase_mood',
        unlockMessage:
          'Cosmic Patterns unlocked! See how moon phases affect your mood.',
        proRequired: false,
        featureRoute: '/patterns',
      },
      {
        level: 2,
        threshold: 20,
        freeUnlock: 'monthly_reflection_summary',
        proUnlock: 'monthly_insights',
        unlockMessage:
          'Monthly Summary ready! See your cosmic journey for this month.',
        proRequired: false,
        featureRoute: '/profile',
      },
      {
        level: 3,
        threshold: 50,
        freeUnlock: 'enhanced_pattern_analysis_preview',
        proUnlock: 'enhanced_pattern_analysis',
        unlockMessage:
          'Enhanced Pattern Analysis available! Discover transit and house activation patterns.',
        proRequired: true,
        featureRoute: '/patterns',
      },
      {
        level: 4,
        threshold: 100,
        freeUnlock: null,
        proUnlock: 'data_export',
        unlockMessage:
          'Data Export unlocked! Download your cosmic journal as PDF.',
        proRequired: true,
        featureRoute: '/book-of-shadows',
      },
    ],
  },
};

/**
 * Calculate the level based on total actions
 */
export function calculateLevel(
  skillTree: SkillTreeId,
  totalActions: number,
): {
  currentLevel: number;
  nextLevel: number | null;
  currentThreshold: number;
  nextThreshold: number | null;
  progressToNext: number;
  actionsToNext: number | null;
} {
  const config = SKILL_TREES[skillTree];
  let currentLevel = 0;
  let nextLevelIndex = 0;

  for (let i = 0; i < config.levels.length; i++) {
    if (totalActions >= config.levels[i].threshold) {
      currentLevel = config.levels[i].level;
      nextLevelIndex = i + 1;
    } else {
      break;
    }
  }

  const currentLevelConfig = config.levels[currentLevel - 1] || null;
  const nextLevelConfig = config.levels[nextLevelIndex] || null;

  let progressToNext = 100;
  let actionsToNext: number | null = null;

  if (nextLevelConfig) {
    const prevThreshold = currentLevelConfig?.threshold || 0;
    const nextThreshold = nextLevelConfig.threshold;
    const progressRange = nextThreshold - prevThreshold;
    const currentProgress = totalActions - prevThreshold;
    progressToNext = Math.min(
      100,
      Math.round((currentProgress / progressRange) * 100),
    );
    actionsToNext = nextThreshold - totalActions;
  }

  return {
    currentLevel,
    nextLevel: nextLevelConfig?.level || null,
    currentThreshold: currentLevelConfig?.threshold || 0,
    nextThreshold: nextLevelConfig?.threshold || null,
    progressToNext,
    actionsToNext,
  };
}

/**
 * Get all unlocked features for a skill tree at a given level
 */
export function getUnlockedFeatures(
  skillTree: SkillTreeId,
  level: number,
  isPro: boolean,
): string[] {
  const config = SKILL_TREES[skillTree];
  const features: string[] = [];

  for (const levelConfig of config.levels) {
    if (levelConfig.level <= level) {
      if (levelConfig.freeUnlock) {
        features.push(levelConfig.freeUnlock);
      }
      if (levelConfig.proUnlock && (isPro || !levelConfig.proRequired)) {
        features.push(levelConfig.proUnlock);
      }
    }
  }

  return features;
}

/**
 * Check if a level-up occurred and return the new level info
 */
export function checkLevelUp(
  skillTree: SkillTreeId,
  previousActions: number,
  newActions: number,
): {
  leveledUp: boolean;
  newLevel: number;
  levelConfig: LevelConfig | null;
} {
  const config = SKILL_TREES[skillTree];

  const previousCalc = calculateLevel(skillTree, previousActions);
  const newCalc = calculateLevel(skillTree, newActions);

  if (newCalc.currentLevel > previousCalc.currentLevel) {
    const levelConfig =
      config.levels.find((l) => l.level === newCalc.currentLevel) || null;
    return {
      leveledUp: true,
      newLevel: newCalc.currentLevel,
      levelConfig,
    };
  }

  return {
    leveledUp: false,
    newLevel: previousCalc.currentLevel,
    levelConfig: null,
  };
}

/**
 * Get the current level config for a skill tree
 */
export function getCurrentLevelConfig(
  skillTree: SkillTreeId,
  level: number,
): LevelConfig | null {
  const config = SKILL_TREES[skillTree];
  return config.levels.find((l) => l.level === level) || null;
}

/**
 * Get the next level config for a skill tree
 */
export function getNextLevelConfig(
  skillTree: SkillTreeId,
  currentLevel: number,
): LevelConfig | null {
  const config = SKILL_TREES[skillTree];
  return config.levels.find((l) => l.level === currentLevel + 1) || null;
}
