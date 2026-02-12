/**
 * TikTok metadata, cover image, and caption generation
 */

import type { DailyFacet, WeeklyTheme } from '../../weekly-themes';
import type { TikTokMetadata } from '../types';
import { THEME_DISPLAY_MAP } from '../constants';
import { capitalizeThematicTitle } from '../../../../../utils/og/text';

/**
 * Generate TikTok overlay metadata
 */
export function generateTikTokMetadata(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  totalParts: number,
): TikTokMetadata {
  return {
    theme: THEME_DISPLAY_MAP[theme.category] || theme.category.toUpperCase(),
    title: facet.title,
    series: `Part ${partNumber} of ${totalParts}`,
    summary: facet.focus,
  };
}

/**
 * Generate cover image URL for TikTok video
 */
export function generateCoverImageUrl(
  facet: DailyFacet,
  theme: WeeklyTheme,
  partNumber: number,
  baseUrl: string = '',
  totalParts: number,
): string {
  const safePartNumber = Number.isFinite(partNumber) ? partNumber : 1;
  const safeTotalParts = Number.isFinite(totalParts) ? totalParts : 7;
  const slug =
    facet.grimoireSlug.split('/').pop() ||
    facet.title.toLowerCase().replace(/\s+/g, '-');
  const subtitle = encodeURIComponent(
    `Part ${safePartNumber} of ${safeTotalParts}`,
  );
  const title = encodeURIComponent(capitalizeThematicTitle(facet.title));

  // cover=tiktok triggers larger text sizes for TikTok thumbnail legibility
  // v=2 for cache busting
  return `${baseUrl}/api/og/thematic?category=${theme.category}&slug=${slug}&title=${title}&subtitle=${subtitle}&format=story&cover=tiktok&v=2`;
}

/**
 * Category-specific hashtag pools for TikTok discovery
 */
const CATEGORY_HASHTAGS: Record<string, string[]> = {
  tarot: [
    '#tarot',
    '#tarotreading',
    '#tarotcards',
    '#tarotreader',
    '#tarottok',
    '#tarotcommunity',
    '#divination',
    '#oraclecards',
    '#psychic',
    '#witchtok',
  ],
  zodiac: [
    '#astrology',
    '#zodiac',
    '#horoscope',
    '#zodiacsigns',
    '#astrologytiktok',
    '#zodiacmemes',
    '#astrologymemes',
    '#birthchart',
    '#astrologysigns',
    '#spiritualtiktok',
  ],
  lunar: [
    '#moon',
    '#moonphases',
    '#fullmoon',
    '#newmoon',
    '#moonmagic',
    '#moonphase',
    '#mooncycle',
    '#moonritual',
    '#moonenergy',
    '#witchtok',
  ],
  planetary: [
    '#astrology',
    '#zodiac',
    '#horoscope',
    '#astrologytiktok',
    '#zodiacsigns',
    '#birthchart',
    '#spiritualtiktok',
    '#witchtok',
    '#astrologysigns',
    '#astrologymemes',
  ],
  numerology: [
    '#numerology',
    '#angelnumbers',
    '#manifestation',
    '#1111',
    '#444',
    '#manifest',
    '#lifepath',
    '#spiritualawakening',
  ],
  crystals: [
    '#crystals',
    '#crystaltok',
    '#crystalhealing',
    '#healingcrystals',
    '#crystalcollection',
    '#amethyst',
    '#rosequartz',
    '#crystalenergy',
    '#witchtok',
    '#spiritualtiktok',
  ],
  spells: [
    '#witchtok',
    '#spells',
    '#witchcraft',
    '#witch',
    '#witchesoftiktok',
    '#magick',
    '#wicca',
    '#babywitch',
    '#spellwork',
    '#pagan',
  ],
  sabbat: [
    '#pagan',
    '#wicca',
    '#witchtok',
    '#witchcraft',
    '#paganism',
    '#witchesoftiktok',
    '#sabbat',
    '#spiritualtiktok',
  ],
  chakras: [
    '#chakras',
    '#spirituality',
    '#spiritual',
    '#spiritualawakening',
    '#meditation',
    '#healing',
    '#reiki',
    '#thirdeye',
    '#lightworker',
    '#spiritualtiktok',
  ],
  runes: [
    '#runes',
    '#norse',
    '#viking',
    '#norsemythology',
    '#elderfuthark',
    '#norsepagan',
    '#paganism',
    '#divination',
  ],
};

