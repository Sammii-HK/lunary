import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  selectSubredditForPostType,
  getSubredditsForPostType,
} from '@/config/reddit-subreddits';

let cachedSocialContext: string | null = null;
let cachedAIContext: string | null = null;
let cachedPostingStrategy: string | null = null;
let cachedCompetitorContext: string | null = null;

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

function getCompetitorContext(): string {
  if (cachedCompetitorContext) {
    return cachedCompetitorContext;
  }

  try {
    const contextPath = join(process.cwd(), 'docs', 'BEAT_COMPETITORS_SEO.md');
    const fullContent = readFileSync(contextPath, 'utf-8');

    // Extract just the competitive advantages section and reframe positively
    // Focus on what Lunary does best, not direct competitor comparisons
    cachedCompetitorContext = `## What Makes Lunary Best:

1. **Real Astronomical Data** - Lunary uses actual astronomical calculations based on real planetary positions. Every calculation is precise and scientifically accurate.

2. **Personalized to Exact Birth Chart** - Lunary personalizes everything to YOUR exact birth time, date, and location. Not generic zodiac signs - your unique cosmic blueprint.

3. **Comprehensive Grimoire** - Lunary includes a complete digital grimoire with spells, rituals, crystal guides, and magical correspondences. Rich, detailed content.

4. **Free Trial** - Lunary offers a 7-day free trial (credit card required but no payment taken). Try before you commit.

When creating posts, emphasize these strengths naturally. Focus on what Lunary does exceptionally well, not comparisons to others.`;
    return cachedCompetitorContext;
  } catch (error) {
    // Fallback: key strengths (positive framing)
    cachedCompetitorContext = `## What Makes Lunary Best:
1. Real Astronomical Data - Uses actual astronomical calculations based on real planetary positions
2. Personalized to Exact Birth Chart - Everything personalized to YOUR exact birth time, date, location
3. Comprehensive Grimoire - Complete digital grimoire with spells, rituals, crystal guides
4. Free Trial - 7-day trial, credit card required but no payment taken

Focus on these strengths naturally. Emphasize what Lunary does exceptionally well.`;
    return cachedCompetitorContext;
  }
}

