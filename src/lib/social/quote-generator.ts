import OpenAI from 'openai';
import { sql } from '@vercel/postgres';

// Lazy initialization to avoid build-time errors when API key is not available
let openai: OpenAI | null = null;

function getOpenAI(): OpenAI {
  if (!openai) {
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }
    openai = new OpenAI({ apiKey });
  }
  return openai;
}

export interface StoredQuote {
  id: number;
  quoteText: string;
  author: string | null;
  status: 'available' | 'used' | 'archived';
  usedAt: Date | null;
  useCount: number;
  createdAt: Date;
}

function parseQuoteAndAuthor(fullQuote: string): {
  quoteText: string;
  author: string | null;
} {
  const lastDashIndex = Math.max(
    fullQuote.lastIndexOf(' - '),
    fullQuote.lastIndexOf(' — '),
  );
  if (lastDashIndex > 0) {
    const potentialAuthor = fullQuote.substring(lastDashIndex + 3).trim();
    if (potentialAuthor && /^[A-Z]/.test(potentialAuthor)) {
      return {
        quoteText: fullQuote.substring(0, lastDashIndex).trim(),
        author: potentialAuthor,
      };
    }
  }
  return { quoteText: fullQuote.trim(), author: null };
}

export async function generateQuoteBatch(): Promise<StoredQuote[]> {
  try {
    const quotePrompt = `Generate 5 unique, catchy, standalone quote options for social media image cards. IMPORTANT: Prioritize famous quotes and cosmic wisdom over brand quotes.

Requirements for quotes:
- Each quote should be standalone and shareable (works without context)
- 60-100 characters max (short and punchy)
- Catchy, memorable, and inspiring
- Can be a question, statement, or insight
- Natural and authentic, not salesy
- Use sentence case

QUOTE DISTRIBUTION (IMPORTANT):
- At least 3 out of 5 quotes should be inspired by or adapted from famous scientists, astronomers, astrologers, and philosophers
- Only 1-2 quotes should be Lunary brand quotes
- Mix the order - don't put all Lunary quotes first

Famous Quotes to Inspire From (adapt these themes or create similar style):
- "We are made of star-stuff" - Carl Sagan
- "The cosmos is within us" - Carl Sagan
- "Look up at the stars and not down at your feet" - Stephen Hawking
- "The stars are the land-marks of the universe" - Sir John Herschel
- "Astronomy compels the soul to look upward" - Plato
- "The universe is not only stranger than we imagine, it is stranger than we can imagine" - J.B.S. Haldane
- "In the cosmos, there are no absolute up or down" - Stephen Hawking
- "The cosmos is all that is or ever was or ever will be" - Carl Sagan
- "The universe is a pretty big place. If it's just us, seems like an awful waste of space." - Carl Sagan
- "Somewhere, something incredible is waiting to be known." - Carl Sagan
- "The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself." - Carl Sagan
- "The stars are the land-marks of the universe." - Sir John Herschel
- "Astronomy compels the soul to look upward and leads us from this world to another." - Plato

Lunary Brand Quotes (use sparingly - only 1-2 max):
- "Discover the universe within you, one star at a time" - Lunary
- "Your birth chart is your cosmic blueprint" - Lunary
- "The stars remember when you were born" - Lunary

Return JSON with quotes in this format: {"quotes": ["Quote 1 - Author Name", "Quote 2 - Author Name", "Quote 3 - Author Name", "Quote 4 - Author Name", "Quote 5 - Author Name"]}
Include attribution like "- Author Name" or "- Lunary" at the end of each quote.`;

    const quoteCompletion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a quote curator for social media. Your job is to find and adapt profound, cosmic quotes from famous scientists, astronomers, astrologers, and philosophers. Prioritize famous quotes (Carl Sagan, Stephen Hawking, Plato, etc.) over brand quotes. Create quotes that are shareable, inspiring, and cosmic. Mix famous quotes with occasional brand quotes. Return only valid JSON.',
        },
        { role: 'user', content: quotePrompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 500,
      temperature: 0.9,
    });

    const quoteResult = JSON.parse(
      quoteCompletion.choices[0]?.message?.content || '{}',
    );
    const quotes = quoteResult.quotes || [];

    const savedQuotes: StoredQuote[] = [];

    for (const fullQuote of quotes) {
      const { quoteText, author } = parseQuoteAndAuthor(fullQuote);

      try {
        const result = await sql`
          INSERT INTO social_quotes (quote_text, author, status)
          VALUES (${quoteText}, ${author}, 'available')
          ON CONFLICT (quote_text) DO NOTHING
          RETURNING id, quote_text, author, status, used_at, use_count, created_at
        `;

        if (result.rows.length > 0) {
          const row = result.rows[0];
          savedQuotes.push({
            id: row.id,
            quoteText: row.quote_text,
            author: row.author,
            status: row.status,
            usedAt: row.used_at,
            useCount: row.use_count,
            createdAt: row.created_at,
          });
        }
      } catch (dbError) {
        console.warn('Failed to save quote to database:', dbError);
      }
    }

    console.log(`📝 Generated and saved ${savedQuotes.length} new quotes`);
    return savedQuotes;
  } catch (error) {
    console.error('Failed to generate quote batch:', error);
    return [];
  }
}

