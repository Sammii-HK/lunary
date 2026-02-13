import {
  generateConversationPost,
  generateCosmicTimingPost,
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
 * Slot 1 (17:00 UTC) - Dear-style referral CTA — peak 12pm EST engagement
 * Slot 2 (21:00 UTC) - Original: conversation / question — 4pm EST all timezones active
 *
 * Weekend schedule (2 slots):
 * Slot 0 (14:00 UTC) - Original: cosmic timing / conversation
 * Slot 1 (20:00 UTC) - Dear-style referral CTA — weekend evening leisure
 */

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

  const posts: ThreadsPost[] = isWeekend
    ? buildWeekendBatch(dateStr)
    : buildWeekdayBatch(dateStr);

  return { date: dateStr, posts };
}

function buildWeekdayBatch(dateStr: string): ThreadsPost[] {
  const slots = WEEKDAY_SLOTS_UTC;
  const posts: ThreadsPost[] = [];
  const date = new Date(dateStr);
  const seed = date.getDate() + date.getMonth() * 31;

  // Slot 0 (14:00 UTC) - Cosmic timing / transit content
  posts.push(generateCosmicTimingPost(dateStr, slots[0]));

  // Slot 1 (17:00 UTC) - Dear-style referral CTA (best performer, peak slot)
  posts.push(buildDearStylePost(dateStr, slots[1], seed));

  // Slot 2 (21:00 UTC) - Conversation / question (drives replies)
  posts.push(generateConversationPost(dateStr, slots[2]));

  return posts;
}

function buildWeekendBatch(dateStr: string): ThreadsPost[] {
  const slots = WEEKEND_SLOTS_UTC;
  const posts: ThreadsPost[] = [];
  const date = new Date(dateStr);
  const seed = date.getDate() + date.getMonth() * 31;

  // Slot 0 (14:00 UTC) - Cosmic timing / conversation
  posts.push(generateCosmicTimingPost(dateStr, slots[0]));

  // Slot 1 (20:00 UTC) - Dear-style referral CTA (weekend evening leisure)
  posts.push(buildDearStylePost(dateStr, slots[1], seed));

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
