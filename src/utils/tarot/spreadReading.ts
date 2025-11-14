import seed from 'seed-random';
import {
  TAROT_SPREAD_MAP,
  TarotSpreadDefinition,
} from '@/constants/tarotSpreads';
import { TAROT_DECK, TarotDeckCard, getTarotCardByName } from './deck';

export interface SpreadCardInsight {
  positionId: string;
  positionLabel: string;
  positionPrompt: string;
  card: TarotDeckCard;
  insight: string;
}

export interface SpreadReadingPayload {
  spreadSlug: string;
  spreadName: string;
  summary: string;
  highlights: string[];
  cards: SpreadCardInsight[];
  journalingPrompts: string[];
  metadata: {
    seed: string;
    generatedAt: string;
    deckSize: number;
  };
}

export interface GenerateSpreadOptions {
  spreadSlug: string;
  seed?: string;
  userId?: string;
  userName?: string;
  userIntent?: string;
}

const ensureSeed = (options: GenerateSpreadOptions): string => {
  if (options.seed) return options.seed;
  const base = [
    options.spreadSlug,
    options.userId || '',
    options.userName || '',
    Date.now().toString(),
    Math.random().toString(),
  ]
    .filter(Boolean)
    .join('-');

  return base;
};

const drawUniqueCards = (
  count: number,
  seedString: string,
): TarotDeckCard[] => {
  const deckIndexes = Array.from(
    { length: TAROT_DECK.length },
    (_, index) => index,
  );
  const rng = seed(seedString);
  const selected: TarotDeckCard[] = [];

  for (let i = 0; i < count; i++) {
    if (deckIndexes.length === 0) break;
    const randomIndex = Math.floor(rng() * deckIndexes.length);
    const [deckIndex] = deckIndexes.splice(randomIndex, 1);
    selected.push(TAROT_DECK[deckIndex]);
  }

  return selected;
};

const buildInsight = (
  position: TarotSpreadDefinition['positions'][number],
  card: TarotDeckCard,
): string => {
  const keywords = card.keywords.slice(0, 2).join(' & ');
  return `"${card.name}" lights up ${keywords.toLowerCase()} here. ${position.prompt}`;
};

export const generateSpreadReading = (
  options: GenerateSpreadOptions,
): SpreadReadingPayload => {
  const spread = TAROT_SPREAD_MAP[options.spreadSlug];

  if (!spread) {
    throw new Error(`Unknown spread: ${options.spreadSlug}`);
  }

  const seedValue = ensureSeed(options);
  const cards = drawUniqueCards(spread.cardCount, seedValue);

  const cardsWithPositions: SpreadCardInsight[] = spread.positions.map(
    (position, index) => {
      const card = cards[index];
      if (!card) {
        throw new Error(
          `Spread "${spread.name}" expected ${spread.cardCount} cards but only drew ${cards.length}.`,
        );
      }

      return {
        positionId: position.id,
        positionLabel: position.label,
        positionPrompt: position.prompt,
        card,
        insight: buildInsight(position, card),
      };
    },
  );

  const headlineKeywords = cardsWithPositions
    .slice(0, 3)
    .flatMap((item) => item.card.keywords.slice(0, 1));

  const summary =
    headlineKeywords.length > 0
      ? `${spread.name} spotlights ${headlineKeywords.join(', ')} this time.`
      : `${spread.name} offers fresh insight for your path.`;

  const highlights = cardsWithPositions.slice(0, 3).map((item) => {
    const keyKeyword = item.card.keywords[0] || 'insight';
    return `${item.positionLabel}: ${item.card.name} emphasises ${keyKeyword.toLowerCase()}.`;
  });

  return {
    spreadSlug: spread.slug,
    spreadName: spread.name,
    summary,
    highlights,
    cards: cardsWithPositions,
    journalingPrompts: spread.journalPrompts,
    metadata: {
      seed: seedValue,
      generatedAt: new Date().toISOString(),
      deckSize: TAROT_DECK.length,
    },
  };
};

export const hydrateStoredCards = (
  storedCards: Array<{
    positionId: string;
    cardName: string;
  }>,
  spreadSlug: string,
): SpreadCardInsight[] => {
  const spread = TAROT_SPREAD_MAP[spreadSlug];
  if (!spread) {
    throw new Error(`Unknown spread: ${spreadSlug}`);
  }

  return storedCards.map((entry) => {
    const position = spread.positions.find(
      (pos) => pos.id === entry.positionId,
    );
    if (!position) {
      throw new Error(
        `Position "${entry.positionId}" not found in spread "${spread.name}".`,
      );
    }

    const card = getTarotCardByName(entry.cardName);
    if (!card) {
      throw new Error(`Card "${entry.cardName}" not found in tarot deck.`);
    }

    return {
      positionId: position.id,
      positionLabel: position.label,
      positionPrompt: position.prompt,
      card,
      insight: buildInsight(position, card),
    };
  });
};
