import { NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getUpcomingTransits } from '../../../../../utils/astrology/transitCalendar';
import { generateDailyTalkingPoints } from '@/lib/social/video-scripts/seer-sammii/generation';
import { retrieveGrimoireContext } from '@/lib/ai/astral-guide';
import { getVideoScripts } from '@/lib/social/video-scripts/database';

/**
 * GET — Returns today's creator brief (computed on request, no DB table)
 */
export async function GET(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const now = new Date();
    const today = dayjs(now);

    // 1. Active transits for today + next 3 days
    const allTransits = getUpcomingTransits(today);
    const activeTransits = allTransits
      .filter((t) => t.date.isBefore(today.add(3, 'day')))
      .map((t) => ({
        date: t.date.format('YYYY-MM-DD'),
        planet: t.planet,
        event: t.event,
        description: t.description,
        significance: t.significance,
        type: t.type,
      }));

    // 2. Generate talking point options
    let scriptOptions: Array<{
      topic: string;
      points: string[];
      transitContext: string;
    }> = [];
    try {
      scriptOptions = await generateDailyTalkingPoints(now);
    } catch (error) {
      console.error(
        '[Creator Brief] Failed to generate talking points:',
        error,
      );
    }

    // 3. Hot topics from grimoire (based on today's most significant transit)
    let hotTopics: Array<{ title: string; category: string; snippet: string }> =
      [];
    const significantTransit = activeTransits.find(
      (t) => t.significance === 'high',
    );
    if (significantTransit) {
      try {
        const { sources } = await retrieveGrimoireContext(
          `${significantTransit.planet} ${significantTransit.event}`,
          5,
        );
        hotTopics = sources.map((s) => ({
          title: s.title,
          category: s.category,
          snippet: s.content.substring(0, 200),
        }));
      } catch (error) {
        console.error('[Creator Brief] Failed to get hot topics:', error);
      }
    }

    // 4. Existing pending scripts for today
    let pendingScripts: Array<{
      id: number;
      topic: string;
      status: string;
      platform: string;
    }> = [];
    try {
      const scripts = await getVideoScripts({ status: 'draft' });
      pendingScripts = scripts
        .filter((s) => {
          const sDate = dayjs(s.scheduledDate);
          return sDate.isSame(today, 'day') || sDate.isAfter(today);
        })
        .slice(0, 10)
        .map((s) => ({
          id: s.id ?? 0,
          topic: s.facetTitle || s.themeName,
          status: s.status,
          platform: s.platform,
        }));
    } catch {
      // Table may not exist yet
    }

    return NextResponse.json({
      success: true,
      date: today.format('YYYY-MM-DD'),
      brief: {
        cosmicWeather: {
          transits: activeTransits,
          summary:
            activeTransits.length > 0
              ? `${activeTransits.length} active transit${activeTransits.length > 1 ? 's' : ''} in the next 3 days`
              : 'Quiet cosmic weather today',
        },
        scriptOptions,
        hotTopics,
        pendingScripts,
      },
    });
  } catch (error) {
    console.error('[Creator Brief] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate creator brief' },
      { status: 500 },
    );
  }
}