const SOCIAL_CONTEXT = getSocialMediaContext();
const AI_CONTEXT = getAIContext();
const POSTING_STRATEGY = getPostingStrategy();
const COMPETITOR_CONTEXT = getCompetitorContext();

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
      weekOffset = 0,
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

      // Create social_quotes table for quote pool
      await sql`
        CREATE TABLE IF NOT EXISTS social_quotes (
          id SERIAL PRIMARY KEY,
          quote_text TEXT NOT NULL UNIQUE,
          author TEXT,
          status TEXT NOT NULL DEFAULT 'available',
          used_at TIMESTAMP WITH TIME ZONE,
          use_count INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        )
      `;

      await sql`CREATE INDEX IF NOT EXISTS idx_social_quotes_status ON social_quotes(status)`;
      await sql`CREATE INDEX IF NOT EXISTS idx_social_quotes_use_count ON social_quotes(use_count)`;

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

    // Get rejection feedback and approved edits to improve tone
    let rejectionFeedback;
    let approvedEdits;
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

      // Get approved posts with edits or improvement notes
      approvedEdits = await sql`
        SELECT content, improvement_notes, platform, post_type
        FROM social_posts
        WHERE status = 'approved' 
          AND (improvement_notes IS NOT NULL AND improvement_notes != '')
        ORDER BY updated_at DESC
        LIMIT 10
      `;
    } catch (queryError) {
      console.warn('Could not fetch feedback:', queryError);
      rejectionFeedback = { rows: [] };
      approvedEdits = { rows: [] };
    }

    const rejectionContext =
      rejectionFeedback.rows.length > 0
        ? `\n\nIMPORTANT: Previous posts were rejected. Learn from these rejections:\n${rejectionFeedback.rows.map((r: any) => `- ${r.rejection_feedback} (${r.platform}, ${r.post_type})`).join('\n')}\n\nAvoid these issues in new posts.`
        : '';

    const improvementContext =
      approvedEdits.rows.length > 0
        ? `\n\nLEARN FROM APPROVED EDITS: These posts were improved and approved. Use these improvements as examples:\n${approvedEdits.rows
            .map((r: any) => {
              if (r.improvement_notes) {
                return `- ${r.improvement_notes} (${r.platform}, ${r.post_type})`;
              }
              return null;
            })
            .filter(Boolean)
            .join('\n')}\n\nApply similar improvements to new posts.`
        : '';

    const feedbackContext = rejectionContext + improvementContext;

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey });

    // Get Reddit subreddit info if platform is Reddit
    let redditSubreddit: {
      name: string;
      allowsSelfPromotion: boolean;
      notes?: string;
    } | null = null;
    if (platform === 'reddit') {
      const selectedSubreddit = selectSubredditForPostType(
        postType || 'benefit',
      );
      redditSubreddit = {
        name: selectedSubreddit.name,
        allowsSelfPromotion: selectedSubreddit.allowsSelfPromotion,
        notes: selectedSubreddit.notes,
      };
    }

    const platformGuidelines: Record<string, string> = {
      instagram:
        '125-150 chars optimal. Engaging, visual-focused. Use line breaks for readability.',
      twitter:
        '280 chars max. Concise, punchy. Use hashtags sparingly (1-2 max).',
      facebook: '40-80 chars optimal. Conversational, community-focused.',
      linkedin: '150-300 chars. Professional but warm. Focus on value.',
      pinterest: 'Descriptive, keyword-rich. Include call-to-action.',
      reddit: redditSubreddit
        ? `Natural, community-focused. Posting to r/${redditSubreddit.name}. ${redditSubreddit.allowsSelfPromotion ? 'Self-promotion allowed, but keep it subtle and valuable.' : 'NO self-promotion - focus on educational value, community discussion, or helpful insights. Do NOT mention Lunary directly or include links/CTAs.'} ${redditSubreddit.notes ? `Note: ${redditSubreddit.notes}` : ''}`
        : 'Natural, community-focused. No salesy language.',
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
${platform === 'reddit' && redditSubreddit ? `Target Subreddit: r/${redditSubreddit.name}` : ''}
Type: ${postType || 'benefit'}
${topic ? `Topic: ${topic}` : ''}
${tone ? `Tone: ${tone}` : 'Natural, cosmic, warm'}
${includeCTA ? 'Include CTA: Yes' : 'Include CTA: No'}
${platform === 'reddit' && redditSubreddit && !redditSubreddit.allowsSelfPromotion ? 'CRITICAL: This subreddit does NOT allow self-promotion. Do NOT mention Lunary, do NOT include links, do NOT include CTAs. Focus purely on educational value or community discussion.' : ''}

Platform Guidelines: ${platformGuidelines[platform || 'general'] || 'Natural, engaging'}
Post Type Guidelines: ${postTypeGuidelines[postType || 'benefit'] || 'Natural, valuable'}

Requirements:
- Use sentence case (capitalize first letter of sentences)
${
  platform === 'reddit' &&
  redditSubreddit &&
  !redditSubreddit.allowsSelfPromotion
    ? '- DO NOT mention Lunary, app name, or include any links/CTAs'
    : '- Clearly explain what Lunary DOES (birth chart generation, personalized horoscopes, tarot, grimoire)'
}
${
  platform === 'reddit' &&
  redditSubreddit &&
  !redditSubreddit.allowsSelfPromotion
    ? '- Focus purely on educational value, cosmic insights, or community discussion'
    : '- Highlight specific USPs: personalized to exact birth chart, real astronomical calculations, free trial'
}
- Be concrete about features, not just poetic about astrology
- Natural and conversational but informative
${
  platform === 'reddit' &&
  redditSubreddit &&
  !redditSubreddit.allowsSelfPromotion
    ? '- Community-focused, helpful, educational tone'
    : '- Conversion-focused but not salesy'
}
- Keep within platform character limits
- Include emojis sparingly (🌙 ✨ 🔮)
${
  platform === 'reddit' &&
  redditSubreddit &&
  !redditSubreddit.allowsSelfPromotion
    ? '- NO CTAs, NO links, NO self-promotion'
    : includeCTA
      ? '- Include clear but natural CTA'
      : '- No explicit CTA needed'
}

Return JSON: {"posts": ["Post 1", "Post 2", ...]}`;

    console.log('🤖 Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `${SOCIAL_CONTEXT}\n\n${AI_CONTEXT}\n\n${COMPETITOR_CONTEXT}\n\n${POSTING_STRATEGY}${feedbackContext}\n\nYou are a social media marketing expert for Lunary. Follow the Lunary Orbit strategy. Emphasize what Lunary does best - focus on strengths and unique value, not competitor comparisons. Create natural, engaging posts that convert. Return only valid JSON.`,
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

    // Use quote pool for Instagram posts (quotes are stored and reused)
    const { generateCatchyQuote, getQuoteImageUrl } = await import(
      '@/lib/social/quote-generator'
    );

    // Calculate scheduled_date based on weekOffset
    const now = new Date();
    const scheduledDate = new Date(now);
    scheduledDate.setDate(now.getDate() + weekOffset * 7);

    const platformsNeedingImages = ['instagram', 'pinterest', 'reddit'];

    for (const postContent of postsArray) {
      // Generate catchy quote for platforms that need images
      const quote = platformsNeedingImages.includes(platform)
        ? await generateCatchyQuote(postContent, postType || 'benefit')
        : '';
      const imageUrl = quote ? getQuoteImageUrl(quote, baseUrl) : null;
      try {
        const insertResult = await sql`
          INSERT INTO social_posts (content, platform, post_type, topic, status, image_url, scheduled_date, created_at)
          VALUES (${postContent}, ${platform}, ${postType}, ${topic || null}, 'pending', ${imageUrl || null}, ${scheduledDate.toISOString()}, NOW())
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
