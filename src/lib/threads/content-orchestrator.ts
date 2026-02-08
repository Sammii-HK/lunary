import { generateDailyBatch } from '@/lib/instagram/content-orchestrator';
import type { IGScheduledPost } from '@/lib/instagram/types';
import { adaptIGCaptionForThreads } from './caption-adapter';
import {
  generateConversationPost,
  generateCosmicTimingPost,
  generateEducationalPost,
  generateIdentityPost,
} from './original-content';
import {
  CROSSPOSTABLE_IG_TYPES,
  WEEKDAY_SLOTS_UTC,
  WEEKEND_SLOTS_UTC,
  type CrosspostableIGType,
  type ThreadsPost,
  type ThreadsPostBatch,
  type ThreadsPillar,
} from './types';

/**
 * Weekday schedule (5 slots):
 * Slot 0 (07:00) - Original: cosmic timing (moon/transit)
 * Slot 1 (11:00) - Original: conversation starter (hot take/question)
 * Slot 2 (15:00) - Cross-post: IG educational + image (did_you_know, carousel)
 * Slot 3 (19:00) - Cross-post: IG identity + image (meme, ranking, compatibility)
 * Slot 4 (22:00) - Original: conversation (question from theme facet)
 *
 * Weekend schedule (3 slots):
 * Slot 0 (11:00) - Cross-post: IG visual + image (meme, quote, cosmic)
 * Slot 1 (15:00) - Original: educational/conversation
 * Slot 2 (19:00) - Cross-post: IG identity + image (ranking, compatibility)
 */

// Priority order for cross-post selection per slot purpose
const WEEKDAY_CROSSPOST_EDUCATIONAL: CrosspostableIGType[] = [
  'did_you_know',
  'daily_cosmic',
  'quote',
];
const WEEKDAY_CROSSPOST_IDENTITY: CrosspostableIGType[] = [
  'meme',
  'sign_ranking',
  'compatibility',
];
const WEEKEND_CROSSPOST_VISUAL: CrosspostableIGType[] = [
  'meme',
  'quote',
  'daily_cosmic',
];
const WEEKEND_CROSSPOST_IDENTITY: CrosspostableIGType[] = [
  'sign_ranking',
  'compatibility',
  'meme',
];

/**
 * Generate a full day's Threads content batch.
 * Mixes IG cross-posts (with images) and original text-first posts.
 */
export async function generateThreadsBatch(
  dateStr: string,
): Promise<ThreadsPostBatch> {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  // Get IG batch for cross-post candidates
  let igPosts: IGScheduledPost[] = [];
  try {
    const igBatch = await generateDailyBatch(dateStr);
    igPosts = igBatch.posts;
  } catch (error) {
    console.error('[Threads] Failed to get IG batch for cross-posts:', error);
  }

  // Filter to cross-postable IG types
  const crossPostCandidates = igPosts.filter((post) =>
    (CROSSPOSTABLE_IG_TYPES as readonly string[]).includes(post.type),
  );

  const posts: ThreadsPost[] = isWeekend
    ? buildWeekendBatch(dateStr, crossPostCandidates)
    : buildWeekdayBatch(dateStr, crossPostCandidates);

  return { date: dateStr, posts };
}

function buildWeekdayBatch(
  dateStr: string,
  igCandidates: IGScheduledPost[],
): ThreadsPost[] {
  const slots = WEEKDAY_SLOTS_UTC;
  const posts: ThreadsPost[] = [];
  const usedIGTypes = new Set<string>();

  // Slot 0 (07:00) - Original: cosmic timing
  posts.push(generateCosmicTimingPost(dateStr, slots[0]));

  // Slot 1 (11:00) - Original: conversation
  posts.push(generateConversationPost(dateStr, slots[1]));

  // Slot 2 (15:00) - Cross-post: educational IG content
  const eduCrossPost = pickCrossPost(
    igCandidates,
    WEEKDAY_CROSSPOST_EDUCATIONAL,
    usedIGTypes,
  );
  if (eduCrossPost) {
    posts.push(buildCrossPost(eduCrossPost, 'educational', dateStr, slots[2]));
    usedIGTypes.add(eduCrossPost.type);
  } else {
    posts.push(generateEducationalPost(dateStr, slots[2]));
  }

  // Slot 3 (19:00) - Cross-post: identity IG content
  const identityCrossPost = pickCrossPost(
    igCandidates,
    WEEKDAY_CROSSPOST_IDENTITY,
    usedIGTypes,
  );
  if (identityCrossPost) {
    posts.push(
      buildCrossPost(identityCrossPost, 'visual_crosspost', dateStr, slots[3]),
    );
    usedIGTypes.add(identityCrossPost.type);
  } else {
    posts.push(generateIdentityPost(dateStr, slots[3]));
  }

  // Slot 4 (22:00) - Original: conversation
  posts.push(generateConversationPost(dateStr, slots[4]));

  return posts;
}

