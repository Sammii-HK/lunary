/**
 * Weekly Engagement Content Generators
 *
 * Two engagement slots per day, complementary formats (no duplicates same day).
 *
 * Engagement A (17 UTC — UK evening / US lunch):
 * - Mon: Sign Check    | Tue: Rankings     | Wed: Quiz
 * - Thu: Hot Take      | Fri: Myth         | Sat: Transit Alert / Sign Check
 * - Sun: Rankings (variant)
 *
 * Engagement B (20 UTC — UK leisure / US afternoon):
 * - Mon: Rankings      | Tue: Hot Take     | Wed: Sign Check
 * - Thu: Myth          | Fri: Quiz         | Sat: Rankings
 * - Sun: Sign Check
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
import { getTodaysTransitVideo } from './transit-integration';
import type { VideoScript } from '../types';
import type { ContentType } from '../content-types';
import { getContentTypeConfig } from '../content-types';
import {
  getOptimalPostingHour,
  getVideoSlotHour,
  type VideoSlot,
} from '@/utils/posting-times';

interface DayConfig {
  contentType: ContentType;
  label: string;
}

/**
 * Engagement A schedule (17 UTC slot)
 * Optimised for TikTok discovery and engagement
 */
const ENGAGEMENT_A_SCHEDULE: Record<string, DayConfig> = {
  monday: { contentType: 'sign-check', label: 'Sign Check' },
  tuesday: { contentType: 'ranking', label: 'Rankings' },
  wednesday: { contentType: 'quiz', label: 'Quiz' },
  thursday: { contentType: 'hot-take', label: 'Hot Take' },
  friday: { contentType: 'myth', label: 'Myth/Storytime' },
  saturday: {
    contentType: 'transit-alert',
    label: 'Transit Alert / Sign Check fallback',
  },
  sunday: { contentType: 'ranking', label: 'Rankings (variant)' },
};

/**
 * Engagement B schedule (20 UTC slot)
 * Complementary formats — no duplicate content type on the same day as Slot A
 */
const ENGAGEMENT_B_SCHEDULE: Record<string, DayConfig> = {
  monday: { contentType: 'ranking', label: 'Rankings' },
  tuesday: { contentType: 'hot-take', label: 'Hot Take' },
  wednesday: { contentType: 'sign-check', label: 'Sign Check' },
  thursday: { contentType: 'myth', label: 'Myth/Storytime' },
  friday: { contentType: 'quiz', label: 'Quiz' },
  saturday: { contentType: 'ranking', label: 'Rankings' },
  sunday: { contentType: 'sign-check', label: 'Sign Check' },
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
 * Generate a script from a content type config
 */
async function generateScriptForContentType(
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
 */
export async function generateWeeklySecondaryScripts(
  weekStartDate: Date,
): Promise<VideoScript[]> {
  return generateWeeklyEngagementScripts(
    weekStartDate,
    ENGAGEMENT_A_SCHEDULE,
    'engagementA',
  );
}

/**
 * Generate Engagement B scripts for the week (20 UTC slot)
 */
export async function generateWeeklyEngagementBScripts(
  weekStartDate: Date,
): Promise<VideoScript[]> {
  return generateWeeklyEngagementScripts(
    weekStartDate,
    ENGAGEMENT_B_SCHEDULE,
    'engagementB',
  );
}

/**
 * Get the engagement schedules
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