const COMMUNITY_HASHTAGS = [
  '#spiritualtiktok',
  '#spiritual',
  '#spiritualawakening',
  '#spirituality',
  '#witchtok',
  '#manifestation',
  '#meditation',
  '#healing',
];

const FORMAT_HASHTAGS = [
  '#learnontiktok',
  '#fyp',
  '#foryou',
  '#edutok',
  '#tiktoktaught',
  '#viral',
];

/**
 * Category-specific emoji pools (#4)
 */
const CATEGORY_EMOJI: Record<string, string[]> = {
  zodiac: ['✨', '🌟', '💫', '🔮', '⭐'],
  tarot: ['🃏', '🔮', '✨', '🌙', '🎴'],
  lunar: ['🌙', '🌕', '🌑', '🌗', '✨'],
  planetary: ['🪐', '✨', '💫', '🌟', '☄️'],
  crystals: ['💎', '✨', '🔮', '💜', '🪨'],
  numerology: ['🔢', '✨', '💫', '🌟', '🔮'],
  spells: ['🕯️', '✨', '🔮', '🌿', '🧿'],
  sabbat: ['🌿', '🕯️', '🍂', '✨', '🌸'],
  chakras: ['🧘', '✨', '💫', '🌈', '🔮'],
  runes: ['ᚱ', '✨', '🔮', '⚡', '🪨'],
  default: ['✨', '🌟', '💫', '🔮', '⭐'],
};

/**
 * Category-specific engagement questions (#3)
 * {topic} placeholder is replaced with the facet title
 */
const ENGAGEMENT_QUESTIONS: Record<string, string[]> = {
  zodiac: [
    'Which sign felt this the hardest?',
    'Tag the {topic} in your life.',
    'Does this match your experience?',
    'Which placement makes this worse?',
    'Who else noticed this pattern?',
    'Drop your sign and let me guess.',
    'Is this accurate for your chart?',
    'Which sign is this hitting different for?',
    'Agree or disagree for your sign?',
    'Save this for when {topic} comes up again.',
  ],
  tarot: [
    'Have you pulled this card recently?',
    'What was your first reaction to {topic}?',
    'Does this reading resonate today?',
    'Drop the last card you pulled.',
    'Who needs to hear this right now?',
    'Has {topic} ever shown up for you at the worst time?',
    'What do you think this card is really about?',
    'Save this for your next reading.',
  ],
  lunar: [
    'How are you feeling this moon phase?',
    'Who else feels the shift during {topic}?',
    'What ritual are you doing for this phase?',
    'Does the moon actually affect your mood?',
    'Save this for the next {topic}.',
    'Drop what you noticed during {topic}.',
    'Is your energy different right now?',
    'Who else tracks moon phases?',
  ],
  numerology: [
    'Drop your life path number.',
    'Does this number keep showing up for you?',
    'What pattern are you seeing with {topic}?',
    'Who else sees this number everywhere?',
    'Is this accurate for your number?',
    'Save this if {topic} keeps appearing.',
    'Tag someone who needs to see this.',
    'When did {topic} first show up for you?',
  ],
  default: [
    'Who else noticed this pattern?',
    'Agree or disagree?',
    'Is this accurate for you?',
    'Drop your experience with {topic}.',
    'Save this for when you need it.',
    'When did you first notice this about {topic}?',
    'Who needs to hear this right now?',
    'Bookmark this one.',
  ],
};

/**
 * Category-specific soft CTA lines for brand awareness
 * Reuse app deep-link patterns from app-features and comparison content
 */
const SOFT_CTA_LINES: Record<string, string[]> = {
  zodiac: [
    'Get your free birth chart at lunary.app',
    'See how this shows up in YOUR chart — lunary.app',
  ],
  tarot: [
    "Explore this in Lunary's Grimoire — lunary.app/grimoire",
    'Track your tarot patterns at lunary.app',
  ],
  lunar: [
    'Work with the moon at lunary.app',
    'Track this moon phase at lunary.app',
  ],
  planetary: [
    'Get your personalized transits at lunary.app',
    'Track this transit in Lunary — link in bio',
  ],
  crystals: [
    'Explore crystal properties at lunary.app/grimoire',
    'Discover your crystals at lunary.app',
  ],
  numerology: [
    'Calculate your life path at lunary.app',
    'Discover your numbers at lunary.app',
  ],
  chakras: ['Explore chakra healing at lunary.app/grimoire'],
  sabbat: ['Explore seasonal rituals at lunary.app/grimoire'],
  default: [
    'Explore this deeper at lunary.app',
    'Discover your patterns at lunary.app',
  ],
};

