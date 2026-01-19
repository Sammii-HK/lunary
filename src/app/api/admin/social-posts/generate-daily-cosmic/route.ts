import { NextRequest, NextResponse } from 'next/server';
import { getImageBaseUrl } from '@/lib/urls';
import { getPlatformImageFormat } from '@/lib/social/educational-images';
import { normalizeHashtagsForPlatform } from '@/lib/social/social-copy-generator';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';

export const runtime = 'nodejs';

interface PostContent {
  date: string;
  primaryEvent: {
    name: string;
    energy: string;
  };
  highlights: string[];
  horoscopeSnippet: string;
  callToAction: string;
}

interface SucculentPostData {
  accountGroupId: string;
  name?: string;
  content: string;
  platforms: string[];
  scheduledDate: string;
  media: Array<{
    type: 'image';
    url: string;
    alt: string;
  }>;
  variants?: Record<string, { content: string; media?: string[] }>;
}

function getWeeklyHashtags(date: string): string {
  const themes = [
    ['#weeklyhoroscope', '#astroforecast', '#weeklyastro'],
    ['#lunaryweekly', '#cosmicforecast', '#celestialguide'],
    ['#astroinsights', '#starguidance', '#moonmagic'],
  ];

  const seed = new Date(date).getDate();
  return themes
    .map((theme, index) => theme[(seed + index) % theme.length])
    .join(' ');
}

function formatCosmicPost(content: PostContent, date: string): string {
  const sections = [
    content.highlights?.[0],
    content.horoscopeSnippet,
    content.callToAction,
    getWeeklyHashtags(date),
  ]
    .map((section) => section?.trim())
    .filter(Boolean);

  return normalizeHashtagsForPlatform(
    normalizeGeneratedContent(sections.join('\n\n')),
    'instagram',
  );
}

function formatTwitterContent(content: PostContent, date: string): string {
  const baseText = [content.highlights?.[0], content.callToAction]
    .map((value) => value?.trim())
    .filter(Boolean)
    .join(' — ');

  const hashtags = getWeeklyHashtags(date)
    .split(' ')
    .filter(Boolean)
    .slice(0, 3)
    .join(' ');

  const normalized = baseText.replace(/\s+/g, ' ').trim();
  const hashtagSegment = hashtags ? ` ${hashtags}` : '';
  const maxLength =
    280 - (hashtagSegment.length > 0 ? hashtagSegment.length : 0);
  const truncated =
    normalized.length > maxLength && maxLength > 1
      ? `${normalized.slice(0, maxLength - 1)}…`
      : normalized;

  return normalizeHashtagsForPlatform(
    normalizeGeneratedContent(`${truncated}${hashtagSegment}`.trim()),
    'twitter',
  );
}

function formatLinkedInContent(content: PostContent, date: string): string {
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });

  const sections = [
    `Weekly cosmic forecast for ${formattedDate}`,
    content.primaryEvent
      ? `Primary event: ${content.primaryEvent.name} — ${content.primaryEvent.energy}`
      : undefined,
    content.horoscopeSnippet,
    content.highlights?.[0],
    content.callToAction,
    getWeeklyHashtags(date),
  ]
    .map((section) => section?.trim())
    .filter(Boolean);

  return normalizeHashtagsForPlatform(
    normalizeGeneratedContent(sections.join('\n\n')),
    'linkedin',
  );
}

function resolveTargetDate(raw?: string): string | null {
  if (raw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
    return raw;
  }
  const tomorrow = new Date();
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  return tomorrow.toISOString().split('T')[0];
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json().catch(() => ({}));
    const dateStr = resolveTargetDate(payload?.date);

    if (!dateStr) {
      return NextResponse.json(
        { success: false, error: 'Invalid date. Use YYYY-MM-DD.' },
        { status: 400 },
      );
    }

    const apiKey = process.env.SUCCULENT_SECRET_KEY;
    const accountGroupId = process.env.SUCCULENT_ACCOUNT_GROUP_ID;
    const baseUrl = getImageBaseUrl();

    if (!apiKey || !accountGroupId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing Succulent API configuration',
        },
        { status: 500 },
      );
    }

    const cosmicResponse = await fetch(
      `${baseUrl}/api/og/cosmic-post?date=${dateStr}`,
    );

    if (!cosmicResponse.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `Failed to fetch cosmic content (${cosmicResponse.status})`,
        },
        { status: 500 },
      );
    }

    const cosmicContent: PostContent = await cosmicResponse.json();

    const scheduledDate = new Date(`${dateStr}T08:00:00.000Z`);
    const readableDate = scheduledDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

    const getCosmicFormat = (platform: string) =>
      getPlatformImageFormat(platform === 'x' ? 'twitter' : platform);
    const buildCosmicImageUrl = (platform: string) =>
      `${baseUrl}/api/og/cosmic/${dateStr}?format=${getCosmicFormat(platform)}`;
    const altText = `${cosmicContent.primaryEvent.name} - ${cosmicContent.primaryEvent.energy}. Daily cosmic guidance and astronomical insights.`;

    const baseContent = formatCosmicPost(cosmicContent, dateStr);
    const twitterContent = formatTwitterContent(cosmicContent, dateStr);
    const linkedinContent = formatLinkedInContent(cosmicContent, dateStr);

    const variants: Record<string, { content: string; media?: string[] }> = {
      facebook: {
        content: baseContent,
        media: [buildCosmicImageUrl('facebook')],
      },
      x: {
        content: twitterContent || baseContent,
        media: [buildCosmicImageUrl('twitter')],
      },
      threads: {
        content: twitterContent || baseContent,
        media: [buildCosmicImageUrl('threads')],
      },
      linkedin: {
        content: linkedinContent || baseContent,
        media: [buildCosmicImageUrl('linkedin')],
      },
    };

    const postData: SucculentPostData = {
      accountGroupId,
      name: `Cosmic Post - ${readableDate}`,
      content: baseContent,
      platforms: ['instagram', 'tiktok'],
      scheduledDate: scheduledDate.toISOString(),
      media: [
        {
          type: 'image',
          url: buildCosmicImageUrl('instagram'),
          alt: altText,
        },
      ],
      variants,
    };

    const response = await fetch('https://app.succulent.social/api/posts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify(postData),
    });

    const responseText = await response.text();
    let responseData: any = null;
    try {
      responseData = responseText ? JSON.parse(responseText) : null;
    } catch (error) {
      responseData = { raw: responseText };
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            responseData?.error ||
            responseData?.message ||
            `HTTP ${response.status}`,
        },
        { status: response.status },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Scheduled daily cosmic post for ${dateStr}`,
      postId: responseData?.data?.postId || responseData?.postId || null,
    });
  } catch (error) {
    console.error('Failed to generate daily cosmic post:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
