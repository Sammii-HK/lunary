import type { IGStoryContent, IGStoryData, RotatingStoryType } from './types';
import { seededRandom } from './ig-utils';
import { getTarotCard } from '../../../utils/tarot/tarot';
import { getMoonPhase } from '../../../utils/moon/moonPhases';
import { getDayOfYear } from 'date-fns';
import {
  generateAffirmation,
  generateRitualTip,
  generateSignOfTheDay,
  generateTransitAlert,
  generateNumerologyStory,
} from './rotating-story-content';
import { generateDidYouKnow } from './did-you-know-content';

// Weekly rotation schedule: day-of-week (0=Sun) → [slot3, slot4]
// Frequency: Quote (2), Affirmation (2), Numerology (2), Ritual Tip (2),
//            Sign of the Day (2), Transit Alert (2), DYK (2) = 14 slots
const WEEKLY_ROTATION: Record<number, [RotatingStoryType, RotatingStoryType]> =
  {
    1: ['affirmation', 'ritual_tip'], // Monday
    2: ['numerology', 'sign_of_the_day'], // Tuesday
    3: ['transit_alert', 'quote'], // Wednesday
    4: ['did_you_know', 'affirmation'], // Thursday
    5: ['ritual_tip', 'quote'], // Friday
    6: ['sign_of_the_day', 'numerology'], // Saturday
    0: ['transit_alert', 'did_you_know'], // Sunday
  };

/**
 * Build an IGStoryData item for a rotating story type.
 */
function buildRotatingStory(
  type: RotatingStoryType,
  dateStr: string,
): IGStoryData | null {
  switch (type) {
    case 'affirmation': {
      const { affirmation, moonPhase } = generateAffirmation(dateStr);
      return {
        variant: 'affirmation',
        title: 'Daily Affirmation',
        subtitle: affirmation,
        params: {
          type: 'affirmation',
          main: affirmation,
          secondary: moonPhase,
        },
        endpoint: '/api/og/instagram/story-rotating',
      };
    }
    case 'ritual_tip': {
      const { tip, theme } = generateRitualTip(dateStr);
      return {
        variant: 'ritual_tip',
        title: 'Ritual Tip',
        subtitle: tip,
        params: {
          type: 'ritual_tip',
          main: tip,
          secondary: theme.charAt(0).toUpperCase() + theme.slice(1),
        },
        endpoint: '/api/og/instagram/story-rotating',
      };
    }
    case 'sign_of_the_day': {
      const { sign, element, trait, message } = generateSignOfTheDay(dateStr);
      return {
        variant: 'sign_of_the_day',
        title: sign,
        subtitle: message,
        params: {
          type: 'sign_of_the_day',
          main: message,
          secondary: sign,
          extra: `${element} sign · ${trait}`,
        },
        endpoint: '/api/og/instagram/story-rotating',
      };
    }
    case 'transit_alert': {
      const alert = generateTransitAlert(dateStr);
      return {
        variant: 'transit_alert',
        title: alert.headline,
        subtitle: alert.message,
        params: {
          type: 'transit_alert',
          main: alert.message,
          secondary: alert.headline,
          extra: alert.planet,
        },
        endpoint: '/api/og/instagram/story-rotating',
      };
    }
    case 'did_you_know': {
      const dyk = generateDidYouKnow(dateStr);
      return {
        variant: 'did_you_know',
        title: 'Did You Know?',
        subtitle: dyk.fact,
        params: {
          fact: dyk.fact,
          category: dyk.category,
          source: dyk.source,
        },
        endpoint: '/api/og/instagram/did-you-know',
      };
    }
    case 'numerology': {
      const numData = generateNumerologyStory(dateStr);
      return {
        variant: 'numerology',
        title: numData.label,
        subtitle: numData.mainText,
        params: {
          type: 'numerology',
          label: numData.label,
          main: numData.mainText,
          secondary: numData.secondary,
          extra: numData.extra,
        },
        endpoint: '/api/og/instagram/story-rotating',
      };
    }
    case 'quote':
      // Quote requires a DB call — return placeholder that cron will replace
      return null;
    default:
      return null;
  }
}

/**
 * Generate daily story data for a given date.
 * Returns exactly 4 stories: [moon, tarot, rotating1, rotating2].
 * If a slot is `quote`, it returns a placeholder that the cron fills from DB.
 */
export function generateDailyStoryData(dateStr: string): IGStoryData[] {
  const date = new Date(dateStr);
  const dayOfYear = getDayOfYear(date);
  const dayOfWeek = date.getDay(); // 0=Sun

  const stories: IGStoryData[] = [];

  // 1. Moon phase story
  const moonPhase = getMoonPhase(date);
  const moonRng = seededRandom(`story-moon-${dateStr}`);
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

  // 2. Tarot pull
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

  // 3 & 4. Rotating pool stories
  const [slot3Type, slot4Type] = WEEKLY_ROTATION[dayOfWeek] || [
    'affirmation',
    'quote',
  ];

  const rotating1 = buildRotatingStory(slot3Type, dateStr);
  if (rotating1) {
    stories.push(rotating1);
  } else {
    // quote placeholder
    stories.push({
      variant: 'quote',
      title: '',
      subtitle: '',
      params: { text: '', format: 'story', v: '4' },
      endpoint: '/api/og/social-quote',
    });
  }

  const rotating2 = buildRotatingStory(slot4Type, dateStr);
  if (rotating2) {
    stories.push(rotating2);
  } else {
    // quote placeholder
    stories.push({
      variant: 'quote',
      title: '',
      subtitle: '',
      params: { text: '', format: 'story', v: '4' },
      endpoint: '/api/og/social-quote',
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
