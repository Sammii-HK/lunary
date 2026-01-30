import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import { getFormatDimensions, OG_COLORS } from '@/lib/share/og-utils';
import type { ShareFormat } from '@/hooks/useShareModal';
import { zodiacSymbol } from '@/constants/symbols';

export const runtime = 'edge';

interface HoroscopeShareRecord {
  shareId: string;
  name?: string;
  sunSign: string;
  headline: string;
  overview: string;
  numerologyNumber?: number;
  transitInfo?: {
    planet: string;
    headline: string;
  };
  date: string;
  createdAt: string;
}

// Zodiac sign colors and gradients
const SIGN_GRADIENTS: Record<
  string,
  { from: string; to: string; via: string }
> = {
  Aries: { from: '#DC2626', via: '#EA580C', to: '#EAB308' },
  Taurus: { from: '#65A30D', via: '#059669', to: '#0D9488' },
  Gemini: { from: '#EAB308', via: '#F59E0B', to: '#F97316' },
  Cancer: { from: '#818CF8', via: '#A78BFA', to: '#C084FC' },
  Leo: { from: '#F59E0B', via: '#F97316', to: '#DC2626' },
  Virgo: { from: '#059669', via: '#10B981', to: '#34D399' },
  Libra: { from: '#EC4899', via: '#F472B6', to: '#FBCFE8' },
  Scorpio: { from: '#7C3AED', via: '#8B5CF6', to: '#A78BFA' },
  Sagittarius: { from: '#DC2626', via: '#EA580C', to: '#F97316' },
  Capricorn: { from: '#374151', via: '#4B5563', to: '#6B7280' },
  Aquarius: { from: '#2563EB', via: '#3B82F6', to: '#60A5FA' },
  Pisces: { from: '#06B6D4', via: '#22D3EE', to: '#67E8F9' },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    if (!shareId) {
      return new Response('Missing shareId', { status: 400 });
    }

    // Fetch share data from KV or use demo data
    const raw = await kvGet(`horoscope:${shareId}`);

    let data: HoroscopeShareRecord;

    if (!raw || shareId === 'demo') {
      // Provide demo/fallback data
      data = {
        shareId: 'demo',
        createdAt: new Date().toISOString(),
        sunSign: 'Aquarius',
        headline: 'Innovation and connection light your path',
        overview:
          'Today brings opportunities for creative breakthroughs and meaningful connections. Your unique perspective is valued.',
        numerologyNumber: 7,
        date: new Date().toISOString().split('T')[0],
      };
    } else {
      data = JSON.parse(raw) as HoroscopeShareRecord;
    }
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';

    const isLandscape = format === 'landscape';
    const isStory = format === 'story';
    const padding = isLandscape ? 40 : isStory ? 80 : 60;
    const titleSize = isLandscape ? 40 : isStory ? 72 : 52;
    const signSize = isLandscape ? 72 : isStory ? 140 : 84;
    const headlineSize = isLandscape ? 24 : isStory ? 42 : 28;
    const overviewSize = isLandscape ? 16 : isStory ? 26 : 18;
    const labelSize = isLandscape ? 14 : isStory ? 24 : 16;

    // Format date
    const date = new Date(data.date);
    const dateText = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    // Get zodiac symbol
    const getZodiacSymbol = (sign: string): string => {
      const normalizedSign = sign.toLowerCase();
      const symbols: Record<string, string> = {
        aries: zodiacSymbol.aries,
        taurus: zodiacSymbol.taurus,
        gemini: zodiacSymbol.gemini,
        cancer: zodiacSymbol.cancer,
        leo: zodiacSymbol.leo,
        virgo: zodiacSymbol.virgo,
        libra: zodiacSymbol.libra,
        scorpio: zodiacSymbol.scorpio,
        sagittarius: zodiacSymbol.sagittarius,
        capricorn: zodiacSymbol.capricorn,
        aquarius: zodiacSymbol.aquarius,
        pisces: zodiacSymbol.pisces,
      };
      return symbols[normalizedSign] || '♈';
    };

    const gradient = SIGN_GRADIENTS[data.sunSign] || SIGN_GRADIENTS.Aries;

    return new ImageResponse(
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: OG_COLORS.background,
          padding: `${padding}px`,
          position: 'relative',
          fontFamily: 'Roboto Mono',
        }}
      >
        {/* Gradient overlay for sign */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${gradient.from}15 0%, ${gradient.via}10 50%, ${gradient.to}15 100%)`,
            opacity: 0.3,
            display: 'flex',
          }}
        />

        {/* Star background pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'radial-gradient(circle at 20% 30%, rgba(255,255,255,0.08) 0 1px, transparent 2px),' +
              'radial-gradient(circle at 70% 60%, rgba(255,255,255,0.06) 0 1px, transparent 2px),' +
              'radial-gradient(circle at 50% 10%, rgba(255,255,255,0.05) 0 1px, transparent 2px)',
            opacity: 0.6,
            display: 'flex',
          }}
        />

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            height: '100%',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: isLandscape ? 20 : isStory ? 32 : 28,
            }}
          >
            <div
              style={{
                fontSize: titleSize,
                fontWeight: 400,
                color: OG_COLORS.textPrimary,
                letterSpacing: '0.05em',
                textAlign: 'center',
                display: 'flex',
              }}
            >
              {firstName ? `${firstName}'s Horoscope` : 'Your Horoscope'}
            </div>
            <div
              style={{
                fontSize: labelSize,
                color: OG_COLORS.textTertiary,
                marginTop: 8,
                display: 'flex',
              }}
            >
              {dateText}
            </div>
          </div>

          {/* Zodiac Sign Symbol */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: isLandscape ? 24 : 32,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  fontFamily: 'Astronomicon',
                  fontSize: signSize,
                  color: gradient.via,
                  display: 'flex',
                }}
              >
                {getZodiacSymbol(data.sunSign)}
              </div>
              <div
                style={{
                  fontSize: headlineSize,
                  color: OG_COLORS.textPrimary,
                  fontWeight: 500,
                  display: 'flex',
                }}
              >
                {data.sunSign}
              </div>
            </div>
          </div>

          {/* Headline */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderRadius: 20,
              padding: isLandscape ? '20px 24px' : '28px 32px',
              marginBottom: isLandscape ? 16 : 20,
            }}
          >
            <div
              style={{
                fontSize: labelSize,
                color: OG_COLORS.textSecondary,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 12,
                display: 'flex',
              }}
            >
              Today's Message
            </div>
            <div
              style={{
                fontSize: headlineSize,
                color: OG_COLORS.textPrimary,
                lineHeight: 1.4,
                display: 'flex',
              }}
            >
              {data.headline}
            </div>
          </div>

          {/* Overview */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 16,
              padding: isLandscape ? '16px 20px' : '20px 24px',
              marginBottom: isLandscape ? 12 : 16,
            }}
          >
            <div
              style={{
                fontSize: overviewSize,
                color: OG_COLORS.textSecondary,
                lineHeight: 1.6,
                display: 'flex',
              }}
            >
              {data.overview.length > 150
                ? data.overview.substring(0, 150) + '...'
                : data.overview}
            </div>
          </div>

          {/* Numerology Number (if provided) */}
          {data.numerologyNumber && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  background: `linear-gradient(135deg, ${gradient.from}20, ${gradient.to}20)`,
                  border: `1px solid ${gradient.via}40`,
                  borderRadius: 12,
                  padding: '12px 20px',
                }}
              >
                <div
                  style={{
                    fontSize: labelSize,
                    color: OG_COLORS.textSecondary,
                    display: 'flex',
                  }}
                >
                  Day Number
                </div>
                <div
                  style={{
                    fontSize: headlineSize,
                    color: gradient.via,
                    fontWeight: 600,
                    display: 'flex',
                  }}
                >
                  {data.numerologyNumber}
                </div>
              </div>
            </div>
          )}

          {/* Transit Info (if provided) */}
          {data.transitInfo && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: labelSize,
                  color: OG_COLORS.textTertiary,
                }}
              >
                <span>{data.transitInfo.planet}:</span>
                <span style={{ color: OG_COLORS.textSecondary }}>
                  {data.transitInfo.headline}
                </span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: labelSize,
                color: OG_COLORS.textTertiary,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                display: 'flex',
              }}
            >
              Lunary.app
            </div>
          </div>
        </div>
      </div>,
      {
        width,
        height,
        fonts: [
          {
            name: 'Roboto Mono',
            data: await fetch(
              new URL('/fonts/RobotoMono-Regular.ttf', request.url),
            ).then((res) => res.arrayBuffer()),
            style: 'normal',
            weight: 400,
          },
          {
            name: 'Astronomicon',
            data: await fetch(
              new URL('/fonts/Astronomicon.ttf', request.url),
            ).then((res) => res.arrayBuffer()),
            style: 'normal',
            weight: 400,
          },
        ],
      },
    );
  } catch (error) {
    console.error('[HoroscopeOG] Error:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
