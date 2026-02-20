import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { detectMoods } from '@/lib/journal/mood-detector';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

/**
 * ADMIN ONLY: One-time backfill mood tags for ALL journal entries
 *
 * Security: Add authentication check before deploying to production
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json();
    const {
      daysBack = 365,
      method = 'keyword',
      dryRun = true,
      maxUsers = 100,
    } = body;

    console.log(
      `🔄 Starting GLOBAL mood backfill (${daysBack} days, method: ${method}, dryRun: ${dryRun}, maxUsers: ${maxUsers})`,
    );

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysBack);

    // Get all users with journal entries
    const usersResult = await sql`
      SELECT DISTINCT user_id
      FROM collections
      WHERE category = 'journal'
      AND created_at >= ${cutoffDate.toISOString()}
      LIMIT ${maxUsers}
    `;

    console.log(
      `📊 Found ${usersResult.rows.length} users with journal entries`,
    );

    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalMoodsAdded = 0;

    for (const userRow of usersResult.rows) {
      const userId = userRow.user_id;

      // Get journal entries for this user
      const entriesResult = await sql`
        SELECT id, content
        FROM collections
        WHERE user_id = ${userId}
        AND category = 'journal'
        AND created_at >= ${cutoffDate.toISOString()}
      `;

      for (const entryRow of entriesResult.rows) {
        const content =
          typeof entryRow.content === 'string'
            ? JSON.parse(entryRow.content)
            : entryRow.content;
        const text = content.text || '';
        const existingMoods = content.moodTags || [];

        // Skip if text too short or already well-tagged
        if (text.length < 20 || existingMoods.length >= 3) {
          totalSkipped++;
          continue;
        }

        // Detect moods
        const detection = await detectMoods(text, method === 'ai');

        if (detection.moods.length === 0) {
          totalSkipped++;
          continue;
        }

        // Merge with existing moods
        const mergedMoods = [
          ...existingMoods,
          ...detection.moods.filter((m: string) => !existingMoods.includes(m)),
        ].slice(0, 5);

        const moodsAdded = mergedMoods.length - existingMoods.length;
        totalMoodsAdded += moodsAdded;

        // Apply update (unless dry run)
        if (!dryRun) {
          const updatedContent = {
            ...content,
            moodTags: mergedMoods,
            autoTagged: true,
            tagMethod: detection.method,
          };
          await sql`
            UPDATE collections
            SET content = ${JSON.stringify(updatedContent)}::jsonb
            WHERE id = ${entryRow.id}
          `;
          totalUpdated++;
        }
      }

      // Progress logging per user
      console.log(
        `✅ Processed user ${userId}: ${entriesResult.rows.length} entries`,
      );
    }

    console.log(
      `🎉 Backfill complete: ${totalUpdated} updated, ${totalSkipped} skipped, ${totalMoodsAdded} moods added`,
    );

    return NextResponse.json({
      success: true,
      dryRun,
      method,
      stats: {
        usersProcessed: usersResult.rows.length,
        entriesUpdated: dryRun ? 0 : totalUpdated,
        entriesSkipped: totalSkipped,
        moodsAdded: totalMoodsAdded,
      },
      message: dryRun
        ? 'Dry run complete - no changes made. Set dryRun=false to apply updates.'
        : `Successfully backfilled ${totalUpdated} journal entries with mood tags`,
    });
  } catch (error) {
    console.error('❌ Global mood backfill error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    );
  }
}
