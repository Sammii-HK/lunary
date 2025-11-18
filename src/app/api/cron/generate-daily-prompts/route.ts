import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  getOrGenerateDailyPrompt,
  type AIPrompt,
} from '@/lib/ai/prompt-generator';

/**
 * Cron job: Runs daily to generate personalized prompts for all users
 * Schedule: Every day at 6 AM UTC (or configured time)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron request
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];

    console.log(`🌙 Generating daily prompts for ${dateStr}`);

    // Fetch all active users with birthdays
    const users = await sql`
      SELECT DISTINCT
        s.user_id,
        s.user_email,
        s.user_name,
        ps.preferences->>'birthday' as birthday,
        ps.preferences->>'timezone' as timezone,
        ps.preferences->>'name' as display_name
      FROM subscriptions s
      LEFT JOIN push_subscriptions ps ON ps.user_id = s.user_id
      WHERE (
        s.status IN ('active', 'trial', 'free')
        OR ps.is_active = true
      )
      AND (
        ps.preferences->>'birthday' IS NOT NULL
        AND ps.preferences->>'birthday' != ''
      )
      GROUP BY s.user_id, s.user_email, s.user_name, ps.preferences
    `;

    if (users.rows.length === 0) {
      console.log('📭 No users found for daily prompts');
      return NextResponse.json({
        success: true,
        promptsGenerated: 0,
        message: 'No users found',
      });
    }

    console.log(`📝 Generating prompts for ${users.rows.length} users`);

    const results: Array<{
      userId: string;
      success: boolean;
      promptId?: number;
      error?: string;
    }> = [];

    let successCount = 0;
    let errorCount = 0;

    for (const user of users.rows) {
      try {
        const userId = user.user_id;
        const userName = user.display_name || user.user_name || undefined;
        const userBirthday = user.birthday || undefined;
        const timezone = user.timezone || 'Europe/London';

        if (!userId || !userBirthday) {
          console.log(`⚠️ Skipping user ${userId} - missing data`);
          continue;
        }

        const prompt = await getOrGenerateDailyPrompt(
          userId,
          userName,
          userBirthday,
          timezone,
          now,
        );

        if (prompt) {
          successCount++;
          results.push({
            userId,
            success: true,
            promptId: prompt.id,
          });
        } else {
          errorCount++;
          results.push({
            userId,
            success: false,
            error: 'Failed to generate prompt',
          });
        }
      } catch (error) {
        errorCount++;
        console.error(`❌ Error generating prompt for user ${user.user_id}:`, error);
        results.push({
          userId: user.user_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(
      `✅ Daily prompts: ${successCount} generated, ${errorCount} failed`,
    );

    return NextResponse.json({
      success: true,
      date: dateStr,
      promptsGenerated: successCount,
      errors: errorCount,
      totalUsers: users.rows.length,
      results,
    });
  } catch (error) {
    console.error('❌ Daily prompts cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
