import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { formatTimestamp, resolveDateRange } from '@/lib/analytics/date-range';
import { ANALYTICS_CACHE_TTL_SECONDS } from '@/lib/analytics-cache-config';
import { requireAdminAuth } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

const TEST_EMAIL_PATTERN = '%@test.lunary.app';
const TEST_EMAIL_EXACT = 'test@test.lunary.app';

const VALID_PLATFORMS = new Set(['web', 'android', 'ios', 'pwa']);

function normalisePlatform(raw: string | null): string {
  if (!raw) return 'unknown';
  const lower = raw.toLowerCase().trim();
  return VALID_PLATFORMS.has(lower) ? lower : 'unknown';
}

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(request.url);
    const range = resolveDateRange(searchParams, 30);

    // Query app_opened events grouped by platform from metadata
    // Platform is stored in metadata->>'platform'
    const platformResult = await sql`
      SELECT
        COALESCE(metadata->>'platform', 'unknown') as platform,
        COUNT(*) as sessions,
        COUNT(DISTINCT user_id) as unique_users
      FROM conversion_events
      WHERE event_type IN ('app_opened', 'product_opened')
        AND created_at >= ${formatTimestamp(range.start)}
        AND created_at <= ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY COALESCE(metadata->>'platform', 'unknown')
      ORDER BY sessions DESC
    `;

    // Daily breakdown for charting
    const dailyResult = await sql`
      SELECT
        DATE(created_at AT TIME ZONE 'UTC') as date,
        COALESCE(metadata->>'platform', 'unknown') as platform,
        COUNT(*) as sessions,
        COUNT(DISTINCT user_id) as unique_users
      FROM conversion_events
      WHERE event_type IN ('app_opened', 'product_opened')
        AND created_at >= ${formatTimestamp(range.start)}
        AND created_at <= ${formatTimestamp(range.end)}
        AND (user_email IS NULL OR (user_email NOT LIKE ${TEST_EMAIL_PATTERN} AND user_email != ${TEST_EMAIL_EXACT}))
      GROUP BY DATE(created_at AT TIME ZONE 'UTC'), COALESCE(metadata->>'platform', 'unknown')
      ORDER BY date ASC
    `;

    type PlatformEntry = {
      platform: string;
      sessions: number;
      unique_users: number;
    };

    const platforms: PlatformEntry[] = platformResult.rows.map((row) => ({
      platform: normalisePlatform(row.platform as string),
      sessions: Number(row.sessions || 0),
      unique_users: Number(row.unique_users || 0),
    }));

    // Merge entries with same normalised platform (e.g. if both null and 'unknown' exist)
    const mergedPlatforms = new Map<string, PlatformEntry>();
    for (const entry of platforms) {
      const existing = mergedPlatforms.get(entry.platform);
      if (existing) {
        existing.sessions += entry.sessions;
        existing.unique_users += entry.unique_users;
      } else {
        mergedPlatforms.set(entry.platform, { ...entry });
      }
    }

    // Build daily breakdown
    type DailyEntry = {
      date: string;
      web: number;
      android: number;
      ios: number;
      pwa: number;
      unknown: number;
    };

    const dailyMap = new Map<string, DailyEntry>();
    for (const row of dailyResult.rows) {
      const date =
        row.date instanceof Date
          ? row.date.toISOString().slice(0, 10)
          : String(row.date);
      const platform = normalisePlatform(row.platform as string);
      const count = Number(row.sessions || 0);

      if (!dailyMap.has(date)) {
        dailyMap.set(date, {
          date,
          web: 0,
          android: 0,
          ios: 0,
          pwa: 0,
          unknown: 0,
        });
      }

      const entry = dailyMap.get(date)!;
      if (platform in entry) {
        (entry as unknown as Record<string, number>)[platform] += count;
      }
    }

    const daily = Array.from(dailyMap.values()).sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    const response = NextResponse.json({
      platforms: Array.from(mergedPlatforms.values()).sort(
        (a, b) => b.sessions - a.sessions,
      ),
      daily,
    });
    response.headers.set(
      'Cache-Control',
      `private, max-age=${ANALYTICS_CACHE_TTL_SECONDS}`,
    );
    return response;
  } catch (error) {
    console.error(
      '[analytics/platform-breakdown] Failed to load metrics',
      error,
    );
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        platforms: [],
        daily: [],
      },
      { status: 500 },
    );
  }
}
