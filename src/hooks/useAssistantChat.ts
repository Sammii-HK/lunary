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

export const useAssistantChat = (options?: { birthday?: string }) => {
  const { user, loading: authLoading } = useAuthStatus();
  const birthday = options?.birthday;
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
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadThreadHistory = useCallback(
    async (id: string) => {
      try {
        // Don't set loading to true here - it's already set by initial state
        // and re-setting it during HMR can cause issues
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(`/api/ai/thread?threadId=${id}`, {
          credentials: 'include',
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

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
            if (process.env.NODE_ENV === 'development') {
              console.log(
                '[AssistantChat] Loaded thread:',
                id,
                'with',
                loadedMessages.length,
                'messages',
              );
            }
            setMessages(loadedMessages);
          } else {
            // Invalid thread data
            if (process.env.NODE_ENV === 'development') {
              console.warn(
                '[AssistantChat] Thread has invalid messages array:',
                thread,
              );
            }
            setMessages([]);
          }
        } else if (response.status === 401) {
          // Auth not ready yet or session expired - don't clear localStorage
          // Just show empty state, user can still send messages which will create new thread
          if (process.env.NODE_ENV === 'development') {
            console.log(
              '[AssistantChat] Thread load unauthorized - auth may not be ready yet',
            );
          }
          setMessages([]);
        } else if (response.status === 404) {
          if (process.env.NODE_ENV === 'development') {
            console.log('[AssistantChat] Thread not found in database:', id);
            console.log(
              '[AssistantChat] This thread may have been deleted. Clearing localStorage.',
            );
          }
          // Thread was deleted from database - clear localStorage
          const storageKey = getThreadStorageKey(userId);
          if (storageKey && typeof window !== 'undefined') {
            localStorage.removeItem(storageKey);
          }
          setThreadId(null);
          setMessages([]);
        } else {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.error(
            '[AssistantChat] Failed to load thread:',
            response.status,
            errorText,
          );
          setMessages([]);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.warn('[AssistantChat] Thread load timed out after 10s');
        } else {
          console.error('[AssistantChat] Failed to load thread history', error);
        }
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    },
    [userId],
  );

  useEffect(() => {
    // Wait for auth to finish loading before attempting to load thread
    if (authLoading) {
      return;
    }

    if (!userId) {
      setIsLoadingHistory(false);
      setMessages([]);
      setThreadId(null);
      return;
    }

    const storageKey = getThreadStorageKey(userId);
    if (!storageKey) {
      setIsLoadingHistory(false);
      setMessages([]);
      return;
    }

    const storedThreadId =
      typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    console.log('[AssistantChat] Init thread:', { storedThreadId });

    if (storedThreadId) {
      setThreadId(storedThreadId);
      loadThreadHistory(storedThreadId);
    } else {
      setIsLoadingHistory(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, authLoading]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsStreaming(false);
    streamingMessageIdRef.current = null;
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) {
        return;
      }

      // Abort any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      const userMessage: AssistantMessage = {
        id: makeId(),
        role: 'user',
        content,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsStreaming(true);
      streamingMessageIdRef.current = null;

      const abortController = new AbortController();
      abortControllerRef.current = abortController;

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
            signal: abortController.signal,
            body: JSON.stringify({
              message: content,
              threadId,
              birthday,
            }),
          },
        );

        if (!response.ok) {
          if (abortController.signal.aborted) {
            return;
          }
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
          if (abortController.signal.aborted) {
            reader.cancel();
            break;
          }
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
                    if (process.env.NODE_ENV === 'development') {
                      console.log(
                        '[AssistantChat] Saved thread ID to localStorage:',
                        newThreadId,
                      );
                    }
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
                  if (!streamingMessageIdRef.current) {
                    const id = makeId();
                    streamingMessageIdRef.current = id;
                    setMessages((prev) => [
                      ...prev,
                      { id, role: 'assistant' as const, content: text },
                    ]);
                  } else {
                    const targetId = streamingMessageIdRef.current;
                    setMessages((prev) =>
                      prev.map((msg) =>
                        msg.id === targetId
                          ? { ...msg, content: msg.content + '\n\n' + text }
                          : msg,
                      ),
                    );
                  }
                }
                break;
              }
              case 'done': {
                streamingMessageIdRef.current = null;
                setIsStreaming(false);
                break;
              }
            }
          }
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        console.error('[AssistantChat] Streaming error', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to send message. Please try again.';
        setError(errorMessage);
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setIsStreaming(false);
        abortControllerRef.current = null;
      }
    },
    [isStreaming, threadId, userId],
  );

  const addMessage = useCallback((message: AssistantMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  return {
    messages,
    sendMessage,
    isStreaming,
    stop,
    assistSnippet,
    reflectionPrompt,
    usage,
    planId,
    dailyHighlight,
    isLoadingHistory,
    threadId,
    error,
    clearError: () => setError(null),
    addMessage,
  };
};
