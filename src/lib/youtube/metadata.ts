/**
 * YouTube metadata builder for all Lunary video uploads
 * Generates SEO-optimised titles, descriptions, and tags
 *
 * YouTube SEO priorities:
 * 1. Title: front-load searchable keywords, keep under 70 chars
 * 2. Description: first 2-3 lines matter most (shown in search), keywords early
 * 3. Tags: mix of broad + specific, include common misspellings/variations
 * 4. Chapters/timestamps: YouTube rewards structured content
 */

import { buildUtmUrl } from '@/lib/urls';

const BASE_URL = 'https://lunary.app';

/** Format a grimoire slug into a readable title */
function formatSlugTitle(slug: string): string {
  return slug
    .split('/')
    .pop()!
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Tag pools by category ───
// YouTube tags should be a mix of:
// - Broad discovery terms (astrology, tarot, horoscope)
// - Specific long-tail terms (aries horoscope 2026, tarot card meanings)
// - Common search queries people actually type

const CORE_TAGS = [
  'astrology',
  'zodiac',
  'horoscope',
  'zodiac signs',
  'lunary',
];

const CATEGORY_TAGS: Record<string, string[]> = {
  zodiac: [
    'zodiac signs explained',
    'astrology signs',
    'star signs',
    'birth chart',
    'sun sign',
    'moon sign',
    'rising sign',
    'zodiac personality',
    'astrology 2026',
  ],
  tarot: [
    'tarot',
    'tarot reading',
    'tarot card meanings',
    'tarot cards',
    'tarot for beginners',
    'daily tarot',
    'tarot spread',
    'tarot guidance',
  ],
  lunar: [
    'moon phases',
    'full moon',
    'new moon',
    'lunar cycle',
    'moon astrology',
    'moon ritual',
    'moon energy',
    'moon calendar',
  ],
  transits: [
    'astrology transits',
    'planetary transits',
    'astrology forecast',
    'weekly astrology',
    'astrology update',
    'cosmic forecast',
    'planet alignment',
  ],
  numerology: [
    'numerology',
    'angel numbers',
    'angel number meaning',
    'life path number',
    'numerology explained',
    'number meanings',
    'spiritual numbers',
  ],
  crystals: [
    'crystals',
    'crystal healing',
    'crystals for beginners',
    'healing crystals',
    'crystal meanings',
    'crystal energy',
    'gemstones',
  ],
  spells: [
    'witchcraft',
    'spells',
    'witchtok',
    'spell work',
    'beginner witch',
    'moon spells',
    'manifestation',
  ],
  chakras: [
    'chakras',
    'chakra healing',
    'chakra meditation',
    'energy healing',
    'spiritual healing',
    'chakra alignment',
  ],
  runes: [
    'runes',
    'elder futhark',
    'rune meanings',
    'norse runes',
    'rune reading',
    'divination',
  ],
  planetary: [
    'mercury retrograde',
    'planet retrograde',
    'astrology transits',
    'planetary alignment',
    'astrology forecast',
    'cosmic energy',
  ],
};

const PODCAST_TAGS = [
  'astrology podcast',
  'spiritual podcast',
  'weekly astrology',
  'cosmic forecast',
  'tarot podcast',
];

/** Extract keyword tags from grimoire slugs */
function extractSlugTags(slugs: string[]): string[] {
  const tags: string[] = [];
  for (const slug of slugs) {
    const parts = slug.split('/').filter(Boolean);
    for (const part of parts) {
      const formatted = part.replace(/-/g, ' ');
      if (formatted.length > 2) {
        tags.push(formatted);
      }
    }
  }
  return [...new Set(tags)];
}

/** Estimate timestamp from word position in transcript */
function estimateTimestamp(
  wordIndex: number,
  totalWords: number,
  durationSecs: number,
): string {
  const seconds = Math.round((wordIndex / totalWords) * durationSecs);
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

/**
 * Build tags for a YouTube video based on category and topic
 */
export function buildYouTubeTags(
  category: string,
  topicKeywords?: string[],
): string[] {
  const categoryPool = CATEGORY_TAGS[category] || CATEGORY_TAGS['zodiac'];
  const tags = [...CORE_TAGS, ...categoryPool];
  if (topicKeywords) {
    tags.push(...topicKeywords);
  }
  // Deduplicate and cap at 30 tags
  return [...new Set(tags.map((t) => t.toLowerCase()))].slice(0, 30);
}

// ─── Short-form video metadata ───

export interface ShortVideoMetadataInput {
  facetTitle: string;
  category: string;
  themeName?: string;
  scriptText?: string;
  contentTypeKey?: string;
}

/**
 * Build YouTube metadata for short-form videos (Shorts).
 *
 * YouTube Shorts SEO:
 * - Title must be under 100 chars, keyword-rich
 * - Description is less important for Shorts but still indexed
 * - #Shorts tag is added automatically by the upload client
 * - Tags help with discovery in search
 */
export function buildShortVideoMetadata(input: ShortVideoMetadataInput): {
  title: string;
  description: string;
  tags: string[];
} {
  const { facetTitle, category, contentTypeKey } = input;

  // Build a search-friendly title
  // YouTube users search: "aries horoscope", "tarot reading", "angel number 222"
  // NOT: "The Grimoire Episode 12" or "Weekly Cosmic Forecast"
  const title = buildShortTitle(facetTitle, category, contentTypeKey);

  // Description: first line is the hook, then CTA
  const descParts: string[] = [];
  if (input.scriptText) {
    // Use first sentence of script as the description hook
    const firstSentence = input.scriptText.match(/^[^.!?]+[.!?]/);
    if (firstSentence) {
      descParts.push(firstSentence[0].trim());
      descParts.push('');
    }
  }
  descParts.push(
    `Learn more: ${buildUtmUrl(`/grimoire`, 'youtube', 'social', 'shorts_description')}`,
  );
  descParts.push('');
  descParts.push(
    'Subscribe for daily astrology, tarot, crystals, and cosmic wisdom.',
  );

  const description = descParts.join('\n');

  // Extract topic-specific keywords from the facet title
  const topicKeywords = extractTopicKeywords(facetTitle, contentTypeKey);
  const tags = buildYouTubeTags(category, topicKeywords);

  return { title, description, tags };
}

/**
 * Build a search-optimised title for a YouTube Short.
 *
 * Rules:
 * - Front-load the searchable keyword (sign name, card name, number)
 * - Keep under 70 chars (visible in search results)
 * - Add context suffix for discoverability
 */
function buildShortTitle(
  facetTitle: string,
  category: string,
  contentTypeKey?: string,
): string {
  // Content-type specific title patterns
  const patterns: Record<string, (title: string) => string> = {
    angel_numbers: (t) =>
      `Angel Number ${t.replace(/[^0-9]/g, '') || t} Meaning`,
    mirror_hours: (t) => `${t} Mirror Hour Meaning`,
    sign_check: (t) => `${t} - Zodiac Sign Check`,
    sign_identity: (t) => `${t} Zodiac Sign Explained`,
    zodiac_sun: (t) => `${t} Sun Sign Traits`,
    zodiac_moon: (t) => `${t} Moon Sign Meaning`,
    zodiac_rising: (t) => `${t} Rising Sign Explained`,
    ranking: (t) => `Zodiac Signs Ranked: ${t}`,
    hot_take: (t) => `${t} - Astrology Hot Take`,
    quiz: (t) => `${t} - Astrology Quiz`,
    transit_alert: (t) => `${t} - Transit Alert`,
    tarot_major: (t) => `${t} Tarot Card Meaning`,
    tarot_minor: (t) => `${t} Tarot Card Meaning`,
    crystals: (t) => `${t} Crystal Meaning and Uses`,
    numerology_life_path: (t) =>
      `Life Path ${t.replace(/[^0-9]/g, '') || t} Meaning`,
    spells: (t) => `${t} Spell Guide`,
    planets: (t) => `${t} in Astrology`,
    retrogrades: (t) => `${t} Retrograde - What to Expect`,
    moon_phases: (t) => `${t} Moon Phase Meaning`,
    chakras: (t) => `${t} Chakra Explained`,
    houses: (t) => `${t} House in Astrology`,
  };

  // Try content-type pattern first
  if (contentTypeKey && patterns[contentTypeKey]) {
    const result = patterns[contentTypeKey](facetTitle);
    return result.length > 70 ? result.slice(0, 67) + '...' : result;
  }

  // Category-based fallbacks
  const categoryPatterns: Record<string, (title: string) => string> = {
    zodiac: (t) => `${t} - Zodiac Explained`,
    tarot: (t) => `${t} - Tarot Meaning`,
    lunar: (t) => `${t} - Moon Astrology`,
    numerology: (t) => `${t} - Numerology`,
    crystals: (t) => `${t} - Crystal Healing`,
    transits: (t) => `${t} - Astrology Transit`,
    planetary: (t) => `${t} - Astrology Forecast`,
    spells: (t) => `${t} - Witchcraft`,
    chakras: (t) => `${t} - Chakra Healing`,
    runes: (t) => `${t} - Rune Meaning`,
  };

  const pattern = categoryPatterns[category];
  if (pattern) {
    const result = pattern(facetTitle);
    return result.length > 70 ? result.slice(0, 67) + '...' : result;
  }

  // Final fallback
  const result = `${facetTitle} | Astrology & Cosmic Wisdom`;
  return result.length > 70 ? result.slice(0, 67) + '...' : result;
}

/**
 * Extract topic-specific keywords from facet title for tags
 */
function extractTopicKeywords(
  facetTitle: string,
  contentTypeKey?: string,
): string[] {
  const keywords: string[] = [];
  const lower = facetTitle.toLowerCase();

  // Zodiac sign names
  const signs = [
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
  ];
  for (const sign of signs) {
    if (lower.includes(sign)) {
      keywords.push(sign);
      keywords.push(`${sign} horoscope`);
      keywords.push(`${sign} astrology`);
    }
  }

  // Planet names
  const planets = [
    'mercury',
    'venus',
    'mars',
    'jupiter',
    'saturn',
    'uranus',
    'neptune',
    'pluto',
  ];
  for (const planet of planets) {
    if (lower.includes(planet)) {
      keywords.push(planet);
      keywords.push(`${planet} astrology`);
      if (contentTypeKey === 'retrogrades') {
        keywords.push(`${planet} retrograde`);
        keywords.push(`${planet} retrograde 2026`);
      }
    }
  }

  // Angel numbers
  const numberMatch = facetTitle.match(/\d{3,4}/);
  if (numberMatch) {
    keywords.push(`angel number ${numberMatch[0]}`);
    keywords.push(`${numberMatch[0]} meaning`);
    keywords.push(`${numberMatch[0]} angel number`);
  }

  // Tarot cards
  const majorArcana = [
    'fool',
    'magician',
    'high priestess',
    'empress',
    'emperor',
    'hierophant',
    'lovers',
    'chariot',
    'strength',
    'hermit',
    'wheel of fortune',
    'justice',
    'hanged man',
    'death',
    'temperance',
    'devil',
    'tower',
    'star',
    'moon',
    'sun',
    'judgement',
    'world',
  ];
  for (const card of majorArcana) {
    if (lower.includes(card)) {
      keywords.push(`${card} tarot`);
      keywords.push(`${card} tarot meaning`);
    }
  }

  return keywords;
}

// ─── Podcast metadata ───

interface PodcastMetadataInput {
  episodeNumber: number;
  title: string;
  description: string;
  slug: string;
  grimoireSlugs: string[];
  transcript: { speaker: string; text: string }[] | null;
  durationSecs: number;
}

/**
 * Build YouTube metadata for podcast episodes.
 *
 * Podcast SEO:
 * - Title: topic first, brand second
 * - Description: summary + timestamps + links (timestamps = chapters)
 * - Tags: topic-specific + podcast discovery terms
 */
export function buildPodcastYouTubeMetadata(episode: PodcastMetadataInput): {
  title: string;
  description: string;
  tags: string[];
} {
  // Title: keyword-first format
  // BAD: "The Grimoire by Lunary - Episode 12: Aries Season 2026"
  // GOOD: "Aries Season 2026 - Astrology Forecast | The Grimoire Ep. 12"
  const rawTitle = `${episode.title} | The Grimoire Ep. ${episode.episodeNumber}`;
  const title =
    rawTitle.length > 100 ? rawTitle.slice(0, 97) + '...' : rawTitle;

  // Build description
  const descParts: string[] = [];

  // 1. Episode summary (first 2 lines are visible in search — make them count)
  descParts.push(episode.description);
  descParts.push('');

  // 2. Timestamps from transcript (YouTube auto-creates chapters from these)
  if (episode.transcript && episode.transcript.length > 0) {
    const timestamps: string[] = [];
    let cumulativeWords = 0;
    const totalWords = episode.transcript.reduce(
      (sum, line) => sum + line.text.split(/\s+/).length,
      0,
    );

    const entriesPerTimestamp = Math.max(
      1,
      Math.floor(episode.transcript.length / 10),
    );

    for (let i = 0; i < episode.transcript.length; i++) {
      const line = episode.transcript[i];

      if (i % entriesPerTimestamp === 0) {
        const ts = estimateTimestamp(
          cumulativeWords,
          totalWords,
          episode.durationSecs,
        );
        const label =
          line.text.length > 50 ? line.text.slice(0, 47) + '...' : line.text;
        timestamps.push(`${ts} ${label}`);
      }

      cumulativeWords += line.text.split(/\s+/).length;
    }

    if (timestamps.length > 0) {
      // First timestamp must be 0:00 for YouTube to recognise chapters
      if (!timestamps[0].startsWith('0:00')) {
        timestamps[0] = '0:00 ' + timestamps[0].replace(/^\d+:\d+\s*/, '');
      }
      descParts.push('CHAPTERS');
      descParts.push(...timestamps);
      descParts.push('');
    }
  }

  // 3. Grimoire backlinks (SEO value: external links in description)
  if (episode.grimoireSlugs.length > 0) {
    descParts.push('EXPLORE MORE');
    for (const slug of episode.grimoireSlugs) {
      const readableTitle = formatSlugTitle(slug);
      descParts.push(
        `${readableTitle}: ${buildUtmUrl(`/grimoire/${slug}`, 'youtube', 'social', 'podcast_description')}`,
      );
    }
    descParts.push('');
  }

  // 4. Podcast page link
  descParts.push(
    `Full episode: ${buildUtmUrl(`/podcast/${episode.slug}`, 'youtube', 'social', 'podcast_description')}`,
  );
  descParts.push('');

  // 5. Subscribe CTA
  descParts.push(
    'Subscribe for weekly astrology, tarot, crystals, and cosmic wisdom.',
  );
  descParts.push(
    `${buildUtmUrl('/', 'youtube', 'social', 'podcast_description')}`,
  );

  const description = descParts.join('\n');

  // Tags: podcast discovery + topic-specific from slugs
  const slugTags = extractSlugTags(episode.grimoireSlugs);
  const tags = [
    ...CORE_TAGS,
    ...PODCAST_TAGS,
    ...slugTags,
    episode.title.toLowerCase(),
  ];
  const uniqueTags = [...new Set(tags)].slice(0, 30);

  return { title, description, tags: uniqueTags };
}
