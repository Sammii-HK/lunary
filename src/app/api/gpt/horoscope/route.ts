import { NextRequest, NextResponse } from 'next/server';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '../../../../../utils/astrology/cosmic-og';
import { requireGptAuth } from '@/lib/gptAuth';

export const runtime = 'nodejs';
export const revalidate = 86400; // minimum revalidation window (daily type)

const ZODIAC_SIGNS = [
  'aries',
  'taurus',
  'gemini',
  'cancer',
  'leo',
  'virgo',
  'libra',
  'scorpio',
  'sagittarius',
  'capricorn',
  'aquarius',
  'pisces',
] as const;

type ZodiacSign = (typeof ZODIAC_SIGNS)[number];

const SIGN_DATA: Record<
  ZodiacSign,
  { element: string; ruler: string; modality: string }
> = {
  aries: { element: 'Fire', ruler: 'Mars', modality: 'Cardinal' },
  taurus: { element: 'Earth', ruler: 'Venus', modality: 'Fixed' },
  gemini: { element: 'Air', ruler: 'Mercury', modality: 'Mutable' },
  cancer: { element: 'Water', ruler: 'Moon', modality: 'Cardinal' },
  leo: { element: 'Fire', ruler: 'Sun', modality: 'Fixed' },
  virgo: { element: 'Earth', ruler: 'Mercury', modality: 'Mutable' },
  libra: { element: 'Air', ruler: 'Venus', modality: 'Cardinal' },
  scorpio: { element: 'Water', ruler: 'Pluto', modality: 'Fixed' },
  sagittarius: { element: 'Fire', ruler: 'Jupiter', modality: 'Mutable' },
  capricorn: { element: 'Earth', ruler: 'Saturn', modality: 'Cardinal' },
  aquarius: { element: 'Air', ruler: 'Uranus', modality: 'Fixed' },
  pisces: { element: 'Water', ruler: 'Neptune', modality: 'Mutable' },
};

