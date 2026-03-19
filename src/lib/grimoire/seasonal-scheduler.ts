/**
 * Seasonal Content Scheduler
 *
 * Maps astrological events to relevant grimoire articles and builds
 * social post suggestions when those events approach.
 *
 * Uses the existing event calendar (getUpcomingEvents / getEventCalendarForDate)
 * and grimoire search index to surface the right content at the right time.
 */

import {
  getUpcomingEvents,
  type CalendarEvent,
} from '@/lib/astro/event-calendar';
import {
  searchGrimoireIndex,
  type GrimoireEntry,
} from '@/constants/seo/grimoire-search-index';
import {
  extractGrimoireSnippet,
  type GrimoireSnippet,
} from '@/lib/social/grimoire-content';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SeasonalContentItem {
  /** The grimoire article slug */
  slug: string;
  /** Article title */
  title: string;
  /** Full grimoire URL */
  url: string;
  /** The event that triggered this suggestion */
  event: {
    name: string;
    date: string;
    rarity: CalendarEvent['rarity'];
    eventType: CalendarEvent['eventType'];
    score: number;
  };
  /** Why this article is relevant */
  reason: string;
  /** Rich snippet data when available */
  snippet?: GrimoireSnippet;
}

export interface SeasonalPost {
  /** Post text ready for social */
  content: string;
  /** The grimoire URL to link */
  url: string;
  /** Event context for scheduling decisions */
  eventContext: string;
  /** Suggested hashtags */
  hashtags: string[];
}

// ---------------------------------------------------------------------------
// Event-to-article mapping
// ---------------------------------------------------------------------------

/**
 * Static mapping from event keywords/types to grimoire slug patterns.
 * Each key is checked against event properties; values are search queries
 * or direct slugs to look up in the grimoire index.
 */
