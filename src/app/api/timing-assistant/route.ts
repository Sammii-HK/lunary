/**
 * POST /api/timing-assistant
 *
 * Forward-looking sibling of `/api/decision-helper`. Body:
 *   { question: string, daysAhead?: number }
 *
 * Categorises the question, scans the next `daysAhead` days (default 30) for
 * the strongest cosmic windows that support the goal, and returns the top
 * three dates with score + dominant aspect + a one-line reason.
 *
 * No LLM, no randomness. Reuses the Decision Helper's category profiles,
 * scoring, and reasoning stitcher via {@link findTopDates}.
 *
 * Auth: better-auth session, mirroring `/api/decision-helper`.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Observer } from 'astronomy-engine';

import { requireUser } from '@/lib/ai/auth';
import { categoriseQuestion } from '@/lib/decision-helper/categorise';
import type { Placement } from '@/lib/decision-helper/score';
import { findTopDates } from '@/lib/timing-assistant/find-windows';
import { getAstrologicalChart } from '../../../../utils/astrology/astrology';
import type { BirthChartData } from '../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_QUESTION_LENGTH = 500;
// Greenwich/noon — matches the convention used by decision-helper + transit-preview.
const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);
const DEFAULT_DAYS_AHEAD = 30;
const MIN_DAYS_AHEAD = 7;
const MAX_DAYS_AHEAD = 60;

function safeQuestion(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, MAX_QUESTION_LENGTH);
}

function safeDaysAhead(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_DAYS_AHEAD;
  }
  const rounded = Math.round(value);
  if (rounded < MIN_DAYS_AHEAD) return MIN_DAYS_AHEAD;
  if (rounded > MAX_DAYS_AHEAD) return MAX_DAYS_AHEAD;
  return rounded;
}

function toPlacements(rawChart: unknown): Placement[] {
  const arr: BirthChartData[] = Array.isArray(rawChart)
    ? (rawChart as BirthChartData[])
    : Array.isArray((rawChart as { planets?: unknown })?.planets)
      ? (rawChart as { planets: BirthChartData[] }).planets
      : [];
  return arr
    .filter((p) => p && typeof p.eclipticLongitude === 'number')
    .map((p) => ({
      body: String(p.body),
      eclipticLongitude: p.eclipticLongitude,
      retrograde: !!p.retrograde,
      sign: typeof p.sign === 'string' ? p.sign : undefined,
    }));
}

export async function POST(request: NextRequest) {
  let user: { id: string };
  try {
    user = await requireUser(request);
  } catch (error) {
    if ((error as Error)?.name === 'UnauthorizedError') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Auth failed' },
      { status: 401 },
    );
  }

  // ---- Parse + validate input -------------------------------------------
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON body' },
      { status: 400 },
    );
  }

  const question = safeQuestion((body as { question?: unknown })?.question);
  if (!question) {
    return NextResponse.json(
      { success: false, error: 'question is required' },
      { status: 400 },
    );
  }

  const daysAhead = safeDaysAhead((body as { daysAhead?: unknown })?.daysAhead);

  // ---- Load natal chart -------------------------------------------------
  let natalChart: Placement[];
  try {
    const profileRes = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${user.id}
      LIMIT 1
    `;
    natalChart = toPlacements(profileRes.rows[0]?.birth_chart ?? null);
  } catch (error) {
    console.error('[timing-assistant] profile load failed', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      { success: false, error: 'Could not load profile' },
      { status: 500 },
    );
  }

  if (natalChart.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'no_birth_chart',
        message: 'Add your birthday to unlock the timing assistant.',
      },
      { status: 400 },
    );
  }

  // ---- Build a per-day sky callback -------------------------------------
  const now = new Date();

  const getSky = (d: number): Placement[] => {
    const future = new Date(now.getTime() + d * 24 * 60 * 60 * 1000);
    return getAstrologicalChart(future, DEFAULT_OBSERVER).map((p) => ({
      body: String(p.body),
      eclipticLongitude: p.eclipticLongitude,
      retrograde: p.retrograde,
      sign: p.sign,
    }));
  };

  // ---- Categorise + scan ------------------------------------------------
  const category = categoriseQuestion(question);

  let dates;
  try {
    dates = findTopDates({
      category,
      natalChart,
      getSky,
      daysAhead,
      now,
    });
  } catch (error) {
    console.error('[timing-assistant] scan failed', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      { success: false, error: 'Could not scan the sky' },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: true,
      category,
      dates,
    },
    {
      headers: {
        // Sky changes daily — short s-maxage so the CDN holds it for ~15 min
        // but we don't pin a stale answer for the whole day.
        'Cache-Control': 'private, s-maxage=900, max-age=0, must-revalidate',
      },
    },
  );
}
