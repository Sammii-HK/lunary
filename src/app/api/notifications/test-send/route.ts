import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
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

    const userEmail = sessionResponse?.user?.email?.toLowerCase();
    const adminEmails = (
      process.env.ADMIN_EMAILS ||
      process.env.ADMIN_EMAIL ||
      ''
    )
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);

    const isAdmin = Boolean(userEmail && adminEmails.includes(userEmail));

    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 },
      );
    }

    const { type } = await request.json();
    const baseUrl =
      process.env.NODE_ENV === 'production'
        ? 'https://lunary.app'
        : 'http://localhost:3000';

    const endpoints: Record<string, string> = {
      'cosmic-pulse': '/api/cron/daily-cosmic-pulse',
      tarot: '/api/cron/personalized-tarot',
      'cosmic-event': '/api/cron/daily-cosmic-event',
      'cosmic-changes': '/api/cron/cosmic-changes-notification',
      'moon-circles': '/api/cron/moon-circles',
    };

    const endpoint = endpoints[type];
    if (!endpoint) {
      return NextResponse.json(
        {
          error: 'Invalid notification type',
          validTypes: Object.keys(endpoints),
        },
        { status: 400 },
      );
    }

    console.log(`[test-send] Triggering ${type} notification...`);

    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      },
    });

    const result = await response.json();

    return NextResponse.json({
      success: true,
      type,
      endpoint,
      result,
    });
  } catch (error) {
    console.error('Error in test-send:', error);
    return NextResponse.json(
      {
        error: 'Failed to trigger notification',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
