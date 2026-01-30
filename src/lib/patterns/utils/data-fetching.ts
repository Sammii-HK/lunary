/**
 * Shared data fetching utilities for pattern detection
 * Eliminates code duplication across pattern generators
 */

import { sql } from '@vercel/postgres';

/**
 * Extract text content from journal entry (handles JSON format)
 */
export function extractJournalContent(content: any): string {
  if (typeof content === 'string') {
    return content;
  }

  if (content && typeof content === 'object') {
    if ('text' in content) {
      return String(content.text || '');
    }
    return JSON.stringify(content);
  }

  if (content) {
    return String(content);
  }

  return '';
}

/**
 * Fetch recent journal entries (last 30 entries across all categories)
 */
export async function fetchJournalEntries(userId: string) {
  const result = await sql`
    SELECT content, tags, created_at
    FROM collections
    WHERE user_id = ${userId}
      AND category IN ('journal', 'dream', 'ritual')
    ORDER BY created_at DESC
    LIMIT 30
  `;

  return result.rows.map((row) => ({
    content: extractJournalContent(row.content),
    moodTags: Array.isArray(row.tags) ? row.tags : [],
    createdAt: row.created_at,
  }));
}

/**
 * Fetch recent dream entries and extract tags
 */
export async function fetchDreamTags(userId: string): Promise<string[]> {
  const result = await sql`
    SELECT content, tags
    FROM collections
    WHERE user_id = ${userId}
      AND category = 'dream'
    ORDER BY created_at DESC
    LIMIT 20
  `;

  return result.rows.flatMap((row) => {
    // Parse content to get dreamTags or moodTags
    let contentData = row.content;
    if (typeof row.content === 'string') {
      try {
        contentData = JSON.parse(row.content);
      } catch {
        contentData = row.content;
      }
    }

    if (contentData && typeof contentData === 'object') {
      return contentData.dreamTags || contentData.moodTags || [];
    }

    return Array.isArray(row.tags) ? row.tags : [];
  });
}

/**
 * Fetch and analyze tarot card frequency
 * Returns only cards that appear 2+ times (frequentCards logic)
 */
export async function fetchFrequentTarotCards(userId: string) {
  const result = await sql`
    SELECT cards
    FROM tarot_readings
    WHERE user_id = ${userId}
      AND archived_at IS NULL
      AND created_at >= NOW() - INTERVAL '30 days'
      AND jsonb_array_length(cards) > 1
    ORDER BY created_at DESC
  `;

  const cardFrequency = new Map<string, number>();
  const suitCounts = new Map<string, number>();

  const majors = [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
    'Wheel of Fortune',
    'Justice',
    'The Hanged Man',
    'Death',
    'Temperance',
    'The Devil',
    'The Tower',
    'The Star',
    'The Moon',
    'The Sun',
    'Judgement',
    'The World',
  ];

  for (const row of result.rows) {
    const cards = Array.isArray(row.cards) ? row.cards : [];
    for (const cardData of cards) {
      const card = cardData.card || cardData;
      const cardName = card.name || '';
      const suit = card.suit || card.arcana || 'Major Arcana';

      if (cardName) {
        cardFrequency.set(cardName, (cardFrequency.get(cardName) || 0) + 1);
      }

      suitCounts.set(suit, (suitCounts.get(suit) || 0) + 1);
    }
  }

  // Filter to frequent cards only (2+ appearances) and major arcana
  const tarotMajors = Array.from(cardFrequency.entries())
    .filter(([cardName, count]) => count >= 2 && majors.includes(cardName))
    .map(([cardName]) => cardName);

  const tarotSuits = Array.from(suitCounts.entries())
    .map(([suit, count]) => ({ suit, count }))
    .sort((a, b) => b.count - a.count);

  return { tarotMajors, tarotSuits, cardFrequency, suitCounts };
}

/**
 * Check if a card name is a Major Arcana
 */
export function isMajorArcana(cardName: string): boolean {
  const majors = [
    'The Fool',
    'The Magician',
    'The High Priestess',
    'The Empress',
    'The Emperor',
    'The Hierophant',
    'The Lovers',
    'The Chariot',
    'Strength',
    'The Hermit',
    'Wheel of Fortune',
    'Justice',
    'The Hanged Man',
    'Death',
    'Temperance',
    'The Devil',
    'The Tower',
    'The Star',
    'The Moon',
    'The Sun',
    'Judgement',
    'The World',
  ];
  return majors.includes(cardName);
}
