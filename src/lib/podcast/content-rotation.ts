import {
  extractGrimoireSnippet,
  type GrimoireSnippet,
} from '@/lib/social/grimoire-content';
import { type GrimoireEntry } from '@/constants/seo/grimoire-search-index';
import { getSabbatForDate } from '@/lib/social/weekly-themes';

// Import ALL rich content data files (same as grimoire-content.ts)
import zodiacSigns from '@/data/zodiac-signs.json';
import tarotCards from '@/data/tarot-cards.json';
import crystals from '@/data/crystals.json';
import numerology from '@/data/numerology.json';
import runes from '@/data/runes.json';
import chakras from '@/data/chakras.json';
import spells from '@/data/spells.json';
import sabbats from '@/data/sabbats.json';
import planetaryBodies from '@/data/planetary-bodies.json';
import correspondences from '@/data/correspondences.json';

/**
 * Podcast-specific category rotation order.
 * Each episode cycles through these categories deterministically.
 * 10 categories = each category revisited every ~10 weeks.
 */
const PODCAST_CATEGORIES = [
  'zodiac',
  'tarot',
  'crystals',
  'numerology',
  'spells',
  'planetary',
  'runes',
  'chakras',
  'sabbats',
  'correspondences',
] as const;

type PodcastCategory = (typeof PODCAST_CATEGORIES)[number];

const EXCLUDED_SLUG_PATTERNS = [/^horoscope/, /^daily-/, /^weekly-/];
const MIN_CONTENT_WORDS = 30;

/**
 * Build a flat list of all grimoire entries suitable for podcasts,
 * organized by podcast category.
 */
function getAllPodcastEntries(): Map<PodcastCategory, GrimoireEntry[]> {
  const entryMap = new Map<PodcastCategory, GrimoireEntry[]>();
  for (const cat of PODCAST_CATEGORIES) {
    entryMap.set(cat, []);
  }

  // Zodiac signs
  Object.keys(zodiacSigns).forEach((key) => {
    const sign = zodiacSigns[key as keyof typeof zodiacSigns];
    entryMap.get('zodiac')!.push({
      slug: `zodiac/${key}`,
      title: sign.name,
      category: 'zodiac',
      keywords: sign.keywords.map((k) => k.toLowerCase()),
      summary: sign.description,
      relatedSlugs: [],
    });
  });

  // Tarot Major Arcana
  Object.keys(tarotCards.majorArcana).forEach((key) => {
    const card =
      tarotCards.majorArcana[key as keyof typeof tarotCards.majorArcana];
    entryMap.get('tarot')!.push({
      slug: `tarot/${key
        .replace(/([A-Z])/g, '-$1')
        .toLowerCase()
        .replace(/^-/, '')}`,
      title: card.name,
      category: 'tarot',
      keywords: card.keywords,
      summary: card.information,
      relatedSlugs: [],
    });
  });

  // Crystals
  (crystals as any[]).forEach((crystal) => {
    entryMap.get('crystals')!.push({
      slug: `crystals/${crystal.id}`,
      title: crystal.name,
      category: 'crystal',
      keywords: crystal.properties || [],
      summary: crystal.description,
      relatedSlugs: [],
    });
  });

  // Numerology - Angel Numbers
  Object.keys(numerology.angelNumbers).forEach((num) => {
    const angel =
      numerology.angelNumbers[num as keyof typeof numerology.angelNumbers];
    entryMap.get('numerology')!.push({
      slug: `numerology/angel-numbers/${num}`,
      title: angel.name,
      category: 'numerology',
      keywords: angel.keywords,
      summary: angel.description,
      relatedSlugs: [],
    });
  });

  // Spells
  (spells as any[]).forEach((spell) => {
    entryMap.get('spells')!.push({
      slug: `spells/${spell.id}`,
      title: spell.name || spell.title || spell.id,
      category: 'ritual',
      keywords: [spell.category, spell.type, spell.difficulty].filter(Boolean),
      summary: spell.description || '',
      relatedSlugs: [],
    });
  });

  // Planetary bodies
  Object.keys(planetaryBodies).forEach((key) => {
    const planet = planetaryBodies[key as keyof typeof planetaryBodies];
    entryMap.get('planetary')!.push({
      slug: `astronomy/planets/${key}`,
      title: planet.name,
      category: 'planet',
      keywords: planet.keywords,
      summary: planet.mysticalProperties,
      relatedSlugs: [],
    });
  });

  // Runes
  Object.keys(runes).forEach((key) => {
    const rune = runes[key as keyof typeof runes];
    entryMap.get('runes')!.push({
      slug: `runes/${key}`,
      title: `${rune.name} Rune (${rune.symbol})`,
      category: 'concept',
      keywords: rune.keywords,
      summary: rune.divinationMeaning || rune.uprightMeaning.split('.')[0],
      relatedSlugs: [],
    });
  });

  // Chakras
  Object.keys(chakras).forEach((key) => {
    const chakra = chakras[key as keyof typeof chakras];
    entryMap.get('chakras')!.push({
      slug: `chakras/${key}`,
      title: `${chakra.name} Chakra (${chakra.sanskritName})`,
      category: 'concept',
      keywords: chakra.keywords,
      summary: chakra.mysticalProperties.split('.').slice(0, 2).join('.'),
      relatedSlugs: [],
    });
  });

  // Sabbats
  (sabbats as any[]).forEach((sabbat) => {
    entryMap.get('sabbats')!.push({
      slug: `wheel-of-the-year/${sabbat.name.toLowerCase()}`,
      title: sabbat.name,
      category: 'season',
      keywords: sabbat.keywords,
      summary: sabbat.description,
      relatedSlugs: [],
    });
  });

  // Correspondences - Elements
  Object.keys(correspondences.elements).forEach((key) => {
    const element =
      correspondences.elements[key as keyof typeof correspondences.elements];
    entryMap.get('correspondences')!.push({
      slug: `correspondences/elements/${key.toLowerCase()}`,
      title: `${key} Element`,
      category: 'concept',
      keywords: element.qualities,
      summary: element.description,
      relatedSlugs: [],
    });
  });

  return entryMap;
}

