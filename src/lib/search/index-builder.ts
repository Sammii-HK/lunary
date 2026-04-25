/**
 * Smart search index builder for the Lunary Cmd-K overlay.
 *
 * Pure utilities — no React, no fetching. Takes raw inputs (journal entries,
 * glossary terms, upcoming transits) and produces a flat searchable index of
 * `SearchIndexItem`s. Then `searchIndex(items, query)` returns ranked matches
 * using simple substring + token-overlap scoring (no extra deps).
 */

import type { GlossaryTerm } from '@/lib/glossary/terms';

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SearchKind =
  | 'command'
  | 'journal'
  | 'glossary'
  | 'tarot'
  | 'transit';

export interface SearchIndexItem {
  id: string;
  kind: SearchKind;
  title: string;
  snippet: string;
  href: string;
  keywords: string[];
}

// ---------------------------------------------------------------------------
// Raw input shapes — kept loose so callers can pass whatever existing API
// payload they have without a re-shape.
// ---------------------------------------------------------------------------

export interface RawJournalEntry {
  id: number | string;
  content?: string;
  createdAt?: string;
  category?: string | null;
  source?: string | null;
  moodTags?: string[];
}

export interface RawTransit {
  type?: string;
  planet?: string;
  sign?: string | null;
  description?: string;
  date?: string | null;
  significance?: string;
}

export interface RawTarotReading {
  id: number | string;
  spreadName?: string;
  summary?: string;
  notes?: string | null;
  createdAt?: string;
  cards?: Array<{
    card?: {
      name?: string;
      keywords?: string[];
    };
    positionLabel?: string;
    insight?: string;
  }>;
}

export interface BuildIndexInput {
  journal?: RawJournalEntry[];
  glossary?: GlossaryTerm[];
  tarotReadings?: RawTarotReading[];
  transits?: RawTransit[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TOKEN_SPLIT = /[^\p{L}\p{N}]+/u;

function tokenize(text: string): string[] {
  if (!text) return [];
  return text
    .toLowerCase()
    .split(TOKEN_SPLIT)
    .filter((t) => t.length > 1);
}

function makeSnippet(text: string, max = 140): string {
  if (!text) return '';
  const trimmed = text.trim().replace(/\s+/g, ' ');
  return trimmed.length > max ? trimmed.slice(0, max - 1) + '\u2026' : trimmed;
}

// ---------------------------------------------------------------------------
// Index construction
// ---------------------------------------------------------------------------

export function buildSearchIndex(input: BuildIndexInput): SearchIndexItem[] {
  const out: SearchIndexItem[] = [];

  for (const entry of input.journal ?? []) {
    if (!entry || entry.content == null) continue;
    const content = String(entry.content);
    const title =
      content.length > 60 ? content.slice(0, 60).trim() + '\u2026' : content;
    out.push({
      id: `journal:${entry.id}`,
      kind: 'journal',
      title: title || 'Journal entry',
      snippet: makeSnippet(content),
      href: `/book-of-shadows/journal#entry-${entry.id}`,
      keywords: [
        ...tokenize(content),
        ...(entry.moodTags ?? []).map((t) => t.toLowerCase()),
        entry.category ?? '',
        entry.source ?? '',
      ].filter(Boolean),
    });
  }

  for (const term of input.glossary ?? []) {
    if (!term) continue;
    out.push({
      id: `glossary:${term.id}`,
      kind: 'glossary',
      title: term.term,
      snippet: term.short,
      href: `/glossary/${term.id}`,
      keywords: [
        term.term.toLowerCase(),
        ...term.aliases.map((a) => a.toLowerCase()),
        term.category,
        ...tokenize(term.short),
      ],
    });
  }

  for (const reading of input.tarotReadings ?? []) {
    if (!reading) continue;
    const cards = reading.cards ?? [];
    const cardNames = cards
      .map((entry) => entry.card?.name)
      .filter((name): name is string => Boolean(name));
    const cardKeywords = cards.flatMap((entry) => entry.card?.keywords ?? []);
    const insights = cards
      .map((entry) => entry.insight)
      .filter((insight): insight is string => Boolean(insight));
    const title = reading.spreadName || 'Tarot spread';
    const dateLabel = reading.createdAt
      ? new Date(reading.createdAt).toLocaleDateString()
      : '';
    const snippet = makeSnippet(
      [
        dateLabel,
        reading.summary,
        cardNames.length ? `Cards: ${cardNames.join(', ')}` : '',
        reading.notes || '',
      ]
        .filter(Boolean)
        .join(' — '),
    );

    out.push({
      id: `tarot:${reading.id}`,
      kind: 'tarot',
      title,
      snippet,
      href: '/tarot#spreads',
      keywords: [
        'tarot',
        'spread',
        title.toLowerCase(),
        ...cardNames.map((name) => name.toLowerCase()),
        ...cardKeywords.map((keyword) => keyword.toLowerCase()),
        ...tokenize(reading.summary ?? ''),
        ...tokenize(reading.notes ?? ''),
        ...insights.flatMap(tokenize),
      ].filter(Boolean),
    });
  }

  for (const t of input.transits ?? []) {
    if (!t) continue;
    const planet = t.planet ?? '';
    const sign = t.sign ?? '';
    const type = t.type ?? 'transit';
    const titleParts = [planet, type, sign].filter(Boolean);
    const title = titleParts.join(' ').trim() || 'Upcoming transit';
    const dateLabel = t.date ? new Date(t.date).toDateString() : '';
    const description = t.description ?? '';
    out.push({
      id: `transit:${planet}-${type}-${t.date ?? 'tba'}`,
      kind: 'transit',
      title,
      snippet: [dateLabel, description].filter(Boolean).join(' \u2014 '),
      href: '/transits',
      keywords: [
        planet.toLowerCase(),
        sign.toLowerCase(),
        type.toLowerCase(),
        t.significance?.toLowerCase() ?? '',
        ...tokenize(description),
      ].filter(Boolean),
    });
  }

  return out;
}

// ---------------------------------------------------------------------------
// Scoring + ranking
// ---------------------------------------------------------------------------

/** Returns a score in roughly [0, 100+]. Higher = better match. 0 = drop. */
function scoreItem(item: SearchIndexItem, query: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 0;

  const title = item.title.toLowerCase();
  const snippet = item.snippet.toLowerCase();

  let score = 0;

  // Whole-query substring matches.
  if (title === q) score += 60;
  else if (title.startsWith(q)) score += 40;
  else if (title.includes(q)) score += 25;

  if (snippet.includes(q)) score += 10;

  // Token overlap.
  const queryTokens = tokenize(q);
  if (queryTokens.length > 0) {
    const haystack = new Set(item.keywords);
    let hits = 0;
    for (const tok of queryTokens) {
      if (haystack.has(tok)) hits += 1;
      else if (title.includes(tok)) hits += 0.5;
    }
    score += (hits / queryTokens.length) * 30;
  }

  // Light kind nudge so typing "moon" surfaces glossary first then transits.
  if (item.kind === 'glossary' && title.startsWith(q)) score += 5;

  return score;
}

export function searchIndex(
  items: SearchIndexItem[],
  query: string,
  limit = 20,
): SearchIndexItem[] {
  const q = query.trim();
  if (!q) return [];

  const scored: { item: SearchIndexItem; score: number }[] = [];
  for (const item of items) {
    const s = scoreItem(item, q);
    if (s > 0) scored.push({ item, score: s });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.item);
}
