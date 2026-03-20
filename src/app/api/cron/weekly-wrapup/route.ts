import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { sendDiscordNotification } from '@/lib/discord';
import {
  generateAndSaveWeeklyScripts,
  getVideoScripts,
} from '@/lib/social/video-script-generator';
import { categoryThemes } from '@/lib/social/weekly-themes';

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

async function resolveThemeIndex(referenceDate: Date): Promise<number> {
  try {
    const result = await sql`
      SELECT item_id
      FROM content_rotation
      WHERE rotation_type = 'theme'
      ORDER BY last_used_at DESC NULLS LAST
      LIMIT 1
    `;
    const lastThemeId = result.rows[0]?.item_id as string | undefined;
    if (lastThemeId) {
      const matchedIndex = categoryThemes.findIndex(
        (theme) => theme.id === lastThemeId,
      );
      if (matchedIndex >= 0) return matchedIndex;
    }
  } catch {
    // Fall through to week-based index
  }
  const startOfYear = new Date(referenceDate.getFullYear(), 0, 1);
  const weekNumber = Math.floor(
    (referenceDate.getTime() - startOfYear.getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  );
  return weekNumber % categoryThemes.length;
}

/**
 * GET /api/cron/weekly-wrapup
 *
 * Sunday cron — generates 2 long-form thematic deep-dive video scripts
 * for the upcoming week via generateAndSaveWeeklyScripts.
 *
 * Creates video_scripts + video_jobs entries.
 * Rendering happens on the server via process-video-jobs.
 *
 * Manual trigger: GET /api/cron/weekly-wrapup?week=0 (this week)
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

    const weekParam = request.nextUrl.searchParams.get('week');
    const weekOffset = weekParam !== null ? parseInt(weekParam, 10) : 1;
    const weekStart = getWeekStart(weekOffset);
    const dateKey = weekStart.toISOString().split('T')[0];

    const results: Record<string, unknown> = {};

    // Check if YouTube scripts already exist for this week
    const existingScripts = await getVideoScripts({
      platform: 'youtube',
      weekStart,
    });
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const existingForWeek = existingScripts.filter(
      (s) =>
        new Date(s.scheduledDate).getTime() >= weekStart.getTime() &&
        new Date(s.scheduledDate).getTime() < weekEnd.getTime(),
    );

    if (existingForWeek.length >= 2) {
      results.skipped = true;
      results.reason = `${existingForWeek.length} YouTube scripts already exist for this week`;
      console.log(`[Weekly Wrapup] ${results.reason}, skipping`);
    } else {
      // Generate 2 theme videos by calling generateAndSaveWeeklyScripts twice
      // with consecutive theme indices
      const baseThemeIndex = await resolveThemeIndex(weekStart);

      for (let i = 0; i < 2; i++) {
        const label = i === 0 ? 'primary' : 'secondary';
        const themeIndex = (baseThemeIndex + i) % categoryThemes.length;
        const theme = categoryThemes[themeIndex];

        try {
          const scripts = await generateAndSaveWeeklyScripts(
            weekStart,
            themeIndex,
          );

          // The YouTube script is the one we care about for long-form
          const ytScript = scripts.youtubeScript;
          if (ytScript?.id) {
            // Create video job for YouTube script
            await sql`
              INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
              VALUES (${ytScript.id}, ${dateKey}, ${dateKey}, ${ytScript.facetTitle}, 'pending', NOW(), NOW())
              ON CONFLICT (script_id)
              DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
            `;

            // Create YouTube social post
            await sql`
              INSERT INTO social_posts (
                content, platform, post_type, topic, status,
                video_url, scheduled_date, week_theme,
                source_type, source_id, source_title, created_at
              )
              SELECT ${ytScript.writtenPostContent || ytScript.fullScript.substring(0, 500)},
                     'youtube', 'video',
                     ${ytScript.facetTitle}, 'pending',
                     ${null},
                     ${weekStart.toISOString()}, ${theme.name},
                     'video_script', ${String(ytScript.id)}, ${ytScript.facetTitle}, NOW()
              WHERE NOT EXISTS (
                SELECT 1 FROM social_posts
                WHERE platform = 'youtube' AND post_type = 'video'
                  AND topic = ${ytScript.facetTitle}
                  AND scheduled_date::date = ${dateKey}
              )
            `;

            results[label] = {
              scriptId: ytScript.id,
              theme: theme.name,
              title: ytScript.facetTitle,
            };
            console.log(
              `[Weekly Wrapup] ${label} theme video script created: ${theme.name}`,
            );
          }

          // Also create video jobs for TikTok scripts from this generation
          for (const tiktokScript of scripts.tiktokScripts) {
            if (tiktokScript.id) {
              await sql`
                INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
                VALUES (${tiktokScript.id}, ${dateKey}, ${tiktokScript.scheduledDate.toISOString().split('T')[0]}, ${tiktokScript.facetTitle}, 'pending', NOW(), NOW())
                ON CONFLICT (script_id)
                DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
              `;
            }
          }
        } catch (err) {
          results[`${label}Error`] =
            err instanceof Error ? err.message : 'Unknown error';
          console.error(`[Weekly Wrapup] ${label} failed:`, err);
        }
      }
    }

    const duration = Date.now() - startTime;
    const hasErrors = results.primaryError || results.secondaryError;

    try {
      await sendDiscordNotification({
        title: 'Weekly Wrapup Scripts Queued',
        description: [
          `**Week starting: ${dateKey}**`,
          `Primary: ${results.primary ? '✓' : '✗'} ${results.primaryError || ''}`,
          `Secondary: ${results.secondary ? '✓' : '✗'} ${results.secondaryError || ''}`,
          results.skipped ? `Skipped: ${results.reason}` : '',
          `Duration: ${Math.round(duration / 1000)}s`,
          '',
          'Render via process-video-jobs on server.',
        ]
          .filter(Boolean)
          .join('\n'),
        color: hasErrors ? 'warning' : 'success',
        category: 'general',
      });
    } catch {
      console.warn('[Weekly Wrapup] Discord notification failed');
    }

    return NextResponse.json({
      success: !hasErrors,
      weekOffset,
      weekStart: dateKey,
      results,
      duration: `${duration}ms`,
    });
  } catch (error) {
    console.error('[Weekly Wrapup] Fatal error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate weekly wrapup scripts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
