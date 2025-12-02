import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  PLATFORM_POSTING_TIMES,
  getDefaultPostingTime,
} from '@/utils/posting-times';

let cachedSocialContext: string | null = null;
let cachedAIContext: string | null = null;
let cachedPostingStrategy: string | null = null;
let cachedCompetitorContext: string | null = null;

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

function getCompetitorContext(): string {
  if (cachedCompetitorContext) return cachedCompetitorContext;
  try {
    const contextPath = join(process.cwd(), 'docs', 'BEAT_COMPETITORS_SEO.md');
    const fullContent = readFileSync(contextPath, 'utf-8');

    // Extract strengths and reframe positively - focus on what Lunary does best
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
  try {
    const { weekStart, currentWeek } = await request.json();

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

    // Calculate week dates
    let startDate: Date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (currentWeek) {
      // Current week - start from today
      startDate = new Date(today);
    } else if (weekStart) {
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

    // For currentWeek, calculate the minimum day offset (today's offset from Monday)
    const todayDayOfWeek = today.getDay();
    const todayOffset = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1; // Monday = 0, Sunday = 6
    const minDayOffset = currentWeek ? todayOffset : 0;

    console.log(
      `📅 Generating posts for week: ${weekStartDate.toLocaleDateString()}${currentWeek ? ` (current week, from ${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][todayOffset]})` : ' (next week)'}`,
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
    console.log(
      '🤖 Creating OpenAI client with key:',
      apiKey ? `${apiKey.substring(0, 10)}...` : 'missing',
    );
    const openai = new OpenAI({ apiKey });

    // Available topics for variety
    const topics = [
      'Birth Charts',
      'Personalized Horoscopes',
      'Daily Horoscopes',
      'Tarot Readings',
      'Tarot Pattern Analysis',
      'Personal Transits',
      'AI Chat Companion',
      'Digital Grimoire',
      'Astronomical Calculations',
      'Moon Phases',
      'Planetary Positions',
      'Cosmic Insights',
      'Astrology Basics',
      'Birth Chart Interpretation',
      'Spiritual Guidance',
      'Crystal Correspondences',
      'Magical Practices',
      'Collections',
      'Moon Circles',
      'Ritual Generator',
      'Assist Commands',
      'Memory System',
      'Grimoire Knowledge',
      'Transit Calendar',
      'Solar Return',
      'Cosmic Profile',
      'Birthday Collection',
      'Yearly Forecast',
      'Data Export',
      'Weekly Reports',
      'Deeper Readings',
      'Advanced Pattern Analysis',
    ];

    // Available post types
    const postTypes = [
      'feature',
      'benefit',
      'educational',
      'inspirational',
      'behind_scenes',
      'promotional',
      'user_story',
    ];

    // Platform-specific posting days and frequencies
    const platformPlan = {
      instagram: { days: ['Tuesday', 'Thursday', 'Sunday'], count: 3 },
      twitter: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        count: 5,
      },
      facebook: { days: ['Tuesday', 'Thursday', 'Sunday'], count: 3 },
      linkedin: { days: ['Tuesday', 'Wednesday', 'Thursday'], count: 3 },
      pinterest: { days: ['Saturday', 'Sunday'], count: 2 },
      reddit: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        count: 5,
      },
      tiktok: {
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'],
        count: 4,
      },
    };

    // Build comprehensive weekly post plan
    const weeklyPosts: Array<{
      platform: string;
      postType: string;
      topic: string;
      day: string;
      dayOffset: number;
      hour: number;
      subreddit?: string;
    }> = [];

    let topicIndex = 0;
    let postTypeIndex = 0;

    // Generate posts for each platform
    for (const [platform, plan] of Object.entries(platformPlan)) {
      const platformInfo = PLATFORM_POSTING_TIMES[platform];
      const dayNames = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday',
      ];

      for (let i = 0; i < plan.count; i++) {
        const dayName = plan.days[i % plan.days.length];
        const dayOffset = dayNames.indexOf(dayName);

        // Get optimal posting time for this platform
        const optimalTimes =
          platformInfo?.recommendedTimes.filter((t) => t.isOptimal) || [];
        const timeIndex = i % optimalTimes.length;
        const hour =
          optimalTimes[timeIndex]?.hour || getDefaultPostingTime(platform);

        // Select topic and post type with variety
        const topic = topics[topicIndex % topics.length];
        const postType = postTypes[postTypeIndex % postTypes.length];

        topicIndex++;
        postTypeIndex++;

        // For Reddit, select appropriate subreddit based on post type
        let subreddit: string | undefined;
        if (platform === 'reddit') {
          const { selectSubredditForPostType } = await import(
            '@/config/reddit-subreddits'
          );
          const selectedSubreddit = selectSubredditForPostType(postType);
          subreddit = selectedSubreddit.name;
        }

        weeklyPosts.push({
          platform,
          postType,
          topic,
          day: dayName,
          dayOffset,
          hour,
          subreddit,
        });
      }
    }

    // Sort by day offset and hour for better distribution
    weeklyPosts.sort((a, b) => {
      if (a.dayOffset !== b.dayOffset) return a.dayOffset - b.dayOffset;
      return a.hour - b.hour;
    });

    // Filter out past days when generating for current week
    const filteredPosts = currentWeek
      ? weeklyPosts.filter((post) => post.dayOffset >= minDayOffset)
      : weeklyPosts;

    console.log(
      `📝 Generating ${filteredPosts.length} posts (filtered from ${weeklyPosts.length} total)`,
    );

    const allGeneratedPosts: Array<{
      content: string;
      platform: string;
      postType: string;
      topic: string;
      day: string;
      dayOffset: number;
      hour: number;
      subreddit?: string;
    }> = [];

    for (const postPlan of filteredPosts) {
      const platformGuidelines: Record<string, string> = {
        instagram:
          '125-150 chars optimal. Engaging, visual-focused. Use line breaks for readability. Hashtags: 5-10 relevant ones.',
        twitter:
          '280 chars max. Concise, punchy. Use hashtags sparingly (1-2 max). Thread-friendly format.',
        facebook:
          '200-300 chars optimal. Community-focused, conversational. Can be longer-form.',
        linkedin:
          'Professional tone, 150-300 chars. Focus on value and insights. Less emojis, more substance.',
        pinterest:
          'Descriptive, keyword-rich. 100-200 chars. Focus on visual appeal and searchability.',
        reddit:
          'Educational or community-focused. No self-promotion unless subreddit allows. Natural discussion tone.',
        tiktok:
          'Short, catchy, hook-focused. 100-150 chars. Trend-aware and engaging.',
      };

      const postTypeGuidelines: Record<string, string> = {
        feature:
          'Highlight a specific feature naturally. Show value, not just features.',
        benefit: 'Focus on user benefits and outcomes. What do users gain?',
        educational:
          'Teach something about astrology or astronomy. Be informative and valuable.',
        inspirational: 'Cosmic wisdom and guidance. Uplifting and empowering.',
        behind_scenes: 'How the app works. Show the real astronomy behind it.',
        promotional:
          'Highlight free trial, pricing, or special offers. Clear but not pushy.',
        user_story:
          'Show real value through user perspective. Authentic and relatable.',
      };

      // Reddit-specific guidelines
      let redditGuidelines = '';
      if (postPlan.platform === 'reddit' && postPlan.subreddit) {
        const { getSubredditByName } = await import(
          '@/config/reddit-subreddits'
        );
        const subredditInfo = getSubredditByName(postPlan.subreddit);
        if (subredditInfo) {
          redditGuidelines = `\n\nREDDIT SUBREDDIT: r/${postPlan.subreddit}
- Description: ${subredditInfo.description}
- Content Type: ${subredditInfo.contentType}
- Allows Self-Promotion: ${subredditInfo.allowsSelfPromotion ? 'YES' : 'NO'}
- Notes: ${subredditInfo.notes || 'None'}

CRITICAL: ${subredditInfo.allowsSelfPromotion ? 'You can mention Lunary and include links/CTAs.' : 'DO NOT mention Lunary, app name, or include any links/CTAs. Focus purely on educational value or community discussion that relates to the topic.'}`;
        }
      }

      const prompt = `Generate 1 social media post for Lunary.

Platform: ${postPlan.platform}
Type: ${postPlan.postType}
Topic: ${postPlan.topic}
Day: ${postPlan.day}
Scheduled Time: ${postPlan.hour}:00 UTC
Week: ${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}
${postPlan.subreddit ? `Target Subreddit: r/${postPlan.subreddit}` : ''}

Platform Guidelines: ${platformGuidelines[postPlan.platform] || 'Natural, engaging'}
Post Type Guidelines: ${postTypeGuidelines[postPlan.postType] || 'Natural, valuable'}
${redditGuidelines}

Requirements:
- Use sentence case (capitalize first letter of sentences)
- Focus on the topic: ${postPlan.topic}
${postPlan.platform === 'reddit' && !postPlan.subreddit?.includes('astrologyreadings') ? '- DO NOT mention Lunary, app name, or include any links/CTAs. Focus purely on educational value or community discussion.' : '- Clearly explain what Lunary DOES (birth chart generation, personalized horoscopes, tarot, grimoire)'}
${postPlan.platform === 'reddit' && !postPlan.subreddit?.includes('astrologyreadings') ? '- Focus purely on educational value, cosmic insights, or community discussion' : '- Highlight specific USPs: personalized to exact birth chart, real astronomical calculations, free trial'}
- Be concrete about features, not just poetic about astrology
- Natural and conversational but informative
${postPlan.platform === 'reddit' && !postPlan.subreddit?.includes('astrologyreadings') ? '- Community-focused, helpful, educational tone' : '- Conversion-focused but not salesy'}
- Keep within platform character limits
- Include emojis sparingly (🌙 ✨ 🔮) - ${postPlan.platform === 'linkedin' ? 'minimal emojis' : 'use naturally'}
${postPlan.platform === 'reddit' && !postPlan.subreddit?.includes('astrologyreadings') ? '- NO CTAs, NO links, NO self-promotion' : postPlan.postType === 'promotional' ? '- Include clear but natural CTA' : '- No explicit CTA needed'}
- Match the day's energy (${postPlan.day})
- Vary content from other posts - be unique and fresh

Return JSON: {"posts": ["Post content"]}`;

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
          topic: postPlan.topic,
          day: postPlan.day,
          dayOffset: postPlan.dayOffset,
          hour: postPlan.hour,
          subreddit: postPlan.subreddit,
        });
      }
    }

    // Generate OG image URLs for Instagram posts
    // Always use production URL for stored image URLs (they get saved to DB and used later)
    // Use production URL on any Vercel deployment (VERCEL env var is set on all Vercel deployments)
    const baseUrl = process.env.VERCEL
      ? 'https://lunary.app'
      : 'http://localhost:3000';

    // Save all posts to database with image URLs
    // Use quote pool for Instagram posts (quotes are stored and reused, not regenerated each time)
    const { generateCatchyQuote, getQuoteImageUrl, getQuotePoolStats } =
      await import('@/lib/social/quote-generator');

    const quoteStatsBefore = await getQuotePoolStats();
    console.log('📊 Quote pool before generation:', quoteStatsBefore);

    const savedPostIds: string[] = [];
    for (let i = 0; i < allGeneratedPosts.length; i++) {
      const post = allGeneratedPosts[i];
      const postPlan = weeklyPosts[i];

      // Calculate the date for this post (weekStartDate + dayOffset + hour)
      const postDate = new Date(weekStartDate);
      postDate.setDate(weekStartDate.getDate() + post.dayOffset);
      postDate.setHours(post.hour, 0, 0, 0); // Use the optimal hour for this platform

      // Generate quotes for platforms that need images
      const platformsNeedingImages = [
        'instagram',
        'pinterest',
        'reddit',
        'tiktok',
      ];
      const quote = platformsNeedingImages.includes(post.platform)
        ? await generateCatchyQuote(post.content, post.postType)
        : '';
      const imageUrl = quote ? getQuoteImageUrl(quote, baseUrl) : null;

      try {
        const result = await sql`
          INSERT INTO social_posts (content, platform, post_type, topic, status, image_url, scheduled_date, created_at)
          VALUES (${post.content}, ${post.platform}, ${post.postType}, ${post.topic || null}, 'pending', ${imageUrl || null}, ${postDate.toISOString()}, NOW())
          RETURNING id
        `;
        savedPostIds.push(result.rows[0].id);
      } catch (dbError) {
        console.error('Error saving post to database:', dbError);
      }
    }

    // Skip Pushover notification for weekly post generation - too noisy
    // Users can check the approval queue directly

    const quoteStatsAfter = await getQuotePoolStats();
    console.log('📊 Quote pool after generation:', quoteStatsAfter);

    return NextResponse.json({
      success: true,
      message: `Generated ${savedPostIds.length} posts for the week`,
      weekRange: `${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`,
      posts: allGeneratedPosts,
      savedIds: savedPostIds,
      quotePool: quoteStatsAfter,
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
