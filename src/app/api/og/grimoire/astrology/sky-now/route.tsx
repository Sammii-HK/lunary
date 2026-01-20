import { ChartWheelOg } from '@/app/birth-chart/chart-wheel-og';
import {
  getGlobalCosmicData,
  buildGlobalCosmicData,
} from '@/lib/cosmic-snapshot/global-cache';
import { loadGoogleFont } from '../../../../../../../utils/astrology/cosmic-og';
import type { BirthChartData } from '../../../../../../../utils/astrology/birthChart';
import { formatDegree } from '../../../../../../../utils/astrology/astrology';
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';
export const revalidate = 60;

const WIDTH = 1200;
const HEIGHT = 630;
const HIGHLIGHT_COUNT = 3;

let astronomiconPromise: Promise<ArrayBuffer> | null = null;

const loadAstronomiconFont = async (request: Request) => {
  if (!astronomiconPromise) {
    const fontUrl = new URL('/fonts/Astronomicon.ttf', request.url);
    astronomiconPromise = fetch(fontUrl, { cache: 'force-cache' }).then(
      (res) => {
        if (!res.ok) {
          throw new Error(`Astronomicon font fetch failed: ${res.status}`);
        }
        return res.arrayBuffer();
      },
    );
  }
  return astronomiconPromise;
};

export async function GET(request: NextRequest) {
  const dateParam = request.nextUrl.searchParams.get('date');
  const date = dateParam ? new Date(dateParam) : new Date();

  let cosmicData = await getGlobalCosmicData(date);
  if (!cosmicData) {
    cosmicData = await buildGlobalCosmicData(date);
  }

  const chartData: BirthChartData[] = Object.keys(
    cosmicData.planetaryPositions,
  ).map((body) => {
    const placement = cosmicData.planetaryPositions[body];
    const formatted = formatDegree(placement.longitude);
    return {
      body,
      sign: placement.sign,
      degree: formatted.degree,
      minute: formatted.minute,
      eclipticLongitude: placement.longitude,
      retrograde: placement.retrograde,
    };
  });

  const headingDate = new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date);

  const highlights = cosmicData.generalTransits
    .slice(0, HIGHLIGHT_COUNT)
    .map((transit) => ({
      label: transit.name,
      detail: transit.energy,
    }));

  const robotoFont = await loadGoogleFont(request).catch(() => null);
  const astronomiconFont = await loadAstronomiconFont(request).catch(
    () => null,
  );

  const fonts: Array<{
    name: string;
    data: ArrayBuffer;
    style: 'normal';
    weight: 400;
  }> = [];
  if (robotoFont) {
    fonts.push({
      name: 'Roboto Mono',
      data: robotoFont,
      style: 'normal',
      weight: 400,
    });
  }
  if (astronomiconFont) {
    fonts.push({
      name: 'Astronomicon',
      data: astronomiconFont,
      style: 'normal',
      weight: 400,
    });
  }

  return new ImageResponse(
    <div
      style={{
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        background:
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08), transparent 200px), linear-gradient(180deg, #040509 0%, #0b0f18 60%, #0e141f 100%)',
        display: 'flex',
        flexDirection: 'column',
        color: '#fff',
        fontFamily: 'Roboto Mono, system-ui, sans-serif',
      }}
    >
      <div
        style={{
          padding: '56px 72px 24px',
          fontSize: '36px',
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '18px',
            letterSpacing: '0.6em',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          Sky Now
        </span>
        <span>Transit Chart Snapshot</span>
        <span
          style={{
            fontSize: '14px',
            letterSpacing: '0.45em',
            color: 'rgba(255,255,255,0.6)',
          }}
        >
          {headingDate}
        </span>
      </div>
      <div
        style={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ChartWheelOg birthChart={chartData} size={420} />
      </div>
      <div
        style={{
          padding: '24px 72px 48px',
          display: 'flex',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        {highlights.map((highlight) => (
          <div
            key={highlight.label}
            style={{
              flex: '1 1 240px',
              minWidth: '220px',
              padding: '14px 18px',
              borderRadius: '18px',
              border: '1px solid rgba(255,255,255,0.2)',
              background: 'rgba(15,15,20,0.8)',
              fontSize: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <span
              style={{
                textTransform: 'uppercase',
                letterSpacing: '0.3em',
                fontSize: '10px',
                color: 'rgba(255,255,255,0.6)',
              }}
            >
              Transit Highlight
            </span>
            <span
              style={{ fontSize: '18px', fontFamily: 'Astronomicon, serif' }}
            >
              {highlight.label}
            </span>
            <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
              {highlight.detail}
            </span>
          </div>
        ))}
      </div>
    </div>,
    {
      width: WIDTH,
      height: HEIGHT,
      fonts,
    },
  );
}
