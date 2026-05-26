import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  bodiesSymbols,
  zodiacSymbol,
  astroPointSymbols,
} from '@/constants/symbols';
import { ChartWheelOg } from '@/app/birth-chart/chart-wheel-og';
import {
  getTransitReplyShare,
  isChartReplyAnalysis,
  isTransitReplyAnalysis,
} from '@/lib/share/transit-reply';
import {
  getFormatDimensions,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import {
  loadShareFonts,
  ShareFooter,
  truncateText,
} from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';
import type { BirthChartData } from '@utils/astrology/birthChart';
import type {
  ChartReplyAnalysis,
  TransitReplyAspect,
} from '@/lib/transit-reply/analysis';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const SIGN_ELEMENTS: Record<string, 'Fire' | 'Earth' | 'Air' | 'Water'> = {
  Aries: 'Fire',
  Taurus: 'Earth',
  Gemini: 'Air',
  Cancer: 'Water',
  Leo: 'Fire',
  Virgo: 'Earth',
  Libra: 'Air',
  Scorpio: 'Water',
  Sagittarius: 'Fire',
  Capricorn: 'Earth',
  Aquarius: 'Air',
  Pisces: 'Water',
};

const ELEMENT_COLORS = {
  Fire: '#ff8b6b',
  Earth: '#7ee2a8',
  Air: '#8fc7ff',
  Water: '#c59bff',
};

const ASPECT_COLORS: Record<string, string> = {
  Conjunction: '#C77DFF',
  Opposition: '#ffd6a3',
  Square: '#fb7185',
  Trine: '#7BFFB8',
  Sextile: '#94d1ff',
};

const MAIN_BODIES = new Set([
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
  'Descendant',
  'Midheaven',
  'Imum Coeli',
]);

function normaliseDegrees(value: number) {
  return ((value % 360) + 360) % 360;
}

function symbolFor(body: string) {
  const key = body
    .toLowerCase()
    .replace(/[\s-]+/g, '') as keyof typeof bodiesSymbols;
  const pointKey = body
    .toLowerCase()
    .replace(/[\s-]+/g, '') as keyof typeof astroPointSymbols;
  return bodiesSymbols[key] || astroPointSymbols[pointKey] || body.charAt(0);
}

function signGlyph(sign: string) {
  const key = sign.toLowerCase() as keyof typeof zodiacSymbol;
  return zodiacSymbol[key] || sign.charAt(0);
}

function polar(longitude: number, ascendantLongitude: number, radius: number) {
  const adjusted =
    (normaliseDegrees(longitude) - ascendantLongitude + 360) % 360;
  const angle = (180 + adjusted) % 360;
  const radian = (angle * Math.PI) / 180;
  return {
    x: Math.cos(radian) * radius,
    y: Math.sin(radian) * radius,
  };
}

function TransitBiWheelOg({
  birthChart,
  currentSky,
  transits,
  size,
}: {
  birthChart: BirthChartData[];
  currentSky: BirthChartData[];
  transits: TransitReplyAspect[];
  size: number;
}) {
  const ascendant = birthChart.find((p) => p.body === 'Ascendant');
  const ascendantLongitude = ascendant?.eclipticLongitude ?? 0;
  const natalBodies = birthChart.filter((p) => MAIN_BODIES.has(p.body));
  const transitLookup = new Map(currentSky.map((p) => [p.body, p]));
  const natalLookup = new Map(birthChart.map((p) => [p.body, p]));
  const zodiacSigns = [
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

  return (
    <svg
      width={size}
      height={size}
      viewBox='-140 -140 280 280'
      style={{ display: 'flex' }}
    >
      <circle cx='0' cy='0' r='132' fill='rgba(6,8,16,0.92)' />
      <circle
        cx='0'
        cy='0'
        r='130'
        fill='none'
        stroke='rgba(255,255,255,0.34)'
        strokeWidth='0.8'
      />
      <circle
        cx='0'
        cy='0'
        r='94'
        fill='none'
        stroke='rgba(255,255,255,0.22)'
        strokeWidth='0.65'
      />
      <circle
        cx='0'
        cy='0'
        r='60'
        fill='none'
        stroke='rgba(255,255,255,0.16)'
        strokeWidth='0.65'
      />

      {Array.from({ length: 12 }, (_, index) => {
        const start = index * 30;
        const p1 = polar(start, ascendantLongitude, 58);
        const p2 = polar(start, ascendantLongitude, 130);
        return (
          <line
            key={`divider-${index}`}
            x1={p1.x}
            y1={p1.y}
            x2={p2.x}
            y2={p2.y}
            stroke='rgba(255,255,255,0.2)'
            strokeWidth='0.45'
          />
        );
      })}

      {zodiacSigns.map((sign, index) => {
        const position = polar(index * 30 + 15, ascendantLongitude, 116);
        const color = ELEMENT_COLORS[SIGN_ELEMENTS[sign]];
        return (
          <text
            key={sign}
            x={position.x}
            y={position.y}
            textAnchor='middle'
            dominantBaseline='central'
            fontFamily='Astronomicon'
            fontSize='11'
            fill={color}
            stroke='#060810'
            strokeWidth='0.5'
            paintOrder='stroke fill'
          >
            {signGlyph(sign)}
          </text>
        );
      })}

      {transits.slice(0, 6).map((transit) => {
        const skyPlacement = transitLookup.get(transit.transitPlanet);
        const natalPlacement = natalLookup.get(transit.natalPlanet);
        if (!skyPlacement || !natalPlacement) return null;
        const outer = polar(
          skyPlacement.eclipticLongitude,
          ascendantLongitude,
          105,
        );
        const inner = polar(
          natalPlacement.eclipticLongitude,
          ascendantLongitude,
          76,
        );
        const color = ASPECT_COLORS[transit.aspect] || '#C77DFF';
        return (
          <line
            key={`${transit.transitPlanet}-${transit.natalPlanet}-${transit.aspect}`}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke={color}
            strokeWidth={transit.orb <= 1 ? 1.4 : 0.9}
            opacity={transit.orb <= 1 ? 0.76 : 0.48}
            strokeLinecap='round'
          />
        );
      })}

      {natalBodies.map((placement) => {
        const position = polar(
          placement.eclipticLongitude,
          ascendantLongitude,
          76,
        );
        return (
          <text
            key={`natal-${placement.body}`}
            x={position.x}
            y={position.y}
            textAnchor='middle'
            dominantBaseline='central'
            fontFamily='Astronomicon'
            fontSize={placement.body === 'Ascendant' ? '9' : '10'}
            fill='rgba(255,255,255,0.72)'
            stroke='#060810'
            strokeWidth='0.65'
            paintOrder='stroke fill'
          >
            {symbolFor(placement.body)}
          </text>
        );
      })}

      {currentSky
        .filter((placement) => MAIN_BODIES.has(placement.body))
        .map((placement) => {
          const position = polar(
            placement.eclipticLongitude,
            ascendantLongitude,
            105,
          );
          const color = ELEMENT_COLORS[SIGN_ELEMENTS[placement.sign]] || '#fff';
          return (
            <g key={`transit-${placement.body}`}>
              <circle
                cx={position.x}
                cy={position.y}
                r='5.8'
                fill={color}
                opacity='0.18'
              />
              <text
                x={position.x}
                y={position.y}
                textAnchor='middle'
                dominantBaseline='central'
                fontFamily='Astronomicon'
                fontSize='12'
                fill='#fff'
                stroke='#060810'
                strokeWidth='0.72'
                paintOrder='stroke fill'
              >
                {symbolFor(placement.body)}
              </text>
            </g>
          );
        })}

      <text
        x='0'
        y='-6'
        textAnchor='middle'
        fontSize='8'
        fill='rgba(255,255,255,0.48)'
        letterSpacing='0.18em'
      >
        NATAL
      </text>
      <text
        x='0'
        y='8'
        textAnchor='middle'
        fontSize='8'
        fill='rgba(255,255,255,0.68)'
        letterSpacing='0.18em'
      >
        LIVE TRANSITS
      </text>
    </svg>
  );
}

function FactPill({ transit }: { transit: TransitReplyAspect }) {
  const color = ASPECT_COLORS[transit.aspect] || '#C77DFF';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        padding: '12px 14px',
        borderRadius: 18,
        border: `1px solid ${color}66`,
        background: `${color}16`,
        minWidth: 0,
      }}
    >
      <span
        style={{
          display: 'flex',
          color,
          fontSize: 13,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        {transit.aspect} · {transit.orb.toFixed(1)}°
      </span>
      <span style={{ display: 'flex', fontSize: 19, color: '#fff' }}>
        {transit.transitPlanet} {transit.aspectGlyph} {transit.natalPlanet}
      </span>
      <span
        style={{
          display: 'flex',
          fontSize: 12,
          color: 'rgba(255,255,255,0.66)',
          lineHeight: 1.35,
        }}
      >
        {transit.house
          ? `${transit.house}H · ${truncateText(transit.houseTheme || '', 54)}`
          : `${transit.transitSign} to ${transit.natalSign}`}
      </span>
    </div>
  );
}

function PlacementFactPill({
  placement,
}: {
  placement: ChartReplyAnalysis['placements'][number];
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
        padding: '12px 14px',
        borderRadius: 18,
        border: '1px solid rgba(199,125,255,0.42)',
        background: 'rgba(199,125,255,0.12)',
        minWidth: 0,
      }}
    >
      <span
        style={{
          display: 'flex',
          color: '#C77DFF',
          fontSize: 13,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        {placement.body} · {placement.sign}
      </span>
      <span style={{ display: 'flex', fontSize: 19, color: '#fff' }}>
        {placement.body} in {placement.sign}
      </span>
      <span
        style={{
          display: 'flex',
          fontSize: 12,
          color: 'rgba(255,255,255,0.66)',
          lineHeight: 1.35,
        }}
      >
        {placement.house
          ? `${placement.house}H · ${truncateText(placement.houseTheme || '', 54)}`
          : `${placement.degree}° ${placement.sign}`}
      </span>
    </div>
  );
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'landscape') as ShareFormat;

    const record = await getTransitReplyShare(shareId || undefined);
    if (!record) return new Response('Share not found', { status: 404 });

    const isBirthChart = record.mode === 'birth-chart';
    const transitAnalysis = isTransitReplyAnalysis(record.analysis)
      ? record.analysis
      : null;
    const chartAnalysis = isChartReplyAnalysis(record.analysis)
      ? record.analysis
      : null;
    const transits = transitAnalysis?.transits || [];
    const placements = chartAnalysis?.placements || [];
    const { width, height } = getFormatDimensions(format);
    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isStory ? 74 : isLandscape ? 48 : 56;
    const wheelSize = isStory ? 600 : isLandscape ? 390 : 500;
    const stars = generateStarfield(record.shareId, getStarCount(format));
    const firstTransit = transits[0];
    const firstPlacement = placements[0];
    const title = isBirthChart
      ? firstPlacement
        ? `${firstPlacement.body} in ${firstPlacement.sign}`
        : 'Birth chart read'
      : firstTransit
        ? `${firstTransit.transitPlanet} ${firstTransit.aspect.toLowerCase()} natal ${firstTransit.natalPlanet}`
        : 'Live transit overlay';
    const dateText = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(`${record.date}T12:00:00Z`));
    const fonts = await loadShareFonts(request, { includeAstronomicon: true });

    return new ImageResponse(
      <div
        style={{
          width,
          height,
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 18% 18%, rgba(199,125,255,0.18), transparent 260px), radial-gradient(circle at 88% 78%, rgba(148,209,255,0.16), transparent 280px), linear-gradient(135deg, #05060d 0%, #111727 52%, #071016 100%)',
          color: '#fff',
          fontFamily: 'Roboto Mono, system-ui, sans-serif',
          padding,
        }}
      >
        {stars.map((star, index) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: star.size,
              height: star.size,
              borderRadius: '50%',
              background: '#fff',
              opacity: star.opacity,
            }}
          />
        ))}

        <div
          style={{
            position: 'absolute',
            right: isStory ? 52 : 42,
            top: isStory ? 48 : 34,
            display: 'flex',
            color: 'rgba(255,255,255,0.22)',
            fontSize: isStory ? 30 : 22,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          Lunary
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flex: 1,
            flexDirection: isLandscape ? 'row' : 'column',
            gap: isLandscape ? 38 : 26,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexShrink: 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {isBirthChart ? (
              <ChartWheelOg
                birthChart={record.birthChart}
                houses={record.houseCusps}
                size={wheelSize}
                showTooltips={false}
                houseSystem='placidus'
              />
            ) : (
              <TransitBiWheelOg
                birthChart={record.birthChart}
                currentSky={transitAnalysis?.currentSky || []}
                transits={transits}
                size={wheelSize}
              />
            )}
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: isStory ? 26 : 18,
              flex: 1,
              minWidth: 0,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span
                style={{
                  display: 'flex',
                  fontSize: isStory ? 24 : 15,
                  letterSpacing: '0.32em',
                  textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.58)',
                }}
              >
                {isBirthChart
                  ? 'Birth chart read from supplied chart'
                  : 'Current transits over natal chart'}
              </span>
              <span
                style={{
                  display: 'flex',
                  fontSize: isStory ? 62 : isLandscape ? 42 : 48,
                  lineHeight: 1.03,
                  textShadow: '0 0 22px rgba(199,125,255,0.28)',
                }}
              >
                {truncateText(title, isStory ? 72 : 54)}
              </span>
              <span
                style={{
                  display: 'flex',
                  fontSize: isStory ? 24 : 16,
                  color: 'rgba(255,255,255,0.7)',
                }}
              >
                {dateText}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                padding: isStory ? 24 : 18,
                borderRadius: 24,
                border: '1px solid rgba(255,255,255,0.13)',
                background: 'rgba(0,0,0,0.22)',
              }}
            >
              <span
                style={{
                  display: 'flex',
                  fontSize: isStory ? 30 : 19,
                  lineHeight: 1.42,
                  color: 'rgba(255,255,255,0.9)',
                }}
              >
                {truncateText(record.analysis.summary, isStory ? 260 : 180)}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 12,
                flexDirection: isStory ? 'column' : 'row',
              }}
            >
              {isBirthChart
                ? placements
                    .slice(0, isStory ? 3 : 2)
                    .map((placement) => (
                      <PlacementFactPill
                        key={`${placement.body}-${placement.sign}-${placement.house || 'sign'}`}
                        placement={placement}
                      />
                    ))
                : transits
                    .slice(0, isStory ? 3 : 2)
                    .map((t) => (
                      <FactPill
                        key={`${t.transitPlanet}-${t.natalPlanet}-${t.aspect}`}
                        transit={t}
                      />
                    ))}
            </div>
          </div>
        </div>

        <div
          style={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            paddingTop: isStory ? 26 : 10,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              borderRadius: 999,
              border: '1px solid rgba(255,255,255,0.13)',
              background: 'rgba(255,255,255,0.045)',
            }}
          >
            <span
              style={{
                display: 'flex',
                fontSize: isStory ? 20 : 12,
                color: 'rgba(255,255,255,0.55)',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}
            >
              Timeline
            </span>
            <div
              style={{
                display: 'flex',
                height: 3,
                flex: 1,
                borderRadius: 999,
                background:
                  'linear-gradient(90deg, #C77DFF 0%, #94d1ff 52%, #7BFFB8 100%)',
              }}
            />
            <span
              style={{
                display: 'flex',
                fontSize: isStory ? 20 : 12,
                color: 'rgba(255,255,255,0.72)',
              }}
            >
              {isBirthChart
                ? 'free report · save chart · track transits'
                : 'now · exact-hit window · next layer'}
            </span>
          </div>
          <ShareFooter format={format} />
        </div>
      </div>,
      {
        width,
        height,
        fonts,
      },
    );
  } catch (error) {
    console.error('[TransitReplyOG] failed', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
