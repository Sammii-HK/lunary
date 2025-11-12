import { NextRequest, NextResponse } from 'next/server';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { recordFeedback } from '@/lib/ai/feedback';

type FeedbackRequest = {
  threadId?: string;
  messageId?: string;
  helpful: boolean;
  comment?: string;
  origin?: string;
};

const jsonResponse = (payload: unknown, status = 200) =>
  NextResponse.json(payload, { status });

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = (await request.json()) as FeedbackRequest;

    if (typeof body.helpful !== 'boolean') {
      return jsonResponse({ error: 'helpful flag is required' }, 400);
    }

    await recordFeedback({
      userId: user.id,
      threadId: body.threadId,
      messageId: body.messageId,
      helpful: body.helpful,
      comment: body.comment,
      origin: body.origin,
    });

    return jsonResponse({ ok: true });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return jsonResponse({ error: 'Unauthorised' }, 401);
    }

    console.error('[AI Feedback] Failed to store feedback', error);
    return jsonResponse({ error: 'Failed to submit feedback' }, 500);
  }
}
