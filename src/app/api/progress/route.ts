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

    // Lazy backfill: seed progress from historical data when tracked count is behind
    try {
      const needsBackfill = (['ritual', 'journal', 'tarot'] as const).filter(
        (id) => {
          const rec = progressMap.get(id);
          return !rec || rec.total_actions === 0;
        },
      );

      if (needsBackfill.length > 0) {
        // Fetch actual counts from source tables in parallel
        const [streakResult, journalResult, tarotResult] = await Promise.all([
          needsBackfill.includes('ritual')
            ? sql`SELECT total_check_ins FROM user_streaks WHERE user_id = ${user.id} LIMIT 1`
            : null,
          needsBackfill.includes('journal')
            ? sql`SELECT COUNT(*)::int AS count FROM collections WHERE user_id = ${user.id} AND category IN ('journal', 'dream')`
            : null,
          needsBackfill.includes('tarot')
            ? sql`SELECT COUNT(*)::int AS count FROM tarot_readings WHERE user_id = ${user.id} AND jsonb_array_length(cards) > 1`
            : null,
        ]);

        const backfills: { id: SkillTreeId; count: number }[] = [];
        if (streakResult) {
          const count = streakResult.rows[0]?.total_check_ins || 0;
          if (count > 0) backfills.push({ id: 'ritual', count });
        }
        if (journalResult) {
          const count = journalResult.rows[0]?.count || 0;
          if (count > 0) backfills.push({ id: 'journal', count });
        }
        if (tarotResult) {
          const count = tarotResult.rows[0]?.count || 0;
          if (count > 0) backfills.push({ id: 'tarot', count });
        }

        if (backfills.length > 0) {
          const { incrementProgress } = await import('@/lib/progress/server');
          await Promise.all(
            backfills.map(async ({ id, count }) => {
              await incrementProgress(user.id, id, count, isPro);
              progressMap.set(id, {
                skill_tree: id,
                current_level: 0,
                total_actions: count,
                unlocked_features: [],
                last_level_up_at: null,
              });
            }),
          );
        }
      }
    } catch (backfillError) {
      console.warn('[Progress] Backfill failed:', backfillError);
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
            config.defaultRoute,
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
