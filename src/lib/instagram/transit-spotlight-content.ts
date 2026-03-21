/**
 * Transit Spotlight Carousel Generator
 *
 * 5-slide carousel covering what's happening in the sky.
 * Now uses the shared cosmic event detection engine (same system
 * used by Threads and video scripts) for rich, tense-aware,
 * deduped content with multiple body text variations.
 *
 * Renders via the existing carousel OG route (cover/body/cta variants).
 */

import type { IGCarouselSlide } from './types';
import type { ThemeCategory } from '@/lib/social/types';
import type { TransitContext, CosmicEventWithContent } from './transit-context';
import { seededRandom } from './ig-utils';

// ---------------------------------------------------------------------------
// Element correspondences for ritual suggestions
// ---------------------------------------------------------------------------

const SIGN_ELEMENTS: Record<string, string> = {
  aries: 'fire',
  taurus: 'earth',
  gemini: 'air',
  cancer: 'water',
  leo: 'fire',
  virgo: 'earth',
  libra: 'air',
  scorpio: 'water',
  sagittarius: 'fire',
  capricorn: 'earth',
  aquarius: 'air',
  pisces: 'water',
};

const ELEMENT_RITUALS: Record<string, string[]> = {
  fire: [
    'Light a red or orange candle and set a bold intention',
    'Write down what you want to ignite and burn the paper safely',
    'Carry carnelian or citrine for courage and momentum',
  ],
  earth: [
    'Ground yourself with a barefoot walk on natural earth',
    'Create a prosperity jar with herbs, coins, and intention',
    'Work with green aventurine or moss agate for stability',
  ],
  air: [
    'Journal your thoughts and burn bay leaves with your wishes',
    'Open windows and smudge your space for mental clarity',
    'Carry clear quartz or amethyst for mental sharpness',
  ],
  water: [
    'Take a ritual bath with salt and moon water',
    "Charge water under tonight's moon for emotional healing",
    'Work with moonstone or labradorite for intuitive flow',
  ],
};

const ELEMENT_IMPACTS: Record<string, string> = {
  fire: 'Fire signs (Aries, Leo, Sagittarius) feel this most intensely. Expect bursts of motivation, restlessness, or creative urgency.',
  earth:
    'Earth signs (Taurus, Virgo, Capricorn) feel this most strongly. Expect shifts in finances, routines, or material security.',
  air: 'Air signs (Gemini, Libra, Aquarius) feel this most acutely. Expect changes in communication, relationships, or perspective.',
  water:
    'Water signs (Cancer, Scorpio, Pisces) feel this most deeply. Expect emotional revelations, dreams, or intuitive downloads.',
};

// ---------------------------------------------------------------------------
// Generator
// ---------------------------------------------------------------------------

/**
 * Generate a transit spotlight carousel.
 *
 * Priority order:
 * 1. Rich cosmic event from shared detection engine (deduped, tense-aware)
 * 2. High-priority CalendarEvent fallback
 * 3. Current moon phase fallback
 */
export function generateTransitSpotlight(
  dateStr: string,
  context: TransitContext,
): {
  slides: IGCarouselSlide[];
  eventName: string;
  planet?: string;
  sign?: string;
} {
  // 1. Use rich cosmic events (same engine as Threads + video scripts)
  if (context.cosmicEvents.length > 0) {
    const topEvent = context.cosmicEvents[0];
    // Only use cosmic events with priority > 50 (skip planet_spotlight/moon_position fallbacks)
    if (topEvent.event.priority > 50) {
      return generateFromCosmicEvent(dateStr, topEvent, context);
    }
  }

  // 2. Fall back to CalendarEvent if available
  const event = context.highPriorityEvent;
  if (event && event.planet && event.sign) {
    return generateEventSpotlight(dateStr, event);
  }

  // 3. Fall back to moon phase
  return generateMoonPhaseSpotlight(dateStr, context);
}

// ---------------------------------------------------------------------------
// Cosmic event carousel (rich content from shared engine)
// ---------------------------------------------------------------------------

