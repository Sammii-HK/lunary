import { ChartWheelOg } from '@/app/birth-chart/chart-wheel-og';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { astroPointSymbols, bodiesSymbols } from '@/constants/symbols';
import {
  elementAstro,
  modalityAstro,
} from '../../../../../../utils/zodiac/zodiac';
import type { BirthChartData } from '../../../../../../utils/astrology/birthChart';

export const runtime = 'edge';
export const revalidate = 60;

const WIDTH = 1080;
const HEIGHT = 1350;

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

const gradientsByElement: Record<
  string,
  { background: string; accent: string; soft: string }
> = {
  Fire: {
    background:
      'linear-gradient(135deg, #12060a 0%, #3b0f1b 40%, #a23030 100%)',
    accent: '#ffd6a3',
    soft: 'rgba(255, 214, 163, 0.18)',
  },
  Earth: {
    background:
      'linear-gradient(135deg, #07110d 0%, #0f1f17 40%, #2d6a4f 100%)',
    accent: '#b7f4c3',
    soft: 'rgba(183, 244, 195, 0.18)',
  },
  Air: {
    background:
      'linear-gradient(135deg, #06131f 0%, #091d2c 35%, #3a6ea5 100%)',
    accent: '#c3e3ff',
    soft: 'rgba(195, 227, 255, 0.18)',
  },
  Water: {
    background:
      'linear-gradient(135deg, #07081a 0%, #0b1029 40%, #3048a2 100%)',
    accent: '#d4dfff',
    soft: 'rgba(212, 223, 255, 0.18)',
  },
  default: {
    background:
      'linear-gradient(135deg, #0a0b12 0%, #14151f 40%, #433878 100%)',
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

const SIGN_LABELS: Record<SignKey, string> = {
  aries: 'Aries',
  taurus: 'Taurus',
  gemini: 'Gemini',
  cancer: 'Cancer',
  leo: 'Leo',
  virgo: 'Virgo',
  libra: 'Libra',
  scorpio: 'Scorpio',
  sagittarius: 'Sagittarius',
  capricorn: 'Capricorn',
  aquarius: 'Aquarius',
  pisces: 'Pisces',
};

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
          style={{ fontFamily: 'Astronomicon', fontSize: 18, opacity: 0.9 }}
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
        }}
      >
        {label}
      </span>

      <span style={{ fontSize: 18, opacity: 0.92 }}>{value}</span>
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

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const name = sanitize(searchParams.get('name'), 32);
  const sun = sanitize(searchParams.get('sun'), 16) ?? '—';
  const moon = sanitize(searchParams.get('moon'), 16) ?? '—';
  const rising = sanitize(searchParams.get('rising'), 16) ?? '—';
  const element = sanitize(searchParams.get('element'), 16);
  const modality = sanitize(searchParams.get('modality'), 16);
  const insight = sanitize(searchParams.get('insight'), 170);

  const placements = parsePlacements(searchParams.get('placements'));
  const birthChart = placements;

  const theme =
    (element && gradientsByElement[element]) || gradientsByElement.default;
  const robotoMono = await loadRobotoMono(request);
  const astronomiconFont = await loadAstronomiconFont(request);

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

  const signCounts: Record<SignKey, number> = SIGN_KEYS.reduce(
    (acc, sign) => {
      acc[sign] = 0;
      return acc;
    },
    {} as Record<SignKey, number>,
  );
  const houseCounts: Record<number, number> = {};

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

      signCounts[normalizedSign] += 1;
    }

    if (
      typeof planet.house === 'number' &&
      planet.house >= 1 &&
      planet.house <= 12
    ) {
      houseCounts[planet.house] = (houseCounts[planet.house] ?? 0) + 1;
    }
  });

  const elementSummary = ELEMENT_ORDER.map((label) => ({
    label,
    count: elementCounts[label],
  }));

  const modalitySummary = MODALITY_ORDER.map((label) => ({
    label,
    count: modalityCounts[label],
  }));

  const modalityLine = modalitySummary
    .map((entry) => `${entry.label} ${entry.count}`)
    .join(' · ');

  const retrogradeCount = birthChart.filter((p) => p.retrograde).length;
  const uniqueSigns = new Set(
    birthChart
      .map((planet) => normalizeSignKey(planet.sign))
      .filter((key): key is SignKey => Boolean(key)),
  ).size;

  const sortedHouseEntries = Object.entries(houseCounts).sort(
    (a, b) => b[1] - a[1],
  );
  const primaryHouseEntry = sortedHouseEntries[0];

  const houseFocusLabel = primaryHouseEntry
    ? `House ${primaryHouseEntry[0]}`
    : 'House focus';
  const houseFocusCount = primaryHouseEntry ? primaryHouseEntry[1] : 0;

  const sortedSignEntries = Object.entries(signCounts).sort(
    (a, b) => b[1] - a[1],
  );
  const primarySignEntry = sortedSignEntries[0];
  let signFocusText = 'Sign focus shaping';
  if (primarySignEntry) {
    const primarySignKey = primarySignEntry[0] as SignKey;
    const signLabel = SIGN_LABELS[primarySignKey];
    if (signLabel) {
      signFocusText = `${signLabel} focus · ${primarySignEntry[1]} placements`;
    }
  }

  const insightText =
    insight ?? 'A balanced cosmic profile with diverse energies.';

  const bigThree = [
    { glyph: bodiesSymbols.sun, value: sun, label: 'Sun' },
    { glyph: bodiesSymbols.moon, value: moon, label: 'Moon' },
    { glyph: astroPointSymbols.ascendant, value: rising, label: 'Rising' },
  ];

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        background: theme.background,
        color: '#fff',
        padding: 64,
        fontFamily: 'Roboto Mono',
        position: 'relative',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.10) 0 1px, transparent 2px),' +
            'radial-gradient(circle at 70% 60%, rgba(255,255,255,0.08) 0 1px, transparent 2px),' +
            'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.06) 0 1px, transparent 2px)',
          opacity: 0.35,
        }}
      />

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: '100%',
          maxWidth: 960,
          minHeight: 1180,
          gap: 54,
          alignItems: 'center',
          position: 'relative',
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
          <div
            style={{
              display: 'flex',
              letterSpacing: 4,
              textTransform: 'uppercase',
              fontSize: 16,
              opacity: 0.6,
            }}
          >
            Cosmic preview
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 52,
              fontWeight: 500,
              lineHeight: 1.05,
            }}
          >
            {name ? `${name}’s birth chart` : 'Birth chart highlights'}
          </div>
          <div
            style={{
              display: 'flex',
              gap: 24,
              flexWrap: 'wrap',
              justifyContent: 'center',
              fontSize: 22,
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
                    fontSize: 28,
                    opacity: 0.85,
                  }}
                >
                  {item.glyph}
                </span>
                <span>{item.value || '—'}</span>
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
          <ChartWheelOg birthChart={birthChart} size={420} />
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: 820,
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
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
              gap: 20,
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            {elementSummary.map((entry) => (
              <div
                key={entry.label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  padding: '16px 20px',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.12)',
                  background: 'rgba(0,0,0,0.15)',
                  minWidth: 150,
                  alignItems: 'center',
                }}
              >
                <span
                  style={{
                    fontSize: 16,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    opacity: 0.6,
                  }}
                >
                  {entry.label}
                </span>
                <span
                  style={{
                    fontSize: 36,
                    fontWeight: 500,
                  }}
                >
                  {entry.count}
                </span>
                <span style={{ fontSize: 16, opacity: 0.6 }}>
                  {entry.count === 1 ? 'planet' : 'planets'}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              fontSize: 18,
              opacity: 0.78,
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: theme.accent,
                }}
              />
              <span>
                {retrogradeCount} retrograde{' '}
                {retrogradeCount === 1 ? 'planet' : 'planets'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: '#fff',
                }}
              />
              <span>
                {houseFocusCount > 0
                  ? `${houseFocusLabel} · ${houseFocusCount} placements`
                  : 'House focus charging'}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 8,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: '#7BFFB8',
                }}
              />
              <span>{uniqueSigns} unique signs activated</span>
            </div>
            <div
              style={{
                display: 'flex',
                gap: 6,
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: '#94d1ff',
                }}
              />
              <span>{signFocusText}</span>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 12,
              fontSize: 15,
              letterSpacing: 1,
              opacity: 0.78,
            }}
          >
            <span
              style={{
                fontSize: 16,
                letterSpacing: 2,
                textTransform: 'uppercase',
                justifyContent: 'center',
                opacity: 0.8,
                marginRight: 10,
              }}
            >
              Modality balance
            </span>
            <span>{modalityLine}</span>
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
              }}
            >
              {insightText}
            </div>
          </div>
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: 33,
          fontSize: 22,
          letterSpacing: 4,
          opacity: 0.45,
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        Lunary.app
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts: [
        { name: 'Roboto Mono', data: robotoMono, style: 'normal' },
        { name: 'Astronomicon', data: astronomiconFont, style: 'normal' },
      ],
    },
  );
}
