import { tarotCards } from '../../../utils/tarot/tarot-cards';

export function getTarotCardByName(cardName: string): {
  name: string;
  keywords: string[];
  information: string;
} | null {
  // Search through major arcana
  for (const [key, cardData] of Object.entries(tarotCards.majorArcana)) {
    if (cardData.name === cardName) {
      return {
        name: cardData.name,
        keywords: cardData.keywords,
        information: cardData.information,
      };
    }
  }

  // Search through minor arcana suits
  const minorArcana = tarotCards.minorArcana;
  for (const suit of Object.values(minorArcana)) {
    for (const [key, cardData] of Object.entries(suit)) {
      if (cardData.name === cardName) {
        return {
          name: cardData.name,
          keywords: cardData.keywords,
          information: cardData.information,
        };
      }
    }
  }

  return null;
}
