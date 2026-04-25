import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { sql } from '@vercel/postgres';

import { auth } from '@/lib/auth';
import {
  computeYearInStars,
  type YearInStarsData,
  type YearInStarsJournalEntry,
} from '@/lib/year-in-stars/compute';
import type { RankableTransit } from '@/lib/transits/personal-impact-rank';
import type { BirthChartData } from '../../../../utils/astrology/birthChart';
import { YearInStarsReel } from '@/components/year-in-stars/YearInStarsReel';
import { Heading } from '@/components/ui/Heading';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Year in Stars | Lunary',
  description:
    'A swipeable year-end retrospective of your transits, journal, and moods.',
};

// ---------------------------------------------------------------------------
// Server-side data loaders. Kept inline in each page (and duplicated in the
// [year] route) so we don't introduce a new shared file.
// ---------------------------------------------------------------------------

async function fetchNatalChart(userId: string): Promise<BirthChartData[]> {
  try {
    const result = await sql<{ birth_chart: BirthChartData[] | null }>`
      SELECT birth_chart FROM user_profiles WHERE user_id = ${userId} LIMIT 1
    `;
    const raw = result.rows[0]?.birth_chart;
    return Array.isArray(raw) ? raw : [];
  } catch (err) {
    console.error('[YearInStars] failed to fetch natal chart', err);
    return [];
  }
}

interface CollectionsRow {
  content: unknown;
  tags: unknown;
  created_at: Date | string;
}

async function fetchJournalEntriesForYear(
  userId: string,
  year: number,
): Promise<YearInStarsJournalEntry[]> {
  try {
    const start = `${year}-01-01T00:00:00Z`;
    const end = `${year + 1}-01-01T00:00:00Z`;
    const result = await sql<CollectionsRow>`
      SELECT content, tags, created_at
      FROM collections
      WHERE user_id = ${userId}
        AND category IN ('journal', 'dream', 'ritual')
        AND created_at >= ${start}
        AND created_at < ${end}
      ORDER BY created_at ASC
    `;
    return result.rows.map((row) => {
      const contentData =
        typeof row.content === 'string'
          ? safeJson(row.content)
          : (row.content as Record<string, unknown> | null);
      const tags = Array.isArray(row.tags)
        ? row.tags
        : safeJson(typeof row.tags === 'string' ? row.tags : '');
      const moodTags = Array.isArray(tags)
        ? tags.filter((t): t is string => typeof t === 'string')
        : [];
      return {
        content:
          typeof contentData?.content === 'string' ? contentData.content : '',
        moodTags,
        moonPhase:
          typeof contentData?.moonPhase === 'string'
            ? contentData.moonPhase
            : null,
        transitHighlight:
          typeof contentData?.transitHighlight === 'string'
            ? contentData.transitHighlight
            : null,
        createdAt:
          row.created_at instanceof Date
            ? row.created_at.toISOString()
            : String(row.created_at),
      } as YearInStarsJournalEntry;
    });
  } catch (err) {
    console.error('[YearInStars] failed to fetch journal entries', err);
    return [];
  }
}

function safeJson(raw: string): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

async function fetchYearTransits(year: number): Promise<RankableTransit[]> {
  try {
    const result = await sql<{ forecast: unknown }>`
      SELECT forecast FROM yearly_forecasts WHERE year = ${year} LIMIT 1
    `;
    const forecast = result.rows[0]?.forecast as
      | {
          keyAspects?: Array<{
            date: string;
            aspect: string;
            planets: string[];
          }>;
          eclipses?: Array<{ date: string; type: string; sign: string }>;
          retrogrades?: Array<{ planet: string; startDate: string }>;
          majorTransits?: Array<{ date: string; event: string }>;
        }
      | undefined;

    if (!forecast) return [];

    const out: RankableTransit[] = [];

    for (const a of forecast.keyAspects ?? []) {
      const [transitPlanet, natalPlanet] = a.planets ?? [];
      if (!transitPlanet) continue;
      out.push({
        transitPlanet,
        natalPlanet,
        aspectType: a.aspect,
        transitLongitude: 0,
        date: new Date(a.date),
        type: 'aspect',
      });
    }

    for (const e of forecast.eclipses ?? []) {
      out.push({
        transitPlanet: e.type === 'solar' ? 'Sun' : 'Moon',
        transitLongitude: 0,
        date: new Date(e.date),
        type: 'eclipse',
      });
    }

    for (const r of forecast.retrogrades ?? []) {
      out.push({
        transitPlanet: r.planet,
        transitLongitude: 0,
        date: new Date(r.startDate),
        type: 'retrograde',
      });
    }

    for (const m of forecast.majorTransits ?? []) {
      // Best-effort: surface the event as a generic ranked transit.
      out.push({
        transitPlanet: m.event.split(' ')[0] || 'Transit',
        transitLongitude: 0,
        date: new Date(m.date),
        type: 'aspect',
      });
    }

    return out;
  } catch (err) {
    // Most likely the cache table is missing — that's fine, just return empty.
    if ((err as { code?: string })?.code !== '42P01') {
      console.error('[YearInStars] failed to fetch yearly transits', err);
    }
    return [];
  }
}

async function loadYearData(
  userId: string,
  year: number,
): Promise<YearInStarsData | null> {
  const [natalChart, journalEntries, transits] = await Promise.all([
    fetchNatalChart(userId),
    fetchJournalEntriesForYear(userId, year),
    fetchYearTransits(year),
  ]);

  if (journalEntries.length === 0 && transits.length === 0) return null;

  return computeYearInStars({
    year,
    journalEntries,
    transits,
    natalChart,
  });
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function YearInStarsCurrentPage() {
  const headersList = await headers();
  const session = await auth.api
    .getSession({ headers: headersList })
    .catch(() => null);

  if (!session?.user?.id) {
    redirect('/login?next=/year-in-stars');
  }

  const userId = session.user.id;
  const year = new Date().getUTCFullYear();

  const data = await loadYearData(userId, year);

  if (!data) {
    return (
      <div className='mx-auto flex max-w-2xl flex-col gap-4 px-4 py-12'>
        <Heading as='h1' variant='h1'>
          Your year in stars
        </Heading>
        <p className='text-content-muted'>
          We need a little more data to build your wrap. Add a birth chart and a
          few journal entries from {year}, then come back.
        </p>
      </div>
    );
  }

  return <YearInStarsReel data={data} userId={userId} />;
}
