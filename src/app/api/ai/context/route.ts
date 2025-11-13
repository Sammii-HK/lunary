import { NextRequest, NextResponse } from 'next/server';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { buildLunaryContext } from '@/lib/ai/context';

const jsonResponse = (payload: unknown, status = 200) =>
  NextResponse.json(payload, { status });

const isDebugEnabled = () => {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  return process.env.AI_CONTEXT_DEBUG === 'true';
};

export async function GET(request: NextRequest) {
  if (!isDebugEnabled()) {
    return jsonResponse({ error: 'Not available in production' }, 403);
  }

  const now = new Date();
  const includeMood = request.nextUrl.searchParams.get('mood') !== 'false';

  try {
    const user = await requireUser(request);
    const { context, dailyHighlight } = await buildLunaryContext({
      userId: user.id,
      tz: user.timezone ?? 'Europe/London',
      locale: user.locale ?? 'en-GB',
      displayName: user.displayName,
      includeMood,
      now,
    });

    return jsonResponse({
      context,
      dailyHighlight,
      generatedAt: now.toISOString(),
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse({ error: 'Unauthorised' }, 401);
    }

    console.error('[AI Context] Failed to assemble context', error);
    return jsonResponse({ error: 'Failed to fetch context snapshot' }, 500);
  }
}
