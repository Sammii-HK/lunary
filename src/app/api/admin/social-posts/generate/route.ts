import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { selectSubredditForPostType } from '@/config/reddit-subreddits';
import {
  getArchetypePrompt,
  getWeightedArchetype,
  mapPostTypeToArchetype,
  type ContentArchetype,
} from '@/lib/social/content-archetypes';
import { getImageBaseUrl } from '@/lib/urls';

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
    cachedSocialContext = `Lunary: Cosmic astrology app. Personalized birth charts, horoscopes, tarot. Focus: personalization, real astronomy, cosmic/spiritual tone. Unique features: AI chat with memory, tarot pattern analysis, personal transits, 500+ page grimoire.`;
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
    cachedAIContext = `Lunary: Cosmic astrology app. Personalized birth charts, horoscopes, tarot. Focus: personalization, real astronomy, cosmic/spiritual tone. Unique features: AI chat with memory, tarot pattern analysis, personal transits, 500+ page grimoire.`;
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

    cachedCompetitorContext = `## What Makes Lunary Unique:

1. **Real Astronomical Data** - Uses actual astronomical calculations based on real planetary positions. Scientifically accurate.

2. **Personalized to Exact Birth Chart** - Everything personalized to YOUR exact birth time, date, and location. Not generic zodiac signs.

3. **AI Chat with Memory** - Remembers past conversations and builds context over time. Knows your chart, your questions, your journey.

4. **Tarot Pattern Analysis** - Tracks which cards appear frequently and identifies recurring themes across readings over time.

5. **Personal Transits** - Shows which houses are being activated in YOUR chart specifically, not generic forecasts.

6. **500+ Page Digital Grimoire** - Spells, rituals, crystal guides, correspondences - comprehensive and always accessible.

Focus on these unique features naturally. Lead with value, curiosity, or education - not sales.`;
    return cachedCompetitorContext;
  } catch (error) {
    cachedCompetitorContext = `## What Makes Lunary Unique:
1. Real Astronomical Data - Actual astronomical calculations, scientifically accurate
2. Personalized to Exact Birth Chart - YOUR birth time, date, location - not generic
3. AI Chat with Memory - Remembers conversations and builds context over time
4. Tarot Pattern Analysis - Tracks recurring themes across readings
5. Personal Transits - Shows YOUR houses being activated
6. 500+ Page Grimoire - Comprehensive spells, rituals, crystals

Lead with value, curiosity, or education - not sales.`;
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
          video_url TEXT,
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

      // Add video_url column if it doesn't exist (for existing tables)
      try {
        const columnExists = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='social_posts' AND column_name='video_url'
        `;
        if (columnExists.rows.length === 0) {
          await sql`ALTER TABLE social_posts ADD COLUMN video_url TEXT`;
        }
      } catch (alterError) {
        console.warn('Could not add video_url column:', alterError);
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

    const archetype: ContentArchetype =
      mapPostTypeToArchetype(postType || 'benefit') || getWeightedArchetype();
    const archetypePrompt = getArchetypePrompt(archetype);

    const prompt = `Generate ${count} unique social media posts for Lunary.

Platform: ${platform || 'general'}
${platform === 'reddit' && redditSubreddit ? `Target Subreddit: r/${redditSubreddit.name}` : ''}
${topic ? `Topic: ${topic}` : ''}
${tone ? `Tone: ${tone}` : ''}

Platform Guidelines: ${platformGuidelines[platform || 'general'] || 'Natural, engaging'}

${archetypePrompt}

${
  platform === 'reddit' &&
  redditSubreddit &&
  !redditSubreddit.allowsSelfPromotion
    ? `
CRITICAL REDDIT RULES:
- This subreddit does NOT allow self-promotion
- Do NOT mention Lunary or any app name
- Do NOT include links or CTAs
- Focus purely on educational value or community discussion
- Be a helpful community member, not a marketer
`
    : ''
}

REQUIREMENTS:
- Use sentence case (capitalize first letter of sentences)
- Keep within platform character limits
- Include emojis sparingly (🌙 ✨ 🔮) - max 1-2 per post
- Each post must be DISTINCT - different hooks, angles, and structures
- NO pricing mentions, NO trial mentions, NO "free" language
- Lead with curiosity, vulnerability, or education - NOT features
${!includeCTA ? '- No CTA in these posts - pure value content' : '- Soft CTA only if appropriate: "discover at lunary.app" or "try Lunary"'}

Return JSON: {"posts": ["Post 1", "Post 2", ...]}`;

    console.log('🤖 Calling OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `${SOCIAL_CONTEXT}\n\n${AI_CONTEXT}\n\n${COMPETITOR_CONTEXT}\n\n${POSTING_STRATEGY}${feedbackContext}

You are creating authentic social media content for Lunary, a cosmic astrology app.

CRITICAL RULES:
1. NEVER mention pricing, trials, or "free" - just focus on value
2. Prioritize authenticity over conversion - build trust through genuine content
3. **80% MINIMUM of posts must be educational content** - use Grimoire knowledge as foundation
4. Educational posts should guide to Grimoire: "Explore this in Lunary's Grimoire: lunary.app/grimoire/[slug]" - no pricing, no urgency
5. Thought leader quotes (15% of posts) should include gentle interpretation showing authority
6. Soft product mentions (5% max) - contextual only: "This idea is woven through Lunary's Grimoire" - position as place, not pitch
7. Match the example posts in quality and tone for the given archetype
8. Each post must feel unique - different hooks, structures, and angles
9. Sound human - vulnerable, curious, or educational. Never salesy or generic.
10. Position Lunary as a library/reference authority, not a product

Return only valid JSON.`,
        },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      max_tokens: 1200,
      temperature: 0.9,
    });
    console.log('✅ OpenAI API call successful');

    const result = JSON.parse(completion.choices[0]?.message?.content || '{}');
    const posts = result.posts || result.post || [];
    const postsArray = Array.isArray(posts) ? posts : [posts];

    // Save posts to database (table already exists from earlier check)
    const savedPostIds: string[] = [];
    const dbErrors: string[] = [];

    // Generate OG image URL for Instagram posts
    // Use production URL on any Vercel deployment (VERCEL env var is set on all Vercel deployments)
    const baseUrl = getImageBaseUrl();

    // Use quote pool and educational images for all image-supporting platforms
    const {
      generateCatchyQuote,
      getQuoteImageUrl,
      getQuoteWithInterpretation,
    } = await import('@/lib/social/quote-generator');
    const { generateEducationalPost } =
      await import('@/lib/social/educational-generator');
    const { getEducationalImageUrl, getPlatformImageFormat } =
      await import('@/lib/social/educational-images');

    // Calculate scheduled_date based on weekOffset
    const now = new Date();
    const scheduledDate = new Date(now);
    scheduledDate.setDate(now.getDate() + weekOffset * 7);

    // All platforms that accept images
    const platformsNeedingImages = [
      'instagram',
      'pinterest',
      'reddit',
      'twitter',
      'facebook',
      'linkedin',
      'tiktok',
    ];

    for (const postContent of postsArray) {
      let imageUrl: string | null = null;

      if (platformsNeedingImages.includes(platform)) {
        const platformFormat = getPlatformImageFormat(platform);
        // For educational posts, use Grimoire educational images
        if (postType === 'educational') {
          try {
            const educationalPost = await generateEducationalPost(
              platform,
              'mixed',
            );
            if (educationalPost?.grimoireSnippet) {
              imageUrl = getEducationalImageUrl(
                educationalPost.grimoireSnippet,
                baseUrl,
                platform,
              );
            }
          } catch (error) {
            console.warn(
              'Failed to generate educational image, falling back to quote:',
              error,
            );
          }
        }

        // For quote posts or fallback, use quote images with interpretation
        if (!imageUrl) {
          try {
            const quoteWithInterp = await getQuoteWithInterpretation(
              postContent,
              postType || 'benefit',
            );
            if (quoteWithInterp) {
              imageUrl = getQuoteImageUrl(quoteWithInterp.quote, baseUrl, {
                format: platformFormat,
                interpretation: quoteWithInterp.interpretation || undefined,
                author: quoteWithInterp.author || undefined,
              });
            } else {
              // Fallback to simple quote
              const quote = await generateCatchyQuote(
                postContent,
                postType || 'benefit',
              );
              imageUrl = quote
                ? getQuoteImageUrl(quote, baseUrl, {
                    format: platformFormat,
                  })
                : null;
            }
          } catch (error) {
            console.warn(
              'Failed to generate quote with interpretation, using simple quote:',
              error,
            );
            const quote = await generateCatchyQuote(
              postContent,
              postType || 'benefit',
            );
            imageUrl = quote
              ? getQuoteImageUrl(quote, baseUrl, {
                  format: platformFormat,
                })
              : null;
          }
        }
      }
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
