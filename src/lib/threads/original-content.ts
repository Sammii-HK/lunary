import { seededRandom, seededPick } from '@/lib/instagram/ig-utils';
import { getThemeForDate } from '@/lib/social/weekly-themes';
import {
  categoryAngleTemplates,
  threadsAngleTemplates,
} from '@/lib/social/with-threads';
import {
  getAllRichEntries,
  extractGrimoireSnippet,
} from '@/lib/social/grimoire-content';
import type { ThemeCategory, ThreadIntent } from '@/lib/social/types';
import {
  THREADS_CHAR_LIMITS,
  THREADS_TOPIC_TAGS,
  type ThreadsPillar,
  type ThreadsPost,
} from './types';
import {
  getWeightedGrimoireCategories,
  getOrbitHookSuggestions,
  shouldAvoidHook,
} from './orbit-insights';

// Shared cosmic event detection (used by Threads, carousels, and video scripts)
import {
  buildCosmicEvents,
  getRecentEventKeys,
  dedupeCosmicEvents,
  type CosmicEvent,
} from '@/lib/astro/cosmic-events';

const ZODIAC_SIGNS = [
  'Aries',
  'Taurus',
  'Gemini',
  'Cancer',
  'Leo',
  'Virgo',
  'Libra',
  'Scorpio',
  'Sagittarius',
  'Capricorn',
  'Aquarius',
  'Pisces',
];

// buildCosmicEvents(), getRecentEventKeys(), and dedupeCosmicEvents()
// are imported from @/lib/astro/cosmic-events (shared module).
// The inline implementations below this comment have been removed.
// See the shared module for the full 10-type cosmic event detection.

// --- PLACEHOLDER: The following large block was removed ---
// The original ~550 lines of buildCosmicEvents + getRecentEventKeys +
// removeStaleSameTypeEvents are now in src/lib/astro/cosmic-events.ts.
// Threads, carousels, and video scripts all import from there.
//
// Functions that reference them (generateCosmicTimingPost, getCosmicEventCount,
// getCosmicTimingEventType) now use the shared imports above.

/** @deprecated - use dedupeCosmicEvents from @/lib/astro/cosmic-events */
function removeStaleSameTypeEvents(
  events: CosmicEvent[],
  recent: { types: Map<string, number>; keys: Set<string> },
): CosmicEvent[] {
  return dedupeCosmicEvents(events, recent);
}

/**
 * Generate a cosmic timing post using real-time transit/moon data.
 * Uses the full cosmic data: planetary positions, aspects, sign changes,
 * retrogrades, stelliums, zodiac seasons, and moon sign transitions.
 *
 * Priorities are dynamically adjusted based on the last 2 days of content
 * to keep the feed fresh — recurring events (stelliums, aspects, spotlights)
 * get penalised if they appeared recently, while time-sensitive events
 * (ingress, retrograde stations) stay near the top.
 *
 * @param rank - Which event to pick (0 = highest priority, 1 = second, etc.)
 *   This allows multiple cosmic posts per day covering different events.
 */
export async function generateCosmicTimingPost(
  dateStr: string,
  slotHour: number,
  rank: number = 0,
): Promise<ThreadsPost> {
  const rng = seededRandom(`cosmic-${dateStr}-${slotHour}-r${rank}`);
  const rawEvents = buildCosmicEvents(dateStr, slotHour);

  // Remove any event that was used in the last 3 days — no repeats in a 4-day window
  const recent = getRecentEventKeys(dateStr, slotHour);
  const events = removeStaleSameTypeEvents(rawEvents, recent);

  // Pick the Nth ranked event (fall back to last if rank exceeds list)
  const eventIndex = Math.min(rank, events.length - 1);
  const event = events[eventIndex];
  const content = event.generate(rng);

  // Check orbit hook suggestions — may override the hook
  const orbitHooks = await getOrbitHookSuggestions('cosmic_timing');
  let hook = content.hook;

  if (orbitHooks.length > 0 && rng() > 0.8) {
    // 20% chance to use an orbit-suggested hook when available
    const orbitHook = orbitHooks[Math.floor(rng() * orbitHooks.length)];
    if (!(await shouldAvoidHook('cosmic_timing', orbitHook))) {
      hook = orbitHook;
    }
  }

  return buildOriginalPost({
    hook,
    body: content.body,
    prompt: content.prompt,
    topicTag: content.topicTag,
    pillar: 'cosmic_timing',
    dateStr,
    slotHour,
  });
}

/**
 * Returns the number of cosmic events available for a given date.
 * Used by the orchestrator to decide how many cosmic slots to fill.
 */