export async function getAvailableQuoteCount(): Promise<number> {
  try {
    const result = await sql`
      SELECT COUNT(*) as count FROM social_quotes WHERE status = 'available'
    `;
    return parseInt(result.rows[0]?.count || '0', 10);
  } catch (error) {
    console.error('Failed to get available quote count:', error);
    return 0;
  }
}

export async function getAvailableQuote(): Promise<StoredQuote | null> {
  try {
    const result = await sql`
      SELECT id, quote_text, author, status, used_at, use_count, created_at
      FROM social_quotes
      WHERE status = 'available'
      ORDER BY use_count ASC, created_at ASC
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      quoteText: row.quote_text,
      author: row.author,
      status: row.status,
      usedAt: row.used_at,
      useCount: row.use_count,
      createdAt: row.created_at,
    };
  } catch (error) {
    console.error('Failed to get available quote:', error);
    return null;
  }
}

export async function markQuoteUsed(quoteId: number): Promise<void> {
  try {
    await sql`
      UPDATE social_quotes
      SET status = 'used', used_at = NOW(), use_count = use_count + 1
      WHERE id = ${quoteId}
    `;
  } catch (error) {
    console.error('Failed to mark quote as used:', error);
  }
}

export async function resetQuoteForReuse(quoteId: number): Promise<void> {
  try {
    await sql`
      UPDATE social_quotes
      SET status = 'available'
      WHERE id = ${quoteId}
    `;
  } catch (error) {
    console.error('Failed to reset quote for reuse:', error);
  }
}

export async function resetAllQuotesForReuse(): Promise<number> {
  try {
    const result = await sql`
      UPDATE social_quotes
      SET status = 'available'
      WHERE status = 'used'
      RETURNING id
    `;
    console.log(`🔄 Reset ${result.rows.length} quotes for reuse`);
    return result.rows.length;
  } catch (error) {
    console.error('Failed to reset quotes for reuse:', error);
    return 0;
  }
}

const MIN_QUOTE_POOL_SIZE = 10;

export async function generateCatchyQuote(
  postContent: string,
  postType: string,
): Promise<string> {
  try {
    let availableCount = await getAvailableQuoteCount();

    if (availableCount < MIN_QUOTE_POOL_SIZE) {
      console.log(
        `📝 Quote pool low (${availableCount}), generating new batch...`,
      );
      await generateQuoteBatch();

      if (availableCount === 0) {
        console.log('🔄 No available quotes, resetting used quotes...');
        await resetAllQuotesForReuse();
      }
    }

    const quote = await getAvailableQuote();

    if (quote) {
      await markQuoteUsed(quote.id);
      const fullQuote = quote.author
        ? `${quote.quoteText} - ${quote.author}`
        : quote.quoteText;
      return fullQuote;
    }

    console.warn('No quotes available, generating fallback...');
  } catch (error) {
    console.warn('Failed to get quote from pool, using fallback:', error);
  }

  const firstSentence = postContent.match(/^[^.!?]+[.!?]/)?.[0];
  if (firstSentence && firstSentence.length <= 100) {
    return firstSentence.trim();
  }
  const snippet = postContent.substring(0, 100);
  const lastSpace = snippet.lastIndexOf(' ');
  return lastSpace > 60
    ? snippet.substring(0, lastSpace) + '...'
    : snippet + '...';
}

export function getQuoteImageUrl(quote: string, baseUrl: string): string {
  return `${baseUrl}/api/og/social-quote?text=${encodeURIComponent(quote)}`;
}

export async function getQuotePoolStats(): Promise<{
  available: number;
  used: number;
  total: number;
}> {
  try {
    const result = await sql`
      SELECT 
        COUNT(*) FILTER (WHERE status = 'available') as available,
        COUNT(*) FILTER (WHERE status = 'used') as used,
        COUNT(*) as total
      FROM social_quotes
    `;
    const row = result.rows[0];
    return {
      available: parseInt(row?.available || '0', 10),
      used: parseInt(row?.used || '0', 10),
      total: parseInt(row?.total || '0', 10),
    };
  } catch (error) {
    console.error('Failed to get quote pool stats:', error);
    return { available: 0, used: 0, total: 0 };
  }
}
