import { NextRequest, NextResponse } from 'next/server';

import { trackActivity } from '@/lib/analytics/tracking';
import { requireAuth } from '@/lib/get-user-session';

export const dynamic = 'force-dynamic';

type TrackPayload = {
  userId?: string;
  user_id?: string;
  activity_type?: string;
  activityType?: string;
  activity_date?: string;
  activityDate?: string;
  count?: number;
  metadata?: Record<string, any>;
};

export async function POST(request: NextRequest) {
  const authResult = await requireAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = (await request.json()) as TrackPayload | null;
    if (!body) {
      return NextResponse.json({ error: 'Body is required' }, { status: 400 });
    }

    // Always use the session user — ignore any userId in the body to prevent tracking on behalf of others
    const userId = authResult.id;
    const activityType = body.activity_type || body.activityType;

    if (!activityType) {
      return NextResponse.json(
        { error: 'activity_type is required' },
        { status: 400 },
      );
    }

    await trackActivity({
      userId,
      activityType,
      activityDate: body.activity_date || body.activityDate,
      count:
        typeof body.count === 'number' && Number.isFinite(body.count)
          ? body.count
          : 1,
      metadata: body.metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[analytics/track] Failed to record activity', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
