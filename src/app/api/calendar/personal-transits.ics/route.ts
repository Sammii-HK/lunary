import { NextRequest, NextResponse } from 'next/server';
import dayjs from 'dayjs';
import { sql } from '@vercel/postgres';
import { getCurrentUser } from '@/lib/get-user-session';
import { generateIcs, type IcsEvent } from '@/lib/calendar/ics-generator';
import { getUpcomingTransits } from '../../../../../utils/astrology/transitCalendar';
import {
  getPersonalTransitImpacts,
  type PersonalTransitImpact,
} from '../../../../../utils/astrology/personalTransits';

/**
 * GET /api/calendar/personal-transits.ics
 *
 * Returns an RFC-5545 calendar feed with the next 90 days of personal
 * transits (aspects to natal, ingresses, retrogrades, lunar phases).
 *
 * Auth strategy:
 *   - Calendar apps (Apple Calendar, Google Calendar) cannot send cookies,
 *     so the canonical auth is a per-user opaque token in `?token=...`.
 *   - The `User.calendarToken` column is not yet on the schema. Until the
 *     orchestrator runs the Prisma migration, this route falls back to the
 *     normal session cookie so authenticated users can still preview the
 *     feed from a browser.
 *
 * TODO(orchestrator): requires `User.calendarToken` column — add via /db-sync.
 *   Suggested column: `calendarToken String? @unique` on the `user` model.
 *   Once the column exists, swap the `lookupUserIdByToken` stub to query it
 *   and treat token auth as the primary path.
 */

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 90-day lookahead, in 30-day chunks (getUpcomingTransits returns 30 days each).
const LOOKAHEAD_DAYS = 90;
const CHUNK_DAYS = 30;
// Cap how many transits we surface to keep the feed lightweight.
const MAX_EVENTS = 200;

type SafeUser = { id: string; email?: string | null };

/**
 * Resolve the user for this request.
 *
 * Order:
 *   1. `?token=<opaque>` — once `User.calendarToken` exists.
 *   2. Session cookie — current fallback so the feature works end-to-end now.
 */
async function resolveUser(request: NextRequest): Promise<SafeUser | null> {
  const token = new URL(request.url).searchParams.get('token');

  if (token) {
    const userId = await lookupUserIdByToken(token);
    if (userId) {
      return { id: userId };
    }
    // If a token was supplied but didn't match, do not fall back — the caller
    // is clearly attempting unauthenticated access via a (wrong) token.
    return null;
  }

  const session = await getCurrentUser(request);
  return session ? { id: session.id, email: session.email } : null;
}

/**
 * Token-based lookup against `user.calendar_token`. The token is
 * opaque + high-entropy + per-user + rotatable; calendar clients can't
 * carry session cookies so this is the only auth path for external apps.
 */
async function lookupUserIdByToken(token: string): Promise<string | null> {
  if (!token) return null;
  try {
    const result = await sql`
      SELECT id FROM "user" WHERE calendar_token = ${token} LIMIT 1
    `;
    return result.rows[0]?.id ?? null;
  } catch {
    return null;
  }
}

/**
 * Fetch the user's natal chart placements, in the shape expected by
 * getPersonalTransitImpacts (array of `{ body, sign, eclipticLongitude, ... }`).
 */
async function fetchNatalChart(userId: string): Promise<any[] | null> {
  try {
    const result = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;
    const chart = result.rows[0]?.birth_chart;
    if (!chart || !Array.isArray(chart) || chart.length === 0) {
      return null;
    }
    return chart;
  } catch (error) {
    console.error('[calendar.ics] Failed to fetch natal chart', {
      userId,
      message: error instanceof Error ? error.message : 'unknown',
    });
    return null;
  }
}

/**
 * Fetch 90 days of upcoming raw transit events by chunking the existing
 * 30-day calculator. Deduplicates so chunk boundaries don't double-count.
 */
