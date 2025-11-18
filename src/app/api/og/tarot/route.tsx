import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import { getTarotCard } from '../../../../../utils/tarot/tarot';
import { getTarotCardByName } from '../../../../../src/utils/tarot/getCardByName';

dayjs.extend(dayOfYear);
dayjs.extend(utc);

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // Cache for 24 hours (content updates daily)

// Get suit from card name
function getCardSuit(cardName: string): string {
  if (cardName.includes('Cups')) return 'Cups';
  if (cardName.includes('Wands')) return 'Wands';
  if (cardName.includes('Swords')) return 'Swords';
  if (cardName.includes('Pentacles')) return 'Pentacles';
  return 'Major';
}

// Get color based on suit
function getSuitColor(suit: string): string {
  const colorMap: Record<string, string> = {
    Major: '#F59E0B', // Gold/Yellow
    Cups: '#2563EB', // Blue (Water)
    Wands: '#DC2626', // Red (Fire)
    Swords: '#7C3AED', // Purple (Air)
    Pentacles: '#059669', // Green (Earth)
  };
  return colorMap[suit] || '#9333EA';
}

// Derive archetype from card name or keywords
function getCardArchetype(cardName: string, keywords: string[]): string {
  // Use first keyword capitalized as archetype, or derive from card name
  if (keywords.length > 0) {
    return (
      keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1).toLowerCase()
    );
  }

  // Fallback: derive from card name
  if (cardName.includes('Ace')) return 'New Beginnings';
  if (cardName.includes('Two')) return 'Partnership';
  if (cardName.includes('Three')) return 'Creativity';
  if (cardName.includes('Four')) return 'Stability';
  if (cardName.includes('Five')) return 'Conflict';
  if (cardName.includes('Six')) return 'Harmony';
  if (cardName.includes('Seven')) return 'Reflection';
  if (cardName.includes('Eight')) return 'Movement';
  if (cardName.includes('Nine')) return 'Completion';
  if (cardName.includes('Ten')) return 'Fulfillment';

  return 'Guidance';
}

// Get OG properties for tarot card using centralized source
function getTarotOGProperties(cardName: string): {
  name: string;
  keywords: string[];
  archetype: string;
  color: string;
} {
  const card = getTarotCardByName(cardName);

  if (card) {
    const suit = getCardSuit(cardName);
    const color = getSuitColor(suit);
    const archetype = getCardArchetype(cardName, card.keywords);

    return {
      name: card.name,
      keywords: card.keywords,
      archetype,
      color,
    };
  }

  // Fallback for unknown cards
  return {
    name: cardName,
    keywords: ['Guidance', 'Wisdom', 'Insight'],
    archetype: 'Guidance',
    color: '#9333EA',
  };
}

function getTarotTheme(card: any, date: dayjs.Dayjs) {
  const dayVariation = date.date() % 5;

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
  const dateObj = dayjs(targetDate).utc();
  const dayOfYearUtc = dateObj.dayOfYear();
  const dailySeed = `cosmic-${dateObj.format('YYYY-MM-DD')}-${dayOfYearUtc}-energy`;
  const tarotCard = getTarotCard(dailySeed);

  // Get OG properties using centralized tarot cards source
  const card = getTarotOGProperties(tarotCard.name);

  // Format date for display using dayjs
  const formattedDate = dateObj.format('DD/MM/YYYY');

  // Same theme system as cosmic - use card color for theme
  const theme = getTarotTheme(card, dateObj);

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          background: theme.background,
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
