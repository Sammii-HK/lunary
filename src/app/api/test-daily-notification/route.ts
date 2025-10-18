import { NextRequest, NextResponse } from 'next/server';
import {
  sendAdminNotification,
  NotificationTemplates,
} from '../../../../utils/notifications/pushNotifications';

export const dynamic = 'force-dynamic';

// Test the actual daily overview notification that your cron job will send
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const testDate =
      searchParams.get('date') || new Date().toISOString().split('T')[0];

    console.log('🧪 Testing daily overview notification for:', testDate);

    // Fetch real cosmic content for the test date (same as cron job does)
    const cosmicResponse = await fetch(
      `https://lunary.app/api/og/cosmic-post?date=${testDate}`,
      {
        headers: { 'User-Agent': 'Lunary-Test/1.0' },
      },
    );

    let cosmicContent = null;
    if (cosmicResponse.ok) {
      cosmicContent = await cosmicResponse.json();
      console.log(
        '✅ Fetched real cosmic content:',
        cosmicContent.primaryEvent?.name,
      );
    } else {
      console.warn('⚠️ Using fallback cosmic content for test');
      cosmicContent = {
        primaryEvent: {
          name: 'Mercury Trine Jupiter',
          energy: 'Communication & Expansion Harmony',
        },
      };
    }

    // Create realistic test summary (as if cron just ran)
    const testSummary = {
      total: 5,
      successful: 5,
      failed: 0,
      successRate: '100%',
    };

    const testPosts = [
      {
        name: 'Main Cosmic',
        platforms: ['x', 'bluesky', 'instagram', 'reddit', 'pinterest'],
      },
      {
        name: 'Daily Crystal',
        platforms: ['x', 'bluesky', 'instagram', 'reddit', 'pinterest'],
      },
      {
        name: 'Daily Tarot',
        platforms: ['x', 'bluesky', 'instagram', 'reddit', 'pinterest'],
      },
      {
        name: 'Moon Phase',
        platforms: ['x', 'bluesky', 'instagram', 'reddit', 'pinterest'],
      },
      {
        name: 'Daily Horoscope',
        platforms: ['x', 'bluesky', 'instagram', 'reddit', 'pinterest'],
      },
    ];

    console.log('📱 Sending test daily overview notifications...');

    // Send both notifications that the cron job would send
    const previewResult = await sendAdminNotification(
      NotificationTemplates.dailyPreview(
        testDate,
        5,
        cosmicContent.primaryEvent,
      ),
    );

    const successResult = await sendAdminNotification(
      NotificationTemplates.cronSuccess(testSummary, testPosts),
    );

    return NextResponse.json({
      success: previewResult.success || successResult.success,
      message: 'Test daily overview notifications sent',
      testDate,
      cosmicEvent: cosmicContent.primaryEvent,
      notifications: [
        {
          type: 'Daily Preview',
          success: previewResult.success,
          messageId: previewResult.messageId,
          error: previewResult.error,
          hasImage: true,
          description:
            'Preview notification with cosmic image and event details',
        },
        {
          type: 'Cron Success',
          success: successResult.success,
          messageId: successResult.messageId,
          error: successResult.error,
          hasImage: false,
          description: 'Success summary with detailed scheduling info',
        },
      ],
      instructions: [
        'Check your phone for 2 test notifications',
        'First: Daily preview with cosmic image attached',
        'Second: Cron success with scheduling details',
        'Tap notifications to test the preview links',
        "This is exactly what you'll get every day at 8 AM UTC",
      ],
    });
  } catch (error) {
    console.error('Test daily notification error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        troubleshooting: [
          'Check PUSHOVER_API_TOKEN and PUSHOVER_USER_KEY are set',
          'Verify cosmic API is working',
          'Ensure Pushover account is active',
        ],
      },
      { status: 500 },
    );
  }
}

// POST endpoint for testing with custom cosmic event
export async function POST(request: NextRequest) {
  try {
    const {
      date = new Date().toISOString().split('T')[0],
      cosmicEvent = null,
      simulateFailure = false,
    } = await request.json();

    console.log('🧪 Testing custom daily notification:', {
      date,
      simulateFailure,
    });

    // Use provided cosmic event or fetch real one
    let testCosmicEvent = cosmicEvent;
    if (!testCosmicEvent) {
      try {
        const cosmicResponse = await fetch(
          `https://lunary.app/api/og/cosmic-post?date=${date}`,
        );
        if (cosmicResponse.ok) {
          const cosmicData = await cosmicResponse.json();
          testCosmicEvent = cosmicData.primaryEvent;
        }
      } catch {
        testCosmicEvent = {
          name: 'Venus Conjunct Moon',
          energy: 'Love & Intuition Unite',
        };
      }
    }

    if (simulateFailure) {
      // Test failure notification
      const failureResult = await sendAdminNotification(
        NotificationTemplates.cronFailure('Simulated test error: API timeout', [
          { name: 'Main Cosmic', error: 'Timeout' },
          { name: 'Daily Crystal', error: 'Network error' },
        ]),
      );

      return NextResponse.json({
        success: failureResult.success,
        message: 'Test failure notification sent',
        type: 'failure_simulation',
        result: failureResult,
      });
    }

    // Test success notifications
    const previewResult = await sendAdminNotification(
      NotificationTemplates.dailyPreview(date, 5, testCosmicEvent),
    );

    return NextResponse.json({
      success: previewResult.success,
      message: 'Custom test notification sent',
      type: 'custom_success',
      cosmicEvent: testCosmicEvent,
      result: previewResult,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to send custom test notification' },
      { status: 500 },
    );
  }
}