/**
 * Check if a grimoire entry has enough content to produce a quality podcast episode.
 */
function isPodcastWorthy(entry: GrimoireEntry): boolean {
  if (EXCLUDED_SLUG_PATTERNS.some((p) => p.test(entry.slug))) return false;

  const wordCount = (entry.summary || '').split(/\s+/).length;
  if (wordCount < MIN_CONTENT_WORDS) {
    // Check if the entry has rich content that supplements the summary
    const snippet = extractGrimoireSnippet(entry);
    const totalWords =
      snippet.keyPoints.join(' ').split(/\s+/).length + wordCount;
    if (totalWords < MIN_CONTENT_WORDS) return false;
  }

  return true;
}

/**
 * Seasonal/holiday overrides for time-relevant podcast topics.
 * Each entry maps a date range (month/day) to a preferred category + slug keyword.
 * Checked in order — first match wins.
 */
const SEASONAL_OVERRIDES: {
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  category: PodcastCategory;
  slugKeyword: string;
}[] = [
  // Valentine's Day → Venus
  {
    name: "Valentine's Day",
    startMonth: 2,
    startDay: 12,
    endMonth: 2,
    endDay: 16,
    category: 'planetary',
    slugKeyword: 'venus',
  },
  // Spring Equinox → Aries / Ostara
  {
    name: 'Spring Equinox',
    startMonth: 3,
    startDay: 18,
    endMonth: 3,
    endDay: 22,
    category: 'zodiac',
    slugKeyword: 'aries',
  },
  // Summer Solstice → Cancer / Litha
  {
    name: 'Summer Solstice',
    startMonth: 6,
    startDay: 19,
    endMonth: 6,
    endDay: 23,
    category: 'zodiac',
    slugKeyword: 'cancer',
  },
  // Autumn Equinox → Libra / Mabon
  {
    name: 'Autumn Equinox',
    startMonth: 9,
    startDay: 20,
    endMonth: 9,
    endDay: 24,
    category: 'zodiac',
    slugKeyword: 'libra',
  },
  // Winter Solstice → Capricorn / Yule
  {
    name: 'Winter Solstice',
    startMonth: 12,
    startDay: 19,
    endMonth: 12,
    endDay: 23,
    category: 'zodiac',
    slugKeyword: 'capricorn',
  },
  // Halloween / Samhain → Scorpio
  {
    name: 'Halloween',
    startMonth: 10,
    startDay: 29,
    endMonth: 11,
    endDay: 1,
    category: 'zodiac',
    slugKeyword: 'scorpio',
  },
  // New Year → Numerology (111)
  {
    name: 'New Year',
    startMonth: 12,
    startDay: 30,
    endMonth: 1,
    endDay: 2,
    category: 'numerology',
    slugKeyword: '111',
  },
  // Mercury Retrograde awareness (approximate common periods)
  {
    name: 'Mercury Focus',
    startMonth: 4,
    startDay: 1,
    endMonth: 4,
    endDay: 5,
    category: 'planetary',
    slugKeyword: 'mercury',
  },
  // Full Moon focus mid-month fallback → Moon
  {
    name: 'Lunar Focus',
    startMonth: 1,
    startDay: 13,
    endMonth: 1,
    endDay: 15,
    category: 'planetary',
    slugKeyword: 'moon',
  },
];

