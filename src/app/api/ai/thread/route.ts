import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { prisma } from '@/lib/prisma';

const MAX_MESSAGES = 50;

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    let record;

    if (threadId) {
      record = await prisma.aiThread.findUnique({
        where: { id: threadId },
      });

      if (record && record.userId !== user.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    if (!record) {
      record = await prisma.aiThread.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: 'desc' },
      });
    }

    if (!record) {
      const newId = randomUUID();
      record = await prisma.aiThread.create({
        data: {
          id: newId,
          userId: user.id,
          title: 'Book of Shadows',
          messages: [],
        },
      });

      if (process.env.NODE_ENV === 'development') {
        console.log('[AI Thread] Created new thread for user:', user.id);
      }
    }

    const allThreads = await prisma.aiThread.findMany({
      where: { userId: user.id },
      select: { id: true },
    });

    if (allThreads.length > 1) {
      const otherThreadIds = allThreads
        .filter((t) => t.id !== record!.id)
        .map((t) => t.id);

      if (otherThreadIds.length > 0) {
        await prisma.aiThread.deleteMany({
          where: { id: { in: otherThreadIds } },
        });

        if (process.env.NODE_ENV === 'development') {
          console.log(
            '[AI Thread] Consolidated threads for user:',
            user.id,
            '- deleted',
            otherThreadIds.length,
            'old threads',
          );
        }
      }
    }

    const messages = Array.isArray(record.messages)
      ? (record.messages as any[])
      : [];

    return NextResponse.json({
      id: record.id,
      userId: record.userId,
      title: record.title,
      messages: messages.slice(-MAX_MESSAGES),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 });
    }

    console.error('[AI Thread] Failed to load thread', error);
    return NextResponse.json(
      { error: 'Failed to load thread' },
      { status: 500 },
    );
  }
}
