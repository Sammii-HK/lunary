import { NextRequest, NextResponse } from 'next/server';
import { loadGoogleFont } from '../../../../../../utils/astrology/cosmic-og';
import {
  OGWrapper,
  OGFooter,
  OGContentCenter,
  createOGResponse,
} from '../../../../../../utils/og/base';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 86400;

const BRAND_COLORS = {
  purple600: '#5227a5',
  purple500: '#6730cf',
  purple400: '#855ad8',
  zinc900: '#0A0A0A',
  zinc800: '#050505',
  white: '#ffffff',
};

type Format = 'square' | 'landscape' | 'portrait' | 'story';

const FORMATS: Record<Format, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

function getResponsiveSizes(format: Format) {
  const isStory = format === 'story';
  const isSquare = format === 'square';
  const isPortrait = format === 'portrait';

  return {
    titleSize: isStory ? 64 : isSquare ? 52 : isPortrait ? 48 : 44,
    subtitleSize: isStory ? 32 : isSquare ? 28 : 24,
    keyPointSize: isStory ? 24 : isSquare ? 20 : 18,
    padding: isStory ? 80 : 60,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ topic: string }> },
): Promise<Response> {
  try {
    const { topic } = await params;
    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || 'Educational Content';
    const subtitle = searchParams.get('subtitle') || '';
    const formatParam = searchParams.get('format') || 'landscape';
    const format = (formatParam as Format) || 'landscape';
    const part = searchParams.get('part');
    const label = searchParams.get('label'); // top label override
    const learnPath = searchParams.get('path'); // e.g. /developers
    const hideLearnMore = searchParams.get('hideLearnMore') === 'true';

    const dimensions = FORMATS[format] || FORMATS.landscape;
    const sizes = getResponsiveSizes(format);

    let robotoFont: ArrayBuffer | null = null;
    try {
      robotoFont = await loadGoogleFont(request);
    } catch (error) {
      console.error('Failed to load font:', error);
    }

    // Darker background for legibility (especially on bright displays)
    const background =
      'linear-gradient(135deg, #0b1220 0%, #0f172a 35%, #312e81 80%, #0b1220 100%)';

    const topLabel = label || (part ? `Part ${part}` : 'Grimoire');
    const learnMoreText = learnPath
      ? `Learn more: lunary.app${learnPath}`
      : `Learn more: lunary.app/grimoire/${topic}`;

    return createOGResponse(
      <OGWrapper theme={{ background }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingTop: '40px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: '400',
              color: 'rgba(255,255,255,0.7)',
              textAlign: 'center',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            {topLabel}
          </div>
        </div>

        <OGContentCenter>
          <div
            style={{
              fontSize: sizes.titleSize,
              fontWeight: '600',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.02em',
              display: 'flex',
              marginTop: '20px',
              maxWidth: '90%',
              textShadow: '0 2px 18px rgba(0,0,0,0.65)',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontSize: sizes.subtitleSize,
                fontWeight: '300',
                color: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                letterSpacing: '0.05em',
                display: 'flex',
                marginTop: '30px',
                maxWidth: '85%',
                textShadow: '0 2px 16px rgba(0,0,0,0.6)',
              }}
            >
              {subtitle}
            </div>
          )}
          {!hideLearnMore && (
            <div
              style={{
                fontSize: sizes.keyPointSize,
                fontWeight: '300',
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'center',
                display: 'flex',
                marginTop: '40px',
                textShadow: '0 2px 14px rgba(0,0,0,0.6)',
              }}
            >
              {learnMoreText}
            </div>
          )}
        </OGContentCenter>

        <OGFooter />
      </OGWrapper>,
      {
        size: format,
        fonts: robotoFont
          ? [
              {
                name: 'Roboto Mono',
                data: robotoFont,
                style: 'normal' as const,
              },
            ]
          : [],
      },
    );
  } catch (error) {
    console.error('Error generating educational image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}
