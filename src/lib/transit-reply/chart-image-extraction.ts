import OpenAI from 'openai';
import { z } from 'zod';
import type { BirthChartData } from '../../../utils/astrology/birthChart';
import type { TransitReplyHouseCusp } from './analysis';

const SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
] as const;

const BODIES = [
  'Sun',
  'Moon',
  'Mercury',
  'Venus',
  'Mars',
  'Jupiter',
  'Saturn',
  'Uranus',
  'Neptune',
  'Pluto',
  'Ascendant',
  'Midheaven',
  'North Node',
  'Chiron',
] as const;

const SIGN_INDEX = Object.fromEntries(
  SIGNS.map((sign, index) => [sign, index]),
) as Record<(typeof SIGNS)[number], number>;

const extractedPlacementSchema = z.object({
  body: z.enum(BODIES),
  sign: z.enum(SIGNS),
  degree: z.number().int().min(0).max(29),
  minute: z.number().int().min(0).max(59).default(0),
  retrograde: z.boolean().optional().default(false),
  house: z.number().int().min(1).max(12).nullable().optional(),
});

const extractedHouseCuspSchema = z.object({
  house: z.number().int().min(1).max(12),
  sign: z.enum(SIGNS),
  degree: z.number().int().min(0).max(29),
  minute: z.number().int().min(0).max(59).default(0),
});

const extractionSchema = z.object({
  provider: z
    .enum(['astro-seek', 'astrodienst', 'astro.com', 'other', 'unknown'])
    .default('unknown'),
  confidence: z.enum(['high', 'medium', 'low']).default('low'),
  houseConfidence: z.enum(['high', 'medium', 'low']).default('low'),
  houseSystem: z.string().nullable().optional(),
  houseNumberingDirection: z
    .enum(['clockwise', 'counterclockwise', 'unknown'])
    .default('unknown'),
  birthDate: z.string().nullable().optional(),
  birthTime: z.string().nullable().optional(),
  birthLocation: z.string().nullable().optional(),
  placements: z.array(extractedPlacementSchema).default([]),
  houseCusps: z.array(extractedHouseCuspSchema).default([]),
  warnings: z.array(z.string()).default([]),
});

export type ChartImageExtraction = Omit<
  z.infer<typeof extractionSchema>,
  'houseCusps'
> & {
  birthChart: BirthChartData[];
  houseCusps: TransitReplyHouseCusp[];
};

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is required for chart image extraction.');
  }
  return new OpenAI({ apiKey });
}

function placementToBirthChartData(
  placement: z.infer<typeof extractedPlacementSchema>,
): BirthChartData {
  const eclipticLongitude =
    SIGN_INDEX[placement.sign] * 30 + placement.degree + placement.minute / 60;

  return {
    body: placement.body,
    sign: placement.sign,
    degree: placement.degree,
    minute: placement.minute,
    eclipticLongitude,
    retrograde: placement.retrograde,
    ...(placement.house ? { house: placement.house } : {}),
  } as BirthChartData;
}

function houseCuspToTransitCusp(
  cusp: z.infer<typeof extractedHouseCuspSchema>,
): TransitReplyHouseCusp {
  return {
    house: cusp.house,
    sign: cusp.sign,
    degree: cusp.degree,
    minute: cusp.minute,
    eclipticLongitude:
      SIGN_INDEX[cusp.sign] * 30 + cusp.degree + cusp.minute / 60,
  };
}

function assertImageInput(input: {
  chartImageDataUrl?: string;
  chartImageUrl?: string;
}) {
  const imageUrl = input.chartImageDataUrl || input.chartImageUrl;
  if (!imageUrl) return null;

  if (input.chartImageDataUrl) {
    if (
      !/^data:image\/(?:png|jpe?g|webp);base64,/i.test(input.chartImageDataUrl)
    ) {
      throw new Error(
        'Chart image upload must be a PNG, JPEG, or WebP data URL.',
      );
    }
    if (input.chartImageDataUrl.length > 7_000_000) {
      throw new Error('Chart image is too large. Upload a smaller screenshot.');
    }
    return input.chartImageDataUrl;
  }

  if (!/^https:\/\//i.test(input.chartImageUrl || '')) {
    throw new Error('Chart image URL must be HTTPS.');
  }
  return input.chartImageUrl || null;
}

export async function extractChartFromImage(input: {
  chartImageDataUrl?: string;
  chartImageUrl?: string;
}): Promise<ChartImageExtraction | null> {
  const imageUrl = assertImageInput(input);
  if (!imageUrl) return null;

  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_VISION_MODEL?.trim() || 'gpt-4o-mini',
    temperature: 0,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content:
          'You extract Western astrology birth-chart data from screenshots, especially Astro-Seek, Astrodienst/Astro.com, and Reddit chart screenshots. Return only JSON. Prefer the planet table when visible because it contains planet, sign, degree, minute, and sometimes house. For Astrodienst tables with black natal columns and green transit columns, extract the black natal positions for the chart read; ignore green transit columns unless they are explicitly labelled as natal. If the table is not visible, read the wheel glyphs and sign/degree labels. Do not calculate placements from a visible birth date/time because screenshots often omit timezone; use birth date/time only as optional metadata. Preserve the house structure supplied by the screenshot: identify whether house numbers run clockwise/counterclockwise, extract visible house cusps when possible, and keep placement house numbers from the table. Do not infer missing placements or cusps. If ASC/MC or houses are not readable, omit houses and lower confidence.',
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: 'Extract visible natal placements from this chart image. Return JSON with provider, confidence, houseConfidence, houseSystem if shown, houseNumberingDirection, optional birthDate/birthTime/birthLocation, placements, houseCusps, and warnings. Placements must use body, sign, degree, minute, optional retrograde, optional house. House cusps must use house, sign, degree, minute. Astro-Seek tables usually show rows like Sun, Moon, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto, Node, Chiron, ASC, MC with sign glyph/degree/house: read those rows first. Astrodienst/Astro.com tables often show natal positions in black on the left and transit positions in green on the right; extract the black natal positions only, including AC/MC and house cusps when visible. Wheel-only screenshots are still usable: extract every clearly readable planet glyph with zodiac sign and degree, plus Ascendant/Midheaven if visible. If the wheel shows all 12 house cusps, extract them in the supplied house-number order rather than recalculating. Only include placements and cusps you can read clearly.',
          },
          {
            type: 'image_url',
            image_url: { url: imageUrl, detail: 'high' },
          },
        ],
      },
    ],
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error('Chart image extraction returned no content.');
  }

  const parsed = extractionSchema.parse(JSON.parse(content));
  const seen = new Set<string>();
  const birthChart = parsed.placements
    .filter((placement) => {
      if (seen.has(placement.body)) return false;
      seen.add(placement.body);
      return true;
    })
    .map(placementToBirthChartData);
  const seenHouses = new Set<number>();
  const houseCusps = parsed.houseCusps
    .filter((cusp) => {
      if (seenHouses.has(cusp.house)) return false;
      seenHouses.add(cusp.house);
      return true;
    })
    .map(houseCuspToTransitCusp)
    .sort((a, b) => a.house - b.house);

  return {
    ...parsed,
    birthChart,
    houseCusps,
  };
}
