/**
 * GET /api/cosmic-habits/correlations
 *
 * Returns transit-bucketed habit correlations for the authenticated user.
 * Pulls the last 90 days of journal/dream/ritual entries from `collections`,
 * parses `content.habitCapture`, joins with the natal chart from
 * `user_profiles.birth_chart`, and runs the pure detector in
 * `src/lib/cosmic-habits/detect.ts`.
 *
 * Cached `private, s-maxage=86400` — correlations don't shift hourly.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import { requireUser } from '@/lib/ai/auth';
import { detectHabitCorrelations } from '@/lib/cosmic-habits/detect';
import type { JournalEntryForDetect } from '@/lib/cosmic-habits/detect';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';

interface CollectionRow {
  id: number;
  content: unknown;
  created_at: string;
}

function parseContent(raw: unknown): { habitCapture?: unknown } | null {
  if (!raw) return null;
  if (typeof raw === 'object') return raw as { habitCapture?: unknown };
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as { habitCapture?: unknown };
    } catch {
      return null;
    }
  }
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);

    const [profileRes, entriesRes] = await Promise.all([
      sql`
        SELECT birth_chart
        FROM user_profiles
        WHERE user_id = ${user.id}
        LIMIT 1
      `,
      sql<CollectionRow>`
        SELECT id, content, created_at
        FROM collections
        WHERE user_id = ${user.id}
          AND category IN ('journal', 'dream', 'ritual')
          AND created_at >= NOW() - INTERVAL '90 days'
        ORDER BY created_at DESC
        LIMIT 500
      `,
    ]);

    const rawChart = profileRes.rows[0]?.birth_chart ?? null;
    const natal: BirthChartData[] = Array.isArray(rawChart)
      ? rawChart
      : Array.isArray(rawChart?.planets)
        ? rawChart.planets
        : [];

    const entries: JournalEntryForDetect[] = entriesRes.rows
      .map((row) => {
        const parsed = parseContent(row.content);
        return {
          id: row.id,
          createdAt: row.created_at,
          content: parsed as { habitCapture?: never } | null,
        };
      })
      // Only entries with a tracked habitCapture contribute signal.
      .filter(
        (e) =>
          e.content &&
          typeof e.content === 'object' &&
          e.content.habitCapture !== undefined,
      );

    if (natal.length === 0) {
      return NextResponse.json(
        {
          success: true,
          correlations: [],
          sampleSize: entries.length,
          reason: 'no_birth_chart',
        },
        {
          headers: {
            'Cache-Control': 'private, s-maxage=86400',
          },
        },
      );
    }

    const correlations = detectHabitCorrelations({
      entries,
      natalChart: natal,
    });

    return NextResponse.json(
      {
        success: true,
        correlations,
        sampleSize: entries.length,
      },
      {
        headers: {
          'Cache-Control': 'private, s-maxage=86400',
        },
      },
    );
  } catch (error) {
    if ((error as Error)?.name === 'UnauthorizedError') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }
    // Avoid logging raw user-controlled values per CLAUDE.md guidance.
    console.error('[cosmic-habits/correlations] error', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      { success: false, error: 'Failed to compute correlations' },
      { status: 500 },
    );
  }
}
