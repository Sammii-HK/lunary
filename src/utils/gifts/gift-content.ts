/**
 * Static content generators per gift type.
 * No AI required — uses deterministic selection from static pools.
 */

import { TAROT_DECK } from '@/utils/tarot/deck';
import { getAffirmationForSign } from './affirmations';

/**
 * Simple hash function for deterministic randomness.
 */
export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

export interface TarotPullContent {
  cardName: string;
  keywords: string[];
  message: string;
  suit: string;
}

export interface CosmicEncouragementContent {
  affirmation: string;
  recipientSign: string;
}

/**
 * Generate a Tarot Pull gift.
 * Deterministic based on sender + recipient + date.
 */
export function generateTarotPull(
  senderId: string,
  recipientId: string,
  dateStr: string,
): TarotPullContent {
  const seed = simpleHash(`${senderId}:${recipientId}:${dateStr}`);
  const cardIndex = seed % TAROT_DECK.length;
  const card = TAROT_DECK[cardIndex];

  return {
    cardName: card.name,
    keywords: card.keywords,
    message: card.information,
    suit: card.suit,
  };
}

/**
 * Generate a Cosmic Encouragement gift.
 * Selects an affirmation based on recipient's sun sign.
 */
export function generateCosmicEncouragement(
  senderId: string,
  recipientSign: string,
  dateStr: string,
): CosmicEncouragementContent {
  const seed = simpleHash(`${senderId}:encouragement:${dateStr}`);
  const affirmation = getAffirmationForSign(recipientSign, seed);

  return {
    affirmation,
    recipientSign,
  };
}

/**
 * Validate gift type and generate content.
 */
export function generateGiftContent(
  giftType: string,
  senderId: string,
  recipientId: string,
  recipientSign: string,
): TarotPullContent | CosmicEncouragementContent | null {
  const dateStr = new Date().toISOString().split('T')[0];

  switch (giftType) {
    case 'tarot_pull':
      return generateTarotPull(senderId, recipientId, dateStr);
    case 'cosmic_encouragement':
      return generateCosmicEncouragement(senderId, recipientSign, dateStr);
    default:
      return null;
  }
}

/**
 * Get supported gift types.
 */
export const GIFT_TYPES = [
  {
    id: 'tarot_pull',
    name: 'Tarot Pull',
    description: 'Pull a card from the cosmic deck for your friend',
    icon: 'Sparkles',
  },
  {
    id: 'cosmic_encouragement',
    name: 'Cosmic Encouragement',
    description: 'Send a personalized affirmation based on their sign',
    icon: 'Heart',
  },
] as const;
