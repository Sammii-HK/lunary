import { sql } from '@vercel/postgres';
import {
  generateQuoteBatch,
  getQuoteImageUrl,
} from '@/lib/social/quote-generator';
import { getPlatformImageFormat } from '@/lib/social/educational-images';

const LOOKAHEAD_DAYS = 7;
const FALLBACK_QUOTE_TEXT =
  'The cosmos shows up whether we notice it or not, so show up for yourself today.';
const FALLBACK_QUOTE_AUTHOR = 'Lunary';

export type PinterestQuoteSlotStatus = 'pending' | 'sent';

export interface PinterestQuoteSlot {
  id: number;
  quoteId: number | null;
  quoteText: string;
  quoteAuthor: string | null;
  scheduledDate: string;
  imageUrl: string | null;
  status: PinterestQuoteSlotStatus;
}

async function selectQuoteForPinterest(
  reservedQuoteIds: Set<number>,
): Promise<{ id: number; quoteText: string; author: string | null } | null> {
  const attemptSelection = async () => {
    const candidates = await sql`
      SELECT id, quote_text, author
      FROM social_quotes
      WHERE status = 'available'
      ORDER BY pinterest_use_count ASC, use_count ASC, created_at ASC
      LIMIT 10
    `;

    for (const candidate of candidates.rows) {
      if (reservedQuoteIds.has(candidate.id)) {
        continue;
      }

      try {
        await sql`
          UPDATE social_quotes
          SET pinterest_use_count = pinterest_use_count + 1,
              pinterest_last_scheduled_at = NOW()
          WHERE id = ${candidate.id}
        `;
      } catch (updateError) {
        console.warn(
          '[PinterestQueue] Failed to update quote metadata:',
          updateError,
        );
      }

      return {
        id: candidate.id,
        quoteText: candidate.quote_text,
        author: candidate.author,
      };
    }

    return null;
  };

  let quote = await attemptSelection();
  if (!quote) {
    try {
      await generateQuoteBatch();
    } catch (generationError) {
      console.warn(
        '[PinterestQueue] Failed to replenish quote pool:',
        generationError,
      );
    }
    quote = await attemptSelection();
  }

  return quote;
}

export async function ensurePinterestQuoteQueue(
  startDateStr: string,
  baseUrl: string,
  lookaheadDays = LOOKAHEAD_DAYS,
): Promise<void> {
  const startDate = new Date(`${startDateStr}T00:00:00Z`);
  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + lookaheadDays - 1);
  const endDateStr = endDate.toISOString().split('T')[0];

  const existingRows = await sql`
    SELECT scheduled_date, quote_id
    FROM pinterest_quote_queue
    WHERE scheduled_date BETWEEN ${startDateStr}::date AND ${endDateStr}::date
  `;

  const scheduledDates = new Set(
    existingRows.rows.map(
      (row) => new Date(row.scheduled_date).toISOString().split('T')[0],
    ),
  );
  const reservedQuoteIds = new Set<number>();
  for (const row of existingRows.rows) {
    if (row.quote_id) {
      reservedQuoteIds.add(row.quote_id);
    }
  }

  const format = getPlatformImageFormat('pinterest');

  for (let i = 0; i < lookaheadDays; i++) {
    const currentDate = new Date(startDate);
    currentDate.setUTCDate(startDate.getUTCDate() + i);
    const scheduledDateStr = currentDate.toISOString().split('T')[0];
    if (scheduledDates.has(scheduledDateStr)) {
      continue;
    }

    const quote = await selectQuoteForPinterest(reservedQuoteIds);
    const quoteText = quote?.quoteText ?? FALLBACK_QUOTE_TEXT;
    const quoteAuthor = quote?.author ?? FALLBACK_QUOTE_AUTHOR;
    const imageUrl = getQuoteImageUrl(quoteText, baseUrl, {
      author: quoteAuthor || undefined,
      format,
    });

    try {
      await sql`
        INSERT INTO pinterest_quote_queue (quote_id, quote_text, quote_author, scheduled_date, image_url)
        VALUES (${quote?.id ?? null}, ${quoteText}, ${quoteAuthor}, ${scheduledDateStr}, ${imageUrl})
      `;
      scheduledDates.add(scheduledDateStr);
      if (quote?.id) {
        reservedQuoteIds.add(quote.id);
      }
    } catch (insertError) {
      console.warn(
        '[PinterestQueue] Failed to enqueue quote for',
        scheduledDateStr,
        insertError,
      );
    }
  }
}

export async function getPinterestQuoteForDate(
  dateStr: string,
): Promise<PinterestQuoteSlot | null> {
  try {
    const result = await sql`
      SELECT id, quote_id, quote_text, quote_author, image_url, status, scheduled_date
      FROM pinterest_quote_queue
      WHERE scheduled_date = ${dateStr}::date
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const scheduledDate = new Date(row.scheduled_date);
    return {
      id: row.id,
      quoteId: row.quote_id,
      quoteText: row.quote_text,
      quoteAuthor: row.quote_author,
      scheduledDate: scheduledDate.toISOString().split('T')[0],
      imageUrl: row.image_url,
      status: (row.status as PinterestQuoteSlotStatus) ?? 'pending',
    };
  } catch (error) {
    console.warn('[PinterestQueue] Failed to fetch quote slot:', error);
    return null;
  }
}

export async function markPinterestQuoteSent(id: number): Promise<void> {
  try {
    await sql`
      UPDATE pinterest_quote_queue
      SET status = 'sent',
          sent_at = NOW()
      WHERE id = ${id}
    `;
  } catch (error) {
    console.warn('[PinterestQueue] Failed to mark slot as sent:', error);
  }
}
