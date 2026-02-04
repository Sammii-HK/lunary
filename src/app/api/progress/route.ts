import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  SKILL_TREES,
  SkillTreeId,
  calculateLevel,
  getUnlockedFeatures,
  getNextLevelConfig,
} from '@/lib/progress/config';

export interface SkillTreeProgress {
  skillTree: SkillTreeId;
  name: string;
  icon: string;
  currentLevel: number;
  totalActions: number;
  nextLevel: number | null;
  progressToNext: number;
  actionsToNext: number | null;
  nextThreshold: number | null;
  unlockedFeatures: string[];
  nextUnlock: string | null;
  nextUnlockDescription: string | null;
  actionVerb: string;
  featureRoute: string | null;
}

/**
 * GET /api/progress
 * Get user's progress for all skill trees
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Get subscription status for feature access
    const subscriptionResult = await sql`
      SELECT status, plan_type FROM subscriptions
      WHERE user_id = ${user.id}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const isPro = ['active', 'trialing'].includes(
      subscriptionResult.rows[0]?.status || '',
    );

    // Get all progress records for this user
    const result = await sql`
      SELECT skill_tree, current_level, total_actions, unlocked_features, last_level_up_at
      FROM user_progress
      WHERE user_id = ${user.id}
    `;

    // Build progress map from existing records
    const progressMap = new Map<string, (typeof result.rows)[0]>();
    for (const row of result.rows) {
      progressMap.set(row.skill_tree, row);
    }

    // Build response for all skill trees
    const progress: SkillTreeProgress[] = Object.values(SKILL_TREES).map(
      (config) => {
        const record = progressMap.get(config.id);
        const totalActions = record?.total_actions || 0;
        const levelCalc = calculateLevel(config.id, totalActions);
        const unlockedFeatures = getUnlockedFeatures(
          config.id,
          levelCalc.currentLevel,
          isPro,
        );
        const nextLevelConfig = getNextLevelConfig(
          config.id,
          levelCalc.currentLevel,
        );

        // Get current level config for feature route
        const currentLevelConfig =
          levelCalc.currentLevel > 0
            ? config.levels.find((l) => l.level === levelCalc.currentLevel)
            : null;

        return {
          skillTree: config.id,
          name: config.name,
          icon: config.icon,
          currentLevel: levelCalc.currentLevel,
          totalActions,
          nextLevel: levelCalc.nextLevel,
          progressToNext: levelCalc.progressToNext,
          actionsToNext: levelCalc.actionsToNext,
          nextThreshold: levelCalc.nextThreshold,
          unlockedFeatures,
          nextUnlock:
            nextLevelConfig?.freeUnlock || nextLevelConfig?.proUnlock || null,
          nextUnlockDescription: nextLevelConfig?.unlockDescription || null,
          actionVerb: config.actionVerb,
          featureRoute:
            currentLevelConfig?.featureRoute ||
            nextLevelConfig?.featureRoute ||
            null,
        };
      },
    );

    return NextResponse.json({ progress, isPro });
  } catch (error) {
    console.error('[Progress] Error fetching progress:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 },
    );
  }
}
