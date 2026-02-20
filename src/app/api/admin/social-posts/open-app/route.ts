import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { content, platform } = await request.json();

    if (!content || !platform) {
      return NextResponse.json(
        { success: false, error: 'Missing content or platform' },
        { status: 400 },
      );
    }

    // Encode content for URL
    const encodedContent = encodeURIComponent(content);

    // Generate platform-specific URLs
    // Note: Some platforms don't support URL pre-filling, so we provide the best available option
    const urls: Record<string, string> = {
      instagram: `https://www.instagram.com/`, // Instagram doesn't support URL pre-fill, opens main page
      twitter: `https://twitter.com/intent/tweet?text=${encodedContent}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?quote=${encodedContent}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://lunary.app')}&summary=${encodedContent}`,
      pinterest: `https://www.pinterest.com/pin/create/button/?description=${encodedContent}`,
      reddit: `https://www.reddit.com/submit?title=${encodedContent}`,
    };

    const url = urls[platform.toLowerCase()];

    if (!url) {
      return NextResponse.json(
        { success: false, error: `Unsupported platform: ${platform}` },
        { status: 400 },
      );
    }

    // For Instagram, we need to copy to clipboard since URL pre-fill isn't supported
    const needsClipboard = platform.toLowerCase() === 'instagram';

    return NextResponse.json({
      success: true,
      url,
      platform,
      content,
      needsClipboard,
      message: needsClipboard
        ? 'Instagram opened. Content copied to clipboard - paste it into your post.'
        : `${platform} opened with content pre-filled.`,
    });
  } catch (error) {
    console.error('Error generating app URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
