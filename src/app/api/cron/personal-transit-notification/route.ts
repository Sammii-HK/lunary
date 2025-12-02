import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';
import {
  getSentEvents,
  markEventAsSent,
  cleanupOldDates,
} from '@/app/api/cron/shared-notification-tracker';
import { getGlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';
import {
  getNotificationCopy,
  PersonalizedContext,
} from '@/lib/notifications/copy-library';

function ensureVapidConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error('VAPID keys not configured.');
  }

  webpush.setVapidDetails('mailto:info@lunary.app', publicKey, privateKey);
}

interface PaidUserWithBirthChart {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  name?: string;
  birthday: string;
  sunSign?: string;
  moonSign?: string;
  risingSign?: string;
}

async function getPaidUsersWithBirthCharts(): Promise<
  PaidUserWithBirthChart[]
> {
  const result = await sql`
    SELECT 
      ps.endpoint,
      ps.p256dh,
      ps.auth,
      ps.user_id,
      ps.preferences->>'name' as name,
      ps.preferences->>'birthday' as birthday,
      a.birth_chart
    FROM push_subscriptions ps
    JOIN subscriptions s ON ps.user_id = s.user_id
    LEFT JOIN accounts a ON ps.user_id = a.id
    WHERE ps.is_active = true
    AND s.status IN ('active', 'trial', 'trialing')
    AND ps.preferences->>'birthday' IS NOT NULL
    AND ps.preferences->>'birthday' != ''
  `;

  return result.rows.map((row) => {
    let sunSign: string | undefined;
    let moonSign: string | undefined;
    let risingSign: string | undefined;

    if (row.birth_chart && Array.isArray(row.birth_chart)) {
      for (const placement of row.birth_chart) {
        if (placement.body === 'Sun') sunSign = placement.sign;
        if (placement.body === 'Moon') moonSign = placement.sign;
        if (placement.body === 'Ascendant') risingSign = placement.sign;
      }
    }

    return {
      userId: row.user_id,
      endpoint: row.endpoint,
      p256dh: row.p256dh,
      auth: row.auth,
      name: row.name || undefined,
      birthday: row.birthday,
      sunSign,
      moonSign,
      risingSign,
    };
  });
}

function detectChartActivation(
  user: PaidUserWithBirthChart,
  cosmicData: any,
): { type: string; context: PersonalizedContext } | null {
  if (!cosmicData?.planetaryPositions) return null;

  const sunPosition = cosmicData.planetaryPositions.Sun?.sign;
  const moonPosition = cosmicData.planetaryPositions.Moon?.sign;

  if (user.sunSign && sunPosition === user.sunSign) {
    return {
      type: 'sun_activation',
      context: {
        name: user.name?.split(' ')[0],
        sunSign: user.sunSign,
      },
    };
  }

  if (user.risingSign && sunPosition === user.risingSign) {
    return {
      type: 'rising_activation',
      context: {
        name: user.name?.split(' ')[0],
        risingSign: user.risingSign,
      },
    };
  }

  if (user.moonSign && moonPosition === user.moonSign) {
    return {
      type: 'transit_change',
      context: {
        name: user.name?.split(' ')[0],
        transit: `Moon in ${user.moonSign}`,
      },
    };
  }

  if (cosmicData.generalTransits?.length > 0) {
    const significantTransit = cosmicData.generalTransits.find(
      (t: any) =>
        t.priority >= 7 &&
        (t.name?.includes(user.sunSign) ||
          t.name?.includes(user.risingSign) ||
          t.name?.includes(user.moonSign)),
    );

    if (significantTransit) {
      return {
        type: 'transit_change',
        context: {
          name: user.name?.split(' ')[0],
          transit: significantTransit.name,
        },
      };
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const authHeader = request.headers.get('authorization');

    if (!isVercelCron) {
      if (
        process.env.CRON_SECRET &&
        authHeader !== `Bearer ${process.env.CRON_SECRET}`
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    ensureVapidConfigured();

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const eventKey = `personal-transit-${dateStr}`;

    console.log('🌟 Personal Transit Notification check started for:', dateStr);

    await cleanupOldDates(1);

    const sentEvents = await getSentEvents(dateStr);
    if (sentEvents.has(eventKey)) {
      console.log('⏭️ Personal transit notification already sent today');
      return NextResponse.json({
        success: true,
        skipped: true,
        reason: 'Already sent today',
        date: dateStr,
      });
    }

    let cosmicData = null;
    try {
      cosmicData = await getGlobalCosmicData(now);
    } catch (error) {
      console.error('Failed to fetch cosmic data:', error);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch cosmic data',
        },
        { status: 500 },
      );
    }

    const paidUsers = await getPaidUsersWithBirthCharts();

    if (paidUsers.length === 0) {
      console.log('📭 No paid users with birth charts found');
      await markEventAsSent(
        dateStr,
        eventKey,
        'event',
        'personal_transit',
        5,
        'daily',
      );
      return NextResponse.json({
        success: true,
        date: dateStr,
        usersChecked: 0,
        notificationsSent: 0,
      });
    }

    console.log(
      `🔍 Checking ${paidUsers.length} paid users for chart activations`,
    );

    let successful = 0;
    let failed = 0;
    const activations: string[] = [];

    for (const user of paidUsers) {
      const activation = detectChartActivation(user, cosmicData);

      if (activation) {
        try {
          const copy = getNotificationCopy(
            'event',
            activation.type,
            'paid',
            activation.context,
          );

          const notification = {
            title: copy.title,
            body: copy.body,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
            tag: `lunary-personal-transit`,
            data: {
              url: '/',
              type: 'personal_transit',
              activationType: activation.type,
              personalized: true,
            },
            actions: [
              {
                action: 'view',
                title: 'View',
                icon: '/icons/icon-72x72.png',
              },
            ],
            vibrate: [200, 100, 200],
          };

          await webpush.sendNotification(
            {
              endpoint: user.endpoint,
              keys: {
                p256dh: user.p256dh,
                auth: user.auth,
              },
            },
            JSON.stringify(notification),
          );

          await sql`
            UPDATE push_subscriptions 
            SET last_notification_sent = NOW() 
            WHERE endpoint = ${user.endpoint}
          `;

          successful++;
          activations.push(activation.type);
        } catch (error) {
          console.error(`Failed to send to user ${user.userId}:`, error);

          const errorObj = error as any;
          if (errorObj?.statusCode === 410 || errorObj?.statusCode === 404) {
            await sql`
              UPDATE push_subscriptions 
              SET is_active = false 
              WHERE endpoint = ${user.endpoint}
            `;
          }

          failed++;
        }
      }
    }

    await markEventAsSent(
      dateStr,
      eventKey,
      'event',
      'personal_transit',
      5,
      'daily',
    );

    console.log(
      `✅ Personal Transit check completed: ${successful} notifications sent, ${failed} failed`,
    );

    return NextResponse.json({
      success: true,
      date: dateStr,
      usersChecked: paidUsers.length,
      notificationsSent: successful,
      failed,
      activationTypes: [...new Set(activations)],
    });
  } catch (error) {
    console.error('❌ Personal Transit Notification failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
