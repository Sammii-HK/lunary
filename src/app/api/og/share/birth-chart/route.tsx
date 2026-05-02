import { ChartWheelOg } from '@/app/birth-chart/chart-wheel-og';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { astroPointSymbols, bodiesSymbols } from '@/constants/symbols';
import { getBirthChartShare } from '@/lib/share/birth-chart';
import {
  getFormatDimensions,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import {
  ShareFooter,
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
  truncateText,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';
import {
  elementAstro,
  modalityAstro,
} from '../../../../../../utils/zodiac/zodiac';
import type { BirthChartData } from '../../../../../../utils/astrology/birthChart';

export const runtime = 'edge';
export const revalidate = 604800; // 7 days — birth chart data is immutable per user

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;
let astronomiconFontPromise: Promise<ArrayBuffer> | null = null;

const loadRobotoMono = async (request: Request) => {
  if (!robotoMonoPromise) {
    const fontUrl = new URL('/fonts/RobotoMono-Regular.ttf', request.url);
    robotoMonoPromise = fetch(fontUrl, { cache: 'force-cache' }).then((res) => {
      if (!res.ok) {
        throw new Error(
          `Roboto Mono font fetch failed with status ${res.status}`,
        );
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
        if (!res.ok)
          throw new Error(`Astronomicon font fetch failed: ${res.status}`);
        return res.arrayBuffer();
      },
    );
  }
  return astronomiconFontPromise;
};

const sanitize = (value: string | null, limit = 80) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.length > limit ? `${trimmed.slice(0, limit - 1)}…` : trimmed;
};

// Vibrant gradients (85% intensity) for prominent element colors
const gradientsByElement: Record<
  string,
  { background: string; accent: string; soft: string }
> = {
  Fire: {
    background:
      'linear-gradient(135deg, rgba(18, 6, 10, 0.85) 0%, rgba(59, 15, 27, 0.85) 40%, rgba(162, 48, 48, 0.85) 100%)',
    accent: '#ffd6a3',
    soft: 'rgba(255, 214, 163, 0.18)',
  },
  Earth: {
    background:
      'linear-gradient(135deg, rgba(7, 17, 13, 0.85) 0%, rgba(15, 31, 23, 0.85) 40%, rgba(45, 106, 79, 0.85) 100%)',
    accent: '#b7f4c3',
    soft: 'rgba(183, 244, 195, 0.18)',
  },
  Air: {
    background:
      'linear-gradient(135deg, rgba(6, 19, 31, 0.85) 0%, rgba(9, 29, 44, 0.85) 35%, rgba(58, 110, 165, 0.85) 100%)',
    accent: '#c3e3ff',
    soft: 'rgba(195, 227, 255, 0.18)',
  },
  Water: {
    background:
      'linear-gradient(135deg, rgba(7, 8, 26, 0.85) 0%, rgba(11, 16, 41, 0.85) 40%, rgba(48, 72, 162, 0.85) 100%)',
    accent: '#d4dfff',
    soft: 'rgba(212, 223, 255, 0.18)',
  },
  default: {
    background:
      'linear-gradient(135deg, rgba(10, 11, 18, 0.85) 0%, rgba(20, 21, 31, 0.85) 40%, rgba(67, 56, 120, 0.85) 100%)',
    accent: '#f3d4ff',
    soft: 'rgba(243, 212, 255, 0.18)',
  },
};

const ELEMENT_ORDER = ['Fire', 'Earth', 'Air', 'Water'] as const;
type ElementType = (typeof ELEMENT_ORDER)[number];

const MODALITY_ORDER = ['Cardinal', 'Fixed', 'Mutable'] as const;
type ModalityType = (typeof MODALITY_ORDER)[number];

const SIGN_KEYS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;
type SignKey = (typeof SIGN_KEYS)[number];

const SIGN_TO_ELEMENT: Record<SignKey, ElementType> = {
  aries: 'Fire',
  taurus: 'Earth',
  gemini: 'Air',
  cancer: 'Water',
  leo: 'Fire',
  virgo: 'Earth',
  libra: 'Air',
  scorpio: 'Water',
  sagittarius: 'Fire',
  capricorn: 'Earth',
  aquarius: 'Air',
  pisces: 'Water',
};

const SIGN_TO_MODALITY: Record<SignKey, ModalityType> = {
  aries: 'Cardinal',
  taurus: 'Fixed',
  gemini: 'Mutable',
  cancer: 'Cardinal',
  leo: 'Fixed',
  virgo: 'Mutable',
  libra: 'Cardinal',
  scorpio: 'Fixed',
  sagittarius: 'Mutable',
  capricorn: 'Cardinal',
  aquarius: 'Fixed',
  pisces: 'Mutable',
};

const ARCHETYPE_TAGLINES: Record<string, Record<string, string>> = {
  Fire: {
    Cardinal: 'Bold. Restless. Born to lead.',
    Fixed: 'Fierce loyalty. Unshakable presence.',
    Mutable: 'Visionary spark. Always evolving.',
  },
  Earth: {
    Cardinal: 'Driven builder. Quiet ambition.',
    Fixed: 'Steady roots. Deep endurance.',
    Mutable: 'Practical grace. Gentle precision.',
  },
  Air: {
    Cardinal: 'Sharp mind. Social architect.',
    Fixed: 'Original thinker. Ahead of the curve.',
    Mutable: 'Curious connector. Endless ideas.',
  },
  Water: {
    Cardinal: 'Intuitive protector. Emotional depth.',
    Fixed: 'Magnetic intensity. Transformative power.',
    Mutable: 'Empathic dreamer. Boundless compassion.',
  },
};

function normaliseKey(value?: string) {
  return (value ?? '').trim().toLowerCase();
}

function normalizeSignKey(value?: string): SignKey | undefined {
  const normalized = normaliseKey(value);
  if (!normalized) return undefined;
  return SIGN_KEYS.includes(normalized as SignKey)
    ? (normalized as SignKey)
    : undefined;
}

function elementGlyph(elementLabel?: string) {
  const key = normaliseKey(elementLabel) as keyof typeof elementAstro;
  return elementAstro[key];
}

function modalityGlyph(modalityLabel?: string) {
  const key = normaliseKey(modalityLabel) as keyof typeof modalityAstro;
  return modalityAstro[key];
}

function Badge({
  label,
  value,
  glyph,
}: {
  label: string;
  value: string;
  glyph?: string;
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '10px 14px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.16)',
        background: 'rgba(0,0,0,0.22)',
      }}
    >
      {glyph ? (
        <span
          style={{
            fontFamily: 'Astronomicon',
            fontSize: 18,
            opacity: 0.9,
            display: 'flex',
          }}
        >
          {glyph}
        </span>
      ) : null}

      <span
        style={{
          fontSize: 14,
          letterSpacing: 3,
          opacity: 0.65,
          textTransform: 'uppercase',
          display: 'flex',
        }}
      >
        {label}
      </span>

      <span style={{ fontSize: 18, opacity: 0.92, display: 'flex' }}>
        {value}
      </span>
    </div>
  );
}

