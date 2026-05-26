import { NextResponse } from 'next/server';
import { z } from 'zod';
import { requireAdminAuth } from '@/lib/admin-auth';
import {
  analyseTransitReply,
  buildRedditTransitReply,
  parsePlacementsText,
} from '@/lib/transit-reply/analysis';
import { extractChartFromImage } from '@/lib/transit-reply/chart-image-extraction';
import {
  createTransitReplyShare,
  createTransitReplyShareId,
  transitReplyImagePngUrl,
  transitReplyImageUrl,
} from '@/lib/share/transit-reply';
import { generateBirthChartWithHouses } from '@utils/astrology/birthChart';
import type { BirthChartData } from '@utils/astrology/birthChart';

export const runtime = 'nodejs';
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

const requestSchema = z.object({
  name: z.string().max(64).optional(),
  question: z.string().max(4000).optional(),
  sourceUrl: z.string().url().max(500).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  placements: z.array(placementSchema).min(1).optional(),
  placementsText: z.string().max(12000).optional(),
  chartImageUrl: z.string().url().max(1200).optional(),
  chartImageDataUrl: z.string().max(7_000_000).optional(),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  birthTime: z
    .string()
    .regex(/^\d{1,2}:\d{2}$/)
    .optional(),
  birthLocation: z.string().max(160).optional(),
});

function normaliseDate(value?: string) {
  if (!value) return new Date();
  const date = new Date(`${value}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return new Date();
  return date;
}

async function resolveBirthChart(
  input: z.infer<typeof requestSchema>,
): Promise<{ birthChart: BirthChartData[]; warnings: string[] }> {
  if (input.placements?.length) {
    return { birthChart: input.placements, warnings: [] };
  }

  if (input.placementsText?.trim()) {
    const parsed = parsePlacementsText(input.placementsText);
    if (parsed.length >= 3) return { birthChart: parsed, warnings: [] };
  }

  if (input.chartImageDataUrl || input.chartImageUrl) {
    const extracted = await extractChartFromImage({
      chartImageDataUrl: input.chartImageDataUrl,
      chartImageUrl: input.chartImageUrl,
    });
    if (extracted?.birthChart.length && extracted.birthChart.length >= 3) {
      return {
        birthChart: extracted.birthChart,
        warnings: [
          ...extracted.warnings,
          extracted.confidence === 'high'
            ? ''
            : `Chart image extraction confidence is ${extracted.confidence}; verify the placements before using this as a precise reading.`,
        ].filter(Boolean),
      };
    }
  }

  if (input.birthDate) {
    const chart = await generateBirthChartWithHouses(
      input.birthDate,
      input.birthTime || undefined,
      input.birthLocation || undefined,
      undefined,
      undefined,
      'whole-sign',
    );
    return { birthChart: chart.planets, warnings: [] };
  }

  return { birthChart: [], warnings: [] };
}

export async function POST(request: Request) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const raw = await request.json();
    const parsed = requestSchema.safeParse(raw);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid transit card payload',
          details: parsed.error.format(),
        },
        { status: 400 },
      );
    }

    const input = parsed.data;
    const { birthChart, warnings } = await resolveBirthChart(input);

    if (birthChart.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Provide birthDate, placements, placementsText, or a readable chart image with at least three recognizable placements.',
        },
        { status: 400 },
      );
    }

    const date = normaliseDate(input.date);
    const shareId = createTransitReplyShareId();
    const shareUrl = `${APP_URL}/share/transit-reply/${shareId}`;
    const imageUrl = transitReplyImageUrl(shareId, APP_URL);
    const imagePngUrl = transitReplyImagePngUrl(shareId, APP_URL);
    const analysis = analyseTransitReply(birthChart, date, 4);
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
        birthChart,
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
      warnings,
    });
  } catch (error) {
    console.error('[reddit/transit-card] failed', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create transit reply card',
      },
      { status: 500 },
    );
  }
}