function generateFromCosmicEvent(
  dateStr: string,
  cosmicEvent: CosmicEventWithContent,
  context: TransitContext,
): {
  slides: IGCarouselSlide[];
  eventName: string;
  planet?: string;
  sign?: string;
} {
  const { event, content } = cosmicEvent;
  const sign = (event.sign || context.hotSign || 'aries').toLowerCase();
  const element = SIGN_ELEMENTS[sign] || 'fire';
  const category: ThemeCategory = event.type.includes('moon')
    ? 'lunar'
    : 'planetary';
  const totalSlides = 5;
  const slides: IGCarouselSlide[] = [];

  // Slide 1: Cover -- use the rich, tense-aware hook from cosmic events
  slides.push({
    slideIndex: 0,
    totalSlides,
    title: content.hook,
    content: getEventSubtitle(event),
    category,
    variant: 'cover',
  });

  // Slide 2: What this means -- use the rich body text (multiple variations, already selected)
  slides.push({
    slideIndex: 1,
    totalSlides,
    title: 'What this means',
    content: content.body,
    category,
    variant: 'body',
  });

  // Slide 3: Who feels it most -- element-specific impact
  slides.push({
    slideIndex: 2,
    totalSlides,
    title: 'Who feels it most',
    content: ELEMENT_IMPACTS[element] || ELEMENT_IMPACTS.fire,
    category,
    variant: 'body',
  });

  // Slide 4: What to do -- ritual from element correspondences
  const rng = seededRandom(`transit-ritual-${dateStr}`);
  const rituals = ELEMENT_RITUALS[element] || ELEMENT_RITUALS.fire;
  const ritual = rituals[Math.floor(rng() * rituals.length)];
  slides.push({
    slideIndex: 3,
    totalSlides,
    title: 'What to do',
    content: ritual,
    category,
    variant: 'body',
  });

  // Slide 5: CTA
  slides.push({
    slideIndex: 4,
    totalSlides,
    title: 'Track transits free',
    content: 'lunary.app',
    category,
    variant: 'cta',
  });

  return {
    slides,
    eventName: content.hook,
    planet: event.planet,
    sign: event.sign,
  };
}

/**
 * Generate a subtitle for the cover slide based on event type.
 */
function getEventSubtitle(event: CosmicEventWithContent['event']): string {
  switch (event.type) {
    case 'planetary_ingress':
      return 'A major transit shift is underway';
    case 'zodiac_season':
      return 'The collective energy changes today';
    case 'season_countdown':
      return 'A seasonal shift is approaching';
    case 'retrograde_station':
      return 'Time to slow down and review';
    case 'direct_station':
      return 'Momentum returns';
    case 'retrograde_reentry':
      return 'Unfinished business resurfaces';
    case 'moon_sign_change':
      return 'The emotional tone shifts';
    case 'stellium':
      return 'Concentrated cosmic energy';
    case 'tight_aspect':
      return 'An exact alignment in the sky';
    case 'moon_phase_change':
      return 'A new lunar phase begins';
    case 'transit_milestone':
      return 'A transit reaches a turning point';
    default:
      return 'A significant cosmic shift';
  }
}

// ---------------------------------------------------------------------------
// CalendarEvent fallback (original approach, kept for backward compat)
// ---------------------------------------------------------------------------

function generateEventSpotlight(
  dateStr: string,
  event: {
    name: string;
    planet?: string;
    sign?: string;
    hookSuggestions: string[];
    historicalContext?: string;
    score: number;
    rarityFrame: string;
    category: string;
  },
): {
  slides: IGCarouselSlide[];
  eventName: string;
  planet?: string;
  sign?: string;
} {
  const planet = event.planet || 'The cosmos';
  const sign = (event.sign || 'the zodiac').toLowerCase();
  const element = SIGN_ELEMENTS[sign] || 'fire';
  const category: ThemeCategory = 'planetary';
  const totalSlides = 5;

  const slides: IGCarouselSlide[] = [];

  // Slide 1: Cover
  const hook = event.hookSuggestions[0] || event.name;
  slides.push({
    slideIndex: 0,
    totalSlides,
    title: hook,
    content: event.rarityFrame || 'A significant cosmic shift',
    category,
    variant: 'cover',
  });

  // Slide 2: What this means
  slides.push({
    slideIndex: 1,
    totalSlides,
    title: 'What this means',
    content: event.historicalContext
      ? `${event.name}. ${event.historicalContext}`
      : `${event.name}. This transit shifts collective energy in a way that affects everyone, especially signs connected to ${sign}.`,
    category,
    variant: 'body',
  });

  // Slide 3: Element-specific impact
  slides.push({
    slideIndex: 2,
    totalSlides,
    title: 'Who feels it most',
    content: ELEMENT_IMPACTS[element] || ELEMENT_IMPACTS.fire,
    category,
    variant: 'body',
  });

  // Slide 4: Ritual suggestion
  const rng = seededRandom(`transit-ritual-${dateStr}`);
  const rituals = ELEMENT_RITUALS[element] || ELEMENT_RITUALS.fire;
  const ritual = rituals[Math.floor(rng() * rituals.length)];
  slides.push({
    slideIndex: 3,
    totalSlides,
    title: 'What to do',
    content: ritual,
    category,
    variant: 'body',
  });

  // Slide 5: CTA
  slides.push({
    slideIndex: 4,
    totalSlides,
    title: 'Track transits free',
    content: 'lunary.app',
    category,
    variant: 'cta',
  });

  return {
    slides,
    eventName: event.name,
    planet: event.planet,
    sign: event.sign,
  };
}

