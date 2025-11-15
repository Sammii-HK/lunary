import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

type MoonPhaseFilter = 'New Moon' | 'Full Moon';

const toISODate = (value: string | Date | null | undefined): string | null => {
  if (!value) return null;
  const date =
    value instanceof Date
      ? value
      : new Date(typeof value === 'string' ? value : '');
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
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

const normalizeMoonPhase = (value: string | null): MoonPhaseFilter | null => {
  if (!value) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'new' || normalized === 'new moon') return 'New Moon';
  if (normalized === 'full' || normalized === 'full moon') return 'Full Moon';
  return null;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const limit = Math.max(
      1,
      parseInteger(searchParams.get('limit'), DEFAULT_LIMIT, MAX_LIMIT),
    );
    const moonPhase = normalizeMoonPhase(searchParams.get('moon_phase'));

    const rows = moonPhase
      ? await sql`
          SELECT
            insights.id,
            insights.insight_text,
            insights.created_at,
            insights.source,
            circles.id AS moon_circle_id,
            circles.moon_phase,
            circles.event_date
          FROM moon_circle_insights insights
          INNER JOIN moon_circles circles
            ON circles.id = insights.moon_circle_id
          WHERE insights.is_approved = true
            AND circles.moon_phase = ${moonPhase}
          ORDER BY insights.created_at DESC
          LIMIT ${limit}
        `
      : await sql`
          SELECT
            insights.id,
            insights.insight_text,
            insights.created_at,
            insights.source,
            circles.id AS moon_circle_id,
            circles.moon_phase,
            circles.event_date
          FROM moon_circle_insights insights
          INNER JOIN moon_circles circles
            ON circles.id = insights.moon_circle_id
          WHERE insights.is_approved = true
          ORDER BY insights.created_at DESC
          LIMIT ${limit}
        `;

    return NextResponse.json({
      insights: rows.rows.map((row) => ({
        id: row.id,
        insight_text: row.insight_text,
        created_at: toISODate(row.created_at),
        source: row.source ?? 'app',
        moon_circle: {
          id: row.moon_circle_id,
          moon_phase: row.moon_phase,
          date: toISODate(row.event_date),
        },
      })),
    });
  } catch (error) {
    console.error('[moon-circles/insights/recent] GET failed', error);
    return NextResponse.json(
      { error: 'Failed to load recent Moon Circle insights' },
      { status: 500 },
    );
  }
}
