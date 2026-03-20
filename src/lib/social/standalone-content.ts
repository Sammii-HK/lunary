/**
 * Standalone Content Generator for Bluesky
 *
 * Generates platform-specific standalone posts (no series framing).
 * Research findings:
 * - Bluesky: Authentic conversational tone. 1-2x/day.
 *
 * Content mix:
 * - Bluesky: 50% facts, 30% questions, 20% observations/reflections
 *
 * Transit awareness:
 * - CRITICAL events: skip standalone entirely (transit content takes priority)
 * - HIGH events: reduce to 1 post, inject transit context
 * - MEDIUM events: inject transit context where natural
 * - LOW / none: normal rotation
 */

import { FACT_POOLS } from '@/lib/instagram/did-you-know-content';
import { seededRandom } from '@/lib/instagram/ig-utils';
import type { ThemeCategory } from '@/lib/social/types';
import {
  getEventCalendarForDate,
  type CalendarEvent,
  type EventRarity,
} from '@/lib/astro/event-calendar';

const CATEGORIES: ThemeCategory[] = [
  'tarot',
  'crystals',
  'spells',
  'numerology',
  'runes',
  'chakras',
  'zodiac',
];

// Engaging questions by category
const QUESTION_POOLS: Record<string, string[]> = {
  tarot: [
    'What tarot card do you pull most often?',
    'Have you ever pulled The Tower and been grateful for it?',
    "What card scares you the most? (It probably shouldn't.)",
    'Reversals: do you read them or not?',
    "What was the most accurate reading you've ever done?",
    'Which Major Arcana card describes your current chapter?',
    'Three-card spread or Celtic Cross? And why?',
    'What card keeps showing up for you lately?',
  ],
  crystals: [
    'What crystal do you carry every day?',
    'Clear quartz or amethyst for beginners?',
    'Do you cleanse your crystals under the full moon?',
    'Which crystal surprised you with how powerful it felt?',
    'Selenite or black tourmaline for protection?',
    "What's the most underrated crystal you own?",
    'Do you programme your crystals with intentions?',
    'What crystal do you sleep with under your pillow?',
  ],
  spells: [
    'What was the first spell you ever cast?',
    'Bay leaf manifestation: have you tried it?',
    'Moon water under a full moon or new moon?',
    'Do you believe in freezer spells?',
    "What's your go-to protection ritual?",
    'Candle magic: what colour do you reach for most?',
    'Do you keep a spell journal?',
    'What spell changed your perspective on magic?',
  ],
  numerology: [
    "What's your Life Path number?",
    'Do you see 11:11 constantly? What does it mean to you?',
    'Which angel number follows you everywhere?',
    'Master numbers: do you feel the intensity?',
    '222, 333, or 444 — which one resonates most?',
    'Do you check your Personal Year number?',
    'What number keeps appearing in your life right now?',
    'Has learning your Life Path number changed anything for you?',
  ],
  runes: [
    'Do you draw a daily rune?',
    'Elder Futhark or Younger Futhark?',
    'Which rune do you connect with most?',
    'Have you ever carved your own rune set?',
    'Merkstave (reversed runes): do you read them?',
    'What rune would you tattoo?',
    'Do you use runes for divination or meditation?',
    'Which rune surprised you with its accuracy?',
  ],
  chakras: [
    'Which chakra do you struggle with most?',
    'Root or Crown: which needs more attention right now?',
    'Do you feel your Throat Chakra blocks when stressed?',
    'What do you do when your Solar Plexus feels off?',
    'Heart Chakra open or guarded right now?',
    'Do you meditate on specific chakras?',
    'Which chakra did you unblock and everything shifted?',
    'What physical symptom tipped you off to a blocked chakra?',
  ],
  zodiac: [
    "What's your Big Three? Sun, Moon, Rising.",
    'Mercury retrograde: do you feel it or is it overblown?',
    'Which zodiac sign do you get along with least?',
    'Do you check your horoscope daily or weekly?',
    "What's the most misunderstood sign?",
    'Does your Moon sign explain more about you than your Sun?',
    "Which planet's placement in your chart surprised you most?",
    'Fire, Earth, Air, or Water dominant in your chart?',
  ],
};

