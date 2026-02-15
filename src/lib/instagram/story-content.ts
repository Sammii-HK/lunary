import type { IGStoryContent, IGStoryData } from './types';
import { seededRandom } from './ig-utils';
import { getTarotCard } from '../../../utils/tarot/tarot';
import { generateDidYouKnow } from './did-you-know-content';
import { getMoonPhase } from '../../../utils/moon/moonPhases';
import { getDayOfYear } from 'date-fns';

// Multiple energy messages per moon phase for variety
const MOON_ENERGY_MESSAGES: Record<string, string[]> = {
  'New Moon': [
    'Set new intentions. Plant seeds for the cycle ahead.',
    'A blank slate awaits. Dream boldly.',
    'In the darkness, your vision becomes clear.',
    'Begin again with cosmic clarity.',
  ],
  'Waxing Crescent': [
    'Take your first steps. Momentum is building.',
    'Your intentions are taking shape.',
    'Small steps lead to cosmic transformations.',
    'Nurture the seeds you have planted.',
  ],
  'First Quarter': [
    'Push through resistance. Action over hesitation.',
    'Obstacles are opportunities in disguise.',
    'Your courage is your superpower today.',
    'Break through limitations with confidence.',
  ],
  'Waxing Gibbous': [
    'Refine your approach. Trust the process.',
    'Polish your vision until it shines.',
    'The final touches make all the difference.',
    'Your hard work is about to pay off.',
  ],
  'Full Moon': [
    'Illuminate what was hidden. Release and celebrate.',
    'Your intuition is especially strong today.',
    'Bask in the glow of your manifestations.',
    'Everything you need is already within you.',
  ],
  'Waning Gibbous': [
    'Share your wisdom. Gratitude opens doors.',
    'Give thanks for all you have received.',
    'Your experiences are gifts to share.',
    'Abundance flows through appreciation.',
  ],
  'Last Quarter': [
    'Let go of what no longer serves you.',
    'Release old patterns to create space.',
    'Surrender to create space for miracles.',
    'Freedom comes from releasing control.',
  ],
  'Waning Crescent': [
    'Rest and reflect. The cycle is completing.',
    'Embrace the sacred pause before rebirth.',
    'In stillness, you find your power.',
    'Rest deeply before the next chapter begins.',
  ],
};

// Cosmic energy headlines by moon phase (matching content-orchestrator pattern)
const COSMIC_HEADLINES: Record<string, string[]> = {
  'New Moon': [
    'Set intentions with clarity and purpose',
    'New beginnings await you today',
    'Plant seeds for what you wish to manifest',
    'A blank canvas for your cosmic dreams',
    'Fresh starts are written in the stars',
  ],
  'Waxing Crescent': [
    'Trust the process unfolding around you',
    'Your plans are taking root',
    'Take action toward your goals',
    'Small steps lead to cosmic transformations',
    'Your intentions are gaining momentum',
  ],
  'First Quarter': [
    'A day for creative breakthroughs',
    'Push through challenges with determination',
    'Your momentum is building',
    'The universe rewards bold action',
    'Break through limitations with confidence',
  ],
  'Waxing Gibbous': [
    'Refinement leads to perfection',
    'Fine-tune your approach',
    'Success is within reach',
    'Polish your vision until it shines',
    'Your hard work is about to pay off',
  ],
  'Full Moon': [
    'Your intuition is especially strong today',
    'The cosmos aligns in your favour today',
    'Celebrate your achievements',
    'Your inner wisdom is illuminated',
    'The peak of your power is now',
  ],
  'Waning Gibbous': [
    'Share your wisdom with others',
    'Gratitude opens new doors',
    'Take time to reflect on your journey',
    'Abundance flows through appreciation',
    'Wisdom ripens in the afterglow',
  ],
  'Last Quarter': [
    'Release what no longer serves your growth',
    'Let go of old patterns',
    'Make space for transformation',
    'What you release makes room for blessings',
    'Freedom comes from releasing control',
  ],
  'Waning Crescent': [
    'Rest and restore your energy',
    'Quiet reflection brings clarity',
    'Prepare for new beginnings',
    'Embrace the sacred pause before rebirth',
    'In stillness, you find your power',
  ],
};

/**
 * Generate daily story data for a given date.
 * Returns 4 stories: [moon, tarot, dyk, cosmic].
 * Quote (slot 3) requires a DB call so it's generated in the cron.
 */
export function generateDailyStoryData(dateStr: string): IGStoryData[] {
  const date = new Date(dateStr);
  const dayOfYear = getDayOfYear(date);

  const stories: IGStoryData[] = [];

  // 1. Moon phase story — use real astronomical phase
  const moonPhase = getMoonPhase(date);
  const moonRng = seededRandom(`story-moon-${dateStr}`);
  const energyMessages =
    MOON_ENERGY_MESSAGES[moonPhase] || MOON_ENERGY_MESSAGES['Full Moon'];
  const energy = energyMessages[Math.floor(moonRng() * energyMessages.length)];

  stories.push({
    variant: 'daily_moon',
    title: moonPhase,
    subtitle: energy,
    params: { phase: moonPhase, energy, date: dateStr },
    endpoint: '/api/og/instagram/story-daily',
  });

  // 2. Tarot — use the app's actual daily card (same seed as generalTarot.ts)
  const cosmicSeed = `cosmic-${dateStr}-${dayOfYear}-energy`;
  const tarotCard = getTarotCard(cosmicSeed);
  const cardAffirmation =
    (tarotCard as any).affirmation || tarotCard.information || '';

  stories.push({
    variant: 'tarot_pull',
    title: tarotCard.name,
    subtitle: cardAffirmation,
    params: {
      card: tarotCard.name,
      keywords: tarotCard.keywords.slice(0, 3).join(', '),
      message: cardAffirmation,
    },
    endpoint: '/api/og/instagram/story-tarot',
  });

  // 3. Did You Know fact
  const dyk = generateDidYouKnow(dateStr);
  stories.push({
    variant: 'did_you_know',
    title: 'Did You Know?',
    subtitle: dyk.fact,
    params: {
      fact: dyk.fact,
      category: dyk.category,
      source: dyk.source,
    },
    endpoint: '/api/og/instagram/did-you-know',
  });

  // 4. Cosmic energy story
  const cosmicRng = seededRandom(`story-cosmic-${dateStr}`);
  const phaseHeadlines =
    COSMIC_HEADLINES[moonPhase] || COSMIC_HEADLINES['Full Moon'];
  const headline =
    phaseHeadlines[Math.floor(cosmicRng() * phaseHeadlines.length)];

  stories.push({
    variant: 'cosmic_energy',
    title: 'Cosmic Energy',
    subtitle: headline,
    params: {
      date: dateStr,
      headline,
      moonPhase,
      variant: 'daily_energy',
    },
    endpoint: '/api/og/instagram/daily-cosmic',
  });

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
