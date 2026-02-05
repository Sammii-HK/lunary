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
import { broadcastNativePush } from './native-push-sender';

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
  failureDetails?: Array<{
    userId?: string;
    tier: string;
    error: string;
    statusCode?: number;
    isExpired: boolean;
  }>;
}

export async function getUsersWithTierInfo(): Promise<
  UserNotificationProfile[]
> {
  // First, check total count of subscriptions (for debugging)
  const totalCount = await sql`
    SELECT COUNT(*) as total FROM push_subscriptions
  `;
  const activeCount = await sql`
    SELECT COUNT(*) as active FROM push_subscriptions WHERE is_active = true
  `;
  console.log(
    `📊 Push subscriptions: ${totalCount.rows[0]?.total || 0} total, ${activeCount.rows[0]?.active || 0} active`,
  );

  // Query push_subscriptions first (similar to moon circle notifications)
  // Then get subscription status separately to avoid JOIN issues
  const result = await sql`
    SELECT 
      endpoint,
      p256dh,
      auth,
      user_id,
      preferences->>'name' as name,
      preferences->>'birthday' as birthday,
      preferences->>'timezone' as timezone
    FROM push_subscriptions
    WHERE is_active = true
  `;

  // Get subscription statuses separately (more robust than JOIN)
  // Validate and sanitize user IDs: ensure they're strings and non-empty
  const userIds = result.rows
    .map((r) => r.user_id)
    .filter((id): id is string => {
      // Type guard: ensure id is a non-empty string
      return typeof id === 'string' && id.trim().length > 0;
    });

  let subscriptionStatuses: Record<string, { status: string; plan: string }> =
    {};

  if (userIds.length > 0) {
    try {
      const subResults = await sql.query(
        `
          SELECT user_id, status, plan_type
          FROM subscriptions
          WHERE user_id = ANY($1::text[])
        `,
        [userIds],
      );
      subscriptionStatuses = subResults.rows.reduce(
        (acc, row) => {
          acc[row.user_id] = { status: row.status, plan: row.plan_type };
          return acc;
        },
        {} as Record<string, { status: string; plan: string }>,
      );
    } catch (error) {
      console.warn(
        '⚠️ Could not fetch subscription statuses (subscriptions table may not exist):',
        error,
      );
      // Continue without subscription statuses - default to 'free'
    }
  }

  console.log(
    `📱 Found ${result.rows.length} active subscriptions with tier info`,
  );

  // Debug: Log sample subscription data if any found
  if (result.rows.length > 0) {
    console.log(
      `📋 Sample subscription: user_id=${result.rows[0].user_id}, status=${result.rows[0].subscription_status}, plan=${result.rows[0].plan_type}`,
    );
  } else {
    // Additional debug: Check if there are any active subscriptions at all
    const activeOnly = await sql`
      SELECT COUNT(*) as count, user_id, is_active
      FROM push_subscriptions
      WHERE is_active = true
      GROUP BY user_id, is_active
      LIMIT 5
    `;
    console.log(
      `🔍 Debug: Active subscriptions check: ${activeOnly.rows.length} unique users with active subscriptions`,
    );
    if (activeOnly.rows.length > 0) {
      console.log(
        `🔍 Debug: Sample active subscription user_ids: ${activeOnly.rows.map((r) => r.user_id).join(', ')}`,
      );
    }
  }

  return result.rows.map((row) => {
    const subInfo = subscriptionStatuses[row.user_id] || {
      status: 'free',
      plan: 'free',
    };
    const isPaid =
      subInfo.status === 'active' ||
      subInfo.status === 'trial' ||
      subInfo.status === 'trialing';

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
      subscriptionStatus: subInfo.status,
      planType: subInfo.plan,
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

        const notificationUrl = getNotificationUrl(cadence, type, cosmicData);

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
        const errorObj = error as any;
        const statusCode = errorObj?.statusCode;
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        const endpointPreview = user.endpoint.substring(0, 50);

        // Enhanced error logging
        // Sanitize userId for logging (ensure it's a string)
        const sanitizedUserId =
          typeof user.userId === 'string' && user.userId.trim().length > 0
            ? user.userId
            : 'unknown';

        console.error(
          `❌ Failed to send notification to ${endpointPreview}...`,
          {
            userId: sanitizedUserId,
            tier: user.tier,
            endpoint: endpointPreview,
            statusCode,
            error: errorMessage,
            errorType: errorObj?.name || 'Unknown',
            errorBody: errorObj?.body || errorObj?.response?.body || null,
            timestamp: new Date().toISOString(),
          },
        );

        const isExpired =
          statusCode === 410 ||
          statusCode === 404 ||
          errorMessage.includes('410') ||
          errorMessage.includes('404') ||
          errorMessage.includes('expired') ||
          errorMessage.includes('invalid') ||
          errorMessage.includes('unsubscribed') ||
          errorMessage.includes('Gone') ||
          errorMessage.includes('Not Found');

        if (isExpired) {
          console.log(
            `🔄 Marking subscription as inactive (${statusCode || 'expired'}): ${endpointPreview}...`,
          );
          await sql`
            UPDATE push_subscriptions 
            SET is_active = false, updated_at = NOW()
            WHERE endpoint = ${user.endpoint}
          `;
        }

        return {
          success: false,
          userId: user.userId,
          tier: user.tier,
          error: errorMessage,
          statusCode,
          isExpired,
        };
      }
    });

    const results = await Promise.allSettled(sendPromises);

    let successful = 0;
    let failed = 0;
    const failureDetails: Array<{
      userId?: string;
      tier: string;
      error: string;
      statusCode?: number;
      isExpired: boolean;
    }> = [];

    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successful++;
      } else {
        failed++;
        if (result.status === 'fulfilled' && !result.value.success) {
          failureDetails.push({
            userId: result.value.userId,
            tier: result.value.tier,
            error: result.value.error || 'Unknown error',
            statusCode: result.value.statusCode,
            isExpired: result.value.isExpired || false,
          });
        } else if (result.status === 'rejected') {
          failureDetails.push({
            tier: 'unknown',
            error:
              result.reason?.message || result.reason || 'Promise rejected',
            isExpired: false,
          });
        }
      }
    });

    // Log failure details
    if (failed > 0) {
      console.log(`❌ ${failed} notification(s) failed:`, failureDetails);
      const expiredCount = failureDetails.filter((f) => f.isExpired).length;
      if (expiredCount > 0) {
        console.log(
          `🔄 ${expiredCount} subscription(s) marked as inactive due to expired endpoints`,
        );
      }
    }

    // Also send to native push devices (iOS/Android via FCM)
    let nativeSuccessful = 0;
    let nativeFailed = 0;
    try {
      // Map notification type to preference key
      const preferenceKey = mapTypeToPreferenceKey(type);
      const nativePayload = {
        title: getNotificationCopy(cadence, type, 'free', {}).title,
        body: getNotificationCopy(cadence, type, 'free', {}).body,
        data: {
          url: getNotificationUrl(cadence, type, cosmicData),
          type,
          cadence,
        },
      };

      const nativeResult = await broadcastNativePush(
        nativePayload,
        preferenceKey,
      );
      nativeSuccessful = nativeResult.successful;
      nativeFailed = nativeResult.failed;

      if (nativeResult.tokens > 0) {
        console.log(
          `📱 Native push: ${nativeSuccessful} success, ${nativeFailed} failed out of ${nativeResult.tokens}`,
        );
      }
    } catch (nativeError) {
      console.error('Native push failed (non-blocking):', nativeError);
    }

    await markEventAsSent(today, eventKey, cadence, type, 5, 'daily');

    const totalSuccessful = successful + nativeSuccessful;
    const totalFailed = failed + nativeFailed;

    console.log(
      `✅ Tiered notification sent: ${totalSuccessful} successful (${successful} web, ${nativeSuccessful} native), ${totalFailed} failed`,
    );

    return {
      success: totalSuccessful > 0,
      totalRecipients: users.length,
      freeRecipients: freeUsers.length,
      paidRecipients: paidUsers.length,
      successful: totalSuccessful,
      failed: totalFailed,
      eventKey,
      failureDetails: failed > 0 ? failureDetails : undefined,
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

function getNotificationUrl(
  cadence: string,
  type: string,
  eventData?: any,
): string {
  // Weekly special cases
  if (type === 'monday_week_ahead') {
    return '/blog';
  }
  if (type === 'sunday_reset') {
    return '/guide';
  }

  // Daily notifications - dashboard shows these prominently
  if (type === 'tarot' || type === 'energy_theme' || type === 'insight') {
    return '/app';
  }

  // Sky shift alert - show on horoscope with transit context
  if (type === 'sky_shift') {
    return '/horoscope#transit-wisdom';
  }

  // Weekly tarot
  if (type === 'friday_tarot') {
    return '/app';
  }

  // Event-based notifications
  if (cadence === 'event') {
    if (type === 'transit_change') {
      return '/horoscope#transit-wisdom';
    }
    if (type === 'rising_activation') {
      return '/birth-chart';
    }
  }

  // Moon circles - navigate to dedicated page
  if (type === 'moon_circle') {
    return '/moon-circles';
  }

  // Personal transits - widget on horoscope page
  if (type === 'personal_transit') {
    return '/horoscope#personal-transits';
  }

  // Cosmic changes - show on cosmic state page
  if (type === 'cosmic_changes') {
    return '/cosmic-state#current-transits';
  }

  // Weekly report - navigate to reports page
  if (type === 'weekly_report') {
    return '/reports';
  }

  // Cosmic event-based deep links
  if (eventData?.eventType) {
    const { eventType, planet, sign, aspect, planetA, planetB, name } =
      eventData;

    // Retrograde - show on dashboard (integrated into TransitOfTheDay)
    if (eventType === 'retrograde' && planet) {
      return `/app#retrograde-${encodeURIComponent(planet.toLowerCase())}`;
    }

    // Ingress - show on horoscope transit section
    if (eventType === 'ingress' && planet && sign) {
      return `/horoscope#transit-wisdom`;
    }

    // Aspect - show on horoscope aspects section
    if (eventType === 'aspect' && planetA && planetB && aspect) {
      return `/horoscope#today-aspects`;
    }

    // Moon phase - show on dashboard
    if (eventType === 'moon') {
      return '/app#moon-phase';
    }

    // Sabbat/seasonal - show on cosmic state (mixed into current transits)
    if (eventType === 'seasonal' && name) {
      return '/cosmic-state#current-transits';
    }

    // Eclipse - show on cosmic state
    if (eventType === 'eclipse' && name) {
      return '/cosmic-state#current-transits';
    }
  }

  // Default fallback
  return '/app';
}

/**
 * Map notification type to native push preference key
 */
function mapTypeToPreferenceKey(type: string): string | undefined {
  const mapping: Record<string, string> = {
    tarot: 'daily_card',
    energy_theme: 'daily_card',
    insight: 'daily_card',
    moon_phase: 'moon_phase',
    moon_circle: 'moon_phase',
    transit_change: 'transit',
    sky_shift: 'transit',
    cosmic_changes: 'transit',
    personal_transit: 'transit',
    rising_activation: 'transit',
    weekly_report: 'weekly_report',
    sunday_reset: 'weekly_report',
    monday_week_ahead: 'weekly_report',
    friday_tarot: 'daily_card',
  };
  return mapping[type];
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