// Bluesky observation/reflection templates (authentic, conversational)
const OBSERVATION_POOLS: Record<string, string[]> = {
  tarot: [
    "Something I love about tarot: it doesn't tell you what to do. It shows you what you already know.",
    'The cards that make you uncomfortable are doing the most important work.',
    'I used to think tarot was about predicting the future. Now I see it as a mirror for the present.',
    'Every reading is a conversation with yourself. The cards just help you listen.',
  ],
  crystals: [
    "There's something grounding about holding a stone that's millions of years old. Perspective in your palm.",
    'I notice I reach for different crystals depending on the season. The body knows what it needs.',
    "The crystal you're drawn to in the shop is usually the one you need. Trust that impulse.",
    'Collecting crystals taught me that beauty and utility are not separate things.',
  ],
  spells: [
    'The most magical thing about ritual is that it makes you slow down and be intentional.',
    'I think everyone does magic. They just call it "morning routine" or "vision board".',
    'Writing an intention on paper and burning it sounds simple. The simplest things are often the most powerful.',
    'Spellwork taught me that energy follows attention. Whatever you focus on, grows.',
  ],
  numerology: [
    'Once you learn numerology, you start seeing patterns everywhere. It changes how you read the world.',
    'I find it fascinating that Pythagoras treated numbers as sacred. Maths and mysticism were the same thing to him.',
    'The number that keeps appearing in your life is not random. Pay attention to it.',
    'Personal Year cycles helped me understand why some years feel harder than others. Context is everything.',
  ],
  runes: [
    "Drawing a daily rune is one of the simplest practices I know. One symbol, one reflection. That's it.",
    'The Norse understood something modern productivity culture misses: sometimes stillness is the strategy.',
    'Runes remind me that ancient people faced the same uncertainties we do. They just had different tools.',
    "There's something powerful about a symbol system where each character carries a complete concept.",
  ],
  chakras: [
    'The chakra system is essentially a body scan with thousands of years of refinement. Not bad for ancient tech.',
    'I keep coming back to the idea that the Heart Chakra sits exactly in the middle. The bridge between physical and spiritual.',
    'Noticing where tension sits in your body is the first step to understanding your energy. The chakra map makes this easier.',
    'The chakra you neglect is usually the one running the show from the shadows.',
  ],
  zodiac: [
    'Learning about my Moon sign explained more about my inner life than years of self-help books.',
    "Astrology is at its best when it's used for self-understanding, not prediction.",
    'I find it endlessly fascinating that the same sky looks different from every birth chart. Same cosmos, unique perspective.',
    'The houses in your birth chart are like rooms in a house. You spend more time in some than others.',
  ],
};

export interface StandalonePost {
  content: string;
  category: ThemeCategory;
  postType: 'fact' | 'question' | 'observation';
  source?: string;
  scheduledHour: number;
}

// Bluesky posting hours (UTC): 1-2x daily
const BLUESKY_HOURS = [10, 16];

/** Rarity priority order for sorting/comparison */
const RARITY_PRIORITY: Record<EventRarity, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/**
 * Get the highest-rarity event from a list of calendar events.
 */
function getHighestRarityEvent(
  events: CalendarEvent[],
): CalendarEvent | undefined {
  if (events.length === 0) return undefined;
  return events.reduce((highest, current) =>
    RARITY_PRIORITY[current.rarity] > RARITY_PRIORITY[highest.rarity]
      ? current
      : highest,
  );
}

/**
 * Get the highest rarity level present in a list of events.
 * Returns 'LOW' as default when no events exist.
 */
function getHighestRarity(events: CalendarEvent[]): EventRarity {
  const top = getHighestRarityEvent(events);
  return top?.rarity ?? 'LOW';
}

/**
 * Inject transit context into standalone content where it fits naturally.
 *
 * Only modifies observations and certain fact posts that mention energy,
 * vibes, shifts, or cosmic themes. Questions are left untouched to keep
 * them conversational.
 */
function injectTransitContext(
  content: string,
  postType: StandalonePost['postType'],
  event: CalendarEvent,
): string {
  // Don't modify questions -- keep them pure engagement hooks
  if (postType === 'question') return content;

  // Only inject into content that touches on energy/cosmic themes
  const cosmicKeywords =
    /energy|vibe|shift|cosmos|cosmic|universe|power|intention|ritual|magic|season|cycle|phase|moment|time|change|transform/i;
  if (!cosmicKeywords.test(content)) return content;

  // Build a brief, natural transit reference
  const transitNote = buildTransitNote(event);
  if (!transitNote) return content;

  // Append the transit note before hashtags (hashtags are on the last line after \n\n)
  const hashtagSplit = content.lastIndexOf('\n\n#');
  if (hashtagSplit !== -1) {
    const body = content.slice(0, hashtagSplit);
    const tags = content.slice(hashtagSplit);
    return `${body}\n\n${transitNote}${tags}`;
  }

  // Fallback: just append
  return `${content}\n\n${transitNote}`;
}

