import type { ThemeCategory } from '@/lib/social/types';
import type { IGStoryContent } from './types';
import { seededRandom } from './ig-utils';

const SHARE_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app';

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

// Tarot pull data for daily tarot story
const TAROT_PULLS = [
  {
    card: 'The Fool',
    keywords: 'New beginnings, faith, adventure',
    message: 'Take the leap. The universe will catch you.',
  },
  {
    card: 'The Magician',
    keywords: 'Manifestation, power, creation',
    message: 'Everything you need is already within you.',
  },
  {
    card: 'The High Priestess',
    keywords: 'Intuition, mystery, inner knowing',
    message: 'Trust what you feel, not just what you see.',
  },
  {
    card: 'The Empress',
    keywords: 'Abundance, nurturing, creativity',
    message: 'Create something beautiful today.',
  },
  {
    card: 'The Emperor',
    keywords: 'Structure, authority, stability',
    message: 'Build foundations that last.',
  },
  {
    card: 'The Hierophant',
    keywords: 'Tradition, wisdom, guidance',
    message: 'Seek the teacher within.',
  },
  {
    card: 'The Lovers',
    keywords: 'Choice, alignment, partnership',
    message: 'Choose what aligns with your truth.',
  },
  {
    card: 'The Chariot',
    keywords: 'Willpower, determination, victory',
    message: 'You have the strength to overcome this.',
  },
  {
    card: 'Strength',
    keywords: 'Courage, patience, inner power',
    message: 'Gentle strength moves mountains.',
  },
  {
    card: 'The Hermit',
    keywords: 'Solitude, reflection, inner light',
    message: 'The answers are found in stillness.',
  },
  {
    card: 'Wheel of Fortune',
    keywords: 'Cycles, fate, turning point',
    message: 'Change is the only constant. Embrace it.',
  },
  {
    card: 'Justice',
    keywords: 'Truth, fairness, balance',
    message: 'What you put out comes back to you.',
  },
  {
    card: 'The Hanged Man',
    keywords: 'Surrender, new perspective, pause',
    message: 'Sometimes the best move is no move.',
  },
  {
    card: 'Death',
    keywords: 'Transformation, endings, rebirth',
    message: 'Let the old die so the new can be born.',
  },
  {
    card: 'Temperance',
    keywords: 'Balance, patience, moderation',
    message: 'Find the middle path.',
  },
  {
    card: 'The Devil',
    keywords: 'Shadow, attachment, liberation',
    message: 'Name your chains to break them.',
  },
  {
    card: 'The Tower',
    keywords: 'Sudden change, revelation, truth',
    message: 'What crumbles was never meant to last.',
  },
  {
    card: 'The Star',
    keywords: 'Hope, healing, inspiration',
    message: 'After the storm, the stars return.',
  },
  {
    card: 'The Moon',
    keywords: 'Illusion, intuition, the unconscious',
    message: 'Not everything is as it seems. Trust your gut.',
  },
  {
    card: 'The Sun',
    keywords: 'Joy, success, vitality',
    message: 'Shine without apology today.',
  },
  {
    card: 'Judgement',
    keywords: 'Awakening, calling, renewal',
    message: 'Answer the call that keeps whispering.',
  },
  {
    card: 'The World',
    keywords: 'Completion, fulfilment, wholeness',
    message: 'You are exactly where you need to be.',
  },
];

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
];

/**
 * Generate daily stories for a given date.
 * Returns 2-3 story items depending on day.
 */
export function generateDailyStories(dateStr: string): IGStoryContent[] {
  const rng = seededRandom(`story-${dateStr}`);
  const date = new Date(dateStr);
  const dayOfWeek = (date.getDay() + 6) % 7; // Mon=0

  const stories: IGStoryContent[] = [];

  // 1. Daily moon phase story (every day)
  const moonData = MOON_STORY_DATA[Math.floor(rng() * MOON_STORY_DATA.length)];
  const moonParams = new URLSearchParams({
    phase: moonData.phase,
    energy: moonData.energy,
    date: dateStr,
  });
  stories.push({
    variant: 'daily_moon',
    title: moonData.phase,
    subtitle: moonData.energy,
    imageUrl: `${SHARE_BASE_URL}/api/og/instagram/story-daily?${moonParams.toString()}`,
  });

  // 2. Tarot pull of the day (every day)
  const tarot = TAROT_PULLS[Math.floor(rng() * TAROT_PULLS.length)];
  const tarotParams = new URLSearchParams({
    card: tarot.card,
    keywords: tarot.keywords,
    message: tarot.message,
  });
  stories.push({
    variant: 'tarot_pull',
    title: tarot.card,
    subtitle: tarot.message,
    imageUrl: `${SHARE_BASE_URL}/api/og/instagram/story-tarot?${tarotParams.toString()}`,
  });

  // 3. "This or That" poll (Mon, Wed, Fri = days 0, 2, 4)
  if (dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4) {
    const poll = POLL_QUESTIONS[Math.floor(rng() * POLL_QUESTIONS.length)];
    const pollParams = new URLSearchParams({
      question: poll.question,
      option1: poll.option1,
      option2: poll.option2,
      category: poll.category,
    });
    stories.push({
      variant: 'poll',
      title: poll.question,
      subtitle: `${poll.option1} vs ${poll.option2}`,
      imageUrl: `${SHARE_BASE_URL}/api/og/instagram/story-poll?${pollParams.toString()}`,
    });
  }

  return stories;
}
