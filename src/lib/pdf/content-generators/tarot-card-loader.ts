/**
 * Tarot Card Loader Utility
 *
 * Loads and filters tarot cards from tarot-cards.json based on pack theme.
 */

import tarotCardsData from '@/data/tarot-cards.json';
import { PdfTarotCard } from '../schema';

interface TarotCardData {
  name: string;
  number?: number;
  element?: string;
  planet?: string;
  zodiacSign?: string;
  keywords: string[];
  information: string;
  uprightMeaning: string;
  reversedMeaning: string;
  symbolism?: string;
  loveMeaning?: string;
  careerMeaning?: string;
  affirmation?: string;
}

function convertToPdfTarotCard(card: TarotCardData): PdfTarotCard {
  return {
    name: card.name,
    number: card.number,
    suit: 'Major Arcana', // Will be set correctly based on source
    arcana: card.number !== undefined ? 'major' : 'minor',
    keywords: card.keywords,
    uprightMeaning: card.uprightMeaning,
    reversedMeaning: card.reversedMeaning,
    shadowAspect: card.reversedMeaning, // Use reversed meaning as shadow aspect
  };
}

/**
 * Get all Major Arcana cards (22 cards)
 */
export function getMajorArcanaCards(): PdfTarotCard[] {
  const majorArcana = tarotCardsData.majorArcana as Record<
    string,
    TarotCardData
  >;
  return Object.values(majorArcana).map((card) => ({
    ...convertToPdfTarotCard(card),
    suit: 'Major Arcana',
    arcana: 'major' as const,
  }));
}

/**
 * Get all cards for a specific suit (Wands, Cups, Swords, Pentacles)
 */
export function getSuitCards(
  suit: 'wands' | 'cups' | 'swords' | 'pentacles',
): PdfTarotCard[] {
  const minorArcana = tarotCardsData.minorArcana as Record<
    string,
    Record<string, TarotCardData>
  >;
  const suitData = minorArcana[suit];
  if (!suitData) return [];

  const suitNameMap: Record<string, string> = {
    wands: 'Wands',
    cups: 'Cups',
    swords: 'Swords',
    pentacles: 'Pentacles',
  };

  return Object.values(suitData).map((card) => ({
    ...convertToPdfTarotCard(card),
    suit: suitNameMap[suit],
    arcana: 'minor' as const,
  }));
}

/**
 * Get cards based on pack theme/slug
 */
export function getCardsForPack(slug: string): PdfTarotCard[] {
  const slugLower = slug.toLowerCase();

  // Major Arcana pack
  if (slugLower.includes('major') || slugLower.includes('arcana')) {
    return getMajorArcanaCards();
  }

  // Suit packs
  if (slugLower.includes('wands') || slugLower.includes('wand')) {
    return getSuitCards('wands');
  }
  if (slugLower.includes('cups') || slugLower.includes('cup')) {
    return getSuitCards('cups');
  }
  if (slugLower.includes('swords') || slugLower.includes('sword')) {
    return getSuitCards('swords');
  }
  if (slugLower.includes('pentacles') || slugLower.includes('pentacle')) {
    return getSuitCards('pentacles');
  }

  // Theme packs - select relevant cards based on keywords
  // For shadow work, relationship, career, creativity, etc., we'll select a curated set
  if (slugLower.includes('shadow')) {
    // Shadow work: cards related to introspection, transformation, hidden aspects
    const major = getMajorArcanaCards();
    return major.filter((card) =>
      [
        'The High Priestess',
        'The Hermit',
        'Death',
        'The Devil',
        'The Moon',
        'The Star',
      ].includes(card.name),
    );
  }

  if (
    slugLower.includes('relationship') ||
    slugLower.includes('love') ||
    slugLower.includes('heart')
  ) {
    // Relationship: cards related to love, partnership, emotions
    const major = getMajorArcanaCards();
    const cups = getSuitCards('cups');
    return [
      ...major.filter((card) =>
        ['The Lovers', 'The Empress'].includes(card.name),
      ),
      ...cups, // All 14 Cups cards
    ];
  }

  if (slugLower.includes('career') || slugLower.includes('abundance')) {
    // Career/Abundance: cards related to work, material success, ambition
    const major = getMajorArcanaCards();
    const pentacles = getSuitCards('pentacles');
    return [
      ...major.filter((card) =>
        [
          'The Emperor',
          'The Chariot',
          'The Wheel of Fortune',
          'The Sun',
        ].includes(card.name),
      ),
      ...pentacles, // All 14 Pentacles cards
    ];
  }

  if (slugLower.includes('creativ')) {
    // Creativity: cards related to inspiration, expression, fire energy
    const major = getMajorArcanaCards();
    const wands = getSuitCards('wands');
    return [
      ...major.filter((card) =>
        ['The Fool', 'The Magician', 'The Sun', 'The World'].includes(
          card.name,
        ),
      ),
      ...wands, // All 14 Wands cards
    ];
  }

  if (slugLower.includes('element')) {
    // Element pack: mix of cards from all suits
    return [
      ...getSuitCards('wands').slice(0, 3),
      ...getSuitCards('cups').slice(0, 3),
      ...getSuitCards('swords').slice(0, 3),
      ...getSuitCards('pentacles').slice(0, 3),
    ];
  }

  // Default: return Major Arcana if no specific match
  return getMajorArcanaCards();
}