/**
 * Series follow triggers for mid-series parts
 * {next} is replaced with the next part number
 */
const SERIES_FOLLOW_LINES = [
  'Follow for part {next}',
  "Part {next} drops tomorrow — follow so you don't miss it",
  'Follow for the rest of this series',
];

/**
 * Series completion triggers for the final part
 * Tease next week's theme to retain followers across series
 */
const SERIES_COMPLETE_LINES = [
  "That's the full series — follow to see what's next week",
  "New series starts next week — follow so you don't miss it",
  "Follow to find out next week's theme",
];

/**
 * Urgency lines for time-sensitive content types
 */
const URGENCY_LINES: Record<string, string[]> = {
  retrogrades: [
    'This retrograde window closes soon',
    'Active now — use this energy',
  ],
  eclipses: ['This eclipse window is open NOW', 'Six-month window starts here'],
  moon_phases: [
    'This phase peaks in the next 48 hours',
    'Current phase — use this energy while it lasts',
  ],
};

/**
 * Content types that are inherently time-sensitive
 */
const TIME_SENSITIVE_CONTENT_TYPES = new Set<string>([
  'retrogrades',
  'eclipses',
  'moon_phases',
]);

/**
 * Check if a content type is time-sensitive (retrogrades, eclipses, moon phases)
 */
export function isTimeSensitiveContent(
  contentTypeKey?: string,
): contentTypeKey is 'retrogrades' | 'eclipses' | 'moon_phases' {
  return !!contentTypeKey && TIME_SENSITIVE_CONTENT_TYPES.has(contentTypeKey);
}

/**
 * Deterministic day-of-week CTA gating
 *
 * Discovery (primary-educational): ~29% — Wednesday (3) + Saturday (6)
 * Consideration (secondary): ~57% — Mon (1), Wed (3), Fri (5), Sun (0)
 * Conversion (app-demo, comparison): 100% — always
 *
 * Deterministic (day-based) instead of random so we can A/B compare
 * CTA days vs non-CTA days for engagement impact measurement.
 */
export function shouldIncludeCta(
  targetAudience: 'discovery' | 'consideration' | 'conversion',
  scheduledDate?: Date,
): boolean {
  if (targetAudience === 'conversion') return true;

  const date = scheduledDate || new Date();
  const dayOfWeek = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat

  if (targetAudience === 'consideration') {
    // Mon, Wed, Fri, Sun
    return [0, 1, 3, 5].includes(dayOfWeek);
  }

  // Discovery: Wed + Sat (high-save days)
  return [3, 6].includes(dayOfWeek);
}

/**
 * Pick a deterministic item from an array based on a date seed
 */
function pickByDate<T>(items: T[], date: Date): T {
  const seed =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
  return items[seed % items.length];
}

/**
 * Generate TikTok-optimized hashtags with date-based rotation (#5)
 */
