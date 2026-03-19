import {
  generateCosmicTimingPost,
  generateConversationPost,
  generateIdentityPost,
} from './original-content';
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
 * Daily schedule (5 slots):
 * Slot 0 (14:00 UTC / 10am ET) - Cosmic event #1 (highest priority)
 * Slot 1 (16:00 UTC / 12pm ET) - Cosmic event #2 (second priority)
 * Slot 2 (19:00 UTC / 3pm ET)  - Conversation or identity post (engagement)
 * Slot 3 (21:00 UTC / 5pm ET)  - Cosmic event #3 (third priority)
 * Slot 4 (23:00 UTC / 7pm ET)  - Dear-style referral CTA (follower growth)
 */

/**
 * Returns a deterministic minute offset (0–14) for a given slot index and date.
 * Spreads posts within the hour so they don't all fire at :00.
 */
function slotMinuteOffset(dateStr: string, slotIndex: number): number {
  const date = new Date(dateStr);
  const seed = date.getUTCDate() * 17 + date.getUTCMonth() * 31 + slotIndex * 7;
  return seed % 15;
}

/**
 * Applies per-slot minute offsets to a list of posts so they don't all fire at :00.
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
 * 3 cosmic transit posts + 1 conversation/identity + 1 dear-style referral.
 */
export async function generateThreadsBatch(
  dateStr: string,
): Promise<ThreadsPostBatch> {
  const slots = DAILY_SLOTS_UTC;
  const date = new Date(dateStr);
  const seed = date.getDate() + date.getMonth() * 31;

  // Use the first slot hour as reference for all ranks — avoids event priority
  // shifting between hours (e.g. Moon aspects tightening) causing duplicate hooks.
  const refHour = slots[0];

  // Alternate between conversation and identity posts for the engagement slot
  const engagementGenerator =
    seed % 2 === 0
      ? generateConversationPost(dateStr, slots[2])
      : generateIdentityPost(dateStr, slots[2]);

  const [post0, post1, post2, engagementPost, winningPatterns] =
    await Promise.all([
      generateCosmicTimingPost(dateStr, refHour, 0),
      generateCosmicTimingPost(dateStr, refHour, 1),
      generateCosmicTimingPost(dateStr, refHour, 2),
      engagementGenerator,
      getWinningPatterns().catch(() => null),
    ]);

  // Deduplicate cosmic posts
  const seenHooks = new Set<string>();
  const cosmicSlots = [slots[0], slots[1], slots[3]]; // slots 0, 1, 3 are cosmic
  const cosmicPosts: ThreadsPost[] = [];
  for (const [i, post] of [post0, post1, post2].entries()) {
    if (seenHooks.has(post.hook)) continue;
    seenHooks.add(post.hook);
    const slotDate = new Date(dateStr);
    slotDate.setUTCHours(cosmicSlots[i], 0, 0, 0);
    cosmicPosts.push({ ...post, scheduledTime: slotDate.toISOString() });
  }

  // Slot 4: dear-style referral CTA
  const referralPost = buildDearStylePost(
    dateStr,
    slots[4],
    seed,
    winningPatterns,
  );

  const rawPosts = [...cosmicPosts, engagementPost, referralPost];
  const posts = applyMinuteOffsets(rawPosts, slots, dateStr);

  // Sort by scheduled time
  posts.sort(
    (a, b) =>
      new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime(),
  );

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

  // Split into hook + body (first line break = split point)
  const firstBreak = content.indexOf('\n');
  let hook =
    firstBreak > 0
      ? content.slice(0, firstBreak)
      : content.slice(0, THREADS_CHAR_LIMITS.hook);
  const body = firstBreak > 0 ? content.slice(firstBreak + 1).trim() : '';

  // If winning patterns show questions outperform, convert statement hooks to questions
  if (winningPatterns && winningPatterns.confidence > 0.3) {
    const bestPattern = getBestHookPattern(winningPatterns);
    if (bestPattern === 'question' && !hook.endsWith('?')) {
      const themes = getTopThemeWords(winningPatterns, 3);
      if (themes.length > 0 && hook.length < THREADS_CHAR_LIMITS.hook - 20) {
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
