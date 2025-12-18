import { NextResponse } from 'next/server';
import {
  getVideoScripts,
  ensureVideoScriptsTable,
} from '@/lib/social/video-script-generator';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/video-scripts
 *
 * List video scripts with optional filters.
 * Query params: platform, status, weekStart (ISO date)
 */
export async function GET(request: Request) {
  try {
    await ensureVideoScriptsTable();

    const { searchParams } = new URL(request.url);
    const platform = searchParams.get('platform') || undefined;
    const status = searchParams.get('status') || undefined;
    const weekStartParam = searchParams.get('weekStart');

    const filters: {
      platform?: string;
      status?: string;
      weekStart?: Date;
    } = {};

    if (platform) filters.platform = platform;
    if (status) filters.status = status;
    if (weekStartParam) filters.weekStart = new Date(weekStartParam);

    const scripts = await getVideoScripts(
      Object.keys(filters).length > 0 ? filters : undefined,
    );

    // Group by week for easier display
    const groupedByWeek: Record<
      string,
      {
        weekStart: string;
        theme: string;
        tiktok: typeof scripts;
        youtube: typeof scripts;
      }
    > = {};

    for (const script of scripts) {
      // Get Monday of the script's week
      const scriptDate = new Date(script.scheduledDate);
      const dayOfWeek = scriptDate.getDay();
      const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const monday = new Date(scriptDate);
      monday.setDate(scriptDate.getDate() + daysToMonday);
      const weekKey = monday.toISOString().split('T')[0];

      if (!groupedByWeek[weekKey]) {
        groupedByWeek[weekKey] = {
          weekStart: weekKey,
          theme: script.themeName,
          tiktok: [],
          youtube: [],
        };
      }

      if (script.platform === 'tiktok') {
        groupedByWeek[weekKey].tiktok.push(script);
      } else {
        groupedByWeek[weekKey].youtube.push(script);
      }
    }

    return NextResponse.json({
      success: true,
      scripts,
      byWeek: Object.values(groupedByWeek).sort(
        (a, b) =>
          new Date(b.weekStart).getTime() - new Date(a.weekStart).getTime(),
      ),
    });
  } catch (error) {
    console.error('Error fetching video scripts:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch video scripts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
