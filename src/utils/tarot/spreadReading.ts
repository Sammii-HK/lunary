import seed from 'seed-random';
import {
  TAROT_SPREAD_MAP,
  TarotSpreadDefinition,
} from '@/constants/tarotSpreads';
import { TAROT_DECK, TarotDeckCard, getTarotCardByName } from './deck';
import type { BirthChartPlacement } from '@/context/UserContext';
import { getSpreadCardSeed, seedToIndex } from '@/lib/tarot/chart-seeding';
import type { BirthChartSnapshot } from '@/lib/ai/types';

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
  birthChart?: BirthChartPlacement[];
  userBirthday?: string;
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

/**
 * Draw unique cards using chart-based seeding
 */
const drawUniqueCardsWithChart = (
  count: number,
  spreadSlug: string,
  birthChart: BirthChartPlacement[],
  userBirthday: string,
  timestamp: number,
): TarotDeckCard[] => {
  // Convert birth chart to snapshot format
  const chartSnapshot: BirthChartSnapshot = {
    date: userBirthday,
    time: '12:00',
    lat: 0,
    lon: 0,
    placements: birthChart.map((p) => ({
      planet: p.planet,
      sign: p.sign,
      house: p.house,
      degree: p.degree,
    })),
  };

  const deckIndexes = Array.from(
    { length: TAROT_DECK.length },
    (_, index) => index,
  );
  const selected: TarotDeckCard[] = [];

  for (let i = 0; i < count; i++) {
    if (deckIndexes.length === 0) break;

    // Generate chart-influenced seed for this position
    const positionSeed = getSpreadCardSeed(
      chartSnapshot,
      spreadSlug,
      i,
      timestamp,
    );

    // Use seed to select from remaining cards
    const index = seedToIndex(positionSeed, deckIndexes.length);
    const [deckIndex] = deckIndexes.splice(index, 1);
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

  // Use chart-based seeding if birth chart is available
  let cards: TarotDeckCard[];
  if (
    options.birthChart &&
    options.birthChart.length > 0 &&
    options.userBirthday
  ) {
    const timestamp = Date.now();
    cards = drawUniqueCardsWithChart(
      spread.cardCount,
      options.spreadSlug,
      options.birthChart,
      options.userBirthday,
      timestamp,
    );
  } else {
    // Fallback to original seeding method
    cards = drawUniqueCards(spread.cardCount, seedValue);
  }

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
