import { NextRequest, NextResponse } from 'next/server';

import { requireAdminAuth } from '@/lib/admin-auth';
import { loadThreadFromDatabase } from '@/lib/ai/threads';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const authResult = await requireAdminAuth(request);
  if (authResult instanceof NextResponse) return authResult;

  const { threadId } = await params;

  try {
    const thread = await loadThreadFromDatabase(threadId);

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: thread.id,
      userId: thread.userId,
      title: thread.title,
      messages: thread.messages,
      messageCount: thread.messages.length,
    });
  } catch (error) {
    console.error('[admin/astral-guide/threads/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to load thread' },
      { status: 500 },
    );
  }
}
