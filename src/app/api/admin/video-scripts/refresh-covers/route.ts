import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getThematicImageUrl } from '@/lib/social/educational-images';
import { categoryThemes } from '@/lib/social/weekly-themes';

export const runtime = 'nodejs';

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const weekStartParam = body?.weekStart as string | undefined;
    const weekOffset = Number(body?.weekOffset ?? 0);

    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';

    const baseDate = weekStartParam ? new Date(weekStartParam) : new Date();
    const weekStart = getWeekStart(baseDate);
    if (!weekStartParam && weekOffset) {
      weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const scriptsResult = await sql`
      SELECT id, theme_name, facet_title, scheduled_date, part_number
      FROM video_scripts
      WHERE platform = 'tiktok'
        AND scheduled_date >= ${weekStart.toISOString()}
        AND scheduled_date < ${weekEnd.toISOString()}
      ORDER BY scheduled_date ASC
    `;

    const scripts = scriptsResult.rows;
    if (scripts.length === 0) {
      return NextResponse.json({
        success: true,
        updated: 0,
        message: 'No video scripts found for that week.',
      });
    }

    const themeByName = new Map(
      categoryThemes.map((theme) => [theme.name, theme]),
    );
    const facetTitlesByTheme = new Map<string, Set<string>>();
    for (const script of scripts) {
      const themeName = script.theme_name as string | undefined;
      if (!themeName) continue;
      if (!facetTitlesByTheme.has(themeName)) {
        facetTitlesByTheme.set(themeName, new Set());
      }
      facetTitlesByTheme.get(themeName)?.add(script.facet_title);
    }

    let updated = 0;
    for (const [index, script] of scripts.entries()) {
      const themeName = script.theme_name as string | undefined;
      const theme = themeName ? themeByName.get(themeName) : undefined;
      const facetIndex =
        theme?.facets.findIndex((f) => f.title === script.facet_title) ?? -1;
      const scheduledDate = new Date(script.scheduled_date);
      const dayOfWeek = scheduledDate.getDay();
      const dayOffset =
        Number.isFinite(scheduledDate.getTime()) && dayOfWeek >= 0
          ? dayOfWeek === 0
            ? 6
            : dayOfWeek - 1
          : null;
      const partNumber = Number.isFinite(script.part_number)
        ? script.part_number
        : facetIndex >= 0
          ? facetIndex + 1
          : dayOffset !== null
            ? dayOffset + 1
            : index + 1;
      const totalParts = theme
        ? theme.facets.length
        : Math.max(facetTitlesByTheme.get(themeName || '')?.size || 0, 7);
      const slug =
        theme?.facets
          .find((f) => f.title === script.facet_title)
          ?.grimoireSlug.split('/')
          .pop() || script.facet_title.toLowerCase().replace(/\s+/g, '-');
      const category = theme?.category || 'lunar';
      const partLabel = `Part ${partNumber} of ${totalParts}`;

      const coverImageUrl = getThematicImageUrl(
        category,
        script.facet_title,
        baseUrl,
        'tiktok',
        slug,
        partLabel,
        'tiktok',
      );

      await sql`
        UPDATE video_scripts
        SET part_number = ${partNumber},
            cover_image_url = ${coverImageUrl},
            updated_at = NOW()
        WHERE id = ${script.id}
      `;
      updated += 1;
    }

    return NextResponse.json({
      success: true,
      updated,
      weekStart: weekStart.toISOString(),
    });
  } catch (error) {
    console.error('Failed to refresh video covers:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
