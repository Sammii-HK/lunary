import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { getImageBaseUrl } from '@/lib/urls';
import {
  buildSucculentPostPayload,
  type DbPostRow,
} from '@/lib/succulent/payload';

export const runtime = 'nodejs';

type PayloadGroup = {
  key: string;
  postIds: number[];
  payload: Record<string, unknown>;
};

function toTextArrayLiteral(values: string[]): string | null {
  if (values.length === 0) return null;
  return `{${values
    .map(
      (value) =>
        `"${String(value).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`,
    )
    .join(',')}}`;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const statusParam = url.searchParams.get('status');

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid date (YYYY-MM-DD).' },
        { status: 400 },
      );
    }

    const allowedStatuses = new Set([
      'pending',
      'approved',
      'sent',
      'rejected',
    ]);
    const statuses = statusParam
      ? statusParam
          .split(',')
          .map((value) => value.trim())
          .filter((value) => allowedStatuses.has(value))
      : ['pending', 'approved'];
    const statusArrayLiteral = toTextArrayLiteral(statuses);

    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;
    if (!accountGroupId) {
      return NextResponse.json(
        { success: false, error: 'SUCCULENT_ACCOUNT_GROUP_ID not set' },
        { status: 500 },
      );
    }

    const result = await sql`
      SELECT id, content, platform, post_type, topic, scheduled_date, image_url, video_url, week_theme, week_start, status, base_group_key, base_post_id
      FROM social_posts
      WHERE scheduled_date::date = ${date}
        AND status = ANY(SELECT unnest(${statusArrayLiteral}::text[]))
      ORDER BY scheduled_date ASC, id ASC
    `;

    const rows = result.rows as DbPostRow[];
    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        date,
        payloads: [],
        message: 'No posts found for that date.',
      });
    }

    const baseUrl = getImageBaseUrl();
    const grouped = new Map<string, DbPostRow[]>();

    for (const row of rows) {
      const groupKey =
        row.base_group_key ||
        [
          row.scheduled_date?.split('T')[0] || date,
          row.post_type,
          row.topic || 'none',
          row.week_theme || 'none',
        ].join('|');

      const group = grouped.get(groupKey);
      if (group) {
        group.push(row);
      } else {
        grouped.set(groupKey, [row]);
      }
    }

    const payloads: PayloadGroup[] = [];
    for (const [key, posts] of grouped) {
      const scheduleSource = posts.find((post) => post.scheduled_date);
      const scheduledDate = scheduleSource?.scheduled_date
        ? new Date(scheduleSource.scheduled_date)
        : new Date(`${date}T12:00:00.000Z`);

      const { postData } = buildSucculentPostPayload({
        posts,
        scheduleDate: scheduledDate,
        baseUrl,
        accountGroupId: String(accountGroupId),
      });

      payloads.push({
        key,
        postIds: posts.map((post) => post.id),
        payload: postData,
      });
    }

    return NextResponse.json({
      success: true,
      date,
      payloads,
    });
  } catch (error) {
    console.error('Failed to build Succulent payload:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
