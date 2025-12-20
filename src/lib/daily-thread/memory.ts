import { sql } from '@vercel/postgres';
import dayjs from 'dayjs';
import { DailyThreadModule } from './types';

/**
 * Generate a memory module showing past journal entries or tarot pulls from the same date
 * in prior weeks/months/years
 */
export async function generateMemoryModule(
  userId: string,
  date: Date,
): Promise<DailyThreadModule | null> {
  try {
    const targetDate = dayjs(date);
    const targetMonth = targetDate.month();
    const targetDay = targetDate.date();

    // Look back up to 2 years for memories
    const twoYearsAgo = targetDate.subtract(2, 'year');

    // Query journal entries from same date in previous years
    const journalResult = await sql`
      SELECT id, title, content, created_at
      FROM collections
      WHERE user_id = ${userId}
      AND category IN ('journal', 'dream')
      AND EXTRACT(MONTH FROM created_at) = ${targetMonth + 1}
      AND EXTRACT(DAY FROM created_at) = ${targetDay}
      AND created_at < ${targetDate.toISOString()}
      AND created_at >= ${twoYearsAgo.toISOString()}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // Query tarot readings from same date
    const tarotResult = await sql`
      SELECT cards, spread_name, created_at
      FROM tarot_readings
      WHERE user_id = ${userId}
      AND archived_at IS NULL
      AND EXTRACT(MONTH FROM created_at) = ${targetMonth + 1}
      AND EXTRACT(DAY FROM created_at) = ${targetDay}
      AND created_at < ${targetDate.toISOString()}
      AND created_at >= ${twoYearsAgo.toISOString()}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    // If no memories found, return null
    if (journalResult.rows.length === 0 && tarotResult.rows.length === 0) {
      return null;
    }

    // Calculate relative time
    let relativeTime = '';
    let journalSnippet = '';
    let tarotCard = '';
    let moonPhase: string | undefined;

    if (journalResult.rows.length > 0) {
      const journalRow = journalResult.rows[0];
      const journalDate = dayjs(journalRow.created_at);
      const daysDiff = targetDate.diff(journalDate, 'day');
      const weeksDiff = Math.floor(daysDiff / 7);
      const monthsDiff = targetDate.diff(journalDate, 'month');
      const yearsDiff = targetDate.diff(journalDate, 'year');

      if (yearsDiff > 0) {
        relativeTime = `${yearsDiff} ${yearsDiff === 1 ? 'year' : 'years'} ago`;
      } else if (monthsDiff > 0) {
        relativeTime = `${monthsDiff} ${monthsDiff === 1 ? 'month' : 'months'} ago`;
      } else if (weeksDiff > 0) {
        relativeTime = `${weeksDiff} ${weeksDiff === 1 ? 'week' : 'weeks'} ago`;
      } else {
        relativeTime = `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} ago`;
      }

      // Extract journal snippet
      const contentData =
        typeof journalRow.content === 'string'
          ? JSON.parse(journalRow.content)
          : journalRow.content;
      const text = contentData.text || '';
      journalSnippet =
        journalRow.title || text.substring(0, 100).replace(/\n/g, ' ').trim();
      if (journalSnippet.length > 100) {
        journalSnippet = journalSnippet.substring(0, 100) + '...';
      }

      // Extract moon phase if available
      moonPhase = contentData.moonPhase || undefined;
    }

    if (tarotResult.rows.length > 0) {
      const tarotRow = tarotResult.rows[0];
      const cards = Array.isArray(tarotRow.cards)
        ? tarotRow.cards
        : JSON.parse(tarotRow.cards || '[]');
      if (cards.length > 0) {
        const firstCard = cards[0];
        tarotCard = firstCard.name || firstCard.card?.name || '';
      }

      // If we don't have relative time from journal, calculate from tarot
      if (!relativeTime) {
        const tarotDate = dayjs(tarotRow.created_at);
        const daysDiff = targetDate.diff(tarotDate, 'day');
        const weeksDiff = Math.floor(daysDiff / 7);
        const monthsDiff = targetDate.diff(tarotDate, 'month');
        const yearsDiff = targetDate.diff(tarotDate, 'year');

        if (yearsDiff > 0) {
          relativeTime = `${yearsDiff} ${yearsDiff === 1 ? 'year' : 'years'} ago`;
        } else if (monthsDiff > 0) {
          relativeTime = `${monthsDiff} ${monthsDiff === 1 ? 'month' : 'months'} ago`;
        } else if (weeksDiff > 0) {
          relativeTime = `${weeksDiff} ${weeksDiff === 1 ? 'week' : 'weeks'} ago`;
        } else {
          relativeTime = `${daysDiff} ${daysDiff === 1 ? 'day' : 'days'} ago`;
        }
      }
    }

    // Build module
    const parts: string[] = [];
    if (journalSnippet) {
      parts.push(journalSnippet);
    }
    if (tarotCard) {
      parts.push(`You pulled ${tarotCard}`);
    }

    const body =
      parts.length > 0 ? parts.join('. ') : 'You had an entry on this day.';

    const moduleId = `memory-${targetDate.format('YYYY-MM-DD')}`;

    return {
      id: moduleId,
      type: 'memory',
      level: 2, // Level 2-3 only
      title: `On this day, ${relativeTime}`,
      body,
      meta: {
        relativeTime,
        journalSnippet: journalSnippet || undefined,
        tarotCard: tarotCard || undefined,
        moonPhase,
      },
      actions: [
        ...(journalResult.rows.length > 0
          ? [
              {
                label: 'Open past entry',
                intent: 'view' as const,
                href: `/journal?entry=${journalResult.rows[0].id}`,
              },
            ]
          : []),
        {
          label: 'Reflect now',
          intent: 'journal' as const,
          payload: {
            prompt: `Reflecting on what you wrote ${relativeTime}: ${journalSnippet || 'this memory'}`,
          },
        },
        {
          label: 'Dismiss',
          intent: 'dismiss' as const,
        },
      ],
      priority: 40,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[Daily Thread] Error generating memory module:', error);
    return null;
  }
}
