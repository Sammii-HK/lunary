import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

let cachedSocialContext: string | null = null;
let cachedAIContext: string | null = null;
let cachedPostingStrategy: string | null = null;

function getSocialMediaContext(): string {
  if (cachedSocialContext) {
    return cachedSocialContext;
  }

  try {
    const contextPath = join(process.cwd(), 'docs', 'SOCIAL_MEDIA_CONTEXT.md');
    cachedSocialContext = readFileSync(contextPath, 'utf-8');
    return cachedSocialContext;
  } catch (error) {
    cachedSocialContext = `Lunary: Cosmic astrology app. Personalized birth charts, horoscopes, tarot. Free trial → paid ($4.99/mo or $39.99/yr). Focus: personalization, real astronomy, cosmic/spiritual tone.`;
    return cachedSocialContext;
  }
}

function getPostingStrategy(): string {
  if (cachedPostingStrategy) {
    return cachedPostingStrategy;
  }

  try {
    const strategyPath = join(process.cwd(), 'docs', 'POSTING_STRATEGY.md');
    cachedPostingStrategy = readFileSync(strategyPath, 'utf-8');
    return cachedPostingStrategy;
  } catch (error) {
    cachedPostingStrategy = '';
    return cachedPostingStrategy;
  }
}

function getAIContext(): string {
  if (cachedAIContext) {
    return cachedAIContext;
  }

  try {
    const contextPath = join(process.cwd(), 'docs', 'AI_CONTEXT.md');
    cachedAIContext = readFileSync(contextPath, 'utf-8');
    return cachedAIContext;
  } catch (error) {
    cachedAIContext = `Lunary: Cosmic astrology app. Personalized birth charts, horoscopes, tarot. Free trial → paid ($4.99/mo or $39.99/yr). Focus: personalization, real astronomy, cosmic/spiritual tone.`;
    return cachedAIContext;
  }
}

const SOCIAL_CONTEXT = getSocialMediaContext();
const AI_CONTEXT = getAIContext();
const POSTING_STRATEGY = getPostingStrategy();

