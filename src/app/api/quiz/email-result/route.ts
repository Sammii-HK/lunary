import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';
import { composeChartRulerResult } from '@/lib/quiz/engines/chart-ruler';
import { sendQuizResultEmail } from '@/lib/quiz/email';

export const runtime = 'nodejs';

const PayloadSchema = z.object({
  quizSlug: z.literal('chart-ruler'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  birthTime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
  birthLocation: z.string().min(1).max(200).optional(),
  birthTimezone: z.string().max(64).optional(),
});

/**
 * POST /api/quiz/email-result
 *
 * Opt-in email delivery of the user's quiz result. Called from the full
 * quiz page when the user clicks "Email this to me". Recomputes the
 * result server-side from the posted birth data (so we never trust a
 * client-supplied result payload) and sends the email to the authenticated
 * user's address.
 */
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = PayloadSchema.safeParse(rawPayload);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  try {
    const chart = await generateBirthChartWithHouses(
      parsed.data.birthDate,
      parsed.data.birthTime,
      parsed.data.birthLocation,
      parsed.data.birthTimezone,
    );
    const result = composeChartRulerResult(chart, { unlocked: true });
    if (!result) {
      return NextResponse.json(
        { error: 'Could not compose result' },
        { status: 422 },
      );
    }

    const outcome = await sendQuizResultEmail({
      to: session.user.email,
      result,
      userId: session.user.id,
    });

    if (!outcome.success) {
      return NextResponse.json(
        { error: outcome.error ?? 'Email failed to send' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[quiz/email-result] failed');
    if (error instanceof Error) console.error(error.message);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
