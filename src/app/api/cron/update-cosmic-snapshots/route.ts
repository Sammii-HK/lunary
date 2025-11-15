import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  getGlobalCosmicData,
  buildGlobalCosmicData,
} from '@/lib/cosmic-snapshot/global-cache';
import {
  buildSnapshotWithGlobalCache,
  saveSnapshot,
} from '@/lib/cosmic-snapshot/cache';

export const runtime = 'nodejs';

const BATCH_SIZE = 100;

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date();
    console.log(
      '[update-cosmic-snapshots] Starting update at',
      now.toISOString(),
    );

    let globalData = await getGlobalCosmicData(now);
    if (!globalData) {
      console.log(
        '[update-cosmic-snapshots] Global data not cached, building...',
      );
      globalData = await buildGlobalCosmicData(now);
    }

    const activeUsers = await sql`
      SELECT DISTINCT user_id, user_email, preferences
      FROM push_subscriptions
      WHERE is_active = true
      AND (
        preferences->>'birthday' IS NOT NULL 
        AND preferences->>'birthday' != ''
      )
      LIMIT ${BATCH_SIZE}
    `;

    if (activeUsers.rows.length === 0) {
      console.log('[update-cosmic-snapshots] No active users found');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No active users to process',
      });
    }

    console.log(
      `[update-cosmic-snapshots] Processing ${activeUsers.rows.length} users`,
    );

    let processed = 0;
    let failed = 0;
    const errors: Array<{ userId: string; error: string }> = [];

    for (const user of activeUsers.rows) {
      try {
        const userId = user.user_id;
        const preferences = user.preferences || {};
        const birthday = preferences.birthday as string;
        const userName = (preferences.name as string) || undefined;
        const timezone = (preferences.timezone as string) || 'Europe/London';
        const locale = (preferences.locale as string) || 'en-GB';

        if (!birthday || !userId) {
          console.log(`⚠️ Skipping user ${userId} - missing birthday`);
          continue;
        }

        const context = await buildSnapshotWithGlobalCache(
          userId,
          globalData,
          timezone,
          locale,
          userName,
          birthday,
          now,
        );

        await saveSnapshot(userId, now, context);
        processed++;
      } catch (error) {
        failed++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(
          `[update-cosmic-snapshots] Failed for user ${user.user_id}:`,
          errorMsg,
        );
        errors.push({
          userId: user.user_id,
          error: errorMsg,
        });
      }
    }

    console.log(
      `[update-cosmic-snapshots] Completed: ${processed} processed, ${failed} failed`,
    );

    return NextResponse.json({
      success: true,
      processed,
      failed,
      totalUsers: activeUsers.rows.length,
      errors: errors.slice(0, 10),
      timestamp: now.toISOString(),
    });
  } catch (error) {
    console.error('[update-cosmic-snapshots] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update cosmic snapshots',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
