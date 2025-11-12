import { MEMORY_TURN_LIMITS } from './plans';
import { AiPlanId } from './types';
import { ThreadMessage } from './threads';

export type MemorySnippet = {
  summary: string;
  createdAt: string;
};

export type SaveSnippetParams = {
  userId: string;
  snippet: string;
};

export type SaveSnippetResult = {
  ok: boolean;
};

export type SaveSnippetFn = (
  params: SaveSnippetParams,
) => Promise<SaveSnippetResult>;

const defaultSaveSnippet: SaveSnippetFn = async () => {
  console.info('[AI Memory] saveConversationSnippet invoked (stub)');
  return { ok: true };
};

const summariseMessages = (messages: ThreadMessage[]): string => {
  const recentUser = messages
    .filter((message) => message.role === 'user')
    .slice(-2)
    .map((message) => message.content)
    .join(' ');

  const recentAssistant = messages
    .filter((message) => message.role === 'assistant')
    .slice(-2)
    .map((message) => message.content)
    .join(' ');

  const trimmedUser = recentUser.slice(0, 220).trim();
  const trimmedAssistant = recentAssistant.slice(0, 220).trim();

  return [
    trimmedUser ? `You felt: ${trimmedUser}` : null,
    trimmedAssistant ? `Lunary offered: ${trimmedAssistant}` : null,
  ]
    .filter(Boolean)
    .join(' | ');
};

const enforceMemoryLimit = (
  messages: ThreadMessage[],
  memoryTurns: number,
): ThreadMessage[] => {
  if (memoryTurns <= 0) {
    return [];
  }

  const maxMessages = memoryTurns * 2; // user + assistant turns
  return messages.slice(-maxMessages);
};

export const selectMemoryCandidates = (
  allMessages: ThreadMessage[],
  planId: AiPlanId,
): ThreadMessage[] => {
  const limit = MEMORY_TURN_LIMITS[planId] ?? 0;
  return enforceMemoryLimit(allMessages, limit);
};

export const shouldCaptureMemory = (
  planId: AiPlanId,
  usageCount: number,
): boolean => {
  const limit = MEMORY_TURN_LIMITS[planId] ?? 0;
  if (limit <= 0) return false;
  return usageCount % 3 === 0;
};

export const captureMemory = async ({
  userId,
  planId,
  messages,
  usageCount,
  saveSnippet = defaultSaveSnippet,
}: {
  userId: string;
  planId: AiPlanId;
  messages: ThreadMessage[];
  usageCount: number;
  saveSnippet?: SaveSnippetFn;
}): Promise<MemorySnippet | null> => {
  if (!shouldCaptureMemory(planId, usageCount)) {
    return null;
  }

  const candidates = selectMemoryCandidates(messages, planId);
  if (candidates.length === 0) {
    return null;
  }

  const summary = summariseMessages(candidates);
  if (!summary) {
    return null;
  }

  await saveSnippet({ userId, snippet: summary });

  const snippet: MemorySnippet = {
    summary,
    createdAt: new Date().toISOString(),
  };

  console.info('[AI Memory] Captured snippet', snippet);
  return snippet;
};
