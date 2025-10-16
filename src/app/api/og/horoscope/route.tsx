import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const crystals = [
  { name: 'Amethyst', color: '#9333EA', chakra: 'Crown Chakra', keywords: ['Intuition', 'Clarity', 'Protection'] },
  { name: 'Rose Quartz', color: '#F472B6', chakra: 'Heart Chakra', keywords: ['Love', 'Compassion', 'Peace'] },
  { name: 'Citrine', color: '#F59E0B', chakra: 'Solar Plexus', keywords: ['Abundance', 'Confidence', 'Joy'] },
  { name: 'Black Tourmaline', color: '#1F2937', chakra: 'Root Chakra', keywords: ['Protection', 'Grounding', 'Strength'] },
  { name: 'Clear Quartz', color: '#F3F4F6', chakra: 'All Chakras', keywords: ['Amplification', 'Clarity', 'Healing'] },
  { name: 'Moonstone', color: '#E5E7EB', chakra: 'Sacral Chakra', keywords: ['Intuition', 'Cycles', 'Feminine'] },
  { name: 'Carnelian', color: '#EA580C', chakra: 'Sacral Chakra', keywords: ['Creativity', 'Courage', 'Passion'] },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    targetDate = new Date();
  }

  // Fetch real horoscope snippet from cosmic content
  const dateStr = targetDate.toISOString().split('T')[0];
  let horoscopeSnippet = 'Trust your inner wisdom and embrace today\'s cosmic possibilities';
  
  try {
    const cosmicResponse = await fetch(`https://lunary.app/api/og/cosmic-post?date=${dateStr}`);
    if (cosmicResponse.ok) {
      const cosmicContent = await cosmicResponse.json();
      horoscopeSnippet = cosmicContent.horoscopeSnippet || horoscopeSnippet;
    }
  } catch (error) {
    console.log('Using fallback horoscope snippet');
  }
  
  // Use cosmic-style backgrounds
  const dayVariation = Math.floor(targetDate.getTime() / (1000 * 60 * 60 * 24)) % 5;
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
          >
          </div>
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
    { width: 1200, height: 1200 }
  );
}
