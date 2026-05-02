import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

/**
 * A minimal shape for a past journal entry that the anniversary finder can
 * consume. Designed to be a subset of `collections` rows or the API
 * `JournalEntry` type — callers can pass either as long as they map their
 * shape onto these fields.
 */
export interface PastJournalEntry {
  id: number | string;
  /** ISO timestamp the entry was created at. */
  createdAt: string;
  /** Plain text content of the entry. */
  content: string;
  /** Optional category — entries are matched only when category is journal/dream/ritual. */
  category?: 'journal' | 'dream' | 'ritual' | string | null;
  /** Optional cached moon phase from when the entry was written. */
  moonPhase?: string | null;
  /** Optional cached transit highlight from when the entry was written. */
  transitHighlight?: string | null;
}

/**
 * A minimal shape for a planetary-position snapshot, captured for the
 * anniversary date one year ago. Callers compute this on the server and
 * pass it in — the finder only formats it.
 */
export interface PastTransitSnapshot {
  /** ISO date string (YYYY-MM-DD) the snapshot represents. */
  date: string;
  /** Moon phase name (e.g. "Waxing Crescent"). */
  moonPhase?: string | null;
  /** Sign the Sun was in. */
  sunSign?: string | null;
  /** Sign the Moon was in. */
  moonSign?: string | null;
  /** A short, human-readable highlight (e.g. "Mars in Aries — fiery momentum"). */
  highlight?: string | null;
}

/**
 * The result returned to the UI when an anniversary is found.
 */
export interface AnniversaryRecord {
  /** The anniversary date (one year before `targetDate`), as ISO date string. */
  anniversaryDate: string;
  /** Number of years ago. Always >= 1. */
  yearsAgo: number;
  /** Optional past journal entry from that exact day. */
  journalEntry: PastJournalEntry | null;
  /** Optional short snippet (first ~180 chars) of the journal entry. */
  journalSnippet: string | null;
  /** Optional cosmic snapshot from that day. */
  transits: PastTransitSnapshot | null;
  /** Optional short transit description for the card. */
  transitsSnippet: string | null;
}

const DEFAULT_SNIPPET_MAX = 180;
const ALLOWED_CATEGORIES = new Set(['journal', 'dream', 'ritual']);

/**
 * Returns true if two ISO timestamps fall on the same calendar day in UTC.
 * Using UTC keeps anniversary matching deterministic regardless of where the
 * caller / DB happen to be — the journal API stores `created_at` as
 * timestamptz so dayjs.utc() gives a stable day key.
 */
function isSameUtcDay(a: string, b: string): boolean {
  const da = dayjs.utc(a);
  const db = dayjs.utc(b);
  if (!da.isValid() || !db.isValid()) return false;
  return da.format('YYYY-MM-DD') === db.format('YYYY-MM-DD');
}

/**
 * Truncate a string to `max` characters on a word boundary, with an ellipsis
 * if truncated. Returns null for empty / whitespace-only input.
 */
function makeSnippet(
  text: string | null | undefined,
  max: number = DEFAULT_SNIPPET_MAX,
): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length <= max) return trimmed;
  const slice = trimmed.slice(0, max);
  const lastSpace = slice.lastIndexOf(' ');
  const cut = lastSpace > max * 0.6 ? slice.slice(0, lastSpace) : slice;
  return `${cut.trimEnd()}…`;
}

/**
 * Build a short human-readable summary from a transit snapshot. Prefers an
 * explicit `highlight` if provided; otherwise composes from sun/moon/phase.
 */
function buildTransitsSnippet(
  snapshot: PastTransitSnapshot | null,
): string | null {
  if (!snapshot) return null;
  if (snapshot.highlight && snapshot.highlight.trim().length > 0) {
    return snapshot.highlight.trim();
  }
  const parts: string[] = [];
  if (snapshot.sunSign) parts.push(`Sun in ${snapshot.sunSign}`);
  if (snapshot.moonSign) parts.push(`Moon in ${snapshot.moonSign}`);
  if (snapshot.moonPhase) parts.push(snapshot.moonPhase);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export interface FindAnniversaryOptions {
  /** How many years back to look. Defaults to 1 ("this time last year"). */
  yearsAgo?: number;
  /** Max length for the journal snippet. Defaults to 180. */
  snippetMax?: number;
}

/**
 * Given a target date and a list of past journal entries (typically the
 * caller's recent entries from the DB), return an anniversary record for
 * `yearsAgo` years prior. Returns `null` only if neither a journal entry
 * nor a transit snapshot is available — i.e. there's nothing to surface.
 *
 * Pure / SSR-safe: no React, no fetch, no DB. Caller is responsible for
 * supplying the data.
 */
export function findAnniversary(
  targetDate: Date,
  pastEntries: readonly PastJournalEntry[],
  pastTransits: PastTransitSnapshot | null,
  options: FindAnniversaryOptions = {},
): AnniversaryRecord | null {
  const yearsAgo = options.yearsAgo ?? 1;
  const snippetMax = options.snippetMax ?? DEFAULT_SNIPPET_MAX;

  const target = dayjs.utc(targetDate);
  if (!target.isValid()) return null;

  const anniversary = target.subtract(yearsAgo, 'year');
  const anniversaryIso = anniversary.format('YYYY-MM-DD');

  // Find the first matching journal entry on the anniversary day. Filter to
  // journal-like categories so notes / non-journal collection rows can't
  // accidentally surface.
  const match = pastEntries.find((entry) => {
    if (!entry?.createdAt) return false;
    if (
      entry.category != null &&
      !ALLOWED_CATEGORIES.has(String(entry.category))
    ) {
      return false;
    }
    return isSameUtcDay(entry.createdAt, anniversary.toISOString());
  });

  const journalEntry = match ?? null;
  const journalSnippet = journalEntry
    ? makeSnippet(journalEntry.content, snippetMax)
    : null;
  const transitsSnippet = buildTransitsSnippet(pastTransits);

  // Nothing to show — bail. UI can treat null as "no anniversary card".
  if (!journalEntry && !pastTransits) {
    return null;
  }

  return {
    anniversaryDate: anniversaryIso,
    yearsAgo,
    journalEntry,
    journalSnippet,
    transits: pastTransits,
    transitsSnippet,
  };
}

export const __testing = {
  isSameUtcDay,
  makeSnippet,
  buildTransitsSnippet,
};
