import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import {
  analyseTransitReply,
  buildRedditTransitReply,
} from '@/lib/transit-reply/analysis';
import {
  createTransitReplyShare,
  createTransitReplyShareId,
  transitReplyImagePngUrl,
  transitReplyImageUrl,
  transitReplyPublicUrl,
} from '@/lib/share/transit-reply';

export const dynamic = 'force-dynamic';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://lunary.app';

const placementSchema = z.object({
  body: z.string().max(64),
  sign: z.string().max(32),
  degree: z.number(),
  minute: z.number(),
  eclipticLongitude: z.number(),
  retrograde: z.boolean().optional().default(false),
  house: z.number().int().min(1).max(12).optional(),
});

const transitReplyShareSchema = z.object({
  name: z.string().max(64).optional(),
  question: z.string().max(4000).optional(),
  sourceUrl: z.string().url().max(500).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  birthChart: z.array(placementSchema).min(3),
});

function normaliseDate(value?: string) {
  if (!value) return new Date();
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = transitReplyShareSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid transit reply share payload',
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const shareId = createTransitReplyShareId();
    const shareUrl = transitReplyPublicUrl(shareId, APP_URL);
    const imageUrl = transitReplyImageUrl(shareId, APP_URL);
    const imagePngUrl = transitReplyImagePngUrl(shareId, APP_URL);
    const analysis = analyseTransitReply(
      input.birthChart,
      normaliseDate(input.date),
      4,
    );
    const redditReply = buildRedditTransitReply({
      question: input.question,
      transits: analysis.transits,
      shareUrl,
    });

    const record = await createTransitReplyShare(
      {
        name: input.name,
        question: input.question,
        sourceUrl: input.sourceUrl,
        birthChart: input.birthChart,
        date: analysis.date,
        analysis,
        redditReply,
      },
      shareId,
    );

    return NextResponse.json({
      success: true,
      shareId: record.shareId,
      shareUrl,
      imageUrl,
      imagePngUrl,
      redditReply,
      analysis,
    });
  } catch (error) {
    console.error('[api/share/transit-reply] failed', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unable to create transit reply share',
      },
      { status: 500 },
    );
  }
}