const EVENT_ARTICLE_MAP: {
  match: (event: CalendarEvent) => boolean;
  queries: string[];
  directSlugs: string[];
}[] = [
  // Saturn transits
  {
    match: (e) =>
      (e.planet === 'Saturn' && e.eventType === 'ingress') ||
      (e.planet === 'Saturn' && e.eventType === 'retrograde_station'),
    queries: ['saturn', 'saturn return', 'saturn transit'],
    directSlugs: [
      'astronomy/planets/saturn',
      'astronomy/retrogrades/saturn',
      'glossary#saturn',
      'glossary#saturn-return',
    ],
  },

  // Mercury retrograde
  {
    match: (e) =>
      e.planet === 'Mercury' &&
      (e.eventType === 'retrograde_station' ||
        e.eventType === 'active_retrograde'),
    queries: ['mercury retrograde', 'mercury'],
    directSlugs: [
      'mercury-retrograde',
      'events/2025/mercury-retrograde',
      'events/2026/mercury-retrograde',
      'astronomy/planets/mercury',
      'astronomy/retrogrades/mercury',
    ],
  },

  // Sabbats -- equinoxes and solstices
  {
    match: (e) => e.eventType === 'equinox' || e.eventType === 'solstice',
    queries: ['wheel of the year', 'sabbat'],
    directSlugs: ['wheel-of-the-year', 'sabbats', 'seasons'],
  },

  // Sabbat -- Ostara (Spring Equinox)
  {
    match: (e) =>
      e.eventType === 'equinox' && e.name.toLowerCase().includes('ostara'),
    queries: ['ostara', 'spring equinox'],
    directSlugs: ['wheel-of-the-year/ostara'],
  },

  // Sabbat -- Litha (Summer Solstice)
  {
    match: (e) =>
      e.eventType === 'solstice' && e.name.toLowerCase().includes('litha'),
    queries: ['litha', 'summer solstice', 'midsummer'],
    directSlugs: ['wheel-of-the-year/litha'],
  },

  // Sabbat -- Mabon (Autumn Equinox)
  {
    match: (e) =>
      e.eventType === 'equinox' && e.name.toLowerCase().includes('mabon'),
    queries: ['mabon', 'autumn equinox'],
    directSlugs: ['wheel-of-the-year/mabon'],
  },

  // Sabbat -- Yule (Winter Solstice)
  {
    match: (e) =>
      e.eventType === 'solstice' && e.name.toLowerCase().includes('yule'),
    queries: ['yule', 'winter solstice'],
    directSlugs: ['wheel-of-the-year/yule'],
  },

  // Fixed sabbats
  {
    match: (e) =>
      e.eventType === 'sabbat' && e.name.toLowerCase().includes('imbolc'),
    queries: ['imbolc', 'brigid', 'candlemas'],
    directSlugs: ['wheel-of-the-year/imbolc'],
  },
  {
    match: (e) =>
      e.eventType === 'sabbat' && e.name.toLowerCase().includes('beltane'),
    queries: ['beltane', 'may day'],
    directSlugs: ['wheel-of-the-year/beltane'],
  },
  {
    match: (e) =>
      e.eventType === 'sabbat' &&
      (e.name.toLowerCase().includes('lammas') ||
        e.name.toLowerCase().includes('lughnasadh')),
    queries: ['lammas', 'lughnasadh', 'first harvest'],
    directSlugs: ['wheel-of-the-year/lammas'],
  },
  {
    match: (e) =>
      e.eventType === 'sabbat' && e.name.toLowerCase().includes('samhain'),
    queries: ['samhain', 'halloween', 'ancestors'],
    directSlugs: ['wheel-of-the-year/samhain'],
  },

  // Moon phases
  {
    match: (e) => e.eventType === 'moon_phase',
    queries: ['moon phases', 'lunar cycle'],
    directSlugs: [
      'moon/phases',
      'guides/moon-phases-guide',
      'moon/phases/full-moon',
      'moon/phases/new-moon',
    ],
  },

  // Full moon specifically
  {
    match: (e) =>
      e.eventType === 'moon_phase' && e.name.toLowerCase().includes('full'),
    queries: ['full moon', 'full moon ritual'],
    directSlugs: ['moon/phases/full-moon', 'moon/full-moons'],
  },

  // New moon specifically
  {
    match: (e) =>
      e.eventType === 'moon_phase' && e.name.toLowerCase().includes('new'),
    queries: ['new moon', 'new moon ritual', 'manifestation'],
    directSlugs: ['moon/phases/new-moon'],
  },

  // Eclipses
  {
    match: (e) => e.eventType === 'eclipse',
    queries: ['eclipse', 'lunar eclipse', 'solar eclipse'],
    directSlugs: ['eclipses'],
  },

  // Zodiac season changes (Sun ingress)
  {
    match: (e) => e.planet === 'Sun' && e.eventType === 'ingress',
    queries: [], // dynamically built from the sign
    directSlugs: [], // dynamically built from the sign
  },

  // Jupiter transits
  {
    match: (e) => e.planet === 'Jupiter' && e.eventType === 'ingress',
    queries: ['jupiter'],
    directSlugs: ['astronomy/planets/jupiter'],
  },

  // Uranus transits
  {
    match: (e) => e.planet === 'Uranus' && e.eventType === 'ingress',
    queries: ['uranus'],
    directSlugs: ['astronomy/planets/uranus'],
  },

  // Neptune transits
  {
    match: (e) => e.planet === 'Neptune' && e.eventType === 'ingress',
    queries: ['neptune'],
    directSlugs: ['astronomy/planets/neptune'],
  },

  // Pluto transits
  {
    match: (e) => e.planet === 'Pluto' && e.eventType === 'ingress',
    queries: ['pluto'],
    directSlugs: ['astronomy/planets/pluto'],
  },
];

// ---------------------------------------------------------------------------
// Zodiac sign slug mapping (for dynamic zodiac season lookups)
// ---------------------------------------------------------------------------

const ZODIAC_SIGN_SLUGS: Record<string, string> = {
  Aries: 'zodiac/aries',
  Taurus: 'zodiac/taurus',
  Gemini: 'zodiac/gemini',
  Cancer: 'zodiac/cancer',
  Leo: 'zodiac/leo',
  Virgo: 'zodiac/virgo',
  Libra: 'zodiac/libra',
  Scorpio: 'zodiac/scorpio',
  Sagittarius: 'zodiac/sagittarius',
  Capricorn: 'zodiac/capricorn',
  Aquarius: 'zodiac/aquarius',
  Pisces: 'zodiac/pisces',
};

// ---------------------------------------------------------------------------
// Core logic
// ---------------------------------------------------------------------------

/**
 * Find grimoire articles relevant to a given calendar event.
 */
