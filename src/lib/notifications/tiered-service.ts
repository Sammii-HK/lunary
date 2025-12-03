import { sql } from '@vercel/postgres';
import webpush from 'web-push';
import {
  getSentEvents,
  markEventAsSent,
  cleanupOldDates,
} from '@/app/api/cron/shared-notification-tracker';
import {
  getNotificationCopy,
  NotificationTier,
  NotificationCadence,
  PersonalizedContext,
} from './copy-library';
import { getEnergyThemeFromCosmicData } from './energy-theme';

function ensureVapidConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      'VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.',
    );
  }

  webpush.setVapidDetails('mailto:info@lunary.app', publicKey, privateKey);
}

export interface UserNotificationProfile {
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  tier: NotificationTier;
  hasBirthData: boolean;
  name?: string;
  birthday?: string;
  timezone?: string;
  subscriptionStatus?: string;
  planType?: string;
}

export interface TieredNotificationResult {
  success: boolean;
  totalRecipients: number;
  freeRecipients: number;
  paidRecipients: number;
  successful: number;
  failed: number;
  eventKey?: string;
  error?: string;
}

export async function getUsersWithTierInfo(): Promise<
  UserNotificationProfile[]
> {
  const result = await sql`
    SELECT 
      ps.endpoint,
      ps.p256dh,
      ps.auth,
      ps.user_id,
      ps.preferences->>'name' as name,
      ps.preferences->>'birthday' as birthday,
      ps.preferences->>'timezone' as timezone,
      COALESCE(s.status, 'free') as subscription_status,
      COALESCE(s.plan, 'free') as plan_type
    FROM push_subscriptions ps
    LEFT JOIN subscriptions s ON ps.user_id = s.user_id
    WHERE ps.is_active = true
  `;

  return result.rows.map((row) => {
    const isPaid =
      row.subscription_status === 'active' ||
      row.subscription_status === 'trial' ||
      row.subscription_status === 'trialing';

    const hasBirthData = Boolean(row.birthday && row.birthday.trim() !== '');

    return {
      userId: row.user_id,
      endpoint: row.endpoint,
      p256dh: row.p256dh,
      auth: row.auth,
      tier: isPaid ? 'paid' : 'free',
      hasBirthData,
      name: row.name || undefined,
      birthday: row.birthday || undefined,
      timezone: row.timezone || undefined,
      subscriptionStatus: row.subscription_status,
      planType: row.plan_type,
    };
  });
}

export async function getUserBirthChartData(userId: string): Promise<{
  sunSign?: string;
  risingSign?: string;
  moonSign?: string;
} | null> {
  try {
    const result = await sql`
      SELECT birth_chart
      FROM user_profiles
      WHERE user_id = ${userId}
      LIMIT 1
    `;

    if (result.rows.length === 0 || !result.rows[0].birth_chart) {
      return null;
    }

    const birthChart = result.rows[0].birth_chart;
    let sunSign: string | undefined;
    let risingSign: string | undefined;
    let moonSign: string | undefined;

    if (Array.isArray(birthChart)) {
      for (const placement of birthChart) {
        if (placement.body === 'Sun') sunSign = placement.sign;
        if (placement.body === 'Moon') moonSign = placement.sign;
        if (placement.body === 'Ascendant') risingSign = placement.sign;
      }
    }

    return { sunSign, risingSign, moonSign };
  } catch (error) {
    console.error(`Failed to fetch birth chart for user ${userId}:`, error);
    return null;
  }
}

export async function getPersonalizedContext(
  user: UserNotificationProfile,
  cosmicData?: any,
): Promise<PersonalizedContext> {
  const context: PersonalizedContext = {
    name: user.name?.split(' ')[0],
  };

  if (user.tier === 'paid' && user.hasBirthData && user.userId) {
    const birthChartData = await getUserBirthChartData(user.userId);
    if (birthChartData) {
      context.sunSign = birthChartData.sunSign;
      context.risingSign = birthChartData.risingSign;
    }
  }

  if (cosmicData) {
    context.moonPhase = cosmicData.moonPhase?.name;
    context.tarotCard = cosmicData.tarot?.daily?.name;
    context.crystal = cosmicData.crystal?.name;

    if (user.tier === 'paid') {
      context.energyTheme = getEnergyThemeFromCosmicData(cosmicData);
    }

    if (cosmicData.currentTransits?.length > 0) {
      const mainTransit = cosmicData.currentTransits[0];
      context.transit = `${mainTransit.from} ${mainTransit.aspect} ${mainTransit.to}`;
    }
  }

  return context;
}

