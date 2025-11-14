import { NextRequest, NextResponse } from 'next/server';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { resolvePlanId } from '@/lib/ai/plan-resolver';
import { DAILY_MESSAGE_LIMITS } from '@/lib/ai/plans';
import { loadUsage } from '@/lib/ai/usage';

const jsonResponse = (payload: unknown, status = 200) =>
  NextResponse.json(payload, { status });

export async function GET(request: NextRequest) {
  const now = new Date();

  try {
    const user = await requireUser(request);
    const planId = resolvePlanId(user);
    const usage = await loadUsage({ userId: user.id, planId, now });

    return jsonResponse({
      planId,
      usage: {
        used: usage.usedMessages,
        limit: DAILY_MESSAGE_LIMITS[planId],
        tokensIn: usage.tokensIn,
        tokensOut: usage.tokensOut,
        day: usage.day,
      },
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse({ error: 'Unauthorised' }, 401);
    }

    console.error('[AI Usage] Failed to read usage', error);
    return jsonResponse({ error: 'Failed to fetch usage' }, 500);
  }
}
