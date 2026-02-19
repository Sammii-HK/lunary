/**
 * Weekly Engagement Content Generators — Self-Healing Scheduler
 *
 * Two engagement slots per day, complementary formats (no duplicates same day).
 *
 * DYNAMIC SCHEDULING: Content types are selected using performance-weighted
 * probabilities from the content scoring engine. The system reads from
 * video_performance to promote high-performing formats and suppress poor ones.
 *
 * Fallback: When insufficient performance data exists, uses seed weights
 * derived from the 109-post TikTok analysis.
 *
 * Rules:
 * 1. Never same content type in both slots on same day
 * 2. Angel numbers max 2x/week (scarcity = anticipation)
 * 3. Sign-specific content at least 1x daily (always works)
 * 4. Suppressed categories never scheduled
 * 5. No more than maxPerWeek of same type per slot
 *
 * App demos and comparisons are parked (not deleted) for future use.
 */

// Parked imports — preserved for future use:
// import { generateAppDemoScript } from './app-demo';
// import { generateComparisonScript } from './comparison';

import { generateSignCheckScript } from './sign-check';
import { generateRankingScript } from './ranking';
import { generateQuizScript } from './quiz';
import { generateHotTakeScript } from './hot-take';
import { generateMythScript } from './myth';
import { generateDidYouKnowScript } from './did-you-know';
import { generateAngelNumberScript } from './angel-number';
import { generateSignIdentityScript } from './sign-identity';
import { generateChironSignScript } from './chiron-sign';
import { generateSignOriginScript } from './sign-origin';
import { getTodaysTransitVideo } from './transit-integration';
import type { VideoScript } from '../types';
import type { ContentType } from '../content-types';
import { getContentTypeConfig } from '../content-types';
import {
  getOptimalPostingHour,
  getVideoSlotHour,
  type VideoSlot,
} from '@/utils/posting-times';
import {
  getContentTypeWeights,
  getSuppressedCategories,
  weightedSelect,
  type CategoryScore,
} from '../content-scores';
import { SEED_WEIGHTS } from '../content-score-seeds';

interface DayConfig {
  contentType: ContentType;
  label: string;
}

/**
 * Static fallback schedules — used only when dynamic scheduling fails entirely.
 * Kept for backwards compatibility with getEngagementASchedule/B.
 */
const ENGAGEMENT_A_SCHEDULE: Record<string, DayConfig> = {
  monday: { contentType: 'sign-identity', label: 'Sign Identity' },
  tuesday: { contentType: 'angel-number', label: 'Angel Number' },
  wednesday: { contentType: 'hot-take', label: 'Hot Take' },
  thursday: { contentType: 'sign-check', label: 'Sign Check' },
  friday: { contentType: 'ranking', label: 'Rankings' },
  saturday: {
    contentType: 'transit-alert',
    label: 'Transit Alert / Sign Check fallback',
  },
  sunday: { contentType: 'sign-origin', label: 'Sign Origin' },
};

const ENGAGEMENT_B_SCHEDULE: Record<string, DayConfig> = {
  monday: { contentType: 'ranking', label: 'Rankings' },
  tuesday: { contentType: 'chiron-sign', label: 'Chiron Sign' },
  wednesday: { contentType: 'quiz', label: 'Quiz' },
  thursday: { contentType: 'sign-identity', label: 'Sign Identity' },
  friday: { contentType: 'sign-origin', label: 'Sign Origin' },
  saturday: { contentType: 'did-you-know', label: 'Did You Know' },
  sunday: { contentType: 'hot-take', label: 'Hot Take' },
};

const DAY_NAMES = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

/**
 * Content types eligible for engagement slots.
 * Maps content-score category names to ContentType values.
 */
const SCHEDULABLE_TYPES: ContentType[] = [
  'angel-number',
  'sign-identity',
  'chiron-sign',
  'sign-origin',
  'sign-check',
  'ranking',
  'hot-take',
  'quiz',
  'transit-alert',
  'did-you-know',
  'myth',
];

/**
 * Sign-specific types that should appear at least 1x daily across both slots.
 */
const SIGN_SPECIFIC_TYPES = new Set<ContentType>([
  'sign-identity',
  'sign-check',
  'chiron-sign',
  'sign-origin',
]);

