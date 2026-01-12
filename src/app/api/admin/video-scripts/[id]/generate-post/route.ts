import { NextRequest, NextResponse } from 'next/server';
const { OpenAI } = await import('openai');
import {
  getVideoScripts,
  updateVideoScriptWrittenPost,
  VideoScript,
} from '@/lib/social/video-script-generator';
import { categoryThemes, generateHashtags } from '@/lib/social/weekly-themes';

export const dynamic = 'force-dynamic';

function buildThematicHashtags(script: VideoScript): string | null {
  const theme = categoryThemes.find((item) => item.name === script.themeName);
  if (!theme) return null;
  const facet =
    theme.facets.find((item) => item.title === script.facetTitle) ||
    theme.facets.find(
      (item) => item.title.toLowerCase() === script.facetTitle.toLowerCase(),
    );
  if (!facet) return null;

  const tags = generateHashtags(theme, facet);
  const additionalTags = ['#lunary', '#astrology', `#${theme.category}`];
  const uniqueTags = Array.from(
    new Set(
      [tags.domain, tags.topic, tags.brand, ...additionalTags].filter(Boolean),
    ),
  );
  return uniqueTags.slice(0, 5).join(' ');
}

/**
 * Generate fallback hashtags based on script theme and topic
 */
function generateFallbackHashtags(script: VideoScript): string {
  const hashtags: string[] = [];

  // Extract relevant keywords from theme and facet title
  const themeWords = script.themeName
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 1);
  const facetWords = script.facetTitle
    .toLowerCase()
    .split(/\s+/)
    .filter((word) => word.length > 3)
    .slice(0, 1);

  // Add theme-based hashtag
  if (themeWords.length > 0) {
    const themeTag = themeWords[0].replace(/[^a-z0-9]/g, '');
    if (themeTag) {
      hashtags.push(`#${themeTag}`);
    }
  }

  // Add facet-based hashtag
  if (facetWords.length > 0) {
    const facetTag = facetWords[0].replace(/[^a-z0-9]/g, '');
    if (facetTag && !hashtags.includes(`#${facetTag}`)) {
      hashtags.push(`#${facetTag}`);
    }
  }

  // Add astrology-related hashtag
  hashtags.push('#astrology', '#lunary');

  return hashtags.slice(0, 5).join(' ');
}

/**
 * POST /api/admin/video-scripts/[id]/generate-post
 *
 * Generate written post content for a video script
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const scriptId = parseInt(id, 10);

    if (isNaN(scriptId)) {
      return NextResponse.json({ error: 'Invalid script ID' }, { status: 400 });
    }

    // Get the script
    const scripts = await getVideoScripts();
    const script = scripts.find((s) => s.id === scriptId);

    if (!script) {
      return NextResponse.json({ error: 'Script not found' }, { status: 404 });
    }

    // const openai = getOpenAI();
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // Create prompt based on script content
    const platformDescription =
      script.platform === 'tiktok'
        ? 'TikTok short-form video'
        : 'YouTube video';
    const dateStr = script.scheduledDate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const prompt = `Create a social media post caption to accompany a ${platformDescription} about ${script.facetTitle} for ${dateStr}.

Theme: ${script.themeName}
Video Topic: ${script.facetTitle}

The post should:
- Be engaging and natural, not salesy
- Mention that more details are available on Lunary (but DO NOT include a link or URL)
- Say something like "check out more on Lunary" or "explore this in Lunary" - never write out the full URL
- Be appropriate for Instagram, TikTok, and other platforms
- Be 2-4 sentences, concise but inviting
- Match the mystical but accessible tone of Lunary
- For TikTok: Be brief and hook-focused
- For YouTube: Be slightly more informative, highlight key points

Video Script Summary:
${script.fullScript.substring(0, 500)}...

Return ONLY the post content text, no markdown, no formatting, just the caption text. Do NOT include any URLs or links. DO NOT use any emojis. DO NOT include hashtags - they will be added separately.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a social media content creator for Lunary, a cosmic astrology app. Create engaging, natural captions that guide people to learn more without being pushy or salesy. Write in a mystical but accessible tone. DO NOT use any emojis - keep the text clean and professional. DO NOT include hashtags.',
        },
        { role: 'user', content: prompt },
      ],
      max_tokens: 300,
      temperature: 0.8,
    });

    let postContent = completion.choices[0]?.message?.content || '';
    if (!postContent || postContent.trim().length === 0) {
      throw new Error('OpenAI returned empty post content');
    }

    postContent = postContent.trim();

    // Generate hashtags from the thematic hashtag system
    const hashtags =
      buildThematicHashtags(script) || generateFallbackHashtags(script);

    // Append hashtags to post content
    const postContentWithHashtags = `${postContent}\n\n${hashtags}`;

    // Save to database
    await updateVideoScriptWrittenPost(scriptId, postContentWithHashtags);

    return NextResponse.json({
      success: true,
      writtenPostContent: postContentWithHashtags,
      message: 'Written post content generated successfully',
    });
  } catch (error) {
    console.error('Error generating written post content:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
