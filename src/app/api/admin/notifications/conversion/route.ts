import { NextRequest, NextResponse } from 'next/server';
import {
  sendDiscordAdminNotification,
  queueAnalyticsEvent,
} from '@/lib/discord';
import { requireAdminAuth } from '@/lib/admin-auth';

const HIGH_VALUE_EVENTS = ['trial_converted', 'subscription_started'];

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdminAuth(request);
    if (authResult instanceof NextResponse) return authResult;

    const bodyText = await request.text();
    if (!bodyText || bodyText.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400 },
      );
    }

    const body = JSON.parse(bodyText);
    const { eventType, userId, userEmail, planType, metadata } = body;

    if (eventType === 'signup' || eventType === 'trial_started') {
      await queueAnalyticsEvent({
        category: 'analytics',
        eventType: 'conversion',
        title: `${eventType}: ${userEmail || 'Unknown'}`,
        dedupeKey: `conversion-${eventType}-${userId || userEmail || Date.now()}`,
        metadata: {
          eventType,
          userId,
          userEmail,
          planType,
          metadata,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${eventType} event queued for daily analytics summary`,
      });
    }

    if (!HIGH_VALUE_EVENTS.includes(eventType)) {
      await queueAnalyticsEvent({
        category: 'analytics',
        eventType: 'conversion',
        title: `${eventType}: ${userEmail || 'Unknown'}`,
        dedupeKey: `conversion-${eventType}-${userId || userEmail || Date.now()}`,
        metadata: {
          eventType,
          userId,
          userEmail,
          planType,
          metadata,
        },
      });

      return NextResponse.json({
        success: true,
        message: `${eventType} event queued for daily analytics summary`,
      });
    }

    let title = '';
    let message = '';

    switch (eventType) {
      case 'trial_converted':
        title = '💰 Trial Converted!';
        message = `Trial converted to ${planType || 'monthly'} subscription: ${userEmail || 'Unknown email'}`;
        break;

      case 'subscription_started':
        title = '💳 New Subscription!';
        message = `New ${planType || 'monthly'} subscription: ${userEmail || 'Unknown email'}`;
        break;

      default:
        title = '📊 Conversion Event';
        message = `${eventType}: ${userEmail || 'Unknown email'}`;
    }

    const fields = [
      {
        name: 'Event Type',
        value: eventType,
        inline: true,
      },
      {
        name: 'Plan Type',
        value: planType || 'N/A',
        inline: true,
      },
    ];

    if (userId) {
      fields.push({
        name: 'User ID',
        value: userId,
        inline: true,
      });
    }

    const result = await sendDiscordAdminNotification({
      title,
      message,
      priority: 'high',
      url:
        process.env.NODE_ENV === 'production'
          ? 'https://lunary.app/admin/analytics'
          : 'http://localhost:3000/admin/analytics',
      fields,
      category: 'urgent',
      dedupeKey: `conversion-${eventType}-${userId || userEmail || Date.now()}`,
    });

    return NextResponse.json({
      success: result.ok,
      message: result.ok
        ? 'Notification sent successfully'
        : result.error || 'Failed to send notification',
    });
  } catch (error) {
    console.error('Error sending conversion notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
