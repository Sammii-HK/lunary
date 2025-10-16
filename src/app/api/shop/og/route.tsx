import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

// Removed edge runtime due to WASM compatibility issues
// export const runtime = 'edge';

async function loadGoogleFont(font: string, text: string) {
  try {
    const url = `https://fonts.googleapis.com/css2?family=${font}&text=${encodeURIComponent(text)}`;
    const css = await (await fetch(url)).text();
    const resource = css.match(
      /src: url\((.+)\) format\('(opentype|truetype)'\)/,
    );

    if (resource) {
      const response = await fetch(resource[1]);
      if (response.status == 200) {
        return await response.arrayBuffer();
      }
    }

    throw new Error('failed to load font data');
  } catch (error) {
    console.error('Failed to load Google font:', error);
    return null;
  }
}

function getCategoryEmoji(category: string): string {
  const emojis: { [key: string]: string } = {
    moon_phases: '🌙',
    crystals: '💎',
    spells: '✨',
    tarot: '🔮',
    astrology: '⭐',
    seasonal: '🌸',
  };
  return emojis[category] || '📦';
}

function getCategoryColor(category: string): string {
  const colors: { [key: string]: string } = {
    moon_phases: 'linear-gradient(135deg, #1a1a2e, #2d3561)',
    crystals: 'linear-gradient(135deg, #2c3e50, #34495e)',
    spells: 'linear-gradient(135deg, #1e2a3a, #2c3e50)',
    tarot: 'linear-gradient(135deg, #1a2332, #1e3c72)',
    astrology: 'linear-gradient(135deg, #0a0a1a, #1a1a2e)',
    seasonal: 'linear-gradient(135deg, #2d5016, #4a7c59)',
  };
  return colors[category] || 'linear-gradient(135deg, #1a1a2e, #2d3561)';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || 'moon_phases';
  const name = searchParams.get('name') || 'Digital Pack';
  const items = parseInt(searchParams.get('items') || '0');

  const emoji = getCategoryEmoji(category);
  const background = getCategoryColor(category);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          background,
          fontFamily: 'Roboto Mono',
          color: 'white',
          padding: '60px 40px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px',
            paddingTop: '40px',
          }}
        >
          <div
            style={{
              fontSize: '32px',
              fontWeight: '300',
              color: 'rgba(255,255,255,0.8)',
              textAlign: 'center',
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
            }}
          >
            Digital Pack
          </div>
        </div>

        {/* Main Content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '40px',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          {/* Category Emoji */}
          <div
            style={{
              fontSize: '200px',
              lineHeight: '1',
            }}
          >
            {emoji}
          </div>

          {/* Pack Name */}
          <div
            style={{
              fontSize: '48px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              maxWidth: '900px',
              lineHeight: '1.2',
            }}
          >
            {name}
          </div>

          {/* Items Count */}
          {items > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                fontSize: '24px',
                fontWeight: '300',
                color: 'rgba(255,255,255,0.9)',
                background: 'rgba(255,255,255,0.1)',
                padding: '12px 24px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <span>📄</span>
              <span>{items} Items</span>
            </div>
          )}

          {/* Category Badge */}
          <div
            style={{
              fontSize: '20px',
              fontWeight: '300',
              color: 'rgba(255,255,255,0.8)',
              textTransform: 'capitalize',
              background: 'rgba(255,255,255,0.1)',
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.2)',
            }}
          >
            {category.replace('_', ' ')}
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              fontSize: '28px',
              fontWeight: '300',
              color: 'white',
              letterSpacing: '1px',
            }}
          >
            lunary.app
          </div>
          <div
            style={{
              fontSize: '16px',
              fontWeight: '300',
              color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.1em',
            }}
          >
            Digital Spiritual Guidance
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 1200,
      fonts: [
        {
          name: 'Roboto Mono',
          data:
            (await loadGoogleFont(
              'Roboto+Mono:wght@300;400;700',
              'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 /.:',
            )) || new ArrayBuffer(0),
          style: 'normal',
        },
      ],
    },
  );
}
