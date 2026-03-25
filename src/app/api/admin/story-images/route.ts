import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/story-images?startDate=2026-03-26&days=7
 *
 * Returns pre-rendered Blob URLs for story images, with OG fallbacks.
 * Used by the weekly-stories admin page.
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const startDateParam = url.searchParams.get('startDate');
  const daysParam = url.searchParams.get('days');
  const days = daysParam ? Math.min(parseInt(daysParam, 10), 14) : 7;

  const SHARE_BASE_URL = (
    process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app'
  ).replace(/\/$/, '');

  const startDate = (() => {
    if (startDateParam && /^\d{4}-\d{2}-\d{2}$/.test(startDateParam)) {
      return new Date(`${startDateParam}T00:00:00Z`);
    }
    // Default: this week's Monday
    const d = new Date();
    const dayOfWeek = d.getUTCDay();
    const daysToMonday =
      dayOfWeek === 0 ? 1 : dayOfWeek === 1 ? 0 : 8 - dayOfWeek;
    d.setUTCDate(
      d.getUTCDate() +
        daysToMonday -
        (dayOfWeek <= 1 ? 0 : 7) +
        (dayOfWeek === 0 ? 0 : 0),
    );
    // Simpler: just use today
    return new Date();
  })();

  const { generateDailyStoryData } =
    await import('@/lib/instagram/story-content');

  // Get all pre-rendered images for the date range
  const dates: string[] = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setUTCDate(d.getUTCDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }

  // Fetch pre-rendered images for each date individually (safe parameterised queries)
  const preRenderedRows: Array<{
    date_str: string;
    slot_index: number;
    variant: string;
    blob_url: string;
    rendered_at: string;
  }> = [];
  for (const d of dates) {
    const result = await sql`
      SELECT date_str, slot_index, variant, blob_url, rendered_at
      FROM pre_rendered_stories
      WHERE date_str = ${d}
      ORDER BY slot_index
    `;
    preRenderedRows.push(...(result.rows as typeof preRenderedRows));
  }

  // Build lookup: dateStr → slotIndex → blobUrl
  const blobLookup = new Map<string, Map<number, string>>();
  for (const row of preRenderedRows) {
    if (!blobLookup.has(row.date_str)) {
      blobLookup.set(row.date_str, new Map());
    }
    blobLookup.get(row.date_str)!.set(row.slot_index, row.blob_url);
  }

  // Generate story data for each day and merge with pre-rendered URLs
  const result: Record<
    string,
    Array<{
      variant: string;
      title: string;
      subtitle: string;
      blobUrl: string | null;
      ogUrl: string;
      preRendered: boolean;
    }>
  > = {};

  for (const dateStr of dates) {
    const storyItems = await generateDailyStoryData(dateStr, {
      fillQuotes: true,
    });
    const dayBlobs = blobLookup.get(dateStr);

    result[dateStr] = storyItems.map((story, i) => {
      const imageParams = new URLSearchParams(story.params);
      const rawUrl = `${SHARE_BASE_URL}${story.endpoint}?${imageParams.toString()}`;
      const ogUrl = rawUrl.includes('/api/og/')
        ? rawUrl
            .replace(/^(https?:\/\/[^/]+)\/\//, '$1/')
            .replace(/(\?.*)$/, '.png$1')
        : rawUrl;

      const blobUrl = dayBlobs?.get(i) || null;

      return {
        variant: story.variant,
        title: story.title,
        subtitle: story.subtitle,
        blobUrl,
        ogUrl,
        preRendered: !!blobUrl,
      };
    });
  }

  return NextResponse.json({
    startDate: dates[0],
    days,
    dates: result,
  });
}
