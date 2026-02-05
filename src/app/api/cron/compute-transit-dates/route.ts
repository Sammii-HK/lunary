import { NextRequest, NextResponse } from 'next/server';
import { Body, GeoVector, Ecliptic, AstroTime } from 'astronomy-engine';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

const ZODIAC_SIGNS = [
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
];

const PLANET_BODIES: Record<string, Body> = {
  Jupiter: Body.Jupiter,
  Saturn: Body.Saturn,
  Uranus: Body.Uranus,
  Neptune: Body.Neptune,
  Pluto: Body.Pluto,
};

function getEclipticLongitude(body: Body, date: Date): number {
  const t = new AstroTime(date);
  const v = GeoVector(body, t, true);
  return Ecliptic(v).elon;
}

function getSign(longitude: number): string {
  return ZODIAC_SIGNS[Math.floor(longitude / 30)];
}

interface Segment {
  start: string;
  end: string;
}

function computeSignSegments(
  body: Body,
  scanStart: Date,
  scanEnd: Date,
): Record<string, Segment[]> {
  const signSegments: Record<string, Segment[]> = {};
  let currentSign = getSign(getEclipticLongitude(body, scanStart));
  let segmentStart = new Date(scanStart);

  const oneDay = 24 * 60 * 60 * 1000;
  let d = new Date(scanStart.getTime() + oneDay);

  while (d <= scanEnd) {
    const lon = getEclipticLongitude(body, d);
    const sign = getSign(lon);

    if (sign !== currentSign) {
      let lo = new Date(d.getTime() - oneDay);
      let hi = new Date(d);
      for (let i = 0; i < 20; i++) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const midSign = getSign(getEclipticLongitude(body, mid));
        if (midSign === currentSign) lo = mid;
        else hi = mid;
      }
      const ingressDate = new Date(hi);

      if (!signSegments[currentSign]) signSegments[currentSign] = [];
      signSegments[currentSign].push({
        start: segmentStart.toISOString(),
        end: ingressDate.toISOString(),
      });

      currentSign = sign;
      segmentStart = new Date(ingressDate);
    }

    d = new Date(d.getTime() + oneDay);
  }

  if (!signSegments[currentSign]) signSegments[currentSign] = [];
  signSegments[currentSign].push({
    start: segmentStart.toISOString(),
    end: new Date(scanEnd).toISOString(),
  });

  return signSegments;
}

export async function GET(request: NextRequest) {
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const now = new Date();
    const currentYear = now.getUTCFullYear();

    // Scan from 2020 to 15 years from now
    const scanStart = new Date('2020-01-01T00:00:00.000Z');
    const scanEndYear = currentYear + 15;
    const scanEnd = new Date(`${scanEndYear}-01-01T00:00:00.000Z`);

    const segments: Record<string, Record<string, Segment[]>> = {};

    for (const [name, body] of Object.entries(PLANET_BODIES)) {
      segments[name] = computeSignSegments(body, scanStart, scanEnd);
    }

    const output = {
      generated: now.toISOString().split('T')[0],
      scanRange: {
        start: scanStart.toISOString().split('T')[0],
        end: scanEnd.toISOString().split('T')[0],
      },
      segments,
    };

    // Write updated JSON to the data file
    const outPath = resolve(
      process.cwd(),
      'src/data/slow-planet-sign-changes.json',
    );
    writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');

    // Check if committed JSON scan range ends within 2 years
    const scanEndDate = new Date(output.scanRange.end);
    const twoYearsFromNow = new Date(now);
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 2);

    const warnings: string[] = [];
    if (scanEndDate <= twoYearsFromNow) {
      warnings.push(
        `Scan range ends ${output.scanRange.end}, which is within 2 years. Consider extending.`,
      );
    }

    const totalSegments = Object.values(segments).reduce(
      (sum, signs) =>
        sum + Object.values(signs).reduce((s, arr) => s + arr.length, 0),
      0,
    );

    return NextResponse.json({
      success: true,
      generated: output.generated,
      scanRange: output.scanRange,
      totalSegments,
      warnings,
    });
  } catch (error) {
    console.error('Failed to compute transit dates:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
