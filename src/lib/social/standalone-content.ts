/**
 * Standalone Content Generator for Twitter and Bluesky
 *
 * Generates platform-specific standalone posts (no series framing).
 * Research findings:
 * - Twitter: Questions outperform statements 13-27x. 70-100 chars optimal.
 * - Bluesky: Authentic conversational tone, different from Twitter. 1-2x/day.
 *
 * Content mix:
 * - Twitter: 40% facts, 40% questions, 20% contrarian statements
 * - Bluesky: 50% facts, 30% questions, 20% observations/reflections
 */

import { FACT_POOLS } from '@/lib/instagram/did-you-know-content';
import { seededRandom } from '@/lib/instagram/ig-utils';
import type { ThemeCategory } from '@/lib/social/types';

const CATEGORIES: ThemeCategory[] = [
  'tarot',
  'crystals',
  'spells',
  'numerology',
  'runes',
  'chakras',
  'zodiac',
];

// Engaging questions by category (Twitter-optimised: short, punchy)
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

// Contrarian/surprising statements (Twitter-optimised: provocative but not mean)
const CONTRARIAN_POOLS: Record<string, string[]> = {
  tarot: [
    'The Death card is one of the most positive cards in the deck.',
    'Reading tarot for yourself is not less valid than paying someone.',
    "You don't need to be psychic to read tarot. You need to be honest.",
    'The "scary" cards are usually the most helpful ones.',
  ],
  crystals: [
    'The most expensive crystal is not always the most powerful one.',
    "You don't need 50 crystals. You need 3 that you actually use.",
    "Crystals don't do the work for you. They amplify what you bring.",
    'That crystal you keep losing? It might be done with you.',
  ],
  spells: [
    'The most powerful spell is the one you do consistently, not perfectly.',
    "You don't need fancy ingredients. Kitchen spices work just fine.",
    "Magic is not about control. It's about alignment.",
    'The hardest part of any spell is letting go of the outcome.',
  ],
  numerology: [
    '11:11 is not a coincidence. But you already knew that.',
    "Your Life Path number doesn't limit you. It challenges you.",
    "666 is not evil. It's a rebalancing message.",
    'Angel numbers mean more when you stop looking for them.',
  ],
  runes: [
    'Runes were never just an alphabet. They were always magic.',
    'The blank rune is not traditional. It was added in the 1980s.',
    'Viking leaders used rune casting the way CEOs use strategy consultants.',
    'Runes carved in the wrong direction still carry power. Intent matters.',
  ],
  chakras: [
    'An overactive chakra is just as problematic as a blocked one.',
    'You cannot "fix" your chakras once and be done forever.',
    'Your favourite chakra to work on is probably not the one that needs attention.',
    'Burnout is almost always a Root Chakra issue, not a Crown one.',
  ],
  zodiac: [
    'Your Sun sign is the least interesting part of your birth chart.',
    'Mercury retrograde affects everyone differently. Check your natal Mercury.',
    'Compatibility is about the full chart, not matching Sun signs.',
    'The most "difficult" placements produce the most interesting people.',
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
  postType: 'fact' | 'question' | 'contrarian' | 'observation';
  source?: string;
  scheduledHour: number;
}

// Twitter posting hours (UTC): spread across day for engagement
const TWITTER_HOURS = [9, 13, 18];
// Bluesky posting hours (UTC): 1-2x daily
const BLUESKY_HOURS = [10, 16];

function pickCategory(rng: () => number): ThemeCategory {
  return CATEGORIES[Math.floor(rng() * CATEGORIES.length)];
}

function trimToLength(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  // Find last sentence break within limit
  const trimmed = text.slice(0, maxLen);
  const lastPeriod = trimmed.lastIndexOf('.');
  if (lastPeriod > maxLen * 0.5) return trimmed.slice(0, lastPeriod + 1);
  return trimmed.slice(0, maxLen - 1) + '\u2026';
}

export function generateTwitterPosts(dateStr: string): StandalonePost[] {
  const posts: StandalonePost[] = [];

  for (let slot = 0; slot < TWITTER_HOURS.length; slot++) {
    const rng = seededRandom(`twitter-${dateStr}-${slot}`);
    const category = pickCategory(rng);
    const roll = rng();

    let content: string;
    let postType: StandalonePost['postType'];
    let source: string | undefined;

    if (roll < 0.4) {
      // 40% educational fact (trimmed to 70-100 chars)
      const pool = FACT_POOLS[category] ?? FACT_POOLS.tarot;
      const entry = pool[Math.floor(rng() * pool.length)];
      content = trimToLength(entry.fact, 100);
      postType = 'fact';
      source = entry.source;
    } else if (roll < 0.8) {
      // 40% questions
      const questions = QUESTION_POOLS[category] ?? QUESTION_POOLS.tarot;
      content = questions[Math.floor(rng() * questions.length)];
      postType = 'question';
    } else {
      // 20% contrarian
      const statements = CONTRARIAN_POOLS[category] ?? CONTRARIAN_POOLS.tarot;
      content = statements[Math.floor(rng() * statements.length)];
      postType = 'contrarian';
    }

    // Add 1-2 hashtags for Twitter
    const hashtag =
      category === 'zodiac'
        ? '#astrology'
        : category === 'tarot'
          ? '#tarot'
          : category === 'crystals'
            ? '#crystals'
            : category === 'numerology'
              ? '#numerology'
              : category === 'runes'
                ? '#runes'
                : category === 'chakras'
                  ? '#chakras'
                  : '#witchcraft';

    content = `${content}\n\n${hashtag}`;

    posts.push({
      content,
      category,
      postType,
      source,
      scheduledHour: TWITTER_HOURS[slot],
    });
  }

  return posts;
}

export function generateBlueskyPosts(dateStr: string): StandalonePost[] {
  const posts: StandalonePost[] = [];

  for (let slot = 0; slot < BLUESKY_HOURS.length; slot++) {
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
