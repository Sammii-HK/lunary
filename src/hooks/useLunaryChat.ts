'use client';

import { useChat } from '@ai-sdk/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthStatus } from '@/components/AuthStatus';

export type LunaryChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

export type LunaryUsage = {
  used: number;
  limit: number;
  tokensIn: number;
  tokensOut: number;
};

type LunaryMetadata = {
  type?: string;
  threadId?: string;
  usage?: LunaryUsage;
  planId?: string;
  dailyHighlight?: unknown;
  assistSnippet?: string | null;
  reflection?: string;
};

const getThreadStorageKey = (userId: string | null): string | null => {
  if (!userId) return null;
  return `lunary-ai-thread-id-${userId}`;
};

export const useLunaryChat = () => {
  const { user, loading: authLoading } = useAuthStatus();
  const userId = user?.id || null;
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistSnippet, setAssistSnippet] = useState<string | null>(null);
  const [reflectionPrompt, setReflectionPrompt] = useState<string | null>(null);
  const [usage, setUsage] = useState<LunaryUsage | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [dailyHighlight, setDailyHighlight] = useState<unknown>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const initializedRef = useRef(false);

  const storageKey = useMemo(() => getThreadStorageKey(userId), [userId]);
  const storedThreadId = useMemo(() => {
    if (!storageKey || typeof window === 'undefined') return null;
    return localStorage.getItem(storageKey);
  }, [storageKey]);

  const handleMetadata = useCallback(
    (data: LunaryMetadata) => {
      if (data.threadId) {
        setThreadId(data.threadId);
        if (storageKey && typeof window !== 'undefined') {
          localStorage.setItem(storageKey, data.threadId);
        }
      }
      if (data.usage) setUsage(data.usage);
      if (data.planId) setPlanId(data.planId);
      if (data.dailyHighlight !== undefined)
        setDailyHighlight(data.dailyHighlight);
      if (data.assistSnippet !== undefined)
        setAssistSnippet(data.assistSnippet);
      if (data.reflection) setReflectionPrompt(data.reflection);
    },
    [storageKey],
  );

  const {
    messages: chatMessages,
    setMessages: setChatMessages,
    append,
    isLoading,
    stop: chatStop,
    error,
    data,
    status,
  } = useChat({
    api: '/api/ai/chat',
    id: threadId || undefined,
    headers: {
      'x-use-ai-sdk': '1',
    },
    body: {
      threadId,
    },
    onFinish: (message) => {
      console.log('[LunaryChat] Stream finished:', message);
    },
    onError: (err) => {
      console.error('[LunaryChat] Stream error:', err);
    },
    onResponse: (response) => {
      console.log(
        '[LunaryChat] Got response:',
        response.status,
        response.statusText,
      );
    },
  });

  // Debug: log status changes
  useEffect(() => {
    console.log('[LunaryChat] Status:', {
      status,
      isLoading,
      error: error?.message,
    });
  }, [status, isLoading, error]);

  // Process data parts for metadata (handles both v5 and v6 SDK formats)
  useEffect(() => {
    if (data && Array.isArray(data)) {
      data.forEach((item: unknown) => {
        const dataItem = item as LunaryMetadata & { data?: LunaryMetadata };
        // v6 format: { type: 'data-metadata', data: { type: 'metadata', ... } }
        if (dataItem?.type === 'data-metadata' && dataItem.data) {
          handleMetadata(dataItem.data);
        }
        // v5 format: { type: 'metadata', ... }
        else if (dataItem?.type === 'metadata') {
          handleMetadata(dataItem);
        }
      });
    }
  }, [data, handleMetadata]);

  useEffect(() => {
    if (authLoading || initializedRef.current) return;

    if (!userId) {
      setIsLoadingHistory(false);
      return;
    }

    // Skip loading history - start fresh each session to avoid memory issues
    // Thread will be created on first message
    setIsLoadingHistory(false);
    initializedRef.current = true;
  }, [userId, authLoading]);

  const messages: LunaryChatMessage[] = useMemo(() => {
    return chatMessages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));
  }, [chatMessages]);

  const sendMessage = useCallback(
    async (content: string) => {
      console.log('[LunaryChat] sendMessage called:', { content, isLoading });
      if (!content.trim() || isLoading) {
        console.log('[LunaryChat] sendMessage blocked:', {
          empty: !content.trim(),
          isLoading,
        });
        return;
      }
      console.log('[LunaryChat] Calling append...');
      try {
        await append({ role: 'user', content });
        console.log('[LunaryChat] append completed');
      } catch (err) {
        console.error('[LunaryChat] append error:', err);
      }
    },
    [append, isLoading],
  );

  const addMessage = useCallback(
    (message: LunaryChatMessage) => {
      setChatMessages((prev) => [
        ...prev,
        { id: message.id, role: message.role, content: message.content },
      ]);
    },
    [setChatMessages],
  );

  return {
    messages,
    sendMessage,
    isStreaming: isLoading,
    stop: chatStop,
    assistSnippet,
    reflectionPrompt,
    usage,
    planId,
    dailyHighlight,
    isLoadingHistory,
    threadId,
    error: error?.message || null,
    clearError: () => {},
    addMessage,
  };
};
