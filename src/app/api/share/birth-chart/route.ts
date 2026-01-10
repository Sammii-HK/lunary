import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createBirthChartShare } from '@/lib/share/birth-chart';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://lunary.app';

const birthChartShareSchema = z.object({
  name: z.string().max(64).optional(),
  date: z.string().optional(),
  sun: z.string().max(32).optional(),
  moon: z.string().max(32).optional(),
  rising: z.string().max(32).optional(),
  element: z.string().max(32).optional(),
  modality: z.string().max(32).optional(),
  insight: z.string().max(320).optional(),
  keywords: z.array(z.string().max(64)).optional(),
  placements: z
    .array(
      z.object({
        body: z.string().max(64),
        sign: z.string().max(32),
        degree: z.number(),
        minute: z.number(),
        eclipticLongitude: z.number(),
        retrograde: z.boolean(),
        house: z.number().int().optional(),
      }),
    )
    .min(1),
});

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const parsed = birthChartShareSchema.safeParse(payload);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid share payload',
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const record = await createBirthChartShare(parsed.data);
    const shareUrl = `${APP_URL}/share/birth-chart/${record.shareId}`;

    return NextResponse.json({
      success: true,
      shareId: record.shareId,
      shareUrl,
    });
  } catch (error) {
    console.error('[api/share/birth-chart] failed', error);
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'Unable to create share link',
      },
      { status: 500 },
    );
  }
}
