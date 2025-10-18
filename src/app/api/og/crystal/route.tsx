import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const crystals = [
  {
    name: 'Amethyst',
    color: '#9333EA',
    chakra: 'Crown Chakra',
    keywords: ['Intuition', 'Clarity', 'Protection'],
  },
  {
    name: 'Rose Quartz',
    color: '#F472B6',
    chakra: 'Heart Chakra',
    keywords: ['Love', 'Compassion', 'Peace'],
  },
  {
    name: 'Citrine',
    color: '#F59E0B',
    chakra: 'Solar Plexus',
    keywords: ['Abundance', 'Confidence', 'Joy'],
  },
  {
    name: 'Black Tourmaline',
    color: '#1F2937',
    chakra: 'Root Chakra',
    keywords: ['Protection', 'Grounding', 'Strength'],
  },
  {
    name: 'Clear Quartz',
    color: '#F3F4F6',
    chakra: 'All Chakras',
    keywords: ['Amplification', 'Clarity', 'Healing'],
  },
  {
    name: 'Moonstone',
    color: '#E5E7EB',
    chakra: 'Sacral Chakra',
    keywords: ['Intuition', 'Cycles', 'Feminine'],
  },
  {
    name: 'Carnelian',
    color: '#EA580C',
    chakra: 'Sacral Chakra',
    keywords: ['Creativity', 'Courage', 'Passion'],
  },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const sizeParam = searchParams.get('size') || 'square';

  const targetDate = dateParam || new Date().toISOString().split('T')[0];
  const dateObj = new Date(targetDate);
  const seed = dateObj.getDate() + dateObj.getMonth() * 31;
  const crystal = crystals[seed % crystals.length];

  // Format date for display
  const formattedDate = dateObj
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
      crystalNameSize: 64,
      keywordSize: 24,
      dateSize: 28,
      footerSize: 28,
    },
    portrait: {
      width: 1080,
      height: 1920,
      padding: '80px 60px',
      titleSize: 32,
      crystalNameSize: 80,
      keywordSize: 28,
      dateSize: 36,
      footerSize: 36,
    },
    landscape: {
      width: 1920,
      height: 1080,
      padding: '40px 80px',
      titleSize: 20,
      crystalNameSize: 52,
      keywordSize: 20,
      dateSize: 24,
      footerSize: 24,
    },
  };

  const currentSize = sizes[sizeParam as keyof typeof sizes] || sizes.square;

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
          padding: currentSize.padding,
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
              fontSize: `${currentSize.titleSize}px`,
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
              fontSize: `${currentSize.crystalNameSize}px`,
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
              fontSize: `${currentSize.keywordSize}px`,
              color: 'white',
              textAlign: 'center',
              opacity: 0.7,
              letterSpacing: '0.1em',
            }}
          >
            {crystal.keywords.join(' • ')}
          </div>
        </div>

        {/* Date */}
        <div
          style={{
            fontSize: `${currentSize.dateSize}px`,
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
            fontSize: `${currentSize.footerSize}px`,
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
    { width: currentSize.width, height: currentSize.height },
  );
}