export async function sendTieredNotification(
  cadence: NotificationCadence,
  type: string,
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  try {
    ensureVapidConfigured();

    const today = new Date().toISOString().split('T')[0];
    const eventKey = `tiered-${cadence}-${type}-${today}`;

    await cleanupOldDates(1);

    const sentEvents = await getSentEvents(today);
    if (sentEvents.has(eventKey)) {
      console.log(`⏭️ Tiered notification ${eventKey} already sent today`);
      return {
        success: true,
        totalRecipients: 0,
        freeRecipients: 0,
        paidRecipients: 0,
        successful: 0,
        failed: 0,
        eventKey,
      };
    }

    const users = await getUsersWithTierInfo();

    if (users.length === 0) {
      console.log('📭 No active subscriptions found');
      await markEventAsSent(today, eventKey, cadence, type, 5, 'daily');
      return {
        success: true,
        totalRecipients: 0,
        freeRecipients: 0,
        paidRecipients: 0,
        successful: 0,
        failed: 0,
        eventKey,
      };
    }

    const freeUsers = users.filter((u) => u.tier === 'free');
    const paidUsers = users.filter((u) => u.tier === 'paid');

    console.log(
      `📱 Sending tiered notifications: ${freeUsers.length} free, ${paidUsers.length} paid`,
    );

    const sendPromises = users.map(async (user) => {
      try {
        const context = await getPersonalizedContext(user, cosmicData);
        const copy = getNotificationCopy(cadence, type, user.tier, context);

        const notificationUrl = getNotificationUrl(cadence, type);

        const notification = {
          title: copy.title,
          body: copy.body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-72x72.png',
          tag: `lunary-${cadence}-${type}`,
          data: {
            url: notificationUrl,
            cadence,
            type,
            tier: user.tier,
            personalized: user.tier === 'paid' && user.hasBirthData,
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

        return { success: true, tier: user.tier };
      } catch (error) {
        console.error(
          `Failed to send to ${user.endpoint.substring(0, 50)}...`,
          error,
        );

        const errorObj = error as any;
        const isExpired =
          errorObj?.statusCode === 410 ||
          errorObj?.statusCode === 404 ||
          errorObj?.message?.includes('410') ||
          errorObj?.message?.includes('expired');

        if (isExpired) {
          await sql`
            UPDATE push_subscriptions 
            SET is_active = false 
            WHERE endpoint = ${user.endpoint}
          `;
        }

        return { success: false, tier: user.tier };
      }
    });

    const results = await Promise.allSettled(sendPromises);

    let successful = 0;
    let failed = 0;

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successful++;
      } else {
        failed++;
      }
    });

    await markEventAsSent(today, eventKey, cadence, type, 5, 'daily');

    console.log(
      `✅ Tiered notification sent: ${successful} successful, ${failed} failed`,
    );

    return {
      success: successful > 0,
      totalRecipients: users.length,
      freeRecipients: freeUsers.length,
      paidRecipients: paidUsers.length,
      successful,
      failed,
      eventKey,
    };
  } catch (error) {
    console.error('Error sending tiered notification:', error);
    return {
      success: false,
      totalRecipients: 0,
      freeRecipients: 0,
      paidRecipients: 0,
      successful: 0,
      failed: 0,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function sendDailyInsightNotification(
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  const notificationType = selectDailyNotificationType(cosmicData);
  console.log(`🎯 Selected daily notification type: ${notificationType}`);
  return sendTieredNotification('daily', notificationType, cosmicData);
}

function getNotificationUrl(cadence: string, type: string): string {
  if (type === 'monday_week_ahead') {
    return '/blog';
  }
  if (type === 'sunday_reset') {
    return '/guide';
  }
  return '/app';
}

function selectDailyNotificationType(cosmicData?: any): string {
  if (!cosmicData) {
    return 'insight';
  }

  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000,
  );

  const hasSignificantTransit =
    cosmicData.primaryEvent?.priority >= 8 ||
    cosmicData.aspectEvents?.some((e: any) => e.priority >= 8) ||
    cosmicData.ingressEvents?.some((e: any) => e.priority >= 7);

  if (hasSignificantTransit) {
    return 'sky_shift';
  }

  const rotatingTypes = [
    'tarot',
    'energy_theme',
    'insight',
    'tarot',
    'insight',
  ];
  const index = dayOfYear % rotatingTypes.length;
  return rotatingTypes[index];
}

export async function sendDailyTarotNotification(
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  return sendTieredNotification('daily', 'tarot', cosmicData);
}

export async function sendWeekAheadNotification(
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  return sendTieredNotification('weekly', 'monday_week_ahead', cosmicData);
}

export async function sendWeeklyTarotNotification(
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  return sendTieredNotification('weekly', 'friday_tarot', cosmicData);
}

export async function sendCosmicResetNotification(
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  return sendTieredNotification('weekly', 'sunday_reset', cosmicData);
}

export async function sendNewMoonNotification(
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  return sendTieredNotification('monthly', 'new_moon', cosmicData);
}

export async function sendFullMoonNotification(
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  return sendTieredNotification('monthly', 'full_moon', cosmicData);
}

export async function sendTransitChangeNotification(
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  return sendTieredNotification('event', 'transit_change', cosmicData);
}

export async function sendRisingActivationNotification(
  cosmicData?: any,
): Promise<TieredNotificationResult> {
  return sendTieredNotification('event', 'rising_activation', cosmicData);
}
