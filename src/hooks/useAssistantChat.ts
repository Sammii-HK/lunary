'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStatus } from '@/components/AuthStatus';

export type AssistantRole = 'user' | 'assistant';

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  content: string;
};

export type AssistantUsage = {
  used: number;
  limit: number;
  tokensIn: number;
  tokensOut: number;
};

const decoder = new TextDecoder();

const parseSseChunk = (
  chunk: string,
): { event: string; data: string } | null => {
  const lines = chunk.split('\n');
  let event = 'message';
  let data = '';

  lines.forEach((line) => {
    if (line.startsWith('event:')) {
      event = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      data += line.slice(5).trim();
    }
  });

  if (!event) return null;
  return { event, data };
};

const safeJsonParse = <T>(value: string): T | null => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
};

const makeId = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const getThreadStorageKey = (userId: string | null): string | null => {
  if (!userId) return null;
  return `lunary-ai-thread-id-${userId}`;
};

export const useAssistantChat = () => {
  const { user } = useAuthStatus();
  const userId = user?.id || null;
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistSnippet, setAssistSnippet] = useState<string | null>(null);
  const [reflectionPrompt, setReflectionPrompt] = useState<string | null>(null);
  const [usage, setUsage] = useState<AssistantUsage | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [dailyHighlight, setDailyHighlight] = useState<any>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const streamingMessageIdRef = useRef<string | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  const loadThreadHistory = useCallback(
    async (id: string) => {
      try {
        setIsLoadingHistory(true);
        const response = await fetch(`/api/ai/thread?threadId=${id}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const thread = await response.json();
          if (thread.messages && Array.isArray(thread.messages)) {
            const loadedMessages: AssistantMessage[] = thread.messages.map(
              (msg: any, index: number) => ({
                id: `${id}-${index}`,
                role: msg.role,
                content: msg.content,
              }),
            );
            setMessages(loadedMessages);
          }
        } else if (response.status === 404) {
          const storageKey = getThreadStorageKey(userId);
          if (storageKey && typeof window !== 'undefined') {
            localStorage.removeItem(storageKey);
          }
          setThreadId(null);
        }
      } catch (error) {
        console.error('[AssistantChat] Failed to load thread history', error);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    if (!userId) {
      setIsLoadingHistory(false);
      setMessages([]);
      setThreadId(null);
      return;
    }

    const storageKey = getThreadStorageKey(userId);
    if (!storageKey) {
      setIsLoadingHistory(false);
      return;
    }

    const storedThreadId =
      typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (storedThreadId) {
      setThreadId(storedThreadId);
      loadThreadHistory(storedThreadId);
    } else {
      setIsLoadingHistory(false);
    }
  }, [userId, loadThreadHistory]);

  useEffect(() => {
    if (previousUserIdRef.current && previousUserIdRef.current !== userId) {
      const oldStorageKey = getThreadStorageKey(previousUserIdRef.current);
      if (oldStorageKey && typeof window !== 'undefined') {
        localStorage.removeItem(oldStorageKey);
      }
      setMessages([]);
      setThreadId(null);
    }
    previousUserIdRef.current = userId;
  }, [userId]);

  const appendAssistantContent = useCallback((content: string) => {
    if (!streamingMessageIdRef.current) {
      const id = makeId();
      streamingMessageIdRef.current = id;
      setMessages((prev) => [
        ...prev,
        {
          id,
          role: 'assistant',
          content,
        },
      ]);
    } else {
      const targetId = streamingMessageIdRef.current;
      setMessages((prev) =>
        prev.map((message) =>
          message.id === targetId
            ? {
                ...message,
                content:
                  message.content.length > 0
                    ? `${message.content}\n\n${content}`
                    : content,
              }
            : message,
        ),
      );
    }
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) {
        return;
      }

      const userMessage: AssistantMessage = {
        id: makeId(),
        role: 'user',
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      streamingMessageIdRef.current = null;

      try {
        const response = await fetch(
          `/api/ai/chat?stream=1${threadId ? `&threadId=${threadId}` : ''}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'text/event-stream',
            },
            credentials: 'include',
            body: JSON.stringify({
              message: content,
              threadId,
            }),
          },
        );

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('Unauthorized - Please sign in to use the AI chat');
          }
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(
            `Failed to stream response: ${response.status} ${errorText}`,
          );
        }

        if (!response.body) {
          throw new Error('Failed to stream response: No response body');
        }

        const reader = response.body.getReader();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let separatorIndex: number;
          while ((separatorIndex = buffer.indexOf('\n\n')) !== -1) {
            const rawChunk = buffer.slice(0, separatorIndex);
            buffer = buffer.slice(separatorIndex + 2);

            if (!rawChunk.trim()) continue;
            const parsed = parseSseChunk(rawChunk);
            if (!parsed) continue;

            const { event, data } = parsed;

            switch (event) {
              case 'meta': {
                const payload = safeJsonParse<{
                  threadId?: string;
                  usage?: AssistantUsage;
                  planId?: string;
                  dailyHighlight?: any;
                }>(data);

                if (payload?.threadId) {
                  setThreadId(payload.threadId);
                  const storageKey = getThreadStorageKey(userId);
                  if (storageKey && typeof window !== 'undefined') {
                    localStorage.setItem(storageKey, payload.threadId);
                  }
                }
                if (payload?.usage) {
                  setUsage(payload.usage);
                }
                if (payload?.planId) {
                  setPlanId(payload.planId);
                }
                if (payload?.dailyHighlight !== undefined) {
                  setDailyHighlight(payload.dailyHighlight);
                }
                break;
              }
              case 'prompt': {
                // Prompt sections are available for debugging/future use.
                break;
              }
              case 'assist': {
                const assist = safeJsonParse<string | null>(data);
                setAssistSnippet(assist ?? null);
                break;
              }
              case 'reflection': {
                const reflection = safeJsonParse<string>(data);
                if (typeof reflection === 'string') {
                  setReflectionPrompt(reflection);
                }
                break;
              }
              case 'message': {
                const text = safeJsonParse<string>(data);
                if (typeof text === 'string' && text.trim().length > 0) {
                  appendAssistantContent(text);
                }
                break;
              }
              case 'done': {
                streamingMessageIdRef.current = null;
                break;
              }
              default:
                break;
            }
          }
        }
      } catch (error) {
        console.error('[AssistantChat] Streaming error', error);
      } finally {
        setIsStreaming(false);
        streamingMessageIdRef.current = null;
      }
    },
    [appendAssistantContent, isStreaming, threadId],
  );

  const state = useMemo(
    () => ({
      messages,
      sendMessage,
      isStreaming,
      assistSnippet,
      reflectionPrompt,
      usage,
      planId,
      dailyHighlight,
      isLoadingHistory,
      threadId,
    }),
    [
      messages,
      sendMessage,
      isStreaming,
      assistSnippet,
      reflectionPrompt,
      usage,
      planId,
      dailyHighlight,
      isLoadingHistory,
      threadId,
    ],
  );

  return state;
};
