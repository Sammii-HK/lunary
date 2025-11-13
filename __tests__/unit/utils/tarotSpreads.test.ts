import { TAROT_SPREAD_MAP } from '@/constants/tarotSpreads';
import {
  generateSpreadReading,
  hydrateStoredCards,
} from '@/utils/tarot/spreadReading';

describe('tarot spread utilities', () => {
  it('generates the correct number of cards for a spread', () => {
    const spreadSlug = 'past-present-future';
    const spread = TAROT_SPREAD_MAP[spreadSlug];
    const reading = generateSpreadReading({
      spreadSlug,
      seed: 'test-seed',
    });

    expect(reading.cards).toHaveLength(spread.cardCount);
    const uniqueCardNames = new Set(
      reading.cards.map((card) => card.card.name),
    );
    expect(uniqueCardNames.size).toBe(spread.cardCount);
  });

  it('is deterministic for the same seed and spread', () => {
    const spreadSlug = 'self-care-compass';
    const firstReading = generateSpreadReading({
      spreadSlug,
      seed: 'deterministic-seed',
    });
    const secondReading = generateSpreadReading({
      spreadSlug,
      seed: 'deterministic-seed',
    });

    expect(firstReading.cards.map((card) => card.card.name)).toEqual(
      secondReading.cards.map((card) => card.card.name),
    );
  });

  it('hydrates stored cards back into full card data', () => {
    const spreadSlug = 'decision-crossroads';
    const reading = generateSpreadReading({
      spreadSlug,
      seed: 'hydrate-seed',
    });

    const stored = reading.cards.map((card) => ({
      positionId: card.positionId,
      cardName: card.card.name,
    }));

    const hydrated = hydrateStoredCards(stored, spreadSlug);

    expect(hydrated).toHaveLength(reading.cards.length);
    hydrated.forEach((card, index) => {
      expect(card.card.name).toBe(reading.cards[index].card.name);
      expect(card.positionId).toBe(reading.cards[index].positionId);
      expect(card.insight).toContain(card.card.name);
    });
  });
});
