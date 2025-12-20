import { NextRequest, NextResponse } from 'next/server';
const { OpenAI } = await import('openai');
import {
  getVideoScripts,
  updateVideoScriptWrittenPost,
  VideoScript,
} from '@/lib/social/video-script-generator';

export const dynamic = 'force-dynamic';

/**
 * Generate 3 significant hashtags for a video script based on video content
 * Similar approach to blog videos: extract from actual content mentioned in the script
 * Priority: 1. Main topic (facet), 2. Key concepts from script, 3. Theme
 */
async function generateHashtagsForScript(script: VideoScript): Promise<string> {
  const hashtags: string[] = [];
  const scriptText = script.fullScript.toLowerCase();

  // Priority 1: Extract from facet title (the main topic)
  const facetTitle = script.facetTitle.toLowerCase();

  // Check for planet names in facet title
  const planets = [
    'sun',
    'moon',
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
  ];
  for (const planet of planets) {
    if (facetTitle.includes(planet)) {
      hashtags.push(`#${planet}`);
      break;
    }
  }

  // Check for zodiac signs in facet title
  const signs = [
    'aries',
    'taurus',
    'gemini',
    'cancer',
    'leo',
    'virgo',
    'libra',
    'scorpio',
    'sagittarius',
    'capricorn',
    'aquarius',
    'pisces',
  ];
  for (const sign of signs) {
    if (facetTitle.includes(sign)) {
      hashtags.push(`#${sign}`);
      break;
    }
  }

  // Priority 2: Extract key concepts from the script content itself
  // Look for important astrological terms mentioned in the script
  if (hashtags.length < 3) {
    // Check for major concepts in the script
    const keyConcepts = [
      { term: 'rulership', hashtag: 'planetaryrulership' },
      { term: 'aspect', hashtag: 'aspects' },
      { term: 'transit', hashtag: 'transits' },
      { term: 'house', hashtag: 'astrologicalhouses' },
      { term: 'element', hashtag: 'elements' },
      { term: 'modality', hashtag: 'modalities' },
      { term: 'cardinal', hashtag: 'cardinalsigns' },
      { term: 'fixed', hashtag: 'fixedsigns' },
      { term: 'mutable', hashtag: 'mutablesigns' },
    ];

    for (const concept of keyConcepts) {
      if (hashtags.length >= 3) break;
      if (
        scriptText.includes(concept.term) &&
        !hashtags.some((tag) => tag.includes(concept.hashtag))
      ) {
        hashtags.push(`#${concept.hashtag}`);
      }
    }
  }

  // Priority 3: Extract meaningful keyword from theme name (exclude generic words)
  if (hashtags.length < 3) {
    const themeName = script.themeName.toLowerCase();

    // Generic words to exclude from hashtags
    const genericWords = new Set([
      'understanding',
      'exploring',
      'learning',
      'discovering',
      'introduction',
      'guide',
      'basics',
      'fundamentals',
      'overview',
      'about',
      'what',
      'how',
      'why',
      'the',
      'and',
      'for',
      'with',
      'into',
    ]);

    // Extract key words from theme (e.g., "Understanding Planetary Rulership" -> "rulership")
    const themeKeywords = themeName
      .split(/\s+/)
      .filter((word) => {
        const clean = word.replace(/[^a-z0-9]/g, '');
        return (
          clean.length > 4 && // Only meaningful words
          !genericWords.has(clean) // Exclude generic words
        );
      })
      .map((word) => word.replace(/[^a-z0-9]/g, ''))
      .filter((word) => word.length > 0);

    for (const keyword of themeKeywords) {
      if (hashtags.length >= 3) break;
      if (
        keyword &&
        !hashtags.some((tag) => tag.toLowerCase().includes(keyword))
      ) {
        hashtags.push(`#${keyword}`);
      }
    }
  }

  // Fill remaining slots with general astrology hashtags if needed
  const generalHashtags = ['#astrology', '#cosmicwisdom', '#spiritualgrowth'];
  for (const tag of generalHashtags) {
    if (hashtags.length >= 3) break;
    if (!hashtags.includes(tag)) {
      hashtags.push(tag);
    }
  }

  return hashtags.slice(0, 3).join(' ');
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
  hashtags.push('#astrology');

  return hashtags.slice(0, 3).join(' ');
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

    // Generate hashtags based on cosmic data for the scheduled date
    const hashtags = await generateHashtagsForScript(script);

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
