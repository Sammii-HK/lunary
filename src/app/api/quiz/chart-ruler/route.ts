import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';
import { composeChartRulerResult } from '@/lib/quiz/engines/chart-ruler';

const QuizInputSchema = z.object({
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'birthDate must be YYYY-MM-DD'),
  birthTime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/, 'birthTime must be HH:MM')
    .optional(),
  birthLocation: z.string().min(1).max(200).optional(),
  birthTimezone: z.string().max(64).optional(),
});

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = QuizInputSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.issues },
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
    const result = composeChartRulerResult(chart);
    if (!result) {
      return NextResponse.json(
        {
          error:
            'Could not compute chart ruler. Check that birth date and location are valid.',
        },
        { status: 422 },
      );
    }
    return NextResponse.json(result);
  } catch (err) {
    console.error('[quiz/chart-ruler] compute failed');
    if (err instanceof Error) {
      console.error(err.message);
    }
    return NextResponse.json(
      { error: 'Internal error computing chart' },
      { status: 500 },
    );
  }
}
