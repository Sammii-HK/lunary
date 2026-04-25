/**
 * POST /api/decision-helper
 *
 * Cosmic Decision Helper. Body:
 *   { question: string }
 *
 * Categorises the question, scores it deterministically against the user's
 * natal chart and the current sky, and returns a verdict (yes / wait / no)
 * with a short reasoning paragraph and an optional better day.
 *
 * No LLM. No randomness. The reasoning is template-stitched from the
 * existing `transit-content/templates.ts` helpers plus a small library of
 * decision-specific copy in `score.ts`.
 *
 * Auth: better-auth session, mirroring `live-transits/next-hit`.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { Observer } from 'astronomy-engine';

import { requireUser } from '@/lib/ai/auth';
import { categoriseQuestion } from '@/lib/decision-helper/categorise';
import {
  scoreDecision,
  type DecisionResult,
  type Placement,
} from '@/lib/decision-helper/score';
import { getAstrologicalChart } from '../../../../utils/astrology/astrology';
import type { BirthChartData } from '../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const MAX_QUESTION_LENGTH = 500;
// Greenwich/noon — matches the convention used by `transit-preview`.
const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

function safeQuestion(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  return trimmed.slice(0, MAX_QUESTION_LENGTH);
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
    console.error('[decision-helper] profile load failed', {
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
        message: 'Add your birthday to unlock the decision helper.',
      },
      { status: 400 },
    );
  }

  // ---- Build today's sky + a forward-scan callback ----------------------
  const now = new Date();
  let currentSky: Placement[];
  try {
    currentSky = getAstrologicalChart(now, DEFAULT_OBSERVER).map((p) => ({
      body: String(p.body),
      eclipticLongitude: p.eclipticLongitude,
      retrograde: p.retrograde,
      sign: p.sign,
    }));
  } catch (error) {
    console.error('[decision-helper] sky calc failed', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      { success: false, error: 'Could not compute sky' },
      { status: 500 },
    );
  }

  const forwardScan = (daysAhead: number): Placement[] => {
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return getAstrologicalChart(future, DEFAULT_OBSERVER).map((p) => ({
      body: String(p.body),
      eclipticLongitude: p.eclipticLongitude,
      retrograde: p.retrograde,
      sign: p.sign,
    }));
  };

  // ---- Categorise + score -----------------------------------------------
  const category = categoriseQuestion(question);
  const result: DecisionResult = scoreDecision({
    category,
    natalChart,
    currentSky,
    forwardScan,
    now,
  });

  return NextResponse.json(
    {
      success: true,
      category,
      ...result,
    },
    {
      headers: {
        // Sky changes daily — short s-maxage so the CDN holds it for a few
        // hours but we don't pin a stale answer for the whole day.
        'Cache-Control': 'private, s-maxage=900, max-age=0, must-revalidate',
      },
    },
  );
}
