/**
 * Instagram Reels Weekly Script Generator
 *
 * Generates 5 IG-optimised scripts per week (Mon-Fri at 15:00 UTC).
 * Saturday and Sunday are left for TikTok cross-posts via the existing pipeline.
 *
 * Key differences from TikTok scripts:
 * - Shorter: 75-110 words (30-45 second read)
 * - Visual-first or POV hooks — no algorithm-bait openers
 * - Save/comment/share CTAs instead of TikTok follow CTAs
 * - No engagement A/B slot — dedicated IG slot at 15:00 UTC
 */

import { generateScriptForContentType } from './weekly-secondary';
import {
  INSTAGRAM_VOICE_OVERRIDES,
  type ContentTypeKey,
} from '../content-type-voices';
import type { VideoScript } from '../types';
import type { ContentType } from '../content-types';
import { countWords } from '../../shared/text/normalize';

/**
 * Content types that perform well on Instagram Reels.
 * Excludes transit-alert (too niche/timely for Reels algorithm) and
 * sign-origin (too long-form for IG short attention spans).
 */
const IG_CONTENT_TYPES: ContentType[] = [
  'angel-number',
  'sign-identity',
  'hot-take',
  'ranking',
  'sign-check',
  'chiron-sign',
  'did-you-know',
  'myth',
];

/** Mon-Fri day indices (0 = Monday in a week starting Monday) */
const IG_DAY_INDICES = [0, 1, 2, 3, 4];

/** Target word count for IG scripts — middle of the 75-110 word sweet spot */
const IG_TARGET_WORDS = 90;
const IG_MAX_WORDS = 110;

/** Fallback CTAs when no override exists for the content type */
const IG_FALLBACK_CTAS = [
  'Save this for later.',
  'Comment your sign below.',
  'Share this with your bestie.',
  'Save this and come back to it.',
  'Comment if this lands.',
];

/**
 * Trim a script to the target word count, preserving the hook (first line)
 * and trimming from the body.
 */
function trimToIgLength(fullScript: string): string {
  if (countWords(fullScript) <= IG_MAX_WORDS) return fullScript;

  const lines = fullScript.split('\n').filter((l) => l.trim());
  const hook = lines[0] ?? '';
  const bodyLines = lines.slice(1);

  // Remove lines from the end until we're within the target
  let trimmed = bodyLines;
  while (
    trimmed.length > 1 &&
    countWords([hook, ...trimmed].join('\n')) > IG_TARGET_WORDS
  ) {
    trimmed = trimmed.slice(0, -1);
  }

  return [hook, ...trimmed].join('\n');
}

/**
 * Replace the last line of the script with an IG-specific CTA.
 * The last line of most scripts is already a CTA (e.g. "Follow for more"),
 * so we swap it out for an IG-appropriate one.
 */
function replaceCtaForInstagram(fullScript: string, ctaLine: string): string {
  const lines = fullScript.split('\n').filter((l) => l.trim());
  if (lines.length === 0) return fullScript;
  lines[lines.length - 1] = ctaLine;
  return lines.join('\n');
}

/**
 * Adapt a TikTok-generated VideoScript for Instagram Reels:
 * 1. Trim to IG target length (75-110 words)
 * 2. Replace the closing CTA with an IG-appropriate one (save/comment/share)
 * 3. Set platform = 'instagram' and scheduledHour = 15
 */
function adaptScriptForInstagram(script: VideoScript): VideoScript {
  const ctKey = script.metadata?.contentTypeKey as ContentTypeKey | undefined;
  const override = ctKey ? INSTAGRAM_VOICE_OVERRIDES[ctKey] : undefined;

  // Deterministic CTA selection from fallbacks when no override
  const dateSeed =
    script.scheduledDate.getFullYear() * 10000 +
    (script.scheduledDate.getMonth() + 1) * 100 +
    script.scheduledDate.getDate();
  const ctaLine =
    override?.ctaLine ?? IG_FALLBACK_CTAS[dateSeed % IG_FALLBACK_CTAS.length];

  const trimmed = trimToIgLength(script.fullScript);
  const adapted = replaceCtaForInstagram(trimmed, ctaLine);

  return {
    ...script,
    platform: 'instagram',
    fullScript: adapted,
    wordCount: countWords(adapted),
    metadata: script.metadata
      ? { ...script.metadata, scheduledHour: 15 }
      : script.metadata,
  };
}

/**
 * Pick a content type for a given day, avoiding over-repetition.
 * Uses a deterministic seed so the same week always produces the same schedule.
 */
function pickIgContentType(
  date: Date,
  usedCounts: Map<string, number>,
): ContentType {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

  // Filter out types that have already been used twice this week
  const available = IG_CONTENT_TYPES.filter(
    (t) => (usedCounts.get(t) ?? 0) < 2,
  );
  const pool = available.length > 0 ? available : IG_CONTENT_TYPES;

  return pool[seed % pool.length];
}

/**
 * Generate 5 Instagram-specific video scripts for Mon-Fri of the given week.
 *
 * These scripts are:
 * - Shorter and punchier than their TikTok counterparts
 * - Set to post at 15:00 UTC (prime UK evening / US morning)
 * - Platform-flagged as 'instagram' so the pipeline never cross-posts them to TikTok
 */
export async function generateWeeklyInstagramScripts(
  weekStartDate: Date,
): Promise<VideoScript[]> {
  const scripts: VideoScript[] = [];
  const usedCounts = new Map<string, number>();

  console.log(
    '📸 [IG] Generating Instagram-specific scripts (Mon-Fri 15:00 UTC)...',
  );

  for (const dayIndex of IG_DAY_INDICES) {
    const date = new Date(weekStartDate);
    date.setDate(date.getDate() + dayIndex);
    // Set to 15:00 UTC so scheduledDate already reflects posting time
    date.setUTCHours(15, 0, 0, 0);

    const contentType = pickIgContentType(date, usedCounts);
    usedCounts.set(contentType, (usedCounts.get(contentType) ?? 0) + 1);

    const dayLabel =
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][dayIndex] ?? `Day ${dayIndex}`;
    console.log(`  📸 [IG] ${dayLabel}: ${contentType}`);

    try {
      // Use base date (midnight) for script generation — content type generators
      // use date for deterministic sign/topic selection, not for posting time
      const baseDate = new Date(date);
      baseDate.setUTCHours(0, 0, 0, 0);

      const script = await generateScriptForContentType(contentType, baseDate);
      if (!script) {
        console.error(
          `  📸 [IG] ${dayLabel}: generateScriptForContentType returned null for ${contentType}`,
        );
        continue;
      }

      // Override scheduledDate to 15:00 UTC then adapt for IG
      script.scheduledDate = date;
      const adapted = adaptScriptForInstagram(script);
      scripts.push(adapted);
    } catch (error) {
      console.error(
        `  📸 [IG] ${dayLabel}: Failed to generate ${contentType}:`,
        error,
      );
    }
  }

  console.log(`📸 [IG] Generated ${scripts.length}/5 Instagram scripts`);
  return scripts;
}
