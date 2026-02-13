import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  getFormatDimensions,
  OG_COLORS,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import { ShareFooter, getShareSizes } from '@/lib/share/og-share-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

let robotoMonoPromise: Promise<ArrayBuffer> | null = null;

const loadRobotoMono = async (request: Request) => {
  if (!robotoMonoPromise) {
    const fontUrl = new URL('/fonts/RobotoMono-Regular.ttf', request.url);
    robotoMonoPromise = fetch(fontUrl, { cache: 'force-cache' }).then((res) => {
      if (!res.ok) throw new Error(`Font fetch failed: ${res.status}`);
      return res.arrayBuffer();
    });
  }
  return robotoMonoPromise;
};

const SIGN_SYMBOLS: Record<string, string> = {
  Aries: '\u2648',
  Taurus: '\u2649',
  Gemini: '\u264A',
  Cancer: '\u264B',
  Leo: '\u264C',
  Virgo: '\u264D',
  Libra: '\u264E',
  Scorpio: '\u264F',
  Sagittarius: '\u2650',
  Capricorn: '\u2651',
  Aquarius: '\u2652',
  Pisces: '\u2653',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = (searchParams.get('format') || 'square') as ShareFormat;
    const name = searchParams.get('name') || 'Cosmic Explorer';
    const sign = searchParams.get('sign') || '';

    const robotoMonoData = await loadRobotoMono(request);

    const { width, height } = getFormatDimensions(format);
    const sizes = getShareSizes(format);

    const stars = generateStarfield(`referral-${name}`, getStarCount(format));
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
          opacity: star.opacity,
        }}
      />
    ));

    const signSymbol = SIGN_SYMBOLS[sign] || '\u2606';

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: `${sizes.padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
        }}
      >
        {starfieldJsx}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: sizes.isLandscape ? 16 : 24,
          }}
        >
          {sign && (
            <div
              style={{
                fontSize: sizes.symbolSize,
                color: '#a78bfa',
                display: 'flex',
                opacity: 0.8,
              }}
            >
              {signSymbol}
            </div>
          )}

          <div
            style={{
              fontSize: sizes.titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: 'center',
              display: 'flex',
              lineHeight: 1.2,
            }}
          >
            {`Join ${name}'s cosmic circle`}
          </div>

          <div
            style={{
              fontSize: sizes.bodySize,
              color: OG_COLORS.textTertiary,
              textAlign: 'center',
              maxWidth: '80%',
              display: 'flex',
              lineHeight: 1.4,
            }}
          >
            Explore astrology, tarot, and cosmic insights on Lunary
          </div>
        </div>

        <ShareFooter format={format} />
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts: [
        {
          name: 'Roboto Mono',
          data: robotoMonoData,
          style: 'normal',
          weight: 400,
        },
      ],
    });
  } catch (error) {
    console.error('[ReferralOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
