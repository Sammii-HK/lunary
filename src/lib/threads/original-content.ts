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
import {
  getEventCalendarForDate,
  type CalendarEvent,
} from '@/lib/astro/event-calendar';

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

// What each planet rules (for substantive body text)
const PLANET_RULES: Record<string, string> = {
  Sun: 'identity, vitality, and purpose',
  Moon: 'emotions, instincts, and needs',
  Mercury: 'communication, thinking, and travel',
  Venus: 'love, beauty, and values',
  Mars: 'action, drive, and conflict',
  Jupiter: 'growth, luck, and expansion',
  Saturn: 'discipline, boundaries, and responsibility',
  Uranus: 'disruption, freedom, and innovation',
  Neptune: 'dreams, intuition, and illusion',
  Pluto: 'transformation, power, and depth',
};

// Essential dignities: where planets are strongest/weakest
const PLANET_DIGNITY: Record<string, Record<string, string>> = {
  Mercury: {
    Gemini: 'domicile',
    Virgo: 'domicile and exaltation',
    Sagittarius: 'detriment',
    Pisces: 'detriment and fall',
  },
  Venus: {
    Taurus: 'domicile',
    Libra: 'domicile',
    Pisces: 'exaltation',
    Aries: 'detriment',
    Scorpio: 'detriment',
    Virgo: 'fall',
  },
  Mars: {
    Aries: 'domicile',
    Scorpio: 'domicile',
    Capricorn: 'exaltation',
    Taurus: 'detriment',
    Libra: 'detriment',
    Cancer: 'fall',
  },
  Jupiter: {
    Sagittarius: 'domicile',
    Pisces: 'domicile',
    Cancer: 'exaltation',
    Gemini: 'detriment',
    Virgo: 'detriment',
    Capricorn: 'fall',
  },
  Saturn: {
    Capricorn: 'domicile',
    Aquarius: 'domicile',
    Libra: 'exaltation',
    Cancer: 'detriment',
    Leo: 'detriment',
    Aries: 'fall',
  },
  Sun: {
    Leo: 'domicile',
    Aries: 'exaltation',
    Aquarius: 'detriment',
    Libra: 'fall',
  },
  Moon: {
    Cancer: 'domicile',
    Taurus: 'exaltation',
    Capricorn: 'detriment',
    Scorpio: 'fall',
  },
};

function getDignityNote(planet: string, sign: string): string | null {
  const dignities = PLANET_DIGNITY[planet];
  if (!dignities || !dignities[sign]) return null;
  const dignity = dignities[sign];
  if (dignity.includes('detriment') || dignity.includes('fall')) {
    return `${planet} is in its ${dignity} in ${sign}, meaning it operates at its weakest here`;
  }
  if (dignity.includes('domicile') || dignity.includes('exaltation')) {
    return `${planet} is in its ${dignity} in ${sign}, meaning it operates at full strength here`;
  }
  return null;
}

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
  /** Optional reference to the source CalendarEvent for rarity/historical context */
  calendarEvent?: CalendarEvent;
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
 *
 * Integrates with the Event Calendar for CRITICAL/HIGH events
 * (sabbats, rare ingresses, convergence days) alongside existing detection.
 */
