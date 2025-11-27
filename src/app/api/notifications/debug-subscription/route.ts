import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const sessionResponse = await auth.api.getSession({
      headers: new Headers({
        cookie: cookieHeader,
      }),
    });

    if (!sessionResponse?.user?.id) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const userId = sessionResponse.user.id;
    const userEmail = sessionResponse.user.email;

    const subscriptions = await sql`
      SELECT 
        id,
        endpoint,
        user_id,
        user_email,
        preferences,
        is_active,
        created_at,
        last_notification_sent
      FROM push_subscriptions 
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;

    if (subscriptions.rows.length === 0) {
      return NextResponse.json({
        status: 'no_subscription',
        message: 'No push subscription found for your account.',
        userId,
        userEmail,
        diagnostics: {
          hasPushSubscription: false,
          recommendations: [
            'Enable push notifications in your browser',
            'Visit the app and allow notifications when prompted',
          ],
        },
      });
    }

    const activeSubscription = subscriptions.rows.find((s) => s.is_active);
    const subscription = activeSubscription || subscriptions.rows[0];
    const preferences = subscription.preferences || {};

    const diagnostics = {
      hasPushSubscription: true,
      isActive: subscription.is_active,
      hasUserId: !!subscription.user_id,
      hasUserEmail: !!subscription.user_email,
      hasBirthday: !!(preferences.birthday && preferences.birthday !== ''),
      birthdayValue: preferences.birthday || null,

      cosmicPulseEnabled:
        preferences.cosmicPulse === true ||
        preferences.cosmicPulse === 'true' ||
        preferences.cosmicPulse === null ||
        preferences.cosmicPulse === undefined,
      cosmicPulseValue: preferences.cosmicPulse,

      tarotEnabled:
        preferences.tarotNotifications === true ||
        preferences.tarotNotifications === 'true',
      tarotValue: preferences.tarotNotifications,

      moonPhasesEnabled:
        preferences.moonPhases === true ||
        preferences.moonPhases === 'true' ||
        preferences.moonPhases === null,
      moonPhasesValue: preferences.moonPhases,

      cosmicEventsEnabled:
        preferences.cosmicEvents === true ||
        preferences.cosmicEvents === 'true' ||
        preferences.cosmicEvents === null,
      cosmicEventsValue: preferences.cosmicEvents,

      majorAspectsEnabled:
        preferences.majorAspects === true ||
        preferences.majorAspects === 'true' ||
        preferences.majorAspects === null,
      majorAspectsValue: preferences.majorAspects,

      lastNotificationSent: subscription.last_notification_sent,
      subscriptionCreatedAt: subscription.created_at,
    };

    const issues: string[] = [];
    const recommendations: string[] = [];

    if (!subscription.is_active) {
      issues.push('Subscription is marked as inactive');
      recommendations.push('Re-enable notifications in your browser settings');
    }

    if (!diagnostics.hasBirthday) {
      issues.push(
        'Birthday is not set in push subscription - required for Cosmic Pulse and Tarot notifications',
      );
      recommendations.push(
        'Your birthday may be saved in your profile but not synced to notifications. ' +
          'Try POST /api/notifications/sync-profile with {"birthday": "YYYY-MM-DD", "name": "Your Name"} to sync it.',
      );
    }

    if (!diagnostics.tarotEnabled) {
      issues.push('Tarot notifications are not explicitly enabled');
      recommendations.push(
        'Enable tarot notifications in settings (must be explicitly turned on)',
      );
    }

    if (!subscription.user_id) {
      issues.push('Subscription is not linked to a user account');
      recommendations.push(
        'Try logging out and logging back in, then re-enable notifications',
      );
    }

    const willReceive = {
      cosmicPulse:
        diagnostics.isActive &&
        diagnostics.hasBirthday &&
        diagnostics.cosmicPulseEnabled,
      tarot:
        diagnostics.isActive &&
        diagnostics.hasBirthday &&
        diagnostics.tarotEnabled,
      dailyCosmicEvent:
        diagnostics.isActive &&
        (diagnostics.cosmicEventsEnabled ||
          diagnostics.moonPhasesEnabled ||
          diagnostics.majorAspectsEnabled),
      moonCircles:
        diagnostics.isActive &&
        (preferences.moonCircles === true ||
          preferences.moonCircles === 'true' ||
          preferences.moonCircles === null),
    };

    const today = new Date().toISOString().split('T')[0];
    const sentToday = await sql`
      SELECT event_key, event_name, event_type, sent_at, sent_by
      FROM notification_sent_events
      WHERE date = ${today}::date
      ORDER BY sent_at DESC
    `;

    return NextResponse.json({
      status: issues.length === 0 ? 'healthy' : 'issues_found',
      userId,
      userEmail,
      subscription: {
        id: subscription.id,
        isActive: subscription.is_active,
        createdAt: subscription.created_at,
        lastNotificationSent: subscription.last_notification_sent,
        endpointPreview: subscription.endpoint.substring(0, 60) + '...',
      },
      preferences: {
        birthday: preferences.birthday ? '****-**-**' : null,
        hasBirthday: diagnostics.hasBirthday,
        cosmicPulse: preferences.cosmicPulse,
        tarotNotifications: preferences.tarotNotifications,
        moonPhases: preferences.moonPhases,
        cosmicEvents: preferences.cosmicEvents,
        majorAspects: preferences.majorAspects,
        moonCircles: preferences.moonCircles,
        cosmicChanges: preferences.cosmicChanges,
      },
      willReceiveNotifications: willReceive,
      diagnostics,
      issues,
      recommendations,
      notificationsSentToday: sentToday.rows.map((row) => ({
        eventKey: row.event_key,
        eventName: row.event_name,
        eventType: row.event_type,
        sentAt: row.sent_at,
        sentBy: row.sent_by,
      })),
      totalSubscriptions: subscriptions.rows.length,
      activeSubscriptions: subscriptions.rows.filter((s) => s.is_active).length,
    });
  } catch (error) {
    console.error('Error in debug-subscription:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch subscription info',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
