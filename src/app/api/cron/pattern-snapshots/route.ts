/**
 * Weekly cron job: Generate pattern snapshots
 * Runs weekly to capture pattern evolution over time
 *
 * Generates:
 * - Life Themes snapshots
 * - Tarot Season snapshots
 * - Archetype snapshots (when available)
 *
 * Saves only if patterns have changed significantly (>20% change)
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { generateAllSnapshots } from '@/lib/patterns/snapshot/generator';
import {
  savePatternSnapshot,
  shouldGenerateSnapshot,
} from '@/lib/patterns/snapshot/storage';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 },
        );
      }
    }

    // Get all active users (activity in last 30 days)
    const usersResult = await sql`
      SELECT DISTINCT u.id, u.email
      FROM "user" u
      WHERE u."createdAt" >= NOW() - INTERVAL '180 days'
        AND EXISTS (
          SELECT 1 FROM collections c
          WHERE c.user_id = u.id
            AND c.created_at >= NOW() - INTERVAL '30 days'
          LIMIT 1
        )
      ORDER BY u."createdAt" DESC
    `;

    const users = usersResult.rows;
    console.log(
      `📸 Generating pattern snapshots for ${users.length} active users`,
    );

    const results = {
      total: users.length,
      processed: 0,
      snapshotsGenerated: 0,
      snapshotsSkipped: 0,
      errors: 0,
      details: [] as any[],
    };

    // Process users in batches
    const batchSize = 20;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`,
      );

      await Promise.all(
        batch.map(async (user) => {
          try {
            // Check if we should generate snapshots for this user
            const needsLifeThemes = await shouldGenerateSnapshot(
              user.id,
              'life_themes',
            );
            const needsTarotSeason = await shouldGenerateSnapshot(
              user.id,
              'tarot_season',
            );

            if (!needsLifeThemes && !needsTarotSeason) {
              results.snapshotsSkipped++;
              return;
            }

            // Generate all snapshots
            const snapshots = await generateAllSnapshots(user.id);

            if (snapshots.length === 0) {
              results.snapshotsSkipped++;
              return;
            }

            // Save each snapshot (with change detection)
            let savedCount = 0;
            for (const snapshot of snapshots) {
              const saved = await savePatternSnapshot(user.id, snapshot);
              if (saved) {
                savedCount++;
              }
            }

            results.processed++;
            results.snapshotsGenerated += savedCount;

            if (savedCount > 0) {
              results.details.push({
                email: user.email,
                snapshotsGenerated: savedCount,
                types: snapshots.map((s) => s.type),
              });
            }

            console.log(
              `✅ ${user.email}: ${savedCount}/${snapshots.length} snapshots saved`,
            );
          } catch (error) {
            console.error(`❌ Error processing ${user.email}:`, error);
            results.errors++;
            results.details.push({
              email: user.email,
              error: error instanceof Error ? error.message : 'Unknown error',
            });
          }
        }),
      );

      // Small delay between batches
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const duration = Date.now() - startTime;

    console.log(
      `\n✅ Pattern snapshot generation complete in ${(duration / 1000).toFixed(1)}s`,
    );
    console.log(`📊 Processed: ${results.processed}/${results.total}`);
    console.log(`📸 Snapshots generated: ${results.snapshotsGenerated}`);
    console.log(`⏭️  Snapshots skipped: ${results.snapshotsSkipped}`);
    console.log(`❌ Errors: ${results.errors}`);

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: results.total,
        processed: results.processed,
        snapshotsGenerated: results.snapshotsGenerated,
        snapshotsSkipped: results.snapshotsSkipped,
        errors: results.errors,
        duration: `${(duration / 1000).toFixed(1)}s`,
      },
      details: results.details.slice(0, 50), // Return first 50 for readability
    });
  } catch (error) {
    console.error('❌ Pattern snapshot generation failed:', error);
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
