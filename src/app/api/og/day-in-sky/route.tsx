import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  generateStarfield,
  getFormatDimensions,
  getStarCount,
} from '@/lib/share/og-utils';
import {
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
  ShareFooter,
  truncateText,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';
import { astroPointSymbols, bodiesSymbols } from '@/constants/symbols';

export const runtime = 'edge';
// 7-day cache — sky for a historical date is immutable. Allows long edge TTL.
export const revalidate = 604_800;

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;
let astronomiconFontPromise: Promise<ArrayBuffer> | null = null;

const loadRobotoMono = async (request: Request) => {
  if (!robotoMonoPromise) {
    const fontUrl = new URL('/fonts/RobotoMono-Regular.ttf', request.url);
    robotoMonoPromise = fetch(fontUrl, { cache: 'force-cache' }).then((res) => {
      if (!res.ok) {
        throw new Error(`Roboto Mono fetch failed: ${res.status}`);
      }
      return res.arrayBuffer();
    });
  }
  return robotoMonoPromise;
};

const loadAstronomiconFont = async (request: Request) => {
  if (!astronomiconFontPromise) {
    const fontUrl = new URL('/fonts/Astronomicon.ttf', request.url);
    astronomiconFontPromise = fetch(fontUrl, { cache: 'force-cache' }).then(
      (res) => {
        if (!res.ok) {
          throw new Error(`Astronomicon fetch failed: ${res.status}`);
        }
        return res.arrayBuffer();
      },
    );
  }
  return astronomiconFontPromise;
};

// --- Strict allow-list validation -----------------------------------------

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const ALLOWED_FORMATS: ReadonlySet<ShareFormat> = new Set<ShareFormat>([
  'square',
  'landscape',
  'story',
]);

const SAFE_DEFAULT_DATE = '2025-01-01';
const SAFE_DEFAULT_FORMAT: ShareFormat = 'landscape';

/** Strict allow-list: only YYYY-MM-DD in [1800-01-01, 2200-12-31]. */
function safeDateParam(raw: string | null): string {
  if (!raw || !ISO_DATE_RE.test(raw)) return SAFE_DEFAULT_DATE;
  const [y, m, d] = raw.split('-').map(Number);
  if (y < 1800 || y > 2200) return SAFE_DEFAULT_DATE;
  if (m < 1 || m > 12) return SAFE_DEFAULT_DATE;
  if (d < 1 || d > 31) return SAFE_DEFAULT_DATE;
  // Strict round-trip parse to reject e.g. "2024-02-31".
  const probe = new Date(Date.UTC(y, m - 1, d));
  if (
    probe.getUTCFullYear() !== y ||
    probe.getUTCMonth() !== m - 1 ||
    probe.getUTCDate() !== d
  ) {
    return SAFE_DEFAULT_DATE;
  }
  return raw;
}

function safeFormat(raw: string | null): ShareFormat {
  if (raw && ALLOWED_FORMATS.has(raw as ShareFormat)) {
    return raw as ShareFormat;
  }
  return SAFE_DEFAULT_FORMAT;
}

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
] as const;

function signFromLongitude(longitude: number): string {
  const norm = ((longitude % 360) + 360) % 360;
  return ZODIAC_SIGNS[Math.floor(norm / 30)];
}

function formatLongDate(iso: string): string {
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return iso;
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return `${months[(m - 1 + 12) % 12]} ${d}, ${y}`;
}

// --- Edge fetch for planetary positions -----------------------------------

interface PlanetSnapshot {
  body: string;
  sign: string;
  longitude: number;
  retrograde: boolean;
}

