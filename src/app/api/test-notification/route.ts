import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Verify authorization
    const authHeader = request.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🧪 Testing push notifications...');

    // Get test notification type from request
    const { testType = 'moon' } = await request.json().catch(() => ({}));

    let testNotification;

    switch (testType) {
      case 'moon':
        testNotification = {
          type: 'moon',
          title: '🌓 First Quarter Moon (TEST)',
          body: 'Take action on your intentions and push forward - This is a test notification',
          data: {
            date: new Date().toISOString().split('T')[0],
            eventName: 'First Quarter Moon Test',
            priority: 10,
            eventType: 'moon',
            isTest: true,
          },
        };
        break;

      case 'retrograde':
        testNotification = {
          type: 'retrograde',
          title: '☿ Mercury Retrograde (TEST)',
          body: 'Time for reflection and review - This is a test notification',
          data: {
            date: new Date().toISOString().split('T')[0],
            eventName: 'Mercury Retrograde Test',
            priority: 9,
            eventType: 'retrograde',
            isTest: true,
          },
        };
        break;

      case 'eclipse':
        testNotification = {
          type: 'eclipse',
          title: '🌙 Lunar Eclipse (TEST)',
          body: 'Major transformation portal opens - This is a test notification',
          data: {
            date: new Date().toISOString().split('T')[0],
            eventName: 'Lunar Eclipse Test',
            priority: 10,
            eventType: 'eclipse',
            isTest: true,
          },
        };
        break;

      default:
        testNotification = {
          type: 'moon',
          title: '✨ Cosmic Event (TEST)',
          body: 'Test notification from Lunary - Check if push notifications are working',
          data: {
            date: new Date().toISOString().split('T')[0],
            eventName: 'Test Event',
            priority: 10,
            eventType: 'moon',
            isTest: true,
          },
        };
    }

    // Send test notification via the notifications API
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://www.lunary.app'
        : 'http://localhost:3000';

    const response = await fetch(`${baseUrl}/api/notifications/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
      body: JSON.stringify({
        payload: testNotification,
      }),
    });

    const result = await response.json();

    console.log('🧪 Test notification result:', result);

    return NextResponse.json({
      success: true,
      message: 'Test notification sent',
      testType,
      notificationsSent: result.recipientCount || 0,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Test notification failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
