import type { ThemeCategory } from '@/lib/social/types';
import type { IGStoryContent, IGStoryData } from './types';
import { seededRandom } from './ig-utils';
import tarotData from '@/data/tarot-cards.json';

// Moon phase headlines for daily story
const MOON_STORY_DATA = [
  {
    phase: 'New Moon',
    energy: 'Set new intentions. Plant seeds for the cycle ahead.',
    theme: 'lunar',
  },
  {
    phase: 'Waxing Crescent',
    energy: 'Take your first steps. Momentum is building.',
    theme: 'lunar',
  },
  {
    phase: 'First Quarter',
    energy: 'Push through resistance. Action over hesitation.',
    theme: 'lunar',
  },
  {
    phase: 'Waxing Gibbous',
    energy: 'Refine your approach. Trust the process.',
    theme: 'lunar',
  },
  {
    phase: 'Full Moon',
    energy: 'Illuminate what was hidden. Release and celebrate.',
    theme: 'lunar',
  },
  {
    phase: 'Waning Gibbous',
    energy: 'Share your wisdom. Gratitude opens doors.',
    theme: 'lunar',
  },
  {
    phase: 'Last Quarter',
    energy: 'Let go of what no longer serves you.',
    theme: 'lunar',
  },
  {
    phase: 'Waning Crescent',
    energy: 'Rest and reflect. The cycle is completing.',
    theme: 'lunar',
  },
] as const;

// Build tarot pulls from the full 78-card grimoire deck
interface TarotPull {
  card: string;
  keywords: string;
  message: string;
}

function buildTarotPulls(): TarotPull[] {
  const pulls: TarotPull[] = [];

  // Major Arcana (22 cards)
  const majorArcana = tarotData.majorArcana as Record<
    string,
    { name: string; keywords: string[]; affirmation: string }
  >;
  for (const card of Object.values(majorArcana)) {
    pulls.push({
      card: card.name,
      keywords: card.keywords.slice(0, 3).join(', '),
      message: card.affirmation,
    });
  }

  // Minor Arcana (56 cards)
  const minorArcana = tarotData.minorArcana as Record<
    string,
    Record<string, { name: string; keywords: string[]; affirmation: string }>
  >;
  for (const suit of Object.values(minorArcana)) {
    for (const card of Object.values(suit)) {
      pulls.push({
        card: card.name,
        keywords: card.keywords.slice(0, 3).join(', '),
        message: card.affirmation,
      });
    }
  }

  return pulls;
}

const TAROT_PULLS = buildTarotPulls();

