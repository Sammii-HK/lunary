import { randomUUID } from 'crypto';

import { prisma } from '@/lib/prisma';

import { AiMessageRole } from './types';

export type ThreadMessage = {
  role: AiMessageRole;
  content: string;
  ts: string;
  tokens: number;
};

export type ThreadRecord = {
  id: string;
  userId: string;
  title?: string | null;
  messages: ThreadMessage[];
};

const memoryThreads = new Map<string, ThreadRecord>();

const fetchThreadFromMemory = (threadId: string): ThreadRecord | undefined =>
  memoryThreads.get(threadId);

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

const sanitiseTitle = (content: string): string => {
  return content.slice(0, 80).replace(/\s+/g, ' ').trim();
};

export type AppendThreadParams = {
  userId: string;
  threadId?: string | null;
  userMessage: ThreadMessage;
  assistantMessage: ThreadMessage;
  titleHint?: string;
};

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
