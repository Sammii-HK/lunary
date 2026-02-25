import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  getFormatDimensions,
  OG_COLORS,
  generateStarfield,
  getStarCount,
} from '@/lib/share/og-utils';
import {
  ShareFooter,
  getShareSizes,
  SHARE_IMAGE_BORDER,
  SHARE_TITLE_GLOW,
} from '@/lib/share/og-share-utils';
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

    const storySymbolSize = sizes.isStory ? 420 : sizes.symbolSize;

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
          border: SHARE_IMAGE_BORDER,
        }}
      >
        {starfieldJsx}

        {/* Gradient overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(135deg, rgba(132, 88, 216, 0.18) 0%, transparent 55%, rgba(199, 125, 255, 0.1) 100%)',
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: sizes.isLandscape ? 16 : 28,
          }}
        >
          {sign && (
            <div
              style={{
                fontSize: storySymbolSize,
                color: '#a78bfa',
                display: 'flex',
                opacity: 0.85,
                lineHeight: 1,
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
              textShadow: SHARE_TITLE_GLOW,
            }}
          >
            {`Join ${name}'s cosmic circle`}
          </div>

          <div
            style={{
              fontSize: sizes.bodySize,
              color: OG_COLORS.textSecondary,
              textAlign: 'center',
              maxWidth: '80%',
              display: 'flex',
              lineHeight: 1.4,
            }}
          >
            Explore astrology, tarot, and cosmic insights on Lunary
          </div>

          {/* CTA pill */}
          <div
            style={{
              display: 'flex',
              padding: sizes.isStory ? '20px 48px' : '14px 36px',
              background: 'rgba(132, 88, 216, 0.15)',
              border: '1px solid rgba(167, 139, 250, 0.45)',
              borderRadius: 100,
              marginTop: sizes.isLandscape ? 4 : 8,
            }}
          >
            <div
              style={{
                fontSize: sizes.isStory ? sizes.labelSize : sizes.bodySize - 2,
                color: '#a78bfa',
                letterSpacing: '0.08em',
                display: 'flex',
              }}
            >
              Join free on lunary.app
            </div>
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
