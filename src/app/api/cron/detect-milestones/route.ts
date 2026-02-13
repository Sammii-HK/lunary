import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { detectMilestones } from '@/utils/milestones/detection';

export async function GET() {
  try {
    const now = new Date();

    // Get cosmic context for today
    let currentMoonSign: string | undefined;
    try {
      const cosmicData = await sql`
        SELECT moon_phase, planetary_positions FROM global_cosmic_data
        WHERE data_date = ${now.toISOString().split('T')[0]}
        LIMIT 1
      `;
      if (cosmicData.rows[0]) {
        const positions = cosmicData.rows[0].planetary_positions;
        currentMoonSign = positions?.Moon?.sign;
      }
    } catch {
      // Continue without moon sign
    }

    // Process users in batches
    const batchSize = 100;
    let offset = 0;
    let totalProcessed = 0;
    let totalNewMilestones = 0;

    while (true) {
      const users = await sql`
        SELECT
          up.user_id,
          up.birthday,
          up.birth_chart,
          up.signup_at,
          COALESCE((SELECT COUNT(*) FROM tarot_readings WHERE user_id = up.user_id), 0)::int as reading_count,
          COALESCE((SELECT COUNT(*) FROM collections WHERE user_id = up.user_id AND category IN ('journal', 'ritual')), 0)::int as journal_count,
          COALESCE(us.longest_streak, 0) as longest_streak,
          COALESCE(us.current_streak, 0) as current_streak
        FROM user_profiles up
        LEFT JOIN user_streaks us ON us.user_id = up.user_id
        ORDER BY up.user_id
        LIMIT ${batchSize}
        OFFSET ${offset}
      `;

      if (users.rows.length === 0) break;

      for (const user of users.rows) {
        const detected = detectMilestones(
          {
            userId: user.user_id,
            birthday: user.birthday,
            birthChart: user.birth_chart,
            signupAt: user.signup_at,
            tarotReadingCount: user.reading_count,
            journalCount: user.journal_count,
            longestStreak: user.longest_streak,
            currentStreak: user.current_streak,
          },
          { currentMoonSign, currentDate: now },
        );

        for (const milestone of detected) {
          try {
            const result = await sql`
              INSERT INTO milestones_achieved (user_id, milestone_type, milestone_key, milestone_data, achieved_at)
              VALUES (
                ${user.user_id},
                ${milestone.definition.type},
                ${milestone.definition.key},
                ${JSON.stringify({ ...milestone.data, title: milestone.definition.title, description: milestone.definition.description })}::jsonb,
                ${milestone.achievedAt.toISOString()}
              )
              ON CONFLICT (user_id, milestone_key) DO NOTHING
              RETURNING id
            `;

            if (result.rows.length > 0) {
              totalNewMilestones++;

              // Send push notification for new milestone
              try {
                const { sendToUser } =
                  await import('@/lib/notifications/native-push-sender');
                await sendToUser(user.user_id, {
                  title: `Milestone: ${milestone.definition.title}`,
                  body: milestone.definition.description,
                  data: { deeplink: '/profile', action: 'milestone' },
                });
              } catch {
                // Non-critical
              }
            }
          } catch (insertError) {
            console.warn(
              `[Milestones] Error inserting milestone for ${user.user_id}:`,
              insertError,
            );
          }
        }

        totalProcessed++;
      }

      offset += batchSize;
    }

    return NextResponse.json({
      success: true,
      processed: totalProcessed,
      newMilestones: totalNewMilestones,
    });
  } catch (error) {
    console.error('[Milestones Cron] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
