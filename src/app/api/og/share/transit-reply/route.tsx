import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import type React from 'react';
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

function cssPoint(
  point: { x: number; y: number },
  size: number,
): { left: number; top: number } {
  const scale = size / 280;
  return {
    left: size / 2 + point.x * scale,
    top: size / 2 + point.y * scale,
  };
}

function WheelGlyph({
  point,
  size,
  children,
  color,
  fontSize,
  background,
}: {
  point: { x: number; y: number };
  size: number;
  children: React.ReactNode;
  color: string;
  fontSize: number;
  background?: string;
}) {
  const position = cssPoint(point, size);
  const boxSize = fontSize + 8;
  return (
    <div
      style={{
        position: 'absolute',
        left: position.left - boxSize / 2,
        top: position.top - boxSize / 2,
        width: boxSize,
        height: boxSize,
        borderRadius: boxSize,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
        fontFamily: 'Astronomicon',
        fontSize,
        lineHeight: 1,
        background: background || 'transparent',
        textShadow: '0 0 3px #060810, 0 0 6px #060810',
      }}
    >
      {children}
    </div>
  );
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
    <div
      style={{
        position: 'relative',
        display: 'flex',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox='-140 -140 280 280'
        style={{ position: 'absolute', inset: 0, display: 'flex' }}
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
      </svg>

      {zodiacSigns.map((sign, index) => {
        const position = polar(index * 30 + 15, ascendantLongitude, 116);
        const color = ELEMENT_COLORS[SIGN_ELEMENTS[sign]];
        return (
          <WheelGlyph
            key={sign}
            point={position}
            size={size}
            color={color}
            fontSize={11}
          >
            {signGlyph(sign)}
          </WheelGlyph>
        );
      })}

      {natalBodies.map((placement) => {
        const position = polar(
          placement.eclipticLongitude,
          ascendantLongitude,
          76,
        );
        return (
          <WheelGlyph
            key={`natal-${placement.body}`}
            point={position}
            size={size}
            color='rgba(255,255,255,0.72)'
            fontSize={placement.body === 'Ascendant' ? 9 : 10}
          >
            {symbolFor(placement.body)}
          </WheelGlyph>
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
            <WheelGlyph
              key={`transit-${placement.body}`}
              point={position}
              size={size}
              color='#fff'
              fontSize={12}
              background={`${color}2e`}
            >
              {symbolFor(placement.body)}
            </WheelGlyph>
          );
        })}

      <div
        style={{
          position: 'absolute',
          left: size / 2 - 48,
          top: size / 2 - 16,
          width: 96,
          display: 'flex',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.48)',
          fontSize: 8,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        Natal
      </div>
      <div
        style={{
          position: 'absolute',
          left: size / 2 - 58,
          top: size / 2 + 2,
          width: 116,
          display: 'flex',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.68)',
          fontSize: 8,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
        }}
      >
        Live transits
      </div>
    </div>
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
        flex: 1,
        overflow: 'hidden',
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
        {transit.aspect} - {transit.orb.toFixed(1)}°
      </span>
      <span style={{ display: 'flex', fontSize: 19, color: '#fff' }}>
        {truncateText(
          `${transit.transitPlanet} ${transit.aspect.toLowerCase()} ${transit.natalPlanet}`,
          30,
        )}
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
          ? `${transit.house}H - ${truncateText(transit.houseTheme || '', 54)}`
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
        flex: 1,
        overflow: 'hidden',
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
        {placement.body} - {placement.sign}
      </span>
      <span style={{ display: 'flex', fontSize: 19, color: '#fff' }}>
        {truncateText(`${placement.body} in ${placement.sign}`, 32)}
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
          ? `${placement.house}H - ${truncateText(placement.houseTheme || '', 54)}`
          : `${placement.degree}° ${placement.sign}`}
      </span>
    </div>
  );
}

function transitMarkerPosition(transit: TransitReplyAspect) {
  const maxOrb =
    transit.aspect === 'Sextile' ? 4 : transit.aspect === 'Trine' ? 5 : 7;
  const exactness = Math.max(0, Math.min(1, 1 - transit.orb / maxOrb));
  return 12 + exactness * 76;
}

function TransitTimelineOg({
  transits,
  isStory,
}: {
  transits: TransitReplyAspect[];
  isStory: boolean;
}) {
  const markers = transits.slice(0, 3);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        padding: '12px 16px 14px',
        borderRadius: 999,
        border: '1px solid rgba(255,255,255,0.13)',
        background: 'rgba(255,255,255,0.045)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
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
          Active contacts
        </span>
        <span
          style={{
            display: 'flex',
            fontSize: isStory ? 20 : 12,
            color: 'rgba(255,255,255,0.72)',
          }}
        >
          wider orb - exact hit
        </span>
      </div>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          height: 18,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 8,
            display: 'flex',
            height: 3,
            borderRadius: 999,
            background:
              'linear-gradient(90deg, rgba(199,125,255,0.55) 0%, rgba(148,209,255,0.75) 52%, rgba(123,255,184,0.92) 100%)',
          }}
        />
        {markers.map((transit) => {
          const color = ASPECT_COLORS[transit.aspect] || '#C77DFF';
          return (
            <div
              key={`${transit.transitPlanet}-${transit.natalPlanet}-${transit.aspect}-marker`}
              style={{
                position: 'absolute',
                left: `${transitMarkerPosition(transit)}%`,
                top: 2,
                width: 13,
                height: 13,
                borderRadius: 999,
                border: '2px solid #05060d',
                background: color,
                boxShadow: `0 0 14px ${color}88`,
              }}
            />
          );
        })}
      </div>
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
    const wheelSize = isBirthChart
      ? isStory
        ? 500
        : isLandscape
          ? 330
          : 420
      : isStory
        ? 600
        : isLandscape
          ? 390
          : 500;
    const stars = generateStarfield(record.shareId, getStarCount(format));
    const firstTransit = transits[0];
    const firstPlacement = placements[0];
    const title = isBirthChart
      ? 'Chart highlights'
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
                  ? 'Supplied chart snapshot'
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
                {isBirthChart
                  ? 'A preview of the full interpretation'
                  : dateText}
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
                {truncateText(
                  record.analysis.summary,
                  isStory ? 260 : isBirthChart ? 150 : 180,
                )}
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
          {!isBirthChart && (
            <TransitTimelineOg transits={transits} isStory={isStory} />
          )}
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