function parsePlacements(raw: string | null): BirthChartData[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((p) => ({
        body: String(p?.body ?? ''),
        sign: String(p?.sign ?? ''),
        degree: Number(p?.degree ?? 0),
        minute: Number(p?.minute ?? 0),
        eclipticLongitude: Number(p?.eclipticLongitude),
        retrograde: Boolean(p?.retrograde),
        house: p?.house == null ? undefined : Number(p.house),
      }))
      .filter(
        (p) =>
          p.body &&
          Number.isFinite(p.eclipticLongitude) &&
          p.eclipticLongitude >= 0 &&
          p.eclipticLongitude < 360,
      );
  } catch {
    return [];
  }
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

function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function signFromLongitude(longitude: number): string {
  const norm = ((longitude % 360) + 360) % 360;
  return ZODIAC_SIGNS[Math.floor(norm / 30)];
}

/**
 * Time-machine helper: when a `date` param is supplied (and no inline
 * placements), pull planetary positions for that date from our v1 endpoint
 * and shape them into BirthChartData. Returns an empty array on any failure
 * so the OG renderer falls back to the generic layout.
 */
async function fetchPlacementsForDate(
  request: Request,
  dateIso: string,
): Promise<BirthChartData[]> {
  try {
    const fetchUrl = new URL(
      `/api/v1/astrology/planetary-positions?date=${encodeURIComponent(dateIso)}`,
      request.url,
    );
    const res = await fetch(fetchUrl, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = (await res.json()) as {
      ok?: boolean;
      data?: {
        planets?: Array<{
          planet: string;
          longitude: number;
          sign?: string;
          degree?: number;
          minutes?: number;
          retrograde?: boolean;
        }>;
      };
    };
    const planets = json?.data?.planets ?? [];
    return planets
      .map((p) => {
        const longitude = Number(p.longitude);
        if (!Number.isFinite(longitude)) return null;
        const sign = p.sign ?? signFromLongitude(longitude);
        return {
          body: capitalize(p.planet),
          sign,
          degree: Number(p.degree ?? Math.floor(longitude % 30)),
          minute: Number(p.minutes ?? 0),
          eclipticLongitude: ((longitude % 360) + 360) % 360,
          retrograde: Boolean(p.retrograde),
        } as BirthChartData;
      })
      .filter((p): p is BirthChartData => Boolean(p));
  } catch (err) {
    console.error('[BirthChartOG] failed to fetch positions for date', err);
    return [];
  }
}

function formatDateLabel(iso: string): string {
  // Avoid Intl edge variations; format manually as "Aug 12, 2018"
  const parts = iso.split('-');
  if (parts.length < 3) return iso;
  const [y, m, d] = parts.map((x) => Number(x));
  if (!y || !m || !d) return iso;
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const mm = months[(m - 1 + 12) % 12];
  return `${mm} ${d}, ${y}`;
}

/**
 * Top aspect blurb for time-machine OG header. Computed from placements when
 * available; falls back to undefined.
 */
function dominantAspectLabel(placements: BirthChartData[]): string | undefined {
  if (!placements.length) return undefined;
  const MAJOR = [
    { name: 'Conjunction', angle: 0, orb: 6 },
    { name: 'Opposition', angle: 180, orb: 6 },
    { name: 'Trine', angle: 120, orb: 5 },
    { name: 'Square', angle: 90, orb: 5 },
    { name: 'Sextile', angle: 60, orb: 3 },
  ];
  let best: { p1: string; p2: string; type: string; orb: number } | null = null;
  for (let i = 0; i < placements.length; i += 1) {
    for (let j = i + 1; j < placements.length; j += 1) {
      const a = placements[i];
      const b = placements[j];
      let diff = Math.abs(a.eclipticLongitude - b.eclipticLongitude);
      if (diff > 180) diff = 360 - diff;
      for (const m of MAJOR) {
        const orb = Math.abs(diff - m.angle);
        if (orb <= m.orb) {
          if (!best || orb < best.orb) {
            best = { p1: a.body, p2: b.body, type: m.name, orb };
          }
          break;
        }
      }
    }
  }
  if (!best) return undefined;
  return `${best.p1} ${best.type.toLowerCase()} ${best.p2}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') as ShareFormat) || 'square';
    const { width, height } = getFormatDimensions(format);

    const shareRecord = shareId ? await getBirthChartShare(shareId) : null;
    const name = shareRecord?.name ?? sanitize(searchParams.get('name'), 32);
    const sun =
      shareRecord?.sun ?? sanitize(searchParams.get('sun'), 16) ?? '—';
    const moon =
      shareRecord?.moon ?? sanitize(searchParams.get('moon'), 16) ?? '—';
    const rising =
      shareRecord?.rising ?? sanitize(searchParams.get('rising'), 16) ?? '—';
    const element =
      shareRecord?.element ?? sanitize(searchParams.get('element'), 16);
    const modality =
      shareRecord?.modality ?? sanitize(searchParams.get('modality'), 16);
    const insight =
      shareRecord?.insight ?? sanitize(searchParams.get('insight'), 170);

    // Time-machine extension: ?date=YYYY-MM-DD, ?event=Label, ?time, ?lat, ?lon.
    // When `date` is provided and there are no inline placements (and no
    // share record), we fetch planetary positions for that date and use those
    // as the chart placements. This preserves the default behaviour when no
    // `date` is supplied.
    const dateParam = sanitize(searchParams.get('date'), 32);
    const eventLabel = sanitize(searchParams.get('event'), 60);
    // `time`, `lat`, `lon` reserved for future precision (not used by the
    // current edge-safe positions endpoint, which only consumes ?date=).
    void searchParams.get('time');
    void searchParams.get('lat');
    void searchParams.get('lon');

    const inlinePlacements = parsePlacements(searchParams.get('placements'));
    let timeMachinePlacements: BirthChartData[] = [];
    if (
      dateParam &&
      !shareRecord &&
      inlinePlacements.length === 0 &&
      /^\d{4}-\d{2}-\d{2}/.test(dateParam)
    ) {
      timeMachinePlacements = await fetchPlacementsForDate(request, dateParam);
    }
    const birthChart =
      shareRecord?.placements ??
      (inlinePlacements.length > 0 ? inlinePlacements : timeMachinePlacements);

    const isTimeMachine =
      Boolean(dateParam) && timeMachinePlacements.length > 0;
    const dateLabel = dateParam ? formatDateLabel(dateParam) : undefined;
    const dominantAspect = isTimeMachine
      ? dominantAspectLabel(birthChart)
      : undefined;

    const theme =
      (element && gradientsByElement[element]) || gradientsByElement.default;
    const robotoMono = await loadRobotoMono(request);
    const astronomiconFont = await loadAstronomiconFont(request);

    // Format-aware sizing
    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const isSquare = format === 'square';
    const padding = isLandscape ? 40 : isStory ? 100 : 48;
    const titleSize = isLandscape ? 40 : isStory ? 80 : 62;
    const subtitleSize = isLandscape ? 15 : isStory ? 26 : 20;
    const bigThreeSize = isLandscape ? 20 : isStory ? 36 : 28;
    const bigThreeGlyphSize = isLandscape ? 24 : isStory ? 46 : 36;
    const chartSize = isLandscape ? 480 : isStory ? 800 : 420;

    const elementCounts = ELEMENT_ORDER.reduce(
      (acc, label) => {
        acc[label] = 0;
        return acc;
      },
      {} as Record<ElementType, number>,
    );

    const modalityCounts = MODALITY_ORDER.reduce(
      (acc, label) => {
        acc[label] = 0;
        return acc;
      },
      {} as Record<ModalityType, number>,
    );

    birthChart.forEach((planet) => {
      const normalizedSign = normalizeSignKey(planet.sign);

      if (normalizedSign) {
        const elementLabel = SIGN_TO_ELEMENT[normalizedSign];
        if (elementLabel) {
          elementCounts[elementLabel] += 1;
        }

        const modalityLabel = SIGN_TO_MODALITY[normalizedSign];
        if (modalityLabel) {
          modalityCounts[modalityLabel] += 1;
        }
      }
    });

    const rawInsight =
      insight ?? 'A balanced cosmic profile with diverse energies.';
    const insightText = rawInsight.replace(/\.([A-Z])/g, '. $1');

    // Compute archetype subtitle from dominant element + modality
    const dominantElement = ELEMENT_ORDER.reduce((best, label) =>
      elementCounts[label] > elementCounts[best] ? label : best,
    );
    const dominantModality = MODALITY_ORDER.reduce((best, label) =>
      modalityCounts[label] > modalityCounts[best] ? label : best,
    );
    const archetypeSubtitle = `A ${dominantModality} ${dominantElement} Chart`;
    const archetypeTagline =
      ARCHETYPE_TAGLINES[dominantElement]?.[dominantModality] ?? '';

    // Element-specific decorative gradient overlays
    const elementDecorativeGradient: Record<string, string> = {
      Fire: 'radial-gradient(ellipse at 50% 0%, rgba(251, 191, 36, 0.08) 0%, transparent 60%)',
      Earth:
        'radial-gradient(ellipse at 50% 100%, rgba(34, 197, 94, 0.08) 0%, transparent 60%)',
      Air: 'radial-gradient(ellipse at 80% 20%, rgba(147, 197, 253, 0.08) 0%, transparent 60%)',
      Water:
        'radial-gradient(ellipse at 50% 100%, rgba(99, 102, 241, 0.08) 0%, transparent 60%)',
    };
    const decorativeGradient = elementDecorativeGradient[dominantElement] ?? '';

    const bigThree = [
      { glyph: bodiesSymbols.sun, value: sun, label: 'Sun' },
      { glyph: bodiesSymbols.moon, value: moon, label: 'Moon' },
      { glyph: astroPointSymbols.ascendant, value: rising, label: 'Rising' },
    ];

    // Time-machine event banner (rendered at the top of either layout when
    // an `event` label is present, or when a `date` was supplied).
    const showEventBanner = Boolean(eventLabel || (isTimeMachine && dateLabel));
    const eventBannerJsx = showEventBanner ? (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '8px 16px',
          marginBottom: 12,
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.18)',
          background: 'rgba(0,0,0,0.35)',
          alignSelf: 'center',
          maxWidth: '92%',
        }}
      >
        <span
          style={{
            fontSize: 11,
            letterSpacing: 4,
            textTransform: 'uppercase',
            opacity: 0.7,
            display: 'flex',
          }}
        >
          The sky on
        </span>
        <span
          style={{
            display: 'flex',
            fontSize: isLandscape ? 22 : isStory ? 36 : 26,
            fontWeight: 600,
            textAlign: 'center',
            textShadow: SHARE_TITLE_GLOW,
          }}
        >
          {eventLabel ? eventLabel : dateLabel}
        </span>
        {eventLabel && dateLabel ? (
          <span
            style={{
              fontSize: 13,
              opacity: 0.7,
              display: 'flex',
            }}
          >
            {dateLabel}
          </span>
        ) : null}
        {dominantAspect ? (
          <span
            style={{
              fontSize: 12,
              opacity: 0.65,
              display: 'flex',
              fontStyle: 'italic',
              color: '#A78BFA',
            }}
          >
            {dominantAspect}
          </span>
        ) : null}
      </div>
    ) : null;

    // Generate unique starfield based on shareId
    const starfieldId = shareId || 'default-birth-chart';
    const stars = generateStarfield(starfieldId, getStarCount(format));

    // Starfield component - increased opacity for better visibility
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
          opacity: star.opacity * 0.8, // Brighter stars with reduced gradient
        }}
      />
    ));

    // Inline JSX directly based on format
    const layoutJsx = isLandscape ? (
      // Landscape Layout
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#0A0A0A',
          color: '#fff',
          padding,
          fontFamily: 'Roboto Mono',
          position: 'relative',
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: theme.background,
            display: 'flex',
          }}
        />
        {/* Unique starfield background */}
        {starfieldJsx}
        {/* Element decorative gradient */}
        {decorativeGradient && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: decorativeGradient,
              display: 'flex',
            }}
          />
        )}

        {/* Header - spans full width */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            alignItems: 'center',
            textAlign: 'center',
            position: 'relative',
            marginBottom: 20,
          }}
        >
          {eventBannerJsx}
          <div
            style={{
              display: 'flex',
              letterSpacing: 4,
              textTransform: 'uppercase',
              fontSize: subtitleSize,
              opacity: 0.6,
            }}
          >
            {showEventBanner ? 'A moment in the sky' : archetypeSubtitle}
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: titleSize,
              fontWeight: 500,
              lineHeight: 1.05,
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {showEventBanner
              ? 'The sky that day'
              : name
                ? `${name}'s birth chart`
                : 'Birth chart highlights'}
          </div>
          {!showEventBanner && archetypeTagline && (
            <div
              style={{
                display: 'flex',
                fontSize: 14,
                fontStyle: 'italic',
                color: '#A78BFA',
                marginTop: 4,
              }}
            >
              {archetypeTagline}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              gap: 16,
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: bigThreeSize,
              letterSpacing: 1,
            }}
          >
            {bigThree.map((item) => (
              <div
                key={item.label}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontFamily: 'Astronomicon',
                    fontSize: bigThreeGlyphSize,
                    opacity: 0.85,
                    display: 'flex',
                  }}
                >
                  {item.glyph}
                </span>
                <span style={{ display: 'flex' }}>{item.value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main horizontal layout: Chart on left, Stats on right */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: 24,
            flex: 1,
            position: 'relative',
            alignItems: 'flex-start',
          }}
        >
          {/* Left column: Chart */}
          <div
            style={{
              width: 480,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <ChartWheelOg
              birthChart={birthChart}
              size={chartSize}
              showTooltips={false}
            />
          </div>

          {/* Right column: Stats */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
            }}
          >
            {/* Element & Modality Badges */}
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <Badge
                label='Element'
                value={element ?? 'Balanced'}
                glyph={elementGlyph(element)}
              />
              <Badge
                label='Modality'
                value={modality ?? 'Dynamic'}
                glyph={modalityGlyph(modality)}
              />
            </div>

            {/* Insight box - compact */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.16)',
                background: theme.soft,
                padding: '12px 14px',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: 3,
                  textTransform: 'uppercase',
                  opacity: 0.75,
                  display: 'flex',
                }}
              >
                Chart insight
              </div>
              <div
                style={{
                  fontSize: 14,
                  lineHeight: 1.3,
                  opacity: 0.95,
                  display: 'flex',
                }}
              >
                {truncateText(insightText, 100)}
              </div>
            </div>
          </div>
        </div>

        {/* Watermark */}
        <div
          style={{
            position: 'absolute',
            bottom: 14,
            left: padding,
            fontSize: 11,
            opacity: 0.3,
            letterSpacing: 1,
            display: 'flex',
          }}
        >
          lunary.app/chart
        </div>

        {/* Branded Footer */}
        <ShareFooter format={format} />
      </div>
    ) : (
      // Square/Story Layout
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
        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: theme.background,
            display: 'flex',
          }}
        />

        {/* Unique starfield background */}
        {starfieldJsx}
        {/* Element decorative gradient */}
        {decorativeGradient && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: decorativeGradient,
              display: 'flex',
            }}
          />
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '100%',
            maxWidth: 960,
            gap: isStory ? 48 : isSquare ? 20 : 40,
            alignItems: 'center',
            position: 'relative',
            flex: 1,
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            {eventBannerJsx}
            <div
              style={{
                display: 'flex',
                letterSpacing: 4,
                textTransform: 'uppercase',
                fontSize: subtitleSize,
                opacity: 0.6,
              }}
            >
              {showEventBanner ? 'A moment in the sky' : archetypeSubtitle}
            </div>
            <div
              style={{
                display: 'flex',
                fontSize: titleSize,
                fontWeight: 500,
                lineHeight: 1.05,
                textShadow: SHARE_TITLE_GLOW,
              }}
            >
              {showEventBanner
                ? 'The sky that day'
                : name
                  ? `${name}'s birth chart`
                  : 'Birth chart highlights'}
            </div>
            {!showEventBanner && archetypeTagline && (
              <div
                style={{
                  display: 'flex',
                  fontSize: isStory ? 24 : 18,
                  fontStyle: 'italic',
                  color: '#A78BFA',
                  marginTop: 4,
                }}
              >
                {archetypeTagline}
              </div>
            )}
            <div
              style={{
                display: 'flex',
                gap: isLandscape ? 16 : 24,
                flexWrap: 'wrap',
                justifyContent: 'center',
                fontSize: bigThreeSize,
                letterSpacing: 1,
              }}
            >
              {bigThree.map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Astronomicon',
                      fontSize: bigThreeGlyphSize,
                      opacity: 0.85,
                      display: 'flex',
                    }}
                  >
                    {item.glyph}
                  </span>
                  <span style={{ display: 'flex' }}>{item.value || '—'}</span>
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              width: '100%',
              padding: 4,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <ChartWheelOg
              birthChart={birthChart}
              size={chartSize}
              showTooltips={false}
            />
          </div>

          <div
            style={{
              width: '100%',
              maxWidth: 820,
              display: 'flex',
              flexDirection: 'column',
              gap: isSquare ? 16 : 24,
              alignItems: 'stretch',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 18,
                flexWrap: 'wrap',
                justifyContent: 'center',
              }}
            >
              <Badge
                label='Element'
                value={element ?? 'Balanced'}
                glyph={elementGlyph(element)}
              />
              <Badge
                label='Modality'
                value={modality ?? 'Dynamic'}
                glyph={modalityGlyph(modality)}
              />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.16)',
                background: theme.soft,
                padding: '20px 22px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  gap: 6,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    letterSpacing: 4,
                    textTransform: 'uppercase',
                    opacity: 0.75,
                    display: 'flex',
                  }}
                >
                  Chart insight
                </span>
              </div>
              <div
                style={{
                  fontSize: 24,
                  lineHeight: 1.4,
                  opacity: 0.95,
                  display: 'flex',
                }}
              >
                {isSquare ? truncateText(insightText, 120) : insightText}
              </div>
            </div>
          </div>
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
          lunary.app/chart
        </div>

        {/* Branded Footer */}
        <ShareFooter format={format} />
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts: [
        { name: 'Roboto Mono', data: robotoMono, style: 'normal' },
        { name: 'Astronomicon', data: astronomiconFont, style: 'normal' },
      ],
    });
  } catch (error) {
    console.error('[BirthChartOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
