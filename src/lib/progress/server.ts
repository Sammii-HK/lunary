import { sql } from '@vercel/postgres';
import {
  SkillTreeId,
  calculateLevel,
  checkLevelUp,
  getUnlockedFeatures,
} from './config';

interface ProgressResult {
  success: boolean;
  leveledUp: boolean;
  newLevel: number;
  totalActions: number;
  unlockMessage?: string;
  featureRoute?: string;
}

/**
 * Server-side function to increment progress for a skill tree
 * Use this in API routes after a relevant action is completed
 */
export async function incrementProgress(
  userId: string,
  skillTree: SkillTreeId,
  amount: number = 1,
  isPro: boolean = false,
): Promise<ProgressResult> {
  try {
    // Get current progress
    const currentResult = await sql`
      SELECT total_actions, current_level
      FROM user_progress
      WHERE user_id = ${userId} AND skill_tree = ${skillTree}
    `;

    const previousActions = currentResult.rows[0]?.total_actions || 0;
    const newActions = previousActions + amount;

    // Calculate new level
    const levelCalc = calculateLevel(skillTree, newActions);
    const levelUpCheck = checkLevelUp(skillTree, previousActions, newActions);
    const unlockedFeatures = getUnlockedFeatures(
      skillTree,
      levelCalc.currentLevel,
      isPro,
    );

    // Upsert progress record
    if (currentResult.rows.length === 0) {
      await sql`
        INSERT INTO user_progress (user_id, skill_tree, current_level, total_actions, unlocked_features, last_level_up_at)
        VALUES (
          ${userId},
          ${skillTree},
          ${levelCalc.currentLevel},
          ${newActions},
          ${JSON.stringify(unlockedFeatures)}::jsonb,
          ${levelUpCheck.leveledUp ? new Date().toISOString() : null}
        )
      `;
    } else {
      await sql`
        UPDATE user_progress
        SET
          current_level = ${levelCalc.currentLevel},
          total_actions = ${newActions},
          unlocked_features = ${JSON.stringify(unlockedFeatures)}::jsonb,
          last_level_up_at = CASE WHEN ${levelUpCheck.leveledUp} THEN NOW() ELSE last_level_up_at END,
          updated_at = NOW()
        WHERE user_id = ${userId} AND skill_tree = ${skillTree}
      `;
    }

    // Track level up event
    if (levelUpCheck.leveledUp && levelUpCheck.levelConfig) {
      try {
        await sql`
          INSERT INTO analytics_user_activity (user_id, activity_date, activity_type, metadata)
          VALUES (
            ${userId},
            CURRENT_DATE,
            'level_up',
            ${JSON.stringify({
              skill_tree: skillTree,
              new_level: levelUpCheck.newLevel,
              feature_unlocked:
                levelUpCheck.levelConfig.freeUnlock ||
                levelUpCheck.levelConfig.proUnlock,
            })}::jsonb
          )
          ON CONFLICT (user_id, activity_date, activity_type)
          DO UPDATE SET
            activity_count = analytics_user_activity.activity_count + 1,
            metadata = EXCLUDED.metadata
        `;
      } catch (analyticsError) {
        // Non-critical
        console.warn(
          '[Progress] Failed to track level up event:',
          analyticsError,
        );
      }
    }

    return {
      success: true,
      leveledUp: levelUpCheck.leveledUp,
      newLevel: levelCalc.currentLevel,
      totalActions: newActions,
      unlockMessage: levelUpCheck.levelConfig?.unlockMessage,
      featureRoute: levelUpCheck.levelConfig?.featureRoute,
    };
  } catch (error) {
    console.error('[Progress] Failed to increment progress:', error);
    return {
      success: false,
      leveledUp: false,
      newLevel: 0,
      totalActions: 0,
    };
  }
}

/**
 * Set explorer progress to an absolute value (streak count)
 * Unlike incrementProgress, this SETS the value rather than adding to it.
 * Used for streak-based progress where the value reflects current streak.
 */
export async function setExplorerProgress(
  userId: string,
  currentStreak: number,
): Promise<ProgressResult> {
  try {
    const skillTree: SkillTreeId = 'explorer';

    // Get current progress
    const currentResult = await sql`
      SELECT total_actions, current_level
      FROM user_progress
      WHERE user_id = ${userId} AND skill_tree = ${skillTree}
    `;

    const previousActions = currentResult.rows[0]?.total_actions || 0;

    // Only update if streak is higher (don't decrease on streak reset)
    const newActions = Math.max(previousActions, currentStreak);

    const levelCalc = calculateLevel(skillTree, newActions);
    const levelUpCheck = checkLevelUp(skillTree, previousActions, newActions);
    const unlockedFeatures = getUnlockedFeatures(
      skillTree,
      levelCalc.currentLevel,
      false,
    );

    if (currentResult.rows.length === 0) {
      await sql`
        INSERT INTO user_progress (user_id, skill_tree, current_level, total_actions, unlocked_features, last_level_up_at)
        VALUES (
          ${userId},
          ${skillTree},
          ${levelCalc.currentLevel},
          ${newActions},
          ${JSON.stringify(unlockedFeatures)}::jsonb,
          ${levelUpCheck.leveledUp ? new Date().toISOString() : null}
        )
      `;
    } else {
      await sql`
        UPDATE user_progress
        SET
          current_level = ${levelCalc.currentLevel},
          total_actions = ${newActions},
          unlocked_features = ${JSON.stringify(unlockedFeatures)}::jsonb,
          last_level_up_at = CASE WHEN ${levelUpCheck.leveledUp} THEN NOW() ELSE last_level_up_at END,
          updated_at = NOW()
        WHERE user_id = ${userId} AND skill_tree = ${skillTree}
      `;
    }

    return {
      success: true,
      leveledUp: levelUpCheck.leveledUp,
      newLevel: levelCalc.currentLevel,
      totalActions: newActions,
      unlockMessage: levelUpCheck.levelConfig?.unlockMessage,
      featureRoute: levelUpCheck.levelConfig?.featureRoute,
    };
  } catch (error) {
    console.error('[Progress] Failed to set explorer progress:', error);
    return {
      success: false,
      leveledUp: false,
      newLevel: 0,
      totalActions: 0,
    };
  }
}

/**
 * Get the current progress for a user and skill tree
 */
export async function getProgress(
  userId: string,
  skillTree: SkillTreeId,
): Promise<{
  currentLevel: number;
  totalActions: number;
  unlockedFeatures: string[];
} | null> {
  try {
    const result = await sql`
      SELECT current_level, total_actions, unlocked_features
      FROM user_progress
      WHERE user_id = ${userId} AND skill_tree = ${skillTree}
    `;

    if (result.rows.length === 0) {
      return null;
    }

    return {
      currentLevel: result.rows[0].current_level,
      totalActions: result.rows[0].total_actions,
      unlockedFeatures: result.rows[0].unlocked_features || [],
    };
  } catch (error) {
    console.error('[Progress] Failed to get progress:', error);
    return null;
  }
}
