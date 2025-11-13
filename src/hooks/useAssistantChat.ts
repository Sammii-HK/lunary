'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useAuthStatus } from '@/components/AuthStatus';
import { AI_LIMIT_REACHED_MESSAGE } from '@/lib/ai/plans';

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
  const [error, setError] = useState<string | null>(null);
  const streamingMessageIdRef = useRef<string | null>(null);
  const previousUserIdRef = useRef<string | null>(null);

  const loadThreadHistory = useCallback(
    async (id: string) => {
      try {
        console.log('[AssistantChat] Loading thread history:', id);
        setIsLoadingHistory(true);
        const response = await fetch(`/api/ai/thread?threadId=${id}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const thread = await response.json();
          console.log('[AssistantChat] Thread loaded:', {
            threadId: id,
            messageCount: thread.messages?.length || 0,
          });
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
          console.log(
            '[AssistantChat] Thread not found (404), clearing localStorage',
          );
          const storageKey = getThreadStorageKey(userId);
          if (storageKey && typeof window !== 'undefined') {
            localStorage.removeItem(storageKey);
          }
          setThreadId(null);
        } else {
          console.error(
            '[AssistantChat] Failed to load thread:',
            response.status,
          );
        }
      } catch (error) {
        console.error('[AssistantChat] Failed to load thread history', error);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [userId],
  );

  // Stable reference for loadThreadHistory to prevent useEffect loops
  const loadThreadHistoryRef = useRef(loadThreadHistory);
  useEffect(() => {
    loadThreadHistoryRef.current = loadThreadHistory;
  }, [loadThreadHistory]);

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

    console.log('[AssistantChat] Loading thread on mount:', {
      userId,
      storageKey,
      storedThreadId,
    });

    if (storedThreadId) {
      setThreadId(storedThreadId);
      loadThreadHistoryRef.current(storedThreadId);
    } else {
      setIsLoadingHistory(false);
    }
  }, [userId]); // Removed loadThreadHistory from dependencies to prevent loops

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
          if (response.status === 429) {
            const errorData = await response.json().catch(() => ({}));
            const limitMessage =
              errorData.message || errorData.error || AI_LIMIT_REACHED_MESSAGE;
            throw new Error(limitMessage);
          }
          if (response.status === 503) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(
              errorData.message ||
                'AI service is temporarily unavailable. Please try again in a moment.',
            );
          }
          const errorText = await response.text().catch(() => 'Unknown error');
          let errorMessage = `Failed to stream response: ${response.status}`;
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorJson.error || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
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
                  const newThreadId = payload.threadId;
                  setThreadId(newThreadId);
                  const storageKey = getThreadStorageKey(userId);
                  if (storageKey && typeof window !== 'undefined') {
                    localStorage.setItem(storageKey, newThreadId);
                    console.log(
                      '[AssistantChat] Saved threadId to localStorage:',
                      {
                        threadId: newThreadId,
                        storageKey,
                      },
                    );
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
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to send message. Please try again.';
        setError(errorMessage);
        // Remove the user message if there was an error
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsStreaming(false);
        streamingMessageIdRef.current = null;
      }
    },
    [appendAssistantContent, isStreaming, threadId, userId],
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
      error,
      clearError: () => setError(null),
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
      error,
    ],
  );

  return state;
};
