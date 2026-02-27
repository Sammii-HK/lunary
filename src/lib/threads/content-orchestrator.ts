import {
  generateConversationPost,
  generateCosmicTimingPost,
  generateIdentityPost,
  generateEducationalPost,
} from './original-content';
import { getDearStyleReferralPost } from '@/lib/social/shared/constants/persona-templates';
import {
  WEEKDAY_SLOTS_UTC,
  WEEKEND_SLOTS_UTC,
  THREADS_CHAR_LIMITS,
  type ThreadsPost,
  type ThreadsPostBatch,
} from './types';

/**
 * Weekday schedule (3 slots — UK/US crossover window):
 * Slot 0 (14:00 UTC) - Original: cosmic timing / transit text — 9am EST morning
 * Slot 1 (17:00 UTC) - Rotating: Mon=identity, Tue=referral, Wed=educational,
 *                       Thu=identity, Fri=referral — peak 12pm EST engagement
 * Slot 2 (21:00 UTC) - Original: conversation / question — 4pm EST all timezones active
 *
 * Weekend schedule (2 slots):
 * Slot 0 (14:00 UTC) - Original: cosmic timing / conversation
 * Slot 1 (20:00 UTC) - Rotating: Sat=identity, Sun=educational
 */

/**
 * Returns a deterministic minute offset (0–14) for a given slot index and date.
 * Spreads posts within the hour so they don't all fire at :00.
 */
function slotMinuteOffset(dateStr: string, slotIndex: number): number {
  const date = new Date(dateStr);
  // Combine date parts + slot to get a repeatable but varied number
  const seed = date.getUTCDate() * 17 + date.getUTCMonth() * 31 + slotIndex * 7;
  return seed % 15;
}

/**
 * Applies per-slot minute offsets to a list of posts so they don't all fire at :00.
 * Slots are identified by their hour component; each gets a different deterministic offset.
 */
function applyMinuteOffsets(
  posts: ThreadsPost[],
  slots: number[],
  dateStr: string,
): ThreadsPost[] {
  return posts.map((post) => {
    const postDate = new Date(post.scheduledTime);
    const hourUTC = postDate.getUTCHours();
    const slotIndex = slots.indexOf(hourUTC);
    if (slotIndex === -1) return post;
    const minutes = slotMinuteOffset(dateStr, slotIndex);
    postDate.setUTCMinutes(minutes, 0, 0);
    return { ...post, scheduledTime: postDate.toISOString() };
  });
}

/**
 * Generate a full day's Threads content batch.
 * Text-first posts only, no IG cross-posts.
 */
export async function generateThreadsBatch(
  dateStr: string,
): Promise<ThreadsPostBatch> {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  const slots = isWeekend ? WEEKEND_SLOTS_UTC : WEEKDAY_SLOTS_UTC;
  const rawPosts: ThreadsPost[] = isWeekend
    ? buildWeekendBatch(dateStr)
    : buildWeekdayBatch(dateStr);

  const posts = applyMinuteOffsets(rawPosts, slots, dateStr);

  return { date: dateStr, posts };
}

function buildWeekdayBatch(dateStr: string): ThreadsPost[] {
  const slots = WEEKDAY_SLOTS_UTC;
  const posts: ThreadsPost[] = [];
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 1=Mon .. 5=Fri
  const seed = date.getDate() + date.getMonth() * 31;

  // Slot 0 (14:00 UTC) - Cosmic timing / transit content
  posts.push(generateCosmicTimingPost(dateStr, slots[0]));

  // Slot 1 (17:00 UTC) - Rotating by day of week
  // Mon(1)=identity, Tue(2)=referral, Wed(3)=educational, Thu(4)=referral, Fri(5)=identity
  if (dayOfWeek === 2 || dayOfWeek === 4) {
    posts.push(buildDearStylePost(dateStr, slots[1], seed));
  } else if (dayOfWeek === 3) {
    posts.push(generateEducationalPost(dateStr, slots[1]));
  } else {
    posts.push(generateIdentityPost(dateStr, slots[1]));
  }

  // Slot 2 (21:00 UTC) - Conversation / question (drives replies)
  posts.push(generateConversationPost(dateStr, slots[2]));

  return posts;
}

function buildWeekendBatch(dateStr: string): ThreadsPost[] {
  const slots = WEEKEND_SLOTS_UTC;
  const posts: ThreadsPost[] = [];
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay(); // 0=Sun, 6=Sat

  // Slot 0 (14:00 UTC) - Cosmic timing / conversation
  posts.push(generateCosmicTimingPost(dateStr, slots[0]));

  // Slot 1 (20:00 UTC) - Rotating: Sat=identity, Sun=educational
  if (dayOfWeek === 6) {
    posts.push(generateIdentityPost(dateStr, slots[1]));
  } else {
    posts.push(generateEducationalPost(dateStr, slots[1]));
  }

  return posts;
}

/**
 * Build a dear-style referral CTA post for the orchestrator.
 */
function buildDearStylePost(
  dateStr: string,
  slotHour: number,
  seed: number,
): ThreadsPost {
  const content = getDearStyleReferralPost(seed);

  const scheduledDate = new Date(dateStr);
  scheduledDate.setUTCHours(slotHour, 0, 0, 0);

  // Split into hook + body (first sentence = hook, rest = body)
  const firstSentenceEnd = content.search(/[.!?]\s/);
  const hook =
    firstSentenceEnd > 0
      ? content.slice(0, firstSentenceEnd + 1)
      : content.slice(0, THREADS_CHAR_LIMITS.hook);
  const body =
    firstSentenceEnd > 0 ? content.slice(firstSentenceEnd + 2).trim() : '';

  return {
    hook,
    body,
    prompt: '',
    topicTag: 'Astrology',
    hasImage: false,
    imageUrl: null,
    pillar: 'conversation',
    scheduledTime: scheduledDate.toISOString(),
    source: 'original',
  };
}