export function generateTikTokHashtags(
  facet: DailyFacet,
  theme: WeeklyTheme,
  scheduledDate?: Date,
): string[] {
  const tags: string[] = [];
  const date = scheduledDate || new Date();
  const dayIndex =
    date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();

  // Niche tag from topic
  const topicTag = `#${facet.title.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  if (topicTag.length > 2 && topicTag.length < 30) {
    tags.push(topicTag);
  }

  // Category tags — rotate 3 from expanded pool
  const categoryTags = CATEGORY_HASHTAGS[theme.category] || [];
  if (categoryTags.length > 0) {
    const catStart = dayIndex % categoryTags.length;
    for (let i = 0; i < 3 && i < categoryTags.length; i++) {
      tags.push(categoryTags[(catStart + i) % categoryTags.length]);
    }
  }

  // Community tags — rotate 2 from expanded pool
  const comStart = (dayIndex + 3) % COMMUNITY_HASHTAGS.length;
  for (let i = 0; i < 2 && i < COMMUNITY_HASHTAGS.length; i++) {
    tags.push(COMMUNITY_HASHTAGS[(comStart + i) % COMMUNITY_HASHTAGS.length]);
  }

  // Format tags — rotate 2
  const fmtStart = (dayIndex + 5) % FORMAT_HASHTAGS.length;
  for (let i = 0; i < 2 && i < FORMAT_HASHTAGS.length; i++) {
    tags.push(FORMAT_HASHTAGS[(fmtStart + i) % FORMAT_HASHTAGS.length]);
  }

  // Deduplicate (no brand tag — stunts TikTok reach)
  return [...new Set(tags)];
}

/**
 * Options for enhanced caption generation
 */
export interface TikTokCaptionOptions {
  targetAudience?: 'discovery' | 'consideration' | 'conversion';
  partNumber?: number;
  totalParts?: number;
  scheduledDate?: Date;
  contentTypeKey?: string;
  grimoireSlug?: string;
}

/**
 * Generate TikTok caption with engagement question + layered hashtags
 *
 * Caption structure:
 * [Hook line]
 * [Engagement question]          — always present
 * [Series follow trigger]        — mid-series or end-of-series
 * [Soft CTA line]                — when shouldIncludeCta() returns true
 * [Urgency line]                 — when content type is time-sensitive
 * [Hashtags]
 */
export function generateTikTokCaption(
  facet: DailyFacet,
  theme: WeeklyTheme,
  hookText?: string,
  options?: TikTokCaptionOptions,
): string {
  const date = options?.scheduledDate || new Date();

  // Category-aware engagement question rotation (#3)
  const questionCategory =
    theme.category in ENGAGEMENT_QUESTIONS ? theme.category : 'default';
  const questionPool = ENGAGEMENT_QUESTIONS[questionCategory];
  const question = pickByDate(questionPool, date).replace(
    /\{topic\}/g,
    facet.title,
  );

  const hashtags = generateTikTokHashtags(facet, theme, date);

  // Pick category-appropriate emoji (#4)
  const emojiPool = CATEGORY_EMOJI[theme.category] || CATEGORY_EMOJI.default;
  const emoji1 = pickByDate(emojiPool, date);
  // Shift seed for second emoji to avoid duplicates
  const shiftedDate = new Date(date.getTime() + 86400000);
  const emoji2 = pickByDate(emojiPool, shiftedDate);

  // Caption format: hook → emoji → engagement → series follow → CTA → urgency → hashtags
  const parts: string[] = [];

  if (hookText) {
    parts.push(`${hookText} ${emoji1}`);
  }
  parts.push('');
  parts.push(question);

  // Series follow trigger
  if (options?.partNumber && options?.totalParts && options.totalParts > 1) {
    if (options.partNumber < options.totalParts) {
      // Mid-series: tease next part
      const line = pickByDate(SERIES_FOLLOW_LINES, date).replace(
        '{next}',
        String(options.partNumber + 1),
      );
      parts.push('');
      parts.push(line);
    } else if (options.partNumber === options.totalParts) {
      // End-of-series: tease next week
      const line = pickByDate(SERIES_COMPLETE_LINES, date);
      parts.push('');
      parts.push(line);
    }
  }

  // Soft CTA line (gated by audience tier + day-of-week)
  const audience = options?.targetAudience || 'discovery';
  if (shouldIncludeCta(audience, date)) {
    // Prefer deep-link CTA when grimoire slug is available
    const slug = options?.grimoireSlug;
    let ctaLine: string;
    if (slug) {
      ctaLine = `Explore this deeper: lunary.app/grimoire/${slug.split('/').pop()}`;
    } else {
      const pool = SOFT_CTA_LINES[theme.category] || SOFT_CTA_LINES.default;
      ctaLine = pickByDate(pool, date);
    }
    parts.push('');
    parts.push(ctaLine);
  }

  // Urgency line for time-sensitive content
  if (isTimeSensitiveContent(options?.contentTypeKey)) {
    const urgencyPool = URGENCY_LINES[options!.contentTypeKey];
    if (urgencyPool) {
      parts.push('');
      parts.push(pickByDate(urgencyPool, date));
    }
  }

  parts.push('');
  parts.push(`${emoji2} ${hashtags.join(' ')}`);

  return parts.join('\n');
}
