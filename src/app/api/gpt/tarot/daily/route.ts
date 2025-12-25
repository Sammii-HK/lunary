import { NextRequest, NextResponse } from 'next/server';
import tarotCardsData from '@/data/tarot-cards.json';
import { requireGptAuth } from '@/lib/gptAuth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RawTarotCard = {
  name: string;
  keywords?: string[];
  uprightMeaning?: string;
  reversedMeaning?: string;
  loveMeaning?: string;
  careerMeaning?: string;
  information?: string;
};

type RawTarotDeck = {
  majorArcana: Record<string, RawTarotCard>;
  minorArcana?: Record<string, Record<string, RawTarotCard>>;
};

type TarotDeckCard = RawTarotCard & {
  arcana: 'Major' | 'Minor';
  suit?: string;
};

const tarotDeck: TarotDeckCard[] = buildTarotDeck(
  tarotCardsData as RawTarotDeck,
);

function buildTarotDeck(data: RawTarotDeck): TarotDeckCard[] {
  const major = Object.values(data.majorArcana ?? {}).map((card) => ({
    ...card,
    arcana: 'Major' as const,
    suit: 'major',
  }));

  const minorSuits = data.minorArcana ?? {};
  const minor = Object.entries(minorSuits).flatMap(([suit, cards]) =>
    Object.values(cards).map((card) => ({
      ...card,
      arcana: 'Minor' as const,
      suit,
    })),
  );

  return [...major, ...minor];
}

function generateMessage(
  card: TarotDeckCard,
  focus?: string,
  mood?: string,
): string {
  const keywords = card.keywords?.slice(0, 3).join(', ');
  let message =
    card.information ??
    `${card.name} highlights themes of ${keywords || 'shifting energy'}.`;

  if (card.arcana === 'Minor' && card.suit) {
    message += ` This ${card.suit.replace(/^\w/, (c) => c.toUpperCase())} card points to everyday matters where you can apply this wisdom.`;
  } else {
    message += ' A Major Arcana pull suggests a more pivotal turning point.';
  }

  if (focus === 'career') {
    message +=
      ' In career, explore how this guidance informs your motivation and decision-making.';
  } else if (focus === 'love') {
    message += ' Heart-wise, notice what dynamics this energy is amplifying.';
  } else if (focus === 'growth') {
    message +=
      ' For personal growth, reflect on what inner lesson is surfacing today.';
  }

  if (mood) {
    message += ` Notice how your current mood of ${mood} colors the way this card lands for you.`;
  }

  return message;
}

function generateInterpretation(card: TarotDeckCard, upright: boolean): string {
  if (upright && card.uprightMeaning) return card.uprightMeaning;
  if (!upright && card.reversedMeaning) return card.reversedMeaning;

  const orientation = upright ? 'upright' : 'reversed';
  const qualities = card.keywords?.slice(0, 2).join(' and ') ?? 'new insights';
  return `${card.name} ${orientation} emphasizes ${qualities}.`;
}

export async function POST(request: NextRequest) {
  const unauthorized = requireGptAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { focus, mood } = body;

    const randomIndex = Math.floor(Math.random() * tarotDeck.length);
    const selectedCard = tarotDeck[randomIndex];

    const upright = Math.random() > 0.3;

    const response = {
      card: {
        name: selectedCard.name,
        arcana: selectedCard.arcana,
        ...(selectedCard.suit && { suit: selectedCard.suit }),
        upright,
        keywords: selectedCard.keywords,
      },
      message: generateMessage(selectedCard, focus, mood),
      spreadType: 'single_daily',
      interpretation: generateInterpretation(selectedCard, upright),
      ctaUrl: 'https://lunary.app/tarot?from=gpt_tarot_daily',
      ctaText: 'Get a full personalized tarot reading with pattern analysis',
      source: 'Lunary.app - Tarot readings with cross-session pattern analysis',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('GPT tarot/daily error:', error);
    return NextResponse.json(
      { error: 'Failed to draw tarot card' },
      { status: 500 },
    );
  }
}
