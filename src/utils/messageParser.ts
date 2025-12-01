import { spells as spellDatabase } from '../constants/spells';

// Cache tarot card names to avoid repeated imports
let cachedTarotCardNames: string[] | null = null;

/**
 * Initialize tarot card cache from loaded tarot cards
 * Called by component on mount to pre-populate the cache
 */
export function initializeTarotCardCache(tarotCards: any) {
  if (cachedTarotCardNames && cachedTarotCardNames.length > 0) {
    return; // Already cached
  }

  const cardNames: string[] = [];

  if (tarotCards?.majorArcana) {
    Object.values(tarotCards.majorArcana).forEach((card: any) => {
      if (card?.name) cardNames.push(card.name);
    });
  }

  if (tarotCards?.minorArcana) {
    Object.values(tarotCards.minorArcana).forEach((suit: any) => {
      if (suit && typeof suit === 'object') {
        Object.values(suit).forEach((card: any) => {
          if (card?.name) cardNames.push(card.name);
        });
      }
    });
  }

  if (cardNames.length > 0) {
    cachedTarotCardNames = cardNames;
  }
}

export type ParsedEntity = {
  type: 'tarot' | 'ritual' | 'spell';
  name: string;
  slug?: string; // URL slug for linking to grimoire
  startIndex: number;
  endIndex: number;
};

export type ParsedMessage = {
  text: string;
  entities: ParsedEntity[];
};

/**
 * Parse message content to detect tarot cards and rituals/spells
 * Returns the text with entities marked for linking
 */
export function parseMessageContent(content: string): ParsedMessage {
  const entities: ParsedEntity[] = [];
  let processedText = content;

  // Get all tarot card names
  // On client-side, this may return empty array on first call, but will populate async
  const tarotCardNames = getAllTarotCardNames();

  // If no cards loaded yet (client-side first call), return empty entities
  // The cards will load async and next parse will work
  if (tarotCardNames.length === 0 && typeof window !== 'undefined') {
    return { text: processedText, entities: [] };
  }

  // Sort by length (longest first) to match "Six of Cups" before "Six"
  tarotCardNames.sort((a, b) => b.length - a.length);

  // Find tarot card mentions
  for (const cardName of tarotCardNames) {
    const regex = new RegExp(`\\b${escapeRegex(cardName)}\\b`, 'gi');
    let match;
    while ((match = regex.exec(processedText)) !== null) {
      // Check if this match overlaps with an existing entity
      const overlaps = entities.some(
        (e) =>
          (match!.index >= e.startIndex && match!.index < e.endIndex) ||
          (match!.index + match![0].length > e.startIndex &&
            match!.index + match![0].length <= e.endIndex),
      );

      if (!overlaps) {
        entities.push({
          type: 'tarot',
          name: cardName,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  }

  // Get all spell/ritual names
  const spellNames = spellDatabase.map((spell) => spell.title);
  const ritualNames = spellDatabase
    .filter((spell) => spell.type === 'ritual')
    .map((spell) => spell.title);

  // Sort by length (longest first)
  spellNames.sort((a, b) => b.length - a.length);
  ritualNames.sort((a, b) => b.length - a.length);

  // Exclude common words that aren't actual entity names
  // These words appear in descriptions but aren't spells/rituals themselves
  const excludedWords = new Set([
    'strength',
    'power',
    'energy',
    'magic',
    'ritual',
    'spell',
    'charm',
    'protection',
    'healing',
    'love',
    'peace',
    'harmony',
    'balance',
    'wisdom',
    'truth',
    'courage',
    'confidence',
    'clarity',
    'focus',
  ]);

  // Find spell/ritual mentions
  for (const spellName of spellNames) {
    // Skip if this is an excluded common word
    if (excludedWords.has(spellName.toLowerCase())) {
      continue;
    }

    const regex = new RegExp(`\\b${escapeRegex(spellName)}\\b`, 'gi');
    let match;
    while ((match = regex.exec(processedText)) !== null) {
      // Check if this match overlaps with an existing entity
      const overlaps = entities.some(
        (e) =>
          (match!.index >= e.startIndex && match!.index < e.endIndex) ||
          (match!.index + match![0].length > e.startIndex &&
            match!.index + match![0].length <= e.endIndex),
      );

      if (!overlaps) {
        const spell = spellDatabase.find((s) => s.title === spellName);
        const isRitual = spell?.type === 'ritual';
        entities.push({
          type: isRitual ? 'ritual' : 'spell',
          name: spellName,
          slug: spell?.id,
          startIndex: match.index,
          endIndex: match.index + match[0].length,
        });
      }
    }
  }

  // Sort entities by start index
  entities.sort((a, b) => a.startIndex - b.startIndex);

  return {
    text: processedText,
    entities,
  };
}

/**
 * Get all tarot card names from the database
 */
function getAllTarotCardNames(): string[] {
  // Return cached names if available
  if (cachedTarotCardNames && cachedTarotCardNames.length > 0) {
    return cachedTarotCardNames;
  }

  // Try to load synchronously if possible (for server-side)
  // For client-side, we'll need to initialize on first use
  if (typeof window === 'undefined') {
    // Server-side: use require
    try {
      // Path: src/utils/messageParser.ts -> utils/tarot/tarot-cards.tsx
      const tarotCardsModule = require('../../utils/tarot/tarot-cards');
      const tarotCards = tarotCardsModule.tarotCards;
      const cardNames: string[] = [];

      if (tarotCards?.majorArcana) {
        Object.values(tarotCards.majorArcana).forEach((card: any) => {
          if (card?.name) cardNames.push(card.name);
        });
      }

      if (tarotCards?.minorArcana) {
        Object.values(tarotCards.minorArcana).forEach((suit: any) => {
          if (suit && typeof suit === 'object') {
            Object.values(suit).forEach((card: any) => {
              if (card?.name) cardNames.push(card.name);
            });
          }
        });
      }

      if (cardNames.length > 0) {
        cachedTarotCardNames = cardNames;
        return cardNames;
      }
    } catch (error) {
      console.error('[MessageParser] Failed to load tarot cards:', error);
    }
  } else {
    // Client-side: try to use already-loaded cards if available
    // Cards should be pre-loaded by the component
    // If not cached yet, return empty array (will work on next parse after async load)
  }

  return cachedTarotCardNames || [];
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