// Weekly horoscope templates with 2-3 sentence structure:
// 1. Name this week's energy
// 2. Where it shows up (relationships, work, inner world)
// 3. Gentle suggestion tying into features
const WEEKLY_HOROSCOPE_TEMPLATES: Record<ZodiacSign, string[]> = {
  aries: [
    "This week carries the energy of Bold Beginnings. You'll feel the call to initiate something new, especially in your career or creative pursuits. When momentum builds, let the Astral Guide help you channel it with intention.",
    "The week moves under Courageous Momentum. Your drive may surface in how you approach challenges at work and in personal projects. Consider journaling in your Book of Shadows about what you're ready to fight for.",
    "You're in a phase of Pioneering Spirit this week. This energy shows up most in your relationships—you may feel compelled to lead or take initiative. Pull a tarot card to see what's asking for your attention.",
  ],
  taurus: [
    'This week holds the energy of Grounded Abundance. Your focus naturally turns toward material security and sensory pleasures. The Astral Guide can help you explore what true abundance means for you now.',
    'The week unfolds under Steady Growth. This influence shows up in your work life and financial matters—patience yields rewards. Write about your values in your Book of Shadows to anchor this clarity.',
    "You're moving through a phase of Rooted Comfort this week. Home, body, and security matters take center stage. Your tarot patterns may reveal what foundation you're building.",
  ],
  gemini: [
    'This week carries the energy of Curious Connections. Your mind is alive with ideas, especially in social and intellectual pursuits. Let the Astral Guide help you sort through which conversations matter most.',
    'The week moves under Versatile Expression. Communication flows easily in both work and personal relationships. Consider capturing your insights in your Book of Shadows before they scatter.',
    "You're in a phase of Mental Expansion this week. Learning and sharing take priority—your inner world buzzes with possibility. A tarot reading may help focus your curiosity.",
  ],
  cancer: [
    'This week holds the energy of Nurturing Depths. Your emotional world asks for attention, especially in family and close relationships. The Astral Guide can help you navigate these sensitive waters.',
    'The week unfolds under Intuitive Care. This influence surfaces in how you tend to your home and inner sanctuary. Journaling in your Book of Shadows supports emotional processing.',
    "You're moving through a phase of Heart-Centered Protection this week. Boundaries and belonging are central themes. Your tarot patterns may illuminate what needs your gentle attention.",
  ],
  leo: [
    'This week carries the energy of Radiant Expression. Your creative gifts and desire for recognition are amplified, especially in work and romance. The Astral Guide can help you shine authentically.',
    'The week moves under Generous Warmth. Your heart leads in relationships and creative projects—let joy be your compass. Write about what makes you feel alive in your Book of Shadows.',
    "You're in a phase of Courageous Visibility this week. Your inner world calls for self-celebration, not just validation. Pull a tarot card to explore what wants to be expressed.",
  ],
  virgo: [
    'This week holds the energy of Discerning Service. Your analytical gifts are heightened, especially in work and health matters. Let the Astral Guide help you discern between perfectionism and genuine improvement.',
    "The week unfolds under Practical Devotion. Details matter in your relationships and daily routines—small acts carry weight. Your Book of Shadows can help you track patterns you're ready to refine.",
    "You're moving through a phase of Healing Precision this week. Body, mind, and environment ask for your attention. A tarot reading may reveal what's ready for integration.",
  ],
  libra: [
    "This week carries the energy of Harmonious Connection. Relationships and aesthetic matters take priority—you're seeking balance in partnerships and beauty in your surroundings. The Astral Guide can help you navigate relational dynamics.",
    'The week moves under Diplomatic Grace. Fairness surfaces as a theme in work and personal bonds—your inner world craves equilibrium. Reflect on your needs in your Book of Shadows.',
    "You're in a phase of Balanced Partnership this week. One-on-one connections deepen, asking for presence and reciprocity. Your tarot patterns may show where to give and where to receive.",
  ],
  scorpio: [
    'This week holds the energy of Transformative Depths. Intensity surfaces in your emotional world and intimate bonds—something is ready to shift. The Astral Guide can support you through necessary endings and beginnings.',
    "The week unfolds under Regenerative Power. Work and personal matters invite you to release what's no longer serving your growth. Your Book of Shadows is a safe space for shadow work.",
    "You're moving through a phase of Profound Insight this week. Hidden truths may surface in relationships or within yourself. A tarot reading can help you see what's emerging.",
  ],
  sagittarius: [
    'This week carries the energy of Expansive Vision. Adventure calls in your inner world and outer pursuits—meaning-making is central. Let the Astral Guide help you discern which horizon to chase.',
    'The week moves under Optimistic Exploration. Learning and travel themes surface in work and personal growth. Capture your philosophical musings in your Book of Shadows.',
    "You're in a phase of Bold Seeking this week. Relationships may feel like journeys, and your spirit craves truth. Your tarot patterns may reveal what you're ready to believe in.",
  ],
  capricorn: [
    'This week holds the energy of Ambitious Structure. Career and long-term goals demand focus—your patience is your power. The Astral Guide can help you align ambition with meaning.',
    'The week unfolds under Disciplined Achievement. Authority and responsibility surface in work and family matters. Reflect on your legacy in your Book of Shadows.',
    "You're moving through a phase of Steady Ascent this week. Inner world themes include purpose and mastery. A tarot reading may clarify your next step on the mountain.",
  ],
  aquarius: [
    'This week carries the energy of Visionary Community. Friendships and collective causes ask for your unique perspective. Let the Astral Guide help you balance individuality with belonging.',
    'The week moves under Innovative Liberation. Work and social circles may feel ripe for change—your inner world craves freedom. Write about what revolution means for you in your Book of Shadows.',
    "You're in a phase of Authentic Rebellion this week. Relationships may test your need for independence and connection. Your tarot patterns may reveal what's ready to break free.",
  ],
  pisces: [
    'This week holds the energy of Compassionate Flow. Intuition and creativity surface in your inner world and spiritual pursuits. The Astral Guide can help you discern between empathy and overwhelm.',
    'The week unfolds under Dreamy Connection. Relationships carry a mystical quality—boundaries may blur. Capture your dreams and visions in your Book of Shadows.',
    "You're moving through a phase of Spiritual Surrender this week. Rest, imagination, and healing take priority. A tarot reading may reveal what's emerging from the depths.",
  ],
};

