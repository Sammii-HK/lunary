/**
 * Batch pattern generation for legacy users
 * Usage: POST /api/test/patterns/batch
 *
 * Generates patterns for all paid users with sufficient data
 * This is a one-time migration/backfill endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { detectCosmicPatterns } from '@/lib/patterns/core/detector';
import { saveCosmicPatterns } from '@/lib/patterns/storage/secure-storage';

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Optional: Authenticate with CRON_SECRET (for production safety)
    const authHeader = request.headers.get('authorization');
    const expectedSecret = process.env.CRON_SECRET;

    if (expectedSecret && authHeader !== `Bearer ${expectedSecret}`) {
      // In development, allow without auth
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json(
          { success: false, error: 'Unauthorized' },
          { status: 401 },
        );
      }
    }

    // Get ALL users (with or without subscriptions)
    const usersResult = await sql`
      SELECT
        u.id,
        u.email,
        u."createdAt",
        COALESCE(s.plan_type, 'free') as plan_type,
        COALESCE(s.status, 'free') as status
      FROM "user" u
      LEFT JOIN subscriptions s ON u.id = s.user_id
      ORDER BY u."createdAt" DESC
    `;

    const users = usersResult.rows;
    console.log(`🎯 Found ${users.length} paid users to process`);

    const results = {
      total: users.length,
      processed: 0,
      patternsGenerated: 0,
      errors: 0,
      skipped: 0,
      details: [] as any[],
    };

    // Process users in batches of 10 (to avoid overwhelming the system)
    const batchSize = 10;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`,
      );

      await Promise.all(
        batch.map(async (user) => {
          try {
            // Check if user has sufficient data
            const tarotResult = await sql`
              SELECT COUNT(*) as count FROM tarot_readings
              WHERE user_id = ${user.id}
              AND created_at >= NOW() - INTERVAL '90 days'
            `;
            const tarotCount = parseInt(tarotResult.rows[0]?.count || '0');

            const journalResult = await sql`
              SELECT COUNT(*) as count FROM collections
              WHERE user_id = ${user.id}
              AND category = 'journal'
              AND created_at >= NOW() - INTERVAL '90 days'
            `;
            const journalCount = parseInt(journalResult.rows[0]?.count || '0');

            // Skip users with insufficient data
            if (tarotCount < 3 && journalCount < 5) {
              console.log(
                `⏭️  Skipping ${user.email}: insufficient data (${tarotCount} tarot, ${journalCount} journal)`,
              );
              results.skipped++;
              return;
            }

            // Detect patterns
            console.log(
              `🔍 Processing ${user.email}: ${tarotCount} tarot, ${journalCount} journal`,
            );

            const detectionResult = await detectCosmicPatterns(user.id, {
              daysBack: 90,
              userTier:
                user.plan_type === 'lunary_plus_ai' ||
                user.plan_type === 'lunary_plus_ai_annual'
                  ? 'premium'
                  : 'free',
            });

            // Skip if no valid patterns (insufficient_data type)
            if (
              detectionResult.patterns.length === 0 ||
              detectionResult.patterns[0].type === 'insufficient_data'
            ) {
              console.log(`⏭️  No patterns found for ${user.email}`);
              results.skipped++;
              return;
            }

            // Save patterns
            await saveCosmicPatterns(user.id, detectionResult.patterns);

            results.processed++;
            results.patternsGenerated += detectionResult.patterns.length;

            results.details.push({
              email: user.email,
              patternsFound: detectionResult.patterns.length,
              tarotPulls: tarotCount,
              journalEntries: journalCount,
            });

            console.log(
              `✅ Generated ${detectionResult.patterns.length} patterns for ${user.email}`,
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

      // Small delay between batches to avoid rate limits
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    const duration = Date.now() - startTime;

    console.log(
      `\n✅ Batch processing complete in ${(duration / 1000).toFixed(1)}s`,
    );
    console.log(`📊 Processed: ${results.processed}/${results.total}`);
    console.log(`🎯 Patterns generated: ${results.patternsGenerated}`);
    console.log(`⏭️  Skipped: ${results.skipped}`);
    console.log(`❌ Errors: ${results.errors}`);

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: results.total,
        processed: results.processed,
        patternsGenerated: results.patternsGenerated,
        skipped: results.skipped,
        errors: results.errors,
        duration: `${(duration / 1000).toFixed(1)}s`,
      },
      details: results.details,
    });
  } catch (error) {
    console.error('❌ Batch processing failed:', error);
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
