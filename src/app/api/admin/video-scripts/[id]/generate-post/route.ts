import { NextRequest, NextResponse } from 'next/server';
import {
  getVideoScripts,
  updateVideoScriptWrittenPost,
} from '@/lib/social/video-script-generator';
import { categoryThemes } from '@/lib/social/weekly-themes';
import {
  applyPlatformFormatting,
  buildFallbackCopy,
  buildSourcePack,
  generateSocialCopy,
  validateSocialCopy,
} from '@/lib/social/social-copy-generator';
import { generateTikTokHashtags } from '@/lib/social/video-scripts/tiktok/metadata';

export const dynamic = 'force-dynamic';

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
      } else {
        postContent = generated.content;
      }
      postContent = applyPlatformFormatting(postContent, script.platform);
      hashtags = generateTikTokHashtags(facet, theme);
    }

    const postContentWithHashtags =
      hashtags.length > 0 && !/#\w+/.test(postContent)
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
