/**
 * Shared Cosmic Event Detection
 *
 * Extracted from src/lib/threads/original-content.ts so both Threads
 * and Instagram carousels can use the same rich event detection.
 *
 * This module handles DETECTION only -- each platform adapts the
 * events into its own format (text posts vs carousel slides).
 */

import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
  calculateRealAspects,
} from '@utils/astrology/astronomical-data';
import { getTransitThemeForDate } from '@/lib/social/weekly-themes';
import { Observer } from 'astronomy-engine';

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

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

const ZODIAC_SEASON_NAMES: Record<string, string> = {
  Aries: 'Aries season',
  Taurus: 'Taurus season',
  Gemini: 'Gemini season',
  Cancer: 'Cancer season',
  Leo: 'Leo season',
  Virgo: 'Virgo season',
  Libra: 'Libra season',
  Scorpio: 'Scorpio season',
  Sagittarius: 'Sagittarius season',
  Capricorn: 'Capricorn season',
  Aquarius: 'Aquarius season',
  Pisces: 'Pisces season',
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type CosmicEventType =
  | 'planetary_ingress'
  | 'zodiac_season'
  | 'season_countdown'
  | 'retrograde_station'
  | 'direct_station'
  | 'retrograde_reentry'
  | 'moon_sign_change'
  | 'stellium'
  | 'tight_aspect'
  | 'moon_phase_change'
  | 'transit_milestone'
  | 'planet_spotlight'
  | 'moon_position';

export interface CosmicEventContent {
  hook: string;
  body: string;
  prompt: string;
  topicTag: string;
}

export interface CosmicEvent {
  priority: number;
  type: CosmicEventType;
  /** Unique key for dedup (e.g. "tight_aspect:Sun-Conjunction-Neptune") */
  eventKey: string;
  /** Extra structured data for carousel adaptation */
  planet?: string;
  sign?: string;
  aspect?: string;
  generate: (rng: () => number) => CosmicEventContent;
}

// ---------------------------------------------------------------------------
// Core detection
// ---------------------------------------------------------------------------

/**
 * Build a ranked list of cosmic events happening on this date.
 * Returns all events sorted by priority -- caller picks what they need.
 */
export function buildCosmicEvents(
  dateStr: string,
  slotHour: number,
): CosmicEvent[] {
  const postDate = new Date(dateStr);
  postDate.setUTCHours(slotHour, 0, 0, 0);

  const positions = getRealPlanetaryPositions(postDate, DEFAULT_OBSERVER);
  const moonPhase = getAccurateMoonPhase(postDate);
  const aspects = calculateRealAspects(positions);
  const transitRaw = getTransitThemeForDate(postDate);

  // Yesterday's data for detecting changes
  const yesterday = new Date(postDate);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayPositions = getRealPlanetaryPositions(
    yesterday,
    DEFAULT_OBSERVER,
  );
  const yesterdayMoonPhase = getAccurateMoonPhase(yesterday);

  const events: CosmicEvent[] = [];

  // --- 1. Planetary ingress (highest priority) ---
  const transit =
    transitRaw && transitRaw.hoursUntil >= -12 && transitRaw.hoursUntil <= 36
      ? transitRaw
      : null;

  if (transit) {
    events.push({
      priority: 100,
      type: 'planetary_ingress',
      eventKey: `planetary_ingress:${transit.planet}-${transit.toSign}`,
      planet: transit.planet,
      sign: transit.toSign,
      generate: (rng) => {
        if (transit.hoursUntil > 12) {
          const bodies = [
            'This kind of shift changes the energy for weeks. Pay attention to what starts to surface.',
            'Slow-moving planets do not change sign often. When they do, things actually shift.',
            'The pressure you have been feeling is about to make more sense.',
            'Energy is already building around this. You might feel it before you can name it.',
          ];
          const prompts = [
            `Are you already feeling ${transit.planet} energy building?`,
            'What has been shifting for you lately?',
            `What do you expect to change when ${transit.planet} moves into ${transit.toSign}?`,
          ];
          return {
            hook: `${transit.planet} moves into ${transit.toSign} tomorrow`,
            body: bodies[Math.floor(rng() * bodies.length)],
            prompt: prompts[Math.floor(rng() * prompts.length)],
            topicTag: 'Astrology',
          };
        } else if (transit.hoursUntil >= 0) {
          const bodies =
            transit.hoursUntil > 0
              ? [
                  `${transit.hoursUntil} hour${transit.hoursUntil !== 1 ? 's' : ''} away and you might already feel it building.`,
                  `Less than ${transit.hoursUntil + 1} hours away. The energy is already shifting.`,
                ]
              : [
                  'This shift is happening right now. Pay attention to what surfaces.',
                  'Right now. This is the moment the energy moves.',
                ];
          return {
            hook: `${transit.planet} is moving into ${transit.toSign}`,
            body: bodies[Math.floor(rng() * bodies.length)],
            prompt: 'Can you feel the shift?',
            topicTag: 'Astrology',
          };
        } else {
          const bodies = [
            'The shift has happened. Notice what has already started to change.',
            'Pay attention to the next 48 hours. This is when it gets obvious.',
            'It landed. What you have been sensing is now confirmed.',
          ];
          return {
            hook: `${transit.planet} is now in ${transit.toSign}`,
            body: bodies[Math.floor(rng() * bodies.length)],
            prompt: `What shifted for you when ${transit.planet} moved into ${transit.toSign}?`,
            topicTag: 'Astrology',
          };
        }
      },
    });
  }

  // --- 2. Zodiac season change (Sun entering a new sign) ---
  const sunSign = positions.Sun?.sign;
  const yesterdaySunSign = yesterdayPositions.Sun?.sign;
  if (sunSign && yesterdaySunSign && sunSign !== yesterdaySunSign) {
    events.push({
      priority: 95,
      type: 'zodiac_season',
      eventKey: `zodiac_season:${sunSign}`,
      planet: 'Sun',
      sign: sunSign,
      generate: (rng) => {
        const season = ZODIAC_SEASON_NAMES[sunSign] || `${sunSign} season`;
        const bodies = [
          `The Sun has moved into ${sunSign}. The collective energy shifts today.`,
          `A new chapter opens. ${season} brings a different flavour to everything.`,
          `The sky is changing. ${sunSign} energy will colour the next 30 days.`,
        ];
        const prompts = [
          `What are you bringing into ${season}?`,
          `How does ${sunSign} energy show up in your life?`,
          `Ready for ${season}?`,
        ];
        return {
          hook: `${season} starts today`,
          body: bodies[Math.floor(rng() * bodies.length)],
          prompt: prompts[Math.floor(rng() * prompts.length)],
          topicTag: 'Zodiac',
        };
      },
    });
  }

  // --- 2b. Zodiac season countdown ---
  if (sunSign && positions.Sun?.duration) {
    const remaining = Math.round(positions.Sun.duration.remainingDays);
    const nextSign = ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 1) % 12];
    const nextSeason = ZODIAC_SEASON_NAMES[nextSign] || `${nextSign} season`;

    if (remaining >= 6 && remaining <= 8) {
      events.push({
        priority: 70,
        type: 'season_countdown',
        eventKey: `season_countdown:${nextSign}-1week`,
        planet: 'Sun',
        sign: nextSign,
        generate: (rng) => {
          const bodies = [
            `${ZODIAC_SEASON_NAMES[sunSign]} is winding down. Start preparing for what comes next.`,
            `One week left of ${sunSign} energy. Use it while you have it.`,
          ];
          return {
            hook: `${nextSeason} starts in 1 week`,
            body: bodies[Math.floor(rng() * bodies.length)],
            prompt: `What do you want to finish before ${sunSign} ends?`,
            topicTag: 'Zodiac',
          };
        },
      });
    } else if (remaining >= 2 && remaining <= 4) {
      events.push({
        priority: 75,
        type: 'season_countdown',
        eventKey: `season_countdown:${nextSign}-final`,
        planet: 'Sun',
        sign: nextSign,
        generate: (rng) => {
          const bodies = [
            `The collective mood is about to change. Use the last of this ${sunSign} energy while you have it.`,
            `Whatever ${sunSign} has been teaching you, the final lesson lands this week.`,
          ];
          const prompts = [
            `What are you carrying into ${nextSeason}?`,
            `What did ${ZODIAC_SEASON_NAMES[sunSign]} change for you?`,
          ];
          return {
            hook: `${remaining} days left of ${ZODIAC_SEASON_NAMES[sunSign]}`,
            body: bodies[Math.floor(rng() * bodies.length)],
            prompt: prompts[Math.floor(rng() * prompts.length)],
            topicTag: 'Zodiac',
          };
        },
      });
    }
  }

  // --- 3. Retrograde/direct stations ---
  const NOTABLE_PLANETS = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn'];
  for (const planet of NOTABLE_PLANETS) {
    const pos = positions[planet];
    if (!pos) continue;

    if (pos.newRetrograde) {
      events.push({
        priority: 90,
        type: 'retrograde_station',
        eventKey: `retrograde_station:${planet}-retrograde`,
        planet,
        sign: pos.sign,
        generate: (rng) => {
          const bodies = [
            `Time to slow down and review everything ${planet} rules. This is not a punishment, it is a reset.`,
            `Things may feel like they are going backwards. They are not. You are being asked to look again.`,
            `${planet} retrograde is not about things breaking. It is about things realigning.`,
          ];
          return {
            hook: `${planet} is now retrograde in ${pos.sign}`,
            body: bodies[Math.floor(rng() * bodies.length)],
            prompt: `What do you need to revisit during ${planet} retrograde?`,
            topicTag: 'Astrology',
          };
        },
      });
    }

    if (pos.newDirect) {
      events.push({
        priority: 88,
        type: 'direct_station',
        eventKey: `direct_station:${planet}-direct`,
        planet,
        sign: pos.sign,
        generate: (rng) => {
          const bodies = [
            `Momentum returns. What was stuck during the retrograde can start moving again.`,
            `The review period is over. ${planet} is moving forward and so can you.`,
          ];
          return {
            hook: `${planet} stations direct in ${pos.sign}`,
            body: bodies[Math.floor(rng() * bodies.length)],
            prompt: `What are you ready to move forward on?`,
            topicTag: 'Astrology',
          };
        },
      });
    }
  }

  // --- 3b. Retrograde sign re-entry ---
  for (const planet of NOTABLE_PLANETS) {
    const pos = positions[planet];
    if (!pos || !pos.retrograde) continue;

    if (pos.degree <= 3) {
      const prevSignIndex = (ZODIAC_SIGNS.indexOf(pos.sign) - 1 + 12) % 12;
      const prevSign = ZODIAC_SIGNS[prevSignIndex];
      events.push({
        priority: 85,
        type: 'retrograde_reentry',
        eventKey: `retrograde_reentry:${planet}-${prevSign}`,
        planet,
        sign: prevSign,
        generate: (rng) => {
          const bodies = [
            `${planet} retrograde is backing into ${prevSign}. Themes from that transit are returning for review.`,
            `${planet} at ${Math.round(pos.degree)}° ${pos.sign} retrograde. ${prevSign} is pulling it back. Unfinished business.`,
            `When a retrograde planet re-enters the previous sign, it reopens whatever you thought was closed.`,
          ];
          return {
            hook: `${planet} retrograde is about to re-enter ${prevSign}`,
            body: bodies[Math.floor(rng() * bodies.length)],
            prompt: `What unfinished ${prevSign} themes are coming back for you?`,
            topicTag: 'Astrology',
          };
        },
      });
    }
  }

  // --- 4. Moon sign change ---
  const moonSign = positions.Moon?.sign;
  const yesterdayMoonSign = yesterdayPositions.Moon?.sign;
  if (moonSign && yesterdayMoonSign && moonSign !== yesterdayMoonSign) {
    events.push({
      priority: 80,
      type: 'moon_sign_change',
      eventKey: `moon_sign_change:${moonSign}`,
      planet: 'Moon',
      sign: moonSign,
      generate: (rng) => {
        const bodies = [
          `The emotional tone shifts today. ${moonSign} brings a different kind of feeling.`,
          `Your instincts, reactions, and needs all take on ${moonSign} qualities now.`,
          `The Moon moves fast. But each sign it passes through changes how things land.`,
        ];
        const prompts = [
          `How does Moon in ${moonSign} feel for you?`,
          `What does ${moonSign} Moon energy bring up?`,
          `Notice a shift in your mood today?`,
        ];
        return {
          hook: `The Moon moves into ${moonSign} today`,
          body: bodies[Math.floor(rng() * bodies.length)],
          prompt: prompts[Math.floor(rng() * prompts.length)],
          topicTag: 'Moon',
        };
      },
    });
  }

  // --- 5. Stellium (3+ planets in same sign) ---
  const signCounts: Record<string, string[]> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    if (!pos?.sign) continue;
    if (!signCounts[pos.sign]) signCounts[pos.sign] = [];
    signCounts[pos.sign].push(planet);
  }

  for (const [sign, planets] of Object.entries(signCounts)) {
    if (planets.length >= 3) {
      const notable = planets.filter((p) => !['Moon'].includes(p));
      if (notable.length >= 3) {
        events.push({
          priority: 72 + notable.length,
          type: 'stellium',
          eventKey: `stellium:${sign}-${notable.sort().join('+')}`,
          sign,
          generate: (rng) => {
            const list =
              notable.length <= 4
                ? notable.slice(0, -1).join(', ') +
                  ' and ' +
                  notable[notable.length - 1]
                : `${notable.length} planets`;
            const bodies = [
              `That is a lot of energy concentrated in one place. ${sign} themes are impossible to ignore right now.`,
              `When this many planets gather in one sign, that area of life demands attention.`,
              `${sign} is packed. Whatever this sign rules in your chart is getting a major activation.`,
            ];
            const prompts = [
              `Which ${sign} themes are showing up strongest for you?`,
              `Can you feel ${sign} running the show right now?`,
              `How is all this ${sign} energy landing?`,
            ];
            return {
              hook: `${list} are all in ${sign} right now`,
              body: bodies[Math.floor(rng() * bodies.length)],
              prompt: prompts[Math.floor(rng() * prompts.length)],
              topicTag: 'Astrology',
            };
          },
        });
      }
    }
  }

  // --- 6. Tight aspects (within 2° orb) ---
  const tightAspects = aspects.filter(
    (a: any) =>
      a.separation <= 2 &&
      ['Conjunction', 'Opposition', 'Square', 'Trine'].includes(a.aspect),
  );

  for (const aspect of tightAspects.slice(0, 2)) {
    const isMoonAspect =
      aspect.planetA?.name === 'Moon' || aspect.planetB?.name === 'Moon';
    if (isMoonAspect && aspect.aspect !== 'Conjunction') continue;

    const pA = aspect.planetA?.name || 'unknown';
    const pB = aspect.planetB?.name || 'unknown';

    events.push({
      priority: 65 + (10 - aspect.separation) * 2,
      type: 'tight_aspect',
      eventKey: `tight_aspect:${pA}-${aspect.aspect}-${pB}`,
      planet: pA,
      sign: aspect.planetA?.sign,
      aspect: aspect.aspect,
      generate: (rng) => {
        const aspectDescriptions: Record<string, string[]> = {
          Conjunction: [
            `Their energies merge. Whatever they both rule is amplified right now.`,
            `Two forces combining. This is not subtle.`,
            `A conjunction means fusion. These two are speaking as one.`,
          ],
          Opposition: [
            `Tension between two forces. The challenge is finding balance, not picking sides.`,
            `An opposition asks you to hold two truths at once.`,
          ],
          Square: [
            `Friction that demands action. This aspect does not let you sit still.`,
            `Squares create pressure. Pressure creates change.`,
          ],
          Trine: [
            `Flow and ease between these two. Things that align with this energy move effortlessly.`,
            `A trine is support. Use it before it passes.`,
          ],
        };
        const bodies = aspectDescriptions[aspect.aspect] || [
          'A significant alignment in the sky today.',
        ];
        return {
          hook: `${pA} ${aspect.aspect.toLowerCase()} ${pB} is exact today`,
          body: bodies[Math.floor(rng() * bodies.length)],
          prompt: `How are you feeling ${pA} and ${pB} energy right now?`,
          topicTag: 'Astrology',
        };
      },
    });
  }

  // --- 7. Moon phase transition ---
  if (moonPhase.name !== yesterdayMoonPhase.name) {
    const isMainPhase = moonPhase.isSignificant;
    events.push({
      priority: isMainPhase ? 78 : 60,
      type: 'moon_phase_change',
      eventKey: `moon_phase_change:${moonPhase.name}`,
      planet: 'Moon',
      generate: (rng) => {
        const bodies = isMainPhase
          ? [
              'This is a potent phase. Your intentions carry extra weight right now.',
              'This phase hits different. Pay attention to what surfaces.',
              `The Moon reaches a turning point. ${moonPhase.energy}.`,
            ]
          : [
              `${moonPhase.trend === 'waxing' ? 'Building momentum' : 'Time to release'}. Work with it, not against it.`,
              `${moonPhase.energy}. Adjust your pace accordingly.`,
            ];
        return {
          hook: `${moonPhase.name} begins today`,
          body: bodies[Math.floor(rng() * bodies.length)],
          prompt:
            moonPhase.trend === 'waxing'
              ? 'What are you building this phase?'
              : 'What are you ready to let go of?',
          topicTag: 'Moon',
        };
      },
    });
  }

  // --- 8. Transit milestones ---
  const SLOW_PLANETS = ['Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
  for (const planet of SLOW_PLANETS) {
    const pos = positions[planet];
    if (!pos?.duration || pos.retrograde) continue;

    const totalDays = Math.round(pos.duration.totalDays);
    const remainingDays = Math.round(pos.duration.remainingDays);
    const elapsed = totalDays - remainingDays;
    const halfway = Math.floor(totalDays / 2);

    let milestoneHook: string | null = null;
    let milestoneBody: string | null = null;

    if (elapsed >= halfway - 1 && elapsed <= halfway + 1) {
      milestoneHook = `${planet} in ${pos.sign} is halfway done`;
      milestoneBody = `${planet} entered ${pos.sign} ${elapsed} days ago and has ${remainingDays} days left. This is the midpoint.`;
    } else if (remainingDays >= 28 && remainingDays <= 32 && totalDays > 90) {
      milestoneHook = `${planet} leaves ${pos.sign} in about 1 month`;
      milestoneBody = `After ${elapsed} days in ${pos.sign}, the final month begins. What has this transit taught you?`;
    } else if (remainingDays >= 6 && remainingDays <= 8 && totalDays > 30) {
      milestoneHook = `${planet} has 1 week left in ${pos.sign}`;
      milestoneBody = `${totalDays} days of ${planet} in ${pos.sign} are almost over. Final week.`;
    }

    if (milestoneHook && milestoneBody) {
      events.push({
        priority: 55,
        type: 'transit_milestone',
        eventKey: `transit_milestone:${planet}-${pos.sign}`,
        planet,
        sign: pos.sign,
        generate: () => ({
          hook: milestoneHook!,
          body: milestoneBody!,
          prompt: `How has ${planet} in ${pos.sign} affected you?`,
          topicTag: 'Astrology',
        }),
      });
    }
  }

  // --- 9. Planet spotlight fallback ---
  const spotlightPlanets = ['Mars', 'Venus', 'Mercury', 'Jupiter', 'Saturn'];
  events.push({
    priority: 30,
    type: 'planet_spotlight',
    eventKey: `planet_spotlight:${dateStr}`,
    generate: (rng) => {
      const planetName =
        spotlightPlanets[Math.floor(rng() * spotlightPlanets.length)];
      const pos = positions[planetName];
      if (!pos) {
        return {
          hook: `The sky is busy today`,
          body: 'Multiple transits are active. Pay attention to what feels loudest.',
          prompt: 'What energy is showing up strongest for you?',
          topicTag: 'Astrology',
        };
      }

      const retroLabel = pos.retrograde ? ' retrograde' : '';
      const durationNote = pos.duration
        ? ` (${Math.round(pos.duration.remainingDays)} days left)`
        : '';

      const bodies = [
        `${planetName} at ${Math.round(pos.degree)}° ${pos.sign}${retroLabel}${durationNote}. This colours everything ${planetName} rules.`,
        `Wherever ${pos.sign} falls in your chart, ${planetName} is activating it${retroLabel ? ' in retrograde' : ''}.`,
        `${planetName} in ${pos.sign} shapes how you ${planetName === 'Mars' ? 'act' : planetName === 'Venus' ? 'love' : planetName === 'Mercury' ? 'think' : planetName === 'Jupiter' ? 'grow' : 'build'} right now.`,
      ];

      return {
        hook: `${planetName} is at ${Math.round(pos.degree)}° ${pos.sign}${retroLabel}`,
        body: bodies[Math.floor(rng() * bodies.length)],
        prompt: `Where does ${pos.sign} fall in your chart?`,
        topicTag: 'Astrology',
      };
    },
  });

  // --- 10. Current moon position ---
  if (moonSign) {
    events.push({
      priority: 25,
      type: 'moon_position',
      eventKey: `moon_position:${moonSign}`,
      planet: 'Moon',
      sign: moonSign,
      generate: (rng) => {
        const bodies = [
          `${moonPhase.trend === 'waxing' ? 'Energy is building' : 'Time to let go of what is not working'}. ${moonSign} decides where that lands.`,
          `Your emotional defaults shift under this sign. Notice what triggers you differently today.`,
        ];
        const prompts = [
          `What is ${moonSign} stirring up for you?`,
          `Where do you feel this in your chart?`,
        ];
        return {
          hook: `Moon in ${moonSign} (${moonPhase.name})`,
          body: bodies[Math.floor(rng() * bodies.length)],
          prompt: prompts[Math.floor(rng() * prompts.length)],
          topicTag: 'Moon',
        };
      },
    });
  }

  return events.sort((a, b) => b.priority - a.priority);
}

