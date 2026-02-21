/**
 * YouTube metadata builder for podcast episode uploads
 * Generates SEO-optimized titles, descriptions, and tags
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

/** Base astrology tags for all podcast videos */
const BASE_TAGS = [
  'astrology',
  'astrology podcast',
  'weekly astrology',
  'cosmic forecast',
  'horoscope',
  'lunar astrology',
  'zodiac',
  'tarot',
  'spiritual podcast',
  'lunary',
];

/** Extract keyword tags from grimoire slugs */
function extractSlugTags(slugs: string[]): string[] {
  const tags: string[] = [];

  for (const slug of slugs) {
    // e.g. "zodiac/aries" → ["zodiac", "aries"]
    const parts = slug.split('/').filter(Boolean);
    for (const part of parts) {
      const formatted = part.replace(/-/g, ' ');
      if (
        formatted.length > 2 &&
        !BASE_TAGS.includes(formatted.toLowerCase())
      ) {
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

interface PodcastMetadataInput {
  episodeNumber: number;
  title: string;
  description: string;
  slug: string;
  grimoireSlugs: string[];
  transcript: { speaker: string; text: string }[] | null;
  durationSecs: number;
}

export function buildPodcastYouTubeMetadata(episode: PodcastMetadataInput): {
  title: string;
  description: string;
  tags: string[];
} {
  // Title: max 100 chars for YouTube
  const rawTitle = `The Grimoire by Lunary — Episode ${episode.episodeNumber}: ${episode.title}`;
  const title =
    rawTitle.length > 100 ? rawTitle.slice(0, 97) + '...' : rawTitle;

  // Build description sections
  const descParts: string[] = [];

  // 1. Episode summary
  descParts.push(episode.description);
  descParts.push('');

  // 2. Timestamps from transcript (group by speaker turns)
  if (episode.transcript && episode.transcript.length > 0) {
    const timestamps: string[] = [];
    let cumulativeWords = 0;
    const totalWords = episode.transcript.reduce(
      (sum, line) => sum + line.text.split(/\s+/).length,
      0,
    );

    // Group into ~8-12 timestamp entries for readability
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
        // Use first ~50 chars of the text as label
        const label =
          line.text.length > 50 ? line.text.slice(0, 47) + '...' : line.text;
        timestamps.push(`${ts} — ${label}`);
      }

      cumulativeWords += line.text.split(/\s+/).length;
    }

    if (timestamps.length > 0) {
      descParts.push('TIMESTAMPS');
      descParts.push(...timestamps);
      descParts.push('');
    }
  }

  // 3. Grimoire backlinks
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
    `Listen to this episode: ${buildUtmUrl(`/podcast/${episode.slug}`, 'youtube', 'social', 'podcast_description')}`,
  );
  descParts.push('');

  // 5. Channel subscribe CTA
  descParts.push(
    'Subscribe to The Grimoire by Lunary for weekly astrology, tarot, crystals, and cosmic wisdom.',
  );
  descParts.push(
    `${buildUtmUrl('/', 'youtube', 'social', 'podcast_description')} — Your Cosmic Guide`,
  );

  const description = descParts.join('\n');

  // Tags: base + extracted from grimoire slugs
  const slugTags = extractSlugTags(episode.grimoireSlugs);
  const tags = [...BASE_TAGS, ...slugTags].slice(0, 30); // YouTube limit ~500 chars / 30 tags

  return { title, description, tags };
}