function findArticlesForEvent(event: CalendarEvent): GrimoireEntry[] {
  const results: GrimoireEntry[] = [];
  const seenSlugs = new Set<string>();

  const addEntry = (entry: GrimoireEntry) => {
    if (!seenSlugs.has(entry.slug)) {
      seenSlugs.add(entry.slug);
      results.push(entry);
    }
  };

  // Check static mappings
  for (const mapping of EVENT_ARTICLE_MAP) {
    if (!mapping.match(event)) continue;

    // Direct slug lookups
    for (const slug of mapping.directSlugs) {
      const matches = searchGrimoireIndex(slug, 1);
      const exact = matches.find((m) => m.slug === slug);
      if (exact) addEntry(exact);
    }

    // Query-based lookups
    for (const query of mapping.queries) {
      const matches = searchGrimoireIndex(query, 3);
      for (const match of matches) {
        addEntry(match);
      }
    }
  }

  // Dynamic: zodiac season changes (Sun enters sign)
  if (event.planet === 'Sun' && event.eventType === 'ingress' && event.sign) {
    const zodiacSlug = ZODIAC_SIGN_SLUGS[event.sign];
    if (zodiacSlug) {
      const matches = searchGrimoireIndex(zodiacSlug, 1);
      const exact = matches.find((m) => m.slug === zodiacSlug);
      if (exact) addEntry(exact);
    }

    // Also search for the sign name to find related articles
    const signMatches = searchGrimoireIndex(event.sign.toLowerCase(), 5);
    for (const match of signMatches) {
      addEntry(match);
    }
  }

  // Dynamic: planet-specific articles for any planet ingress
  if (event.planet && event.eventType === 'ingress') {
    const planetSlug = `astronomy/planets/${event.planet.toLowerCase()}`;
    const matches = searchGrimoireIndex(planetSlug, 1);
    const exact = matches.find((m) => m.slug === planetSlug);
    if (exact) addEntry(exact);
  }

  // Dynamic: transit pages (e.g. saturn-gemini-2030)
  if (event.planet && event.sign && event.eventType === 'ingress') {
    const transitSlug = `${event.planet.toLowerCase()}-${event.sign.toLowerCase()}`;
    const transitMatches = searchGrimoireIndex(transitSlug, 2);
    for (const match of transitMatches) {
      addEntry(match);
    }
  }

  // Dynamic: placement pages (e.g. saturn-in-gemini)
  if (event.planet && event.sign) {
    const placementQuery = `${event.planet.toLowerCase()} in ${event.sign.toLowerCase()}`;
    const placementMatches = searchGrimoireIndex(placementQuery, 2);
    for (const match of placementMatches) {
      addEntry(match);
    }
  }

  return results;
}

/**
 * Build a human-readable reason why an article is relevant to an event.
 */
function buildReason(event: CalendarEvent, article: GrimoireEntry): string {
  const { eventType, name, planet, sign } = event;

  switch (eventType) {
    case 'ingress':
      if (planet === 'Sun') {
        return `${sign} season begins -- time to explore ${article.title}`;
      }
      return `${name} -- relevant to ${article.title}`;

    case 'retrograde_station':
    case 'active_retrograde':
      return `${planet} retrograde -- good time to revisit ${article.title}`;

    case 'sabbat':
    case 'equinox':
    case 'solstice':
      return `${name} approaches -- seasonal content for ${article.title}`;

    case 'moon_phase':
      return `${name} -- lunar content timing for ${article.title}`;

    case 'eclipse':
      return `${name} -- eclipse energy connects to ${article.title}`;

    default:
      return `${name} -- related to ${article.title}`;
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Check what astrological events are coming in the next N days and return
 * matching grimoire article slugs with their event context.
 *
 * @param daysAhead - How many days into the future to scan (default 14)
 * @returns Array of seasonal content items sorted by event score (highest first)
 */
export async function getUpcomingSeasonalContent(
  daysAhead: number = 14,
): Promise<SeasonalContentItem[]> {
  const events = await getUpcomingEvents(daysAhead);
  const items: SeasonalContentItem[] = [];
  const seenKeys = new Set<string>();

  for (const event of events) {
    const articles = findArticlesForEvent(event);

    for (const article of articles) {
      // Dedupe by slug + event date to avoid repeating the same article
      // for the same event
      const key = `${article.slug}::${event.date}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      let snippet: GrimoireSnippet | undefined;
      try {
        snippet = extractGrimoireSnippet(article);
      } catch {
        // Some entries may not have rich data -- that is fine
      }

      items.push({
        slug: article.slug,
        title: article.title,
        url: `https://lunary.app/grimoire/${article.slug}`,
        event: {
          name: event.name,
          date: event.date,
          rarity: event.rarity,
          eventType: event.eventType,
          score: event.score,
        },
        reason: buildReason(event, article),
        snippet,
      });
    }
  }

  // Sort by event score descending so the most significant events surface first
  items.sort((a, b) => b.event.score - a.event.score);

  return items;
}

/**
 * Format a grimoire article reference into a social post based on event context.
 *
 * @param articleSlug - The grimoire slug to build a post for
 * @param eventContext - Human-readable event description (e.g. "Full Moon in Scorpio")
 * @returns A formatted social post or null if the article cannot be found
 */
