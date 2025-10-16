import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

// Major Arcana with suit color system
const tarotCards = [
  // Major Arcana - Gold/Yellow theme
  { name: 'The Fool', suit: 'Major', color: '#F59E0B', archetype: 'New Beginnings', keywords: ['Adventure', 'Spontaneity', 'Faith'] },
  { name: 'The Magician', suit: 'Major', color: '#EAB308', archetype: 'Manifestation', keywords: ['Power', 'Focus', 'Skill'] },
  { name: 'The High Priestess', suit: 'Major', color: '#CA8A04', archetype: 'Intuition', keywords: ['Mystery', 'Wisdom', 'Subconscious'] },
  { name: 'The Empress', suit: 'Major', color: '#A16207', archetype: 'Abundance', keywords: ['Fertility', 'Nature', 'Nurturing'] },
  { name: 'The Emperor', suit: 'Major', color: '#92400E', archetype: 'Authority', keywords: ['Structure', 'Control', 'Leadership'] },
  { name: 'The Lovers', suit: 'Major', color: '#F59E0B', archetype: 'Choice', keywords: ['Love', 'Union', 'Values'] },
  { name: 'The Chariot', suit: 'Major', color: '#D97706', archetype: 'Victory', keywords: ['Control', 'Determination', 'Success'] },
  { name: 'Strength', suit: 'Major', color: '#B45309', archetype: 'Inner Power', keywords: ['Courage', 'Patience', 'Compassion'] },
  
  // Cups - Blue theme (Water)
  { name: 'Ace of Cups', suit: 'Cups', color: '#2563EB', archetype: 'New Love', keywords: ['Emotion', 'Intuition', 'Spirituality'] },
  { name: 'Two of Cups', suit: 'Cups', color: '#1D4ED8', archetype: 'Partnership', keywords: ['Union', 'Connection', 'Harmony'] },
  
  // Wands - Red theme (Fire)  
  { name: 'Ace of Wands', suit: 'Wands', color: '#DC2626', archetype: 'Creative Spark', keywords: ['Inspiration', 'Growth', 'Potential'] },
  { name: 'Two of Wands', suit: 'Wands', color: '#B91C1C', archetype: 'Planning', keywords: ['Future', 'Discovery', 'Decisions'] },
  
  // Swords - Purple theme (Air)
  { name: 'Ace of Swords', suit: 'Swords', color: '#7C3AED', archetype: 'Mental Clarity', keywords: ['Truth', 'Justice', 'Clarity'] },
  { name: 'Two of Swords', suit: 'Swords', color: '#6D28D9', archetype: 'Difficult Choice', keywords: ['Indecision', 'Balance', 'Stalemate'] },
  
  // Pentacles - Green theme (Earth)
  { name: 'Ace of Pentacles', suit: 'Pentacles', color: '#059669', archetype: 'Material Opportunity', keywords: ['Prosperity', 'Manifestation', 'Resources'] },
  { name: 'Two of Pentacles', suit: 'Pentacles', color: '#047857', archetype: 'Balance', keywords: ['Adaptability', 'Time Management', 'Priorities'] },
];

function getTarotTheme(card: any, date: string) {
  const dayVariation = new Date(date).getDate() % 5;
  
  // Subtle card color backgrounds (like crystal system)
  const cardColorHex = card.color;
  const suitThemes = [
    `linear-gradient(135deg, ${cardColorHex}15, #0a0a1a)`,
    `linear-gradient(135deg, #1a1a2e, ${cardColorHex}18)`, 
    `linear-gradient(135deg, ${cardColorHex}12, #2c3e50)`,
    `linear-gradient(135deg, #1e2a3a, ${cardColorHex}20)`,
    `linear-gradient(135deg, ${cardColorHex}10, #1e3c72)`,
  ];
  
  return {
    background: suitThemes[dayVariation],
    textShadow: '0 2px 8px rgba(0,0,0,0.8)',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  
  const targetDate = dateParam || new Date().toISOString().split('T')[0];
  const dateObj = new Date(targetDate);
  const seed = dateObj.getDate() + dateObj.getMonth() * 31 + dateObj.getFullYear() * 7;
  const card = tarotCards[seed % tarotCards.length];
  
  // Same theme system as cosmic
  const dayVariation = dateObj.getDate() % 5;
  const themes = [
    `linear-gradient(135deg, #0a0a1a, #1a1a2e)`,
    `linear-gradient(135deg, #1a1a2e, #2d3561)`,
    `linear-gradient(135deg, #2c3e50, #34495e)`,
    `linear-gradient(135deg, #1e2a3a, #2c3e50)`,
    `linear-gradient(135deg, #1a2332, #1e3c72)`,
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
        {/* Keywords at top */}
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
            {card.keywords.join(' • ')}
          </div>
        </div>

        {/* Card name in middle - large for social */}
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
            {card.name}
          </div>
          <div
            style={{
              fontSize: '32px',
              color: 'white',
              textAlign: 'center',
              fontWeight: '300',
              opacity: 0.8,
            }}
          >
            {card.archetype}
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
