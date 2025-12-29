import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import {
  getPlatformImageFormat,
  getThematicImageUrl,
} from '@/lib/social/educational-images';
import {
  categoryThemes,
  getWeeklyContentPlan,
} from '@/lib/social/weekly-themes';

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
    const fixNaN = Boolean(body?.fixNaN);

    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';

    const baseDate = weekStartParam ? new Date(weekStartParam) : new Date();
    const weekStart = getWeekStart(baseDate);
    if (!weekStartParam && weekOffset) {
      weekStart.setDate(weekStart.getDate() + weekOffset * 7);
    }
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);
    weekEnd.setHours(23, 59, 59, 999);

    const postsResult = fixNaN
      ? await sql`
          SELECT id, platform, post_type, topic, scheduled_date, week_theme, quote_text, quote_author, image_url
          FROM social_posts
          WHERE image_url ILIKE '%Part+NaN%'
             OR image_url ILIKE '%Part%NaN%of%7%'
        `
      : await sql`
          SELECT id, platform, post_type, topic, scheduled_date, week_theme, quote_text, quote_author, image_url
          FROM social_posts
          WHERE scheduled_date >= ${weekStart.toISOString()}
            AND scheduled_date <= ${weekEnd.toISOString()}
        `;

    const weekPlanCache = new Map<string, Map<string, number>>();

    let updated = 0;
    for (const post of postsResult.rows) {
      const platform = post.platform as string;
      const postType = post.post_type as string;
      const topic = post.topic as string | null;
      const scheduledDate = new Date(post.scheduled_date);
      const postWeekStart = getWeekStart(scheduledDate);
      const postWeekKey = postWeekStart.toISOString().split('T')[0];
      const themeName = post.week_theme as string | null;
      const cacheKey = themeName ? `${postWeekKey}|${themeName}` : postWeekKey;
      if (!weekPlanCache.has(cacheKey)) {
        const themeIndex =
          themeName !== null
            ? categoryThemes.findIndex((theme) => theme.name === themeName)
            : -1;
        const weekPlan =
          themeIndex >= 0
            ? getWeeklyContentPlan(postWeekStart, themeIndex)
            : [];
        const partMap = new Map<string, number>();
        for (const [index, day] of weekPlan.entries()) {
          partMap.set(day.facet.title, index + 1);
        }
        weekPlanCache.set(cacheKey, partMap);
      }
      const partNumberByTopic = weekPlanCache.get(cacheKey);
      const dayOfWeek = scheduledDate.getDay();
      const dayOffset =
        Number.isFinite(scheduledDate.getTime()) && dayOfWeek >= 0
          ? dayOfWeek === 0
            ? 6
            : dayOfWeek - 1
          : null;

      let imageUrl: string | null = null;
      if (postType === 'closing_ritual') {
        const format = getPlatformImageFormat(platform);
        const quoteText =
          post.quote_text ||
          'The cosmos is within us, we are made of star-stuff.';
        const author = post.quote_author || 'Carl Sagan';
        const params = new URLSearchParams({ text: quoteText });
        if (author) params.set('author', author);
        params.set('format', format);
        imageUrl = `${baseUrl}/api/og/social-quote?${params.toString()}`;
      } else if (topic) {
        const theme = categoryThemes.find((t) => t.name === post.week_theme);
        const facet = theme?.facets.find((f) => f.title === topic);
        const slug =
          facet?.grimoireSlug.split('/').pop() ||
          topic.toLowerCase().replace(/\s+/g, '-');
        const category = theme?.category || 'lunar';
        const fallbackOffset =
          dayOffset !== null
            ? dayOffset
            : Number.isFinite(scheduledDate.getTime())
              ? Math.max(
                  0,
                  Math.floor(
                    (scheduledDate.getTime() - weekStart.getTime()) /
                      (1000 * 60 * 60 * 24),
                  ),
                )
              : null;
        const resolvedPart =
          partNumberByTopic?.get(topic) ??
          (fallbackOffset !== null ? fallbackOffset + 1 : null);
        const partNumber = Number.isFinite(resolvedPart) ? resolvedPart : null;
        const partLabel =
          postType === 'educational' && partNumber !== null
            ? `Part ${partNumber} of 7`
            : undefined;
        imageUrl = getThematicImageUrl(
          category,
          topic,
          baseUrl,
          platform,
          slug,
          partLabel,
        );
      }

      if (imageUrl) {
        await sql`
          UPDATE social_posts
          SET image_url = ${imageUrl}, updated_at = NOW()
          WHERE id = ${post.id}
        `;
        updated += 1;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      weekStart: weekStart.toISOString(),
    });
  } catch (error) {
    console.error('Failed to refresh images:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
