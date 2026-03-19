/**
 * Transit-first daily text post generator.
 *
 * Replaces the thematic generator for text posts on LinkedIn, Pinterest
 * and Bluesky. On significant transit days every platform leads with
 * the transit. On quiet days, falls back to weighted category rotation.
 *
 * Threads transit posts are handled separately by the daily-threads cron.
 */

import {
  getEventCalendarForDate,
  type CalendarEvent,
} from '@/lib/astro/event-calendar';
import {
  THEME_CATEGORY_WEIGHTS,
  categoryThemes,
} from '@/lib/social/weekly-themes';
import { seededRandom } from '@/lib/instagram/ig-utils';
import { normalizeGeneratedContent } from '@/lib/social/content-normalizer';
import { normaliseUkSpelling } from '@/lib/social/shared/text/spelling';
import {
  searchGrimoireForTopic,
  type GrimoireSnippet,
} from '@/lib/social/grimoire-content';
import {
  getThematicImageUrl,
  getEducationalImageUrl,
} from '@/lib/social/educational-images';
import { getImageBaseUrl } from '@/lib/urls';

export interface DailyTextPost {
  platform: 'linkedin' | 'pinterest' | 'bluesky';
  content: string;
  hashtags?: string[];
  imageUrl?: string;
  scheduledTime: string;
  source: 'transit' | 'category-rotation' | 'persona';
  eventScore?: number;
}

type VarietyType = 'persona' | 'question' | 'closing';
type Variety = { type: VarietyType; text: string };

const PLATFORM_TIMES_UTC: Record<DailyTextPost['platform'], number> = {
  linkedin: 14, // 10 am ET
  pinterest: 17, // 1 pm ET
  bluesky: 16, // 12 pm ET
};

const TEXT_PLATFORMS: DailyTextPost['platform'][] = [
  'linkedin',
  'pinterest',
  'bluesky',
];

const PERSONA_HOOKS = [
  'As someone who has spent the last decade building design systems, I keep noticing how cosmic patterns mirror software architecture.',
  'One thing I have learned from shipping products for twelve years: the rhythm of retrogrades maps neatly onto sprint retrospectives.',
  'Most engineers scoff at astrology. I used to, as well, until I started tracking shipping dates against Mercury retrograde windows.',
  'Here is something product teams never talk about: lunar cycles and user engagement share the same waveform.',
];

const QUESTION_HOOKS = [
  'What cosmic pattern have you noticed showing up in your own life lately?',
  'Do you track moon phases? What shifts do you notice around a new moon versus a full moon?',
  'Which transit has affected you most this year, and how did you notice it?',
  'Have you ever timed a big decision to the stars? What happened?',
];

const CLOSING_HOOKS = [
  'Take a breath. Whatever the sky says, you get to choose what comes next.',
  'The cosmos sets the stage; you write the lines. Rest well tonight.',
  'Stars shift, seasons turn, and you are still here. That counts for something.',
];

const BROAD_HASHTAGS = ['#astrology', '#spirituality', '#cosmicwisdom'];

const CATEGORY_HASHTAGS: Record<string, string[]> = {
  zodiac: ['#zodiacsigns', '#starsigns', '#sunsign', '#birthchart'],
  numerology: ['#numerology', '#angelnumbers', '#lifepath', '#sacredmath'],
  tarot: ['#tarot', '#tarotreading', '#tarotcards', '#divination'],
  planetary: ['#planetarytransit', '#astrologytransit', '#cosmicshift'],
  lunar: ['#moonphases', '#fullmoon', '#newmoon', '#moonmagic'],
  crystals: ['#crystalhealing', '#crystals', '#healingstones', '#gemstones'],
};

function normalise(text: string): string {
  // Protect URLs from sentence-splitting normaliser
  const urls: string[] = [];
  let protected_ = text.replace(
    /https?:\/\/[^\s)]+|lunary\.app\/[^\s)]+/g,
    (m) => {
      urls.push(m);
      return `__URL${urls.length - 1}__`;
    },
  );

  let cleaned = normalizeGeneratedContent(protected_);
  cleaned = normaliseUkSpelling(cleaned);
  cleaned = cleaned.replace(/[\u2013\u2014]/g, ',');
  // Collapse double+ periods from sentence joining (e.g. "equal.. Key")
  cleaned = cleaned.replace(/\.{2,}/g, '.');
  // Fix space before punctuation (e.g. "Pisces , the")
  cleaned = cleaned.replace(/\s+([,;:.])/g, '$1');

  // Restore URLs
  cleaned = cleaned.replace(/__URL(\d+)__/g, (_, i) => urls[Number(i)]);
  return cleaned.trim();
}

