#!/usr/bin/env tsx
/* eslint-disable no-console */
/**
 * Build Grimoire Search Index
 *
 * Generates a complete grimoire search index by combining:
 * - Existing curated entries
 * - All grimoire routes from sitemap
 * - Glossary terms (as anchored entries)
 *
 * Output: src/constants/seo/grimoire-search-index.json
 */

import fs from 'fs';
import path from 'path';
import sitemap from '@/app/sitemap';
import {
  GRIMOIRE_SEARCH_INDEX,
  type GrimoireEntry,
} from '@/constants/seo/grimoire-search-index';
import { ASTROLOGY_GLOSSARY } from '@/constants/grimoire/glossary';

const BASE_URL = 'https://lunary.app';
const OUTPUT_PATH = path.join(
  process.cwd(),
  'src/constants/seo/grimoire-search-index.json',
);

const CATEGORY_FALLBACK: GrimoireEntry['category'] = 'concept';

function normalizeSlug(slug: string): string {
  return slug.replace(/^\/+/, '').replace(/\/+$/, '');
}

function titleCase(input: string): string {
  const cleaned = input.trim();
  if (!cleaned) return '';
  if (cleaned.toLowerCase() === 'a-z') return 'A-Z';

  return cleaned
    .replace(/[-_]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function titleFromSlug(slug: string): string {
  const [pathPart, hashPart] = slug.split('#');
  if (hashPart) {
    return titleCase(hashPart);
  }

  const parts = pathPart.split('/').filter(Boolean);
  if (parts.length === 0) return 'Grimoire';

  const [root, sub, third, fourth] = parts;

  if (root === 'angel-numbers' && sub) {
    return `Angel Number ${sub}`;
  }

  if (root === 'life-path' && sub) {
    return `Life Path ${sub}`;
  }

  if (root === 'mirror-hours' && sub) {
    return `Mirror Hour ${sub.replace('-', ':')}`;
  }

  if (root === 'double-hours' && sub) {
    return `Double Hour ${sub.replace('-', ':')}`;
  }

  if (root === 'numerology' && sub && third) {
    const segmentTitle = titleCase(sub.replace('-', ' '));
    return `${segmentTitle} ${third}`;
  }

  if (root === 'moon' && sub === 'phases' && third) {
    return `${titleCase(third)} Moon`;
  }

  if (root === 'moon' && sub === 'full-moons' && third) {
    return `${titleCase(third)} Full Moon`;
  }

  if (root === 'moon' && /^\d{4}$/.test(sub || '')) {
    return `Moon Calendar ${sub}`;
  }

  if (root === 'horoscopes' && sub) {
    if (third && fourth) {
      return `${titleCase(sub)} Horoscope: ${titleCase(fourth)} ${third}`;
    }
    if (third) {
      return `${titleCase(sub)} Horoscope ${third}`;
    }
    return `${titleCase(sub)} Horoscope`;
  }

  if (root === 'tarot' && sub === 'spreads' && third) {
    return `Tarot Spread: ${titleCase(third)}`;
  }

  if (root === 'tarot' && sub === 'suits' && third) {
    return `Tarot Suit: ${titleCase(third)}`;
  }

  if (root === 'events' && sub && third) {
    return `${titleCase(third)} ${sub}`;
  }

  if (root === 'houses' && sub === 'overview' && third) {
    return `House: ${titleCase(third)}`;
  }

  if (root === 'birth-chart' && sub === 'houses' && third) {
    return `House ${third}`;
  }

  if (parts.length > 1 && /^\d+$/.test(parts[parts.length - 1])) {
    return `${titleCase(parts[parts.length - 2])} ${parts[parts.length - 1]}`;
  }

  return titleCase(parts[parts.length - 1]);
}

function inferCategory(slug: string): GrimoireEntry['category'] {
  const normalized = normalizeSlug(slug);

  if (normalized.startsWith('zodiac/')) return 'zodiac';
  if (normalized.startsWith('moon-in/')) return 'zodiac';
  if (normalized.startsWith('astronomy/planets')) return 'planet';
  if (normalized.startsWith('astronomy/retrogrades')) return 'planet';
  if (normalized.startsWith('tarot')) return 'tarot';
  if (normalized.startsWith('crystals/')) return 'crystal';
  if (normalized.startsWith('spells')) return 'ritual';
  if (normalized.startsWith('practices')) return 'ritual';
  if (normalized.startsWith('candle-magic')) return 'ritual';
  if (normalized.startsWith('moon/rituals')) return 'ritual';
  if (normalized.startsWith('horoscopes')) return 'horoscope';
  if (normalized.startsWith('chinese-zodiac')) return 'chinese-zodiac';
  if (normalized.startsWith('wheel-of-the-year')) return 'season';
  if (normalized.startsWith('sabbats')) return 'season';
  if (normalized.startsWith('seasons')) return 'season';
  if (normalized.startsWith('numerology')) return 'numerology';
  if (normalized.startsWith('angel-numbers')) return 'numerology';
  if (normalized.startsWith('life-path')) return 'numerology';
  if (normalized.startsWith('mirror-hours')) return 'numerology';
  if (normalized.startsWith('double-hours')) return 'numerology';
  if (normalized.startsWith('birthday')) return 'birthday';
  if (normalized.startsWith('compatibility')) return 'compatibility';
  if (normalized.startsWith('synastry')) return 'compatibility';
  if (normalized.startsWith('glossary')) return 'glossary';
  if (normalized.startsWith('archetypes')) return 'archetype';

  return CATEGORY_FALLBACK;
}

function extraKeywordsForSlug(slug: string): string[] {
  const normalized = normalizeSlug(slug);
  const extras: string[] = [];

  if (normalized.startsWith('mirror-hours/')) {
    const time = normalized.split('/')[1] || '';
    const timeWithColon = time.replace('-', ':');
    extras.push('mirror hour', 'mirror hours', time, timeWithColon);
  }

  if (normalized.startsWith('double-hours/')) {
    const time = normalized.split('/')[1] || '';
    const timeWithColon = time.replace('-', ':');
    extras.push(
      'double hour',
      'double hours',
      'mirror hour',
      'mirror hours',
      time,
      timeWithColon,
    );
  }

  return extras;
}

function buildKeywords(
  title: string,
  slug: string,
  category: string,
): string[] {
  const tokens = new Set<string>();
  const addTokens = (input: string) => {
    input
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .split(/[\s/-]+/)
      .filter(Boolean)
      .forEach((token) => tokens.add(token));
  };

  addTokens(title);
  addTokens(slug.replace('#', ' '));
  addTokens(category);
  extraKeywordsForSlug(slug).forEach((keyword) => addTokens(keyword));

  return Array.from(tokens);
}

function buildSummary(title: string): string {
  return `Explore ${title} in the Lunary Grimoire.`;
}

function createEntryFromSlug(slug: string): GrimoireEntry {
  const title = titleFromSlug(slug);
  const category = inferCategory(slug);

  return {
    slug,
    title,
    category,
    keywords: buildKeywords(title, slug, category),
    summary: buildSummary(title),
    relatedSlugs: [],
  };
}

function slugFromUrl(url: string): string | null {
  if (!url.includes('/grimoire')) return null;
  const withoutBase = url.startsWith(BASE_URL)
    ? url.slice(BASE_URL.length)
    : url;
  const clean = withoutBase.replace(/\/$/, '');
  if (!clean.startsWith('/grimoire')) return null;
  const slug = clean.replace(/^\/grimoire\/?/, '');
  if (!slug) return null;
  return normalizeSlug(slug);
}

function buildGlossaryEntries(existingSlugs: Set<string>): GrimoireEntry[] {
  const glossarySlugSet = new Set(ASTROLOGY_GLOSSARY.map((term) => term.slug));
  const entries: GrimoireEntry[] = [];

  for (const term of ASTROLOGY_GLOSSARY) {
    const slug = `glossary#${term.slug}`;
    if (existingSlugs.has(slug)) continue;

    const definition = term.definition.trim();
    const summary = definition.includes('.')
      ? `${definition.split('.').shift()}.`
      : definition;

    const relatedSlugs = (term.relatedTerms || [])
      .filter((related) => glossarySlugSet.has(related))
      .map((related) => `glossary#${related}`);

    const keywords = buildKeywords(term.term, slug, 'glossary').concat(
      term.relatedTerms || [],
    );

    entries.push({
      slug,
      title: term.term,
      category: 'glossary',
      keywords: Array.from(new Set(keywords)),
      summary,
      relatedSlugs,
    });
  }

  return entries;
}

function serializeIndex(entries: GrimoireEntry[]): string {
  return `${JSON.stringify(entries, null, 2)}\n`;
}

async function run() {
  console.log('🔎 Building grimoire search index...');

  const sitemapEntries = await sitemap();
  const sitemapSlugs = new Set<string>();

  for (const entry of sitemapEntries) {
    const slug = slugFromUrl(entry.url);
    if (slug) {
      sitemapSlugs.add(slug);
    }
  }

  const entriesBySlug = new Map<string, GrimoireEntry>();

  GRIMOIRE_SEARCH_INDEX.forEach((entry) => {
    const normalized = normalizeSlug(entry.slug);
    entriesBySlug.set(normalized, {
      ...entry,
      slug: normalized,
    });
  });

  const glossaryEntries = buildGlossaryEntries(new Set(entriesBySlug.keys()));
  glossaryEntries.forEach((entry) => {
    entriesBySlug.set(entry.slug, entry);
  });

  Array.from(sitemapSlugs).forEach((slug) => {
    if (!entriesBySlug.has(slug)) {
      entriesBySlug.set(slug, createEntryFromSlug(slug));
    }
  });

  const entries = Array.from(entriesBySlug.values()).sort((a, b) =>
    a.slug.localeCompare(b.slug),
  );

  const output = serializeIndex(entries);
  fs.writeFileSync(OUTPUT_PATH, output);

  console.log(`✅ Grimoire search index built: ${entries.length} entries`);
}

run().catch((error) => {
  console.error('❌ Failed to build grimoire search index:', error);
  process.exit(1);
});
