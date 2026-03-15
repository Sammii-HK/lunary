import { NextRequest, NextResponse } from 'next/server';
import {
  generateAndSaveWeeklyScripts,
  generateWeeklySecondaryScripts,
  generateWeeklyEngagementBScripts,
  generateWeeklyEngagementCScripts,
} from '@/lib/social/video-scripts';
import { sendDiscordNotification } from '@/lib/discord';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

/**
 * GET /api/cron/generate-weekly-videos
 *
 * Sunday 07:15 UTC cron that generates all video scripts for the upcoming week.
 *
 * Generates:
 * - 7 primary slot scripts (weighted category rotation)
 * - 7 engagement A scripts (secondary)
 * - 7 engagement B scripts
 * - 7 engagement C scripts
 * = 28 total scripts
 *
 * Scripts are saved as drafts — does NOT approve or publish.
 * Sends a Discord notification with the schedule summary.
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate next Monday as the week start
    const now = new Date();
    const dayOfWeek = now.getUTCDay(); // 0=Sun
    const daysUntilMonday = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() + daysUntilMonday);
    weekStart.setUTCHours(0, 0, 0, 0);

    const results = {
      primary: 0,
      engagementA: 0,
      engagementB: 0,
      engagementC: 0,
    };
    const errors: string[] = [];

    // Generate primary slot scripts
    try {
      const primary = await generateAndSaveWeeklyScripts(weekStart);
      results.primary = primary.tiktokScripts.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Primary: ${msg}`);
      console.error('[Weekly Videos] Primary generation failed:', err);
    }

    // Generate engagement slot scripts
    try {
      const engA = await generateWeeklySecondaryScripts(weekStart);
      results.engagementA = engA.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Engagement A: ${msg}`);
      console.error('[Weekly Videos] Engagement A generation failed:', err);
    }

    try {
      const engB = await generateWeeklyEngagementBScripts(weekStart);
      results.engagementB = engB.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Engagement B: ${msg}`);
      console.error('[Weekly Videos] Engagement B generation failed:', err);
    }

    try {
      const engC = await generateWeeklyEngagementCScripts(weekStart);
      results.engagementC = engC.length;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      errors.push(`Engagement C: ${msg}`);
      console.error('[Weekly Videos] Engagement C generation failed:', err);
    }

    const total =
      results.primary +
      results.engagementA +
      results.engagementB +
      results.engagementC;

    const duration = Date.now() - startTime;
    const weekLabel = weekStart.toISOString().split('T')[0];

    // Send Discord notification
    try {
      await sendDiscordNotification({
        title: `Weekly Video Scripts Generated`,
        description: [
          `**Week of ${weekLabel}**`,
          `Primary: ${results.primary} scripts`,
          `Engagement A: ${results.engagementA} scripts`,
          `Engagement B: ${results.engagementB} scripts`,
          `Engagement C: ${results.engagementC} scripts`,
          `**Total: ${total}/28 scripts**`,
          errors.length > 0 ? `\nErrors:\n${errors.join('\n')}` : '',
          `Duration: ${Math.round(duration / 1000)}s`,
        ]
          .filter(Boolean)
          .join('\n'),
        color: errors.length > 0 ? 'warning' : 'success',
        category: 'general',
      });
    } catch {
      console.warn('[Weekly Videos] Discord notification failed');
    }

    return NextResponse.json({
      success: true,
      weekStart: weekLabel,
      ...results,
      total,
      errors: errors.length > 0 ? errors : undefined,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('[Weekly Videos] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate weekly videos',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