export async function POST(request: NextRequest) {
  // Trim whitespace from API key (common issue with .env files)
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  const rawKey = process.env.OPENAI_API_KEY;

  try {
    const {
      postType,
      platform,
      topic,
      tone,
      includeCTA,
      count = 3,
    } = await request.json();

    // Check for all OpenAI-related env vars
    const allOpenAIVars = Object.keys(process.env)
      .filter((key) => key.toLowerCase().includes('openai'))
      .map((key) => ({
        key,
        exists: !!process.env[key],
        length: process.env[key]?.length || 0,
      }));

    // Debug logging (only first 8 chars for security)
    console.log('🔑 API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      prefix: apiKey ? `${apiKey.substring(0, 8)}...` : 'missing',
      startsWithSk: apiKey?.startsWith('sk-') || false,
      originalLength: rawKey?.length || 0,
      trimmedLength: apiKey?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      allOpenAIVars,
      rawExists: !!rawKey,
      rawIsEmpty: rawKey === '',
      rawIsWhitespace: rawKey?.trim() === '',
    });

    if (!apiKey) {
      const isProduction =
        process.env.NODE_ENV === 'production' ||
        process.env.VERCEL_ENV === 'production';
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured',
          hint: isProduction
            ? 'Set OPENAI_API_KEY in Vercel Dashboard > Settings > Environment Variables > Production. After adding, redeploy the project.'
            : 'Set OPENAI_API_KEY in your .env.local file and restart your dev server',
          debug: {
            nodeEnv: process.env.NODE_ENV,
            vercelEnv: process.env.VERCEL_ENV,
            allOpenAIVars,
            rawKeyExists: !!rawKey,
            rawKeyLength: rawKey?.length || 0,
          },
        },
        { status: 400 },
      );
    }

    // Ensure table exists first
    const { sql } = await import('@vercel/postgres');
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS social_posts (
          id SERIAL PRIMARY KEY,
          content TEXT NOT NULL,
          platform TEXT NOT NULL,
          post_type TEXT NOT NULL,
          topic TEXT,
          scheduled_date TIMESTAMP WITH TIME ZONE,
          status TEXT NOT NULL DEFAULT 'pending',
          rejection_feedback TEXT,
          image_url TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      // Create indexes if they don't exist
      await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_date ON social_posts(scheduled_date)`;

      // Create trigger function if it doesn't exist
      await sql`
        CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;

      // Create trigger if it doesn't exist
      await sql`
        DROP TRIGGER IF EXISTS update_social_posts_timestamp ON social_posts
      `;

      await sql`
        CREATE TRIGGER update_social_posts_timestamp
        BEFORE UPDATE ON social_posts
        FOR EACH ROW
        EXECUTE FUNCTION update_social_posts_updated_at()
      `;

      // Add image_url column if it doesn't exist (for existing tables)
      try {
        const columnExists = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='social_posts' AND column_name='image_url'
        `;
        if (columnExists.rows.length === 0) {
          await sql`ALTER TABLE social_posts ADD COLUMN image_url TEXT`;
        }
      } catch (alterError) {
        console.warn('Could not add image_url column:', alterError);
      }
    } catch (tableError) {
      console.warn(
        'Table creation check failed (may already exist):',
        tableError,
      );
    }

    // Get rejection feedback to improve tone (now that table exists)
    let rejectionFeedback;
    try {
      rejectionFeedback = await sql`
        SELECT rejection_feedback, platform, post_type
        FROM social_posts
        WHERE status = 'rejected' 
          AND rejection_feedback IS NOT NULL
          AND rejection_feedback != ''
        ORDER BY updated_at DESC
        LIMIT 10
      `;
    } catch (queryError) {
      console.warn('Could not fetch rejection feedback:', queryError);
      rejectionFeedback = { rows: [] };
    }

    const feedbackContext =
      rejectionFeedback.rows.length > 0
        ? `\n\nIMPORTANT: Previous posts were rejected. Learn from these rejections:\n${rejectionFeedback.rows.map((r: any) => `- ${r.rejection_feedback} (${r.platform}, ${r.post_type})`).join('\n')}\n\nAvoid these issues in new posts.`
        : '';

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    const platformGuidelines: Record<string, string> = {
      instagram:
        '125-150 chars optimal. Engaging, visual-focused. Use line breaks for readability.',
      twitter:
        '280 chars max. Concise, punchy. Use hashtags sparingly (1-2 max).',
      facebook: '40-80 chars optimal. Conversational, community-focused.',
      linkedin: '150-300 chars. Professional but warm. Focus on value.',
      pinterest: 'Descriptive, keyword-rich. Include call-to-action.',
      reddit: 'Natural, community-focused. No salesy language.',
    };

    const postTypeGuidelines: Record<string, string> = {
      feature:
        'Explain what Lunary does: generates birth charts, personalized horoscopes, tarot readings, grimoire. Be specific about features.',
      benefit:
        'Focus on concrete benefits: personalized horoscopes based on YOUR chart (not generic), real astronomical calculations, free trial, digital grimoire included.',
      educational:
        'Explain how Lunary works: uses your exact birth time/date/location to calculate planetary positions, then personalizes everything to your chart.',
      inspirational:
        'Connect cosmic wisdom to what Lunary provides: personalized insights based on your unique birth chart, not generic zodiac signs.',
      behind_scenes:
        'Explain the real astronomy: Lunary calculates actual planetary positions from your birth data, then uses that for personalized horoscopes and tarot.',
      promotional:
        'Highlight free trial (7 days - credit card required but no payment taken), what you get (birth chart, personalized horoscopes, tarot, grimoire), and pricing ($4.99/mo).',
      user_story:
        'Show concrete value: users get personalized horoscopes based on their exact chart, not generic zodiac signs. Real astronomical data, not generic predictions.',
    };

    const prompt = `Generate ${count} social media posts for Lunary.

Platform: ${platform || 'general'}
Type: ${postType || 'benefit'}
${topic ? `Topic: ${topic}` : ''}
${tone ? `Tone: ${tone}` : 'Natural, cosmic, warm'}
${includeCTA ? 'Include CTA: Yes' : 'Include CTA: No'}

Platform Guidelines: ${platformGuidelines[platform || 'general'] || 'Natural, engaging'}
Post Type Guidelines: ${postTypeGuidelines[postType || 'benefit'] || 'Natural, valuable'}

Requirements:
- Use sentence case (capitalize first letter of sentences)
- Clearly explain what Lunary DOES (birth chart generation, personalized horoscopes, tarot, grimoire)
- Highlight specific USPs: personalized to exact birth chart, real astronomical calculations, free trial
- Be concrete about features, not just poetic about astrology
- Natural and conversational but informative
- Conversion-focused but not salesy
- Keep within platform character limits
- Include emojis sparingly (🌙 ✨ 🔮)
${includeCTA ? '- Include clear but natural CTA' : '- No explicit CTA needed'}

Return JSON: {"posts": ["Post 1", "Post 2", ...]}`;

    console.log('🤖 Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `${SOCIAL_CONTEXT}\n\n${AI_CONTEXT}\n\n${POSTING_STRATEGY}${feedbackContext}\n\nYou are a social media marketing expert for Lunary. Follow the Lunary Orbit strategy. Create natural, engaging posts that convert. Return only valid JSON.`,
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 800,
      temperature: 0.8,
    });
    console.log('✅ OpenAI API call successful');

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const posts = result.posts || result.post || [];
    const postsArray = Array.isArray(posts) ? posts : [posts];

    // Save posts to database (table already exists from earlier check)
    const savedPostIds: string[] = [];
    const dbErrors: string[] = [];

    // Generate OG image URL for Instagram posts
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    // Generate catchy quotes for Instagram posts
    const generateCatchyQuote = async (
      postContent: string,
      postType: string,
      topic?: string,
    ): Promise<string> => {
      if (platform !== 'instagram') return '';

      try {
        const quotePrompt = `Generate 5 catchy, standalone quote options for an Instagram image card based on this social media post:

Post content: "${postContent}"
Post type: ${postType}
${topic ? `Topic: ${topic}` : ''}

Requirements for quotes:
- Each quote should be standalone and shareable (works without context)
- 60-100 characters max (short and punchy)
- Catchy, memorable, and inspiring
- Should highlight Lunary's value: personalized birth charts, real astronomy, cosmic insights
- Can be a question, statement, or insight
- Natural and authentic, not salesy
- Use sentence case

INSPIRATION: Mix Lunary's own brand quotes with quotes inspired by famous scientists, astronomers, astrologers, and philosophers who spoke about the cosmos, stars, and celestial wisdom.

Lunary Brand Quotes (use these or create similar):
- "Discover the universe within you, one star at a time"
- "Your birth chart is your cosmic blueprint"
- "The stars remember when you were born"
- "Personalized insights from the cosmos, just for you"
- "Your cosmic story begins with your exact moment of birth"
- "Real astronomy meets personal insight"
- "The universe wrote your story in the stars"

Famous Quotes (adapt these themes or use similar style):
- "We are made of star-stuff" (Carl Sagan)
- "The cosmos is within us" (Carl Sagan)
- "Look up at the stars and not down at your feet" (Stephen Hawking)
- "The stars are the land-marks of the universe" (Sir John Herschel)
- "Astronomy compels the soul to look upward" (Plato)
- "The universe is not only stranger than we imagine, it is stranger than we can imagine" (J.B.S. Haldane)
- "In the cosmos, there are no absolute up or down" (Stephen Hawking)
- "The cosmos is all that is or ever was or ever will be" (Carl Sagan)

Mix Lunary's own quotes with famous quotes. Create quotes that feel profound, cosmic, and connected to astrology/astronomy. When using Lunary quotes, attribute to "Lunary". When adapting famous quotes, you can attribute to the original author or create new quotes in their style.

Return JSON: {"quotes": ["Quote 1", "Quote 2", "Quote 3", "Quote 4", "Quote 5"]}`;

        const quoteCompletion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `${SOCIAL_CONTEXT}\n\n${AI_CONTEXT}\n\nYou are a quote writer for Lunary. Create catchy, shareable quotes inspired by famous scientists, astronomers, astrologers, and philosophers. The quotes should be cosmic, celestial, and profound - similar to quotes from Carl Sagan, Stephen Hawking, Plato, and other great minds who spoke about the cosmos. Return only valid JSON.`,
            },
            { role: 'user', content: quotePrompt },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 400,
          temperature: 0.9,
        });

        const quoteResult = JSON.parse(
          quoteCompletion.choices[0]?.message?.content || '{}',
        );
        const quotes = quoteResult.quotes || [];
        // Return the first (best) quote, or fallback to extracting from post
        if (quotes.length > 0 && quotes[0]) {
          return quotes[0];
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
    };

    for (const postContent of postsArray) {
      // Generate catchy quote for Instagram posts
      const quote =
        platform === 'instagram'
          ? await generateCatchyQuote(postContent, postType || 'benefit', topic)
          : '';
      const imageUrl = quote
        ? `${baseUrl}/api/og/social-quote?text=${encodeURIComponent(quote)}&author=Lunary`
        : null;
      try {
        const insertResult = await sql`
          INSERT INTO social_posts (content, platform, post_type, topic, status, image_url, created_at)
          VALUES (${postContent}, ${platform}, ${postType}, ${topic || null}, 'pending', ${imageUrl || null}, NOW())
          RETURNING id
        `;
        savedPostIds.push(insertResult.rows[0].id);
      } catch (dbError: any) {
        const errorMsg = dbError?.message || 'Unknown database error';
        console.error('Error saving post to database:', dbError);
        dbErrors.push(errorMsg);
      }
    }

    // If no posts were saved and there were errors, throw an error
    if (savedPostIds.length === 0 && dbErrors.length > 0) {
      throw new Error(`Failed to save posts to database: ${dbErrors[0]}`);
    }

    // Skip Pushover notification for manual post generation - too noisy
    // Users can check the approval queue directly

    return NextResponse.json({
      success: true,
      posts: postsArray,
      platform,
      postType,
      count: postsArray.length,
      savedIds: savedPostIds,
    });
  } catch (error: any) {
    console.error('Error generating social media posts:', error);

    // Check for OpenAI API errors
    if (
      error?.status === 401 ||
      error?.code === 'invalid_api_key' ||
      error?.message?.includes('401') ||
      error?.message?.includes('Incorrect API key') ||
      error?.message?.includes('Unauthorized')
    ) {
      const apiKeyPreview = apiKey ? `${apiKey.substring(0, 8)}...` : 'not set';
      const isPlaceholder =
        apiKey?.includes('your-api') ||
        apiKey?.includes('placeholder') ||
        apiKey?.includes('example');

      return NextResponse.json(
        {
          success: false,
          error: 'OpenAI API authentication failed',
          hint: isPlaceholder
            ? 'Your OPENAI_API_KEY appears to be a placeholder. Please set a real API key from https://platform.openai.com/account/api-keys'
            : 'Check that your OPENAI_API_KEY is valid and has not expired. Get a new key at https://platform.openai.com/account/api-keys',
          details: error?.message || 'Invalid API key',
          apiKeyPreview: isPlaceholder ? 'Placeholder detected' : apiKeyPreview,
        },
        { status: 401 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error?.message,
      },
      { status: 500 },
    );
  }
}
