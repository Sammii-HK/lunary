// DEPRECATED: Video pipeline moved to Hetzner (content-creator/hetzner-pipeline/).
// This route is no longer called by Vercel crons. Kept for admin/debug use only.

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendDiscordNotification } from '@/lib/discord';
import { generateWeeklyContent } from '../../../../../utils/blog/weeklyContentGenerator';
import {
  generateNarrativeFromWeeklyData,
  generateMediumFormNarrative,
  generateVideoPostContent,
} from '@/lib/video/narrative-generator';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 300;

function getWeekStart(weekOffset: number): Date {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const monday = new Date(now);
  monday.setDate(now.getDate() - daysToMonday + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

/**
 * GET /api/cron/cosmic-forecast
 *
 * Monday cron — generates medium-form + long-form cosmic forecast scripts
 * for the upcoming week (7 days ahead by default).
 *
 * Creates video_scripts + video_jobs entries. Render-schedule-v3 on Hetzner
 * handles rendering and scheduling to Spellcast.
 * Rendering happens on the server via process-video-jobs.
 *
 * Manual trigger: GET /api/cron/cosmic-forecast?week=0 (this week)
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      if (
        !(
          request.headers.get('x-vercel-cron') === '1' &&
          process.env.VERCEL === '1'
        )
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // week=0 means this week, week=1 means next week (default for cron = 1 week ahead)
    const weekParam = request.nextUrl.searchParams.get('week');
    const week = weekParam !== null ? parseInt(weekParam, 10) : 1;

    const weekStart = getWeekStart(week);
    const dateKey = weekStart.toISOString().split('T')[0];
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    const weekRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;

    const results: Record<string, unknown> = {};

    // Generate weekly cosmic data
    const weeklyData = await generateWeeklyContent(weekStart);
    console.log(`[Cosmic Forecast] Weekly data generated for ${weekRange}`);

    // --- Medium-form cosmic forecast (TikTok/Reels/Shorts) ---
    try {
      // Check if already exists
      const existing = await sql`
        SELECT id FROM video_scripts
        WHERE facet_title = ${'Cosmic Forecast: ' + dateKey}
          AND platform = 'tiktok'
          AND scheduled_date = ${dateKey}
      `;
      if (existing.rows.length > 0) {
        results.medium = { skipped: true, reason: 'already exists' };
        console.log('[Cosmic Forecast] Medium-form already exists, skipping');
      } else {
        const script = await generateMediumFormNarrative(weeklyData);
        const wordCount = script.split(/\s+/).length;
        const postContent = await generateVideoPostContent(
          weeklyData,
          'medium',
        );

        const scriptResult = await sql`
          INSERT INTO video_scripts (
            theme_id, theme_name, facet_title, topic, platform,
            sections, full_script, word_count, estimated_duration,
            scheduled_date, status, metadata, written_post_content,
            created_at
          ) VALUES (
            'cosmic-forecast', 'Cosmic Forecast',
            ${'Cosmic Forecast: ' + dateKey},
            ${'Cosmic Forecast ' + weekRange},
            'tiktok',
            ${JSON.stringify([{ name: 'Full', content: script, duration: `${Math.round(wordCount / 2.5)}s` }])},
            ${script}, ${wordCount},
            ${Math.round(wordCount / 2.5) + ' seconds'},
            ${dateKey}, 'draft',
            ${JSON.stringify({ slot: 'cosmic-forecast', type: 'medium', weekRange, contentTypeKey: 'cosmic_forecast' })},
            ${postContent},
            NOW()
          )
          RETURNING id
        `;
        const scriptId = scriptResult.rows[0].id;

        // Social posts are handled by content-creator pipeline + render-schedule-v3.
        // This cron only creates video_scripts + video_jobs.

        // Create video job
        await sql`
          INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
          VALUES (${scriptId}, ${dateKey}, ${dateKey}, ${'Cosmic Forecast: ' + dateKey}, 'pending', NOW(), NOW())
          ON CONFLICT (script_id)
          DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
        `;

        results.medium = { scriptId, wordCount };
        console.log(
          `[Cosmic Forecast] Medium-form script created: ${scriptId}`,
        );
      }
    } catch (err) {
      results.mediumError =
        err instanceof Error ? err.message : 'Unknown error';
      console.error('[Cosmic Forecast] Medium-form failed:', err);
    }

    // --- Long-form cosmic forecast (YouTube) ---
    try {
      const existing = await sql`
        SELECT id FROM video_scripts
        WHERE facet_title = ${'Cosmic Forecast Long: ' + dateKey}
          AND platform = 'youtube'
          AND scheduled_date = ${dateKey}
      `;
      if (existing.rows.length > 0) {
        results.long = { skipped: true, reason: 'already exists' };
        console.log('[Cosmic Forecast] Long-form already exists, skipping');
      } else {
        const script = await generateNarrativeFromWeeklyData(weeklyData);
        const wordCount = script.split(/\s+/).length;
        const postContent = await generateVideoPostContent(weeklyData, 'long');

        const scriptResult = await sql`
          INSERT INTO video_scripts (
            theme_id, theme_name, facet_title, topic, platform,
            sections, full_script, word_count, estimated_duration,
            scheduled_date, status, metadata, written_post_content,
            created_at
          ) VALUES (
            'cosmic-forecast-long', 'Cosmic Forecast',
            ${'Cosmic Forecast Long: ' + dateKey},
            ${'Weekly Cosmic Forecast ' + weekRange},
            'youtube',
            ${JSON.stringify([{ name: 'Full', content: script, duration: `${Math.round(wordCount / 2.5)}s` }])},
            ${script}, ${wordCount},
            ${Math.round(wordCount / 2.5) + ' seconds'},
            ${dateKey}, 'draft',
            ${JSON.stringify({ slot: 'cosmic-forecast', type: 'long', weekRange, contentTypeKey: 'cosmic_forecast' })},
            ${postContent},
            NOW()
          )
          RETURNING id
        `;
        const scriptId = scriptResult.rows[0].id;

        // Social posts are handled by render-schedule-v3 after rendering.

        // Create video job
        await sql`
          INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
          VALUES (${scriptId}, ${dateKey}, ${dateKey}, ${'Cosmic Forecast Long: ' + dateKey}, 'pending', NOW(), NOW())
          ON CONFLICT (script_id)
          DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
        `;

        results.long = { scriptId, wordCount };
        console.log(`[Cosmic Forecast] Long-form script created: ${scriptId}`);
      }
    } catch (err) {
      results.longError = err instanceof Error ? err.message : 'Unknown error';
      console.error('[Cosmic Forecast] Long-form failed:', err);
    }

    const duration = Date.now() - startTime;
    const hasErrors = results.mediumError || results.longError;

    try {
      await sendDiscordNotification({
        title: 'Cosmic Forecast Scripts Queued',
        description: [
          `**Week: ${weekRange}**`,
          `Medium: ${results.medium ? '✓' : '✗'} ${results.mediumError || ''}`,
          `Long: ${results.long ? '✓' : '✗'} ${results.longError || ''}`,
          `Duration: ${Math.round(duration / 1000)}s`,
          '',
          'Render via process-video-jobs on server.',
        ].join('\n'),
        color: hasErrors ? 'warning' : 'success',
        category: 'general',
      });
    } catch {
      console.warn('[Cosmic Forecast] Discord notification failed');
    }

    return NextResponse.json({
      success: !hasErrors,
      week,
      weekRange,
      results,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('[Cosmic Forecast] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate cosmic forecast scripts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