// Daily horoscope templates (shorter, focused)
const DAILY_HOROSCOPE_TEMPLATES: Record<string, string[]> = {
  Fire: [
    'Your fiery energy is amplified today. Channel it into creative projects.',
    'Passion drives you forward. Let your enthusiasm inspire others.',
    'Your natural leadership shines. Take the initiative on something meaningful.',
  ],
  Earth: [
    'Ground yourself in practical matters today. Steady progress wins.',
    'Your patient approach pays off. Trust the process and keep building.',
    'Material concerns are highlighted. Focus on security and stability.',
  ],
  Air: [
    'Communication flows easily today. Share your ideas freely.',
    'Your mind is sharp and curious. Learn something new.',
    'Social connections bring opportunities. Network and collaborate.',
  ],
  Water: [
    'Trust your intuition today—it guides you true.',
    'Emotional depth brings insight. Honor your feelings.',
    'Your empathy is a strength. Connect deeply with loved ones.',
  ],
};

function generateDailyHoroscope(sign: ZodiacSign, moonPhase: string): string {
  const { element } = SIGN_DATA[sign];
  const templates = DAILY_HOROSCOPE_TEMPLATES[element];
  const baseHoroscope = templates[Math.floor(Math.random() * templates.length)];

  const moonAdditions: Record<string, string> = {
    'New Moon': ' The New Moon supports fresh starts and intention-setting.',
    'Waxing Crescent': ' Building momentum—take action on recent ideas.',
    'First Quarter':
      ' Face challenges head-on. Obstacles lead to breakthroughs.',
    'Waxing Gibbous': ' Refine your approach as the Full Moon approaches.',
    'Full Moon': ' Emotions run high. Celebrate achievements and release.',
    'Waning Gibbous': ' Share wisdom gained. Gratitude amplifies blessings.',
    'Last Quarter': ' Let go of what no longer serves your growth.',
    'Waning Crescent': ' Rest and reflect. Recharge before the new cycle.',
  };

  return baseHoroscope + (moonAdditions[moonPhase] || '');
}

function generateWeeklyHoroscope(sign: ZodiacSign): string {
  const templates = WEEKLY_HOROSCOPE_TEMPLATES[sign];
  // Use week number for consistency within a week
  const weekNumber = Math.floor(Date.now() / (1000 * 60 * 60 * 24 * 7));
  return templates[weekNumber % templates.length];
}

function getLuckyNumber(sign: ZodiacSign): number {
  const baseNumbers: Record<ZodiacSign, number[]> = {
    aries: [1, 9, 17],
    taurus: [2, 6, 24],
    gemini: [3, 7, 12],
    cancer: [2, 7, 11],
    leo: [1, 4, 19],
    virgo: [5, 14, 23],
    libra: [6, 15, 24],
    scorpio: [8, 11, 22],
    sagittarius: [3, 9, 21],
    capricorn: [4, 8, 22],
    aquarius: [4, 7, 11],
    pisces: [3, 9, 12],
  };
  const numbers = baseNumbers[sign];
  return numbers[Math.floor(Math.random() * numbers.length)];
}

function getLuckyColor(sign: ZodiacSign): string {
  const colors: Record<ZodiacSign, string[]> = {
    aries: ['Red', 'Orange', 'Gold'],
    taurus: ['Green', 'Pink', 'Earth tones'],
    gemini: ['Yellow', 'Light blue', 'Silver'],
    cancer: ['Silver', 'White', 'Sea green'],
    leo: ['Gold', 'Orange', 'Purple'],
    virgo: ['Navy', 'Brown', 'Forest green'],
    libra: ['Pink', 'Light blue', 'Lavender'],
    scorpio: ['Black', 'Deep red', 'Burgundy'],
    sagittarius: ['Purple', 'Blue', 'Turquoise'],
    capricorn: ['Brown', 'Black', 'Dark green'],
    aquarius: ['Electric blue', 'Silver', 'Violet'],
    pisces: ['Sea green', 'Lavender', 'Aqua'],
  };
  const signColors = colors[sign];
  return signColors[Math.floor(Math.random() * signColors.length)];
}

