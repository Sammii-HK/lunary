import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY?.trim(),
});

export async function generateCatchyQuote(
  postContent: string,
  postType: string,
): Promise<string> {
  try {
    const quotePrompt = `Generate 5 catchy, standalone quote options for an Instagram image card. IMPORTANT: Prioritize famous quotes and cosmic wisdom over brand quotes.

Post content: "${postContent}"
Post type: ${postType}

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

Return JSON with quotes in this format: {"quotes": ["Quote 1 with attribution", "Quote 2 with attribution", "Quote 3 with attribution", "Quote 4 with attribution", "Quote 5 with attribution"]}
Include attribution like "- Author Name" or "- Lunary" at the end of each quote.`;

    const quoteCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a quote curator for Instagram. Your job is to find and adapt profound, cosmic quotes from famous scientists, astronomers, astrologers, and philosophers. Prioritize famous quotes (Carl Sagan, Stephen Hawking, Plato, etc.) over brand quotes. Create quotes that are shareable, inspiring, and cosmic. Mix famous quotes with occasional brand quotes. Return only valid JSON.',
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

    // Prefer quotes that are NOT Lunary quotes (more variety)
    const nonLunaryQuotes = quotes.filter(
      (q: string) =>
        !q.toLowerCase().includes('lunary') &&
        !q.toLowerCase().includes('birth chart') &&
        !q.toLowerCase().includes('cosmic blueprint'),
    );

    // Return a non-Lunary quote if available, otherwise random from all quotes
    if (nonLunaryQuotes.length > 0) {
      return nonLunaryQuotes[
        Math.floor(Math.random() * nonLunaryQuotes.length)
      ];
    }

    // Fallback: return random quote from all quotes
    if (quotes.length > 0) {
      return quotes[Math.floor(Math.random() * quotes.length)];
    }
  } catch (error) {
    console.warn('Failed to generate catchy quote, using fallback:', error);
  }

  // Fallback: extract meaningful snippet from post
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
  return `${baseUrl}/api/og/social-quote?text=${encodeURIComponent(quote)}&author=Lunary`;
}
