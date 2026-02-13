import { seededRandom, seededPick } from '@/lib/instagram/ig-utils';
import {
  getThemeForDate,
  getTransitThemeForDate,
} from '@/lib/social/weekly-themes';
import {
  categoryAngleTemplates,
  threadsAngleTemplates,
} from '@/lib/social/with-threads';
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
  const transit = getTransitThemeForDate(postDate);

  let hook: string;
  let body: string;
  let prompt: string;
  let topicTag = 'Astrology';

  if (transit) {
    hook = `${transit.planet} is moving into ${transit.toSign}`;
    if (transit.hoursUntil <= 0) {
      body =
        'this shift is happening right now, pay attention to what surfaces';
    } else if (transit.hoursUntil < 24) {
      body = `${transit.hoursUntil} hour${transit.hoursUntil !== 1 ? 's' : ''} away and you might already feel it building`;
    } else {
      body = `${transit.daysUntil} day${transit.daysUntil !== 1 ? 's' : ''} away and you might already feel it building`;
    }
    prompt = `how is ${transit.planet} energy showing up for you?`;
  } else {
    hook = `${moonPhase.name} energy is running the show today`;
    body = moonPhase.isSignificant
      ? 'this is a potent phase, your intentions carry extra weight right now'
      : `${moonPhase.trend === 'waxing' ? 'building momentum' : 'time to release'}, work with it not against it`;
    prompt = 'what are you setting into motion this phase?';
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
 */
export function generateConversationPost(
  dateStr: string,
  slotHour: number,
): ThreadsPost {
  const date = new Date(dateStr);
  const { theme } = getThemeForDate(date);
  const category = theme.category as ThemeCategory;
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
 * Generate an educational post based on the day's theme.
 */
export function generateEducationalPost(
  dateStr: string,
  slotHour: number,
): ThreadsPost {
  const date = new Date(dateStr);
  const { theme } = getThemeForDate(date);
  const category = theme.category as ThemeCategory;
  const rng = seededRandom(`threads-edu-${dateStr}-${slotHour}`);

  // Use observation/misconception angles from category templates
  const angles = categoryAngleTemplates(category);
  const eduAngles = angles.filter(
    (a) =>
      a.intent === 'observation' ||
      a.intent === 'misconception' ||
      a.intent === 'quick_rule',
  );
  const angle =
    eduAngles.length > 0
      ? eduAngles[Math.floor(rng() * eduAngles.length)]
      : angles[0];

  return buildOriginalPost({
    hook: angle.opener,
    body: angle.payload || '',
    prompt: angle.closer,
    topicTag: THREADS_TOPIC_TAGS[category] || 'Astrology',
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