function buildWeekendBatch(
  dateStr: string,
  igCandidates: IGScheduledPost[],
): ThreadsPost[] {
  const slots = WEEKEND_SLOTS_UTC;
  const posts: ThreadsPost[] = [];
  const usedIGTypes = new Set<string>();

  // Slot 0 (11:00) - Cross-post: visual IG content
  const visualCrossPost = pickCrossPost(
    igCandidates,
    WEEKEND_CROSSPOST_VISUAL,
    usedIGTypes,
  );
  if (visualCrossPost) {
    posts.push(
      buildCrossPost(visualCrossPost, 'visual_crosspost', dateStr, slots[0]),
    );
    usedIGTypes.add(visualCrossPost.type);
  } else {
    posts.push(generateConversationPost(dateStr, slots[0]));
  }

  // Slot 1 (15:00) - Original: educational/conversation
  posts.push(generateEducationalPost(dateStr, slots[1]));

  // Slot 2 (19:00) - Cross-post: identity IG content
  const identityCrossPost = pickCrossPost(
    igCandidates,
    WEEKEND_CROSSPOST_IDENTITY,
    usedIGTypes,
  );
  if (identityCrossPost) {
    posts.push(
      buildCrossPost(identityCrossPost, 'visual_crosspost', dateStr, slots[2]),
    );
    usedIGTypes.add(identityCrossPost.type);
  } else {
    posts.push(generateIdentityPost(dateStr, slots[2]));
  }

  return posts;
}

/**
 * Pick the best available IG post for cross-posting based on priority order.
 * Avoids reusing the same IG post type within a single day.
 */
function pickCrossPost(
  candidates: IGScheduledPost[],
  priorityTypes: CrosspostableIGType[],
  usedTypes: Set<string>,
): IGScheduledPost | null {
  for (const type of priorityTypes) {
    if (usedTypes.has(type)) continue;
    const match = candidates.find((p) => p.type === type);
    if (match) return match;
  }
  return null;
}

/**
 * Build a Threads cross-post from an IG post.
 * Adapts the caption and includes the IG image URL.
 */
function buildCrossPost(
  igPost: IGScheduledPost,
  pillar: ThreadsPillar,
  dateStr: string,
  slotHour: number,
): ThreadsPost {
  const adapted = adaptIGCaptionForThreads(
    igPost.type as CrosspostableIGType,
    igPost,
  );

  const scheduledDate = new Date(dateStr);
  scheduledDate.setUTCHours(slotHour, 0, 0, 0);

  // Use the first image URL from the IG post
  const imageUrl = igPost.imageUrls[0] || null;

  return {
    hook: adapted.hook,
    body: adapted.body,
    prompt: adapted.prompt,
    topicTag: mapIGTypeToTopicTag(igPost.type as CrosspostableIGType),
    hasImage: !!imageUrl,
    imageUrl,
    pillar,
    scheduledTime: scheduledDate.toISOString(),
    source: 'ig_crosspost',
  };
}

function mapIGTypeToTopicTag(type: CrosspostableIGType): string {
  switch (type) {
    case 'meme':
    case 'sign_ranking':
    case 'compatibility':
    case 'daily_cosmic':
      return 'Astrology';
    case 'did_you_know':
      return 'Spirituality';
    case 'quote':
      return 'Spirituality';
    default:
      return 'Astrology';
  }
}