async function fetchPositions(
  request: Request,
  dateIso: string,
): Promise<PlanetSnapshot[]> {
  try {
    // Relative to the OG request origin — keeps us off any user-controlled
    // base URL. The date has been allow-list validated above. We use the
    // internal session-friendly endpoint (no API key needed) which mirrors
    // the v1 response shape.
    const fetchUrl = new URL(
      `/api/astrology/planetary-positions?date=${dateIso}`,
      request.url,
    );
    const res = await fetch(fetchUrl, { cache: 'force-cache' });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      ok?: boolean;
      data?: {
        planets?: Array<{
          planet: string;
          longitude: number;
          sign?: string;
          retrograde?: boolean;
        }>;
      };
    };
    const planets = json?.data?.planets ?? [];
    return planets
      .map((p) => {
        const longitude = Number(p.longitude);
        if (!Number.isFinite(longitude)) return null;
        const norm = ((longitude % 360) + 360) % 360;
        const body =
          p.planet.charAt(0).toUpperCase() + p.planet.slice(1).toLowerCase();
        return {
          body,
          longitude: norm,
          sign: p.sign ?? signFromLongitude(norm),
          retrograde: Boolean(p.retrograde),
        } as PlanetSnapshot;
      })
      .filter((p): p is PlanetSnapshot => Boolean(p));
  } catch {
    return [];
  }
}

// --- Top-aspect summary ---------------------------------------------------

function topAspect(planets: PlanetSnapshot[]): string | null {
  if (planets.length < 2) return null;
  const MAJOR = [
    { name: 'conjunction', angle: 0, orb: 6 },
    { name: 'opposition', angle: 180, orb: 6 },
    { name: 'trine', angle: 120, orb: 5 },
    { name: 'square', angle: 90, orb: 5 },
    { name: 'sextile', angle: 60, orb: 3 },
  ];
  let best: { p1: string; p2: string; type: string; orb: number } | null = null;
  for (let i = 0; i < planets.length; i += 1) {
    for (let j = i + 1; j < planets.length; j += 1) {
      let diff = Math.abs(planets[i].longitude - planets[j].longitude);
      if (diff > 180) diff = 360 - diff;
      for (const m of MAJOR) {
        const orb = Math.abs(diff - m.angle);
        if (orb <= m.orb) {
          if (!best || orb < best.orb) {
            best = {
              p1: planets[i].body,
              p2: planets[j].body,
              type: m.name,
              orb,
            };
          }
          break;
        }
      }
    }
  }
  if (!best) return null;
  return `${best.p1} ${best.type} ${best.p2}`;
}

function bodyGlyph(body: string): string {
  const key = body
    .toLowerCase()
    .replace(/[\s-]+/g, '') as keyof typeof bodiesSymbols;
  if (bodiesSymbols[key]) return bodiesSymbols[key];
  const pointKey = key as keyof typeof astroPointSymbols;
  if (astroPointSymbols[pointKey]) return astroPointSymbols[pointKey];
  return body.charAt(0);
}

