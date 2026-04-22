import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { generateStarfield, OG_COLORS } from '@/lib/share/og-utils';
import {
  loadShareFonts,
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
} from '@/lib/share/og-share-utils';

export const runtime = 'edge';

// --- Planet + sign mapping ---------------------------------------------------

type PlanetKey =
  | 'sun'
  | 'moon'
  | 'mercury'
  | 'venus'
  | 'mars'
  | 'jupiter'
  | 'saturn'
  | 'uranus'
  | 'neptune'
  | 'pluto';

const ALLOWED_PLANETS = new Set<PlanetKey>([
  'sun',
  'moon',
  'mercury',
  'venus',
  'mars',
  'jupiter',
  'saturn',
  'uranus',
  'neptune',
  'pluto',
]);

const PLANET_DISPLAY: Record<PlanetKey, string> = {
  sun: 'Sun',
  moon: 'Moon',
  mercury: 'Mercury',
  venus: 'Venus',
  mars: 'Mars',
  jupiter: 'Jupiter',
  saturn: 'Saturn',
  uranus: 'Uranus',
  neptune: 'Neptune',
  pluto: 'Pluto',
};

const PLANET_TO_RISING: Record<PlanetKey, string> = {
  sun: 'Leo rising',
  moon: 'Cancer rising',
  mercury: 'Gemini or Virgo rising',
  venus: 'Taurus or Libra rising',
  mars: 'Aries rising',
  jupiter: 'Sagittarius rising',
  saturn: 'Capricorn rising',
  uranus: 'Aquarius rising',
  neptune: 'Pisces rising',
  pluto: 'Scorpio rising',
};

const PLANET_GLYPH: Record<PlanetKey, string> = {
  sun: '☉',
  moon: '☽',
  mercury: '☿',
  venus: '♀',
  mars: '♂',
  jupiter: '♃',
  saturn: '♄',
  uranus: '♅',
  neptune: '♆',
  pluto: '♇',
};

// --- Format handling ---------------------------------------------------------

type RulerFormat =
  | 'pinterest'
  | 'instagram-square'
  | 'instagram-portrait'
  | 'story';

