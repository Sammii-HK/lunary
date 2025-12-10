import { NextRequest, NextResponse } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const revalidate = 3600; // Cache for 1 hour - quotes can change but not that frequently

// Cache font loading
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const text =
      searchParams.get('text') || 'Your personalized cosmic guidance';
    // Extract author from quote if it contains attribution (e.g., "quote text" - Author Name)
    let author = searchParams.get('author') || 'Lunary';
    let quoteText = text;

    // Check if quote contains attribution (format: "quote" - Author or "quote" — Author)
    // Match the LAST dash/emdash to handle quotes with dashes in the text (e.g., "star-stuff")
    // Split on the last occurrence of " - " or " — " pattern
    const lastDashIndex = Math.max(
      text.lastIndexOf(' - '),
      text.lastIndexOf(' — '),
    );
    if (lastDashIndex > 0) {
      // Check if what follows looks like an author name (starts with capital letter)
      const potentialAuthor = text.substring(lastDashIndex + 3).trim();
      if (potentialAuthor && /^[A-Z]/.test(potentialAuthor)) {
        quoteText = text.substring(0, lastDashIndex).trim();
        author = potentialAuthor;
      }
    }

    // Load font (fallback to system font if fails)
    const fontData = await loadRobotoFont(request).catch(() => null);

    const gradients = [
      'linear-gradient(135deg, #1a1a1a, #0d0d0d, #0a0a0a)',
      'linear-gradient(135deg, #2d2d3a, #1a1a1a, #0a0a0a)',
      'linear-gradient(135deg, #24243a, #1a1a1a, #0d0d0d)',
      'linear-gradient(135deg, #2a2a2a, #1a1a1a, #0a0a0a)',
      'linear-gradient(135deg, #1f1f2a, #1a1a1a, #0a0a0a)',
      'linear-gradient(135deg, #2a2a2a, #1f1f1f, #0d0d0d)',
      'linear-gradient(135deg, #252530, #1a1a1a, #0a0a0a)',
      'linear-gradient(135deg, #1f1f25, #1a1a1a, #0d0d0d)',
    ];

    // Pick gradient based on quote text hash for consistency
    const gradientIndex =
      Math.abs(
        quoteText.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0),
      ) % gradients.length;
    const background = gradients[gradientIndex];

    // Instagram square format (1080x1080 is optimal)
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
          padding: '80px',
          fontFamily: fontData ? 'Roboto Mono' : 'system-ui',
          position: 'relative',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            color: 'white',
            maxWidth: '900px',
          }}
        >
          <div
            style={{
              fontSize: 48,
              fontWeight: 600,
              lineHeight: 1.3,
              marginBottom: '40px',
              color: '#e4e4e7',
              display: 'flex',
            }}
          >
            {quoteText}
          </div>
          <div
            style={{
              fontSize: 36,
              color: '#a78bfa',
              opacity: 0.9,
              marginTop: '20px',
              display: 'flex',
            }}
          >
            — {author}
          </div>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            fontSize: 24,
            color: '#71717a',
            display: 'flex',
          }}
        >
          lunary.app
        </div>
      </div>,
      {
        width: 1080,
        height: 1080,
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