/**
 * Build a dynamic weekly schedule using performance-weighted content selection.
 *
 * Returns schedules for both engagement slots (A and B) for 7 days.
 * Falls back to static schedules if scoring engine fails.
 */
export async function buildWeeklySchedule(weekStartDate: Date): Promise<{
  slotA: Record<string, DayConfig>;
  slotB: Record<string, DayConfig>;
}> {
  let weights: Map<string, CategoryScore>;
  let suppressed: Set<string>;

  try {
    [weights, suppressed] = await Promise.all([
      getContentTypeWeights(),
      getSuppressedCategories(),
    ]);
  } catch {
    console.log('Dynamic scheduling unavailable, using static fallback');
    return { slotA: ENGAGEMENT_A_SCHEDULE, slotB: ENGAGEMENT_B_SCHEDULE };
  }

  const slotA: Record<string, DayConfig> = {};
  const slotB: Record<string, DayConfig> = {};

  // Track weekly usage counts per type per slot
  const weeklyCountA = new Map<string, number>();
  const weeklyCountB = new Map<string, number>();
  let angelNumberCount = 0;

  for (let i = 0; i < 7; i++) {
    const dayName = DAY_NAMES[i];
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);

    // Deterministic seed for this day
    const daySeed =
      date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

    // Build exclusion set for Slot A
    const excludeA = new Set<string>(suppressed);
    // Enforce maxPerWeek constraints
    for (const [type, count] of weeklyCountA) {
      const maxPerWeek = SEED_WEIGHTS[type]?.maxPerWeek ?? 4;
      if (count >= maxPerWeek) excludeA.add(type);
    }
    // Enforce angel number cap (shared across both slots)
    if (angelNumberCount >= 2) excludeA.add('angel-number');

    // Select Slot A content type
    const typeA = selectContentType(weights, excludeA, daySeed, i);
    slotA[dayName] = { contentType: typeA, label: formatLabel(typeA) };
    weeklyCountA.set(typeA, (weeklyCountA.get(typeA) || 0) + 1);
    if (typeA === 'angel-number') angelNumberCount++;

    // Build exclusion set for Slot B (includes Slot A pick for same day)
    const excludeB = new Set<string>(suppressed);
    excludeB.add(typeA); // No duplicate on same day
    for (const [type, count] of weeklyCountB) {
      const maxPerWeek = SEED_WEIGHTS[type]?.maxPerWeek ?? 4;
      if (count >= maxPerWeek) excludeB.add(type);
    }
    if (angelNumberCount >= 2) excludeB.add('angel-number');

    // If Slot A didn't get sign-specific content, bias Slot B toward it
    const needSignSpecific = !SIGN_SPECIFIC_TYPES.has(typeA);
    let typeB: ContentType;
    if (needSignSpecific && Math.random() < 0.7) {
      // 70% chance to force sign-specific for Slot B
      const signTypes = [...SIGN_SPECIFIC_TYPES].filter(
        (t) => !excludeB.has(t),
      );
      if (signTypes.length > 0) {
        typeB = signTypes[daySeed % signTypes.length];
      } else {
        typeB = selectContentType(weights, excludeB, daySeed + 100, i);
      }
    } else {
      typeB = selectContentType(weights, excludeB, daySeed + 100, i);
    }

    slotB[dayName] = { contentType: typeB, label: formatLabel(typeB) };
    weeklyCountB.set(typeB, (weeklyCountB.get(typeB) || 0) + 1);
    if (typeB === 'angel-number') angelNumberCount++;
  }

  return { slotA, slotB };
}

/**
 * Select a content type from weighted options.
 * Falls back through schedulable types if weighted select fails.
 */
function selectContentType(
  weights: Map<string, CategoryScore>,
  exclude: Set<string>,
  seed: number,
  dayIndex: number,
): ContentType {
  const selected = weightedSelect(weights, exclude, seed);

  if (selected && SCHEDULABLE_TYPES.includes(selected as ContentType)) {
    return selected as ContentType;
  }

  // Fallback: pick from schedulable types not excluded
  const available = SCHEDULABLE_TYPES.filter((t) => !exclude.has(t));
  if (available.length > 0) {
    return available[(seed + dayIndex) % available.length];
  }

  // Ultimate fallback
  return 'sign-identity';
}

