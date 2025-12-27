import { NextRequest } from 'next/server';
import dayjs from 'dayjs';
import dayOfYear from 'dayjs/plugin/dayOfYear';
import utc from 'dayjs/plugin/utc';
import { getTarotCard } from '../../../../../utils/tarot/tarot';
import { getTarotCardByName } from '../../../../../src/utils/tarot/getCardByName';
import { loadGoogleFont } from '../../../../../utils/astrology/cosmic-og';
import {
  OGWrapper,
  OGHeader,
  OGContentCenter,
  OGTitle,
  OGSubtitle,
  OGFooter,
  createOGResponse,
  defaultThemes,
  OGImageSize,
} from '../../../../../utils/og/base';

dayjs.extend(dayOfYear);
dayjs.extend(utc);

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

function getCardSuit(cardName: string): string {
  if (cardName.includes('Cups')) return 'Cups';
  if (cardName.includes('Wands')) return 'Wands';
  if (cardName.includes('Swords')) return 'Swords';
  if (cardName.includes('Pentacles')) return 'Pentacles';
  return 'Major';
}

function getSuitColor(suit: string): string {
  const colorMap: Record<string, string> = {
    Major: '#F59E0B',
    Cups: '#2563EB',
    Wands: '#DC2626',
    Swords: '#7C3AED',
    Pentacles: '#059669',
  };
  return colorMap[suit] || '#9333EA';
}

function getCardArchetype(cardName: string, keywords: string[]): string {
  if (keywords.length > 0) {
    return (
      keywords[0].charAt(0).toUpperCase() + keywords[0].slice(1).toLowerCase()
    );
  }

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

  return {
    name: cardName,
    keywords: ['Guidance', 'Wisdom', 'Insight'],
    archetype: 'Guidance',
    color: '#9333EA',
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date');
  const cardParam = searchParams.get('card');
  const sizeParam = searchParams.get('size');
  const showDateParam = searchParams.get('showDate');

  const allowedSizes: OGImageSize[] = [
    'square',
    'landscape',
    'portrait',
    'story',
  ];
  const size: OGImageSize = allowedSizes.includes(sizeParam as OGImageSize)
    ? (sizeParam as OGImageSize)
    : 'landscape';

  const targetDate = dateParam || new Date().toISOString().split('T')[0];
  const dateObj = dayjs(targetDate).utc();
  const dayOfYearUtc = dateObj.dayOfYear();
  const dailySeed = `cosmic-${dateObj.format('YYYY-MM-DD')}-${dayOfYearUtc}-energy`;
  const tarotCard = cardParam ? { name: cardParam } : getTarotCard(dailySeed);

  const card = getTarotOGProperties(tarotCard.name);
  const showDate = showDateParam === 'true' || Boolean(dateParam);
  const formattedDate = showDate ? dateObj.format('DD/MM/YYYY') : undefined;
  const theme = defaultThemes.tarot(card.color);

  const robotoFont = await loadGoogleFont(request);

  return createOGResponse(
    <OGWrapper theme={theme}>
      <OGHeader title={card.keywords.join(' • ')} fontSize={24} />

      <OGContentCenter>
        <OGTitle text={card.name} />
        <OGSubtitle text={card.archetype} fontSize={32} opacity={0.8} />
      </OGContentCenter>

      <OGFooter date={formattedDate} />
    </OGWrapper>,
    {
      size,
      fonts: robotoFont
        ? [{ name: 'Roboto Mono', data: robotoFont, style: 'normal' as const }]
        : [],
    },
  );
}
