import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const sizeParam = searchParams.get('size') || 'square';

  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    targetDate = new Date();
  }

  // Format date for display
  const formattedDate = targetDate
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '/');

  // Define responsive sizes and styles
  const sizes = {
    square: {
      width: 1200,
      height: 1200,
      padding: '60px 40px',
      titleSize: 24,
      contentSize: 36,
      dateSize: 28,
      footerSize: 28,
    },
    portrait: {
      width: 1080,
      height: 1920,
      padding: '80px 60px',
      titleSize: 32,
      contentSize: 44,
      dateSize: 36,
      footerSize: 36,
    },
    landscape: {
      width: 1920,
      height: 1080,
      padding: '40px 80px',
      titleSize: 20,
      contentSize: 28,
      dateSize: 24,
      footerSize: 24,
    },
  };

  // Fetch real horoscope snippet from cosmic content
  const dateStr = targetDate.toISOString().split('T')[0];
  let horoscopeSnippet =
    "Trust your inner wisdom and embrace today's cosmic possibilities";

  try {
    const cosmicResponse = await fetch(
      `https://lunary.app/api/og/cosmic-post?date=${dateStr}`,
    );
    if (cosmicResponse.ok) {
      const cosmicContent = await cosmicResponse.json();
      horoscopeSnippet = cosmicContent.horoscopeSnippet || horoscopeSnippet;
    }
  } catch (error) {
    console.error('Error fetching horoscope snippet:', error);
  }

  // Use cosmic-style backgrounds
  const dayVariation =
    Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24)) % 5;
  const themes = [
    'linear-gradient(135deg, #0a0a1a, #1a1a2e)',
    'linear-gradient(135deg, #1a1a2e, #2d3561)',
    'linear-gradient(135deg, #2c3e50, #34495e)',
    'linear-gradient(135deg, #1e2a3a, #2c3e50)',
    'linear-gradient(135deg, #1a2332, #1e3c72)',
  ];

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: themes[dayVariation],
          fontFamily: 'Roboto Mono',
          color: 'white',
          padding: '60px 40px',
          justifyContent: 'space-between',
        }}
      >
        {/* Chakra at top */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            paddingBottom: '40px',
            paddingTop: '100px',
          }}
        >
          <div
            style={{
              fontSize: '24px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              opacity: 0.7,
            }}
          >
            Daily Guidance
          </div>
        </div>

        {/* Crystal name in middle - large for mobile */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            width: '100%',
          }}
        >
          <div
            style={{
              fontSize: '36px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              marginBottom: '40px',
            }}
          >
            {horoscopeSnippet}
          </div>
          <div
            style={{
              fontSize: '24px',
              color: 'white',
              textAlign: 'center',
              opacity: 0.7,
              letterSpacing: '0.1em',
            }}
          ></div>
        </div>

        {/* Date */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: '300',
            color: 'white',
            textAlign: 'center',
            fontFamily: 'Roboto Mono',
            marginBottom: '20px',
          }}
        >
          {formattedDate}
        </div>

        {/* Footer - exactly same as cosmic */}
        <div
          style={{
            fontSize: '28px',
            fontWeight: '300',
            color: 'white',
            letterSpacing: '1px',
            marginBottom: '40px',
          }}
        >
          lunary.app
        </div>
      </div>
    ),
    { width: 1200, height: 1200 },
  );
}
