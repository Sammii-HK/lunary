import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';
import { composeChartRulerResult } from '@/lib/quiz/engines/chart-ruler';
import type { BirthChartData } from '@utils/astrology/birthChart';

function extractRisingSign(
  planets: BirthChartData[] | undefined,
): string | undefined {
  if (!planets) return undefined;
  const asc = planets.find((p) => p.body === 'Ascendant');
  return asc?.sign;
}

function extractSunSign(
  planets: BirthChartData[] | undefined,
): string | undefined {
  if (!planets) return undefined;
  const sun = planets.find((p) => p.body === 'Sun');
  return sun?.sign;
}

async function recordQuizClaim(params: {
  userId: string;
  userEmail: string;
  quizSlug: string;
  archetype: string | null;
  archetypeTagline: string | null;
  risingSign: string | undefined;
  sunSign: string | undefined;
}) {
  // Record in the existing conversion_events table so the welcome-drip cron
  // can find it when routing Day 2 / Day 5 emails. Dedup on user_id + quiz
  // so repeat claims don't stack.
  try {
    await sql.query(
      `INSERT INTO conversion_events (
        event_type, user_id, user_email, metadata, created_at
      )
      SELECT $1, $2, $3, $4::jsonb, NOW()
      WHERE NOT EXISTS (
        SELECT 1 FROM conversion_events
        WHERE event_type = $1
          AND user_id = $2
          AND metadata->>'quizSlug' = $5
      )`,
      [
        'quiz_claim',
        params.userId,
        params.userEmail,
        JSON.stringify({
          quizSlug: params.quizSlug,
          archetype: params.archetype,
          archetypeTagline: params.archetypeTagline,
          risingSign: params.risingSign ?? null,
          sunSign: params.sunSign ?? null,
        }),
        params.quizSlug,
      ],
    );
  } catch (err) {
    // Non-fatal — the claim can succeed even if the event isn't recorded.
    // The user will just fall back to the generic welcome drip.
    console.error('[quiz/claim] Failed to record quiz_claim event');
    if (err instanceof Error) console.error(err.message);
  }
}

export const runtime = 'nodejs';

const ClaimPayloadSchema = z.object({
  quizSlug: z.string().min(1).max(64),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
  birthLocation: z.string().min(1).max(200).optional(),
  birthTimezone: z.string().max(64).optional(),
});

/**
 * POST /api/quiz/claim
 *
 * Called from the client after signup + email verification. Reads the
 * `lunary_pending_quiz` cookie (set on the quiz result page), recomputes
 * the user's quiz result server-side, and fires the quiz-specific delivery
 * email. After this, the user is in the existing nurture sequence, no
 * new drip from here.
 *
 * Requires an authenticated session. Fails cleanly if the cookie is
 * missing, malformed, or if the birth data fails validation.
 */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const cookie = request.cookies.get('lunary_pending_quiz');
  if (!cookie?.value) {
    return NextResponse.json(
      { error: 'No pending quiz claim' },
      { status: 404 },
    );
  }

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(decodeURIComponent(cookie.value));
  } catch {
    return NextResponse.json(
      { error: 'Invalid quiz payload' },
      { status: 400 },
    );
  }

  const parsed = ClaimPayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid quiz payload shape' },
      { status: 400 },
    );
  }

  if (parsed.data.quizSlug !== 'chart-ruler') {
    return NextResponse.json(
      { error: 'Unsupported quiz slug' },
      { status: 400 },
    );
  }

  try {
    const chart = await generateBirthChartWithHouses(
      parsed.data.birthDate,
      parsed.data.birthTime,
      parsed.data.birthLocation,
      parsed.data.birthTimezone,
    );
    // Compose the FULL (unlocked) result for the authenticated welcome page.
    // The same engine, with options.unlocked, emits strengths, challenges,
    // career, and famous-examples sections instead of the locked teaser.
    const result = composeChartRulerResult(chart, { unlocked: true });
    if (!result) {
      return NextResponse.json(
        { error: 'Could not compose quiz result' },
        { status: 422 },
      );
    }

    // Email is NOT sent here, we show the result on-screen instead, and
    // let the user opt in via the "Email this to me" button (POSTs to
    // /api/quiz/email-result). Forcing users to their inbox to see their
    // own result is poor UX.

    // Record the claim event so the welcome-drip cron can route this user
    // to the quiz-personalised Day 2 / Day 5 emails (via drip registry)
    // instead of the generic welcome drip.
    await recordQuizClaim({
      userId: session.user.id,
      userEmail: session.user.email,
      quizSlug: parsed.data.quizSlug,
      archetype: result.archetype?.label ?? null,
      archetypeTagline: result.archetype?.tagline ?? null,
      risingSign: extractRisingSign(chart.planets),
      sunSign: extractSunSign(chart.planets),
    });

    const response = NextResponse.json({
      success: true,
      archetype: result.archetype?.label ?? null,
      result,
    });
    response.cookies.set('lunary_pending_quiz', '', {
      path: '/',
      maxAge: 0,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[quiz/claim] failed:', message);
    return NextResponse.json(
      { error: 'Internal error processing claim' },
      { status: 500 },
    );
  }
}
