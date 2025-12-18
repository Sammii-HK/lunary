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

    const dimensions = FORMATS[format] || FORMATS.landscape;
    const sizes = getResponsiveSizes(format);

    let robotoFont: ArrayBuffer | null = null;
    try {
      robotoFont = await loadGoogleFont(request);
    } catch (error) {
      console.error('Failed to load font:', error);
    }

    const background = `linear-gradient(135deg, #0f172a 0%, #1e293b 30%, ${BRAND_COLORS.purple500}40 70%, #1e1b2e 100%)`;

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
            {part ? `Part ${part}` : 'Grimoire'}
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
              }}
            >
              {subtitle}
            </div>
          )}
          <div
            style={{
              fontSize: sizes.keyPointSize,
              fontWeight: '300',
              color: 'rgba(255,255,255,0.6)',
              textAlign: 'center',
              display: 'flex',
              marginTop: '40px',
            }}
          >
            Learn more: lunary.app/grimoire/{topic}
          </div>
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
