import { NextRequest, NextResponse } from 'next/server';
import {
  getVideoScripts,
  updateVideoScriptWrittenPost,
  VideoScript,
} from '@/lib/social/video-script-generator';
import { categoryThemes, generateHashtags } from '@/lib/social/weekly-themes';
import {
  applyPlatformFormatting,
  buildFallbackCopy,
  buildSourcePack,
  generateSocialCopy,
  validateSocialCopy,
} from '@/lib/social/social-copy-generator';

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
  return uniqueTags.slice(0, 3).join(' ');
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

    const theme = categoryThemes.find((item) => item.name === script.themeName);
    const facet =
      theme?.facets.find((item) => item.title === script.facetTitle) ||
      theme?.facets.find(
        (item) => item.title.toLowerCase() === script.facetTitle.toLowerCase(),
      );
    let postContent = script.fullScript;
    let hashtags: string[] = [];
    if (theme && facet) {
      const pack = buildSourcePack({
        topic: script.facetTitle,
        theme,
        platform: script.platform,
        postType: 'video_caption',
        facet,
      });
      let generated = await generateSocialCopy(pack);
      let issues = validateSocialCopy(generated.content, pack.topic);
      const lineCount = generated.content.split('\n').filter(Boolean).length;
      if (lineCount !== 4) {
        issues.push('Video caption must be 4 lines');
      }
      if (issues.length > 0) {
        generated = await generateSocialCopy(pack, `Fix: ${issues.join('; ')}`);
        issues = validateSocialCopy(generated.content, pack.topic);
      }
      if (issues.length > 0) {
        const fallback = await buildFallbackCopy(pack);
        postContent = fallback.content;
        hashtags = fallback.hashtags;
      } else {
        postContent = generated.content;
        hashtags = generated.hashtags || [];
      }
      postContent = applyPlatformFormatting(postContent, script.platform);
    }

    const shouldAppendHashtags =
      hashtags.length > 0 && !/#\w+/.test(postContent);
    const postContentWithHashtags = shouldAppendHashtags
      ? `${postContent}\n\n${hashtags.slice(0, 3).join(' ')}`
      : postContent;

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
