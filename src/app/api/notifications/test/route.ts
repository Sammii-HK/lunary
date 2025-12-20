import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

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
    ensureVapidConfigured();

    const { endpoint, title, body } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 },
      );
    }

    // Get subscription from database
    const subscription = await sql`
      SELECT endpoint, p256dh, auth, user_id, is_active
      FROM push_subscriptions
      WHERE endpoint = ${endpoint}
      LIMIT 1
    `;

    if (subscription.rows.length === 0) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 },
      );
    }

    const sub = subscription.rows[0];

    if (!sub.is_active) {
      return NextResponse.json(
        { error: 'Subscription is not active' },
        { status: 400 },
      );
    }

    const notificationData = {
      title: title || 'Test Notification',
      body: body || 'This is a test notification from Lunary',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'lunary-test',
      data: {
        url: '/app',
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

    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(notificationData),
      );

      // Update last notification sent timestamp
      await sql`
        UPDATE push_subscriptions 
        SET last_notification_sent = NOW() 
        WHERE endpoint = ${sub.endpoint}
      `;

      return NextResponse.json({
        success: true,
        message: 'Test notification sent successfully',
        endpoint: sub.endpoint.substring(0, 50) + '...',
        userId: sub.user_id,
      });
    } catch (error) {
      const errorObj = error as any;
      const statusCode = errorObj?.statusCode;
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      console.error('❌ Test notification failed:', {
        endpoint: sub.endpoint.substring(0, 50) + '...',
        statusCode,
        error: errorMessage,
        errorType: errorObj?.name || 'Unknown',
      });

      // Mark as inactive if expired
      const isExpired =
        statusCode === 410 ||
        statusCode === 404 ||
        errorMessage.includes('410') ||
        errorMessage.includes('404') ||
        errorMessage.includes('invalid') ||
        errorMessage.includes('expired');

      if (isExpired) {
        await sql`
          UPDATE push_subscriptions 
          SET is_active = false, updated_at = NOW()
          WHERE endpoint = ${sub.endpoint}
        `;
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          statusCode,
          endpoint: sub.endpoint.substring(0, 50) + '...',
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('❌ Test notification endpoint error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

// GET endpoint to list available subscriptions for testing
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const subscriptions = await sql`
      SELECT 
        endpoint,
        user_id,
        user_email,
        is_active,
        last_notification_sent,
        created_at,
        SUBSTRING(endpoint, 1, 80) as endpoint_preview
      FROM push_subscriptions
      WHERE is_active = true
      ORDER BY last_notification_sent DESC NULLS LAST
      LIMIT ${limit}
    `;

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions.rows.map((sub) => ({
        endpoint: sub.endpoint,
        endpointPreview: sub.endpoint_preview,
        userId: sub.user_id,
        userEmail: sub.user_email,
        isActive: sub.is_active,
        lastNotificationSent: sub.last_notification_sent,
        createdAt: sub.created_at,
      })),
      count: subscriptions.rows.length,
    });
  } catch (error) {
    console.error('❌ Failed to list subscriptions:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