function getCompatibility(sign: ZodiacSign): string {
  const compatible: Record<ZodiacSign, string[]> = {
    aries: ['Leo', 'Sagittarius', 'Gemini'],
    taurus: ['Virgo', 'Capricorn', 'Cancer'],
    gemini: ['Libra', 'Aquarius', 'Aries'],
    cancer: ['Scorpio', 'Pisces', 'Taurus'],
    leo: ['Aries', 'Sagittarius', 'Gemini'],
    virgo: ['Taurus', 'Capricorn', 'Cancer'],
    libra: ['Gemini', 'Aquarius', 'Leo'],
    scorpio: ['Cancer', 'Pisces', 'Virgo'],
    sagittarius: ['Aries', 'Leo', 'Libra'],
    capricorn: ['Taurus', 'Virgo', 'Scorpio'],
    aquarius: ['Gemini', 'Libra', 'Sagittarius'],
    pisces: ['Cancer', 'Scorpio', 'Capricorn'],
  };
  const signs = compatible[sign];
  return signs[Math.floor(Math.random() * signs.length)];
}

function getMood(moonPhase: string): string {
  const moods: Record<string, string[]> = {
    'New Moon': ['Reflective', 'Hopeful', 'Introspective'],
    'Waxing Crescent': ['Optimistic', 'Determined', 'Energized'],
    'First Quarter': ['Motivated', 'Challenged', 'Focused'],
    'Waxing Gibbous': ['Anticipatory', 'Productive', 'Refined'],
    'Full Moon': ['Emotional', 'Illuminated', 'Celebratory'],
    'Waning Gibbous': ['Grateful', 'Wise', 'Sharing'],
    'Last Quarter': ['Releasing', 'Processing', 'Clearing'],
    'Waning Crescent': ['Restful', 'Contemplative', 'Peaceful'],
  };
  const options = moods[moonPhase] || ['Balanced'];
  return options[Math.floor(Math.random() * options.length)];
}

export async function GET(request: NextRequest) {
  const unauthorized = requireGptAuth(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const signParam = searchParams.get('sign')?.toLowerCase();
    const dateParam = searchParams.get('date');
    const typeParam = searchParams.get('type') || 'daily';

    if (!signParam || !ZODIAC_SIGNS.includes(signParam as ZodiacSign)) {
      return NextResponse.json(
        {
          error: 'Valid zodiac sign required',
          validSigns: ZODIAC_SIGNS,
        },
        { status: 400 },
      );
    }

    const sign = signParam as ZodiacSign;
    const today = dateParam ? new Date(dateParam) : new Date();
    const targetDate = new Date(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}T12:00:00Z`,
    );

    const positions = getRealPlanetaryPositions(targetDate);
    const moonPhase = getAccurateMoonPhase(targetDate);

    // Generate horoscope based on type
    const horoscope =
      typeParam === 'weekly'
        ? generateWeeklyHoroscope(sign)
        : generateDailyHoroscope(sign, moonPhase.name);

    // Daily: 1 day cache, Weekly: 7 day cache
    const cacheMaxAge = typeParam === 'weekly' ? 604800 : 86400;
    const staleWhileRevalidate = typeParam === 'weekly' ? 86400 : 3600;

    const response = {
      sign: sign.charAt(0).toUpperCase() + sign.slice(1),
      date: targetDate.toISOString().split('T')[0],
      type: typeParam,
      horoscope,
      mood: getMood(moonPhase.name),
      luckyNumber: getLuckyNumber(sign),
      luckyColor: getLuckyColor(sign),
      compatibility: getCompatibility(sign),
      moonPhase: moonPhase.name,
      element: SIGN_DATA[sign].element,
      ctaUrl: `https://lunary.app/horoscope?sign=${sign}&from=gpt_horoscope`,
      ctaText: 'Get your personalized daily horoscope based on your full chart',
      source: 'Lunary.app - Personalized astrology with real astronomical data',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': `public, s-maxage=${cacheMaxAge}, stale-while-revalidate=${staleWhileRevalidate}`,
      },
    });
  } catch (error) {
    console.error('GPT horoscope error:', error);
    return NextResponse.json(
      { error: 'Failed to generate horoscope' },
      { status: 500 },
    );
  }
}