// --- Route handler --------------------------------------------------------

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const date = safeDateParam(searchParams.get('date'));
    const format = safeFormat(searchParams.get('format'));
    const { width, height } = getFormatDimensions(format);

    const planets = await fetchPositions(request, date);
    const sun = planets.find((p) => p.body === 'Sun');
    const moon = planets.find((p) => p.body === 'Moon');
    const venus = planets.find((p) => p.body === 'Venus');
    const aspectLabel = topAspect(planets);

    const robotoMono = await loadRobotoMono(request);
    const astronomiconFont = await loadAstronomiconFont(request);

    const isStory = format === 'story';
    const isLandscape = format === 'landscape';
    const padding = isLandscape ? 56 : isStory ? 96 : 56;
    const titleSize = isLandscape ? 64 : isStory ? 92 : 72;
    const subtitleSize = isLandscape ? 18 : isStory ? 26 : 22;
    const bigGlyphSize = isLandscape ? 48 : isStory ? 72 : 56;

    const stars = generateStarfield(`day-${date}`, getStarCount(format));
    const starfieldJsx = stars.map((star, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          left: `${star.x}%`,
          top: `${star.y}%`,
          width: star.size,
          height: star.size,
          borderRadius: '50%',
          background: '#fff',
          opacity: star.opacity * 0.8,
        }}
      />
    ));

    const headlineDate = formatLongDate(date);

    const featuredRow = [sun, moon, venus]
      .filter((p): p is PlanetSnapshot => Boolean(p))
      .slice(0, 3);

    const headerLabel = 'The sky on';
    const ctaLine = 'See yours → lunary.app/sky';

    const layout = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: '#0A0A0A',
          color: '#fff',
          padding,
          fontFamily: 'Roboto Mono',
          position: 'relative',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {/* Cosmic gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(10, 11, 18, 0.85) 0%, rgba(20, 21, 31, 0.85) 40%, rgba(67, 56, 120, 0.85) 100%)',
            display: 'flex',
          }}
        />
        {starfieldJsx}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(ellipse at 50% 0%, rgba(167, 139, 250, 0.15) 0%, transparent 60%)',
            display: 'flex',
          }}
        />

        {/* Center column */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            position: 'relative',
            gap: isStory ? 36 : 24,
            textAlign: 'center',
            maxWidth: 960,
          }}
        >
          <span
            style={{
              display: 'flex',
              fontSize: subtitleSize,
              letterSpacing: 6,
              textTransform: 'uppercase',
              opacity: 0.7,
            }}
          >
            {headerLabel}
          </span>

          <span
            style={{
              display: 'flex',
              fontSize: titleSize,
              fontWeight: 500,
              lineHeight: 1.05,
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {headlineDate}
          </span>

          {/* Featured Sun + Moon + Venus row */}
          {featuredRow.length > 0 && (
            <div
              style={{
                display: 'flex',
                gap: isStory ? 40 : 28,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              {featuredRow.map((p) => (
                <div
                  key={p.body}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 6,
                    padding: '14px 22px',
                    borderRadius: 24,
                    border: '1px solid rgba(255,255,255,0.18)',
                    background: 'rgba(0,0,0,0.28)',
                    minWidth: isStory ? 200 : 160,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Astronomicon',
                      fontSize: bigGlyphSize,
                      opacity: 0.9,
                      display: 'flex',
                    }}
                  >
                    {bodyGlyph(p.body)}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      fontSize: 14,
                      letterSpacing: 3,
                      textTransform: 'uppercase',
                      opacity: 0.6,
                    }}
                  >
                    {p.body}
                  </span>
                  <span
                    style={{
                      display: 'flex',
                      fontSize: isStory ? 24 : 20,
                      fontWeight: 500,
                    }}
                  >
                    {p.sign}
                    {p.retrograde ? ' ℞' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {aspectLabel && (
            <div
              style={{
                display: 'flex',
                fontSize: isStory ? 22 : 18,
                fontStyle: 'italic',
                color: '#A78BFA',
                marginTop: 4,
              }}
            >
              Highlight: {truncateText(aspectLabel, 80)}
            </div>
          )}

          <span
            style={{
              display: 'flex',
              fontSize: 16,
              letterSpacing: 4,
              opacity: 0.55,
              marginTop: isStory ? 32 : 20,
              textTransform: 'uppercase',
            }}
          >
            {ctaLine}
          </span>
        </div>

        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: isStory ? 20 : 14,
            left: padding,
            fontSize: isStory ? 14 : 12,
            opacity: 0.3,
            letterSpacing: 1,
            display: 'flex',
          }}
        >
          lunary.app/sky
        </div>

        <ShareFooter format={format} />
      </div>
    );

    return new ImageResponse(layout, {
      width,
      height,
      fonts: [
        { name: 'Roboto Mono', data: robotoMono, style: 'normal' },
        { name: 'Astronomicon', data: astronomiconFont, style: 'normal' },
      ],
    });
  } catch (error) {
    // Avoid logging the raw input — keep error logs control-character free.
    console.error(
      '[DayInSkyOG] Failed to generate image:',
      String(error)
        .slice(0, 200)
        .replace(/[\r\n\x00-\x1F\x7F]/g, ' '),
    );
    return new Response('Failed to generate image', { status: 500 });
  }
}
