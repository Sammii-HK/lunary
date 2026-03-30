import type { IGStoryContent, IGStoryData, RotatingStoryType } from './types';
import { seededRandom } from './ig-utils';
import { getTarotCard } from '../../../utils/tarot/tarot';
import {
  getDetailedMoonPhase,
  stringToCamelCase,
} from '../../../utils/moon/moonPhases';
import { constellationsMoonPhases } from '../../../utils/moon/zodiacPhases';
import { getDayOfYear } from 'date-fns';
import {
  generateAffirmation,
  generateRitualTip,
  generateSignOfTheDay,
  generateTransitAlert,
  generateNumerologyStory,
} from './rotating-story-content';
import { generateDidYouKnow } from './did-you-know-content';
import { getEventCalendarForDate } from '@/lib/astro/event-calendar';
import type { CalendarEvent } from '@/lib/astro/event-calendar';

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
    case 'calendar_event':
      // calendar_event is built separately via buildCalendarEventStory()
      // because it needs async CalendarEvent data passed in.
      // This case is a no-op; the actual story is injected in generateDailyStoryData.
      return null;
    case 'quote':
      // Quote requires a DB call — return placeholder that cron will replace
      return null;
    default:
      return null;
  }
}

/**
 * Build an IGStoryData item from a CalendarEvent.
 * Formats the event headline, rarity frame, and hook into story params
 * that the OG image endpoint and AI caption generator can consume.
 */
function buildCalendarEventStory(event: CalendarEvent): IGStoryData {
  const hook = event.hookSuggestions[0] || event.name;

  // For sabbats, include correspondences as extra context
  let extra = event.rarityFrame;
  if (event.sabbatData) {
    const parts: string[] = [];
    if (event.sabbatData.crystals.length > 0) {
      parts.push(
        `Crystals: ${event.sabbatData.crystals.slice(0, 3).join(', ')}`,
      );
    }
    if (event.sabbatData.herbs.length > 0) {
      parts.push(`Herbs: ${event.sabbatData.herbs.slice(0, 3).join(', ')}`);
    }
    if (event.sabbatData.colors.length > 0) {
      parts.push(`Colours: ${event.sabbatData.colors.slice(0, 3).join(', ')}`);
    }
    extra = parts.join(' · ');
  }

  return {
    variant: 'calendar_event',
    title: event.name,
    subtitle: hook,
    params: {
      type: 'calendar_event',
      main: hook,
      secondary: event.name,
      extra,
      rarity: event.rarity,
      eventType: event.eventType,
      score: String(event.score),
      ...(event.planet ? { planet: event.planet } : {}),
      ...(event.sign ? { sign: event.sign } : {}),
    },
    endpoint: '/api/og/instagram/story-rotating',
  };
}

/**
 * Generate daily story data for a given date.
 * Returns exactly 4 stories: [moon, tarot, rotating1, rotating2].
 * If a slot is `quote`, it returns a placeholder that the cron fills from DB.
 *
 * When the Event Calendar has CRITICAL or HIGH events for the date,
 * slot 4 is overridden with a `calendar_event` story. For CRITICAL events,
 * a `transit_alert` is also forced into slot 3 if it is not already there.
 */
