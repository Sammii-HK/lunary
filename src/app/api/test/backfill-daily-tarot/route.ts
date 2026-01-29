/**
 * Backfill historical daily tarot for pattern detection
 *
 * Recreates daily tarot cards for past dates using deterministic seeds
 * This gives users 90 days of daily tarot history for pattern analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getTarotCard } from '../../../../../utils/tarot/tarot';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import dayOfYear from 'dayjs/plugin/dayOfYear';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(dayOfYear);

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify authorization
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

    // Get backfill parameters from request body
    const body = await request.json().catch(() => ({}));
    const daysBack = body.daysBack || 90; // Default to 90 days
    const batchSize = body.batchSize || 20; // Process 20 users at a time

    // Get all users with profiles
    const usersResult = await sql`
      SELECT
        u.id,
        u.email,
        up.name,
        up.birthday,
        up.location,
        u."createdAt"
      FROM "user" u
      LEFT JOIN user_profiles up ON u.id = up.user_id
      WHERE u."createdAt" <= NOW()
      ORDER BY u."createdAt" DESC
    `;

    const users = usersResult.rows;
    console.log(
      `🔄 Backfilling daily tarot for ${users.length} users (${daysBack} days)`,
    );

    const results = {
      total: users.length,
      processed: 0,
      cardsGenerated: 0,
      cardsSkipped: 0,
      errors: 0,
      details: [] as any[],
    };

    // Process users in batches
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      console.log(
        `\n📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(users.length / batchSize)}`,
      );

      await Promise.all(
        batch.map(async (user) => {
          try {
            // Get user's timezone
            const location = user.location as any;
            const userTimezone = location?.timezone || 'UTC';

            // Calculate earliest date to backfill
            const userCreatedAt = dayjs(user.createdAt).tz(userTimezone);
            const earliestDate = dayjs()
              .tz(userTimezone)
              .subtract(daysBack, 'days');
            const startDate = userCreatedAt.isAfter(earliestDate)
              ? userCreatedAt
              : earliestDate;
            const today = dayjs().tz(userTimezone);

            let cardsGenerated = 0;
            let cardsSkipped = 0;

            // Generate daily tarot for each day from startDate to yesterday
            for (
              let date = startDate;
              date.isBefore(today, 'day');
              date = date.add(1, 'day')
            ) {
              const dateStr = date.format('YYYY-MM-DD');
              const dayNum = date.dayOfYear();

              // Check if daily tarot already exists for this date
              const existingResult = await sql`
                SELECT id FROM tarot_readings
                WHERE user_id = ${user.id}
                  AND spread_slug = 'daily-tarot'
                  AND DATE(created_at) = ${dateStr}::date
                LIMIT 1
              `;

              if (existingResult.rows.length > 0) {
                cardsSkipped++;
                continue;
              }

              // Generate card using same logic as DailyCardPreview.tsx
              let cardName: string;
              let isPersonalized = false;

              if (user.name && user.birthday) {
                // Personalized daily card
                const personalCard = getTarotCard(
                  `daily-${dateStr}`,
                  user.name,
                  user.birthday,
                );
                cardName = personalCard.name;
                isPersonalized = true;
              } else {
                // General daily card
                const generalSeed = `cosmic-${dateStr}-${dayNum}-energy`;
                const generalCard = getTarotCard(generalSeed);
                cardName = generalCard.name;
              }

              // Get full card details
              const card = getTarotCard(cardName);

              // Store with historical timestamp
              await sql`
                INSERT INTO tarot_readings (
                  user_id,
                  spread_slug,
                  spread_name,
                  cards,
                  plan_snapshot,
                  created_at
                ) VALUES (
                  ${user.id},
                  'daily-tarot',
                  'Daily Tarot',
                  ${JSON.stringify([
                    {
                      card: {
                        name: card.name,
                        suit: card.suit,
                        arcana: card.arcana,
                        keywords: card.keywords,
                        information: card.information,
                      },
                      isPersonalized,
                      generatedAt: date.toISOString(),
                      backfilled: true,
                    },
                  ])}::jsonb,
                  ${JSON.stringify({ tier: isPersonalized ? 'premium' : 'free' })}::jsonb,
                  ${dateStr}::timestamp
                )
              `;

              cardsGenerated++;
            }

            results.processed++;
            results.cardsGenerated += cardsGenerated;
            results.cardsSkipped += cardsSkipped;

            if (cardsGenerated > 0) {
              results.details.push({
                email: user.email,
                cardsGenerated,
                cardsSkipped,
                daysBackfilled: cardsGenerated,
              });
            }

            console.log(
              `✅ ${user.email}: ${cardsGenerated} cards generated, ${cardsSkipped} skipped`,
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

    console.log(`\n✅ Backfill complete in ${(duration / 1000).toFixed(1)}s`);
    console.log(`📊 Processed: ${results.processed}/${results.total}`);
    console.log(`🎯 Cards generated: ${results.cardsGenerated}`);
    console.log(`⏭️  Cards skipped: ${results.cardsSkipped}`);
    console.log(`❌ Errors: ${results.errors}`);

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: results.total,
        processed: results.processed,
        cardsGenerated: results.cardsGenerated,
        cardsSkipped: results.cardsSkipped,
        errors: results.errors,
        duration: `${(duration / 1000).toFixed(1)}s`,
        daysBackfilled: daysBack,
      },
      details: results.details.slice(0, 50), // Return first 50 for readability
    });
  } catch (error) {
    console.error('❌ Backfill failed:', error);
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
