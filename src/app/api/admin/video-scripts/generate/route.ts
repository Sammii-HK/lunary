import { NextResponse } from 'next/server';
import {
  generateAndSaveWeeklyScripts,
  type WeeklyVideoScripts,
} from '@/lib/social/video-script-generator';
import { sendDiscordAdminNotification } from '@/lib/discord';
import { categoryThemes } from '@/lib/social/weekly-themes';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/video-scripts/generate
 *
 * Generate video scripts for a week.
 * Body: { week?: 'current' | 'next', themeIndex?: number }
 */
export async function POST(request: Request) {
  try {
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
      // Auto-rotate based on week number
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.floor(
        (now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000),
      );
      currentThemeIndex = weekNumber % categoryThemes.length;
    }

    // Generate and save scripts
    const scripts = await generateAndSaveWeeklyScripts(
      weekStartDate,
      currentThemeIndex,
    );

    // Send Discord notification
    await sendScriptsToDiscord(scripts, weekStartDate);

    return NextResponse.json({
      success: true,
      message: `Generated ${scripts.tiktokScripts.length} TikTok scripts and 1 YouTube script`,
      theme: scripts.theme.name,
      weekStartDate: weekStartDate.toISOString(),
      scripts: {
        tiktok: scripts.tiktokScripts.map((s) => ({
          facetTitle: s.facetTitle,
          wordCount: s.wordCount,
          estimatedDuration: s.estimatedDuration,
          scheduledDate: s.scheduledDate.toISOString(),
        })),
        youtube: {
          facetTitle: scripts.youtubeScript.facetTitle,
          wordCount: scripts.youtubeScript.wordCount,
          estimatedDuration: scripts.youtubeScript.estimatedDuration,
          scheduledDate: scripts.youtubeScript.scheduledDate.toISOString(),
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
 * Send generated scripts to Discord
 */
async function sendScriptsToDiscord(
  scripts: WeeklyVideoScripts,
  weekStartDate: Date,
): Promise<void> {
  const weekLabel = weekStartDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Format TikTok scripts summary
  const tiktokSummary = scripts.tiktokScripts
    .map((s, i) => {
      const day = ['Mon', 'Wed', 'Fri'][i];
      return `**${day}**: ${s.facetTitle} (${s.estimatedDuration})`;
    })
    .join('\n');

  // Format YouTube summary
  const youtubeSummary = `**Sun**: ${scripts.youtubeScript.facetTitle} (${scripts.youtubeScript.estimatedDuration})`;

  const message = `**Weekly Theme**: ${scripts.theme.name}

**TikTok Scripts (60-90s)**:
${tiktokSummary}

**YouTube Script (5-7min)**:
${youtubeSummary}

View full scripts in the admin dashboard.`;

  await sendDiscordAdminNotification({
    title: `📹 Video Scripts Generated - Week of ${weekLabel}`,
    message,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://lunary.app'}/admin/video-scripts`,
    priority: 'normal',
    category: 'todo',
    dedupeKey: `video-scripts-${weekStartDate.toISOString().split('T')[0]}`,
  });
}
