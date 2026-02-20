import { NextRequest, NextResponse } from 'next/server';
import { getImageBaseUrl } from '@/lib/urls';
import { requireAdminAuth } from '@/lib/admin-auth';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await request.json().catch(() => ({}));
    const force = Boolean(body?.force);
    const date = typeof body?.date === 'string' ? body.date : undefined;
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      return NextResponse.json(
        { success: false, error: 'CRON_SECRET not set' },
        { status: 500 },
      );
    }

    const baseUrl = getImageBaseUrl();
    const query = new URLSearchParams();
    if (force) query.set('force', 'true');
    if (date) query.set('date', date);
    const endpoint = `${baseUrl}/api/cron/daily-posts${query.toString() ? `?${query.toString()}` : ''}`;

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