async function buildCosmicEvents(
  dateStr: string,
  slotHour: number,
): Promise<CosmicEvent[]> {
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
      generate: (rng) => {
        // Conversation-starting questions that reward replies over likes
        const engagementPrompts = [
          `Where does ${transit.toSign} fall in your chart?`,
          `Which house does ${transit.toSign} rule for you?`,
          `What are you feeling as ${transit.planet} shifts?`,
          `Has anyone else noticed the energy change?`,
          `Drop your rising sign below`,
        ];

        if (transit.hoursUntil > 12) {
          const bodies = [
            'This kind of shift changes the energy for weeks. Pay attention to what starts to surface.',
            'Slow-moving planets do not change sign often. When they do, things actually shift.',
            'The pressure you have been feeling is about to make more sense.',
            'Energy is already building around this. You might feel it before you can name it.',
          ];
          return {
            hook: `${transit.planet} moves into ${transit.toSign} tomorrow`,
            body: bodies[Math.floor(rng() * bodies.length)],
            prompt:
              engagementPrompts[Math.floor(rng() * engagementPrompts.length)],
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
            prompt:
              engagementPrompts[Math.floor(rng() * engagementPrompts.length)],
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
            prompt:
              engagementPrompts[Math.floor(rng() * engagementPrompts.length)],
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
      generate: (rng) => {
        const season = ZODIAC_SEASON_NAMES[sunSign] || `${sunSign} season`;

        // Sign-specific context: what this season is actually about
        const seasonContext: Record<string, string> = {
          Aries:
            'Aries is cardinal fire. The energy turns direct, initiating, and impatient. New projects, fresh starts, and bold moves feel natural now.',
          Taurus:
            'Taurus is fixed earth. The pace slows down. Comfort, security, and what you actually value take centre stage for the next 30 days.',
          Gemini:
            'Gemini is mutable air. Curiosity spikes. Conversations multiply. The collective mind wants variety, connection, and new information.',
          Cancer:
            'Cancer is cardinal water. The focus turns inward to home, family, and emotional foundations. What you need to feel safe surfaces now.',
          Leo: 'Leo is fixed fire. Self-expression, creativity, and visibility take the lead. The collective energy becomes warmer and more generous.',
          Virgo:
            'Virgo is mutable earth. The party winds down. Systems, health, and getting things in order take priority for the next 30 days.',
          Libra:
            'Libra is cardinal air. Relationships, fairness, and aesthetics move to the foreground. What is out of balance becomes obvious.',
          Scorpio:
            'Scorpio is fixed water. The surface level stops being enough. Depth, honesty, and transformation define the next 30 days.',
          Sagittarius:
            'Sagittarius is mutable fire. The mood lifts. Travel, big questions, and a hunger for meaning replace the intensity of Scorpio season.',
          Capricorn:
            'Capricorn is cardinal earth. Ambition, structure, and long-term goals demand attention. The collective mood becomes serious and disciplined.',
          Aquarius:
            'Aquarius is fixed air. Community, innovation, and doing things differently take priority. The collective pushes against the status quo.',
          Pisces:
            'Pisces is mutable water. Boundaries soften. Intuition sharpens. The collective energy becomes more empathic, creative, and spiritually attuned.',
        };

        const context =
          seasonContext[sunSign] ||
          `${sunSign} energy reshapes the collective mood for the next 30 days.`;

        const prompts = [
          `What are you bringing into ${season}?`,
          `How does ${sunSign} energy show up in your life?`,
          `What did ${ZODIAC_SEASON_NAMES[yesterdaySunSign]} teach you?`,
        ];
        return {
          hook: `${season} starts today`,
          body: context,
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
        generate: (rng) => {
          const rules = PLANET_RULES[planet] || 'its domain';
          const dignityNote = getDignityNote(planet, pos.sign);
          const bodies = dignityNote
            ? [
                `${planet} rules ${rules}. ${dignityNote}. Retrograde here intensifies the difficulty.`,
                `${dignityNote}. A retrograde in this sign means the usual disruptions hit harder than normal.`,
                `${planet} governs ${rules}. In ${pos.sign}, it is already working at a disadvantage, and now it is retrograde on top of that.`,
              ]
            : [
                `${planet} rules ${rules}. All of that is up for review now. Expect delays, revisions, and second thoughts in these areas.`,
                `${planet} retrograde in ${pos.sign} asks you to slow down and reconsider everything related to ${rules}.`,
                `${planet} governs ${rules}. Retrograde does not break these things, it forces you to revisit them properly.`,
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
        generate: (rng) => {
          const rules = PLANET_RULES[planet] || 'its domain';
          const dignityNote = getDignityNote(planet, pos.sign);
          const capRules = rules.charAt(0).toUpperCase() + rules.slice(1);
          const bodies = dignityNote
            ? [
                `${dignityNote}. The retrograde is over. ${capRules} start to unstick.`,
                `${planet} retrogrades in its weakest sign. Direct now. Clarity returns but the shadow period lasts another week or two.`,
              ]
            : [
                `${planet} rules ${rules}. The review period is over. What was stuck starts moving forward.`,
                `Momentum returns to ${rules}. ${planet} stations direct and the fog lifts.`,
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

  // --- 3b. Retrograde countdown (X days until direct station) ---
  for (const planet of NOTABLE_PLANETS) {
    const pos = positions[planet];
    if (!pos || !pos.retrograde || pos.newRetrograde || pos.newDirect) continue;

    // Check if this planet goes direct within the next 1-5 days
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const futureDate = new Date(postDate);
      futureDate.setDate(futureDate.getDate() + dayOffset);
      const futurePositions = getRealPlanetaryPositions(
        futureDate,
        DEFAULT_OBSERVER,
      );
      const futurePos = futurePositions[planet];

      if (futurePos && !futurePos.retrograde) {
        // This planet goes direct in `dayOffset` days
        events.push({
          priority: 82 + (5 - dayOffset), // Closer = higher priority
          type: 'retrograde_countdown',
          generate: (rng) => {
            const rules = PLANET_RULES[planet] || 'its domain';
            const dignityNote = getDignityNote(planet, pos.sign);
            const dayWord =
              dayOffset === 1 ? 'tomorrow' : `in ${dayOffset} days`;

            // Different angle per dayOffset so consecutive days don't repeat
            let body: string;
            if (dayOffset <= 2) {
              // Close to direct: focus on what changes
              body = dignityNote
                ? `${dignityNote}. Direct station ${dayWord}. The fog around ${rules} starts to lift.`
                : `${planet} rules ${rules}. Direct station ${dayWord}. What was stuck starts to move again.`;
            } else if (dayOffset <= 3) {
              // Mid countdown: focus on the review
              body = dignityNote
                ? `${dignityNote}. The retrograde forced a review of ${rules}. ${dayOffset} days until that pressure eases.`
                : `${planet} retrograde in ${pos.sign} revisited ${rules}. ${dayOffset} days until it stations direct.`;
            } else {
              // Early countdown: set the scene
              body = dignityNote
                ? `${dignityNote}. ${planet} stations direct ${dayWord}. Use the remaining days to finish the review.`
                : `${planet} retrograde in ${pos.sign} ends ${dayWord}. Wrap up any unfinished business around ${rules}.`;
            }

            // Index by dayOffset so consecutive days always get a different prompt
            const prompts = [
              `What has this ${planet} retrograde brought up for you?`,
              `What are you ready to move forward on after ${planet} goes direct?`,
              `Has ${planet} retrograde changed anything for you?`,
              `What is ${planet} retrograde forcing you to revisit?`,
              `Anyone else feeling ${planet} retrograde right now?`,
            ];

            return {
              hook: `${planet} goes direct ${dayWord}`,
              body,
              prompt: prompts[dayOffset % prompts.length],
              topicTag: 'Astrology',
            };
          },
        });
        break; // Only add one countdown per planet
      }
    }
  }

  // --- 3c. Retrograde sign re-entry (planet backing into previous sign) ---
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
      generate: (rng) => {
        // Sign-specific emotional context
        const moonContext: Record<string, string> = {
          Aries:
            'Moon in Aries wants action, not deliberation. Emotions flash hot and fast. Patience drops. The instinct is to start something, fix something, or fight something.',
          Taurus:
            'Moon in Taurus craves comfort and routine. Emotions stabilise. You want good food, familiar surroundings, and no surprises for the next couple of days.',
          Gemini:
            'Moon in Gemini makes the mind restless. Emotions process through talking. You want stimulation, conversation, and variety.',
          Cancer:
            'Moon in Cancer is the Moon at home. Emotions run deep and protective. Family, nostalgia, and the need to feel safe become loud.',
          Leo: 'Moon in Leo wants to be seen. Emotions become dramatic and generous. Creativity spikes. The need for recognition and warmth is real.',
          Virgo:
            'Moon in Virgo turns emotions into problem-solving. The instinct is to fix, organise, and improve. Anxiety shows up as over-analysis.',
          Libra:
            'Moon in Libra needs harmony. Conflict feels unbearable. The instinct is to smooth things over, seek balance, and avoid being alone.',
          Scorpio:
            'Moon in Scorpio intensifies everything. Emotions go deep and private. Surface-level interactions feel pointless. Trust issues surface.',
          Sagittarius:
            'Moon in Sagittarius lightens the mood. The emotional need is for freedom, meaning, and something to look forward to.',
          Capricorn:
            'Moon in Capricorn suppresses vulnerability. Emotions get channelled into productivity. The instinct is to push through, not process.',
          Aquarius:
            'Moon in Aquarius detaches from emotion to observe it. The instinct is to intellectualise feelings. Community matters more than intimacy.',
          Pisces:
            'Moon in Pisces dissolves boundaries. Emotions absorb from everyone around you. Intuition sharpens but so does overwhelm.',
        };

        const body =
          moonContext[moonSign] ||
          `The emotional tone shifts to ${moonSign}. Your instincts, reactions, and needs take on different qualities.`;
        const prompts = [
          `How does Moon in ${moonSign} feel for you?`,
          `What does ${moonSign} Moon bring up?`,
          `Notice a shift in your mood today?`,
        ];
        return {
          hook: `The Moon moves into ${moonSign} today`,
          body,
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
          generate: (rng) => {
            const list =
              notable.length <= 4
                ? notable.slice(0, -1).join(', ') +
                  ' and ' +
                  notable[notable.length - 1]
                : `${notable.length} planets`;

            // Build a meaningful description of what this combination rules
            const rulesDescriptions = notable
              .map((p) => PLANET_RULES[p])
              .filter(Boolean);
            const combinedRules =
              rulesDescriptions.length > 0
                ? rulesDescriptions.slice(0, 3).join('; ')
                : 'multiple areas of life';

            // Sign-specific stellium context
            const signFlavour: Record<string, string> = {
              Aries:
                'Action, identity, and new beginnings are all activated at once. Impatience and initiative spike.',
              Taurus:
                'Security, comfort, and finances are all demanding attention simultaneously.',
              Gemini:
                'Communication, curiosity, and social connections are all firing at once.',
              Cancer:
                'Home, family, and emotional security are all being activated together.',
              Leo: 'Self-expression, creativity, and recognition are all concentrated in one place.',
              Virgo:
                'Health, routine, and detailed work are all under the spotlight together.',
              Libra:
                'Relationships, fairness, and aesthetics are all being activated at once.',
              Scorpio:
                'Intensity, transformation, and hidden truths are all surfacing together.',
              Sagittarius:
                'Adventure, meaning, and big-picture thinking are all concentrated in one place.',
              Capricorn:
                'Ambition, structure, and long-term goals are all demanding attention at once.',
              Aquarius:
                'Community, innovation, and independence are all being activated together.',
              Pisces:
                'Intuition, empathy, and creativity are all flooding in at once. Boundaries blur.',
            };
            const flavour =
              signFlavour[sign] ||
              `${sign} themes dominate. Check which house it rules in your chart.`;

            const bodies = [
              `That is a stellium. ${flavour}`,
              `${notable.length} planets concentrated in ${sign}. ${flavour}`,
            ];
            const prompts = [
              `Which ${sign} themes are showing up strongest for you?`,
              `Can you feel ${sign} running the show right now?`,
              `Are you feeling the ${sign} weight or riding it?`,
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
  const aspectNames = ['conjunction', 'opposition', 'square', 'trine'];
  const tightAspects = aspects.filter(
    (a) => a.separation <= 2 && aspectNames.includes(a.aspect),
  );

  for (const aspect of tightAspects.slice(0, 2)) {
    // planetA/planetB are strings (planet names), not objects
    const pA =
      (typeof aspect.planetA === 'string'
        ? aspect.planetA
        : aspect.planetA?.name) || 'unknown';
    const pB =
      (typeof aspect.planetB === 'string'
        ? aspect.planetB
        : aspect.planetB?.name) || 'unknown';

    // Skip Moon aspects (too frequent) unless it's a conjunction with an outer planet
    const isMoonAspect = pA === 'Moon' || pB === 'Moon';
    if (isMoonAspect && aspect.aspect !== 'conjunction') continue;

    // Look up signs from the positions data
    const signA = positions[pA]?.sign || '';
    const signB = positions[pB]?.sign || '';
    const signContext =
      signA && signB && signA !== signB
        ? ` ${pA} in ${signA}, ${pB} in ${signB}.`
        : signA
          ? ` Both in ${signA}.`
          : '';

    events.push({
      priority: 65 + (10 - aspect.separation) * 2,
      type: 'tight_aspect',
      generate: (rng) => {
        const rulesA = PLANET_RULES[pA] || pA;
        const rulesB = PLANET_RULES[pB] || pB;

        // Bodies kept under ~190 chars to avoid truncation
        const aspectDescriptions: Record<string, string[]> = {
          conjunction: [
            `${pA} (${rulesA}) meets ${pB} (${rulesB}).${signContext} Both domains activate at once.`,
            `${pA} and ${pB} fuse into one signal.${signContext} ${rulesA} and ${rulesB} become inseparable.`,
          ],
          opposition: [
            `${pA} (${rulesA}) opposes ${pB} (${rulesB}).${signContext} Neither side can be ignored.`,
            `Tension between ${rulesA} and ${rulesB}.${signContext} The challenge is holding both.`,
          ],
          square: [
            `${pA} (${rulesA}) squares ${pB} (${rulesB}).${signContext} Friction that forces a decision.`,
            `Pressure between ${rulesA} and ${rulesB}.${signContext} Something has to give.`,
          ],
          trine: [
            `${pA} (${rulesA}) trines ${pB} (${rulesB}).${signContext} Natural flow between these areas.`,
            `${rulesA} and ${rulesB} connect effortlessly.${signContext} Use it while it lasts.`,
          ],
        };
        const bodies = aspectDescriptions[aspect.aspect] || [
          `${pA} and ${pB} form a significant alignment.${signContext}`,
        ];

        const prompts = [
          `How are you feeling ${pA}-${pB} energy today?`,
          signA
            ? `Where does ${signA} fall in your chart?`
            : `Drop your rising sign below`,
          `What is this bringing up for you?`,
        ];

        return {
          hook: `${pA} ${aspect.aspect} ${pB} is exact today`,
          body: bodies[Math.floor(rng() * bodies.length)],
          prompt: prompts[Math.floor(rng() * prompts.length)],
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

  // --- 11. Event Calendar integration (sabbats, rare ingresses, convergence) ---
  // Supplements existing detection with scored calendar events.
  // CRITICAL events (score >= 90) get priority 105+, HIGH events (score >= 60) get 92.
  try {
    const calendarEvents = await getEventCalendarForDate(dateStr);

    // Track which event types the existing detection already covers
    // to avoid duplicating ingress/retrograde/moon events
    const existingTypes = new Set(events.map((e) => e.type));

    for (const calEvent of calendarEvents) {
      // Skip LOW/MEDIUM events the existing pipeline already handles well
      if (calEvent.score < 60) continue;

      // Skip event types already detected by the existing pipeline
      // (ingress is handled above, retrograde stations too, moon phases too)
      if (
        calEvent.eventType === 'ingress' &&
        existingTypes.has('planetary_ingress')
      ) {
        // For CRITICAL or HIGH ingresses with rarity framing,
        // upgrade the existing ingress event's priority and enhance its hook.
        // CRITICAL (score >= 90): priority 105+ (above max 100 for generic ingress)
        // HIGH (score >= 60): priority stays 100 but gets rarity-enriched content
        if (calEvent.score >= 60 && calEvent.rarityFrame) {
          const existingIngress = events.find(
            (e) => e.type === 'planetary_ingress',
          );
          if (existingIngress) {
            if (calEvent.score >= 90) {
              existingIngress.priority = 105;
            }
            existingIngress.calendarEvent = calEvent;
            // Wrap the existing generate to use rarity-enriched hooks
            const originalGenerate = existingIngress.generate;
            existingIngress.generate = (rng) => {
              const original = originalGenerate(rng);

              // Use convergence narrative when multiple HIGH+ events align
              if (
                calEvent.convergenceMultiplier >= 1.5 &&
                calEvent.hookSuggestions.length > 0
              ) {
                const convergenceHook =
                  calEvent.hookSuggestions[calEvent.hookSuggestions.length - 1];
                if (convergenceHook.length <= 80) {
                  original.hook = convergenceHook;
                }
              } else if (calEvent.hookSuggestions.length > 0) {
                // Even without convergence, use the calendar's rarity-aware hooks
                // instead of generic "[Planet] moves into [Sign] tomorrow" framing.
                // Pick from shorter hooks that fit the 80-char limit.
                const shortHooks = calEvent.hookSuggestions.filter(
                  (h) => h.length <= 80,
                );
                if (shortHooks.length > 0) {
                  original.hook =
                    shortHooks[Math.floor(rng() * shortHooks.length)];
                }
              }

              // Enrich body with rarity framing
              if (calEvent.rarityFrame) {
                original.body = `${calEvent.rarityFrame}. ${original.body}`;
              }
              // Add historical context when available
              if (calEvent.historicalContext) {
                original.body = `${original.body} Theme: ${calEvent.historicalContext}.`;
              }
              // Use rarity-enriched prompts for engagement
              if (calEvent.lastInThisSign) {
                original.prompt = `First time since ${calEvent.lastInThisSign}. ${original.prompt}`;
              } else if (
                calEvent.orbitalPeriodYears &&
                calEvent.orbitalPeriodYears >= 10
              ) {
                // For slower planets without exact lastInThisSign data,
                // use orbital period framing for engagement
                original.prompt = `This only happens every ~${Math.round(calEvent.orbitalPeriodYears)} years. ${original.prompt}`;
              }
              return original;
            };
          }
        }
        continue;
      }

      if (
        calEvent.eventType === 'retrograde_station' &&
        (existingTypes.has('retrograde_station') ||
          existingTypes.has('direct_station'))
      ) {
        continue;
      }

      // Active retrogrades are already covered by retrograde/countdown detection.
      // Enrich the existing event with calendar context instead of duplicating.
      if (
        calEvent.eventType === 'active_retrograde' &&
        (existingTypes.has('retrograde_station') ||
          existingTypes.has('direct_station') ||
          existingTypes.has('retrograde_countdown') ||
          existingTypes.has('retrograde_reentry'))
      ) {
        // Find the existing retrograde event and enrich it with sign context
        const existingRetro = events.find(
          (e) =>
            e.type === 'retrograde_countdown' ||
            e.type === 'retrograde_reentry' ||
            e.type === 'retrograde_station' ||
            e.type === 'direct_station',
        );
        // Don't override — the countdown/station bodies already vary by dayOffset
        // and include dignity notes. Calendar enrichment would make consecutive days
        // identical. Let the existing templates handle the content variety.
        continue;
      }

      // Aspects are already covered by tight_aspect detection with better bodies.
      // The tight_aspect templates include planet rules, sign context, and aspect meaning.
      // Calendar rarityFrame for aspects ("exact within X°") is jargon — skip it.
      if (
        calEvent.eventType === 'aspect' &&
        existingTypes.has('tight_aspect')
      ) {
        continue;
      }

      if (
        calEvent.eventType === 'moon_phase' &&
        existingTypes.has('moon_phase_change')
      ) {
        continue;
      }

      if (
        calEvent.eventType === 'moon_sign_change' &&
        existingTypes.has('moon_sign_change')
      ) {
        continue;
      }

      if (calEvent.eventType === 'stellium' && existingTypes.has('stellium')) {
        continue;
      }

      // Determine priority based on score
      let priority: number;
      if (calEvent.score >= 90) {
        // CRITICAL events: above the current max of 100 for ingress
        priority = 105 + Math.min(calEvent.score - 90, 10);
      } else if (calEvent.score >= 60) {
        // HIGH events: between ingress=100 and zodiac_season=95
        priority = 92;
      } else {
        priority = 80;
      }

      // Map calendar event types to Threads-compatible types
      const typeMap: Record<string, string> = {
        sabbat: 'sabbat',
        equinox: 'sabbat',
        solstice: 'sabbat',
        eclipse: 'calendar_eclipse',
        aspect: 'calendar_aspect',
        ingress: 'calendar_ingress',
        active_retrograde: 'calendar_retrograde',
      };
      const cosmicType =
        typeMap[calEvent.eventType] || `calendar_${calEvent.eventType}`;

      events.push({
        priority,
        type: cosmicType,
        calendarEvent: calEvent,
        generate: (rng) => {
          // Use the calendar event's pre-built hook suggestions
          const hookPool = calEvent.hookSuggestions.filter(
            (h) => h.length <= 80,
          );
          const hook =
            hookPool.length > 0
              ? hookPool[Math.floor(rng() * hookPool.length)]
              : calEvent.name;

          // Build body: historicalContext is the substance, rarityFrame is the framing.
          // Never use rarityFrame alone as body — it's a label, not content.
          let body: string;
          if (calEvent.historicalContext && calEvent.rarityFrame) {
            // Combine rarity framing with substantive context
            body = `${calEvent.rarityFrame}. ${calEvent.historicalContext}`;
          } else if (calEvent.historicalContext) {
            body = calEvent.historicalContext;
          } else if (calEvent.sabbatData?.description) {
            // Sabbat descriptions can be long — truncate at a sentence boundary
            const desc = calEvent.sabbatData.description;
            if (desc.length <= 190) {
              body = desc;
            } else {
              const cut = desc.slice(0, 190).lastIndexOf('.');
              body = cut > 60 ? desc.slice(0, cut + 1) : desc.slice(0, 190);
            }
          } else if (calEvent.rarityFrame) {
            // Last resort: at least frame it as context, not a dead label
            body = `${calEvent.rarityFrame}. Pay attention to what shifts.`;
          } else {
            body = `${calEvent.name}. The energy shifts today.`;
          }

          // Engagement-first prompts (algorithm rewards replies > likes)
          const defaultPrompts = [
            `How are you feeling this shift?`,
            `What is this bringing up for you?`,
            `Drop your sign below`,
          ];
          const sabbatPrompts = calEvent.sabbatData
            ? [
                `How are you marking ${calEvent.name}?`,
                `What are you releasing this ${calEvent.name}?`,
                `What ritual feels right for ${calEvent.name}?`,
              ]
            : [];
          const ingressPrompts =
            calEvent.planet && calEvent.sign
              ? [
                  `Where does ${calEvent.sign} fall in your chart?`,
                  `Which house does ${calEvent.sign} rule for you?`,
                  `What are you feeling as ${calEvent.planet} shifts?`,
                ]
              : [];

          const promptPool = [
            ...sabbatPrompts,
            ...ingressPrompts,
            ...defaultPrompts,
          ];
          const prompt = promptPool[Math.floor(rng() * promptPool.length)];

          // Topic tag mapping
          const tagMap: Record<string, string> = {
            sabbat: 'Spirituality',
            equinox: 'Astrology',
            solstice: 'Astrology',
            eclipse: 'Astrology',
            transit: 'Astrology',
            retrograde: 'Astrology',
            moon: 'Moon',
            aspect: 'Astrology',
          };
          const topicTag = tagMap[calEvent.category] || 'Astrology';

          return { hook, body, prompt, topicTag };
        },
      });
    }
  } catch {
    // Event calendar can throw on edge cases -- degrade gracefully,
    // the existing detection continues to work without it.
  }

  return events.sort((a, b) => b.priority - a.priority);
}

/**
 * Collect the top N event types that were (or would have been) used on a given day.
 * Since buildCosmicEvents is deterministic, we can replay previous days cheaply.
 */
async function getRecentEventTypes(
  dateStr: string,
  slotHour: number,
  lookbackDays: number = 2,
): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  const baseDate = new Date(dateStr);

  for (let d = 1; d <= lookbackDays; d++) {
    const pastDate = new Date(baseDate);
    pastDate.setDate(pastDate.getDate() - d);
    const pastStr = pastDate.toISOString().split('T')[0];

    // Check all 3 cosmic slots for each past day
    const pastEvents = await buildCosmicEvents(pastStr, slotHour);
    // The top 3 events are what would have been posted
    for (let rank = 0; rank < Math.min(3, pastEvents.length); rank++) {
      const type = pastEvents[rank].type;
      counts.set(type, (counts.get(type) || 0) + 1);
    }
  }

  return counts;
}

/**
 * Remove events that appeared in the last 2 days entirely.
 * No same event type should repeat within a 3-day window.
 *
 * Exceptions:
 * - Time-sensitive events (ingress, retrograde stations, countdowns, direct stations,
 *   season changes, sabbats, eclipses) are NEVER filtered — they're the story of the day.
 * - If removing everything leaves nothing, keep fallbacks as a safety net.
 */
function removeStaleSameTypeEvents(
  events: CosmicEvent[],
  recentTypes: Map<string, number>,
): CosmicEvent[] {
  // These event types are time-sensitive and must always appear when active
  const timeSensitiveTypes = new Set([
    'planetary_ingress',
    'retrograde_station',
    'direct_station',
    'retrograde_countdown',
    'retrograde_reentry',
    'zodiac_season',
    'season_countdown',
    'moon_phase_change',
    'moon_sign_change',
    'sabbat',
    'calendar_eclipse',
  ]);

  const fresh = events.filter(
    (e) => timeSensitiveTypes.has(e.type) || !recentTypes.has(e.type),
  );

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
  const rawEvents = await buildCosmicEvents(dateStr, slotHour);

  // Remove any event type that was used in the last 2 days — no repeats in a 3-day window
  const recentTypes = await getRecentEventTypes(dateStr, slotHour);
  const events = removeStaleSameTypeEvents(rawEvents, recentTypes);

  // Pick the Nth ranked event (fall back to last if rank exceeds list)
  const eventIndex = Math.min(rank, events.length - 1);
  const event = events[eventIndex];
  const content = event.generate(rng);

  // Transit-specific hooks must never be overridden by generic orbit suggestions.
  // Cosmic timing posts are tied to real astronomical events — replacing their hooks
  // with unrelated orbit-suggested hooks breaks the content–transit link.
  const hook = content.hook;

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
export async function getCosmicEventCount(
  dateStr: string,
  slotHour: number,
): Promise<number> {
  const events = await buildCosmicEvents(dateStr, slotHour);
  // Only count events with priority above the fallback threshold (planet spotlight / moon position)
  return events.filter((e) => e.priority > 30).length;
}

/**
 * Returns the type of event that a given rank will generate for dedup purposes.
 * Used by the orchestrator to avoid duplicate transit content across slots.
 */
export async function getCosmicTimingEventType(
  dateStr: string,
  slotHour: number,
  rank: number = 0,
): Promise<string> {
  const events = await buildCosmicEvents(dateStr, slotHour);
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