export function getCosmicEventCount(dateStr: string, slotHour: number): number {
  const events = buildCosmicEvents(dateStr, slotHour);
  // Only count events with priority above the fallback threshold (planet spotlight / moon position)
  return events.filter((e) => e.priority > 30).length;
}

/**
 * Returns the type of event that a given rank will generate for dedup purposes.
 * Used by the orchestrator to avoid duplicate transit content across slots.
 */
export function getCosmicTimingEventType(
  dateStr: string,
  slotHour: number,
  rank: number = 0,
): string {
  const events = buildCosmicEvents(dateStr, slotHour);
  const eventIndex = Math.min(rank, events.length - 1);
  return events[eventIndex]?.type || 'unknown';
}

/**
 * Generate a conversation starter post (questions and hot takes).
 * Uses theme-based angle templates for variety.
 *
 * @param options.excludeCategory - Skip this category and fall back to 'zodiac'.
 *   Used when slot 0 already generated a transit/planetary post to avoid duplicates.
 */
export async function generateConversationPost(
  dateStr: string,
  slotHour: number,
  options?: { excludeCategory?: ThemeCategory },
): Promise<ThreadsPost> {
  const date = new Date(dateStr);
  const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
  const { theme } = getThemeForDate(date, weekNumber);
  let category = theme.category as ThemeCategory;

  // If this category is excluded (e.g. a transit post already covered planetary today),
  // fall back to zodiac which is always safe and engagement-positive.
  if (options?.excludeCategory && category === options.excludeCategory) {
    category = 'zodiac';
  }
  const rng = seededRandom(`threads-convo-${dateStr}-${slotHour}`);

  // Mix between existing category angles and new threads-specific angles
  const useThreadsAngle = rng() > 0.5;

  let hook: string;
  let body: string;
  let prompt: string;

  // Check for orbit hook suggestions for conversation pillar
  const orbitConvoHooks = await getOrbitHookSuggestions('conversation');

  if (orbitConvoHooks.length > 0 && rng() > 0.7) {
    // 30% chance to use an orbit-suggested hook when available
    hook = orbitConvoHooks[Math.floor(rng() * orbitConvoHooks.length)];
    body = '';
    prompt = '';
  } else if (useThreadsAngle) {
    const angles = threadsAngleTemplates(category);
    const intentFilter: ThreadIntent[] = ['hot_take', 'poll'];
    const filtered = angles.filter((a) => intentFilter.includes(a.intent));
    const angle =
      filtered.length > 0
        ? filtered[Math.floor(rng() * filtered.length)]
        : angles[Math.floor(rng() * angles.length)];

    hook = angle.opener;
    body = '';
    prompt = angle.closer;
  } else {
    // Use existing category angle templates
    const angles = categoryAngleTemplates(category);
    const angle = angles[Math.floor(rng() * angles.length)];
    hook = angle.opener;
    body = angle.payload || '';
    prompt = angle.closer;
  }

  // Skip hooks orbit says to avoid, fall back to standard template
  if (await shouldAvoidHook('conversation', hook)) {
    const fallbackAngles = categoryAngleTemplates(category);
    const fallback = fallbackAngles[Math.floor(rng() * fallbackAngles.length)];
    hook = fallback.opener;
    body = fallback.payload || '';
    prompt = fallback.closer;
  }

  return buildOriginalPost({
    hook,
    body,
    prompt,
    topicTag: THREADS_TOPIC_TAGS[category] || 'Astrology',
    pillar: 'conversation',
    dateStr,
    slotHour,
  });
}

/**
 * Generate an identity callout post (sign-based engagement bait).
 */
