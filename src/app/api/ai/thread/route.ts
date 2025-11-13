import { NextRequest, NextResponse } from 'next/server';

import { requireUser, UnauthorizedError } from '@/lib/ai/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser(request);
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json(
        { error: 'threadId is required' },
        { status: 400 },
      );
    }

    const record = await prisma.aiThread.findUnique({
      where: { id: threadId },
    });

    if (!record) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    if (record.userId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const messages = Array.isArray(record.messages)
      ? (record.messages as any[])
      : [];

    return NextResponse.json({
      id: record.id,
      userId: record.userId,
      title: record.title,
      messages,
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
