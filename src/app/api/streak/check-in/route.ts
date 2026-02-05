import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { requireUser } from '@/lib/ai/auth';
import {
  shouldSendStreakNotification,
  getStreakNotification,
} from '@/lib/notifications/streak-notifications';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

    // Get or create user streak record
    const result = await sql`
      SELECT current_streak, longest_streak, last_check_in, total_check_ins
      FROM user_streaks
      WHERE user_id = ${userId}
    `;

    let currentStreak = 0;
    let longestStreak = 0;
    let lastCheckIn: string | null = null;
    let totalCheckIns = 0;

    if (result.rows.length > 0) {
      const row = result.rows[0];
      currentStreak = row.current_streak || 0;
      longestStreak = row.longest_streak || 0;
      lastCheckIn = row.last_check_in
        ? new Date(row.last_check_in).toISOString().split('T')[0]
        : null;
      totalCheckIns = row.total_check_ins || 0;
    }

    // Calculate if this is a new day
    const isNewDay = lastCheckIn !== today;
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const calculateDaysAway = (from: string, to: string) => {
      const fromDate = new Date(`${from}T00:00:00Z`);
      const toDate = new Date(`${to}T00:00:00Z`);
      return Math.round((toDate.getTime() - fromDate.getTime()) / MS_PER_DAY);
    };

    if (isNewDay) {
      // Check if streak should continue or reset
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastCheckIn === yesterdayStr) {
        // Continue streak
        currentStreak += 1;
      } else if (lastCheckIn !== null) {
        const daysAway = calculateDaysAway(lastCheckIn, today);
        if (daysAway >= 7) {
          // Reset streak after a full break
          currentStreak = 1;
        } else {
          // Pause streak during short breaks
          currentStreak = Math.max(currentStreak, 1);
        }
      } else {
        // First check-in
        currentStreak = 1;
      }

      // Update longest streak if needed
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }

      totalCheckIns += 1;

      // Update or insert streak record
      await sql`
        INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_check_in, total_check_ins, updated_at)
        VALUES (${userId}, ${currentStreak}, ${longestStreak}, ${today}::DATE, ${totalCheckIns}, NOW())
        ON CONFLICT (user_id)
        DO UPDATE SET
          current_streak = ${currentStreak},
          longest_streak = ${longestStreak},
          last_check_in = ${today}::DATE,
          total_check_ins = ${totalCheckIns},
          updated_at = NOW()
      `;

      // Update explorer progress based on current streak
      // Also increment ritual progress (daily check-in counts as ritual completion)
      try {
        const { setExplorerProgress, incrementProgress } =
          await import('@/lib/progress/server');
        await setExplorerProgress(userId, currentStreak);
        await incrementProgress(userId, 'ritual', 1);

        // Track ritual completion in canonical analytics
        const { conversionTracking } = await import('@/lib/analytics');
        conversionTracking.ritualStarted(userId, user.email, undefined, {
          context: 'daily_check_in',
          streak: currentStreak,
        });
      } catch (progressError) {
        console.warn('[Streak] Failed to update progress:', progressError);
      }

      // Check for streak milestone and send notification
      const previousStreak = currentStreak - 1;
      if (shouldSendStreakNotification(currentStreak, previousStreak)) {
        try {
          const userName = user.displayName?.split(' ')[0];
          const notification = getStreakNotification(currentStreak, userName);

          // Get user's push subscription
          const subResult = await sql`
            SELECT endpoint, p256dh, auth
            FROM push_subscriptions
            WHERE user_id = ${userId} AND is_active = true
            LIMIT 1
          `;

          if (subResult.rows.length > 0) {
            const sub = subResult.rows[0];
            const webpush = await import('web-push');

            const publicKey = process.env.VAPID_PUBLIC_KEY;
            const privateKey = process.env.VAPID_PRIVATE_KEY;

            if (publicKey && privateKey) {
              webpush.default.setVapidDetails(
                'mailto:info@lunary.app',
                publicKey,
                privateKey,
              );

              await webpush.default.sendNotification(
                {
                  endpoint: sub.endpoint,
                  keys: { p256dh: sub.p256dh, auth: sub.auth },
                },
                JSON.stringify({
                  title: notification.title,
                  body: notification.body,
                  icon: '/icons/icon-192x192.png',
                  badge: '/icons/icon-72x72.png',
                  tag: 'streak-milestone',
                  data: notification.data,
                }),
              );

              console.log(
                `[Streak] Sent milestone notification for ${currentStreak} day streak`,
              );
            }
          }
        } catch (notifError) {
          // Don't fail the check-in if notification fails
          console.error(
            '[Streak] Failed to send milestone notification:',
            notifError,
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      streak: {
        current: currentStreak,
        longest: longestStreak,
        lastCheckIn: today,
        totalCheckIns,
      },
    });
  } catch (error) {
    console.error('[Streak Check-in] Error:', error);
    return NextResponse.json(
      { error: 'Failed to record check-in' },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const userId = user.id;

    try {
      const result = await sql`
        SELECT current_streak, longest_streak, last_check_in, total_check_ins
        FROM user_streaks
        WHERE user_id = ${userId}
      `;

      if (result.rows.length === 0) {
        return NextResponse.json({
          streak: {
            current: 0,
            longest: 0,
            lastCheckIn: null,
            totalCheckIns: 0,
          },
        });
      }

      const row = result.rows[0];
      return NextResponse.json({
        streak: {
          current: row.current_streak || 0,
          longest: row.longest_streak || 0,
          lastCheckIn: row.last_check_in
            ? new Date(row.last_check_in).toISOString().split('T')[0]
            : null,
          totalCheckIns: row.total_check_ins || 0,
        },
      });
    } catch (dbError: any) {
      // If table doesn't exist, return empty streak instead of error
      if (
        dbError?.code === '42P01' ||
        dbError?.message?.includes('does not exist')
      ) {
        console.warn(
          '[Streak] Table does not exist yet, returning empty streak',
        );
        return NextResponse.json({
          streak: {
            current: 0,
            longest: 0,
            lastCheckIn: null,
            totalCheckIns: 0,
          },
        });
      }
      throw dbError;
    }
  } catch (error) {
    console.error('[Streak] Error fetching streak:', error);
    // Return empty streak instead of error so component can still render
    return NextResponse.json({
      streak: {
        current: 0,
        longest: 0,
        lastCheckIn: null,
        totalCheckIns: 0,
      },
    });
  }
}
