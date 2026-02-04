import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  SKILL_TREES,
  SkillTreeId,
  calculateLevel,
  checkLevelUp,
  getUnlockedFeatures,
} from '@/lib/progress/config';

interface IncrementRequest {
  skillTree: SkillTreeId;
  amount?: number;
}

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  unlockMessage: string | null;
  unlockedFeature: string | null;
  featureRoute: string | null;
}

/**
 * POST /api/progress/increment
 * Increment progress for a skill tree and check for level-ups
 */
export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body: IncrementRequest = await request.json();

    const { skillTree, amount = 1 } = body;

    // Validate skill tree
    if (!SKILL_TREES[skillTree]) {
      return NextResponse.json(
        { error: 'Invalid skill tree' },
        { status: 400 },
      );
    }

    // Get subscription status
    const subscriptionResult = await sql`
      SELECT status, plan_type FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const isPro = ['active', 'trialing'].includes(
      subscriptionResult.rows[0]?.status || '',
    );

    // Get current progress
    const currentResult = await sql`
      SELECT total_actions, current_level, unlocked_features
      FROM user_progress
      WHERE user_id = ${user.id} AND skill_tree = ${skillTree}
    `;

    const previousActions = currentResult.rows[0]?.total_actions || 0;
    const newActions = previousActions + amount;

    // Check for level up
    const levelUpCheck = checkLevelUp(skillTree, previousActions, newActions);
    const levelCalc = calculateLevel(skillTree, newActions);

    // Get unlocked features
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
          ${user.id},
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
          last_level_up_at = ${levelUpCheck.leveledUp ? new Date().toISOString() : currentResult.rows[0]?.last_level_up_at},
          updated_at = NOW()
        WHERE user_id = ${user.id} AND skill_tree = ${skillTree}
      `;
    }

    // Track level up event if it occurred
    if (levelUpCheck.leveledUp && levelUpCheck.levelConfig) {
      await sql`
        INSERT INTO analytics_user_activity (user_id, activity_date, activity_type, metadata)
        VALUES (
          ${user.id},
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
          metadata = ${JSON.stringify({
            skill_tree: skillTree,
            new_level: levelUpCheck.newLevel,
            feature_unlocked:
              levelUpCheck.levelConfig.freeUnlock ||
              levelUpCheck.levelConfig.proUnlock,
          })}::jsonb
      `;
    }

    const levelUp: LevelUpResult = {
      leveledUp: levelUpCheck.leveledUp,
      newLevel: levelCalc.currentLevel,
      unlockMessage: levelUpCheck.levelConfig?.unlockMessage || null,
      unlockedFeature:
        levelUpCheck.levelConfig?.freeUnlock ||
        levelUpCheck.levelConfig?.proUnlock ||
        null,
      featureRoute: levelUpCheck.levelConfig?.featureRoute || null,
    };

    return NextResponse.json({
      success: true,
      progress: {
        skillTree,
        currentLevel: levelCalc.currentLevel,
        totalActions: newActions,
        progressToNext: levelCalc.progressToNext,
        actionsToNext: levelCalc.actionsToNext,
        nextThreshold: levelCalc.nextThreshold,
        unlockedFeatures,
      },
      levelUp,
    });
  } catch (error) {
    console.error('[Progress] Error incrementing progress:', error);
    return NextResponse.json(
      { error: 'Failed to increment progress' },
      { status: 500 },
    );
  }
}