// ---------------------------------------------------------------------------
// Moon phase fallback
// ---------------------------------------------------------------------------

const MOON_PHASE_DETAILS: Record<
  string,
  { hook: string; meaning: string; action: string }
> = {
  'New Moon': {
    hook: 'New Moon energy is here',
    meaning:
      'The New Moon is a reset. The sky is dark, and so is the slate. This is the time to plant seeds, set intentions, and begin new cycles.',
    action:
      'Write down 3 intentions for this cycle. Light a candle, read them aloud, then fold the paper and keep it somewhere sacred until the Full Moon.',
  },
  'Waxing Crescent': {
    hook: 'Waxing Crescent: momentum is building',
    meaning:
      'Your intentions from the New Moon are taking root. This phase is about nurturing what you started and taking the first small steps.',
    action:
      'Review your New Moon intentions. Take one concrete action today, no matter how small. Carry citrine for momentum.',
  },
  'First Quarter': {
    hook: 'First Quarter Moon: decision time',
    meaning:
      'This is the phase of action and challenge. Obstacles appear to test your commitment. Push through or pivot, but do not stall.',
    action:
      'Identify what is blocking your progress. Take decisive action on one thing you have been avoiding.',
  },
  'Waxing Gibbous': {
    hook: 'Waxing Gibbous: refine and adjust',
    meaning:
      'Nearly full. This phase asks you to fine-tune your approach. What needs adjusting before the climax of the Full Moon?',
    action:
      'Audit your intentions. Are you still aligned with what you set at the New Moon? Adjust course if needed.',
  },
  'Full Moon': {
    hook: 'Full Moon energy peaks tonight',
    meaning:
      'The Full Moon illuminates what has been hidden. Emotions run high, truths surface, and manifestations reach their peak.',
    action:
      'Charge crystals and moon water under the moonlight. Write what you are ready to release, then safely burn or bury the paper.',
  },
  'Waning Gibbous': {
    hook: 'Waning Gibbous: time to share and teach',
    meaning:
      'The gratitude phase. What did the Full Moon reveal? This is the time to integrate lessons and share wisdom with others.',
    action:
      'Practice gratitude for what has manifested. Share one insight or lesson you have learned this cycle.',
  },
  'Last Quarter': {
    hook: 'Last Quarter: release what no longer serves you',
    meaning:
      'The shedding phase. Let go of habits, relationships, or thought patterns that are holding you back from the next cycle.',
    action:
      'Do a cord-cutting ritual or write down what you are releasing. Physically discard or destroy the paper as a symbolic act.',
  },
  'Waning Crescent': {
    hook: 'Waning Crescent: rest and restore',
    meaning:
      'The final phase before renewal. Rest is not laziness. It is preparation. Honour the darkness before the next New Moon.',
    action:
      'Take a salt bath, meditate, or simply rest. Avoid starting new projects. Let the cycle close naturally.',
  },
};

function generateMoonPhaseSpotlight(
  dateStr: string,
  context: TransitContext,
): {
  slides: IGCarouselSlide[];
  eventName: string;
  planet?: string;
  sign?: string;
} {
  const phaseName = context.moonPhase.name;
  const phase = MOON_PHASE_DETAILS[phaseName] || MOON_PHASE_DETAILS['New Moon'];
  const category: ThemeCategory = 'lunar';
  const totalSlides = 5;

  const slides: IGCarouselSlide[] = [];

  // Slide 1: Cover
  slides.push({
    slideIndex: 0,
    totalSlides,
    title: phase.hook,
    content: `${phaseName} guidance for ${dateStr}`,
    category,
    variant: 'cover',
  });

  // Slide 2: Meaning
  slides.push({
    slideIndex: 1,
    totalSlides,
    title: phaseName,
    content: phase.meaning,
    category,
    variant: 'body',
  });

  // Slide 3: Energy
  slides.push({
    slideIndex: 2,
    totalSlides,
    title: 'The energy',
    content: context.moonPhase.energy,
    category,
    variant: 'body',
  });

  // Slide 4: Action
  slides.push({
    slideIndex: 3,
    totalSlides,
    title: 'What to do',
    content: phase.action,
    category,
    variant: 'body',
  });

  // Slide 5: CTA
  slides.push({
    slideIndex: 4,
    totalSlides,
    title: 'Daily moon phases free',
    content: 'lunary.app',
    category,
    variant: 'cta',
  });

  return {
    slides,
    eventName: `${phaseName} in ${context.sunSign}`,
    planet: 'Moon',
    sign: context.sunSign,
  };
}
