import {
  selectGrimoireTopics,
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
const MIN_CONTENT_WORDS = 200;

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
 * Select podcast topics using deterministic category cycling.
 *
 * Episode N picks:
 * 1. Primary category = PODCAST_CATEGORIES[(N-1) % 10]
 * 2. Primary entry = category entries[(N-1) / 10 % entries.length]
 * 3. 1-2 seasonal secondary topics from other categories
 *
 * Sabbat override: if a sabbat is within 7 days, override primary with sabbat topic.
 */
export function selectPodcastTopics(
  episodeNumber: number,
  recentGrimoireSlugs: string[] = [],
): GrimoireSnippet[] {
  const allEntries = getAllPodcastEntries();

  // Check for sabbat override (within 7 days)
  const now = new Date();
  const sabbatCheck = getSabbatForDate(now);
  // getSabbatForDate uses a 4-day window; extend to 7 days by also checking ahead
  const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const sabbatCheckAhead = getSabbatForDate(weekAhead);
  const activeSabbat = sabbatCheck || sabbatCheckAhead;

  let primaryCategory: PodcastCategory;
  let primaryEntry: GrimoireEntry;

  if (activeSabbat) {
    // Override with sabbat topic
    primaryCategory = 'sabbats';
    const sabbatEntries = allEntries.get('sabbats') || [];
    const sabbatName = activeSabbat.sabbat.name.toLowerCase();
    primaryEntry =
      sabbatEntries.find((e) => e.slug.includes(sabbatName)) ||
      sabbatEntries[0];
  } else {
    // Deterministic category cycling
    const categoryIndex = (episodeNumber - 1) % PODCAST_CATEGORIES.length;
    primaryCategory = PODCAST_CATEGORIES[categoryIndex];
    const categoryEntries = (allEntries.get(primaryCategory) || []).filter(
      isPodcastWorthy,
    );

    if (categoryEntries.length === 0) {
      // Fallback to any category with entries
      for (const cat of PODCAST_CATEGORIES) {
        const entries = (allEntries.get(cat) || []).filter(isPodcastWorthy);
        if (entries.length > 0) {
          primaryCategory = cat;
          const idx =
            Math.floor((episodeNumber - 1) / PODCAST_CATEGORIES.length) %
            entries.length;
          primaryEntry = entries[idx];
          break;
        }
      }
      primaryEntry = primaryEntry!;
    } else {
      // Pick specific entry within category (cycle through entries)
      const entryIndex =
        Math.floor((episodeNumber - 1) / PODCAST_CATEGORIES.length) %
        categoryEntries.length;
      primaryEntry = categoryEntries[entryIndex];
    }
  }

  // Skip if recently covered (within last 10 episodes)
  if (recentGrimoireSlugs.includes(primaryEntry.slug)) {
    const categoryEntries = (allEntries.get(primaryCategory) || []).filter(
      (e) => isPodcastWorthy(e) && !recentGrimoireSlugs.includes(e.slug),
    );
    if (categoryEntries.length > 0) {
      primaryEntry = categoryEntries[episodeNumber % categoryEntries.length];
    }
  }

  const primarySnippet = extractGrimoireSnippet(primaryEntry);

  // Pick 1-2 seasonal secondary topics from OTHER categories
  const seasonalTopics = selectGrimoireTopics('seasonal', 3)
    .filter(
      (t) =>
        t.slug !== primaryEntry.slug && !recentGrimoireSlugs.includes(t.slug),
    )
    .slice(0, 2)
    .map(extractGrimoireSnippet);

  return [primarySnippet, ...seasonalTopics].slice(0, 3);
}

/**
 * Build episode title from selected topics.
 */
export function buildEpisodeTitle(topics: GrimoireSnippet[]): string {
  if (topics.length === 0) return 'The Grimoire';

  const primary = topics[0];
  if (topics.length === 1) {
    return `The Grimoire: ${primary.title}`;
  }

  const secondary = topics[1];
  return `The Grimoire: ${primary.title} & ${secondary.title}`;
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