// ---------------------------------------------------------------------------
// Cross-day dedup
// ---------------------------------------------------------------------------

export interface RecentEventData {
  types: Map<string, number>;
  keys: Set<string>;
}

/**
 * Collect event keys from recent days for dedup.
 * Replays buildCosmicEvents() for previous days (deterministic, cheap).
 */
export function getRecentEventKeys(
  dateStr: string,
  slotHour: number,
  lookbackDays: number = 3,
): RecentEventData {
  const types = new Map<string, number>();
  const keys = new Set<string>();
  const baseDate = new Date(dateStr);

  for (let d = 1; d <= lookbackDays; d++) {
    const pastDate = new Date(baseDate);
    pastDate.setDate(pastDate.getDate() - d);
    const pastStr = pastDate.toISOString().split('T')[0];

    const pastEvents = buildCosmicEvents(pastStr, slotHour);
    for (let rank = 0; rank < Math.min(5, pastEvents.length); rank++) {
      const event = pastEvents[rank];
      types.set(event.type, (types.get(event.type) || 0) + 1);
      keys.add(event.eventKey);
    }
  }

  return { types, keys };
}

/**
 * Remove events whose specific key appeared in the lookback window.
 * Falls back to low-priority events if everything is filtered out.
 */
export function dedupeCosmicEvents(
  events: CosmicEvent[],
  recent: RecentEventData,
): CosmicEvent[] {
  const fresh = events.filter((e) => !recent.keys.has(e.eventKey));

  if (fresh.length === 0) {
    const fallbacks = events.filter(
      (e) => e.type === 'planet_spotlight' || e.type === 'moon_position',
    );
    return fallbacks.length > 0 ? fallbacks : [events[events.length - 1]];
  }

  return fresh;
}