function fetchUpcomingTransits(): ReturnType<typeof getUpcomingTransits> {
  const today = dayjs().startOf('day');
  const all = [] as ReturnType<typeof getUpcomingTransits>;
  const chunks = Math.ceil(LOOKAHEAD_DAYS / CHUNK_DAYS);

  for (let i = 0; i < chunks; i++) {
    const chunkStart = today.add(i * CHUNK_DAYS, 'day');
    all.push(...getUpcomingTransits(chunkStart));
  }

  const horizon = today.add(LOOKAHEAD_DAYS, 'day');
  const seen = new Set<string>();
  return all
    .filter((event) => {
      if (event.date.isBefore(today, 'day')) return false;
      if (event.date.isAfter(horizon, 'day')) return false;
      const key = `${event.date.toISOString()}|${event.planet}|${event.event}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => a.date.valueOf() - b.date.valueOf());
}

/**
 * Build a calendar event title from a personal transit impact.
 */
function buildTitle(impact: PersonalTransitImpact): string {
  const aspect = impact.aspectToNatal
    ? ` (${impact.aspectToNatal.aspectType} natal ${impact.aspectToNatal.natalPlanet})`
    : '';
  return `${impact.planet}: ${impact.event}${aspect}`;
}

/**
 * Build a calendar event description from a personal transit impact.
 */
function buildDescription(impact: PersonalTransitImpact): string {
  const lines: string[] = [];
  lines.push(impact.description);
  if (impact.personalImpact) {
    lines.push('');
    lines.push(`Personal impact: ${impact.personalImpact}`);
  }
  if (impact.actionableGuidance) {
    lines.push('');
    lines.push(`Guidance: ${impact.actionableGuidance}`);
  }
  if (impact.house && impact.houseMeaning) {
    lines.push('');
    lines.push(`House: ${impact.house} (${impact.houseMeaning})`);
  }
  return lines.join('\n');
}

/**
 * Map a PersonalTransitImpact to an IcsEvent. All-day events for now;
 * the underlying calculator returns day-level precision for most events.
 */
function impactToIcsEvent(
  impact: PersonalTransitImpact,
  userId: string,
): IcsEvent {
  const start = impact.date.toDate();
  const end = impact.date.add(1, 'day').toDate();
  // Stable UID: deterministic per (user, date, planet, event).
  const uid =
    `${impact.date.format('YYYYMMDD')}-${impact.planet}-${impact.event}-${userId}@lunary.app`
      .replace(/\s+/g, '-')
      .toLowerCase();

  return {
    uid,
    title: buildTitle(impact),
    description: buildDescription(impact),
    start,
    end,
    allDay: true,
  };
}

function emptyCalendarResponse(reason: string): NextResponse {
  const body = generateIcs([
    {
      uid: `lunary-empty-${Date.now()}@lunary.app`,
      title: 'Lunary: no personal transits available',
      description: reason,
      start: new Date(),
      end: new Date(Date.now() + 24 * 60 * 60 * 1000),
      allDay: true,
    },
  ]);
  return new NextResponse(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

export async function GET(request: NextRequest) {
  const user = await resolveUser(request);
  if (!user) {
    // Calendar apps expect a 401 to surface a credential prompt; browsers
    // can show this directly. Body is plain text so it's debuggable.
    return new NextResponse('Unauthorized', {
      status: 401,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  const natalChart = await fetchNatalChart(user.id);
  if (!natalChart) {
    return emptyCalendarResponse(
      'Add your birth details in Lunary to populate this calendar.',
    );
  }

  let icsBody: string;
  try {
    const upcoming = fetchUpcomingTransits();
    const impacts = getPersonalTransitImpacts(upcoming, natalChart, MAX_EVENTS);
    const events = impacts.map((impact) => impactToIcsEvent(impact, user.id));
    icsBody = generateIcs(events);
  } catch (error) {
    console.error('[calendar.ics] Failed to build feed', {
      userId: user.id,
      message: error instanceof Error ? error.message : 'unknown',
    });
    return new NextResponse('Failed to generate calendar', {
      status: 500,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }

  return new NextResponse(icsBody, {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="lunary-personal-transits.ics"',
      // Calendar apps refresh on their own cadence; allow short caching.
      'Cache-Control': 'private, max-age=3600',
    },
  });
}
