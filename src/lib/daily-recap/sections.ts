/**
 * Daily recap — section builders.
 *
 * Pure string functions: each one takes a tiny bit of astro data and returns
 * a single, narration-friendly paragraph. They never touch React, the DB, or
 * the network — that means they are safe to call from API routes, cron jobs,
 * server components, and unit tests alike.
 *
 * The voice mirrors `src/lib/transit-content/templates.ts`: short, evocative,
 * second-person, no astrologese. Where possible we reuse those pre-baked
 * blurbs so a single voice runs across the whole product.
 */
import {
  getTemplateBlurb,
  type AspectType,
  type BodyName,
  type LunarPhase,
  type ZodiacSign,
} from '@/lib/transit-content/templates';

// ---------------------------------------------------------------------------
// Public input shapes — small and forgiving so the API route can pass through
// whatever the existing astrology utilities give it.
// ---------------------------------------------------------------------------

export interface MoonPhaseInput {
  /** Display name from `getAccurateMoonPhase`, e.g. "Full Moon", "New Moon", "First Quarter". */
  name: string;
  /** 0–100. */
  illumination?: number;
  /** Optional sign the Moon is currently transiting. */
  sign?: ZodiacSign;
}

export interface TopAspectInput {
  transitPlanet: BodyName;
  aspect: AspectType;
  natalPlanet: BodyName;
}

// Set of phase names we recognise — anything else falls through to a generic line.
const PHASE_NAME_TO_KEY: Record<string, LunarPhase> = {
  'New Moon': 'NewMoon',
  'First Quarter': 'FirstQuarter',
  'Full Moon': 'FullMoon',
  'Last Quarter': 'LastQuarter',
  'Third Quarter': 'LastQuarter',
};

const DAY_FORMATTER = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
});

// ---------------------------------------------------------------------------
// Sections.
// ---------------------------------------------------------------------------

/**
 * Open the recap with today's date, framed warmly. We avoid the year — it
 * makes the narration feel less canned when replayed in a quiet room.
 */
export function intro(date: Date): string {
  const stamp = DAY_FORMATTER.format(date);
  return `Good morning. Here is your sky for ${stamp}. Take a breath — let the day land before you start moving through it.`;
}

/**
 * Speak to today's Moon — phase first, sign second. We delegate to the
 * templates layer when we have a known phase so the voice stays consistent.
 */
export function moonPhaseSection(phase: MoonPhaseInput): string {
  const key = PHASE_NAME_TO_KEY[phase.name];
  const phaseLine = key
    ? getTemplateBlurb({ kind: 'lunation', phase: key, sign: phase.sign })
    : null;

  const opener = phase.sign
    ? `The Moon is in ${phase.sign} and showing as ${phase.name.toLowerCase()}.`
    : `The Moon is showing as ${phase.name.toLowerCase()}.`;

  if (phaseLine) {
    return `${opener} ${phaseLine}`;
  }

  // Generic fallback when we don't have a templated line for this phase.
  const illum =
    typeof phase.illumination === 'number'
      ? ` She is about ${Math.round(phase.illumination)}% lit.`
      : '';
  return `${opener}${illum} Notice what the light is asking of you today.`;
}

/**
 * Speak to today's Sun — sign placement, leveraging the planet-in-sign blurbs.
 */
export function sunSection(sign: ZodiacSign): string {
  const blurb = getTemplateBlurb({
    kind: 'planet_in_sign',
    planet: 'Sun',
    sign,
  });
  const lead = `The Sun is in ${sign}.`;
  return blurb
    ? `${lead} ${blurb}`
    : `${lead} Let that quality colour your day.`;
}

/**
 * Speak to the most significant aspect today. We read it through the
 * templates layer so the wording matches the rest of the app.
 */
export function keyAspectSection(aspect: TopAspectInput): string {
  const blurb = getTemplateBlurb({
    kind: 'aspect_to_natal',
    transitPlanet: aspect.transitPlanet,
    aspect: aspect.aspect,
    natalPlanet: aspect.natalPlanet,
  });
  const lead = `Today's standout aspect: transiting ${aspect.transitPlanet} ${aspect.aspect.toLowerCase()} ${aspect.natalPlanet}.`;
  return blurb ? `${lead} ${blurb}` : lead;
}

/**
 * Closing line — soft, never pushy. Same voice as the intro.
 */
export function closing(): string {
  return `That is your sky for today. Carry what is useful, leave the rest. I will be here again tomorrow.`;
}
