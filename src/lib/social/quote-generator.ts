import OpenAI from 'openai';
import { sql } from '@vercel/postgres';
import type { ImageFormat } from '@/lib/social/educational-images';

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

export interface QuoteImageOptions {
  format?: ImageFormat;
  interpretation?: string;
  author?: string;
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
    const quotePrompt = `Generate 5 unique, catchy, standalone quote options for social media image cards. IMPORTANT: Prioritize famous quotes from thought leaders across all cosmic, mystical, and spiritual topics. Build a diverse roster of quotes.

Requirements for quotes:
- Each quote should be standalone and shareable (works without context)
- 60-100 characters max (short and punchy)
- Catchy, memorable, and inspiring
- Can be a question, statement, or insight
- Natural and authentic, not salesy
- Use sentence case

QUOTE DISTRIBUTION (CRITICAL):
- Generate 4-5 quotes from thought leaders (scientists, astronomers, astrologers, philosophers, business leaders, mystics, poets, etc.)
- Only 0-1 quote should be a Lunary brand quote (preferably 0)
- Rotate through different categories: stars/cosmos, moon, tarot, astrology, numerology, philosophy, mysticism
- Mix the order - vary categories and sources

Famous Quotes to Inspire From - Stars & Cosmos:
- "We are made of star-stuff" - Carl Sagan
- "The cosmos is within us" - Carl Sagan
- "Look up at the stars and not down at your feet" - Stephen Hawking
- "The stars are the land-marks of the universe" - Sir John Herschel
- "Astronomy compels the soul to look upward" - Plato
- "The universe is not only stranger than we imagine, it is stranger than we can imagine" - J.B.S. Haldane
- "In the cosmos, there are no absolute up or down" - Stephen Hawking
- "The cosmos is all that is or ever was or ever will be" - Carl Sagan
- "Somewhere, something incredible is waiting to be known" - Carl Sagan
- "The stars are the land-marks of the universe" - Sir John Herschel
- "Astronomy compels the soul to look upward and leads us from this world to another" - Plato
- "The universe is a pretty big place. If it's just us, seems like an awful waste of space" - Carl Sagan

Moon & Lunar Wisdom:
- "The moon is a loyal companion" - Tahereh Mafi
- "The moon lives in the lining of your skin" - Pablo Neruda
- "The moon does not fight. It attacks no one. It does not worry. It does not try to crush others" - Deng Ming-Dao
- "We are all like the bright moon, we still have our darker side" - Kahlil Gibran
- "The moon is a friend for the lonesome to talk to" - Carl Sandburg
- "The moon, like a flower in heaven's high bower, with silent delight sits and smiles on the night" - William Blake

Tarot & Divination:
- "The tarot is a mirror that reflects back to us what we already know" - Unknown
- "Tarot cards are like keys to the doors of your subconscious" - Unknown
- "The cards are a tool, but the wisdom comes from within" - Unknown
- "Tarot is a language that speaks to the soul" - Unknown
- "In the cards, we find the story of our own becoming" - Unknown

Astrology & Birth Charts:
- "Millionaires don't use astrology; billionaires do" - J.P. Morgan
- "Astrology is a language. If you understand this language, the sky speaks to you" - Dane Rudhyar
- "Astrology is just a finger pointing at reality" - Steven Forrest
- "The stars incline us, they do not bind us" - Traditional
- "Your birth chart is a map of your soul's journey" - Unknown
- "Astrology is astronomy brought down to earth and applied to the affairs of men" - Ralph Waldo Emerson

Numerology:
- "Numbers are the universal language offered by the deity to humans as confirmation of the truth" - Pythagoras
- "Numbers rule the universe" - Pythagoras
- "Everything is number" - Pythagoras
- "The universe is written in the language of mathematics" - Galileo Galilei
- "Numbers have a way of taking a man by the hand and leading him down the path of reason" - Pythagoras

Philosophical Cosmic Wisdom:
- "The cosmos is within us. We are made of star-stuff. We are a way for the universe to know itself" - Carl Sagan
- "We are not human beings having a spiritual experience. We are spiritual beings having a human experience" - Pierre Teilhard de Chardin
- "The universe is not only stranger than we imagine, it is stranger than we can imagine" - J.B.S. Haldane
- "As above, so below; as within, so without" - Hermes Trismegistus
- "The cosmos is a living being" - Plato
- "In the cosmos, there are no absolute up or down" - Stephen Hawking

Mystical & Spiritual Insights:
- "The soul always knows what to do to heal itself. The challenge is to silence the mind" - Caroline Myss
- "Magic is believing in yourself. If you can do that, you can make anything happen" - Johann Wolfgang von Goethe
- "The universe is full of magical things patiently waiting for our wits to grow sharper" - Eden Phillpotts
- "We are all connected; to each other, biologically. To the earth, chemically. To the rest of the universe, atomically" - Neil deGrasse Tyson

Lunary Brand Quotes (use only if absolutely necessary - 0-1 max):
- "Discover the universe within you, one star at a time" - Lunary
- "Your birth chart is your cosmic blueprint" - Lunary
- "The stars remember when you were born" - Lunary

Return JSON with quotes in this format: {"quotes": ["Quote 1 - Author Name", "Quote 2 - Author Name", "Quote 3 - Author Name", "Quote 4 - Author Name", "Quote 5 - Author Name"]}
Include attribution like "- Author Name" or "- Lunary" at the end of each quote. Prioritize thought leaders from diverse categories.`;