function getSeasonalOverride(
  date: Date,
): (typeof SEASONAL_OVERRIDES)[number] | null {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  for (const override of SEASONAL_OVERRIDES) {
    // Handle ranges that cross month boundaries (e.g. Dec 30 - Jan 2)
    if (override.startMonth > override.endMonth) {
      if (
        (month === override.startMonth && day >= override.startDay) ||
        (month === override.endMonth && day <= override.endDay)
      ) {
        return override;
      }
    } else if (
      (month === override.startMonth &&
        day >= override.startDay &&
        (month < override.endMonth || day <= override.endDay)) ||
      (month === override.endMonth &&
        day <= override.endDay &&
        month > override.startMonth) ||
      (month > override.startMonth && month < override.endMonth)
    ) {
      return override;
    }
  }

  return null;
}

/**
 * Select podcast topics using deterministic category cycling,
 * with seasonal/holiday and sabbat overrides for time-relevant content.
 *
 * Priority: seasonal holidays → sabbats → deterministic rotation.
 */
export function selectPodcastTopics(
  episodeNumber: number,
  recentGrimoireSlugs: string[] = [],
): GrimoireSnippet[] {
  const allEntries = getAllPodcastEntries();
  const now = new Date();
  const coveredSlugs = new Set(recentGrimoireSlugs);

  let primaryCategory: PodcastCategory = PODCAST_CATEGORIES[0];
  let primaryEntry: GrimoireEntry | undefined;

  // 1. Check for seasonal/holiday override
  const seasonalOverride = getSeasonalOverride(now);
  if (seasonalOverride) {
    const categoryEntries = allEntries.get(seasonalOverride.category) || [];
    const match = categoryEntries.find((e) =>
      e.slug.includes(seasonalOverride.slugKeyword),
    );
    if (match && !coveredSlugs.has(match.slug)) {
      primaryCategory = seasonalOverride.category;
      primaryEntry = match;
    }
  }

  // 2. Check for sabbat override (within 7 days)
  if (!primaryEntry) {
    const sabbatCheck = getSabbatForDate(now);
    const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const sabbatCheckAhead = getSabbatForDate(weekAhead);
    const activeSabbat = sabbatCheck || sabbatCheckAhead;

    if (activeSabbat) {
      const sabbatEntries = allEntries.get('sabbats') || [];
      const sabbatName = activeSabbat.sabbat.name.toLowerCase();
      const sabbatEntry =
        sabbatEntries.find((e) => e.slug.includes(sabbatName)) ||
        sabbatEntries[0];
      if (sabbatEntry) {
        primaryCategory = 'sabbats';
        primaryEntry = sabbatEntry;
      }
    }
  }

  if (!primaryEntry) {
    // Deterministic category cycling
    const categoryIndex = (episodeNumber - 1) % PODCAST_CATEGORIES.length;
    primaryCategory = PODCAST_CATEGORIES[categoryIndex];
    const categoryEntries = (allEntries.get(primaryCategory) || []).filter(
      (e) => isPodcastWorthy(e) && !coveredSlugs.has(e.slug),
    );

    if (categoryEntries.length === 0) {
      // Fallback to any category with uncovered entries
      for (const cat of PODCAST_CATEGORIES) {
        const entries = (allEntries.get(cat) || []).filter(
          (e) => isPodcastWorthy(e) && !coveredSlugs.has(e.slug),
        );
        if (entries.length > 0) {
          primaryCategory = cat;
          const idx =
            Math.floor((episodeNumber - 1) / PODCAST_CATEGORIES.length) %
            entries.length;
          primaryEntry = entries[idx];
          break;
        }
      }
    } else {
      // Pick specific entry within category (cycle through uncovered entries)
      const entryIndex =
        Math.floor((episodeNumber - 1) / PODCAST_CATEGORIES.length) %
        categoryEntries.length;
      primaryEntry = categoryEntries[entryIndex];
    }
  }

  if (!primaryEntry) {
    // All topics covered — allow repeats from the full pool as last resort
    for (const cat of PODCAST_CATEGORIES) {
      const entries = (allEntries.get(cat) || []).filter(isPodcastWorthy);
      if (entries.length > 0) {
        primaryCategory = cat;
        primaryEntry = entries[episodeNumber % entries.length];
        break;
      }
    }
  }

  if (!primaryEntry) {
    return [];
  }

  const primarySnippet = extractGrimoireSnippet(primaryEntry);

  return [primarySnippet];
}