export async function generateIdentityPost(
  dateStr: string,
  slotHour: number,
): Promise<ThreadsPost> {
  const date = new Date(dateStr);
  const weekNumber = Math.floor(date.getTime() / (7 * 24 * 60 * 60 * 1000));
  const { theme } = getThemeForDate(date, weekNumber);
  const category = theme.category as ThemeCategory;
  const rng = seededRandom(`threads-identity-${dateStr}-${slotHour}`);

  const angles = threadsAngleTemplates(category);
  const identityAngles = angles.filter(
    (a) => a.intent === 'identity_callout' || a.intent === 'ranking',
  );
  const angle =
    identityAngles.length > 0
      ? identityAngles[Math.floor(rng() * identityAngles.length)]
      : angles[Math.floor(rng() * angles.length)];

  // Check for orbit hook suggestions for identity pillar
  const orbitIdentityHooks = await getOrbitHookSuggestions('identity');

  // For identity callouts, swap in a random sign for personalisation
  let hook = angle.opener;

  // 30% chance to use orbit-suggested hook when available
  if (orbitIdentityHooks.length > 0 && rng() > 0.7) {
    hook = orbitIdentityHooks[Math.floor(rng() * orbitIdentityHooks.length)];
  }

  // Skip hooks orbit says to avoid
  if (await shouldAvoidHook('identity', hook)) {
    hook = angle.opener;
  }

  if (angle.intent === 'identity_callout') {
    const sign = seededPick(
      ZODIAC_SIGNS,
      `threads-sign-${dateStr}-${slotHour}`,
    );
    // Replace any hardcoded sign reference with the selected sign
    hook = hook.replace(
      /Scorpio|Aries|Taurus|Gemini|Cancer|Leo|Virgo|Libra|Sagittarius|Capricorn|Aquarius|Pisces/i,
      sign,
    );
  }

  return buildOriginalPost({
    hook,
    body: '',
    prompt: angle.closer,
    topicTag: THREADS_TOPIC_TAGS[category] || 'Astrology',
    pillar: 'identity',
    dateStr,
    slotHour,
  });
}

/**
 * Generate an educational post using actual grimoire data.
 * Uses the existing grimoire content system (getAllRichEntries + extractGrimoireSnippet)
 * with seeded random for deterministic daily selection.
 */
export async function generateEducationalPost(
  dateStr: string,
  slotHour: number,
): Promise<ThreadsPost> {
  const rng = seededRandom(`threads-edu-${dateStr}-${slotHour}`);

  // Use the grimoire system's full entry pool
  const allEntries = getAllRichEntries();

  // Use orbit-weighted categories if available, otherwise default
  const orbitCategories = await getWeightedGrimoireCategories();
  const targetCategory =
    orbitCategories.length > 0
      ? orbitCategories[Math.floor(rng() * orbitCategories.length)]
      : null;

  // Filter to orbit's recommended category, fall back to broad filter
  const weighted = targetCategory
    ? allEntries.filter((e) => e.category === targetCategory)
    : allEntries.filter((e) =>
        ['zodiac', 'numerology', 'tarot', 'crystal'].includes(e.category),
      );
  const pool = weighted.length > 0 ? weighted : allEntries;

  // Seeded pick from pool
  const entry = pool[Math.floor(rng() * pool.length)];
  const snippet = extractGrimoireSnippet(entry);

  // Format snippet into a Threads-native educational post
  const hook = snippet.title;
  const keyPoints = snippet.keyPoints.filter((p) => p.length > 0);
  const body =
    keyPoints.length > 0
      ? keyPoints.slice(0, 2).join('. ').toLowerCase()
      : (snippet.summary || '').split('.').slice(0, 2).join('.').toLowerCase();

  // Category → topic tag mapping
  const categoryTags: Record<string, string> = {
    zodiac: 'Zodiac',
    numerology: 'Numerology',
    tarot: 'Tarot',
    crystal: 'Crystals',
    concept: 'Astrology',
    planet: 'Astrology',
    season: 'Astrology',
  };

  return buildOriginalPost({
    hook,
    body,
    prompt: '',
    topicTag: categoryTags[snippet.category] || 'Astrology',
    pillar: 'educational',
    dateStr,
    slotHour,
  });
}

interface OriginalPostArgs {
  hook: string;
  body: string;
  prompt: string;
  topicTag: string;
  pillar: ThreadsPillar;
  dateStr: string;
  slotHour: number;
}

function buildOriginalPost(args: OriginalPostArgs): ThreadsPost {
  const { hook, body, prompt, topicTag, pillar, dateStr, slotHour } = args;

  // Enforce character limits
  const trimmedHook = truncate(hook, THREADS_CHAR_LIMITS.hook);
  const trimmedPrompt = truncate(prompt, 80);
  const usedChars = trimmedHook.length + trimmedPrompt.length + 4;
  const bodyLimit = Math.min(
    THREADS_CHAR_LIMITS.body,
    THREADS_CHAR_LIMITS.total - usedChars,
  );
  const trimmedBody = truncate(body, Math.max(0, bodyLimit));

  const scheduledDate = new Date(dateStr);
  scheduledDate.setUTCHours(slotHour, 0, 0, 0);

  return {
    hook: trimmedHook,
    body: trimmedBody,
    prompt: trimmedPrompt,
    topicTag,
    hasImage: false,
    imageUrl: null,
    pillar,
    scheduledTime: scheduledDate.toISOString(),
    source: 'original',
  };
}

function truncate(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text || '';
  return text.slice(0, maxLength - 1).trim() + '\u2026';
}
