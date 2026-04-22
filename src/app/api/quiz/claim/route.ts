import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';
import { composeChartRulerResult } from '@/lib/quiz/engines/chart-ruler';
import { sendQuizResultEmail } from '@/lib/quiz/email';

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
 * email. After this, the user is in the existing nurture sequence — no
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

    const outcome = await sendQuizResultEmail({
      to: session.user.email,
      result,
      userId: session.user.id,
    });

    const response = NextResponse.json({
      success: true,
      sent: outcome.success,
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
