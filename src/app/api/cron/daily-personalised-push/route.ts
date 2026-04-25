/**
 * Daily personalised push — hourly fan-out.
 *
 * Runs every hour. For each user who:
 *   - has at least one active push subscription
 *   - has a birth_chart on their user_profile
 *   - has opted into `personal_card.pushPreferences.dailyPersonalised`
 *
 * we compute their local sunrise (lat/long from their stored location, with
 * fallback to UTC), and only fire the notification when the current cron run
 * lands inside a 30-minute window around that sunrise.
 *
 * Reuses the project's existing VAPID web-push infra. No new push library.
 */
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';

import { buildDailyPush, approximateSunriseUTC } from '@/lib/daily-push/build';
import type { BirthChartData } from '../../../../../utils/astrology/birthChart';

export const dynamic = 'force-dynamic';

const SUNRISE_WINDOW_MIN = 30; // ± minutes from local sunrise

function ensureVapidConfigured(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) {
    return false;
  }
  try {
    webpush.setVapidDetails('mailto:info@lunary.app', publicKey, privateKey);
    return true;
  } catch {
    return false;
  }
}

interface CandidateRow {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  birth_chart: unknown;
  location: unknown;
  pref_daily: boolean | null;
}

async function getCandidates(): Promise<CandidateRow[]> {
  const result = await sql`
    SELECT
      ps.user_id,
      ps.endpoint,
      ps.p256dh,
      ps.auth,
      up.birth_chart,
      up.location,
      (up.personal_card->'pushPreferences'->>'dailyPersonalised')::boolean AS pref_daily
    FROM push_subscriptions ps
    JOIN user_profiles up ON up.user_id = ps.user_id
    WHERE ps.is_active = true
      AND up.birth_chart IS NOT NULL
      AND COALESCE(
        (up.personal_card->'pushPreferences'->>'dailyPersonalised')::boolean,
        false
      ) = true
  `;
  return result.rows as unknown as CandidateRow[];
}

function extractNatal(rawChart: unknown): BirthChartData[] {
  if (Array.isArray(rawChart)) return rawChart as BirthChartData[];
  if (
    rawChart &&
    typeof rawChart === 'object' &&
    Array.isArray((rawChart as { planets?: unknown }).planets)
  ) {
    return (rawChart as { planets: BirthChartData[] }).planets;
  }
  return [];
}

interface UserCoords {
  latitude: number;
  longitude: number;
}

function extractCoords(rawLocation: unknown): UserCoords | null {
  if (!rawLocation || typeof rawLocation !== 'object') return null;
  const loc = rawLocation as Record<string, unknown>;

  const tryPick = (entry: unknown): UserCoords | null => {
    if (!entry || typeof entry !== 'object') return null;
    const e = entry as Record<string, unknown>;
    const lat = typeof e.latitude === 'number' ? e.latitude : undefined;
    const lng = typeof e.longitude === 'number' ? e.longitude : undefined;
    if (lat !== undefined && lng !== undefined) {
      return { latitude: lat, longitude: lng };
    }
    return null;
  };

  return (
    tryPick(loc.currentLocation) ??
    tryPick(loc.birthLocation) ??
    tryPick(loc) ??
    null
  );
}

/**
 * Returns true if `now` is within ±SUNRISE_WINDOW_MIN of the sunrise UTC instant.
 * The window is half-open at the upper bound so a sunrise exactly on a 30-min
 * boundary (e.g. 06:30) only matches a single hourly cron run, never two.
 */
function withinSunriseWindow(now: Date, sunriseUtc: Date): boolean {
  const diffMs = now.getTime() - sunriseUtc.getTime();
  const windowMs = SUNRISE_WINDOW_MIN * 60 * 1000;
  return diffMs > -windowMs && diffMs <= windowMs;
}

export async function GET(request: NextRequest) {
  const startedAt = new Date().toISOString();
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        !process.env.CRON_SECRET ||
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!ensureVapidConfigured()) {
      return NextResponse.json(
        { success: false, error: 'VAPID keys not configured' },
        { status: 500 },
      );
    }

    const candidates = await getCandidates();
    if (candidates.length === 0) {
      return NextResponse.json({
        success: true,
        startedAt,
        candidates: 0,
        sent: 0,
        skipped: 0,
      });
    }

    const now = new Date();
    let sent = 0;
    let failed = 0;
    let skippedWindow = 0;
    let skippedNoChart = 0;

    for (const row of candidates) {
      const natal = extractNatal(row.birth_chart);
      if (natal.length === 0) {
        skippedNoChart += 1;
        continue;
      }

      const coords = extractCoords(row.location);
      // If coords are missing, fall back to a default 06:00 UTC sunrise so
      // those users still receive a daily push at a sensible hour.
      const sunriseUtc = coords
        ? approximateSunriseUTC(now, coords.latitude, coords.longitude)
        : new Date(
            Date.UTC(
              now.getUTCFullYear(),
              now.getUTCMonth(),
              now.getUTCDate(),
              6,
              0,
              0,
            ),
          );

      if (!withinSunriseWindow(now, sunriseUtc)) {
        skippedWindow += 1;
        continue;
      }

      try {
        const push = buildDailyPush({
          userId: row.user_id,
          natalChart: natal,
          sunriseLocal: sunriseUtc,
        });

        const notification = {
          title: push.title,
          body: push.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: 'lunary-daily-personalised',
          data: {
            url: push.deepLink,
            type: 'daily_personalised',
          },
          actions: [
            {
              action: 'view',
              title: 'Open',
              icon: '/icons/icon-72x72.png',
            },
          ],
          vibrate: [120, 80, 120],
        };

        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          JSON.stringify(notification),
        );

        await sql`
          UPDATE push_subscriptions
          SET last_notification_sent = NOW()
          WHERE endpoint = ${row.endpoint}
        `;
        sent += 1;
      } catch (error) {
        const errorObj = error as { statusCode?: number };
        if (errorObj?.statusCode === 410 || errorObj?.statusCode === 404) {
          await sql`
            UPDATE push_subscriptions
            SET is_active = false, updated_at = NOW()
            WHERE endpoint = ${row.endpoint}
          `;
        }
        failed += 1;
      }
    }

    return NextResponse.json({
      success: true,
      startedAt,
      candidates: candidates.length,
      sent,
      failed,
      skippedWindow,
      skippedNoChart,
    });
  } catch (error) {
    console.error('[daily-personalised-push] error', {
      message: (error as Error)?.message?.slice(0, 200) ?? 'unknown',
    });
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to dispatch daily personalised push',
      },
      { status: 500 },
    );
  }
}
