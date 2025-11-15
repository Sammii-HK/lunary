import { NextRequest, NextResponse } from 'next/server';

import { trackNotificationEvent } from '@/lib/analytics/tracking';

const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==',
  'base64',
);

const VALID_EVENTS = new Set(['opened', 'clicked', 'delivered']);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const notificationType = searchParams.get('type') || 'email';
    const notificationId = searchParams.get('id') || undefined;
    const eventParam = (searchParams.get('event') || 'opened').toLowerCase();
    const eventType = VALID_EVENTS.has(eventParam) ? eventParam : 'opened';
    const userId =
      searchParams.get('user') ||
      searchParams.get('user_id') ||
      searchParams.get('uid') ||
      undefined;

    if (userId) {
      await trackNotificationEvent({
        userId,
        notificationType,
        eventType: eventType as 'opened' | 'clicked' | 'delivered',
        notificationId,
        metadata: {
          ip: request.headers.get('x-forwarded-for') || undefined,
          userAgent: request.headers.get('user-agent') || undefined,
          source: 'email_pixel',
        },
      });
    }

    return new NextResponse(PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': PIXEL.length.toString(),
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    console.error(
      '[analytics/track-notification] Failed to track pixel',
      error,
    );
    return new NextResponse(PIXEL, {
      headers: {
        'Content-Type': 'image/gif',
        'Content-Length': PIXEL.length.toString(),
        'Cache-Control':
          'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  }
}
