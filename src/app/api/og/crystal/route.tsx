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
  
  const targetDate = dateParam || new Date().toISOString().split('T')[0];
  const dateObj = new Date(targetDate);
  const seed = dateObj.getDate() + dateObj.getMonth() * 31;
  const crystal = crystals[seed % crystals.length];
  
  // Subtle crystal color background like cosmic
  const dayVariation = dateObj.getDate() % 5;
  const themes = [
    `linear-gradient(135deg, ${crystal.color}15, #0a0a1a)`,
    `linear-gradient(135deg, #1a1a2e, ${crystal.color}20)`,
    `linear-gradient(135deg, ${crystal.color}12, #2c3e50)`,
    `linear-gradient(135deg, #1e2a3a, ${crystal.color}18)`,
    `linear-gradient(135deg, ${crystal.color}10, #1e3c72)`,
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
            {crystal.chakra}
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
              fontSize: '64px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              marginBottom: '40px',
            }}
          >
            {crystal.name}
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
            {crystal.keywords.join(' • ')}
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
