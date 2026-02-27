import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';
import { generateStarfield } from '@/lib/share/og-utils';

export const runtime = 'edge';
export const revalidate = 3600;

let robotoFontP: Promise<ArrayBuffer> | null = null;

async function loadRobotoFont(request: Request) {
  if (!robotoFontP) {
    const url = new URL(`/fonts/RobotoMono-Regular.ttf`, request.url);
    robotoFontP = fetch(url, { cache: 'force-cache' }).then((r) => {
      if (!r.ok) throw new Error(`Roboto Mono font fetch ${r.status}`);
      return r.arrayBuffer();
    });
  }
  return robotoFontP;
}

type Format = 'square' | 'landscape' | 'portrait' | 'story';

const FORMAT_SIZES: Record<Format, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  landscape: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
};

const DEFAULT_FORMAT: Format = 'square';

// Category-themed gradients for visual variety
// ALL brand violet/purple/cosmic - NO green or orange!
const THEMED_GRADIENTS = [
  'linear-gradient(135deg, #3a2260 0%, #241440 50%, #160e2a 100%)', // violet
  'linear-gradient(135deg, #3a1a50 0%, #26104a 50%, #180a30 100%)', // purple
  'linear-gradient(135deg, #1a2c58 0%, #141e3e 50%, #0e1428 100%)', // indigo
  'linear-gradient(135deg, #3a2260 0%, #241440 50%, #160e2a 100%)', // cosmic violet
  'linear-gradient(135deg, #4c1830 0%, #300e1e 50%, #1e0a14 100%)', // rose-violet
  'linear-gradient(135deg, #3a1a50 0%, #26104a 50%, #180a30 100%)', // deep purple
  'linear-gradient(135deg, #1a2c58 0%, #141e3e 50%, #0e1428 100%)', // midnight violet
  'linear-gradient(135deg, #3a2260 0%, #241440 50%, #160e2a 100%)', // nebula
];

// Accent colors that pair with each gradient - Lunary brand colors only
const GRADIENT_ACCENTS = [
  '#8458d8', // Nebula Violet
  '#c77dff', // Galaxy Haze
  '#7b7be8', // Comet Trail
  '#d070e8', // Supernova
  '#ee789e', // Cosmic Rose
  '#a78bfa', // Soft violet
  '#818cf8', // Soft indigo
  '#c77dff', // Galaxy Haze
];

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text =
      searchParams.get('text') || 'Your personalized cosmic guidance';
    const interpretation = searchParams.get('interpretation') || null;
    const rawFormat = (
      searchParams.get('format') || DEFAULT_FORMAT
    ).toLowerCase();
    const allowedFormats: Format[] = [
      'square',
      'landscape',
      'portrait',
      'story',
    ];
    const format = allowedFormats.includes(rawFormat as Format)
      ? (rawFormat as Format)
      : DEFAULT_FORMAT;
    const { width, height } = FORMAT_SIZES[format];

    let author = searchParams.get('author') || 'Lunary';
    let quoteText = text;

    const lastDashIndex = Math.max(
      text.lastIndexOf(' - '),
      text.lastIndexOf(' — '),
    );
    if (lastDashIndex > 0) {
      const potentialAuthor = text.substring(lastDashIndex + 3).trim();
      if (potentialAuthor && /^[A-Z]/.test(potentialAuthor)) {
        quoteText = text.substring(0, lastDashIndex).trim();
        author = potentialAuthor;
      }
    }

    const fontData = await loadRobotoFont(request).catch(() => null);

    // Deterministic gradient selection based on quote text
    const hash = Math.abs(
      quoteText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0),
    );
    const gradientIndex = hash % THEMED_GRADIENTS.length;
    const background = THEMED_GRADIENTS[gradientIndex];
    const accent = GRADIENT_ACCENTS[gradientIndex];

    // Generate subtle starfield
    const stars = generateStarfield(`quote-${quoteText.slice(0, 20)}`, 40);

    // Instagram-optimized text sizes (larger for mobile readability)
    const isSquare = format === 'square';
    const isStory = format === 'story';
    const quoteSize = isStory ? 56 : isSquare ? 52 : 44;
    const authorSize = isStory ? 36 : isSquare ? 34 : 32;
    const interpSize = isStory ? 30 : isSquare ? 28 : 24;

    return new ImageResponse(
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background,
          padding: isSquare
            ? '80px 64px'
            : isStory
              ? '80px 64px'
              : '60px 100px',
          fontFamily: fontData ? 'Roboto Mono' : 'system-ui',
          position: 'relative',
        }}
      >
        {/* Starfield - more visible */}
        {stars.map((star, i) => (
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
              opacity: Math.min(1, star.opacity * 2.0),
              boxShadow: `0 0 ${star.size * 3}px rgba(255, 255, 255, ${star.opacity * 0.8})`,
            }}
          />
        ))}

        {/* Decorative quote mark */}
        <div
          style={{
            position: 'absolute',
            top: isSquare ? 60 : 80,
            left: isSquare ? 60 : 80,
            fontSize: 120,
            color: accent,
            opacity: 0.1,
            lineHeight: 1,
            display: 'flex',
          }}
        >
          {'\u201C'}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            maxWidth: isStory ? '760px' : '920px',
          }}
        >
          <div
            style={{
              fontSize: quoteSize,
              fontWeight: 600,
              lineHeight: 1.35,
              marginBottom: 40,
              color: '#f0f0f2',
              display: 'flex',
              flexWrap: 'wrap',
              wordBreak: 'break-word',
              textAlign: 'center',
            }}
          >
            {quoteText}
          </div>
          <div
            style={{
              fontSize: authorSize,
              color: accent,
              opacity: 0.9,
              marginTop: 16,
              display: 'flex',
            }}
          >
            {'\u2014'} {author}
          </div>
          {interpretation && (
            <div
              style={{
                fontSize: interpSize,
                fontWeight: 400,
                lineHeight: 1.5,
                marginTop: 44,
                color: `${accent}cc`,
                maxWidth: isStory ? '680px' : '850px',
                display: 'flex',
                textAlign: 'center',
              }}
            >
              {interpretation}
            </div>
          )}
        </div>

        {/* Footer with moon icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'center',
            position: 'absolute',
            bottom: 36,
            left: 0,
            right: 0,
          }}
        >
          <img
            src={`${BASE_URL}/icons/moon-phases/full-moon.png`}
            width={18}
            height={18}
            style={{ opacity: 0.4 }}
            alt=''
          />
          <span
            style={{
              fontSize: 20,
              color: '#71717a',
              letterSpacing: '0.1em',
              display: 'flex',
            }}
          >
            lunary.app
          </span>
        </div>
      </div>,
      {
        width,
        height,
        fonts: fontData
          ? [
              {
                name: 'Roboto Mono',
                data: fontData,
                style: 'normal',
              },
            ]
          : [],
      },
    );
  } catch (error) {
    console.error('Error generating social quote image:', error);
    return new NextResponse('Error generating image', { status: 500 });
  }
}
