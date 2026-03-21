/**
 * Transit Context Layer
 *
 * Provides real astronomical context to the content orchestrator.
 * Calls existing astronomy-engine utilities (no new astronomical code).
 * Includes cosmic event detection from the shared module (same system
 * used by Threads and video scripts) for rich, deduped content.
 * Compute time: ~100-200ms.
 */

import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '@utils/astrology/astronomical-data';
import {
  getEventCalendarForDate,
  type CalendarEvent,
} from '@/lib/astro/event-calendar';
import { Observer } from 'astronomy-engine';
import {
  getTopCosmicEvents,
  type CosmicEvent,
  type CosmicEventContent,
} from '@/lib/astro/cosmic-events';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CosmicEventWithContent {
  event: CosmicEvent;
  content: CosmicEventContent;
}

export interface TransitContext {
  /** Current sun sign */
  sunSign: string;
  /** Moon phase info */
  moonPhase: { name: string; energy: string };
  /** Planets currently retrograde */
  retrogradePlanets: Array<{ planet: string; sign: string }>;
  /** Highest-scoring event if score >= 70 */
  highPriorityEvent: CalendarEvent | null;
  /** Sign with most transiting planets */
  hotSign: string;
  /** Number of planets in the hot sign */
  hotSignPlanetCount: number;
  /** All events for the date */
  todayEvents: CalendarEvent[];
  /** Top cosmic events with rich content, deduped against recent days.
   *  Same detection engine used by Threads and video scripts. */
  cosmicEvents: CosmicEventWithContent[];
}

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

/**
 * Build transit context for a given date string (YYYY-MM-DD).
 * Deterministic for a given date.
 */
export async function getTransitContext(
  dateStr: string,
): Promise<TransitContext> {
  const date = new Date(dateStr);
  date.setUTCHours(12, 0, 0, 0);

  const positions = getRealPlanetaryPositions(date, DEFAULT_OBSERVER);
  const moon = getAccurateMoonPhase(date);
  const events = await getEventCalendarForDate(dateStr);
  const highPriorityEvent =
    events.length > 0 && events[0].score >= 70 ? events[0] : null;

  // Collect retrograde planets
  const retrogradePlanets: Array<{ planet: string; sign: string }> = [];
  for (const [planet, data] of Object.entries(positions) as [string, any][]) {
    if (data.retrograde && planet !== 'Sun' && planet !== 'Moon') {
      retrogradePlanets.push({ planet, sign: data.sign });
    }
  }

  // Count planets per sign to find the "hot sign"
  const signCounts: Record<string, number> = {};
  for (const [, data] of Object.entries(positions) as [string, any][]) {
    const sign = (data.sign as string).toLowerCase();
    signCounts[sign] = (signCounts[sign] || 0) + 1;
  }
  const hotSignEntry = Object.entries(signCounts).sort(
    (a, b) => b[1] - a[1],
  )[0];
  const hotSign = hotSignEntry[0];
  const hotSignPlanetCount = hotSignEntry[1];

  // Get rich cosmic events (deduped against last 3 days, same engine as Threads)
  const cosmicEvents = getTopCosmicEvents(dateStr, 3, 12);

  return {
    sunSign: (positions.Sun as any)?.sign?.toLowerCase() || 'aries',
    moonPhase: { name: moon.name, energy: moon.energy },
    retrogradePlanets,
    highPriorityEvent,
    hotSign,
    hotSignPlanetCount,
    todayEvents: events,
    cosmicEvents,
  };
}

// ---------------------------------------------------------------------------
// Biasing helpers
// ---------------------------------------------------------------------------

/** Traits that resonate with Mercury retrograde */
const MERCURY_RX_TRAITS = [
  'overthinking',
  'survival_mode',
  'midnight_thought',
  'toxic_trait',
];

/** Traits that resonate with Venus retrograde */
const VENUS_RX_TRAITS = [
  'love_language',
  'dealbreaker',
  'jealousy',
  'red_flag',
  'emotional_weapon',
];

/** Traits that resonate with Mars retrograde */
const MARS_RX_TRAITS = [
  'survival_mode',
  'emotional_weapon',
  'hidden_strength',
  'superpower',
];

/**
 * Get retrograde-biased traits for one-word / sign-ranking content.
 * Returns a list of traits that should be preferred when retrogrades are active.
 * If no retrogrades are active, returns empty array (no bias).
 */
export function getRetrogradeBiasedTraits(
  retrogradePlanets: Array<{ planet: string; sign: string }>,
): string[] {
  const biased: string[] = [];
  for (const { planet } of retrogradePlanets) {
    switch (planet) {
      case 'Mercury':
        biased.push(...MERCURY_RX_TRAITS);
        break;
      case 'Venus':
        biased.push(...VENUS_RX_TRAITS);
        break;
      case 'Mars':
        biased.push(...MARS_RX_TRAITS);
        break;
    }
  }
  return [...new Set(biased)];
}

/**
 * Map transit context to a carousel category bias.
 * Returns a suggested ThemeCategory when transits make a particular
 * grimoire category especially relevant, or undefined for no bias.
 */
export function getTransitCategoryBias(
  context: TransitContext,
): string | undefined {
  // Check if any planet is in Scorpio -> feature Death tarot, dark crystals
  const hotSign = context.hotSign;
  if (hotSign === 'scorpio') return 'tarot';
  if (hotSign === 'pisces') return 'tarot';

  // Venus prominent (in hotSign or retrograde) -> crystals
  const venusRetro = context.retrogradePlanets.some(
    (p) => p.planet === 'Venus',
  );
  if (venusRetro) return 'crystals';

  // Moon-heavy energy -> spells (ritual timing)
  if (
    context.moonPhase.name === 'Full Moon' ||
    context.moonPhase.name === 'New Moon'
  ) {
    return 'spells';
  }

  return undefined;
}
