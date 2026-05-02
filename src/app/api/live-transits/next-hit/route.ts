/**
 * GET /api/live-transits/next-hit
 *
 * Returns the next aspect-to-natal hit that lands hardest on the
 * authenticated user's chart inside a forward window (default 30d).
 *
 * Auth follows the journal route's pattern (`requireUser` from better-auth
 * adapter). Natal chart is loaded from `user_profiles.birth_chart`.
 *
 * Response shape:
 *   { success: true, hit: NextHitWithBlurb | null, isPaid: boolean }
 *   { success: false, error: string }
 *
 * The blurb is pulled from `lib/transit-content/templates.ts` so we never
 * reimplement copy here. Free users get the headline blurb; paid users get
 * the same headline (the extended/AI version is rendered client-side via
 * `<AudioNarrator>` + the existing personalise pipeline).
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { requireUser } from '@/lib/ai/auth';
import { findNextHit, type NextHit } from '@/lib/live-transits/find-next';
import {
  getTemplateBlurb,
  type AspectType,
  type BodyName,
  type TransitEvent,
} from '@/lib/transit-content/templates';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';
import { normalizePlanType } from '../../../../../utils/pricing';

export const dynamic = 'force-dynamic';

const TEMPLATE_BODIES = new Set<BodyName>([
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
]);

const TEMPLATE_ASPECTS = new Set<AspectType>([
  'Conjunction',
  'Opposition',
  'Trine',
  'Square',
  'Sextile',
]);

function isTemplateBody(body: string): body is BodyName {
  return TEMPLATE_BODIES.has(body as BodyName);
}

function isTemplateAspect(aspect: string): aspect is AspectType {
  return TEMPLATE_ASPECTS.has(aspect as AspectType);
}

function blurbForHit(hit: NextHit): string | null {
  if (!isTemplateBody(hit.transitPlanet) || !isTemplateBody(hit.natalPlanet)) {
    return null;
  }
  if (!isTemplateAspect(hit.aspect)) return null;
  const event: TransitEvent = {
    kind: 'aspect_to_natal',
    transitPlanet: hit.transitPlanet,
    aspect: hit.aspect,
    natalPlanet: hit.natalPlanet,
  };
  return getTemplateBlurb(event);
}

function isPaidPlan(status: string | undefined, plan: string | undefined) {
  const normalizedStatus = status === 'trialing' ? 'trial' : status;
  const normalizedPlan = normalizePlanType(plan);
  if (normalizedStatus === 'active' || normalizedStatus === 'trial')
    return true;
  return normalizedPlan !== 'free';
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    // Read natal chart + subscription in parallel.
    const [profileRes, subRes] = await Promise.all([
      sql`
        SELECT birth_chart
        FROM user_profiles
        WHERE user_id = ${user.id}
        LIMIT 1
      `,
      sql`
        SELECT status, plan_type
        FROM subscriptions
        WHERE user_id = ${user.id}
        ORDER BY created_at DESC
        LIMIT 1
      `,
    ]);

    const rawChart = profileRes.rows[0]?.birth_chart ?? null;
    const isPaid = isPaidPlan(
      subRes.rows[0]?.status,
      subRes.rows[0]?.plan_type,
    );

    if (!rawChart) {
      return NextResponse.json({
        success: true,
        hit: null,
        reason: 'no_birth_chart',
        isPaid,
      });
    }

    const natal: BirthChartData[] = Array.isArray(rawChart)
      ? rawChart
      : Array.isArray(rawChart?.planets)
        ? rawChart.planets
        : [];

    if (natal.length === 0) {
      return NextResponse.json({
        success: true,
        hit: null,
        reason: 'empty_birth_chart',
        isPaid,
      });
    }

    const { searchParams } = new URL(request.url);
    const withinDaysParam = parseInt(
      searchParams.get('withinDays') || '30',
      10,
    );
    const withinDays =
      Number.isFinite(withinDaysParam) && withinDaysParam > 0
        ? Math.min(withinDaysParam, 90)
        : 30;

    const hit = findNextHit({ natalChart: natal, withinDays });

    if (!hit) {
      return NextResponse.json({
        success: true,
        hit: null,
        reason: 'quiet_sky',
        isPaid,
      });
    }

    const blurb = blurbForHit(hit);

    return NextResponse.json({
      success: true,
      isPaid,
      hit: {
        ...hit,
        exactDate: hit.exactDate.toISOString(),
        blurb,
      },
    });
  } catch (error) {
    if ((error as Error)?.name === 'UnauthorizedError') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    // Avoid logging raw user-controlled values per CLAUDE.md guidance.
    console.error('[live-transits/next-hit] error', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      { success: false, error: 'Failed to compute next transit hit' },
      { status: 500 },
    );
  }
}
