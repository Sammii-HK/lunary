import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import {
  getAccurateMoonPhase,
  loadGoogleFont,
} from '../../../../../utils/astrology/cosmic-og';

export const runtime = 'nodejs'; // Node.js runtime required for astronomy-engine calculations
export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache for 24 hours (content updates daily)

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

  // Normalize date to noon UTC for consistent moon phase calculation
  let targetDate: Date;
  if (dateParam) {
    targetDate = new Date(dateParam + 'T12:00:00Z');
  } else {
    const todayStr = new Date().toISOString().split('T')[0];
    targetDate = new Date(todayStr + 'T12:00:00Z');
  }

  // Get actual moon phase data for the date
  const moonPhase = getAccurateMoonPhase(targetDate);

  // Format date for display
  const formattedDate = targetDate
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
    .replace(/\//g, '/');

  // Blue lunar backgrounds (not crystal colors)
  const dayVariation = targetDate.getDate() % 5;
  const themes = [
    'linear-gradient(135deg, #1e3a8a15, #0a0a1a)', // Deep blue
    'linear-gradient(135deg, #1a1a2e, #1e40af20)', // Navy blue
    'linear-gradient(135deg, #1d4ed812, #2c3e50)', // Royal blue
    'linear-gradient(135deg, #1e2a3a, #2563eb18)', // Bright blue
    'linear-gradient(135deg, #3b82f610, #1e3c72)', // Sky blue
  ];

  // Load Roboto Mono font
  const robotoFont = await loadGoogleFont(request);

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
            {Math.round(moonPhase.illumination)}% ILLUMINATED
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
          <div style={{ fontSize: '120px', marginBottom: '30px' }}>
            {moonPhase.emoji}
          </div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: '400',
              color: 'white',
              textAlign: 'center',
              letterSpacing: '0.1em',
              marginBottom: '30px',
            }}
          >
            {moonPhase.name}
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
            {moonPhase.energy}
          </div>
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
    {
      width: 1200,
      height: 1200,
      fonts: robotoFont
        ? [
            {
              name: 'Roboto Mono',
              data: robotoFont,
              style: 'normal',
            },
          ]
        : [],
    },
  );
}