    const quoteCompletion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a quote curator for social media specializing in cosmic, mystical, and spiritual wisdom. Your job is to find and adapt profound quotes from thought leaders across diverse categories: scientists, astronomers, astrologers, philosophers, business leaders, mystics, tarot readers, numerologists, and poets. Prioritize famous quotes from thought leaders (Carl Sagan, Stephen Hawking, J.P. Morgan, Plato, Pythagoras, etc.) over brand quotes. Create quotes that are shareable, inspiring, and cover topics like stars, cosmos, moon, tarot, astrology, numerology, and mystical wisdom. Generate 4-5 thought leader quotes per batch, with 0-1 brand quotes maximum. Rotate through different categories for variety. Return only valid JSON.',
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

export interface QuoteWithInterpretation {
  quote: string;
  interpretation: string;
  author: string | null;
}

/**
 * Generate interpretation for a quote
 */
export async function generateQuoteInterpretation(
  quote: string,
  author: string | null,
): Promise<string> {
  try {
    const prompt = `Generate a gentle, authoritative interpretation (2-3 sentences) for this quote:

Quote: "${quote}"
${author ? `Author: ${author}` : ''}

Requirements:
- Show authority and depth - demonstrate understanding
- Be gentle and accessible, not academic
- Connect the quote to cosmic/spiritual wisdom naturally
- Optionally mention: "This wisdom is woven through Lunary's Grimoire" or "Explore this in Lunary's Grimoire" - but only if contextually relevant
- No urgency, no benefit stacking, no "download now"
- Position Lunary as a library/reference, not a product
- 2-3 sentences maximum

Return ONLY the interpretation text, no markdown, no quotes.`;

    const completion = await getOpenAI().chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a wise interpreter of cosmic and spiritual quotes. Your interpretations show authority and guide people gently to deeper learning. You position Lunary as a reference library, not a product.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content?.trim() || '';
  } catch (error) {
    console.error('Failed to generate quote interpretation:', error);
    return '';
  }
}

/**
 * Get quote with interpretation
 */
export async function getQuoteWithInterpretation(
  postContent: string,
  postType: string,
): Promise<QuoteWithInterpretation | null> {
  try {
    const quote = await generateCatchyQuote(postContent, postType);
    if (!quote) {
      return null;
    }

    const { quoteText, author } = parseQuoteAndAuthor(quote);
    const interpretation = await generateQuoteInterpretation(quoteText, author);

    return {
      quote: quoteText,
      interpretation,
      author,
    };
  } catch (error) {
    console.error('Failed to get quote with interpretation:', error);
    return null;
  }
}

export function getQuoteImageUrl(
  quote: string,
  baseUrl: string,
  options?: QuoteImageOptions,
): string {
  const params = new URLSearchParams({
    text: quote,
  });

  if (options?.interpretation) {
    params.set('interpretation', options.interpretation);
  }
  if (options?.author) {
    params.set('author', options.author);
  }
  if (options?.format) {
    params.set('format', options.format);
  }

  return `${baseUrl}/api/og/social-quote?${params.toString()}`;
}

export function getQuoteWithInterpretationImageUrl(
  quote: string,
  interpretation: string,
  baseUrl: string,
  options?: Omit<QuoteImageOptions, 'interpretation'>,
): string {
  return getQuoteImageUrl(quote, baseUrl, {
    ...options,
    interpretation,
  });
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