/**
 * Get the top cosmic event for a date, deduped against recent days.
 * Convenience wrapper used by carousel and other non-Threads consumers.
 */
export function getTopCosmicEvent(
  dateStr: string,
  slotHour: number = 12,
): { event: CosmicEvent; content: CosmicEventContent } | null {
  const events = buildCosmicEvents(dateStr, slotHour);
  if (events.length === 0) return null;

  const recent = getRecentEventKeys(dateStr, slotHour);
  const deduped = dedupeCosmicEvents(events, recent);

  const event = deduped[0];
  // Use a simple deterministic seed for content generation
  const seed = hashForSeed(`cosmic-carousel-${dateStr}`);
  let state = seed;
  const rng = () => {
    state = (state * 1664525 + 1013904223) & 0x7fffffff;
    return state / 0x7fffffff;
  };

  return { event, content: event.generate(rng) };
}

/**
 * Get multiple deduped cosmic events for a date.
 * Used when you need more than one event (e.g. multi-slide carousel).
 */
export function getTopCosmicEvents(
  dateStr: string,
  count: number = 3,
  slotHour: number = 12,
): Array<{ event: CosmicEvent; content: CosmicEventContent }> {
  const events = buildCosmicEvents(dateStr, slotHour);
  if (events.length === 0) return [];

  const recent = getRecentEventKeys(dateStr, slotHour);
  const deduped = dedupeCosmicEvents(events, recent);

  const results: Array<{ event: CosmicEvent; content: CosmicEventContent }> =
    [];

  for (let i = 0; i < Math.min(count, deduped.length); i++) {
    const event = deduped[i];
    const seed = hashForSeed(`cosmic-carousel-${dateStr}-${i}`);
    let state = seed;
    const rng = () => {
      state = (state * 1664525 + 1013904223) & 0x7fffffff;
      return state / 0x7fffffff;
    };
    results.push({ event, content: event.generate(rng) });
  }

  return results;
}

function hashForSeed(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash) || 1;
}
