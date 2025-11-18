import { NextRequest, NextResponse } from 'next/server';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { appendToThread } from '@/lib/ai/threads';

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = await request.json();
    const { threadId, assistantMessage } = body;

    if (!threadId || !assistantMessage) {
      return NextResponse.json(
        { error: 'threadId and assistantMessage are required' },
        { status: 400 },
      );
    }

    // Extract entity name from content (first line is usually the card/spell name)
    const entityName = assistantMessage.entityName || 'this';

    const { thread } = await appendToThread({
      userId: user.id,
      threadId,
      userMessage: {
        role: 'user',
        content: `Tell me about ${entityName}`,
        ts: new Date().toISOString(),
        tokens: 0,
      },
      assistantMessage: {
        role: 'assistant',
        content: assistantMessage.content,
        ts: assistantMessage.ts || new Date().toISOString(),
        tokens: assistantMessage.tokens || 0,
      },
      titleHint: '',
    });

    return NextResponse.json({ success: true, thread });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    console.error('[AI Thread Append] Failed', error);
    return NextResponse.json(
      { error: 'Failed to append to thread' },
      { status: 500 },
    );
  }
}
