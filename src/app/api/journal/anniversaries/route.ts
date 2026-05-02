import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { Observer } from 'astronomy-engine';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import {
  findAnniversary,
  type PastJournalEntry,
  type PastTransitSnapshot,
} from '@/lib/journal/anniversary-finder';
import {
  getRealPlanetaryPositions,
  getAccurateMoonPhase,
} from '../../../../../utils/astrology/astronomical-data';

dayjs.extend(utc);

export const dynamic = 'force-dynamic';

// London-ish default observer mirrors `lib/cosmic-snapshot/global-cache.ts`.
// Anniversary snapshots are intentionally non-personalized to the user's
// location — this matches "global sky" semantics elsewhere in the app.
const DEFAULT_OBSERVER = new Observer(51.4769, 0.0005, 0);

const querySchema = z.object({
  date: z
    .string()
    .min(8)
    .refine((value) => dayjs(value).isValid(), {
      message: 'date must be a valid ISO 8601 date',
    }),
  yearsAgo: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : 1))
    .pipe(z.number().int().min(1).max(10)),
});

type CollectionRow = {
  id: number;
  category: string;
  content: unknown;
  created_at: string;
};

/**
 * Pulls the journal/dream/ritual entry (if any) created on the given UTC
 * day for the user. Uses a 24-hour window keyed off `created_at` since the
 * column is timestamptz.
 */
async function fetchEntryOnDay(
  userId: string,
  dayStartIso: string,
  dayEndIso: string,
): Promise<PastJournalEntry | null> {
  const result = await sql<CollectionRow>`
    SELECT id, category, content, created_at
    FROM collections
    WHERE user_id = ${userId}
      AND category IN ('journal', 'dream', 'ritual')
      AND created_at >= ${dayStartIso}
      AND created_at < ${dayEndIso}
    ORDER BY created_at ASC
    LIMIT 1
  `;

  const row = result.rows[0];
  if (!row) return null;

  const contentData =
    typeof row.content === 'string'
      ? safeParseJson(row.content)
      : (row.content as Record<string, unknown> | null);

  const text =
    contentData && typeof contentData === 'object'
      ? typeof (contentData as { text?: unknown }).text === 'string'
        ? (contentData as { text: string }).text
        : ''
      : '';

  const moonPhase =
    contentData && typeof contentData === 'object'
      ? typeof (contentData as { moonPhase?: unknown }).moonPhase === 'string'
        ? (contentData as { moonPhase: string }).moonPhase
        : null
      : null;

  const transitHighlight =
    contentData && typeof contentData === 'object'
      ? typeof (contentData as { transitHighlight?: unknown })
          .transitHighlight === 'string'
        ? (contentData as { transitHighlight: string }).transitHighlight
        : null
      : null;

  return {
    id: row.id,
    createdAt:
      typeof row.created_at === 'string'
        ? row.created_at
        : new Date(row.created_at).toISOString(),
    content: text,
    category: row.category as PastJournalEntry['category'],
    moonPhase,
    transitHighlight,
  };
}

function safeParseJson(value: string): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === 'object'
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

/**
 * Computes a lightweight cosmic snapshot for the anniversary date. Mirrors
 * the global-cache shape but trimmed to just what the card needs.
 */
function buildTransitSnapshot(anniversary: Date): PastTransitSnapshot {
  const positions = getRealPlanetaryPositions(anniversary, DEFAULT_OBSERVER);
  const moonPhase = getAccurateMoonPhase(anniversary);

  const sunSign = positions?.Sun?.sign ?? null;
  const moonSign = positions?.Moon?.sign ?? null;
  const moonPhaseName =
    moonPhase && typeof moonPhase.name === 'string' ? moonPhase.name : null;

  // Compose a short, evocative highlight if we have at least one piece.
  const highlightParts: string[] = [];
  if (moonPhaseName) highlightParts.push(`${moonPhaseName} Moon`);
  if (sunSign) highlightParts.push(`Sun in ${sunSign}`);
  if (moonSign && moonSign !== sunSign)
    highlightParts.push(`Moon in ${moonSign}`);

  return {
    date: dayjs.utc(anniversary).format('YYYY-MM-DD'),
    moonPhase: moonPhaseName,
    sunSign,
    moonSign,
    highlight: highlightParts.length > 0 ? highlightParts.join(' · ') : null,
  };
}

/**
 * GET /api/journal/anniversaries?date=<iso>&yearsAgo=<n>
 *
 * Returns the user's "this time last year" anniversary record:
 *   - their journal entry from N years ago that day (if any)
 *   - a cosmic snapshot for that day (sun/moon sign, moon phase)
 *
 * Defaults yearsAgo=1. Returns `{ anniversary: null }` (with 200 OK) when
 * neither a journal entry nor transit data is available — callers should
 * just hide the card in that case.
 */
export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);

    const parseResult = querySchema.safeParse({
      date: searchParams.get('date') ?? '',
      yearsAgo: searchParams.get('yearsAgo') ?? undefined,
    });

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid query parameters',
          issues: parseResult.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
          })),
        },
        { status: 400 },
      );
    }

    const { date: rawDate, yearsAgo } = parseResult.data;
    const target = dayjs.utc(rawDate);
    const anniversary = target.subtract(yearsAgo, 'year');
    const dayStartIso = anniversary.startOf('day').toISOString();
    const dayEndIso = anniversary.add(1, 'day').startOf('day').toISOString();

    const [pastEntry, snapshot] = await Promise.all([
      fetchEntryOnDay(user.id, dayStartIso, dayEndIso),
      Promise.resolve(buildTransitSnapshot(anniversary.toDate())),
    ]);

    const record = findAnniversary(
      target.toDate(),
      pastEntry ? [pastEntry] : [],
      snapshot,
      { yearsAgo },
    );

    return NextResponse.json(
      {
        success: true,
        anniversary: record,
      },
      {
        headers: {
          'Cache-Control':
            'private, s-maxage=300, stale-while-revalidate=900, must-revalidate',
        },
      },
    );
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    console.error(
      '[journal/anniversaries] Failed to compute anniversary:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return NextResponse.json(
      { success: false, error: 'Failed to load anniversary' },
      { status: 500 },
    );
  }
}
