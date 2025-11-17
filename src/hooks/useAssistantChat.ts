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
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const pendingUpdatesRef = useRef<Array<{ text: string; timestamp: number }>>(
    [],
  );
  const THROTTLE_MS = 100; // Throttle updates to reduce costs

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
        console.error('[AssistantChat] Failed to load thread history', error);
        setMessages([]);
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
      setMessages([]);
      return;
    }

    const storedThreadId =
      typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;

    if (process.env.NODE_ENV === 'development') {
      console.log('[AssistantChat] Loading thread:', {
        userId,
        storageKey,
        storedThreadId,
      });
    }

    if (storedThreadId) {
      setThreadId(storedThreadId);
      loadThreadHistory(storedThreadId).catch((error) => {
        console.error('[AssistantChat] Error loading thread:', error);
        setIsLoadingHistory(false);
        setMessages([]);
      });
    } else {
      if (process.env.NODE_ENV === 'development') {
        console.log(
          '[AssistantChat] No stored thread ID found - checking for recent thread',
        );
      }
      // Try to find most recent thread as fallback
      (async () => {
        try {
          const { getMostRecentThread } = await import('@/lib/ai/threads');
          const recentThread = await getMostRecentThread(userId);
          if (recentThread) {
            if (process.env.NODE_ENV === 'development') {
              console.log(
                '[AssistantChat] Found recent thread:',
                recentThread.id,
                'with',
                recentThread.messages.length,
                'messages',
              );
            }
            setThreadId(recentThread.id);
            const storageKey = getThreadStorageKey(userId);
            if (storageKey && typeof window !== 'undefined') {
              localStorage.setItem(storageKey, recentThread.id);
            }
            const loadedMessages: AssistantMessage[] =
              recentThread.messages.map((msg: any, index: number) => ({
                id: `${recentThread.id}-${index}`,
                role: msg.role,
                content: msg.content,
              }));
            setMessages(loadedMessages);
          }
        } catch (error) {
          console.error('[AssistantChat] Failed to find recent thread:', error);
        } finally {
          setIsLoadingHistory(false);
        }
      })();
    }
  }, [userId, loadThreadHistory]);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setIsStreaming(false);
      streamingMessageIdRef.current = null;
    }
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
                  const now = Date.now();
                  const isFirstChunk = !streamingMessageIdRef.current;
                  // Always show first chunk immediately, throttle subsequent chunks
                  const shouldUpdate =
                    isFirstChunk || now - lastUpdateRef.current >= THROTTLE_MS;

                  if (shouldUpdate) {
                    // Update immediately - ensure new array reference
                    setMessages((prev) => {
                      if (!streamingMessageIdRef.current) {
                        const id = makeId();
                        streamingMessageIdRef.current = id;
                        const newMessages = [
                          ...prev,
                          { id, role: 'assistant' as const, content: text },
                        ];
                        return newMessages;
                      } else {
                        const targetId = streamingMessageIdRef.current;
                        // Always return a new array to ensure React detects the change
                        return prev.map((msg) =>
                          msg.id === targetId
                            ? {
                                ...msg,
                                content:
                                  msg.content.length > 0
                                    ? `${msg.content}\n\n${text}`
                                    : text,
                              }
                            : msg,
                        );
                      }
                    });
                    lastUpdateRef.current = now;
                    // Clear any pending updates since we just updated
                    pendingUpdatesRef.current = [];
                  } else {
                    // Queue throttled update
                    pendingUpdatesRef.current.push({ text, timestamp: now });
                    const targetId = streamingMessageIdRef.current;
                    const delay = Math.max(
                      10,
                      THROTTLE_MS - (now - lastUpdateRef.current),
                    );
                    setTimeout(() => {
                      if (
                        !abortController.signal.aborted &&
                        streamingMessageIdRef.current === targetId &&
                        pendingUpdatesRef.current.length > 0
                      ) {
                        // Apply all pending updates
                        const updates = pendingUpdatesRef.current;
                        pendingUpdatesRef.current = [];
                        setMessages((prev) => {
                          const updated = prev.map((msg) =>
                            msg.id === targetId
                              ? {
                                  ...msg,
                                  content:
                                    msg.content +
                                    '\n\n' +
                                    updates.map((u) => u.text).join('\n\n'),
                                }
                              : msg,
                          );
                          // Ensure new array reference
                          return [...updated];
                        });
                        lastUpdateRef.current = Date.now();
                      }
                    }, delay);
                  }
                }
                break;
              }
              case 'done': {
                // Flush all pending updates immediately when stream ends
                const targetId = streamingMessageIdRef.current;
                if (targetId && pendingUpdatesRef.current.length > 0) {
                  const updates = pendingUpdatesRef.current;
                  pendingUpdatesRef.current = [];
                  setMessages((prev) => {
                    const updated = prev.map((msg) =>
                      msg.id === targetId
                        ? {
                            ...msg,
                            content:
                              msg.content +
                              '\n\n' +
                              updates.map((u) => u.text).join('\n\n'),
                          }
                        : msg,
                    );
                    // Ensure new array reference to trigger re-render
                    return [...updated];
                  });
                }
                // Clear streaming state
                streamingMessageIdRef.current = null;
                lastUpdateRef.current = 0;
                pendingUpdatesRef.current = [];
                setIsStreaming(false);
                // Don't reload - we already have all messages in state from streaming
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
    [isStreaming, threadId, userId, loadThreadHistory],
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
