/**
 * GET /api/daily-recap
 *
 * Returns the day's narratable script for the signed-in user. Free users get
 * the deterministic, template-driven version (zero per-user cost). Plus users
 * are routed through the same path today, with a `// TODO: AI personalise
 * hook` left below for the eventual server-cached AI rewrite.
 *
 * Response: { script: string, audience: 'free' | 'plus' }
 */
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  calculateRealAspects,
  getAccurateMoonPhase,
  getRealPlanetaryPositions,
} from '../../../../utils/astrology/astronomical-data';
import { stitchDailyRecap } from '@/lib/daily-recap/stitch';
import type {
  AspectType,
  BodyName,
  ZodiacSign,
} from '@/lib/transit-content/templates';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// Local allow-lists — keep this route's narrowing self-contained so we never
// pass a free-form string into the templates layer.
// ---------------------------------------------------------------------------

const ZODIAC_SIGNS: ReadonlySet<ZodiacSign> = new Set([
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
]);

const BODIES: ReadonlySet<BodyName> = new Set([
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

const ASPECT_NAME_TO_KEY: Record<string, AspectType> = {
  conjunction: 'Conjunction',
  opposition: 'Opposition',
  trine: 'Trine',
  square: 'Square',
  sextile: 'Sextile',
};

function asZodiac(value: unknown): ZodiacSign | null {
  return typeof value === 'string' && ZODIAC_SIGNS.has(value as ZodiacSign)
    ? (value as ZodiacSign)
    : null;
}

function asBody(value: unknown): BodyName | null {
  return typeof value === 'string' && BODIES.has(value as BodyName)
    ? (value as BodyName)
    : null;
}

function asAspect(value: unknown): AspectType | null {
  if (typeof value !== 'string') return null;
  return ASPECT_NAME_TO_KEY[value.toLowerCase()] ?? null;
}

// ---------------------------------------------------------------------------
// Audience detection.
//
// We default everyone to 'free' for now — the API surface is finalised, but
// wiring the Plus check belongs in a follow-up so we don't accidentally bill
// users for a feature that hasn't shipped to them yet. The caller's session
// id is still required so we have a signal for cache personalisation later.
// ---------------------------------------------------------------------------

type Audience = 'free' | 'plus';

function resolveAudience(_userId: string): Audience {
  // TODO: read subscription tier from `subscriptions` table and return 'plus'
  // when status is 'active' or 'trialing'. Keeping this deterministic until
  // the AI personalise hook in `stitchDailyRecap` is wired up.
  return 'free';
}

export async function GET(request: NextRequest) {
  // ---- Auth -------------------------------------------------------------
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const audience = resolveAudience(session.user.id);

  // ---- Today's astro snapshot ------------------------------------------
  const today = new Date();

  let sunSign: ZodiacSign | null = null;
  let moonName = 'New Moon';
  let moonIllumination: number | undefined;
  let moonSign: ZodiacSign | undefined;
  let topAspect:
    | { transitPlanet: BodyName; aspect: AspectType; natalPlanet: BodyName }
    | undefined;

  try {
    const positions = getRealPlanetaryPositions(today);
    sunSign = asZodiac(positions.Sun?.sign);
    moonSign = asZodiac(positions.Moon?.sign) ?? undefined;

    const moonPhase = getAccurateMoonPhase(today);
    moonName = moonPhase.name;
    moonIllumination = moonPhase.illumination;

    const aspects = calculateRealAspects(positions);
    if (Array.isArray(aspects) && aspects.length > 0) {
      // Walk the priority-sorted list until we find one whose planets and
      // aspect type all live in our allow-lists.
      for (const a of aspects) {
        const transitPlanet = asBody(a?.planetA);
        const natalPlanet = asBody(a?.planetB);
        const aspectKey = asAspect(a?.aspect);
        if (transitPlanet && natalPlanet && aspectKey) {
          topAspect = {
            transitPlanet,
            aspect: aspectKey,
            natalPlanet,
          };
          break;
        }
      }
    }
  } catch (err) {
    // Astro calc errors should not 500 the recap — we can still produce a
    // shorter, sun-less script if we have to. Log only validated context.
    // eslint-disable-next-line no-console
    console.error('[api/daily-recap] astro snapshot failed');
    void err;
  }

  // We need at least a Sun sign to build the Sun section meaningfully.
  // Default to Aries (the start of the zodiac) if the calc bailed.
  const safeSunSign: ZodiacSign = sunSign ?? 'Aries';

  // ---- Stitch the script -----------------------------------------------
  const script = stitchDailyRecap({
    date: today,
    moonPhase: {
      name: moonName,
      illumination: moonIllumination,
      sign: moonSign,
    },
    sunSign: safeSunSign,
    topAspect,
    audience,
  });

  // TODO: AI personalise hook — when audience === 'plus', call the cached AI
  // generator (server-side, keyed by date + user chart hash) and substitute
  // the script before returning. The cache layer in
  // `src/lib/transit-content/cache.ts` already handles cost amortisation per
  // transit event; the user-level overlay will live in a follow-up.

  return NextResponse.json({ script, audience });
}
