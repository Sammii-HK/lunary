import { NextRequest, NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import {
  PLATFORM_POSTING_TIMES,
  getDefaultPostingTime,
} from '@/utils/posting-times';
import { getImageBaseUrl } from '@/lib/urls';

export const runtime = 'nodejs';

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

4. **Free Trial** - Lunary offers a 7-day free trial with no card required. Try before you commit.

When creating posts, emphasize these strengths naturally. Focus on what Lunary does exceptionally well, not comparisons to others.`;
    return cachedCompetitorContext;
  } catch (error) {
    // Fallback: key strengths (positive framing)
    cachedCompetitorContext = `## What Makes Lunary Best:
1. Real Astronomical Data - Uses actual astronomical calculations based on real planetary positions
2. Personalized to Exact Birth Chart - Everything personalized to YOUR exact birth time, date, location
3. Comprehensive Grimoire - Complete digital grimoire with spells, rituals, crystal guides
4. Free Trial - 7-day trial, no card required

Focus on these strengths naturally. Emphasize what Lunary does exceptionally well.`;
    return cachedCompetitorContext;
  }
}

const SOCIAL_CONTEXT = getSocialMediaContext();
const AI_CONTEXT = getAIContext();
const POSTING_STRATEGY = getPostingStrategy();
const COMPETITOR_CONTEXT = getCompetitorContext();

/**
 * Generate weekly posts using the thematic content system
 * This is the new educational-first approach with weekly themes and daily facets
 */
async function generateThematicWeeklyPosts(
  request: NextRequest,
  weekStart: string | null,
  currentWeek: boolean,
  replaceExisting: boolean,
): Promise<NextResponse> {
  const { sql } = await import('@vercel/postgres');
  const { generateThematicPostsForWeek, getNextThemeIndex, recordThemeUsage } =
    await import('@/lib/social/thematic-generator');
  const { categoryThemes, getWeeklyContentPlan, generateHashtags } =
    await import('@/lib/social/weekly-themes');
  const { buildVideoCaption } = await import('@/lib/social/video-captions');
  const { getEducationalImageUrl } =
    await import('@/lib/social/educational-images');
  const { generateAndSaveWeeklyScripts, getVideoScripts } =
    await import('@/lib/social/video-script-generator');

  const ensureVideoJobsTable = async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS video_jobs (
        id SERIAL PRIMARY KEY,
        script_id INTEGER NOT NULL,
        week_start DATE,
        date_key DATE,
        topic TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_video_jobs_script_id
      ON video_jobs(script_id)
    `;
  };
  // Calculate week dates
  let startDate: Date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (currentWeek) {
    startDate = new Date(today);
  } else if (weekStart) {
    startDate = new Date(weekStart);
  } else {
    startDate = new Date();
    startDate.setDate(startDate.getDate() + 7);
  }

  // Find Monday of that week
  const dayOfWeek = startDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const weekStartDate = new Date(startDate);
  weekStartDate.setDate(startDate.getDate() - daysToMonday);
  weekStartDate.setHours(0, 0, 0, 0);

  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);
  weekEndDate.setHours(23, 59, 59, 999);

  console.log(
    `📅 [THEMATIC] Generating posts for week: ${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`,
  );

  // Ensure tables exist
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
        week_theme TEXT,
        week_start DATE,
        quote_id INTEGER,
        quote_text TEXT,
        quote_author TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS week_theme TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS week_start DATE`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS quote_id INTEGER`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS quote_text TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS quote_author TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS base_group_key TEXT`;
    await sql`ALTER TABLE social_posts ADD COLUMN IF NOT EXISTS base_post_id INTEGER`;

    await sql`
      CREATE TABLE IF NOT EXISTS content_rotation (
        id SERIAL PRIMARY KEY,
        rotation_type TEXT NOT NULL,
        item_id TEXT NOT NULL,
        last_used_at TIMESTAMP WITH TIME ZONE,
        use_count INTEGER DEFAULT 0,
        UNIQUE(rotation_type, item_id)
      )
    `;
  } catch (tableError) {
    console.warn('Table creation check failed:', tableError);
  }

  const weekStartKey = weekStartDate.toISOString().split('T')[0];
  const weekEndKey = weekEndDate.toISOString().split('T')[0];
  let forcedThemeIndex: number | null = null;

  if (replaceExisting) {
    const existingThemeResult = await sql`
      SELECT week_theme
      FROM social_posts
      WHERE scheduled_date::date >= ${weekStartKey}
        AND scheduled_date::date <= ${weekEndKey}
        AND week_theme IS NOT NULL
      LIMIT 1
    `;
    const existingThemeName = existingThemeResult.rows[0]?.week_theme as
      | string
      | undefined;
    if (existingThemeName) {
      const matchedIndex = categoryThemes.findIndex(
        (theme) => theme.name === existingThemeName,
      );
      if (matchedIndex >= 0) {
        forcedThemeIndex = matchedIndex;
      }
    }

    await sql`
      DELETE FROM social_posts
      WHERE status IN ('pending', 'approved')
        AND scheduled_date::date >= ${weekStartKey}
        AND scheduled_date::date <= ${weekEndKey}
    `;

    await sql`
      DELETE FROM video_scripts
      WHERE scheduled_date >= ${weekStartKey}
        AND scheduled_date <= ${weekEndKey}
    `;

    await sql`
      DELETE FROM video_jobs
      WHERE week_start = ${weekStartKey}
    `;
  }

  // Get next theme index (tracks rotation to prevent repeats)
  const themeIndex =
    forcedThemeIndex !== null ? forcedThemeIndex : await getNextThemeIndex(sql);
  const currentTheme = categoryThemes[themeIndex % categoryThemes.length];
  console.log(
    `📚 [THEMATIC] Using theme: ${currentTheme.name} (index ${themeIndex})`,
  );

  // Get weekly content plan (handles sabbat detection automatically)
  const weekPlan = getWeeklyContentPlan(weekStartDate, themeIndex);
  console.log(
    `📋 [THEMATIC] Week plan:`,
    weekPlan.map(
      (d) => `${d.dayName}: ${d.isSabbat ? '🌙 ' : ''}${d.facet.title}`,
    ),
  );

  const facetSlugByTitle = new Map<string, string>();
  for (const day of weekPlan) {
    const slug =
      day.facet.grimoireSlug.split('/').pop() ||
      day.facet.title.toLowerCase().replace(/\s+/g, '-');
    facetSlugByTitle.set(day.facet.title, slug);
  }

  let videoScriptContext:
    | import('@/lib/social/thematic-generator').VideoScriptContext
    | undefined = undefined;

  // Generate all posts for the week (with video script context if available)
  const posts = generateThematicPostsForWeek(
    weekStartDate,
    themeIndex,
    videoScriptContext,
  );
  console.log(`📝 [THEMATIC] Generated ${posts.length} posts`);

  // For currentWeek, filter out past days
  const todayDayOfWeek = today.getDay();
  const todayOffset = todayDayOfWeek === 0 ? 6 : todayDayOfWeek - 1;
  const filteredPosts = currentWeek
    ? posts.filter((post) => {
        const postDayOfWeek = post.scheduledDate.getDay();
        const postDayOffset = postDayOfWeek === 0 ? 6 : postDayOfWeek - 1;
        return postDayOffset >= todayOffset;
      })
    : posts;

  console.log(
    `📝 [THEMATIC] ${filteredPosts.length} posts after filtering (${posts.length} total)`,
  );

  // Use production URL for stored image URLs
  const baseUrl = getImageBaseUrl();

  // Platform optimal posting times
  const platformOptimalHours: Record<string, number[]> = {
    instagram: [11, 13, 19],
    linkedin: [8, 12, 17],
    pinterest: [12, 20, 21],
    twitter: [16, 20],
    threads: [15, 20],
    bluesky: [9, 12, 17],
  };

  // Save posts to database
  const savedPostIds: string[] = [];
  const allGeneratedPosts: Array<{
    content: string;
    platform: string;
    postType: string;
    topic: string;
    day: string;
    dayOffset: number;
    hour: number;
  }> = [];

  const postContentByKey = new Map<string, string>();
  const scriptByDate = new Map<string, string>();
  const scriptPostBaseByDate = new Map<string, string>();
  let closingRitualQuote: {
    id: number;
    text: string;
    author: string | null;
  } | null = null;

  const shortPostPlatforms = new Set(['twitter', 'bluesky', 'pinterest']);

  const cleanScriptForPost = (script: string): string => {
    const sentences = script
      .replace(/\s+/g, ' ')
      .match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [script];

    const filtered = sentences.filter((sentence) => {
      const lower = sentence.toLowerCase();
      if (lower.includes('part ') && lower.includes(' of ')) return false;
      if (lower.includes("this week's theme")) return false;
      if (lower.includes('until next time')) return false;
      if (lower.includes('lunary')) return false;
      return true;
    });

    return filtered.map((s) => s.trim()).join(' ');
  };

  const trimToMax = (
    text: string,
    maxChars: number,
    addEllipsis = true,
  ): string => {
    if (text.length <= maxChars) return text;

    const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];

    let output = '';
    for (const sentence of sentences) {
      const candidate = output
        ? `${output} ${sentence.trim()}`
        : sentence.trim();
      if (candidate.length > maxChars) break;
      output = candidate;
    }

    if (!output) {
      let snippet = text.slice(0, Math.max(0, maxChars - 3)).trim();
      const lastSpace = snippet.lastIndexOf(' ');
      if (lastSpace > 40) {
        snippet = snippet.slice(0, lastSpace).trim();
      }
      output = snippet;
    }

    const suffix = addEllipsis ? '...' : '';
    if (output.length > maxChars - suffix.length) {
      output = output.slice(0, maxChars - suffix.length).trim();
    }

    if (addEllipsis && output.length < text.length) {
      return `${output}...`;
    }

    return output;
  };

  const buildPostVariant = (
    body: string,
    maxChars: number,
    hashtags: string,
    hashtagCount: number,
    addEllipsis = true,
    attribution = "From Lunary's Grimoire",
  ): string => {
    const tags = hashtags ? hashtags.split(' ') : [];
    const hashtagText =
      hashtagCount > 0 ? tags.slice(0, hashtagCount).join(' ') : '';
    const reserved =
      (attribution ? attribution.length + 2 : 0) +
      (hashtagText ? hashtagText.length + 2 : 0);
    const bodyLimit = Math.max(80, maxChars - reserved);
    const trimmedBody = trimToMax(body, bodyLimit, addEllipsis);
    let content = trimmedBody;
    if (attribution) {
      content += `\n\n${attribution}`;
    }
    if (hashtagText) {
      content += `${attribution ? '\n\n' : '\n\n'}${hashtagText}`;
    }
    return content;
  };

  const normalizeLineBreaks = (text: string) =>
    text.replace(/\\n/g, '\n').replace(/\\r/g, '\r');

  const videoHashtagConfig: Record<
    string,
    { useHashtags: boolean; count: number }
  > = {
    instagram: { useHashtags: true, count: 3 },
    tiktok: { useHashtags: true, count: 3 },
    twitter: { useHashtags: true, count: 2 },
    threads: { useHashtags: false, count: 0 },
    youtube: { useHashtags: true, count: 3 },
  };

  const buildVideoHashtags = (
    platform: string,
    theme: (typeof categoryThemes)[number],
    facetTitle: string,
  ) => {
    const config = videoHashtagConfig[platform] || {
      useHashtags: false,
      count: 0,
    };
    if (!config.useHashtags || config.count <= 0) {
      return '';
    }
    const facet = theme.facets.find(
      (candidate) => candidate.title === facetTitle,
    );
    if (!facet) {
      return '';
    }
    const tags = generateHashtags(theme, facet);
    return [tags.domain, tags.topic, tags.brand]
      .slice(0, config.count)
      .join(' ');
  };

  const buildGroupKey = (
    dateKey: string,
    postType: string,
    topic: string | null | undefined,
    themeName: string,
  ) => {
    const safeTopic = (topic || '').trim() || 'general';
    return `${dateKey}|${postType}|${safeTopic}|${themeName}`;
  };

  const dedupeScriptsByDate = (
    scripts: Awaited<ReturnType<typeof getVideoScripts>>,
  ) => {
    const byKey = new Map<string, (typeof scripts)[number]>();
    for (const script of scripts) {
      const dateKey = script.scheduledDate.toISOString().split('T')[0];
      const key = `${dateKey}|${script.facetTitle}`;
      const existing = byKey.get(key);
      if (!existing) {
        byKey.set(key, script);
        continue;
      }
      const existingCreated = existing.createdAt?.getTime() ?? 0;
      const candidateCreated = script.createdAt?.getTime() ?? 0;
      if (candidateCreated >= existingCreated) {
        byKey.set(key, script);
      }
    }
    return Array.from(byKey.values()).sort(
      (a, b) => a.scheduledDate.getTime() - b.scheduledDate.getTime(),
    );
  };

  // Generate video scripts for this week (or reuse existing ones)
  let videoScripts: Awaited<
    ReturnType<typeof generateAndSaveWeeklyScripts>
  > | null = null;
  let videoScriptsGenerated = false;
  try {
    await ensureVideoJobsTable();
    const existingTikTokScripts = dedupeScriptsByDate(
      (await getVideoScripts({
        platform: 'tiktok',
        weekStart: weekStartDate,
      })) || [],
    ).filter((script) => script.themeName === currentTheme.name);

    const existingYouTubeScripts = (
      await getVideoScripts({
        platform: 'youtube',
        weekStart: weekStartDate,
      })
    ).filter((script) => script.themeName === currentTheme.name);
    const latestYouTubeScript =
      existingYouTubeScripts.sort(
        (a, b) => (b.createdAt?.getTime() ?? 0) - (a.createdAt?.getTime() ?? 0),
      )[0] || null;

    if (
      existingTikTokScripts.length === currentTheme.facets.length &&
      latestYouTubeScript
    ) {
      videoScripts = {
        theme: currentTheme,
        tiktokScripts: existingTikTokScripts,
        youtubeScript: latestYouTubeScript,
        weekStartDate,
      };
    } else {
      videoScripts = await generateAndSaveWeeklyScripts(
        weekStartDate,
        themeIndex,
      );
      videoScriptsGenerated = true;
    }
    console.log(
      `🎬 [VIDEO] Generated ${videoScripts.tiktokScripts.length} daily shorts + 1 YouTube script`,
    );

    if (videoScripts?.tiktokScripts?.length) {
      const { getThematicImageUrl } =
        await import('@/lib/social/educational-images');
      const uniqueScripts = dedupeScriptsByDate(videoScripts.tiktokScripts);
      for (const [index, script] of uniqueScripts.entries()) {
        const partNumber = Number.isFinite(script.partNumber)
          ? script.partNumber
          : index + 1;
        const totalParts = uniqueScripts.length || 7;
        const slug =
          facetSlugByTitle.get(script.facetTitle) ||
          script.facetTitle.toLowerCase().replace(/\s+/g, '-');
        const coverImageUrl = getThematicImageUrl(
          currentTheme.category,
          script.facetTitle,
          baseUrl,
          'tiktok',
          slug,
          `Part ${partNumber} of ${totalParts}`,
          'tiktok',
        );
        await sql`
          UPDATE video_scripts
          SET part_number = ${partNumber},
              cover_image_url = ${coverImageUrl}
          WHERE id = ${script.id}
        `;
      }
    }
  } catch (videoError) {
    console.error('Failed to generate video scripts:', videoError);
  }

  if (videoScripts?.tiktokScripts?.length) {
    const uniqueScripts = dedupeScriptsByDate(videoScripts.tiktokScripts);
    for (const script of uniqueScripts) {
      const dateKey = script.scheduledDate.toISOString().split('T')[0];
      if (!scriptByDate.has(dateKey)) {
        scriptByDate.set(dateKey, script.fullScript);
      }
    }

    for (const [dateKey, scriptText] of scriptByDate.entries()) {
      const cleaned = cleanScriptForPost(scriptText);
      scriptPostBaseByDate.set(dateKey, cleaned);
    }
  }

  if (filteredPosts.some((post) => post.postType === 'closing_ritual')) {
    try {
      let quoteResult = await sql`
        SELECT id, quote_text, author
        FROM social_quotes
        WHERE status = 'available'
          AND author IS NOT NULL
          AND author <> 'Lunary'
        ORDER BY use_count ASC, created_at ASC
        LIMIT 1
      `;
      if (quoteResult.rows.length === 0) {
        const { generateQuoteBatch } =
          await import('@/lib/social/quote-generator');
        await generateQuoteBatch();
        quoteResult = await sql`
          SELECT id, quote_text, author
          FROM social_quotes
          WHERE status = 'available'
            AND author IS NOT NULL
            AND author <> 'Lunary'
          ORDER BY use_count ASC, created_at ASC
          LIMIT 1
        `;
      }
      const picked = quoteResult.rows[0];
      if (picked) {
        closingRitualQuote = {
          id: picked.id,
          text: picked.quote_text,
          author: picked.author,
        };
      }
    } catch (error) {
      console.warn('Failed to select closing ritual quote:', error);
    }
  }

  for (const post of filteredPosts) {
    const dateKey = post.scheduledDate.toISOString().split('T')[0];
    const contentKey = `${dateKey}|${post.topic}`;
    const baseGroupKey = buildGroupKey(
      dateKey,
      post.postType,
      post.topic,
      currentTheme.name,
    );
    let postContent = post.content;
    const scriptBase = scriptPostBaseByDate.get(dateKey);
    if (scriptBase && post.postType === 'educational') {
      if (shortPostPlatforms.has(post.platform)) {
        const shortLimit = post.platform === 'bluesky' ? 300 : 180;
        postContent = buildPostVariant(
          scriptBase,
          shortLimit,
          post.hashtags,
          2,
          true,
          post.platform === 'bluesky' ? '' : "From Lunary's Grimoire",
        );
      } else {
        postContent = buildPostVariant(
          scriptBase,
          2200,
          post.hashtags,
          3,
          false,
        );
      }
    }

    if (!postContentByKey.has(contentKey)) {
      postContentByKey.set(contentKey, postContent);
    }
    // Get optimal hour for this platform
    const hours = platformOptimalHours[post.platform] || [12];
    const hour = post.postType === 'closing_ritual' ? 20 : hours[0];

    // Set the time
    const scheduledDate = new Date(post.scheduledDate);
    scheduledDate.setHours(hour, 0, 0, 0);

    // Generate image URL for platforms that support images
    // All major platforms now get images with recommended sizes
    const platformsWithImages = [
      'instagram',
      'pinterest',
      'linkedin',
      'twitter',
      'tiktok',
      'bluesky',
      'threads',
      'facebook',
    ];
    let imageUrl: string | null = null;

    if (platformsWithImages.includes(post.platform)) {
      try {
        if (post.postType === 'closing_ritual') {
          const { getPlatformImageFormat } =
            await import('@/lib/social/educational-images');
          const platformFormat = getPlatformImageFormat(post.platform);
          const quoteText =
            closingRitualQuote?.text ||
            'The cosmos is within us, we are made of star-stuff.';
          const author = closingRitualQuote?.author || 'Carl Sagan';
          const params = new URLSearchParams({ text: quoteText });
          if (author) params.set('author', author);
          params.set('format', platformFormat);
          imageUrl = `${baseUrl}/api/og/social-quote?${params.toString()}`;
        } else {
          const { getThematicImageUrl } =
            await import('@/lib/social/educational-images');
          let partLabel: string | undefined;
          if (
            post.postType === 'educational' &&
            post.topic !== 'closing ritual'
          ) {
            const rawOffset =
              Number.isFinite(post.dayOffset) && post.dayOffset >= 0
                ? post.dayOffset
                : Math.max(
                    0,
                    Math.floor(
                      (scheduledDate.getTime() - weekStartDate.getTime()) /
                        (1000 * 60 * 60 * 24),
                    ),
                  );
            partLabel = `Part ${rawOffset + 1} of 7`;
          }
          imageUrl = getThematicImageUrl(
            post.category,
            post.topic,
            baseUrl,
            post.platform,
            post.slug,
            partLabel || undefined,
          );
        }
      } catch (error) {
        console.warn('Failed to generate thematic image:', error);
      }
    }

    try {
      const result = await sql`
        INSERT INTO social_posts (content, platform, post_type, topic, status, image_url, scheduled_date, week_theme, week_start, quote_id, quote_text, quote_author, base_group_key, created_at)
        VALUES (${postContent}, ${post.platform}, ${post.postType}, ${post.topic}, 'pending', ${imageUrl}, ${scheduledDate.toISOString()}, ${currentTheme.name}, ${weekStartDate.toISOString().split('T')[0]}, ${post.postType === 'closing_ritual' ? closingRitualQuote?.id || null : null}, ${post.postType === 'closing_ritual' ? closingRitualQuote?.text || null : null}, ${post.postType === 'closing_ritual' ? closingRitualQuote?.author || null : null}, ${baseGroupKey}, NOW())
        RETURNING id
      `;
      savedPostIds.push(result.rows[0].id);

      const dayOfWeek = scheduledDate.getDay();
      const dayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

      allGeneratedPosts.push({
        content: postContent,
        platform: post.platform,
        postType: post.postType,
        topic: post.topic,
        day: [
          'Sunday',
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ][dayOfWeek],
        dayOffset,
        hour,
      });
    } catch (dbError) {
      console.error('Error saving thematic post to database:', dbError);
    }
  }

  // Extract YouTube script sections for social post content
  if (videoScripts?.youtubeScript) {
    const youtubeScript = videoScripts.youtubeScript;
    const sections = youtubeScript.sections || [];
    videoScriptContext = {
      intro: sections.find((s) => s.name.toLowerCase().includes('introduction'))
        ?.content,
      overview: sections.find((s) => s.name.toLowerCase().includes('overview'))
        ?.content,
      foundations: sections.find((s) =>
        s.name.toLowerCase().includes('foundation'),
      )?.content,
      deeperMeaning: sections.find((s) =>
        s.name.toLowerCase().includes('deeper'),
      )?.content,
      practical: sections.find((s) =>
        s.name.toLowerCase().includes('practical'),
      )?.content,
      summary: sections.find((s) => s.name.toLowerCase().includes('summary'))
        ?.content,
      themeName: currentTheme.name,
      facetTitles: weekPlan.map((d) => d.facet.title),
    };
  }

  // Generate daily short-form videos for visual platforms
  let dailyShortVideosGenerated = 0;
  let dailyShortVideosQueued = 0;
  try {
    if (videoScripts?.tiktokScripts?.length) {
      const { getThematicImageUrl } =
        await import('@/lib/social/educational-images');
      const totalParts = videoScripts.tiktokScripts.length;
      const videoPlatforms = [
        'instagram',
        'tiktok',
        'twitter',
        'threads',
        'youtube',
      ];
      const shortVideoPlatforms = new Set(['twitter']);
      const dayInfoByDate = new Map<
        string,
        { facetTitle: string; category: string; slug: string }
      >();
      const activeDates = new Set(
        filteredPosts.map(
          (post) => post.scheduledDate.toISOString().split('T')[0],
        ),
      );
      for (const day of weekPlan) {
        const dateKey = day.date.toISOString().split('T')[0];
        const slug =
          day.facet.grimoireSlug.split('/').pop() ||
          day.facet.title.toLowerCase().replace(/\s+/g, '-');
        dayInfoByDate.set(dateKey, {
          facetTitle: day.facet.title,
          category: day.theme.category,
          slug,
        });
      }

      const existingVideoByKey = new Map<string, string>();
      const existingVideoResult = await sql`
        SELECT topic, scheduled_date::date AS date_key, video_url
        FROM social_posts
        WHERE scheduled_date::date >= ${weekStartKey}
          AND scheduled_date::date <= ${weekEndKey}
          AND video_url IS NOT NULL
      `;
      for (const row of existingVideoResult.rows) {
        if (!row.topic || !row.video_url) continue;
        const dateKey = new Date(row.date_key).toISOString().split('T')[0];
        existingVideoByKey.set(`${dateKey}|${row.topic}`, row.video_url);
      }

      const uniqueScripts = dedupeScriptsByDate(videoScripts.tiktokScripts);

      for (const script of uniqueScripts) {
        try {
          const dateKey = script.scheduledDate.toISOString().split('T')[0];
          if (!activeDates.has(dateKey)) continue;
          const dayInfo = dayInfoByDate.get(dateKey);
          if (!dayInfo) continue;

          console.log(`🎬 [VIDEO] Start: ${dayInfo.facetTitle} (${dateKey})`);
          const scriptIndex = uniqueScripts.findIndex(
            (item) => item.id === script.id,
          );
          const partNumber = Number.isFinite(script.partNumber)
            ? script.partNumber
            : scriptIndex >= 0
              ? scriptIndex + 1
              : 1;
          const totalParts = uniqueScripts.length || 7;
          const existingVideoKey = `${dateKey}|${dayInfo.facetTitle}`;
          const existingVideoUrl = existingVideoByKey.get(existingVideoKey);

          const baseVideoCaption = normalizeLineBreaks(
            buildVideoCaption({
              themeName: currentTheme.name,
              facetTitle: dayInfo.facetTitle,
              partNumber,
              totalParts,
              scriptText: script.fullScript || script.writtenPostContent,
            }),
          );

          const buildVideoCaptionForPlatform = (platform: string) => {
            const tags = buildVideoHashtags(
              platform,
              currentTheme,
              dayInfo.facetTitle,
            );
            const isShort = shortVideoPlatforms.has(platform);
            if (!isShort) {
              return tags ? `${baseVideoCaption}\n\n${tags}` : baseVideoCaption;
            }
            if (!tags) {
              return trimToMax(baseVideoCaption, 180, true);
            }
            const reserved = tags.length + 2;
            const bodyLimit = Math.max(80, 180 - reserved);
            const trimmedBody = trimToMax(baseVideoCaption, bodyLimit, true);
            return `${trimmedBody}\n\n${tags}`;
          };

          for (const platform of videoPlatforms) {
            const videoHours = platformOptimalHours[platform] || [20];
            const videoHour = videoHours[videoHours.length - 1] || 20;
            const videoScheduledDate = new Date(`${dateKey}T00:00:00.000Z`);
            videoScheduledDate.setUTCHours(videoHour, 0, 0, 0);
            const baseGroupKey = buildGroupKey(
              dateKey,
              'video',
              dayInfo.facetTitle,
              currentTheme.name,
            );
            const videoCaption = buildVideoCaptionForPlatform(platform);
            const imageUrl: string | null = null;

            await sql`
              INSERT INTO social_posts (content, platform, post_type, topic, status, image_url, video_url, scheduled_date, week_theme, week_start, base_group_key, created_at)
              SELECT ${videoCaption}, ${platform}, 'video', ${dayInfo.facetTitle}, 'pending', ${imageUrl}, ${existingVideoUrl || null}, ${videoScheduledDate.toISOString()}, ${currentTheme.name}, ${weekStartDate.toISOString().split('T')[0]}, ${baseGroupKey}, NOW()
              WHERE NOT EXISTS (
                SELECT 1 FROM social_posts
                WHERE platform = ${platform}
                  AND post_type = 'video'
                  AND topic = ${dayInfo.facetTitle}
                  AND scheduled_date::date = ${dateKey}
              )
            `;

            if (existingVideoUrl) {
              await sql`
                UPDATE social_posts
                SET video_url = ${existingVideoUrl}
                WHERE platform = ${platform}
                  AND post_type = 'video'
                  AND topic = ${dayInfo.facetTitle}
                  AND scheduled_date::date = ${dateKey}
              `;
            }
          }

          if (existingVideoUrl) {
            console.log(`🎬 [VIDEO] Reusing: ${dayInfo.facetTitle}`);
            dailyShortVideosGenerated += 1;
            continue;
          }

          await sql`
            INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
            VALUES (${script.id}, ${weekStartKey}, ${dateKey}, ${dayInfo.facetTitle}, 'pending', NOW(), NOW())
            ON CONFLICT (script_id)
            DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
          `;
          dailyShortVideosQueued += 1;
          dailyShortVideosGenerated += 1;
        } catch (error) {
          console.error('❌ Failed to generate daily short:', {
            facetTitle: script.facetTitle,
            error: error instanceof Error ? error.message : error,
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      }
    }
  } catch (videoGenerationError) {
    console.error(
      'Failed to generate daily short videos:',
      videoGenerationError,
    );
  }

  if (videoScripts?.tiktokScripts?.length) {
    try {
      await sql`
        WITH latest_scripts AS (
          SELECT MAX(id) AS id
          FROM video_scripts
          WHERE platform = 'tiktok'
            AND scheduled_date >= ${weekStartKey}
            AND scheduled_date <= ${weekEndKey}
          GROUP BY facet_title, scheduled_date, theme_name
        )
        INSERT INTO video_jobs (script_id, week_start, date_key, topic, status, created_at, updated_at)
        SELECT DISTINCT ON (vs.id)
               vs.id,
               ${weekStartKey},
               vs.scheduled_date,
               vs.facet_title,
               'pending',
               NOW(),
               NOW()
        FROM video_scripts vs
        JOIN latest_scripts ls
          ON ls.id = vs.id
        JOIN social_posts sp
          ON sp.topic = vs.facet_title
         AND sp.scheduled_date::date = vs.scheduled_date
        WHERE vs.platform = 'tiktok'
          AND vs.scheduled_date >= ${weekStartKey}
          AND vs.scheduled_date <= ${weekEndKey}
          AND sp.week_theme = vs.theme_name
          AND (sp.video_url IS NULL OR sp.video_url = '')
        ON CONFLICT (script_id)
        DO UPDATE SET status = 'pending', last_error = NULL, updated_at = NOW()
      `;
    } catch (queueError) {
      console.error('Failed to queue video jobs after generation:', queueError);
    }
  }

  try {
    await sql`
      WITH grouped AS (
        SELECT base_group_key, MIN(id) AS base_id
        FROM social_posts
        WHERE week_start = ${weekStartKey}
          AND week_theme = ${currentTheme.name}
          AND base_group_key IS NOT NULL
        GROUP BY base_group_key
      )
      UPDATE social_posts sp
      SET base_post_id = grouped.base_id
      FROM grouped
      WHERE sp.base_group_key = grouped.base_group_key
    `;
  } catch (groupError) {
    console.warn('Failed to set base post ids:', groupError);
  }

  return NextResponse.json({
    success: true,
    message: `Generated ${savedPostIds.length} thematic posts for the week`,
    mode: 'thematic',
    theme: currentTheme.name,
    weekRange: `${weekStartDate.toLocaleDateString()} - ${weekEndDate.toLocaleDateString()}`,
    weekPlan: weekPlan.map((d) => ({
      day: d.dayName,
      theme: d.theme.name,
      facet: d.facet.title,
      isSabbat: d.isSabbat,
    })),
    posts: allGeneratedPosts,
    savedIds: savedPostIds,
    videoScriptsGenerated,
    dailyShortVideosGenerated,
    dailyShortVideosQueued,
  });
}

export async function POST(request: NextRequest) {
  try {
    const {
      weekStart,
      currentWeek,
      mode = 'thematic',
      replaceExisting = false,
    } = await request.json();

    console.log('📥 Generate weekly posts request:', {
      weekStart,
      currentWeek,
      currentWeekType: typeof currentWeek,
      mode,
    });

    // If thematic mode, use the new thematic generator
    if (mode === 'thematic') {
      return await generateThematicWeeklyPosts(
        request,
        weekStart,
        currentWeek,
        replaceExisting,
      );
    }

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
          video_url TEXT,
          week_theme TEXT,
          week_start DATE,
          quote_id INTEGER,
          quote_text TEXT,
          quote_author TEXT,
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

      try {
        const columnExists = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='social_posts' AND column_name='week_theme'
        `;
        if (columnExists.rows.length === 0) {
          await sql`ALTER TABLE social_posts ADD COLUMN week_theme TEXT`;
        }
      } catch (alterError) {
        console.warn('Could not add week_theme column:', alterError);
      }

      try {
        const columnExists = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='social_posts' AND column_name='week_start'
        `;
        if (columnExists.rows.length === 0) {
          await sql`ALTER TABLE social_posts ADD COLUMN week_start DATE`;
        }
      } catch (alterError) {
        console.warn('Could not add week_start column:', alterError);
      }

      try {
        const columnExists = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='social_posts' AND column_name='quote_id'
        `;
        if (columnExists.rows.length === 0) {
          await sql`ALTER TABLE social_posts ADD COLUMN quote_id INTEGER`;
        }
      } catch (alterError) {
        console.warn('Could not add quote_id column:', alterError);
      }

      try {
        const columnExists = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='social_posts' AND column_name='quote_text'
        `;
        if (columnExists.rows.length === 0) {
          await sql`ALTER TABLE social_posts ADD COLUMN quote_text TEXT`;
        }
      } catch (alterError) {
        console.warn('Could not add quote_text column:', alterError);
      }

      try {
        const columnExists = await sql`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name='social_posts' AND column_name='quote_author'
        `;
        if (columnExists.rows.length === 0) {
          await sql`ALTER TABLE social_posts ADD COLUMN quote_author TEXT`;
          await sql`ALTER TABLE social_posts ADD COLUMN base_group_key TEXT`;
          await sql`ALTER TABLE social_posts ADD COLUMN base_post_id INTEGER`;
        }
      } catch (alterError) {
        console.warn('Could not add quote_author column:', alterError);
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
        days: [],
        count: 0,
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
          const { selectSubredditForPostType } =
            await import('@/config/reddit-subreddits');
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

    // Import educational generator for Grimoire-based content
    const { generateEducationalPost: genEduPost } =
      await import('@/lib/social/educational-generator');

    for (const postPlan of filteredPosts) {
      let postContent: string | null = null;

      // For educational posts (80%+ of content), use REAL Grimoire data
      if (postPlan.postType === 'educational' || Math.random() < 0.8) {
        try {
          const eduPost = await genEduPost(postPlan.platform, 'mixed');
          if (eduPost) {
            postContent = eduPost.content;
            console.log(
              `📚 Generated educational post from Grimoire for ${postPlan.platform}: ${eduPost.grimoireSnippet.title}`,
            );
          }
        } catch (error) {
          console.warn(
            'Failed to generate educational post, falling back to AI:',
            error,
          );
        }
      }

      // Fallback to AI generation for non-educational posts or if educational failed
      if (!postContent) {
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
          inspirational:
            'Cosmic wisdom and guidance. Uplifting and empowering.',
          behind_scenes:
            'How the app works. Show the real astronomy behind it.',
          promotional:
            'Highlight free trial, pricing, or special offers. Clear but not pushy.',
          user_story:
            'Show real value through user perspective. Authentic and relatable.',
        };

        // Reddit-specific guidelines
        let redditGuidelines = '';
        if (postPlan.platform === 'reddit' && postPlan.subreddit) {
          const { getSubredditByName } =
            await import('@/config/reddit-subreddits');
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
${postPlan.platform === 'reddit' && !postPlan.subreddit?.includes('astrologyreadings') ? '- DO NOT mention Lunary, app name, or include any links/CTAs. Focus purely on educational value or community discussion.' : ''}
- Be concrete and educational - teach something valuable
- Natural and conversational but informative
${postPlan.platform === 'reddit' && !postPlan.subreddit?.includes('astrologyreadings') ? '- Community-focused, helpful, educational tone' : '- Educational authority positioning - build trust through depth'}
- Keep within platform character limits
- NO emojis for Twitter/Bluesky, minimal emojis for other platforms
- NO direct links in content
${postPlan.platform === 'reddit' && !postPlan.subreddit?.includes('astrologyreadings') ? '- NO CTAs, NO links, NO self-promotion' : '- No explicit CTA needed'}
- Match the day's energy (${postPlan.day})
- Vary content from other posts - be unique and fresh
- Position Lunary as a library/reference authority, not a product

Return JSON: {"posts": ["Post content"]}`;

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `${SOCIAL_CONTEXT}\n\n${AI_CONTEXT}\n\n${COMPETITOR_CONTEXT}\n\n${POSTING_STRATEGY}${feedbackContext}\n\nYou are a social media marketing expert for Lunary. Create natural, engaging educational posts. Position Lunary as a library/reference authority. NEVER mention pricing, trials, or "free". NO direct links in content. Return only valid JSON.`,
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
        postContent = Array.isArray(posts) ? posts[0] : posts;
      }

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
    const baseUrl = getImageBaseUrl();

    // Save all posts to database with image URLs
    // Use quote pool and educational images for all image-supporting platforms
    const {
      generateCatchyQuote,
      getQuoteImageUrl,
      getQuotePoolStats,
      getQuoteWithInterpretation,
    } = await import('@/lib/social/quote-generator');
    const {
      generateEducationalPost,
      generateWeeklySabbatPosts,
      getUpcomingSabbats,
    } = await import('@/lib/social/educational-generator');
    const { getEducationalImageUrl, getPlatformImageFormat } =
      await import('@/lib/social/educational-images');

    const quoteStatsBefore = await getQuotePoolStats();
    console.log('📊 Quote pool before generation:', quoteStatsBefore);

    // Check for upcoming sabbats in the week and add special sabbat posts
    const upcomingSabbats = getUpcomingSabbats(7);
    if (upcomingSabbats.length > 0) {
      console.log(
        '🌙 Found upcoming sabbats:',
        upcomingSabbats.map(
          (s) => `${s.name} on ${s.date.toLocaleDateString()}`,
        ),
      );

      // Generate sabbat posts for each platform that supports long-form content
      const sabbatPlatforms = ['facebook', 'linkedin', 'pinterest'];
      for (const sabbat of upcomingSabbats) {
        for (const platform of sabbatPlatforms) {
          const sabbatPost = await generateEducationalPost(
            platform,
            'seasonal',
          );
          if (sabbatPost) {
            // Find the day offset for this sabbat
            const sabbatDayOfWeek = sabbat.date.getDay();
            const sabbatDayOffset =
              sabbatDayOfWeek === 0 ? 6 : sabbatDayOfWeek - 1;

            allGeneratedPosts.push({
              content: sabbatPost.content,
              platform,
              postType: 'educational',
              topic: sabbat.name,
              day: [
                'Sunday',
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ][sabbatDayOfWeek],
              dayOffset: sabbatDayOffset,
              hour: 12, // Noon for sabbat posts
              subreddit: undefined,
            });
            console.log(
              `✨ Added ${sabbat.name} post for ${platform} scheduled for ${sabbat.date.toLocaleDateString()}`,
            );
          }
        }
      }
    }

    const savedPostIds: string[] = [];
    for (let i = 0; i < allGeneratedPosts.length; i++) {
      const post = allGeneratedPosts[i];
      const postPlan = weeklyPosts[i];

      // Calculate the date for this post (weekStartDate + dayOffset + hour)
      const postDate = new Date(weekStartDate);
      postDate.setDate(weekStartDate.getDate() + post.dayOffset);
      postDate.setHours(post.hour, 0, 0, 0); // Use the optimal hour for this platform

      // All platforms that accept images
      const platformsNeedingImages = [
        'pinterest',
        'reddit',
        'twitter',
        'facebook',
        'linkedin',
      ];
      // Generate images for platforms that support them
      let imageUrl: string | null = null;

      if (platformsNeedingImages.includes(post.platform)) {
        const platformFormat = getPlatformImageFormat(post.platform);
        // For educational posts, use Grimoire educational images
        if (post.postType === 'educational') {
          try {
            const educationalPost = await generateEducationalPost(
              post.platform,
              'mixed',
            );
            if (educationalPost?.grimoireSnippet) {
              imageUrl = getEducationalImageUrl(
                educationalPost.grimoireSnippet,
                baseUrl,
                post.platform,
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
              post.content,
              post.postType,
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
                post.content,
                post.postType,
              );
              imageUrl = quote
                ? getQuoteImageUrl(quote, baseUrl, { format: platformFormat })
                : null;
            }
          } catch (error) {
            console.warn(
              'Failed to generate quote with interpretation, using simple quote:',
              error,
            );
            const quote = await generateCatchyQuote(
              post.content,
              post.postType,
            );
            imageUrl = quote
              ? getQuoteImageUrl(quote, baseUrl, { format: platformFormat })
              : null;
          }
        }
      }

      try {
        const result = await sql`
          INSERT INTO social_posts (content, platform, post_type, topic, status, image_url, scheduled_date, week_start, created_at)
          VALUES (${post.content}, ${post.platform}, ${post.postType}, ${post.topic || null}, 'pending', ${imageUrl || null}, ${postDate.toISOString()}, ${weekStartDate.toISOString().split('T')[0]}, NOW())
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
