import { randomUUID } from 'crypto';

import { prisma } from '@/lib/prisma';

export type ThreadMessage = {
  role: 'user' | 'assistant';
  content: string;
  ts: string;
  tokens?: number;
};

export type ThreadRecord = {
  id: string;
  userId: string;
  title: string | null;
  messages: ThreadMessage[];
};

type AppendThreadParams = {
  userId: string;
  threadId?: string | null;
  userMessage: ThreadMessage;
  assistantMessage: ThreadMessage;
  titleHint?: string;
};

const memoryThreads = new Map<string, ThreadRecord>();

const fetchThreadFromMemory = (threadId: string): ThreadRecord | null =>
  memoryThreads.get(threadId) ?? null;

const persistThreadToMemory = (thread: ThreadRecord): ThreadRecord => {
  memoryThreads.set(thread.id, thread);
  return thread;
};

export const loadThreadFromDatabase = async (
  threadId: string,
): Promise<ThreadRecord | null> => {
  try {
    const record = await prisma.aiThread.findUnique({
      where: { id: threadId },
    });

    if (!record) return null;

    const messages = Array.isArray(record.messages)
      ? (record.messages as ThreadMessage[])
      : [];

    return {
      id: record.id,
      userId: record.userId,
      title: record.title,
      messages,
    };
  } catch (error) {
    console.error('[AI Thread] Failed to load thread from database', error);
    return null;
  }
};

const saveThreadToDatabase = async (thread: ThreadRecord): Promise<void> => {
  try {
    await prisma.aiThread.upsert({
      where: { id: thread.id },
      update: {
        messages: thread.messages,
        title: thread.title ?? null,
      },
      create: {
        id: thread.id,
        userId: thread.userId,
        title: thread.title ?? null,
        messages: thread.messages,
      },
    });
  } catch (error) {
    console.error('[AI Thread] Failed to persist thread', error);
  }
};

const sanitiseTitle = (content: string): string => content.slice(0, 100).trim();

export type AppendThreadResult = {
  thread: ThreadRecord;
  created: boolean;
};

export const appendToThread = async ({
  userId,
  threadId,
  userMessage,
  assistantMessage,
  titleHint,
}: AppendThreadParams): Promise<AppendThreadResult> => {
  let existing: ThreadRecord | null = null;

  if (threadId) {
    existing =
      fetchThreadFromMemory(threadId) ??
      (await loadThreadFromDatabase(threadId));
  }

  const shouldCreate = !existing;
  const id = existing?.id ?? threadId ?? randomUUID();

  const messages = [
    ...(existing?.messages ?? []),
    userMessage,
    assistantMessage,
  ];

  const thread: ThreadRecord = {
    id,
    userId,
    title: existing?.title ?? titleHint ?? sanitiseTitle(userMessage.content),
    messages,
  };

  persistThreadToMemory(thread);
  await saveThreadToDatabase(thread);

  return {
    thread,
    created: shouldCreate,
  };
};

/**
 * Clean up old threads - keep threads updated in the last 7 days
 * This runs periodically to prevent database bloat
 */
export const cleanupOldThreads = async (): Promise<number> => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await prisma.aiThread.deleteMany({
      where: {
        updatedAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    if (result.count > 0) {
      console.log(`[AI Thread] Cleaned up ${result.count} old threads`);
    }

    return result.count;
  } catch (error) {
    console.error('[AI Thread] Failed to cleanup old threads', error);
    return 0;
  }
};

/**
 * Get the most recent thread for a user (fallback if localStorage is lost)
 */
export const getMostRecentThread = async (
  userId: string,
): Promise<ThreadRecord | null> => {
  try {
    const record = await prisma.aiThread.findFirst({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    if (!record) return null;

    const messages = Array.isArray(record.messages)
      ? (record.messages as ThreadMessage[])
      : [];

    return {
      id: record.id,
      userId: record.userId,
      title: record.title,
      messages,
    };
  } catch (error) {
    console.error('[AI Thread] Failed to get most recent thread', error);
    return null;
  }
};