const FORMAT_SIZES: Record<RulerFormat, { width: number; height: number }> = {
  pinterest: { width: 1000, height: 1500 },
  'instagram-square': { width: 1080, height: 1080 },
  'instagram-portrait': { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

const DEFAULT_FORMAT: RulerFormat = 'pinterest';

const ALLOWED_FORMATS = new Set<RulerFormat>([
  'pinterest',
  'instagram-square',
  'instagram-portrait',
  'story',
]);

function parseFormat(value: string | null): RulerFormat {
  if (!value) return DEFAULT_FORMAT;
  const lower = value.toLowerCase();
  return ALLOWED_FORMATS.has(lower as RulerFormat)
    ? (lower as RulerFormat)
    : DEFAULT_FORMAT;
}

function parsePlanet(raw: string): PlanetKey | null {
  const lower = raw.toLowerCase().replace(/[^a-z]/g, '');
  return ALLOWED_PLANETS.has(lower as PlanetKey) ? (lower as PlanetKey) : null;
}

interface RulerSizes {
  padding: number;
  eyebrowSize: number;
  glyphSize: number;
  planetSize: number;
  risingSize: number;
  hookSize: number;
  wordmarkSize: number;
  maxWidth: number;
}

function getSizes(format: RulerFormat): RulerSizes {
  switch (format) {
    case 'story':
      return {
        padding: 80,
        eyebrowSize: 26,
        glyphSize: 200,
        planetSize: 140,
        risingSize: 38,
        hookSize: 34,
        wordmarkSize: 30,
        maxWidth: 900,
      };
    case 'instagram-portrait':
      return {
        padding: 70,
        eyebrowSize: 24,
        glyphSize: 170,
        planetSize: 120,
        risingSize: 34,
        hookSize: 30,
        wordmarkSize: 28,
        maxWidth: 940,
      };
    case 'instagram-square':
      return {
        padding: 60,
        eyebrowSize: 22,
        glyphSize: 140,
        planetSize: 100,
        risingSize: 30,
        hookSize: 28,
        wordmarkSize: 26,
        maxWidth: 960,
      };
    case 'pinterest':
    default:
      return {
        padding: 70,
        eyebrowSize: 24,
        glyphSize: 180,
        planetSize: 120,
        risingSize: 32,
        hookSize: 28,
        wordmarkSize: 28,
        maxWidth: 860,
      };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ planet: string }> },
) {
  try {
    const { planet: planetParam } = await params;
    const planet = parsePlanet(planetParam);
    if (!planet) {
      return new Response('Unknown planet', { status: 404 });
    }

    const searchParams = request.nextUrl.searchParams;
    const format = parseFormat(searchParams.get('format'));
    const { width, height } = FORMAT_SIZES[format];
    const sizes = getSizes(format);

    const planetDisplay = PLANET_DISPLAY[planet];
    const rising = PLANET_TO_RISING[planet];
    const glyph = PLANET_GLYPH[planet];

    const fonts = await loadShareFonts(request);
    const starCount =
      format === 'story' ? 180 : format === 'instagram-square' ? 120 : 140;
    const stars = generateStarfield(`ruler-${planet}-${format}`, starCount);

    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: sizes.padding,
          background: `radial-gradient(circle at 22% 25%, rgba(132, 88, 216, 0.25) 0%, transparent 55%), radial-gradient(circle at 78% 82%, rgba(123, 123, 232, 0.22) 0%, transparent 55%), linear-gradient(165deg, #0f0a1a 0%, #0a0a14 55%, ${OG_COLORS.background} 100%)`,
          border: SHARE_IMAGE_BORDER,
          position: 'relative',
          color: '#fff',
          fontFamily: 'SpaceGrotesk',
        }}
      >
        {/* Starfield */}
        {stars.map((s, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              borderRadius: '50%',
              background: '#fff',
              opacity: s.opacity,
            }}
          />
        ))}

        {/* Eyebrow */}
        <div
          style={{
            display: 'flex',
            letterSpacing: 6,
            fontSize: sizes.eyebrowSize,
            textTransform: 'uppercase',
            color: OG_COLORS.galaxyHaze,
            zIndex: 1,
            fontFamily: 'SpaceGrotesk',
          }}
        >
          Beyond Your Sun Sign
        </div>

        {/* Centre: glyph + planet name + rising */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 16,
            zIndex: 1,
            maxWidth: sizes.maxWidth,
          }}
        >
          <div
            style={{
              fontSize: sizes.glyphSize,
              lineHeight: 1,
              color: '#fff',
              textShadow: SHARE_TITLE_GLOW,
              fontFamily: 'NotoSans',
            }}
          >
            {glyph}
          </div>
          <div
            style={{
              fontSize: sizes.planetSize,
              fontWeight: 700,
              lineHeight: 1,
              color: '#fff',
              textShadow: SHARE_TITLE_GLOW,
              textAlign: 'center',
              fontFamily: 'SpaceGrotesk',
            }}
          >
            {planetDisplay}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: sizes.risingSize,
              color: OG_COLORS.textSecondary,
              marginTop: 8,
              textAlign: 'center',
              fontFamily: 'SpaceGrotesk',
            }}
          >
            Chart ruler for {rising}
          </div>
        </div>

        {/* Bottom: hook + wordmark */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 20,
            zIndex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: sizes.hookSize,
              color: '#fff',
              fontStyle: 'italic',
              textAlign: 'center',
              maxWidth: sizes.maxWidth,
              fontFamily: 'SpaceGrotesk',
            }}
          >
            Is {planetDisplay} your chart ruler? Take the quiz.
          </div>
          <div
            style={{
              display: 'flex',
              letterSpacing: 4,
              fontSize: sizes.wordmarkSize,
              textTransform: 'uppercase',
              color: OG_COLORS.primaryViolet,
              fontFamily: 'SpaceGrotesk',
              fontWeight: 700,
            }}
          >
            Lunary
          </div>
        </div>
      </div>,
      { width, height, fonts },
    );
  } catch (error) {
    console.error('[og/quiz/ruler] render failed');
    if (error instanceof Error) console.error(error.message);
    return new Response('Internal error rendering card', { status: 500 });
  }
}
