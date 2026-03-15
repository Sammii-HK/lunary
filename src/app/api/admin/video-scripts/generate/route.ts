import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireAdminAuth } from '@/lib/admin-auth';
import {
  generateAndSaveWeeklyScripts,
  type WeeklyVideoScripts,
} from '@/lib/social/video-script-generator';
import { sendDiscordAdminNotification } from '@/lib/discord';
import { categoryThemes } from '@/lib/social/weekly-themes';
import type { VideoScript } from '@/lib/social/video-scripts/types';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/video-scripts/generate
 *
 * Generate video scripts for a week (4 slots/day = 28 TikTok + 1 YouTube).
 * Body: { week?: 'current' | 'next', themeIndex?: number }
 */
export async function POST(request: Request) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const body = await request.json().catch(() => ({}));
    const { week = 'current', themeIndex } = body;

    // Calculate week start date (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const weekStartDate = new Date(now);
    weekStartDate.setDate(now.getDate() + daysToMonday);
    weekStartDate.setHours(0, 0, 0, 0);

    if (week === 'next') {
      weekStartDate.setDate(weekStartDate.getDate() + 7);
    }

    // Determine theme index
    let currentThemeIndex = themeIndex;
    if (currentThemeIndex === undefined) {
      // Prefer the most recent weekly theme used by the cron to keep scripts aligned
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
          if (matchedIndex >= 0) {
            currentThemeIndex = matchedIndex;
          }
        }
      } catch (error) {
        console.warn('Failed to read latest theme rotation:', error);
      }

      if (currentThemeIndex === undefined) {
        // Fallback: auto-rotate based on week number
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.floor(
          (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000),
        );
        currentThemeIndex = weekNumber % categoryThemes.length;
      }
    }

    // Generate primary + engagement scripts in parallel
    const {
      generateWeeklySecondaryScripts,
      generateWeeklyEngagementBScripts,
      generateWeeklyEngagementCScripts,
    } = await import('@/lib/social/video-scripts/generators/weekly-secondary');
    const { saveVideoScript } =
      await import('@/lib/social/video-scripts/database');

    const [
      primaryScripts,
      engagementAScripts,
      engagementBScripts,
      engagementCScripts,
    ] = await Promise.all([
      generateAndSaveWeeklyScripts(weekStartDate, currentThemeIndex),
      generateWeeklySecondaryScripts(weekStartDate),
      generateWeeklyEngagementBScripts(weekStartDate),
      generateWeeklyEngagementCScripts(weekStartDate),
    ]);

    // Save engagement scripts to DB
    const allEngagementScripts = [
      ...engagementAScripts,
      ...engagementBScripts,
      ...engagementCScripts,
    ];
    for (const script of allEngagementScripts) {
      try {
        const id = await saveVideoScript(script);
        script.id = id;
      } catch (saveError) {
        console.error(
          `Failed to save engagement script: ${script.facetTitle}`,
          saveError,
        );
      }
    }

    const allTiktokScripts = [
      ...primaryScripts.tiktokScripts,
      ...allEngagementScripts,
    ];

    // Send Discord notification
    await sendScriptsToDiscord(
      primaryScripts,
      engagementAScripts,
      engagementBScripts,
      engagementCScripts,
      weekStartDate,
    );

    return NextResponse.json({
      success: true,
      message: `Generated ${allTiktokScripts.length} daily shorts and 1 YouTube script`,
      theme: primaryScripts.theme.name,
      weekStartDate: weekStartDate.toISOString(),
      scripts: {
        tiktok: allTiktokScripts.map((s) => ({
          facetTitle: s.facetTitle,
          wordCount: s.wordCount,
          estimatedDuration: s.estimatedDuration,
          scheduledDate: s.scheduledDate.toISOString(),
          slot: s.metadata?.slot ?? 'primary',
        })),
        youtube: {
          facetTitle: primaryScripts.youtubeScript.facetTitle,
          wordCount: primaryScripts.youtubeScript.wordCount,
          estimatedDuration: primaryScripts.youtubeScript.estimatedDuration,
          scheduledDate:
            primaryScripts.youtubeScript.scheduledDate.toISOString(),
        },
      },
    });
  } catch (error) {
    console.error('Error generating video scripts:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate video scripts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * Send generated scripts to Discord with all 4 slots per day
 */
async function sendScriptsToDiscord(
  primaryScripts: WeeklyVideoScripts,
  engagementA: VideoScript[],
  engagementB: VideoScript[],
  engagementC: VideoScript[],
  weekStartDate: Date,
): Promise<void> {
  const weekLabel = weekStartDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const formatSlotSummary = (
    scripts: VideoScript[],
    slotName: string,
    hour: number,
  ) => {
    if (scripts.length === 0) return '';
    const lines = scripts
      .map((s) => {
        const day = s.scheduledDate.toLocaleDateString('en-US', {
          weekday: 'short',
        });
        return `  ${day}: ${s.facetTitle} (${s.estimatedDuration})`;
      })
      .join('\n');
    return `**${slotName} (${hour}:00 UTC)**:\n${lines}`;
  };

  const primarySummary = formatSlotSummary(
    primaryScripts.tiktokScripts,
    'Primary',
    14,
  );
  const engCSummary = formatSlotSummary(engagementC, 'Engagement C', 11);
  const engASummary = formatSlotSummary(engagementA, 'Engagement A', 17);
  const engBSummary = formatSlotSummary(engagementB, 'Engagement B', 21);

  const youtubeSummary = `**YouTube Script (3-4min)**:\n  Sun: ${primaryScripts.youtubeScript.facetTitle} (${primaryScripts.youtubeScript.estimatedDuration})`;

  const totalScripts =
    primaryScripts.tiktokScripts.length +
    engagementA.length +
    engagementB.length +
    engagementC.length;

  const message = `**Weekly Theme**: ${primaryScripts.theme.name}
**Total**: ${totalScripts} TikTok scripts (4/day) + 1 YouTube

${engCSummary}

${primarySummary}

${engASummary}

${engBSummary}

${youtubeSummary}

View full scripts in the admin dashboard.`;

  await sendDiscordAdminNotification({
    title: `Video Scripts Generated - Week of ${weekLabel}`,
    message,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://lunary.app'}/admin/video-scripts`,
    priority: 'normal',
    category: 'todo',
    dedupeKey: `video-scripts-${weekStartDate.toISOString().split('T')[0]}`,
  });
}
