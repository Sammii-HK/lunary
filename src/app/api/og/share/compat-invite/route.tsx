import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
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

interface CompatInviteData {
  shareId: string;
  inviterName: string;
  inviterSign: string;
  inviterBigThree?: { sun: string; moon: string; rising: string };
}

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
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    const robotoMonoData = await loadRobotoMono(request);

    // URL params take priority
    const urlName = searchParams.get('inviterName');
    let data: CompatInviteData;

    if (urlName) {
      data = {
        shareId: 'url-params',
        inviterName: urlName,
        inviterSign: searchParams.get('inviterSign') || 'Scorpio',
        inviterBigThree: searchParams.get('sun')
          ? {
              sun: searchParams.get('sun') || '',
              moon: searchParams.get('moon') || '',
              rising: searchParams.get('rising') || '',
            }
          : undefined,
      };
    } else {
      if (!shareId) {
        return new Response('Missing shareId', { status: 400 });
      }

      const raw = await kvGet(`compat-invite:${shareId}`);
      if (!raw) {
        data = {
          shareId: 'demo',
          inviterName: 'Cosmic Explorer',
          inviterSign: 'Scorpio',
          inviterBigThree: {
            sun: 'Scorpio',
            moon: 'Cancer',
            rising: 'Leo',
          },
        };
      } else {
        data = JSON.parse(raw) as CompatInviteData;
      }
    }

    const { width, height } = getFormatDimensions(format);
    const sizes = getShareSizes(format);

    const stars = generateStarfield(data.shareId, getStarCount(format));
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

    const signSymbol = SIGN_SYMBOLS[data.inviterSign] || '\u2606';
    const bigThree = data.inviterBigThree;
    const symbolSize = sizes.isLandscape ? 100 : sizes.isStory ? 180 : 140;

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

        {/* Main content centered */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            gap: sizes.isLandscape ? 20 : 32,
          }}
        >
          {/* Sign symbol */}
          <div
            style={{
              fontSize: symbolSize,
              color: '#a78bfa',
              display: 'flex',
              opacity: 0.8,
            }}
          >
            {signSymbol}
          </div>

          {/* Inviter name */}
          <div
            style={{
              fontSize: sizes.titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: 'center',
              display: 'flex',
              lineHeight: 1.1,
            }}
          >
            {data.inviterName}
          </div>

          {/* Big Three */}
          {bigThree && (
            <div
              style={{
                display: 'flex',
                gap: sizes.isLandscape ? 24 : 32,
                justifyContent: 'center',
              }}
            >
              {[
                { label: 'Sun', sign: bigThree.sun },
                { label: 'Moon', sign: bigThree.moon },
                { label: 'Rising', sign: bigThree.rising },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: sizes.labelSize,
                      color: OG_COLORS.textTertiary,
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      display: 'flex',
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: sizes.bodySize,
                      color: '#a78bfa',
                      display: 'flex',
                    }}
                  >
                    {SIGN_SYMBOLS[item.sign] || ''} {item.sign}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginTop: sizes.isLandscape ? 12 : 24,
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: sizes.subtitleSize,
                color: OG_COLORS.textPrimary,
                textAlign: 'center',
                display: 'flex',
              }}
            >
              Check our compatibility!
            </div>
            <div
              style={{
                fontSize: sizes.labelSize,
                color: OG_COLORS.textTertiary,
                display: 'flex',
              }}
            >
              Tap to discover your cosmic connection
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
    console.error('[CompatInviteOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
