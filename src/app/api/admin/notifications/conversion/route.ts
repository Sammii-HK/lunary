import { NextRequest, NextResponse } from 'next/server';
import { sendPushoverNotification } from '../../../../../../utils/notifications/pushNotifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventType, userId, userEmail, planType, metadata } = body;

    let title = '';
    let message = '';
    let priority = 0;

    switch (eventType) {
      case 'signup':
        title = '🎉 New User Signup';
        message = `New user registered: ${userEmail || 'Unknown email'}`;
        priority = 0;
        break;

      case 'trial_started':
        title = '✨ Free Trial Started';
        message = `User started ${planType || 'monthly'} trial: ${userEmail || 'Unknown email'}`;
        priority = 1;
        break;

      case 'trial_converted':
        title = '💰 Trial Converted!';
        message = `Trial converted to ${planType || 'monthly'} subscription: ${userEmail || 'Unknown email'}`;
        priority = 1;
        break;

      case 'subscription_started':
        title = '💳 New Subscription!';
        message = `New ${planType || 'monthly'} subscription: ${userEmail || 'Unknown email'}`;
        priority = 1;
        break;

      default:
        title = '📊 Conversion Event';
        message = `${eventType}: ${userEmail || 'Unknown email'}`;
        priority = 0;
    }

    const priorityMap: Record<number, 'low' | 'normal' | 'high' | 'emergency'> =
      {
        '-1': 'low',
        '0': 'normal',
        '1': 'high',
        '2': 'emergency',
      };

    const result = await sendPushoverNotification({
      title,
      message,
      priority:
        priorityMap[priority.toString() as keyof typeof priorityMap] ||
        'normal',
      sound:
        eventType.includes('converted') || eventType.includes('subscription')
          ? 'cashregister'
          : 'default',
      url:
        process.env.NODE_ENV === 'production'
          ? 'https://lunary.app/admin/analytics'
          : 'http://localhost:3000/admin/analytics',
    });

    return NextResponse.json({
      success: result.success,
      message: result.success
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
