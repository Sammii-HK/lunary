import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { kvGet } from '@/lib/cloudflare/kv';
import { getFormatDimensions, OG_COLORS } from '@/lib/share/og-utils';
import type { ShareFormat } from '@/hooks/useShareModal';

export const runtime = 'edge';

interface NumerologyShareRecord {
  shareId: string;
  name?: string;
  birthDate?: string;
  lifePath: number;
  soulUrge: number;
  expression: number;
  lifePathMeaning: string;
  soulUrgeMeaning: string;
  expressionMeaning: string;
  createdAt: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('shareId');
    const format = (searchParams.get('format') || 'square') as ShareFormat;

    if (!shareId) {
      return new Response('Missing shareId', { status: 400 });
    }

    // Fetch share data from KV
    const raw = await kvGet(`numerology:${shareId}`);
    if (!raw) {
      return new Response('Share not found', { status: 404 });
    }

    const data = JSON.parse(raw) as NumerologyShareRecord;
    const { width, height } = getFormatDimensions(format);
    const firstName = data.name?.trim().split(' ')[0] || '';
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

    const isLandscape = format === 'landscape';
    const padding = isLandscape ? 40 : 60;
    const titleSize = isLandscape ? 42 : 52;
    const numberSize = isLandscape ? 64 : 80;
    const labelSize = isLandscape ? 18 : 22;
    const meaningSize = isLandscape ? 16 : 18;

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
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: isLandscape ? 24 : 32,
          }}
        >
          <div
            style={{
              fontSize: titleSize,
              fontWeight: 400,
              color: OG_COLORS.textPrimary,
              letterSpacing: '0.05em',
              textAlign: 'center',
            }}
          >
            {firstName ? `${firstName}'s Numerology` : 'My Numerology'}
          </div>
          {data.birthDate && (
            <div
              style={{
                fontSize: labelSize,
                color: OG_COLORS.textTertiary,
                marginTop: 8,
                letterSpacing: '0.1em',
              }}
            >
              {new Date(data.birthDate).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </div>
          )}
        </div>

        {/* Numbers Grid */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isLandscape ? 16 : 24,
            flex: 1,
          }}
        >
          {/* Life Path */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: isLandscape ? 16 : 24,
              background: OG_COLORS.cardBg,
              border: `1px solid ${OG_COLORS.border}`,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: numberSize,
                  fontWeight: 400,
                  color: OG_COLORS.primaryViolet,
                }}
              >
                {data.lifePath}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: labelSize,
                    color: OG_COLORS.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 300,
                  }}
                >
                  Life Path
                </div>
                <div
                  style={{
                    fontSize: meaningSize,
                    color: OG_COLORS.textTertiary,
                    marginTop: 4,
                  }}
                >
                  {data.lifePathMeaning}
                </div>
              </div>
            </div>
          </div>

          {/* Soul Urge */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: isLandscape ? 16 : 24,
              background: OG_COLORS.cardBg,
              border: `1px solid ${OG_COLORS.border}`,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: numberSize,
                  fontWeight: 400,
                  color: OG_COLORS.cosmicRose,
                }}
              >
                {data.soulUrge}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: labelSize,
                    color: OG_COLORS.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 300,
                  }}
                >
                  Soul Urge
                </div>
                <div
                  style={{
                    fontSize: meaningSize,
                    color: OG_COLORS.textTertiary,
                    marginTop: 4,
                  }}
                >
                  {data.soulUrgeMeaning}
                </div>
              </div>
            </div>
          </div>

          {/* Expression */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: isLandscape ? 16 : 24,
              background: OG_COLORS.cardBg,
              border: `1px solid ${OG_COLORS.border}`,
              borderRadius: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 8,
              }}
            >
              <div
                style={{
                  fontSize: numberSize,
                  fontWeight: 400,
                  color: OG_COLORS.galaxyHaze,
                }}
              >
                {data.expression}
              </div>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    fontSize: labelSize,
                    color: OG_COLORS.textSecondary,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    fontWeight: 300,
                  }}
                >
                  Expression
                </div>
                <div
                  style={{
                    fontSize: meaningSize,
                    color: OG_COLORS.textTertiary,
                    marginTop: 4,
                  }}
                >
                  {data.expressionMeaning}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Branding */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            marginTop: isLandscape ? 20 : 32,
          }}
        >
          <img
            src={`${baseUrl}/icons/moon-phases/full-moon.svg`}
            width={22}
            height={22}
            style={{ opacity: 0.45 }}
            alt=''
          />
          <span
            style={{
              fontFamily: 'Roboto Mono',
              fontWeight: 300,
              fontSize: 16,
              opacity: 0.4,
              letterSpacing: '0.1em',
              color: OG_COLORS.textPrimary,
            }}
          >
            Discover your numerology at lunary.app
          </span>
        </div>
      </div>,
      {
        width,
        height,
      },
    );
  } catch (error) {
    console.error('[NumerologyOG] Failed to generate image:', error);
    return new Response('Failed to generate image', { status: 500 });
  }
}