/**
 * Format a content type as a human-readable label
 */
function formatLabel(type: ContentType): string {
  return type
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Generate a script from a content type config
 */
export async function generateScriptForContentType(
  contentType: ContentType,
  date: Date,
): Promise<VideoScript | null> {
  switch (contentType) {
    case 'sign-check':
      return generateSignCheckScript(date);

    case 'ranking':
      return generateRankingScript(date);

    case 'quiz':
      return generateQuizScript('zodiac', date);

    case 'hot-take':
      return generateHotTakeScript(date);

    case 'myth':
      return generateMythScript(date);

    case 'transit-alert': {
      const transitScript = await getTodaysTransitVideo(date);
      if (transitScript) return transitScript;
      console.log('    No major transit detected, falling back to sign check');
      return generateSignCheckScript(date);
    }

    case 'did-you-know':
      return generateDidYouKnowScript(date);

    case 'angel-number':
      return generateAngelNumberScript(date);

    case 'sign-identity':
      return generateSignIdentityScript(date);

    case 'chiron-sign':
      return generateChironSignScript(date);

    case 'sign-origin':
      return generateSignOriginScript(date);

    default:
      console.error(`  Unknown content type: ${contentType}`);
      return null;
  }
}

/**
 * Generate engagement scripts for a week from a given schedule + slot
 */
async function generateWeeklyEngagementScripts(
  weekStartDate: Date,
  schedule: Record<string, DayConfig>,
  slot: VideoSlot,
): Promise<VideoScript[]> {
  const scripts: VideoScript[] = [];
  const slotHour = getVideoSlotHour(slot);

  console.log(`Generating weekly ${slot} scripts (${slotHour}:00 UTC)...`);

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + i);

    const dayName = DAY_NAMES[i];
    const dayConfig = schedule[dayName];

    console.log(`  ${dayName}: ${dayConfig.label} [${slot}]`);

    try {
      const script = await generateScriptForContentType(
        dayConfig.contentType,
        date,
      );

      if (!script) {
        console.error(
          `  Failed to generate ${dayConfig.label} for ${dayName} (returned null)`,
        );
        continue;
      }

      // Set posting time and slot metadata
      const contentType = script.contentType || dayConfig.contentType;
      const config = getContentTypeConfig(contentType);
      const scheduledHour = getOptimalPostingHour({
        contentType,
        scheduledDate: date,
        topic: script.topic || dayConfig.label,
      });
      if (script.metadata) {
        script.metadata.scheduledHour = scheduledHour;
        script.metadata.targetAudience = config.targetAudience;
        script.metadata.slot = slot;
      }

      scripts.push(script);
    } catch (error) {
      console.error(
        `  Failed to generate ${dayConfig.label} for ${dayName}:`,
        error,
      );
    }
  }

  console.log(`Generated ${scripts.length}/7 ${slot} scripts`);
  return scripts;
}

/**
 * Generate Engagement A scripts for the week (17 UTC slot)
 * Uses dynamic schedule when available, falls back to static.
 */
export async function generateWeeklySecondaryScripts(
  weekStartDate: Date,
): Promise<VideoScript[]> {
  const { slotA } = await buildWeeklySchedule(weekStartDate);
  return generateWeeklyEngagementScripts(weekStartDate, slotA, 'engagementA');
}

/**
 * Generate Engagement B scripts for the week (20 UTC slot)
 * Uses dynamic schedule when available, falls back to static.
 */
export async function generateWeeklyEngagementBScripts(
  weekStartDate: Date,
): Promise<VideoScript[]> {
  const { slotB } = await buildWeeklySchedule(weekStartDate);
  return generateWeeklyEngagementScripts(weekStartDate, slotB, 'engagementB');
}

/**
 * Get the engagement schedules (static fallback for compatibility)
 */
export function getEngagementASchedule(): Record<string, DayConfig> {
  return ENGAGEMENT_A_SCHEDULE;
}

export function getEngagementBSchedule(): Record<string, DayConfig> {
  return ENGAGEMENT_B_SCHEDULE;
}

/** @deprecated Use getEngagementASchedule */
export function getWeeklySchedule(): Record<string, DayConfig> {
  return ENGAGEMENT_A_SCHEDULE;
}
