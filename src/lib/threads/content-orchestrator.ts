import { generateCosmicTimingPost } from './original-content';
import { getDearStyleReferralPost } from '@/lib/social/shared/constants/persona-templates';
import {
  DAILY_SLOTS_UTC,
  THREADS_CHAR_LIMITS,
  type ThreadsPost,
  type ThreadsPostBatch,
} from './types';
import {
  getWinningPatterns,
  getBestHookPattern,
  getTopThemeWords,
  type WinningPatterns,
} from '@/lib/social/winning-patterns';

/**
 * Daily schedule (4 slots, same every day):
 * Slot 0 (14:00 UTC) - Cosmic event #1 (highest priority) — 9am EST
 * Slot 1 (17:00 UTC) - Cosmic event #2 (second priority) — 12pm EST
 * Slot 2 (21:00 UTC) - Cosmic event #3 (third priority) — 4pm EST
 * Slot 3 (23:00 UTC) - Dear-style referral CTA (follower growth) — 6pm EST
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
 * 3 cosmic transit posts + 1 dear-style referral, every day.
 */
export async function generateThreadsBatch(
  dateStr: string,
): Promise<ThreadsPostBatch> {
  const slots = DAILY_SLOTS_UTC;
  const date = new Date(dateStr);
  const seed = date.getDate() + date.getMonth() * 31;

  // Fetch winning patterns in parallel with cosmic generation (non-blocking)
  const [post0, post1, post2, winningPatterns] = await Promise.all([
    generateCosmicTimingPost(dateStr, slots[0], 0),
    generateCosmicTimingPost(dateStr, slots[1], 1),
    generateCosmicTimingPost(dateStr, slots[2], 2),
    getWinningPatterns().catch(() => null),
  ]);

  // Deduplicate: if fewer cosmic events exist than slots, ranks collapse
  // to the same event. Drop duplicates so we don't post the same thing twice.
  const seenHooks = new Set<string>();
  const cosmicPosts: ThreadsPost[] = [];
  for (const post of [post0, post1, post2]) {
    if (seenHooks.has(post.hook)) continue;
    seenHooks.add(post.hook);
    cosmicPosts.push(post);
  }

  // Slot 3: dear-style referral CTA (drives follower growth)
  const post3 = buildDearStylePost(dateStr, slots[3], seed, winningPatterns);

  const rawPosts = [...cosmicPosts, post3];
  const posts = applyMinuteOffsets(rawPosts, slots, dateStr);

  return { date: dateStr, posts };
}

/**
 * Build a dear-style referral CTA post for the orchestrator.
 * Optionally uses winning patterns to pick a proven hook style.
 */
function buildDearStylePost(
  dateStr: string,
  slotHour: number,
  seed: number,
  winningPatterns?: WinningPatterns | null,
): ThreadsPost {
  const content = getDearStyleReferralPost(seed);

  const scheduledDate = new Date(dateStr);
  scheduledDate.setUTCHours(slotHour, 0, 0, 0);

  // Split into hook + body (first sentence = hook, rest = body)
  const firstSentenceEnd = content.search(/[.!?]\s/);
  let hook =
    firstSentenceEnd > 0
      ? content.slice(0, firstSentenceEnd + 1)
      : content.slice(0, THREADS_CHAR_LIMITS.hook);
  const body =
    firstSentenceEnd > 0 ? content.slice(firstSentenceEnd + 2).trim() : '';

  // If winning patterns show questions outperform, convert statement hooks to questions
  if (winningPatterns && winningPatterns.confidence > 0.3) {
    const bestPattern = getBestHookPattern(winningPatterns);
    if (bestPattern === 'question' && !hook.endsWith('?')) {
      // Wrap statement hooks as questions where natural
      const themes = getTopThemeWords(winningPatterns, 3);
      if (themes.length > 0 && hook.length < THREADS_CHAR_LIMITS.hook - 20) {
        // Append a related question to boost engagement
        hook = hook.replace(/\.$/, '') + ' -- what do you think?';
      }
    }
  }

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
