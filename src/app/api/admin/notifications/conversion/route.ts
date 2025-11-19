import { NextRequest, NextResponse } from 'next/server';
import { sendDiscordAdminNotification } from '@/lib/discord';

export async function POST(request: NextRequest) {
  try {
    // Handle empty body gracefully
    const bodyText = await request.text();
    if (!bodyText || bodyText.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Request body is required' },
        { status: 400 },
      );
    }

    const body = JSON.parse(bodyText);
    const { eventType, userId, userEmail, planType, metadata } = body;

    let title = '';
    let message = '';
    let priority = 0;

    switch (eventType) {
      case 'signup':
        // Skip signup notifications - too noisy, only notify on conversions
        return NextResponse.json({
          success: true,
          message: 'Signup event logged (notification skipped)',
        });

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

    const priorityMap: Record<string, 'low' | 'normal' | 'high' | 'emergency'> =
      {
        '-1': 'low',
        '0': 'normal',
        '1': 'high',
        '2': 'emergency',
      };

    const pushoverPriority = priorityMap[priority.toString()] || 'normal';

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
      priority: pushoverPriority,
      url:
        process.env.NODE_ENV === 'production'
          ? 'https://lunary.app/admin/analytics'
          : 'http://localhost:3000/admin/analytics',
      fields,
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