/** Join sentence fragments with '. ' but skip the period if the fragment already ends with punctuation. */
function joinSentences(parts: string[]): string {
  return parts
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (/[.!?]$/.test(p) ? p : `${p}.`))
    .join(' ');
}

function capitalise(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function isoTime(dateStr: string, hourUtc: number): string {
  const d = new Date(dateStr);
  d.setUTCHours(hourUtc, 0, 0, 0);
  return d.toISOString();
}

function topEvent(events: CalendarEvent[]): CalendarEvent | null {
  if (events.length === 0) return null;
  return events.reduce((best, e) => (e.score > best.score ? e : best));
}

function maxScore(events: CalendarEvent[]): number {
  if (events.length === 0) return 0;
  return Math.max(...events.map((e) => e.score));
}

function findSnippetForEvent(event: CalendarEvent): GrimoireSnippet | null {
  if (event.planet && event.sign) {
    // Prefer transit pages over horoscope/placement pages
    const results = searchGrimoireForTopic(`${event.planet} ${event.sign}`, 5);
    const transit = results.find((r) => r.url.includes('/transits/'));
    if (transit) return transit;
    const placement = results.find((r) => r.url.includes('/placements/'));
    if (placement) return placement;
    // Skip horoscope pages — they're not about the transit
    const nonHoroscope = results.find((r) => !r.url.includes('/horoscope'));
    if (nonHoroscope) return nonHoroscope;
  }
  // For sabbats/equinox/solstice, prefer the sabbat article over a spell
  const results = searchGrimoireForTopic(event.name, 5);
  if (['sabbat', 'equinox', 'solstice'].includes(event.eventType)) {
    const sabbatArticle = results.find(
      (r) => r.category === 'sabbats' || r.url.includes('/sabbats/'),
    );
    if (sabbatArticle) return sabbatArticle;
  }
  return results[0] || null;
}

/** Build a grimoire URL for the event. Known page patterns take priority over search results. */
function eventGrimoireUrl(
  event: CalendarEvent,
  snippet: GrimoireSnippet | null,
): string | null {
  const base = 'https://lunary.app/grimoire';
  // Sabbats have a known URL pattern
  if (['sabbat', 'equinox', 'solstice'].includes(event.eventType)) {
    const slug = event.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/-+$/, '');
    return `${base}/sabbats/${slug}`;
  }
  // Retrogrades link to the event page
  if (
    event.eventType === 'retrograde_station' ||
    event.eventType === 'active_retrograde'
  ) {
    if (event.planet) {
      const year = new Date(event.date).getFullYear();
      return `${base}/events/${year}/${event.planet.toLowerCase()}-retrograde`;
    }
  }
  // Planet transits link to the placement page
  if (event.planet && event.sign) {
    return `${base}/placements/${event.planet.toLowerCase()}-in-${event.sign.toLowerCase()}`;
  }
  // Use snippet URL only if it's an article, not a glossary/spell
  if (
    snippet?.url &&
    !snippet.url.includes('/spells/') &&
    !snippet.url.includes('/glossary')
  ) {
    return snippet.url;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Variety inserts (Wed + Sat only)
// ---------------------------------------------------------------------------

function getVarietyInsert(dateStr: string): Variety | null {
  const rng = seededRandom(`variety-${dateStr}`);
  const dow = new Date(dateStr).getUTCDay();
  if (dow !== 3 && dow !== 6) return null;

  const roll = rng();
  if (roll < 0.4)
    return {
      type: 'persona',
      text: PERSONA_HOOKS[Math.floor(rng() * PERSONA_HOOKS.length)],
    };
  if (roll < 0.7)
    return {
      type: 'question',
      text: QUESTION_HOOKS[Math.floor(rng() * QUESTION_HOOKS.length)],
    };
  return {
    type: 'closing',
    text: CLOSING_HOOKS[Math.floor(rng() * CLOSING_HOOKS.length)],
  };
}

// ---------------------------------------------------------------------------
// Category rotation (quiet days)
// ---------------------------------------------------------------------------

function pickCategoryTopic(dateStr: string): {
  category: string;
  snippet: GrimoireSnippet | null;
} {
  const rng = seededRandom(`cat-${dateStr}`);
  const pool: string[] = [];
  for (const [cat, weight] of Object.entries(THEME_CATEGORY_WEIGHTS)) {
    for (let i = 0; i < weight; i++) pool.push(cat);
  }
  const category = pool[Math.floor(rng() * pool.length)];

  const themes = categoryThemes.filter((t) => t.category === category);
  if (themes.length === 0) return { category, snippet: null };

  const theme = themes[Math.floor(rng() * themes.length)];
  const facets = theme.facetPool?.length ? theme.facetPool : theme.facets;
  const facet = facets[Math.floor(rng() * facets.length)];
  const snippets = searchGrimoireForTopic(facet.title, 1);
  return { category, snippet: snippets[0] || null };
}

// ---------------------------------------------------------------------------
// Pinterest hashtags
// ---------------------------------------------------------------------------

function transitHashtags(
  event: CalendarEvent,
  snippet: GrimoireSnippet | null,
): string[] {
  const tags = [...BROAD_HASHTAGS];
  if (event.planet) {
    tags.push(
      `#${event.planet.toLowerCase()}transit`,
      `#${event.planet.toLowerCase()}astrology`,
    );
  }
  if (event.sign) {
    tags.push(
      `#${event.sign.toLowerCase()}`,
      `#${event.sign.toLowerCase()}season`,
    );
  }
  if (event.eventType === 'retrograde_station') tags.push('#retrograde');
  if (event.planet && event.sign) {
    tags.push(`#${event.planet.toLowerCase()}in${event.sign.toLowerCase()}`);
  }
  if (snippet?.category) tags.push(`#${snippet.category}meaning`);
  tags.push('#astrologyguide', '#cosmiccalendar');
  return tags.slice(0, 15);
}

function categoryHashtags(
  category: string,
  snippet: GrimoireSnippet | null,
): string[] {
  const tags = [
    ...BROAD_HASHTAGS.slice(0, 2),
    ...(CATEGORY_HASHTAGS[category] || []).slice(0, 5),
  ];
  if (snippet?.title) {
    tags.push(
      `#${snippet.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '')
        .slice(0, 30)}`,
    );
  }
  tags.push('#spiritualgrowth', '#metaphysical', '#cosmicknowledge');
  return tags.slice(0, 15);
}

// ---------------------------------------------------------------------------
// Per-platform content: transit
// ---------------------------------------------------------------------------

function isArticleSnippet(snippet: GrimoireSnippet | null): boolean {
  if (!snippet?.url) return false;
  return (
    !snippet.url.includes('/glossary') && !snippet.url.includes('/spells/')
  );
}

function linkedinTransit(
  event: CalendarEvent,
  snippet: GrimoireSnippet | null,
): string {
  const p = [event.name, ''];
  if (event.rarityFrame) p.push(capitalise(event.rarityFrame) + '.', '');
  if (event.historicalContext) p.push(event.historicalContext, '');
  // Only use snippet content when it's a real article, not a glossary/spell entry
  if (
    isArticleSnippet(snippet) &&
    snippet?.keyPoints &&
    snippet.keyPoints.length > 0
  ) {
    p.push(...snippet.keyPoints.slice(0, 3), '');
  }
  if (event.hookSuggestions[0]) p.push(event.hookSuggestions[0]);
  if (event.sabbatData?.ritualSuggestions?.[0]) {
    p.push('', `Try this: ${event.sabbatData.ritualSuggestions[0]}.`);
  }
  const url = eventGrimoireUrl(event, snippet);
  if (url) p.push('', url);
  return normalise(p.join('\n'));
}

function pinterestTransit(
  event: CalendarEvent,
  snippet: GrimoireSnippet | null,
): {
  content: string;
  hashtags: string[];
} {
  const desc = [event.rarityFrame || event.name];
  if (event.historicalContext) desc.push(event.historicalContext);
  if (isArticleSnippet(snippet) && snippet?.keyPoints)
    desc.push(...snippet.keyPoints.slice(0, 2));
  if (event.hookSuggestions[0]) desc.push(event.hookSuggestions[0]);
  const url = eventGrimoireUrl(event, snippet);
  desc.push(
    url
      ? `Learn more at ${url.replace('https://', '')}`
      : 'Learn more at lunary.app/grimoire',
  );
  return {
    content: `${event.name}\n\n${normalise(joinSentences(desc))}`,
    hashtags: transitHashtags(event, snippet),
  };
}

function blueskyTransit(
  event: CalendarEvent,
  snippet: GrimoireSnippet | null,
): string {
  const p: string[] = [];
  p.push(event.hookSuggestions[0] || event.name);
  if (event.rarityFrame) p.push(capitalise(event.rarityFrame));
  const url = eventGrimoireUrl(event, snippet);
  if (url) p.push(`Read more: ${url}`);
  return normalise(p.join('\n\n'));
}

// ---------------------------------------------------------------------------
// Per-platform content: category rotation
// ---------------------------------------------------------------------------

function linkedinCategory(
  snippet: GrimoireSnippet | null,
  category: string,
  variety: Variety | null,
): string {
  const p: string[] = [];
  if (variety) p.push(variety.text, '');
  if (snippet) {
    p.push(snippet.title, '');
    if (snippet.summary) p.push(snippet.summary);
    if (snippet.keyPoints.length > 0)
      p.push('', snippet.keyPoints.slice(0, 3).join('\n'));
    if (snippet.url) p.push('', `Explore: ${snippet.url}`);
  } else {
    p.push(
      `Today we are exploring ${category}: a topic that connects the everyday to something much larger.`,
    );
  }
  return normalise(p.join('\n'));
}

function pinterestCategory(
  snippet: GrimoireSnippet | null,
  category: string,
): {
  content: string;
  hashtags: string[];
} {
  const title = snippet?.title || `${capitalise(category)} guide`;
  const desc: string[] = [];
  if (snippet?.summary) desc.push(snippet.summary);
  if (snippet?.keyPoints) desc.push(...snippet.keyPoints.slice(0, 2));
  desc.push('Discover more at lunary.app/grimoire');
  return {
    content: `${title}\n\n${normalise(joinSentences(desc))}`,
    hashtags: categoryHashtags(category, snippet),
  };
}

function blueskyCategory(
  snippet: GrimoireSnippet | null,
  category: string,
  variety: Variety | null,
): string {
  if (variety?.type === 'question') return normalise(variety.text);
  const p: string[] = [];
  if (snippet) {
    p.push(snippet.keyPoints[0] || snippet.summary || snippet.title);
    if (snippet.url) p.push(snippet.url);
  } else {
    p.push(
      `Something worth knowing about ${category} today. More in the grimoire: https://lunary.app/grimoire`,
    );
  }
  return normalise(p.join('\n\n'));
}

// ---------------------------------------------------------------------------
// Post assembly
// ---------------------------------------------------------------------------

function makePost(
  platform: DailyTextPost['platform'],
  content: string,
  dateStr: string,
  source: DailyTextPost['source'],
  hashtags?: string[],
  eventScore?: number,
  imageUrl?: string,
): DailyTextPost {
  return {
    platform,
    content,
    hashtags,
    imageUrl,
    scheduledTime: isoTime(dateStr, PLATFORM_TIMES_UTC[platform]),
    source,
    eventScore,
  };
}

/** Generate an OG image URL for a transit event. */
function transitImageUrl(
  event: CalendarEvent,
  snippet: GrimoireSnippet | null,
  platform: string,
): string {
  const baseUrl = getImageBaseUrl();
  // If we have a real article snippet, use its category/slug for the image
  if (isArticleSnippet(snippet)) {
    return getEducationalImageUrl(snippet, baseUrl, platform);
  }
  // Build from event data
  const category =
    event.category === 'retrograde' ? 'planetary' : event.category;
  const slug =
    event.planet && event.sign
      ? `${event.planet.toLowerCase()}-in-${event.sign.toLowerCase()}`
      : event.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return getThematicImageUrl(category, event.name, baseUrl, platform, slug);
}

/** Generate an OG image URL for a category rotation post. */
function categoryImageUrl(
  snippet: GrimoireSnippet | null,
  category: string,
  platform: string,
): string {
  const baseUrl = getImageBaseUrl();
  if (snippet) {
    return getEducationalImageUrl(snippet, baseUrl, platform);
  }
  return getThematicImageUrl(category, capitalise(category), baseUrl, platform);
}

function transitPostForPlatform(
  platform: DailyTextPost['platform'],
  event: CalendarEvent,
  snippet: GrimoireSnippet | null,
  dateStr: string,
): DailyTextPost {
  const image = transitImageUrl(event, snippet, platform);
  switch (platform) {
    case 'linkedin':
      return makePost(
        platform,
        linkedinTransit(event, snippet),
        dateStr,
        'transit',
        undefined,
        event.score,
        image,
      );
    case 'pinterest': {
      const pin = pinterestTransit(event, snippet);
      return makePost(
        platform,
        pin.content,
        dateStr,
        'transit',
        pin.hashtags,
        event.score,
        image,
      );
    }
    case 'bluesky':
      return makePost(
        platform,
        blueskyTransit(event, snippet),
        dateStr,
        'transit',
        undefined,
        event.score,
        image,
      );
  }
}

function hybridPostForPlatform(
  platform: DailyTextPost['platform'],
  event: CalendarEvent,
  catSnippet: GrimoireSnippet | null,
  category: string,
  dateStr: string,
  variety: Variety | null,
): DailyTextPost {
  const image = categoryImageUrl(catSnippet, category, platform);
  switch (platform) {
    case 'linkedin': {
      const base = linkedinCategory(catSnippet, category, variety);
      const note = event.rarityFrame
        ? `\n\nCosmic context: ${event.rarityFrame}`
        : '';
      return makePost(
        platform,
        normalise(base + note),
        dateStr,
        'transit',
        undefined,
        event.score,
        image,
      );
    }
    case 'pinterest': {
      const pin = pinterestCategory(catSnippet, category);
      return makePost(
        platform,
        `${event.name}\n\n${pin.content}`,
        dateStr,
        'transit',
        pin.hashtags,
        event.score,
        image,
      );
    }
    case 'bluesky': {
      const base = blueskyCategory(catSnippet, category, variety);
      const hook = event.hookSuggestions[0] || '';
      const content = hook ? normalise(`${hook}\n\n${base}`) : base;
      return makePost(
        platform,
        content,
        dateStr,
        'transit',
        undefined,
        event.score,
        image,
      );
    }
  }
}

function categoryPostForPlatform(
  platform: DailyTextPost['platform'],
  snippet: GrimoireSnippet | null,
  category: string,
  dateStr: string,
  variety: Variety | null,
): DailyTextPost {
  const source: DailyTextPost['source'] =
    variety?.type === 'persona' ? 'persona' : 'category-rotation';
  const image = categoryImageUrl(snippet, category, platform);
  switch (platform) {
    case 'linkedin':
      return makePost(
        platform,
        linkedinCategory(snippet, category, variety),
        dateStr,
        source,
        undefined,
        undefined,
        image,
      );
    case 'pinterest': {
      const pin = pinterestCategory(snippet, category);
      return makePost(
        platform,
        pin.content,
        dateStr,
        source,
        pin.hashtags,
        undefined,
        image,
      );
    }
    case 'bluesky':
      return makePost(
        platform,
        blueskyCategory(snippet, category, variety),
        dateStr,
        source,
        undefined,
        undefined,
        image,
      );
  }
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Generate daily text posts for LinkedIn, Pinterest and Bluesky.
 *
 * Transit-first: on significant days every platform leads with the transit.
 * On quiet days, falls back to weighted category rotation.
 */
export async function generateDailyTextPosts(
  dateStr: string,
): Promise<DailyTextPost[]> {
  const events = await getEventCalendarForDate(dateStr);
  const score = maxScore(events);
  const top = topEvent(events);
  const variety = getVarietyInsert(dateStr);

  // CRITICAL / HIGH (score >= 60): full transit content everywhere
  if (score >= 60 && top) {
    const snippet = findSnippetForEvent(top);
    return TEXT_PLATFORMS.map((p) =>
      transitPostForPlatform(p, top, snippet, dateStr),
    );
  }

  // MEDIUM (30-59): hybrid, topical with transit context woven in
  if (score >= 30 && top) {
    const { category, snippet: catSnippet } = pickCategoryTopic(dateStr);
    return TEXT_PLATFORMS.map((p) =>
      hybridPostForPlatform(p, top, catSnippet, category, dateStr, variety),
    );
  }

  // LOW / quiet (< 30): category rotation
  const { category, snippet } = pickCategoryTopic(dateStr);
  return TEXT_PLATFORMS.map((p) =>
    categoryPostForPlatform(p, snippet, category, dateStr, variety),
  );
}
