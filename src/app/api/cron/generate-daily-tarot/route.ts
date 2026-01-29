/**
 * Daily Cron Job: Generate daily tarot for all users
 * Runs at 00:05 UTC daily
 *
 * CRITICAL: Respects user timezones
 * - Each user gets daily tarot based on THEIR local date, not UTC
 * - Uses same seed as DailyCardPreview.tsx for consistency
 * - Stores in tarot_readings for historical pattern detection
 *
 * Timezone handling:
 * - Reads user.location.timezone from database
 * - Calculates user's current local date
 * - Generates card using local date seed
 * - Stores with local timestamp
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

    // Get all users with location data (for timezone) and birthday from user_profiles
    // CRITICAL: Each user gets daily tarot based on THEIR local date, not UTC
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
      WHERE u."createdAt" >= NOW() - INTERVAL '180 days'
      ORDER BY u."createdAt" DESC
    `;

    const users = usersResult.rows;
    console.log(`📅 Generating daily tarot for ${users.length} users`);

    const results = {
      total: users.length,
      generated: 0,
      skipped: 0,
      errors: 0,
    };

    // Process users in batches
    const batchSize = 50;

    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);

      await Promise.all(
        batch.map(async (user) => {
          try {
            // Get user's timezone from location data
            const location = user.location as any;
            const userTimezone = location?.timezone || 'UTC';

            // Calculate user's LOCAL date (not UTC)
            // This matches DailyCardPreview.tsx behavior
            const userLocalDate = dayjs().tz(userTimezone);
            const userLocalDateStr = userLocalDate.format('YYYY-MM-DD');
            const userDayOfYear = userLocalDate.dayOfYear();

            // Check if daily tarot already exists for user's today
            const existingResult = await sql`
              SELECT id FROM tarot_readings
              WHERE user_id = ${user.id}
                AND spread_slug = 'daily-tarot'
                AND DATE(created_at) = ${userLocalDateStr}::date
              LIMIT 1
            `;

            if (existingResult.rows.length > 0) {
              results.skipped++;
              return;
            }

            // Generate daily tarot card using user's LOCAL date
            // CRITICAL: Must use same seed as DailyCardPreview.tsx
            let cardName: string;
            let isPersonalized = false;

            if (user.name && user.birthday) {
              // Personalized daily card - matches DailyCardPreview.tsx line 71
              const personalCard = getTarotCard(
                `daily-${userLocalDateStr}`,
                user.name,
                user.birthday,
              );
              cardName = personalCard.name;
              isPersonalized = true;
            } else {
              // General daily card - matches DailyCardPreview.tsx line 65
              const generalSeed = `cosmic-${userLocalDateStr}-${userDayOfYear}-energy`;
              const generalCard = getTarotCard(generalSeed);
              cardName = generalCard.name;
            }

            // Get full card details
            const card = getTarotCard(cardName);

            // Save to tarot_readings with user's local timestamp
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
                    generatedAt: userLocalDate.toISOString(),
                  },
                ])}::jsonb,
                ${JSON.stringify({ tier: isPersonalized ? 'premium' : 'free' })}::jsonb,
                ${userLocalDateStr}::timestamp
              )
            `;

            results.generated++;
          } catch (error) {
            console.error(
              `Error generating daily tarot for ${user.email}:`,
              error,
            );
            results.errors++;
          }
        }),
      );

      // Small delay between batches
      if (i + batchSize < users.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    const duration = Date.now() - startTime;

    console.log(
      `✅ Daily tarot generation complete in ${(duration / 1000).toFixed(1)}s`,
    );
    console.log(
      `📊 Generated: ${results.generated}, Skipped: ${results.skipped}, Errors: ${results.errors}`,
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary: {
        totalUsers: results.total,
        generated: results.generated,
        skipped: results.skipped,
        errors: results.errors,
        duration: `${(duration / 1000).toFixed(1)}s`,
      },
    });
  } catch (error) {
    console.error('❌ Daily tarot generation failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
