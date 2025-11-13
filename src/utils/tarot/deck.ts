import { tarotCards } from '../../../utils/tarot/tarot-cards';

export type TarotSuit = 'Major' | 'Cups' | 'Wands' | 'Swords' | 'Pentacles';

export interface TarotDeckCard {
  name: string;
  keywords: string[];
  information: string;
  suit: TarotSuit;
  arcana: 'major' | 'minor';
}

const buildDeck = (): TarotDeckCard[] => {
  const deck: TarotDeckCard[] = [];

  Object.values(tarotCards.majorArcana).forEach((card) => {
    deck.push({
      name: card.name,
      keywords: card.keywords,
      information: card.information,
      suit: 'Major',
      arcana: 'major',
    });
  });

  (['cups', 'wands', 'swords', 'pentacles'] as const).forEach((suitKey) => {
    const suitCards = tarotCards.minorArcana[suitKey];

    Object.values(suitCards).forEach((card) => {
      deck.push({
        name: card.name,
        keywords: card.keywords,
        information: card.information,
        suit:
          suitKey === 'cups'
            ? 'Cups'
            : suitKey === 'wands'
              ? 'Wands'
              : suitKey === 'swords'
                ? 'Swords'
                : 'Pentacles',
        arcana: 'minor',
      });
    });
  });

  return deck;
};

export const TAROT_DECK: TarotDeckCard[] = buildDeck();

export const getTarotCardByName = (
  cardName: string,
): TarotDeckCard | undefined =>
  TAROT_DECK.find((card) => card.name === cardName);
