import { NextRequest, NextResponse } from 'next/server';
import { getAstrologicalChart } from '../../../../utils/astrology/astrology';
import { generateBirthChart } from '../../../../utils/astrology/birthChart';
import { Observer } from 'astronomy-engine';

export const dynamic = 'force-dynamic';

const NATAL_BODIES = new Set([
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
]);
const TRANSIT_BODIES = new Set([
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
]);

type AspectName = 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile';

const ASPECTS: { name: AspectName; angle: number; orb: number }[] = [
  { name: 'conjunction', angle: 0, orb: 8 },
  { name: 'opposition', angle: 180, orb: 8 },
  { name: 'trine', angle: 120, orb: 6 },
  { name: 'square', angle: 90, orb: 6 },
  { name: 'sextile', angle: 60, orb: 4 },
];

const ASPECT_DESCRIPTIONS: Record<AspectName, string> = {
  conjunction: 'is merging with',
  opposition: 'is opposing',
  trine: 'is flowing with',
  square: 'is challenging',
  sextile: 'is harmonising with',
};

const TRANSIT_FLAVOUR: Record<string, string> = {
  Jupiter: 'expansion and opportunity',
  Saturn: 'structure and discipline',
  Mars: 'drive and assertiveness',
  Venus: 'love and harmony',
  Mercury: 'communication and ideas',
  Sun: 'identity and purpose',
  Moon: 'emotions and instincts',
  Uranus: 'disruption and breakthroughs',
  Neptune: 'dreams and intuition',
  Pluto: 'transformation and power',
};

export async function GET(request: NextRequest) {
  const birthDate = request.nextUrl.searchParams.get('date');

  if (!birthDate || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return NextResponse.json(
      { error: 'date param required (YYYY-MM-DD)' },
      { status: 400 },
    );
  }

  const year = Number(birthDate.split('-')[0]);
  if (year < 1900 || year > 2030) {
    return NextResponse.json(
      { error: 'Date must be between 1900 and 2030' },
      { status: 400 },
    );
  }

  try {
    // 1. Calculate natal chart (no location, defaults to Greenwich/noon)
    const natalChart = await generateBirthChart(birthDate);
    const natalFiltered = natalChart.filter((p) => NATAL_BODIES.has(p.body));

    // 2. Calculate current sky positions
    const now = new Date();
    const observer = new Observer(51.4769, 0.0005, 0);
    const currentSky = getAstrologicalChart(now, observer);

    // 3. Find aspects between current transits and natal chart
    const transits: {
      transitPlanet: string;
      transitSign: string;
      aspect: string;
      description: string;
      natalPlanet: string;
      natalSign: string;
      flavour: string;
      intensity: number;
    }[] = [];

    for (const transit of currentSky) {
      if (!TRANSIT_BODIES.has(transit.body)) continue;

      for (const natal of natalFiltered) {
        let diff = Math.abs(
          transit.eclipticLongitude - natal.eclipticLongitude,
        );
        if (diff > 180) diff = 360 - diff;

        for (const asp of ASPECTS) {
          const orbDiff = Math.abs(diff - asp.angle);
          if (orbDiff <= asp.orb) {
            transits.push({
              transitPlanet: transit.body,
              transitSign: transit.sign,
              aspect: asp.name,
              description: `${transit.body} in ${transit.sign} ${ASPECT_DESCRIPTIONS[asp.name]} your natal ${natal.body} in ${natal.sign}`,
              natalPlanet: natal.body,
              natalSign: natal.sign,
              flavour: TRANSIT_FLAVOUR[transit.body] || 'cosmic influence',
              intensity: asp.orb - orbDiff,
            });
            break; // One aspect per transit-natal pair
          }
        }
      }
    }

    // Sort by intensity (tightest aspects first)
    transits.sort((a, b) => b.intensity - a.intensity);

    // Pick 1 of each aspect type first for variety, then fill to 3 with duplicates
    const seenAspects = new Set<string>();
    const diverse: typeof transits = [];
    const rest: typeof transits = [];
    for (const t of transits) {
      if (!seenAspects.has(t.aspect)) {
        seenAspects.add(t.aspect);
        diverse.push(t);
      } else {
        rest.push(t);
      }
    }
    const topTransits = [...diverse, ...rest].slice(0, 3);

    // 4. Return natal preview + active transits
    const preview = natalFiltered.map((p) => ({
      body: p.body,
      sign: p.sign,
      degree: p.degree,
    }));

    return NextResponse.json(
      {
        placements: preview,
        transits: topTransits,
        transitCount: transits.length,
      },
      {
        headers: {
          // Cache for 1 hour — transits change slowly but Moon moves fast
          'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        },
      },
    );
  } catch (error) {
    console.error('[TransitPreview] Generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview' },
      { status: 500 },
    );
  }
}
