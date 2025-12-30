import { NextRequest, NextResponse } from 'next/server';
import { getImageBaseUrl } from '@/lib/urls';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { success: false, error: 'CRON_SECRET not set' },
        { status: 500 },
      );
    }

    const baseUrl = getImageBaseUrl();
    const endpoint = `${baseUrl}/api/cron/daily-posts${force ? '?force=true' : ''}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${cronSecret}`,
        'x-internal-test': 'true',
        'User-Agent': 'Manual-Test-Trigger',
      },
    });

    const data = await response.json().catch(() => ({}));
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
