/**
 * Skill Tree Configuration for the Progress/Leveling System
 *
 * All unlocks tie to REAL features and thresholds:
 * - Tarot Mastery: Aligns with pattern detection minEvents (spreads only)
 * - Journal Keeper: Aligns with emotion pattern detection + Daily Thread levels
 * - Cosmic Explorer: Streak-based, ties to Daily Thread and pattern insights
 * - Ritual Keeper: Ritual habit tracking from dashboard
 *
 * Pattern detection reference (from src/lib/patterns/core/constants.ts):
 * - tarot_moon_phase: free, minEvents 3
 * - emotion_moon_phase: free, minEvents 5
 * - tarot_planetary_position: premium, minEvents 3
 * - emotion_planetary_position: premium, minEvents 5
 * - tarot_natal_transit: premium, minEvents 3, requires birth chart
 * - emotion_natal_transit: premium, minEvents 5, requires birth chart
 *
 * Archetype detection requires 3 of 4 data sources + min score 3
 */

export type SkillTreeId = 'tarot' | 'journal' | 'explorer' | 'ritual';

export interface LevelConfig {
  level: number;
  threshold: number;
  freeUnlock: string | null;
  proUnlock: string | null;
  unlockDescription: string;
  unlockMessage: string;
  proRequired: boolean;
  featureRoute?: string;
}

export type SkillIconId = 'square-star' | 'pen-tool' | 'moon-star' | 'shell';

export interface SkillTreeConfig {
  id: SkillTreeId;
  name: string;
  icon: SkillIconId;
  description: string;
  actionVerb: string;
  /** Default route to improve this skill (used when no level-specific route) */
  defaultRoute: string;
  levels: LevelConfig[];
}

