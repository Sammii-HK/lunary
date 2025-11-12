import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

let cachedSocialContext: string | null = null;
let cachedAIContext: string | null = null;
let cachedPostingStrategy: string | null = null;

function getSocialMediaContext(): string {
  if (cachedSocialContext) return cachedSocialContext;
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
  if (cachedPostingStrategy) return cachedPostingStrategy;
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
  if (cachedAIContext) return cachedAIContext;
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
  try {
    const { weekStart } = await request.json();

    // Trim whitespace from API key (common issue with .env files)
    const apiKey = process.env.OPENAI_API_KEY?.trim();
    const rawKey = process.env.OPENAI_API_KEY;

    // Check for all OpenAI-related env vars
    const allOpenAIVars = Object.keys(process.env)
      .filter((key) => key.toLowerCase().includes('openai'))
      .map((key) => ({
        key,
        exists: !!process.env[key],
        length: process.env[key]?.length || 0,
      }));

    // Debug logging (only first 8 chars for security)
    console.log('🔑 Weekly API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      prefix: apiKey ? `${apiKey.substring(0, 8)}...` : 'missing',
      startsWithSk: apiKey?.startsWith('sk-') || false,
      firstChars: apiKey ? apiKey.substring(0, 20) : 'none',
      originalLength: rawKey?.length || 0,
      trimmedLength: apiKey?.length || 0,
      nodeEnv: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      allOpenAIVars,
      // Check if raw value exists but is empty/whitespace
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

    // Check if it's a placeholder (but allow valid keys that start with sk-)
    if (
      apiKey &&
      !apiKey.startsWith('sk-') &&
      (apiKey.includes('your-api') ||
        apiKey.includes('placeholder') ||
        apiKey.includes('example'))
    ) {
      console.error('❌ Invalid API key detected:', {
        length: apiKey.length,
        containsPlaceholder: apiKey.includes('your-api'),
        firstChars: apiKey.substring(0, 30),
      });
      return NextResponse.json(
        {
          error: 'Invalid API key detected',
          hint: 'Your OPENAI_API_KEY appears to be a placeholder. Please set a real API key from https://platform.openai.com/account/api-keys',
        },
        { status: 400 },
      );
    }

    // Calculate week dates - always generate for the week that starts 7 days from now
    let startDate: Date;
    if (weekStart) {
      startDate = new Date(weekStart);
    } else {
      // Default to week ahead (7 days from now)
      startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
    }

    // Find the Monday of that week (week starts on Monday)
    const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Days to get to Monday
    const weekStartDate = new Date(startDate);
    weekStartDate.setDate(startDate.getDate() - daysToMonday);
    weekStartDate.setHours(0, 0, 0, 0);

    console.log(
      `📅 Generating posts for week: ${weekStartDate.toLocaleDateString()} (7 days ahead)`,
    );

    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);
    weekEndDate.setHours(23, 59, 59, 999);

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

      await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_status ON social_posts(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_platform ON social_posts(platform)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_created_at ON social_posts(created_at)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_social_posts_scheduled_date ON social_posts(scheduled_date)`;

      await sql`
        CREATE OR REPLACE FUNCTION update_social_posts_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `;

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

    // Get rejection feedback to improve tone
    const rejectionFeedback = await sql`
      SELECT rejection_feedback, platform, post_type
      FROM social_posts
      WHERE status = 'rejected' 
        AND rejection_feedback IS NOT NULL
        AND rejection_feedback != ''
      ORDER BY updated_at DESC
      LIMIT 10
    `;

    const feedbackContext =
      rejectionFeedback.rows.length > 0
        ? `\n\nIMPORTANT: Previous posts were rejected. Learn from these rejections:\n${rejectionFeedback.rows.map((r: any) => `- ${r.rejection_feedback} (${r.platform}, ${r.post_type})`).join('\n')}\n\nAvoid these issues in new posts.`
        : '';

    const { OpenAI } = await import('openai');
    console.log(
      '🤖 Creating OpenAI client with key:',
      apiKey ? `${apiKey.substring(0, 10)}...` : 'missing',
    );
    const openai = new OpenAI({ apiKey });

    // Generate posts for the week based on posting strategy
    const weeklyPosts: Array<{
      platform: string;
      postType: string;
      count: number;
      day: string;
      dayOffset: number;
    }> = [
      {
        platform: 'instagram',
        postType: 'benefit',
        count: 1,
        day: 'Monday',
        dayOffset: 0,
      },
      {
        platform: 'twitter',
        postType: 'educational',
        count: 1,
        day: 'Monday',
        dayOffset: 0,
      },
      {
        platform: 'instagram',
        postType: 'inspirational',
        count: 1,
        day: 'Tuesday',
        dayOffset: 1,
      },
      {
        platform: 'twitter',
        postType: 'behind_scenes',
        count: 1,
        day: 'Tuesday',
        dayOffset: 1,
      },
      {
        platform: 'instagram',
        postType: 'feature',
        count: 1,
        day: 'Wednesday',
        dayOffset: 2,
      },
      {
        platform: 'twitter',
        postType: 'educational',
        count: 1,
        day: 'Wednesday',
        dayOffset: 2,
      },
      {
        platform: 'instagram',
        postType: 'inspirational',
        count: 1,
        day: 'Thursday',
        dayOffset: 3,
      },
      {
        platform: 'twitter',
        postType: 'benefit',
        count: 1,
        day: 'Thursday',
        dayOffset: 3,
      },
      {
        platform: 'instagram',
        postType: 'benefit',
        count: 1,
        day: 'Friday',
        dayOffset: 4,
      },
      {
        platform: 'twitter',
        postType: 'inspirational',
        count: 1,
        day: 'Friday',
        dayOffset: 4,
      },
      {
        platform: 'instagram',
        postType: 'inspirational',
        count: 1,
        day: 'Sunday',
        dayOffset: 6,
      },
      {
        platform: 'twitter',
        postType: 'inspirational',
        count: 1,
        day: 'Sunday',
        dayOffset: 6,
      },
    ];

    const allGeneratedPosts: Array<{
      content: string;
      platform: string;
      postType: string;
      day: string;
      dayOffset: number;
    }> = [];

    for (const postPlan of weeklyPosts) {
      const platformGuidelines: Record<string, string> = {
        instagram:
          '125-150 chars optimal. Engaging, visual-focused. Use line breaks for readability.',
        twitter:
          '280 chars max. Concise, punchy. Use hashtags sparingly (1-2 max).',
      };

      const postTypeGuidelines: Record<string, string> = {
        feature:
          'Highlight a specific feature naturally. Show value, not just features.',
        benefit: 'Focus on user benefits and outcomes. What do users gain?',
        educational:
          'Teach something about astrology or astronomy. Be informative.',
        inspirational: 'Cosmic wisdom and guidance. Uplifting and empowering.',
        behind_scenes: 'How the app works. Show the real astronomy behind it.',
      };

      const prompt = `Generate 1 social media post for Lunary.

Platform: ${postPlan.platform}
Type: ${postPlan.postType}
Day: ${postPlan.day}
Week: ${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}

Platform Guidelines: ${platformGuidelines[postPlan.platform]}
Post Type Guidelines: ${postTypeGuidelines[postPlan.postType]}

Requirements:
- Use sentence case (capitalize first letter of sentences)
- Clearly explain what Lunary DOES (birth chart generation, personalized horoscopes, tarot, grimoire)
- Highlight specific USPs: personalized to exact birth chart, real astronomical calculations, free trial
- Be concrete about features, not just poetic about astrology
- Natural and conversational but informative
- Conversion-focused but not salesy
- Keep within platform character limits
- Include emojis sparingly (🌙 ✨ 🔮)
- Match the day's energy (${postPlan.day})

Return JSON: {"posts": ["Post content"]}`;

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
        max_tokens: 300,
        temperature: 0.8,
      });

      const result = JSON.parse(
        completion.choices[0]?.message?.content || '{}',
      );
      const posts = result.posts || result.post || [];
      const postContent = Array.isArray(posts) ? posts[0] : posts;

      if (postContent) {
        allGeneratedPosts.push({
          content: postContent,
          platform: postPlan.platform,
          postType: postPlan.postType,
          day: postPlan.day,
          dayOffset: postPlan.dayOffset,
        });
      }
    }

    // Generate OG image URLs for Instagram posts
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    // Save all posts to database with image URLs
    // Generate catchy quotes for Instagram posts
    const generateCatchyQuote = async (
      postContent: string,
      postType: string,
      platform: string,
    ): Promise<string> => {
      if (platform !== 'instagram') return '';

      try {
        const quotePrompt = `Generate 5 catchy, standalone quote options for an Instagram image card based on this social media post:

Post content: "${postContent}"
Post type: ${postType}

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

    const savedPostIds: string[] = [];
    for (let i = 0; i < allGeneratedPosts.length; i++) {
      const post = allGeneratedPosts[i];
      const postPlan = weeklyPosts[i];

      // Calculate the date for this post (weekStartDate + dayOffset)
      const postDate = new Date(weekStartDate);
      postDate.setDate(weekStartDate.getDate() + postPlan.dayOffset);

      const quote = await generateCatchyQuote(
        post.content,
        post.postType,
        post.platform,
      );
      const imageUrl = quote
        ? `${baseUrl}/api/og/social-quote?text=${encodeURIComponent(quote)}&author=Lunary`
        : null;

      try {
        const result = await sql`
          INSERT INTO social_posts (content, platform, post_type, status, image_url, scheduled_date, created_at)
          VALUES (${post.content}, ${post.platform}, ${post.postType}, 'pending', ${imageUrl || null}, ${postDate.toISOString()}, NOW())
          RETURNING id
        `;
        savedPostIds.push(result.rows[0].id);
      } catch (dbError) {
        console.error('Error saving post to database:', dbError);
      }
    }

    // Skip Pushover notification for weekly post generation - too noisy
    // Users can check the approval queue directly

    return NextResponse.json({
      success: true,
      message: `Generated ${savedPostIds.length} posts for the week`,
      weekRange: `${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`,
      posts: allGeneratedPosts,
      savedIds: savedPostIds,
    });
  } catch (error) {
    console.error('Error generating weekly posts:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