/**
 * Build a brief, natural-sounding transit note from a calendar event.
 */
function buildTransitNote(event: CalendarEvent): string | null {
  const { eventType, name } = event;

  switch (eventType) {
    case 'retrograde_station':
      return `With ${name.includes('direct') ? name.replace(/stations?\s*/i, '').trim() + ' stationing direct' : name.replace(/stations?\s*/i, '').trim() + ' stationing retrograde'} today, that feeling has an astronomical basis.`;
    case 'ingress':
      return `${name} today -- a shift worth paying attention to.`;
    case 'moon_phase':
      return `Today's ${name.toLowerCase()} amplifies this energy.`;
    case 'eclipse':
      return `With ${name.toLowerCase()} today, this feels especially potent.`;
    case 'sabbat':
    case 'equinox':
    case 'solstice':
      return `${name} marks this turning point in the wheel of the year.`;
    case 'aspect':
      return `${name} today adds another layer to this.`;
    default:
      return null;
  }
}

function pickCategory(rng: () => number): ThemeCategory {
  return CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
}

export async function generateBlueskyPosts(
  dateStr: string,
): Promise<StandalonePost[]> {
  // --- Transit awareness: check what's happening today ---
  let events: CalendarEvent[] = [];
  try {
    events = await getEventCalendarForDate(dateStr);
  } catch (err) {
    // If event calendar fails, proceed with normal generation
    console.warn(
      '[standalone-content] Failed to fetch event calendar, proceeding normally:',
      err instanceof Error ? err.message : err,
    );
  }

  const highestRarity = getHighestRarity(events);
  const topEvent = getHighestRarityEvent(events);

  // CRITICAL: Skip standalone entirely -- transit content from other crons takes priority
  if (highestRarity === 'CRITICAL') {
    console.log(
      `[standalone-content] Skipping standalone generation: CRITICAL event today (${topEvent?.name ?? 'unknown'})`,
    );
    return [];
  }

  // HIGH: Reduce to 1 post instead of the usual 2
  const slotsToGenerate = highestRarity === 'HIGH' ? 1 : BLUESKY_HOURS.length;

  const posts: StandalonePost[] = [];

  for (let slot = 0; slot < slotsToGenerate; slot++) {
    const rng = seededRandom(`bluesky-${dateStr}-${slot}`);
    const category = pickCategory(rng);
    const roll = rng();

    let content: string;
    let postType: StandalonePost['postType'];
    let source: string | undefined;

    if (roll < 0.5) {
      // 50% educational facts (can be longer on Bluesky)
      const pool = FACT_POOLS[category] ?? FACT_POOLS.tarot;
      const entry = pool[Math.floor(rng() * pool.length)];
      content = entry.fact;
      postType = 'fact';
      source = entry.source;
    } else if (roll < 0.8) {
      // 30% questions (conversational tone)
      const questions = QUESTION_POOLS[category] ?? QUESTION_POOLS.tarot;
      content = questions[Math.floor(rng() * questions.length)];
      postType = 'question';
    } else {
      // 20% observations/reflections (authentic Bluesky voice)
      const observations =
        OBSERVATION_POOLS[category] ?? OBSERVATION_POOLS.tarot;
      content = observations[Math.floor(rng() * observations.length)];
      postType = 'observation';
    }

    // Inject transit context for MEDIUM+ events where natural
    if (topEvent && (highestRarity === 'HIGH' || highestRarity === 'MEDIUM')) {
      content = injectTransitContext(content, postType, topEvent);
    }

    // Add 3 structured discovery hashtags for Bluesky
    const baseTags: Record<string, string> = {
      zodiac: '#astrology #zodiac #birthchart',
      tarot: '#tarot #divination #tarotreading',
      crystals: '#crystals #healingcrystals #crystallove',
      numerology: '#numerology #angelnumbers #numbermystery',
      runes: '#runes #elderFuthark #norsemystic',
      chakras: '#chakras #energyhealing #chakrabalance',
      spells: '#witchcraft #spellwork #magick',
    };

    content = `${content}\n\n${baseTags[category] ?? '#spirituality #cosmic #mysticism'}`;

    posts.push({
      content,
      category,
      postType,
      source,
      scheduledHour: BLUESKY_HOURS[slot],
    });
  }

  return posts;
}