export const SKILL_TREES: Record<SkillTreeId, SkillTreeConfig> = {
  tarot: {
    id: 'tarot',
    name: 'Tarot Mastery',
    icon: 'square-star',
    description: 'Deepen your tarot practice with spreads',
    actionVerb: 'spreads completed',
    defaultRoute: '/tarot#spreads',
    levels: [
      {
        level: 1,
        threshold: 3,
        freeUnlock: 'tarot_moon_phase_patterns',
        proUnlock: null,
        unlockDescription: 'Moon phase tarot patterns become detectable',
        unlockMessage:
          'Moon phase patterns unlocked! See how the moon influences your tarot pulls.',
        proRequired: false,
        featureRoute: undefined,
      },
      {
        level: 2,
        threshold: 10,
        freeUnlock: 'archetype_detection_tarot',
        proUnlock: null,
        unlockDescription: 'Archetype detection from tarot data',
        unlockMessage:
          'Your tarot data can now contribute to archetype detection!',
        proRequired: false,
        featureRoute: undefined,
      },
      {
        level: 3,
        threshold: 25,
        freeUnlock: null,
        proUnlock: 'planetary_tarot_patterns',
        unlockDescription: 'Planetary position & aspect tarot patterns',
        unlockMessage:
          'Planetary tarot patterns unlocked! See how planetary alignments shape your readings.',
        proRequired: true,
        featureRoute: undefined,
      },
      {
        level: 4,
        threshold: 50,
        freeUnlock: null,
        proUnlock: 'natal_transit_tarot_patterns',
        unlockDescription:
          'Natal transit tarot patterns (requires birth chart)',
        unlockMessage:
          'Natal transit patterns unlocked! See how transits to your birth chart affect your tarot.',
        proRequired: true,
        featureRoute: undefined,
      },
      {
        level: 5,
        threshold: 75,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Tarot Adept! 75 spreads completed.',
        proRequired: false,
      },
      {
        level: 6,
        threshold: 100,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Tarot Sage! 100 spreads completed.',
        proRequired: false,
      },
      {
        level: 7,
        threshold: 150,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Tarot Oracle! 150 spreads completed.',
        proRequired: false,
      },
      {
        level: 8,
        threshold: 200,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Tarot Master! 200 spreads completed.',
        proRequired: false,
      },
      {
        level: 9,
        threshold: 300,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Tarot Luminary! 300 spreads completed.',
        proRequired: false,
      },
      {
        level: 10,
        threshold: 500,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Tarot Grandmaster! 500 spreads completed.',
        proRequired: false,
      },
    ],
  },

  journal: {
    id: 'journal',
    name: 'Journal Keeper',
    icon: 'pen-tool',
    description: 'Chronicle your inner world',
    actionVerb: 'entries written',
    defaultRoute: '/guide?journal=1',
    levels: [
      {
        level: 1,
        threshold: 5,
        freeUnlock: 'emotion_moon_phase_patterns',
        proUnlock: null,
        unlockDescription: 'Emotion moon phase patterns become detectable',
        unlockMessage:
          'Moon mood patterns unlocked! See how the moon influences your emotions.',
        proRequired: false,
        featureRoute: undefined,
      },
      {
        level: 2,
        threshold: 15,
        freeUnlock: 'daily_thread_level_2',
        proUnlock: 'monthly_insights',
        unlockDescription:
          'Personalised daily thread content + monthly insights',
        unlockMessage:
          'Your daily thread now includes personalised transits and pattern insights!',
        proRequired: false,
        featureRoute: '/guide?journal=1',
      },
      {
        level: 3,
        threshold: 35,
        freeUnlock: 'archetype_detection_journal',
        proUnlock: 'planetary_emotion_patterns',
        unlockDescription:
          'Archetype detection from journal + planetary emotion patterns',
        unlockMessage: 'Your journal data now reveals your cosmic archetype!',
        proRequired: false,
        featureRoute: undefined,
      },
      {
        level: 4,
        threshold: 60,
        freeUnlock: null,
        proUnlock: 'natal_transit_emotion_patterns',
        unlockDescription:
          'Natal transit emotion patterns (requires birth chart)',
        unlockMessage:
          'Natal transit emotion patterns unlocked! See how personal transits shape your moods.',
        proRequired: true,
        featureRoute: undefined,
      },
      {
        level: 5,
        threshold: 90,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Devoted Scribe! 90 entries written.',
        proRequired: false,
      },
      {
        level: 6,
        threshold: 120,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Journal Sage! 120 entries written.',
        proRequired: false,
      },
      {
        level: 7,
        threshold: 180,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Inner Oracle! 180 entries written.',
        proRequired: false,
      },
      {
        level: 8,
        threshold: 250,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Journal Master! 250 entries written.',
        proRequired: false,
      },
      {
        level: 9,
        threshold: 365,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Luminous Chronicler! 365 entries written.',
        proRequired: false,
      },
      {
        level: 10,
        threshold: 500,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Journal Grandmaster! 500 entries written.',
        proRequired: false,
      },
    ],
  },

  explorer: {
    id: 'explorer',
    name: 'Cosmic Explorer',
    icon: 'moon-star',
    description: 'Build a consistent cosmic practice',
    actionVerb: 'day streak',
    defaultRoute: '/horoscope',
    levels: [
      {
        level: 1,
        threshold: 1,
        freeUnlock: 'cosmic_profile',
        proUnlock: 'personal_transits',
        unlockDescription: 'Cosmic profile + personal transit tracking',
        unlockMessage:
          'Your cosmic profile is active! Track your personal transits.',
        proRequired: false,
        featureRoute: '/horoscope',
      },
      {
        level: 2,
        threshold: 7,
        freeUnlock: 'streak_milestones',
        proUnlock: null,
        unlockDescription: 'Streak milestones + expanded daily thread',
        unlockMessage:
          '7-day streak! Streak milestones are now tracked in your journey.',
        proRequired: false,
        featureRoute: '/horoscope',
      },
      {
        level: 3,
        threshold: 14,
        freeUnlock: 'pattern_insights_daily_thread',
        proUnlock: null,
        unlockDescription: 'Pattern insights in your daily thread',
        unlockMessage:
          '14-day streak! Your daily thread now includes pattern insights.',
        proRequired: false,
        featureRoute: '/horoscope',
      },
      {
        level: 4,
        threshold: 30,
        freeUnlock: 'daily_thread_level_3',
        proUnlock: 'full_integrative_experience',
        unlockDescription:
          'Full integrative daily thread with memories and milestones',
        unlockMessage:
          '30-day streak! You now have the full integrative daily thread experience.',
        proRequired: false,
        featureRoute: '/horoscope',
      },
      {
        level: 5,
        threshold: 60,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Cosmic Voyager! 60-day streak.',
        proRequired: false,
      },
      {
        level: 6,
        threshold: 90,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Star Navigator! 90-day streak.',
        proRequired: false,
      },
      {
        level: 7,
        threshold: 120,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Celestial Guide! 120-day streak.',
        proRequired: false,
      },
      {
        level: 8,
        threshold: 180,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Cosmic Sage! 180-day streak.',
        proRequired: false,
      },
      {
        level: 9,
        threshold: 270,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Galaxy Walker! 270-day streak.',
        proRequired: false,
      },
      {
        level: 10,
        threshold: 365,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Cosmic Master! 365-day streak.',
        proRequired: false,
      },
    ],
  },

  ritual: {
    id: 'ritual',
    name: 'Ritual Keeper',
    icon: 'shell',
    description: 'Build sacred daily practices',
    actionVerb: 'rituals completed',
    defaultRoute: '/app',
    levels: [
      {
        level: 1,
        threshold: 3,
        freeUnlock: 'ritual_tracking',
        proUnlock: null,
        unlockDescription: 'Ritual streak tracking',
        unlockMessage:
          'Ritual tracking active! Your practice is building momentum.',
        proRequired: false,
        featureRoute: '/app',
      },
      {
        level: 2,
        threshold: 10,
        freeUnlock: 'ritual_streak_milestones',
        proUnlock: null,
        unlockDescription: 'Ritual streak milestones',
        unlockMessage:
          '10 rituals completed! Your ritual streak milestones are now tracked.',
        proRequired: false,
        featureRoute: '/app',
      },
      {
        level: 3,
        threshold: 25,
        freeUnlock: 'moon_phase_rituals',
        proUnlock: null,
        unlockDescription: 'Moon-phase-aligned ritual suggestions',
        unlockMessage:
          'Moon ritual alignment unlocked! Get rituals tuned to the lunar cycle.',
        proRequired: false,
        featureRoute: '/app',
      },
      {
        level: 4,
        threshold: 50,
        freeUnlock: null,
        proUnlock: 'ritual_calendar',
        unlockDescription: 'Full ritual calendar with cosmic timing',
        unlockMessage:
          'Ritual calendar unlocked! Plan rituals aligned with cosmic events.',
        proRequired: true,
        featureRoute: '/app',
      },
      {
        level: 5,
        threshold: 75,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Ritual Adept! 75 rituals completed.',
        proRequired: false,
      },
      {
        level: 6,
        threshold: 100,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Sacred Practitioner! 100 rituals completed.',
        proRequired: false,
      },
      {
        level: 7,
        threshold: 150,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Ritual Oracle! 150 rituals completed.',
        proRequired: false,
      },
      {
        level: 8,
        threshold: 200,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Ritual Master! 200 rituals completed.',
        proRequired: false,
      },
      {
        level: 9,
        threshold: 300,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Sacred Guardian! 300 rituals completed.',
        proRequired: false,
      },
      {
        level: 10,
        threshold: 500,
        freeUnlock: null,
        proUnlock: null,
        unlockDescription: '',
        unlockMessage: 'Ritual Grandmaster! 500 rituals completed.',
        proRequired: false,
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
