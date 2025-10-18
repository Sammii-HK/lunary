import { NextRequest, NextResponse } from 'next/server';
import { sendAdminNotification } from '../../../../utils/notifications/pushNotifications';

export const dynamic = 'force-dynamic';

// Test push notification endpoint
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing push notification...');

    const testNotification = {
      title: '🧪 Lunary Test Notification',
      message:
        'Push notifications are working! Your cron jobs will now send alerts to your phone.',
      url: 'https://lunary.app/admin',
      priority: 'normal' as const,
      sound: 'cosmic',
    };

    const result = await sendAdminNotification(testNotification);

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? 'Test notification sent via Pushover'
        : 'Notification failed',
      result: {
        service: result.service,
        success: result.success,
        messageId: result.messageId,
        error: result.error,
      },
      nextSteps: result.success
        ? [
            'Check your phone for the test notification',
            'Tap the notification to open the admin dashboard',
            'Your cron jobs will now send alerts automatically',
          ]
        : [
            'Check your environment variables are set correctly',
            'Verify PUSHOVER_API_TOKEN and PUSHOVER_USER_KEY',
            'Make sure you created an application in Pushover dashboard',
          ],
    });
  } catch (error) {
    console.error('Test notification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          'Check environment variables are set',
          'Verify Pushover account is active',
          'Ensure API token has correct permissions',
        ],
      },
      { status: 500 },
    );
  }
}

// POST endpoint for custom test notifications
export async function POST(request: NextRequest) {
  try {
    const { title, message, url, priority } = await request.json();

    const customNotification = {
      title: title || '🧪 Custom Test',
      message: message || 'Custom test notification from Lunary admin',
      url: url || 'https://lunary.app/admin',
      priority: priority || 'normal',
    };

    const result = await sendAdminNotification(customNotification);

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? 'Custom notification sent'
        : 'Notification failed',
      result,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send custom notification' },
      { status: 500 },
    );
  }
}
