import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';

// Lazy initialization of VAPID keys (only when actually needed)
function ensureVapidConfigured() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    throw new Error(
      'VAPID keys not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment variables.',
    );
  }

  webpush.setVapidDetails('mailto:info@lunary.app', publicKey, privateKey);
}

export async function POST(request: NextRequest) {
  try {
    // Configure VAPID keys when actually needed (not at module load time)
    ensureVapidConfigured();

    // Check if VAPID keys are configured (redundant but kept for clarity)
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      return NextResponse.json(
        {
          error: 'VAPID keys not configured',
          details:
            'Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in your environment variables.',
          vapidPublicKeySet: !!process.env.VAPID_PUBLIC_KEY,
          vapidPrivateKeySet: !!process.env.VAPID_PRIVATE_KEY,
        },
        { status: 500 },
      );
    }

    // Get all active subscriptions
    const subscriptions = await sql`
      SELECT endpoint, p256dh, auth, user_id, preferences
      FROM push_subscriptions 
      WHERE is_active = true
      LIMIT 10
    `;

    if (subscriptions.rows.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active subscriptions found',
        recipientCount: 0,
        vapidPublicKeyLength: process.env.VAPID_PUBLIC_KEY?.length || 0,
      });
    }

    const testNotification = {
      title: '🔔 Test Notification',
      body: 'This is a test notification! If you received this, push notifications are working correctly.',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'lunary-test-notification',
      data: {
        url: '/',
        type: 'test',
        timestamp: new Date().toISOString(),
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

    console.log(
      `🧪 Sending test notification to ${subscriptions.rows.length} subscribers`,
    );

    // Send test notifications
    const sendPromises = subscriptions.rows.map(async (sub: any) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify(testNotification),
        );

        return {
          success: true,
          endpoint: sub.endpoint.substring(0, 50) + '...',
        };
      } catch (error) {
        console.error(
          `❌ Failed to send test to ${sub.endpoint.substring(0, 50)}...`,
          error,
        );

        // If subscription is invalid, mark as inactive
        if (
          error instanceof Error &&
          (error.message.includes('410') ||
            error.message.includes('invalid') ||
            error.message.includes('expired'))
        ) {
          await sql`
            UPDATE push_subscriptions 
            SET is_active = false 
            WHERE endpoint = ${sub.endpoint}
          `;
        }

        return {
          success: false,
          endpoint: sub.endpoint.substring(0, 50) + '...',
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.allSettled(sendPromises);
    const successful = results.filter(
      (r) => r.status === 'fulfilled' && r.value.success,
    ).length;
    const failed = results.length - successful;

    console.log(
      `✅ Test notification sent: ${successful} successful, ${failed} failed`,
    );

    return NextResponse.json({
      success: successful > 0,
      message: `Test notification sent to ${successful} of ${subscriptions.rows.length} subscribers`,
      recipientCount: subscriptions.rows.length,
      successful,
      failed,
      vapidPublicKeyLength: process.env.VAPID_PUBLIC_KEY?.length || 0,
      results: results.map((r) =>
        r.status === 'fulfilled' ? r.value : { error: 'Promise rejected' },
      ),
    });
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return NextResponse.json(
      {
        error: 'Failed to send test notification',
        details: error instanceof Error ? error.message : 'Unknown error',
        vapidPublicKeySet: !!process.env.VAPID_PUBLIC_KEY,
        vapidPrivateKeySet: !!process.env.VAPID_PRIVATE_KEY,
      },
      { status: 500 },
    );
  }
}

// GET endpoint to check notification setup
export async function GET(request: NextRequest) {
  try {
    const subscriptions = await sql`
      SELECT COUNT(*) as count
      FROM push_subscriptions 
      WHERE is_active = true
    `;

    return NextResponse.json({
      vapidPublicKeySet: !!process.env.VAPID_PUBLIC_KEY,
      vapidPrivateKeySet: !!process.env.VAPID_PRIVATE_KEY,
      vapidPublicKeyLength: process.env.VAPID_PUBLIC_KEY?.length || 0,
      activeSubscriptions: parseInt(subscriptions.rows[0]?.count || '0'),
      setupComplete:
        !!process.env.VAPID_PUBLIC_KEY && !!process.env.VAPID_PRIVATE_KEY,
    });
  } catch (error) {
    console.error('❌ Error checking notification setup:', error);
    return NextResponse.json(
      {
        error: 'Failed to check setup',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
