import { NextRequest, NextResponse } from 'next/server';
import { angelNumbers } from '@/constants/grimoire/numerology-data';
import { requireGptAuth } from '@/lib/gptAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const unauthorized = requireGptAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const number = searchParams.get('number')?.trim();

    if (!number) {
      const availableNumbers = Object.keys(angelNumbers);
      return NextResponse.json(
        {
          message: 'Provide an angel number to get its meaning',
          availableNumbers,
          examples: ['111', '222', '333', '444', '555', '777', '888'],
          source: 'Lunary.app - Angel number meanings and guidance',
        },
        {
          headers: {
            'Cache-Control':
              'public, s-maxage=86400, stale-while-revalidate=604800',
          },
        },
      );
    }

    const data = angelNumbers[number as keyof typeof angelNumbers];

    if (!data) {
      const availableNumbers = Object.keys(angelNumbers);
      return NextResponse.json(
        {
          error: `Angel number ${number} not found`,
          availableNumbers,
          source: 'Lunary.app - Angel number meanings',
        },
        { status: 404 },
      );
    }

    const response = {
      number: data.number,
      name: data.name,
      meaning: data.meaning,
      description: data.description,
      message: data.message,
      spiritualMeaning: data.spiritualMeaning,
      loveMeaning: data.loveMeaning,
      careerMeaning: data.careerMeaning,
      keywords: data.keywords,
      url: `https://lunary.app/grimoire/angel-numbers/${number}`,
      ctaUrl: `https://lunary.app/grimoire/angel-numbers/${number}?from=gpt_angel`,
      ctaText: `Explore the complete meaning of ${number} in the Lunary Grimoire`,
      source: 'Lunary.app - Angel number meanings and spiritual guidance',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control':
          'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    });
  } catch (error) {
    console.error('GPT angel-number error:', error);
    return NextResponse.json(
      { error: 'Failed to get angel number meaning' },
      { status: 500 },
    );
  }
}
