import { NextRequest, NextResponse } from 'next/server';
import { generateBirthChart } from '../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';

const PREVIEW_BODIES = new Set(['Sun', 'Moon', 'Mercury', 'Venus', 'Mars']);

export async function GET(request: NextRequest) {
  const birthDate = request.nextUrl.searchParams.get('date');

  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return NextResponse.json(
      { error: 'date param required (YYYY-MM-DD)' },
      { status: 400 },
    );
  }

  // Basic range check
  const year = Number(birthDate.split('-')[0]);
  if (year < 1900 || year > 2030) {
    return NextResponse.json(
      { error: 'Date must be between 1900 and 2030' },
      { status: 400 },
    );
  }

  try {
    // No location, no timezone, no auth — defaults to Greenwich/noon UTC
    // Pure CPU math via astronomy-engine, ~20-50ms
    const fullChart = await generateBirthChart(birthDate);

    const preview = fullChart
      .filter((p) => PREVIEW_BODIES.has(p.body))
      .map((p) => ({
        body: p.body,
        sign: p.sign,
        degree: p.degree,
      }));

    return NextResponse.json(
      { placements: preview },
      {
        headers: {
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      },
    );
  } catch (error) {
    console.error('[ChartPreview] Generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 },
    );
  }
}
