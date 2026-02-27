import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  loadIGFonts,
  IGBrandTag,
  IGProgressDots,
  renderIGStarfield,
  renderConstellation,
  renderDepthRings,
  renderMeteors,
} from '@/lib/instagram/ig-utils';
import { IG_SIZES, CATEGORY_GRADIENT } from '@/lib/instagram/design-system';

export const runtime = 'edge';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

// Per-sign accent colours — bolder and more distinct than the generic brand accent
const SIGN_COLOURS: Record<string, string> = {
  Aries: '#E85D5D',
  Taurus: '#4CAF7D',
  Gemini: '#F0C040',
  Cancer: '#A78BFA',
  Leo: '#F59E0B',
  Virgo: '#6EE7B7',
  Libra: '#F472B6',
  Scorpio: '#C084FC',
  Sagittarius: '#FB923C',
  Capricorn: '#94A3B8',
  Aquarius: '#38BDF8',
  Pisces: '#67E8F9',
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sign = searchParams.get('sign') || 'Aries';
    const word = searchParams.get('word') || 'Fight';
    const explanation = searchParams.get('explanation') || '';
    const symbol = searchParams.get('symbol') || '♈';
    const slideIndex = parseInt(searchParams.get('slideIndex') || '1');
    const totalSlides = parseInt(searchParams.get('totalSlides') || '14');

    const accent = SIGN_COLOURS[sign] || '#8458d8';
    const gradient = CATEGORY_GRADIENT.zodiac;
    const { width, height } = IG_SIZES.portrait;

    const fonts = await loadIGFonts(request, { includeAstronomicon: true });

    const layoutJsx = (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: gradient,
          padding: '60px',
          position: 'relative',
          fontFamily: 'Roboto Mono',
          overflow: 'hidden',
        }}
      >
        {renderIGStarfield(`one-word-${sign}-${word}`)}
        {...renderMeteors(`one-word-${sign}-${word}`, accent)}
        {...renderDepthRings(accent, width, height)}
        {renderConstellation(sign, accent, width, height)}

        {/* Ghost zodiac symbol — huge backdrop, Satori-safe centering */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              fontFamily: 'Astronomicon',
              fontSize: 1400,
              color: accent,
              opacity: 0.12,
              display: 'flex',
              lineHeight: 1,
            }}
          >
            {symbol}
          </div>
        </div>

        {/* Top bar: sign name + progress + slide counter */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginBottom: 0,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                fontSize: 26,
                color: accent,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                display: 'flex',
              }}
            >
              {sign}
            </div>
            <div
              style={{
                fontSize: 22,
                color: 'rgba(255,255,255,0.35)',
                display: 'flex',
                letterSpacing: '0.05em',
              }}
            >
              {slideIndex + 1} / {totalSlides}
            </div>
          </div>
          <IGProgressDots
            current={slideIndex}
            total={totalSlides}
            accent={accent}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* THE WORD — hero element */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 0,
          }}
        >
          {/* Glow ring behind the word — rendered via the word's own textShadow */}

          <div
            style={{
              fontSize: 112,
              fontWeight: 700,
              color: accent,
              textAlign: 'center',
              letterSpacing: '-0.02em',
              lineHeight: 1,
              display: 'flex',
              textShadow: `0 0 60px ${accent}60`,
            }}
          >
            {word}
          </div>
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: 'flex' }} />

        {/* Explanation */}
        {explanation && (
          <div
            style={{
              fontSize: 34,
              color: 'rgba(255,255,255,0.65)',
              textAlign: 'center',
              lineHeight: 1.55,
              fontWeight: 400,
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              wordBreak: 'break-word',
              maxWidth: '90%',
              alignSelf: 'center',
              marginBottom: 48,
            }}
          >
            {explanation}
          </div>
        )}

        <IGBrandTag baseUrl={SHARE_BASE_URL} />
      </div>
    );

    return new ImageResponse(layoutJsx, {
      width,
      height,
      fonts,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('[IG One Word] Error:', error);
    return new Response('Failed to generate one-word image', { status: 500 });
  }
}
