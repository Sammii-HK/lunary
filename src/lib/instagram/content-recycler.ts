import { prisma } from '@/lib/prisma';
import { generateCaption } from './caption-generator';
import type { IGScheduledPost, IGPostType } from './types';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

// Only recycle evergreen content types (not time-sensitive cosmic or stories)
const RECYCLABLE_TYPES: IGPostType[] = [
  'carousel',
  'meme',
  'did_you_know',
  'sign_ranking',
  'compatibility',
  'quote',
];

// Minimum age in days before a post can be recycled
const MIN_RECYCLE_AGE_DAYS = 30;

// Minimum engagement rate to qualify for recycling
const MIN_ENGAGEMENT_RATE = 0.03;

/**
 * Get high-performing evergreen posts that are old enough to repost.
 */
export async function getRecycleCandidates(limit = 5) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - MIN_RECYCLE_AGE_DAYS);

  try {
    const candidates = await prisma.instagram_performance.findMany({
      where: {
        posted_at: { lte: cutoff },
        post_type: { in: RECYCLABLE_TYPES },
        engagement_rate: { gte: MIN_ENGAGEMENT_RATE },
      },
      orderBy: [{ save_rate: 'desc' }, { engagement_rate: 'desc' }],
      take: limit,
    });

    return candidates;
  } catch (error) {
    console.error('[Content Recycler] Failed to fetch candidates:', error);
    return [];
  }
}

/**
 * Refresh a recycled post with a new caption and hashtags.
 * Keeps the same image URL but generates fresh copy.
 */
export function refreshRecycledContent(
  original: {
    post_type: string;
    image_url: string | null;
    content_category: string | null;
    metadata: Record<string, unknown> | null;
  },
  scheduledTime: string,
): IGScheduledPost | null {
  const postType = original.post_type as IGPostType;
  if (!original.image_url) return null;

  // Generate fresh caption with a "revisited" angle
  const captionOpts: Record<string, unknown> = {
    category: original.content_category || undefined,
    ...(original.metadata || {}),
  };

  const { caption, hashtags } = generateCaption(postType, captionOpts);

  // Prefix caption with a re-share hook
  const reshareHooks = [
    'This one deserved a comeback.',
    'In case you missed it.',
    'One of your favourites, back again.',
    'Still hits different.',
    'A fan favourite worth repeating.',
  ];
  const hookIndex = Math.abs(hashStr(scheduledTime)) % reshareHooks.length;
  const reshareCaption = `${reshareHooks[hookIndex]}\n\n${caption}`;

  return {
    type: postType,
    format: 'square',
    imageUrls: [original.image_url],
    caption: reshareCaption,
    hashtags,
    scheduledTime,
    metadata: {
      category: (original.content_category as any) || undefined,
      slug: (original.metadata?.slug as string) || undefined,
    },
  };
}

/**
 * Generate a recycled post for a given date (used in Sunday bonus slot).
 * Returns null if no candidates are available.
 */
export async function generateRecycledPost(
  dateStr: string,
): Promise<IGScheduledPost | null> {
  const candidates = await getRecycleCandidates(10);
  if (candidates.length === 0) return null;

  // Pick deterministically based on date
  const index = Math.abs(hashStr(dateStr)) % candidates.length;
  const candidate = candidates[index];

  const scheduledTime = buildScheduleTime(dateStr, 16); // 4pm UTC bonus slot

  return refreshRecycledContent(
    {
      post_type: candidate.post_type,
      image_url: candidate.image_url,
      content_category: candidate.content_category,
      metadata: candidate.metadata as Record<string, unknown> | null,
    },
    scheduledTime,
  );
}

function hashStr(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return hash;
}

function buildScheduleTime(dateStr: string, utcHour: number): string {
  const date = new Date(dateStr);
  date.setUTCHours(utcHour, 0, 0, 0);
  return date.toISOString();
}
