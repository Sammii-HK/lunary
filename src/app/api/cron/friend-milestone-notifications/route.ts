/**
 * Cron: friend-milestone-notifications
 *
 * Runs daily. For each user with active push tokens:
 *   1. Loads their friend connections + each friend's birthday/birth chart.
 *   2. Calls `detectFriendMilestones` against today's sky.
 *   3. Dispatches one push per ping via the existing native-push sender.
 *
 * TODO: wire `0 14 * * *` into vercel.json crons.
 */

import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import {
  detectFriendMilestones,
  type CurrentSky,
  type FriendForDetection,
  type MilestonePing,
} from '@/lib/notifications/friend-pings';
import { sendToUser } from '@/lib/notifications/native-push-sender';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const OUTER_PLANETS = [
  'Saturn',
  'Jupiter',
  'Uranus',
  'Neptune',
  'Pluto',
] as const;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    const todayIso = now.toISOString().split('T')[0];

    const currentSky = await loadCurrentSky(todayIso);
    if (!currentSky) {
      return NextResponse.json(
        { success: false, error: 'No global cosmic data for today' },
        { status: 503 },
      );
    }

    const batchSize = 100;
    let offset = 0;
    let usersProcessed = 0;
    let pingsSent = 0;
    let pingsSkipped = 0;

    while (true) {
      // Only iterate users that actually have at least one active push token
      // and at least one friend connection — otherwise the work is wasted.
      const users = await sql`
        SELECT DISTINCT fc.user_id
        FROM friend_connections fc
        WHERE EXISTS (
          SELECT 1 FROM native_push_tokens npt
          WHERE npt.user_id = fc.user_id AND npt.is_active = true
        )
        ORDER BY fc.user_id
        LIMIT ${batchSize}
        OFFSET ${offset}
      `;

      if (users.rows.length === 0) break;

      for (const row of users.rows) {
        const userId = row.user_id as string;
        const friends = await loadFriends(userId);
        if (friends.length === 0) {
          usersProcessed++;
          continue;
        }

        const pings = detectFriendMilestones(userId, friends, currentSky);

        for (const ping of pings) {
          if (await alreadySentToday(userId, ping)) {
            pingsSkipped++;
            continue;
          }

          try {
            await sendToUser(userId, {
              title: pingTitle(ping),
              body: ping.copy,
              data: {
                deeplink: `/friends/${ping.friendId}`,
                action: 'friend_milestone',
                milestoneType: ping.milestoneType,
                exactDate: ping.exactDate,
              },
            });
            await markSent(userId, ping);
            pingsSent++;
          } catch (err) {
            console.error('[friend-milestone-notifications] dispatch failed', {
              userId,
              milestoneType: ping.milestoneType,
              err: String(err),
            });
          }
        }

        usersProcessed++;
      }

      offset += batchSize;
    }

    return NextResponse.json({
      success: true,
      usersProcessed,
      pingsSent,
      pingsSkipped,
    });
  } catch (error) {
    console.error('[friend-milestone-notifications] error', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// ---------------------------------------------------------------------------
// Data loaders
// ---------------------------------------------------------------------------

async function loadCurrentSky(todayIso: string): Promise<CurrentSky | null> {
  const result = await sql`
    SELECT planetary_positions
    FROM global_cosmic_data
    WHERE data_date = ${todayIso}
    LIMIT 1
  `;
  const positionsRaw = result.rows[0]?.planetary_positions;
  if (!positionsRaw || typeof positionsRaw !== 'object') return null;

  const positions: CurrentSky['positions'] = {};
  for (const planet of OUTER_PLANETS) {
    const entry = (positionsRaw as Record<string, { longitude?: unknown }>)[
      planet
    ];
    if (entry && typeof entry.longitude === 'number') {
      positions[planet] = entry.longitude;
    }
  }

  return { date: todayIso, positions };
}

async function loadFriends(userId: string): Promise<FriendForDetection[]> {
  const result = await sql`
    SELECT
      fc.id,
      fc.friend_id,
      COALESCE(NULLIF(fc.nickname, ''), up.name, '') AS display_name,
      up.birthday,
      up.birth_chart
    FROM friend_connections fc
    LEFT JOIN user_profiles up ON up.user_id = fc.friend_id
    WHERE fc.user_id = ${userId}
  `;

  return result.rows.map((r) => ({
    id: r.id as string,
    friendId: r.friend_id as string,
    name: (r.display_name as string) || 'Your friend',
    birthday: (r.birthday as string | null) ?? null,
    birthChart: (r.birth_chart as Record<string, unknown> | null) ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Dedup ledger — reuses notification_sent_events (keyed by date + event_key)
// ---------------------------------------------------------------------------

function eventKey(userId: string, ping: MilestonePing): string {
  return `friend_milestone:${userId}:${ping.milestoneType}:${ping.friendId}:${ping.exactDate}`;
}

async function alreadySentToday(
  userId: string,
  ping: MilestonePing,
): Promise<boolean> {
  try {
    const result = await sql`
      SELECT 1 FROM notification_sent_events
      WHERE date = CURRENT_DATE
        AND event_key = ${eventKey(userId, ping)}
      LIMIT 1
    `;
    return result.rows.length > 0;
  } catch {
    // Schema drift across envs — fail open and let the dispatcher proceed.
    return false;
  }
}

async function markSent(userId: string, ping: MilestonePing): Promise<void> {
  try {
    await sql`
      INSERT INTO notification_sent_events
        (date, event_key, event_type, event_name, event_priority, sent_by, sent_at)
      VALUES (
        CURRENT_DATE,
        ${eventKey(userId, ping)},
        ${'friend_milestone'},
        ${ping.milestoneType},
        ${5},
        ${'friend-milestone-notifications'},
        NOW()
      )
      ON CONFLICT (date, event_key) DO NOTHING
    `;
  } catch {
    // Non-critical — dedupe is best-effort.
  }
}

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

function pingTitle(ping: MilestonePing): string {
  switch (ping.milestoneType) {
    case 'saturn_return':
      return `${ping.friendName}: Saturn return incoming`;
    case 'jupiter_return':
      return `${ping.friendName}: Jupiter return incoming`;
    case 'outer_natal_sun_aspect':
      return `${ping.friendName}: cosmic spotlight`;
    case 'profection_year_start':
      return `${ping.friendName}: new profection year`;
    default:
      return `${ping.friendName} hits a milestone`;
  }
}