// Poll questions for "This or That" story
const POLL_QUESTIONS = [
  {
    question: 'Crystal or candle for protection?',
    option1: 'Crystal',
    option2: 'Candle',
    category: 'spells' as ThemeCategory,
  },
  {
    question: 'Full Moon or New Moon energy?',
    option1: 'Full Moon',
    option2: 'New Moon',
    category: 'lunar' as ThemeCategory,
  },
  {
    question: 'Tarot or oracle deck?',
    option1: 'Tarot',
    option2: 'Oracle',
    category: 'tarot' as ThemeCategory,
  },
  {
    question: 'Morning ritual or evening ritual?',
    option1: 'Morning',
    option2: 'Evening',
    category: 'spells' as ThemeCategory,
  },
  {
    question: 'Fire signs or water signs?',
    option1: 'Fire signs',
    option2: 'Water signs',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Amethyst or rose quartz?',
    option1: 'Amethyst',
    option2: 'Rose Quartz',
    category: 'crystals' as ThemeCategory,
  },
  {
    question: 'Sun sign or Moon sign?',
    option1: 'Sun sign',
    option2: 'Moon sign',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Journaling or meditation?',
    option1: 'Journaling',
    option2: 'Meditation',
    category: 'chakras' as ThemeCategory,
  },
  {
    question: 'Mercury retrograde or Venus retrograde?',
    option1: 'Mercury Rx',
    option2: 'Venus Rx',
    category: 'planetary' as ThemeCategory,
  },
  {
    question: 'Spell jars or candle magic?',
    option1: 'Spell jars',
    option2: 'Candle magic',
    category: 'spells' as ThemeCategory,
  },
  {
    question: 'Birth chart or synastry chart?',
    option1: 'Birth chart',
    option2: 'Synastry',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Angel numbers or tarot cards?',
    option1: 'Angel numbers',
    option2: 'Tarot cards',
    category: 'numerology' as ThemeCategory,
  },
  // --- Extended poll pool for daily cadence ---
  {
    question: 'Which element rules your vibe?',
    option1: 'Fire/Air',
    option2: 'Earth/Water',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Manifestation or shadow work?',
    option1: 'Manifestation',
    option2: 'Shadow work',
    category: 'spells' as ThemeCategory,
  },
  {
    question: 'Do you read your horoscope daily?',
    option1: 'Every day',
    option2: 'Sometimes',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Moonstone or labradorite?',
    option1: 'Moonstone',
    option2: 'Labradorite',
    category: 'crystals' as ThemeCategory,
  },
  {
    question: 'Rising sign or Moon sign?',
    option1: 'Rising sign',
    option2: 'Moon sign',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Protection spell or love spell?',
    option1: 'Protection',
    option2: 'Love',
    category: 'spells' as ThemeCategory,
  },
  {
    question: 'Do you believe in Mercury retrograde?',
    option1: 'Absolutely',
    option2: 'It is real and terrifying',
    category: 'planetary' as ThemeCategory,
  },
  {
    question: '111 or 444?',
    option1: '111',
    option2: '444',
    category: 'numerology' as ThemeCategory,
  },
  {
    question: 'Crystals or herbs for healing?',
    option1: 'Crystals',
    option2: 'Herbs',
    category: 'crystals' as ThemeCategory,
  },
  {
    question: 'Major Arcana or Minor Arcana?',
    option1: 'Major',
    option2: 'Minor',
    category: 'tarot' as ThemeCategory,
  },
  {
    question: 'New Moon intentions or Full Moon release?',
    option1: 'Intentions',
    option2: 'Release',
    category: 'lunar' as ThemeCategory,
  },
  {
    question: 'Scorpio energy or Pisces energy?',
    option1: 'Scorpio',
    option2: 'Pisces',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Aries confidence or Capricorn discipline?',
    option1: 'Aries fire',
    option2: 'Cap grind',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Would you date your opposite sign?',
    option1: 'Yes, opposites attract',
    option2: 'No, too risky',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Third eye chakra or heart chakra?',
    option1: 'Third eye',
    option2: 'Heart',
    category: 'chakras' as ThemeCategory,
  },
  {
    question: 'Sage cleansing or sound bath?',
    option1: 'Sage',
    option2: 'Sound bath',
    category: 'spells' as ThemeCategory,
  },
  {
    question: 'Do you check compatibility before dating?',
    option1: 'Always',
    option2: 'After the first date',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Citrine for abundance or black tourmaline for protection?',
    option1: 'Citrine',
    option2: 'Black tourmaline',
    category: 'crystals' as ThemeCategory,
  },
  {
    question: 'The Tower or Death card?',
    option1: 'The Tower',
    option2: 'Death',
    category: 'tarot' as ThemeCategory,
  },
  {
    question: 'Leo drama or Gemini chaos?',
    option1: 'Leo drama',
    option2: 'Gemini chaos',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Life path number or zodiac sign?',
    option1: 'Life path',
    option2: 'Zodiac sign',
    category: 'numerology' as ThemeCategory,
  },
  {
    question: 'Waning Moon rest or Waxing Moon hustle?',
    option1: 'Waning rest',
    option2: 'Waxing hustle',
    category: 'lunar' as ThemeCategory,
  },
  {
    question: 'Astrology app or tarot deck?',
    option1: 'Astrology app',
    option2: 'Tarot deck',
    category: 'tarot' as ThemeCategory,
  },
  {
    question: 'Venus placement or Mars placement?',
    option1: 'Venus (love)',
    option2: 'Mars (drive)',
    category: 'planetary' as ThemeCategory,
  },
  {
    question: 'Selenite or clear quartz?',
    option1: 'Selenite',
    option2: 'Clear quartz',
    category: 'crystals' as ThemeCategory,
  },
  {
    question: 'Fixed signs or cardinal signs?',
    option1: 'Fixed',
    option2: 'Cardinal',
    category: 'zodiac' as ThemeCategory,
  },
  {
    question: 'Rune reading or tarot spread?',
    option1: 'Runes',
    option2: 'Tarot',
    category: 'tarot' as ThemeCategory,
  },
  {
    question: 'Eclipse season or retrograde season?',
    option1: 'Eclipse',
    option2: 'Retrograde',
    category: 'planetary' as ThemeCategory,
  },
];

/**
 * Generate daily story data for a given date.
 * Returns 2-3 story data items depending on day.
 * URLs are NOT included — the consumer constructs them.
 */
export function generateDailyStoryData(dateStr: string): IGStoryData[] {
  const rng = seededRandom(`story-${dateStr}`);
  const date = new Date(dateStr);
  const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0

  const stories: IGStoryData[] = [];

  // 1. Daily moon phase story (every day)
  const moonData = MOON_STORY_DATA[Math.floor(rng() * MOON_STORY_DATA.length)];
  stories.push({
    variant: 'daily_moon',
    title: moonData.phase,
    subtitle: moonData.energy,
    params: { phase: moonData.phase, energy: moonData.energy, date: dateStr },
    endpoint: '/api/og/instagram/story-daily',
  });

  // 2. Tarot pull of the day (every day)
  const tarot = TAROT_PULLS[Math.floor(rng() * TAROT_PULLS.length)];
  stories.push({
    variant: 'tarot_pull',
    title: tarot.card,
    subtitle: tarot.message,
    params: {
      card: tarot.card,
      keywords: tarot.keywords,
      message: tarot.message,
    },
    endpoint: '/api/og/instagram/story-tarot',
  });

  // 3. "This or That" poll (daily — cadence plan Frame 3)
  {
    const poll = POLL_QUESTIONS[Math.floor(rng() * POLL_QUESTIONS.length)];
    stories.push({
      variant: 'poll',
      title: poll.question,
      subtitle: `${poll.option1} vs ${poll.option2}`,
      params: {
        question: poll.question,
        option1: poll.option1,
        option2: poll.option2,
        category: poll.category,
      },
      endpoint: '/api/og/instagram/story-poll',
    });
  }

  return stories;
}

/**
 * Legacy: Generate daily stories with absolute imageUrl.
 * @deprecated Use generateDailyStoryData for preview pages.
 */
export function generateDailyStories(dateStr: string): IGStoryContent[] {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';
  return generateDailyStoryData(dateStr).map((data) => {
    const params = new URLSearchParams(data.params);
    return {
      variant: data.variant,
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: `${baseUrl}${data.endpoint}?${params.toString()}`,
    };
  });
}
