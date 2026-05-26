import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  analyseBirthChartReply,
  analyseTransitReply,
  buildRedditBirthChartReply,
  buildRedditTransitReply,
  parsePlacementsText,
  type TransitReplyHouseCusp,
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
import type { ShareTransitReplyPayload } from '@/lib/share/transit-reply';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXT_PUBLIC_BASE_URL ||
  'https://lunary.app';

const ALLOWED_SUBREDDITS = new Set([
  'astrology',
  'askastrologers',
  'advancedastrology',
  'astrologymemes',
  'astrologyreadings',
  'birthcharts',
  'lunary_insights',
]);

const placementSchema = z.object({
  body: z.string().max(64),
  sign: z.string().max(32),
  degree: z.number(),
  minute: z.number(),
  eclipticLongitude: z.number(),
  retrograde: z.boolean().optional().default(false),
  house: z.number().int().min(1).max(12).optional(),
});

const extensionSchema = z.object({
  mode: z.enum(['transits', 'birth-chart']).optional().default('transits'),
  subreddit: z.string().max(64).optional(),
  targetUrl: z.string().url().max(600).optional(),
  targetKind: z.enum(['post', 'comment']).optional(),
  author: z.string().max(80).optional(),
  title: z.string().max(400).optional(),
  body: z.string().max(5000).optional(),
  parentText: z.string().max(5000).optional(),
  name: z.string().max(64).optional(),
  includeLink: z.boolean().optional().default(true),
  includeImage: z.boolean().optional().default(true),
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

function allowedOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const allowed = (
    process.env.REDDIT_REPLY_EXTENSION_ORIGIN ||
    process.env.SPELLCAST_EXTENSION_ORIGIN ||
    ''
  )
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (origin && allowed.includes(origin)) return origin;
  return allowed[0] || 'null';
}

function corsHeaders(request: Request) {
  return {
    'Access-Control-Allow-Origin': allowedOrigin(request),
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-Lunary-Extension-Token',
    Vary: 'Origin',
  };
}

function extensionAuth(request: Request) {
  const token = process.env.REDDIT_REPLY_EXTENSION_TOKEN;
  if (!token) return false;
  const authHeader = request.headers.get('authorization');
  const extensionHeader = request.headers.get('x-lunary-extension-token');
  return authHeader === `Bearer ${token}` || extensionHeader === token;
}

function normaliseDate(value?: string) {
  if (!value) return new Date();
  const date = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function resolveBirthChart(
  input: z.infer<typeof extensionSchema>,
): Promise<{
  birthChart: BirthChartData[];
  houseCusps: TransitReplyHouseCusp[];
  warnings: string[];
  chartMeta?: ShareTransitReplyPayload['chartMeta'];
}> {
  if (input.placements?.length) {
    return { birthChart: input.placements, houseCusps: [], warnings: [] };
  }

  if (input.placementsText?.trim()) {
    const parsed = parsePlacementsText(input.placementsText);
    if (parsed.length >= 3)
      return { birthChart: parsed, houseCusps: [], warnings: [] };
  }

  if (input.chartImageDataUrl || input.chartImageUrl) {
    const extracted = await extractChartFromImage({
      chartImageDataUrl: input.chartImageDataUrl,
      chartImageUrl: input.chartImageUrl,
    });
    if (extracted?.birthChart.length && extracted.birthChart.length >= 3) {
      return {
        birthChart: extracted.birthChart,
        houseCusps:
          extracted.houseCusps.length === 12 ? extracted.houseCusps : [],
        chartMeta: {
          provider: extracted.provider,
          confidence: extracted.confidence,
          houseConfidence: extracted.houseConfidence,
          houseSystem: extracted.houseSystem,
          houseNumberingDirection: extracted.houseNumberingDirection,
          birthDate: extracted.birthDate,
          birthTime: extracted.birthTime,
          birthLocation: extracted.birthLocation,
        },
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
    return {
      birthChart: chart.planets,
      houseCusps: chart.houses,
      chartMeta: {
        provider: 'lunary',
        confidence: 'high',
        houseConfidence: input.birthTime ? 'high' : 'low',
        houseSystem: 'whole-sign',
        birthDate: input.birthDate,
        birthTime: input.birthTime,
        birthLocation: input.birthLocation,
      },
      warnings: [],
    };
  }

  return { birthChart: [], houseCusps: [], warnings: [] };
}

function canIncludeLink(subreddit?: string, requested = true) {
  if (!requested) return false;
  return !subreddit || subreddit === 'lunary_insights';
}

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(request),
  });
}

export async function POST(request: Request) {
  const headers = corsHeaders(request);

  if (!extensionAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401, headers },
    );
  }

  try {
    const raw = await request.json();
    const parsed = extensionSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid extension payload',
          details: parsed.error.format(),
        },
        { status: 400, headers },
      );
    }

    const input = parsed.data;
    const subreddit = input.subreddit?.toLowerCase();
    if (subreddit && !ALLOWED_SUBREDDITS.has(subreddit)) {
      return NextResponse.json(
        {
          success: false,
          error: `Subreddit "${subreddit}" is not enabled for transit reply cards.`,
        },
        { status: 400, headers },
      );
    }

    const {
      birthChart,
      houseCusps,
      chartMeta,
      warnings: chartWarnings,
    } = await resolveBirthChart(input);
    if (birthChart.length < 3) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Add birth data, copied placements, or a readable chart image before generating a transit overlay.',
          fallbackReply:
            input.mode === 'birth-chart'
              ? "I can give a cleaner chart read if you share the planet table, a clear chart screenshot, or birth data. I don't want to invent placements I can't read clearly."
              : "I can read the current sky, but I don't want to fake a personal transit reading without chart data. If you can share birth date/time/place or a clear screenshot with the planet table/Ascendant visible, I can map the live transits onto the chart properly.",
        },
        { status: 422, headers },
      );
    }

    const shareId = createTransitReplyShareId();
    const shareUrl = `${APP_URL}/share/transit-reply/${shareId}`;
    const imageUrl = transitReplyImageUrl(shareId, APP_URL);
    const imagePngUrl = transitReplyImagePngUrl(shareId, APP_URL);
    const linkAllowed = canIncludeLink(subreddit, input.includeLink);
    const question = [input.title, input.body || input.parentText]
      .filter(Boolean)
      .join('\n\n');
    const { analysis, redditReply, analysisDate } = (() => {
      if (input.mode === 'birth-chart') {
        const chartAnalysis = analyseBirthChartReply(birthChart);
        return {
          analysis: chartAnalysis,
          redditReply: buildRedditBirthChartReply({
            question,
            analysis: chartAnalysis,
            shareUrl: linkAllowed ? shareUrl : undefined,
          }),
          analysisDate: normaliseDate(input.date).toISOString().slice(0, 10),
        };
      }

      const transitAnalysis = analyseTransitReply(
        birthChart,
        normaliseDate(input.date),
        4,
        houseCusps,
      );
      return {
        analysis: transitAnalysis,
        redditReply: buildRedditTransitReply({
          question,
          transits: transitAnalysis.transits,
          shareUrl: linkAllowed ? shareUrl : undefined,
        }),
        analysisDate: transitAnalysis.date,
      };
    })();

    await createTransitReplyShare(
      {
        mode: input.mode,
        chartMeta,
        name: input.name || input.author,
        question,
        sourceUrl: input.targetUrl,
        birthChart,
        houseCusps,
        date: analysisDate,
        analysis,
        redditReply,
        warnings: chartWarnings,
      },
      shareId,
    );

    const image = input.includeImage
      ? {
          url: imageUrl,
          pngUrl: imagePngUrl,
          alt: 'Lunary transit overlay with natal chart inside and current transits outside',
        }
      : null;

    return NextResponse.json(
      {
        success: true,
        artifact: {
          mode: input.mode,
          reply: redditReply,
          copyText: redditReply,
          targetUrl: input.targetUrl ?? null,
          linkUrl: linkAllowed ? shareUrl : null,
          imageUrl: image?.url ?? null,
          imagePngUrl: image?.pngUrl ?? null,
          image,
          warnings: linkAllowed
            ? chartWarnings
            : [
                ...chartWarnings,
                'Link omitted for this subreddit. Paste the image/reply only unless the community allows external links.',
              ],
        },
        shareId,
        shareUrl,
        imageUrl,
        analysis,
        mode: input.mode,
        chartMeta,
        chartWarnings,
      },
      { headers },
    );
  } catch (error) {
    console.error('[extension/reddit-transit-reply] failed', error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create Reddit transit reply',
      },
      { status: 500, headers },
    );
  }
}
