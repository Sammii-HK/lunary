import { seededRandom, seededPick } from '@/lib/instagram/ig-utils';
import {
  getThemeForDate,
  getTransitThemeForDate,
} from '@/lib/social/weekly-themes';
import {
  categoryAngleTemplates,
  threadsAngleTemplates,
} from '@/lib/social/with-threads';
import {
  getAllRichEntries,
  extractGrimoireSnippet,
} from '@/lib/social/grimoire-content';
import { getAccurateMoonPhase } from '../../../utils/astrology/astronomical-data';
import type { ThemeCategory, ThreadIntent } from '@/lib/social/types';
import {
  THREADS_CHAR_LIMITS,
  THREADS_TOPIC_TAGS,
  type ThreadsPillar,
  type ThreadsPost,
} from './types';

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

/**
 * Generate a cosmic timing post using real-time transit/moon data.
 */
export function generateCosmicTimingPost(
  dateStr: string,
  slotHour: number,
): ThreadsPost {
  // Use the actual slot time, not midnight, for accurate time-until calculations
  const postDate = new Date(dateStr);
  postDate.setUTCHours(slotHour, 0, 0, 0);
  const moonPhase = getAccurateMoonPhase(postDate);
  const transitRaw = getTransitThemeForDate(postDate);

  // Only use transit within the posting window: up to 36h before ingress or 12h after.
  // This limits transit content to ~2 posts per event (anticipation + happening-now)
  // instead of 7 days of the same hook. After the window closes, fall back to moon.
  const transit =
    transitRaw && transitRaw.hoursUntil >= -12 && transitRaw.hoursUntil <= 36
      ? transitRaw
      : null;

  let hook: string;
  let body: string;
  let prompt: string;
  let topicTag = 'Astrology';

  if (transit) {
    const transitRng = seededRandom(`transit-${dateStr}-${slotHour}`);

    if (transit.hoursUntil > 12) {
      // Anticipation: ingress is tomorrow (12–36h away)
      hook = `${transit.planet} moves into ${transit.toSign} tomorrow`;
      const anticipationBodies = [
        `This kind of shift changes the energy for weeks. Pay attention to what starts to surface.`,
        `Slow-moving planets don't change sign often. When they do, things actually shift.`,
        `The pressure you've been feeling is about to make more sense.`,
        `This is not a subtle transit. Start noticing what is already changing around you.`,
        `Energy is already building around this. You might feel it before you can name it.`,
      ];
      const anticipationPrompts = [
        `Are you already feeling ${transit.planet} energy building?`,
        `What has been shifting for you lately?`,
        `Which area of your life feels most unsettled right now?`,
        `Ready for this one?`,
        `What do you expect to change when ${transit.planet} moves into ${transit.toSign}?`,
      ];
      body =
        anticipationBodies[
          Math.floor(transitRng() * anticipationBodies.length)
        ];
      prompt =
        anticipationPrompts[
          Math.floor(transitRng() * anticipationPrompts.length)
        ];
    } else if (transit.hoursUntil >= 0) {
      // Imminent: within 12 hours
      hook = `${transit.planet} is moving into ${transit.toSign}`;
      const imminentBodies =
        transit.hoursUntil > 0
          ? [
              `${transit.hoursUntil} hour${transit.hoursUntil !== 1 ? 's' : ''} away and you might already feel it building.`,
              `Less than ${transit.hoursUntil + 1} hours away. The energy is already shifting.`,
              `${transit.hoursUntil} hour${transit.hoursUntil !== 1 ? 's' : ''} to go. Pay attention to what surfaces today.`,
            ]
          : [
              `This shift is happening right now. Pay attention to what surfaces.`,
              `It is happening as you read this. Notice what changes in the next few hours.`,
              `Right now. This is the moment the energy moves.`,
            ];
      const imminentPrompts = [
        `How is ${transit.planet} energy showing up for you?`,
        `What are you noticing right now?`,
        `Can you feel the shift?`,
        `What area of your life feels most activated today?`,
      ];
      body = imminentBodies[Math.floor(transitRng() * imminentBodies.length)];
      prompt =
        imminentPrompts[Math.floor(transitRng() * imminentPrompts.length)];
    } else {
      // Post-ingress: happened within the last 12 hours
      hook = `${transit.planet} is now in ${transit.toSign}`;
      const postIngressBodies = [
        `The shift has happened. Notice what has already started to change.`,
        `Pay attention to the next 48 hours. This is when it gets obvious.`,
        `The energy has moved. Some things that felt stuck are about to loosen.`,
        `It landed. What you have been sensing is now confirmed.`,
        `This is the moment the energy actually changed. Look back in a month.`,
      ];
      const postIngressPrompts = [
        `What shifted for you when ${transit.planet} moved into ${transit.toSign}?`,
        `Did you feel it? What changed?`,
        `What do you expect to shift in the weeks ahead?`,
        `What are you ready to leave behind with this transit?`,
      ];
      body =
        postIngressBodies[Math.floor(transitRng() * postIngressBodies.length)];
      prompt =
        postIngressPrompts[
          Math.floor(transitRng() * postIngressPrompts.length)
        ];
    }
  } else {
    const moonRng = seededRandom(`moon-${dateStr}-${slotHour}`);

    // Body templates — seeded selection for variety even during same phase
    const bodyTemplates = [
      moonPhase.isSignificant
        ? 'This is a potent phase. Your intentions carry extra weight right now.'
        : `${moonPhase.trend === 'waxing' ? 'Building momentum' : 'Time to release'}. Work with it, not against it.`,
      `Moon in ${moonPhase.trend === 'waxing' ? 'growth' : 'release'} mode today. ${moonPhase.isSignificant ? 'A powerful window.' : 'Subtle but steady.'}`,
      `${moonPhase.illumination}% illuminated and ${moonPhase.trend === 'waxing' ? 'building' : 'fading'}.`,
      moonPhase.trend === 'waxing'
        ? 'Momentum is picking up. Lean into what you started.'
        : "The pressure is easing. Let go of what isn't working.",
      moonPhase.isSignificant
        ? 'This phase hits different. Pay attention to what surfaces.'
        : "Quiet shifts are still shifts. Don't ignore the subtle ones.",
      `${moonPhase.name} wants you to ${moonPhase.trend === 'waxing' ? 'build' : 'shed'}, not force.`,
      moonPhase.trend === 'waxing'
        ? 'Each day the light grows, so does your clarity.'
        : "As the light thins, so should your grip on what's done.",
    ];

    // Prompt templates — seeded selection for variety
    const promptTemplates = [
      'What are you setting into motion this phase?',
      'What are you working with today?',
      'How is this energy landing for you?',
      'What are you releasing this cycle?',
      'Notice anything shifting?',
    ];

    const hookTemplates = [
      `${moonPhase.name} energy is running the show today`,
      `We are in ${moonPhase.name} territory`,
      `${moonPhase.name} is here`,
      `It is ${moonPhase.name} season`,
      `The moon is ${moonPhase.name} right now`,
      `${moonPhase.name} vibes today`,
      `${moonPhase.name} is the energy to work with`,
    ];

    hook = hookTemplates[Math.floor(moonRng() * hookTemplates.length)];
    body = bodyTemplates[Math.floor(moonRng() * bodyTemplates.length)];
    prompt = promptTemplates[Math.floor(moonRng() * promptTemplates.length)];
    topicTag = 'Moon';
  }

  return buildOriginalPost({
    hook,
    body,
    prompt,
    topicTag,
    pillar: 'cosmic_timing',
    dateStr,
    slotHour,
  });
}

/**
 * Generate a conversation starter post (questions and hot takes).
 * Uses theme-based angle templates for variety.
 *
 * @param options.excludeCategory - Skip this category and fall back to 'zodiac'.
 *   Used when slot 0 already generated a transit/planetary post to avoid duplicates.
 */
export function generateConversationPost(
  dateStr: string,
  slotHour: number,
  options?: { excludeCategory?: ThemeCategory },
): ThreadsPost {
  const date = new Date(dateStr);
  const { theme } = getThemeForDate(date);
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

  if (useThreadsAngle) {
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
export function generateIdentityPost(
  dateStr: string,
  slotHour: number,
): ThreadsPost {
  const date = new Date(dateStr);
  const { theme } = getThemeForDate(date);
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

  // For identity callouts, swap in a random sign for personalisation
  let hook = angle.opener;
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
export function generateEducationalPost(
  dateStr: string,
  slotHour: number,
): ThreadsPost {
  const rng = seededRandom(`threads-edu-${dateStr}-${slotHour}`);

  // Use the grimoire system's full entry pool
  const allEntries = getAllRichEntries();

  // Weight toward best-performing categories: numerology and zodiac
  const weighted = allEntries.filter((e) =>
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