/**
 * Build episode title from selected topics.
 */
export function buildEpisodeTitle(topics: GrimoireSnippet[]): string {
  if (topics.length === 0) return 'The Grimoire';
  return `The Grimoire: ${topics[0].title}`;
}

/**
 * Build episode script content from grimoire snippets.
 * Produces ~2000-4000 chars suitable for a 5-10 min podcast episode.
 */
export function buildEpisodeContent(topics: GrimoireSnippet[]): string {
  const sections: string[] = [];

  for (const topic of topics) {
    const section: string[] = [];
    section.push(`## ${topic.title}`);
    section.push('');

    if (topic.summary) {
      section.push(topic.summary);
      section.push('');
    }

    if (topic.keyPoints.length > 0) {
      section.push('Key insights:');
      for (const point of topic.keyPoints) {
        section.push(`- ${point}`);
      }
      section.push('');
    }

    if (topic.fullContent) {
      const fc = topic.fullContent;
      if (fc.element) {
        section.push(`Element: ${fc.element}`);
      }
      if (fc.planet) {
        section.push(`Ruling planet: ${fc.planet}`);
      }
      if (fc.affirmation) {
        section.push(`Affirmation: "${fc.affirmation}"`);
      }
      if (fc.strengths && fc.strengths.length > 0) {
        section.push(`Strengths: ${fc.strengths.join(', ')}`);
      }
      if (fc.spiritualMeaning) {
        section.push(`Spiritual meaning: ${fc.spiritualMeaning}`);
      }
      if (fc.uprightMeaning) {
        section.push(`Upright meaning: ${fc.uprightMeaning}`);
      }
      if (fc.metaphysicalProperties) {
        section.push(`Properties: ${fc.metaphysicalProperties}`);
      }
      section.push('');
    }

    section.push(`Learn more at lunary.app/grimoire/${topic.slug}`);
    sections.push(section.join('\n'));
  }

  return sections.join('\n\n---\n\n');
}

/**
 * Generate a URL-friendly slug from episode number and title.
 */
export function generateEpisodeSlug(
  episodeNumber: number,
  title: string,
): string {
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

  return `episode-${episodeNumber}-${titleSlug}`;
}

/**
 * Build structured show notes for the episode page.
 */
export function buildShowNotes(topics: GrimoireSnippet[]): {
  sections: { title: string; content: string }[];
  grimoireLinks: { slug: string; title: string; url: string }[];
  keyPoints: string[];
} {
  const sections = topics.map((topic) => ({
    title: topic.title,
    content: topic.summary || '',
  }));

  const grimoireLinks = topics.map((topic) => ({
    slug: topic.slug,
    title: topic.title,
    url: `/grimoire/${topic.slug}`,
  }));

  const keyPoints = topics.flatMap((topic) => topic.keyPoints);

  return { sections, grimoireLinks, keyPoints };
}