export function buildSeasonalPost(
  articleSlug: string,
  eventContext: string,
): SeasonalPost | null {
  // Look up the article in the grimoire index
  const results = searchGrimoireIndex(articleSlug, 5);
  const article = results.find(
    (r) => r.slug === articleSlug || r.slug.endsWith(articleSlug),
  );

  if (!article) return null;

  let snippet: GrimoireSnippet | undefined;
  try {
    snippet = extractGrimoireSnippet(article);
  } catch {
    // Proceed without rich data
  }

  const url = `https://lunary.app/grimoire/${article.slug}`;

  // Build the post content
  const lines: string[] = [];

  // Opening hook tied to the event
  lines.push(buildEventHook(eventContext, article.title));

  // Key point from the article (if we have rich data)
  if (snippet?.keyPoints && snippet.keyPoints.length > 0) {
    // Pick the first substantive key point
    const point =
      snippet.keyPoints.find((p) => p.length > 20) ?? snippet.keyPoints[0];
    if (point) {
      lines.push('');
      lines.push(point);
    }
  } else if (article.summary && article.summary.length > 20) {
    lines.push('');
    // Use first sentence of summary
    const firstSentence = article.summary.split(/[.!?]/)[0]?.trim();
    if (firstSentence && firstSentence.length > 15) {
      lines.push(`${firstSentence}.`);
    }
  }

  // CTA with link
  lines.push('');
  lines.push(`Read more: ${url}`);

  const content = lines.join('\n');

  // Build relevant hashtags based on the article category
  const hashtags = buildHashtags(article.category, eventContext);

  return {
    content,
    url,
    eventContext,
    hashtags,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Build an opening hook line that ties the event to the article.
 */
function buildEventHook(eventContext: string, articleTitle: string): string {
  const ctx = eventContext.toLowerCase();

  if (ctx.includes('retrograde')) {
    return `${eventContext} is here. Time to revisit what ${articleTitle} teaches us.`;
  }

  if (ctx.includes('full moon')) {
    return `Under tonight's ${eventContext}, ${articleTitle} takes on deeper meaning.`;
  }

  if (ctx.includes('new moon')) {
    return `The ${eventContext} is the perfect time to explore ${articleTitle}.`;
  }

  if (ctx.includes('season') || ctx.includes('enters')) {
    return `${eventContext} -- here is what ${articleTitle} means for this cycle.`;
  }

  if (
    ctx.includes('equinox') ||
    ctx.includes('solstice') ||
    ctx.includes('sabbat') ||
    ctx.includes('ostara') ||
    ctx.includes('litha') ||
    ctx.includes('mabon') ||
    ctx.includes('yule') ||
    ctx.includes('imbolc') ||
    ctx.includes('beltane') ||
    ctx.includes('lammas') ||
    ctx.includes('samhain')
  ) {
    return `${eventContext} marks a turning point on the wheel of the year. Explore ${articleTitle}.`;
  }

  if (ctx.includes('eclipse')) {
    return `${eventContext} amplifies transformation. ${articleTitle} explains what to expect.`;
  }

  // Generic fallback
  return `${eventContext} -- a good moment to explore ${articleTitle}.`;
}

/**
 * Build hashtags appropriate to the article category and event.
 * Never includes #fyp, #foryou, or #viral.
 */
function buildHashtags(category: string, eventContext: string): string[] {
  const tags: string[] = ['#lunary', '#grimoire'];
  const ctx = eventContext.toLowerCase();

  // Event-specific tags
  if (ctx.includes('retrograde')) tags.push('#retrograde');
  if (ctx.includes('mercury')) tags.push('#mercuryretrograde');
  if (ctx.includes('saturn')) tags.push('#saturntransit');
  if (ctx.includes('full moon')) tags.push('#fullmoon');
  if (ctx.includes('new moon')) tags.push('#newmoon');
  if (ctx.includes('eclipse')) tags.push('#eclipse');
  if (ctx.includes('equinox')) tags.push('#equinox');
  if (ctx.includes('solstice')) tags.push('#solstice');

  // Category-specific tags
  const categoryTags: Record<string, string[]> = {
    zodiac: ['#astrology', '#zodiac'],
    planet: ['#astrology', '#planets'],
    tarot: ['#tarot', '#divination'],
    crystal: ['#crystals', '#healing'],
    ritual: ['#witchcraft', '#ritual'],
    concept: ['#astrology', '#cosmicwisdom'],
    horoscope: ['#horoscope', '#astrology'],
    numerology: ['#numerology', '#angelnumbers'],
  };

  const catTags = categoryTags[category] ?? ['#astrology'];
  for (const tag of catTags) {
    if (!tags.includes(tag)) tags.push(tag);
  }

  return tags.slice(0, 6);
}
