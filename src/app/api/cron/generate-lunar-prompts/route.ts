import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  detectLunarEvent,
  generateLunarEventPrompt,
} from '@/lib/ai/lunar-events';
import { savePrompt } from '@/lib/ai/prompt-generator';
import dayjs from 'dayjs';

/**
 * Cron job: Runs every 4-6 hours to check for significant lunar events
 * and generate prompts when New Moon, Full Moon, or eclipses occur
 * Schedule: Every 4 hours
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

    console.log(`🌙 Checking for lunar events on ${dateStr}`);

    // Check for lunar event today
    const lunarEvent = await detectLunarEvent(now);

    if (!lunarEvent) {
      console.log('📭 No significant lunar event detected today');
      return NextResponse.json({
        success: true,
        promptsGenerated: 0,
        message: 'No lunar event detected',
      });
    }

    console.log(
      `🌟 Lunar event detected: ${lunarEvent.type} - ${lunarEvent.description}`,
    );

    // Check if we've already generated prompts for this event
    const eventKey = `lunar-${lunarEvent.type}-${dateStr}`;
    const existing = await sql`
      SELECT id FROM ai_prompts
      WHERE cosmic_context->>'eventKey' = ${eventKey}
      LIMIT 1
    `;

    if (existing.rows.length > 0) {
      console.log('📭 Prompts already generated for this lunar event');
      return NextResponse.json({
        success: true,
        promptsGenerated: 0,
        message: 'Already generated',
        event: lunarEvent.type,
      });
    }

    // Fetch all active users with birthdays
    const users = await sql`
      SELECT DISTINCT
        s.user_id,
        s.email,
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
      GROUP BY s.user_id, s.email, s.user_name, ps.preferences
    `;

    if (users.rows.length === 0) {
      console.log('📭 No users found for lunar event prompts');
      return NextResponse.json({
        success: true,
        promptsGenerated: 0,
        message: 'No users found',
      });
    }

    console.log(
      `📝 Generating lunar event prompts for ${users.rows.length} users`,
    );

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

        if (!userId) {
          console.log(`⚠️ Skipping user ${userId} - missing data`);
          continue;
        }

        // Generate prompt for this lunar event
        const promptText = generateLunarEventPrompt(lunarEvent, userName);

        // Save prompt with lunar event context
        const cosmicContext = {
          eventType: lunarEvent.type,
          eventKey,
          moonPhase: lunarEvent.moonPhase,
          moonSign: lunarEvent.moonSign,
          description: lunarEvent.description,
          date: dateStr,
        };

        // Expires at end of day
        const promptId = await savePrompt(
          userId,
          'daily', // Lunar events are treated as daily prompts
          promptText,
          cosmicContext,
          now,
        );

        if (promptId) {
          successCount++;
          results.push({
            userId,
            success: true,
            promptId,
          });
        } else {
          errorCount++;
          results.push({
            userId,
            success: false,
            error: 'Failed to save prompt',
          });
        }
      } catch (error) {
        errorCount++;
        console.error(
          `❌ Error generating lunar prompt for user ${user.user_id}:`,
          error,
        );
        results.push({
          userId: user.user_id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    console.log(
      `✅ Lunar event prompts: ${successCount} generated, ${errorCount} failed`,
    );

    return NextResponse.json({
      success: true,
      date: dateStr,
      event: lunarEvent.type,
      eventDescription: lunarEvent.description,
      promptsGenerated: successCount,
      errors: errorCount,
      totalUsers: users.rows.length,
      results,
    });
  } catch (error) {
    console.error('❌ Lunar event prompts cron failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
