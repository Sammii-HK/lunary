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

/**
 * Find all sign-change segments for a slow planet within a date range.
 * Returns segments grouped by sign, handling retrograde re-entries.
 */
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
      // Binary search for exact ingress moment
      let lo = new Date(d.getTime() - oneDay);
      let hi = new Date(d);
      for (let i = 0; i < 20; i++) {
        const mid = new Date((lo.getTime() + hi.getTime()) / 2);
        const midSign = getSign(getEclipticLongitude(body, mid));
        if (midSign === currentSign) lo = mid;
        else hi = mid;
      }
      const ingressDate = new Date(hi);

      // Close current segment
      if (!signSegments[currentSign]) signSegments[currentSign] = [];
      signSegments[currentSign].push({
        start: segmentStart.toISOString(),
        end: ingressDate.toISOString(),
      });

      // Start new segment
      currentSign = sign;
      segmentStart = new Date(ingressDate);
    }

    d = new Date(d.getTime() + oneDay);
  }

  // Close final segment
  if (!signSegments[currentSign]) signSegments[currentSign] = [];
  signSegments[currentSign].push({
    start: segmentStart.toISOString(),
    end: new Date(scanEnd).toISOString(),
  });

  return signSegments;
}

function parseArgs(): { endYear: number } {
  const args = process.argv.slice(2);
  let endYear = 2040;

  args.forEach((arg) => {
    if (arg.startsWith('--end-year=')) {
      endYear = parseInt(arg.split('=')[1], 10);
    }
  });

  return { endYear };
}

function main() {
  const { endYear } = parseArgs();
  const scanStart = new Date('2020-01-01T00:00:00.000Z');
  const scanEnd = new Date(`${endYear}-01-01T00:00:00.000Z`);

  console.log(`Computing slow planet sign changes from 2020 to ${endYear}...`);

  const segments: Record<string, Record<string, Segment[]>> = {};

  for (const [name, body] of Object.entries(PLANET_BODIES)) {
    console.log(`  Processing ${name}...`);
    segments[name] = computeSignSegments(body, scanStart, scanEnd);
  }

  const output = {
    generated: new Date().toISOString().split('T')[0],
    scanRange: {
      start: scanStart.toISOString().split('T')[0],
      end: scanEnd.toISOString().split('T')[0],
    },
    segments,
  };

  const outPath = resolve(
    __dirname,
    '../src/data/slow-planet-sign-changes.json',
  );
  writeFileSync(outPath, JSON.stringify(output, null, 2) + '\n');
  console.log(`Wrote ${outPath}`);

  // Print summary
  for (const [planet, signs] of Object.entries(segments)) {
    const totalSegs = Object.values(signs).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
    console.log(
      `  ${planet}: ${totalSegs} segments across ${Object.keys(signs).length} signs`,
    );
  }
}

main();
