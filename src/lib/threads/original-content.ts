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
import {
  getAccurateMoonPhase,
  getRealPlanetaryPositions,
  calculateRealAspects,
} from '../../../utils/astrology/astronomical-data';
import { Observer } from 'astronomy-engine';
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

const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

// Zodiac season names (Sun sign → season label)
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

type CosmicEvent = {
  priority: number;
  type: string;
  /** Unique key for this specific event (e.g., "tight_aspect:Sun-Conjunction-Neptune").
   *  Used for cross-day dedup so the same specific event doesn't repeat. */
  eventKey: string;
  generate: (rng: () => number) => {
    hook: string;
    body: string;
    prompt: string;
    topicTag: string;
  };
};

/**
 * Build a ranked list of cosmic events happening on this date.
 * Returns all events sorted by priority — caller picks the top one.
 */
function buildCosmicEvents(dateStr: string, slotHour: number): CosmicEvent[] {
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

  // --- 1. Planetary ingress (existing logic, highest priority) ---
  const transit =
    transitRaw && transitRaw.hoursUntil >= -12 && transitRaw.hoursUntil <= 36
      ? transitRaw
      : null;

  if (transit) {
    events.push({
      priority: 100,
      type: 'planetary_ingress',
      eventKey: `planetary_ingress:${transit.planet}-${transit.toSign}`,
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

  // --- 2b. Zodiac season countdown (Sun approaching sign change) ---
  if (sunSign && positions.Sun?.duration) {
    const remaining = Math.round(positions.Sun.duration.remainingDays);
    const nextSign = ZODIAC_SIGNS[(ZODIAC_SIGNS.indexOf(sunSign) + 1) % 12];
    const nextSeason = ZODIAC_SEASON_NAMES[nextSign] || `${nextSign} season`;

    if (remaining >= 6 && remaining <= 8) {
      events.push({
        priority: 70,
        type: 'season_countdown',
        eventKey: `season_countdown:${nextSign}-1week`,
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

  // --- 3b. Retrograde sign re-entry (planet backing into previous sign) ---
  for (const planet of NOTABLE_PLANETS) {
    const pos = positions[planet];
    if (!pos || !pos.retrograde) continue;

    // If retrograde and near 0° of sign (within ~3°), it's about to re-enter the previous sign
    if (pos.degree <= 3) {
      const prevSignIndex = (ZODIAC_SIGNS.indexOf(pos.sign) - 1 + 12) % 12;
      const prevSign = ZODIAC_SIGNS[prevSignIndex];
      events.push({
        priority: 85,
        type: 'retrograde_reentry',
        eventKey: `retrograde_reentry:${planet}-${prevSign}`,
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

  // --- 4. Moon sign change (every ~2.5 days) ---
  const moonSign = positions.Moon?.sign;
  const yesterdayMoonSign = yesterdayPositions.Moon?.sign;
  if (moonSign && yesterdayMoonSign && moonSign !== yesterdayMoonSign) {
    events.push({
      priority: 80,
      type: 'moon_sign_change',
      eventKey: `moon_sign_change:${moonSign}`,
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

  // --- 5. Stellium / conjunction clusters (3+ planets in same sign) ---
  const signCounts: Record<string, string[]> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    if (!pos?.sign) continue;
    if (!signCounts[pos.sign]) signCounts[pos.sign] = [];
    signCounts[pos.sign].push(planet);
  }

  for (const [sign, planets] of Object.entries(signCounts)) {
    if (planets.length >= 3) {
      // Filter to interesting planets (not just Sun+Mercury which travel together)
      const notable = planets.filter((p) => !['Moon'].includes(p));
      if (notable.length >= 3) {
        events.push({
          priority: 72 + notable.length, // More planets = higher priority
          type: 'stellium',
          eventKey: `stellium:${sign}-${notable.sort().join('+')}`,
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

  // --- 6. Tight aspects (conjunction, opposition, square — within 2° orb) ---
  const tightAspects = aspects.filter(
    (a) =>
      a.separation <= 2 &&
      ['Conjunction', 'Opposition', 'Square', 'Trine'].includes(a.aspect),
  );

  for (const aspect of tightAspects.slice(0, 2)) {
    // Skip Moon aspects (too frequent) unless it's a conjunction with an outer planet
    const isMoonAspect =
      aspect.planetA?.name === 'Moon' || aspect.planetB?.name === 'Moon';
    if (isMoonAspect && aspect.aspect !== 'Conjunction') continue;

    const pA = aspect.planetA?.name || 'unknown';
    const pB = aspect.planetB?.name || 'unknown';

    events.push({
      priority: 65 + (10 - aspect.separation) * 2,
      type: 'tight_aspect',
      eventKey: `tight_aspect:${pA}-${aspect.aspect}-${pB}`,
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

  // --- 7. Moon phase transition (only when phase name changes) ---
  if (moonPhase.name !== yesterdayMoonPhase.name) {
    const isMainPhase = moonPhase.isSignificant;
    events.push({
      priority: isMainPhase ? 78 : 60,
      type: 'moon_phase_change',
      eventKey: `moon_phase_change:${moonPhase.name}`,
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

  // --- 8. Transit milestones (halfway, last week, etc.) ---
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
        generate: () => ({
          hook: milestoneHook!,
          body: milestoneBody!,
          prompt: `How has ${planet} in ${pos.sign} affected you?`,
          topicTag: 'Astrology',
        }),
      });
    }
  }

  // --- 9. Planet spotlight fallback (always available) ---
  // Pick an interesting planet to spotlight based on the date
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

  // --- 10. Current moon position (better than generic phase vibes) ---
  if (moonSign) {
    events.push({
      priority: 25,
      type: 'moon_position',
      eventKey: `moon_position:${moonSign}`,
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

/**
 * Collect event keys that were (or would have been) used on recent days.
 * Since buildCosmicEvents is deterministic, we replay previous days cheaply.
 * Tracks both event types AND specific event keys for granular dedup.
 */
function getRecentEventKeys(
  dateStr: string,
  slotHour: number,
  lookbackDays: number = 3,
): { types: Map<string, number>; keys: Set<string> } {
  const types = new Map<string, number>();
  const keys = new Set<string>();
  const baseDate = new Date(dateStr);

  for (let d = 1; d <= lookbackDays; d++) {
    const pastDate = new Date(baseDate);
    pastDate.setDate(pastDate.getDate() - d);
    const pastStr = pastDate.toISOString().split('T')[0];

    // Check all 3 cosmic slots for each past day
    const pastEvents = buildCosmicEvents(pastStr, slotHour);
    // Track ALL events that would have been in contention (top 5, not just 3)
    for (let rank = 0; rank < Math.min(5, pastEvents.length); rank++) {
      const event = pastEvents[rank];
      types.set(event.type, (types.get(event.type) || 0) + 1);
      keys.add(event.eventKey);
    }
  }

  return { types, keys };
}

/**
 * Remove events whose specific event key appeared in the lookback window.
 * This prevents the same specific transit (e.g., Sun conjunct Neptune) from
 * repeating on consecutive days, even if the broader event type is different.
 * Falls back to type-based dedup as a secondary filter.
 */
function removeStaleSameTypeEvents(
  events: CosmicEvent[],
  recent: { types: Map<string, number>; keys: Set<string> },
): CosmicEvent[] {
  // Primary filter: remove events whose specific key was used recently
  const fresh = events.filter((e) => !recent.keys.has(e.eventKey));

  // If we filtered out everything, keep low-priority fallbacks
  if (fresh.length === 0) {
    const fallbacks = events.filter(
      (e) => e.type === 'planet_spotlight' || e.type === 'moon_position',
    );
    return fallbacks.length > 0 ? fallbacks : [events[events.length - 1]];
  }

  return fresh;
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