export async function generateDailyStoryData(
  dateStr: string,
  options?: { fillQuotes?: boolean },
): Promise<IGStoryData[]> {
  // Use noon UTC for moon phase calculation — midnight can straddle phase
  // boundaries and show the previous phase for most of the day
  const date = new Date(`${dateStr}T12:00:00Z`);
  const dayOfYear = getDayOfYear(date);
  const dayOfWeek = date.getDay(); // 0=Sun

  const stories: IGStoryData[] = [];

  // 1. Moon phase story — with zodiac sign context for full/new moons
  const moonDetail = getDetailedMoonPhase(date);
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

  // For full and new moons, use zodiac-specific description from the grimoire data
  const isFullOrNew =
    moonDetail.phase === 'Full Moon' || moonDetail.phase === 'New Moon';
  const signKey =
    moonDetail.sign.toLowerCase() as keyof typeof constellationsMoonPhases;
  const phaseKey = stringToCamelCase(
    moonDetail.phase,
  ) as keyof (typeof constellationsMoonPhases)[typeof signKey];
  const zodiacDetails = constellationsMoonPhases[signKey]?.[phaseKey]?.details;

  let energy: string;
  if (isFullOrNew && zodiacDetails) {
    energy = zodiacDetails;
  } else {
    const energyMessages =
      MOON_ENERGY_MESSAGES[moonDetail.phase] ||
      MOON_ENERGY_MESSAGES['Full Moon'];
    energy = energyMessages[Math.floor(moonRng() * energyMessages.length)];
  }

  // Show sign for full/new moons; add Supermoon label when applicable
  const phaseDisplay = isFullOrNew
    ? `${moonDetail.phase} in ${moonDetail.sign}`
    : moonDetail.phase;
  const moonTitle = moonDetail.isSuperMoon
    ? `${phaseDisplay} (Supermoon)`
    : phaseDisplay;

  stories.push({
    variant: 'daily_moon',
    title: moonTitle,
    subtitle: energy,
    params: { phase: moonTitle, energy, date: dateStr },
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

  // 3 & 4. Rotating pool stories — start with default day-of-week schedule
  let [slot3Type, slot4Type] = WEEKLY_ROTATION[dayOfWeek] || [
    'affirmation',
    'quote',
  ];

  // --- Event Calendar integration ---
  // Check for significant cosmic events and override rotating slots when needed.
  let calendarEventStory: IGStoryData | null = null;

  try {
    const events = await getEventCalendarForDate(dateStr);
    const topEvent = events[0]; // Already sorted by score descending

    if (
      topEvent &&
      (topEvent.rarity === 'CRITICAL' || topEvent.rarity === 'HIGH')
    ) {
      // Build the calendar_event story from the highest-scoring event
      calendarEventStory = buildCalendarEventStory(topEvent);

      if (topEvent.rarity === 'CRITICAL') {
        // CRITICAL events: force transit_alert into slot 3 (every day, regardless
        // of rotation) so both slots reinforce the major event
        if (slot3Type !== 'transit_alert') {
          slot3Type = 'transit_alert';
        }
      }
      // Both CRITICAL and HIGH: override slot 4 with the calendar event
      slot4Type = 'calendar_event';
    }
  } catch {
    // Event calendar can fail on edge-case dates or missing data.
    // Degrade gracefully — existing rotation continues unchanged.
  }

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

  // Slot 4: use calendar event story if available, otherwise normal rotation
  if (calendarEventStory && slot4Type === 'calendar_event') {
    stories.push(calendarEventStory);
  } else {
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
  }

  // Fill quote placeholders from DB when requested (server-side only)
  if (options?.fillQuotes) {
    const hasQuoteSlot = stories.some((s) => s.variant === 'quote' && !s.title);
    if (hasQuoteSlot) {
      let quoteText = 'The cosmos is within us. We are made of star-stuff.';
      let quoteAuthor = 'Carl Sagan';
      try {
        const { sql } = await import('@vercel/postgres');
        const quoteResult = await sql`
          SELECT id, quote_text, author
          FROM social_quotes
          WHERE status = 'available'
          ORDER BY use_count ASC, created_at ASC
          LIMIT 50
        `;
        if (quoteResult.rows.length > 0) {
          const quoteRng = seededRandom(`story-quote-${dateStr}`);
          const quoteIndex = Math.floor(quoteRng() * quoteResult.rows.length);
          const quote = quoteResult.rows[quoteIndex];
          quoteText = quote.quote_text;
          quoteAuthor = quote.author || 'Lunary';
          await sql`
            UPDATE social_quotes
            SET use_count = use_count + 1, used_at = NOW(), updated_at = NOW()
            WHERE id = ${quote.id}
          `;
        }
      } catch (quoteError) {
        console.warn(
          '[Stories] Failed to fetch quote, using fallback:',
          quoteError,
        );
      }

      for (let idx = 0; idx < stories.length; idx++) {
        if (stories[idx].variant === 'quote' && !stories[idx].title) {
          stories[idx] = {
            variant: 'quote',
            title: quoteText,
            subtitle: quoteAuthor,
            params: {
              text:
                quoteAuthor !== 'Lunary'
                  ? `${quoteText} - ${quoteAuthor}`
                  : quoteText,
              format: 'story',
              v: '4',
            },
            endpoint: '/api/og/social-quote',
          };
        }
      }
    }
  }

  return stories;
}

/**
 * Legacy: Generate daily stories with absolute imageUrl.
 * @deprecated Use generateDailyStoryData for preview pages.
 */
export async function generateDailyStories(
  dateStr: string,
): Promise<IGStoryContent[]> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_BASE_URL || 'https://lunary.app'
  ).replace(/\/+$/, '');
  const storyData = await generateDailyStoryData(dateStr);
  return storyData.map((data) => {
    const params = new URLSearchParams(data.params);
    return {
      variant: data.variant,
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: `${baseUrl}${data.endpoint}?${params.toString()}`,
    };
  });
}
