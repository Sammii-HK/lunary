import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Required because route uses searchParams
export const revalidate = 300; // Cache insights for 5 minutes - they update periodically

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;
const MAX_OFFSET = 500;
const MIN_INSIGHT_LENGTH = 10;
const MAX_INSIGHT_LENGTH = 1000;
const MAX_INSIGHTS_PER_USER = 3;

type SortOrder = 'newest' | 'oldest';

interface PostInsightPayload {
  insight_text?: string;
  is_anonymous?: boolean;
}

const toISODate = (value: string | Date | null | undefined): string | null => {
  if (!value) return null;
  const date =
    value instanceof Date
      ? value
      : new Date(typeof value === 'string' ? value : '');
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const sanitizeInsightText = (input: string): string => {
  return input
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const parseInteger = (
  value: string | null,
  fallback: number,
  max: number,
): number => {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 0) {
    return fallback;
  }
  return Math.min(parsed, max);
};

const normalizeSort = (value: string | null): SortOrder => {
  return value === 'oldest' ? 'oldest' : 'newest';
};

export async function GET(request: NextRequest, context: any) {
  try {
    const moonCircleId = Number.parseInt(context?.params?.id, 10);

    if (!Number.isFinite(moonCircleId) || moonCircleId <= 0) {
      return NextResponse.json(
        { error: 'Invalid moon circle id' },
        { status: 400 },
      );
    }

    const { searchParams } = request.nextUrl;
    const limit = Math.max(
      1,
      parseInteger(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT),
    );
    const offset = parseInteger(searchParams.get('offset'), 0, MAX_OFFSET);
    const sort = normalizeSort(searchParams.get('sort'));

    const moonCircleResult = await sql`
      SELECT
        id,
        moon_phase,
        event_date,
        insight_count
      FROM moon_circles
      WHERE id = ${moonCircleId}
      LIMIT 1
    `;

    if (moonCircleResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Moon Circle not found' },
        { status: 404 },
      );
    }

    const totalResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM moon_circle_insights
      WHERE moon_circle_id = ${moonCircleId}
        AND is_approved = true
    `;

    const total = totalResult.rows[0]?.count ?? 0;

    const insightsResult =
      sort === 'oldest'
        ? await sql`
            SELECT id, insight_text, created_at, source
            FROM moon_circle_insights
            WHERE moon_circle_id = ${moonCircleId}
              AND is_approved = true
            ORDER BY created_at ASC
            LIMIT ${limit}
            OFFSET ${offset}
          `
        : await sql`
            SELECT id, insight_text, created_at, source
            FROM moon_circle_insights
            WHERE moon_circle_id = ${moonCircleId}
              AND is_approved = true
            ORDER BY created_at DESC
            LIMIT ${limit}
            OFFSET ${offset}
          `;

    const moonCircleRow = moonCircleResult.rows[0];

    return NextResponse.json(
      {
        insights: insightsResult.rows.map((row) => ({
          id: row.id,
          insight_text: row.insight_text,
          created_at: toISODate(row.created_at),
          source: row.source ?? 'app',
        })),
        total,
        moon_circle: {
          id: moonCircleRow.id,
          moon_phase: moonCircleRow.moon_phase,
          date: toISODate(moonCircleRow.event_date),
          insight_count: Number(moonCircleRow.insight_count ?? total),
        },
      },
      {
        headers: {
          'Cache-Control':
            'public, s-maxage=300, stale-while-revalidate=150, max-age=300',
          'CDN-Cache-Control': 'public, s-maxage=300',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=300',
        },
      },
    );
  } catch (error) {
    console.error('[moon-circles/:id/insights] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load Moon Circle insights' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, context: any) {
  try {
    const moonCircleId = Number.parseInt(context?.params?.id, 10);

    if (!Number.isFinite(moonCircleId) || moonCircleId <= 0) {
      return NextResponse.json(
        { error: 'Invalid moon circle id' },
        { status: 400 },
      );
    }

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required to share an insight' },
        { status: 401 },
      );
    }

    const moonCircleExists = await sql`
      SELECT id FROM moon_circles WHERE id = ${moonCircleId} LIMIT 1
    `;

    if (moonCircleExists.rows.length === 0) {
      return NextResponse.json(
        { error: 'Moon Circle not found' },
        { status: 404 },
      );
    }

    let payload: PostInsightPayload;
    try {
      payload = (await request.json()) as PostInsightPayload;
    } catch {
      return NextResponse.json(
        { error: 'Invalid request payload' },
        { status: 400 },
      );
    }

    const insightText = sanitizeInsightText(payload.insight_text ?? '');
    if (!insightText || insightText.length < MIN_INSIGHT_LENGTH) {
      return NextResponse.json(
        {
          error: `Insight must be at least ${MIN_INSIGHT_LENGTH} characters once cleaned`,
        },
        { status: 400 },
      );
    }

    if (insightText.length > MAX_INSIGHT_LENGTH) {
      return NextResponse.json(
        {
          error: `Insight cannot exceed ${MAX_INSIGHT_LENGTH} characters`,
        },
        { status: 400 },
      );
    }

    const rateResult = await sql`
      SELECT COUNT(*)::int AS count
      FROM moon_circle_insights
      WHERE moon_circle_id = ${moonCircleId}
        AND user_id = ${session.user.id}
    `;

    if ((rateResult.rows[0]?.count ?? 0) >= MAX_INSIGHTS_PER_USER) {
      return NextResponse.json(
        { error: 'You have reached the sharing limit for this Moon Circle' },
        { status: 429 },
      );
    }

    const isAnonymous =
      typeof payload.is_anonymous === 'boolean' ? payload.is_anonymous : true;

    const insertResult = await sql`
      INSERT INTO moon_circle_insights (
        moon_circle_id,
        user_id,
        insight_text,
        is_anonymous,
        source
      )
      VALUES (
        ${moonCircleId},
        ${session.user.id},
        ${insightText},
        ${isAnonymous},
        'app'
      )
      RETURNING id, insight_text, created_at, source
    `;

    const insight = insertResult.rows[0];

    return NextResponse.json(
      {
        success: true,
        insight: {
          id: insight.id,
          insight_text: insight.insight_text,
          created_at: toISODate(insight.created_at),
          source: insight.source ?? 'app',
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[moon-circles/:id/insights] POST failed', error);
    return NextResponse.json(
      { error: 'Failed to share insight' },
      { status: 500 },
    );
  }
}
