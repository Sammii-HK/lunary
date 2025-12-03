import { NextRequest, NextResponse } from 'next/server';

import { requireUser } from '@/lib/ai/auth';
import { prisma } from '@/lib/prisma';

type InjectMessageRequest = {
  threadId: string;
  message: {
    role: 'assistant';
    content: string;
  };
};

export async function POST(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const body = (await request.json()) as InjectMessageRequest;

    if (!body.threadId || !body.message?.content) {
      return NextResponse.json(
        { error: 'threadId and message are required' },
        { status: 400 },
      );
    }

    const thread = await prisma.aiThread.findUnique({
      where: { id: body.threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (thread.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const existingMessages = Array.isArray(thread.messages)
      ? (thread.messages as Array<{
          role: string;
          content: string;
          ts: string;
        }>)
      : [];

    const newMessage = {
      role: body.message.role,
      content: body.message.content,
      ts: new Date().toISOString(),
    };

    await prisma.aiThread.update({
      where: { id: body.threadId },
      data: {
        messages: [...existingMessages, newMessage],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Inject Message] Error:', error);
    return NextResponse.json(
      { error: 'Failed to inject message' },
      { status: 500 },
    );
  }
}
