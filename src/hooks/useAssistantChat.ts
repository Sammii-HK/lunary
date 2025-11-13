'use client';

import { useCallback, useMemo, useRef, useState } from 'react';

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

export const useAssistantChat = () => {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [assistSnippet, setAssistSnippet] = useState<string | null>(null);
  const [reflectionPrompt, setReflectionPrompt] = useState<string | null>(null);
  const [usage, setUsage] = useState<AssistantUsage | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [dailyHighlight, setDailyHighlight] = useState<any>(null);
  const streamingMessageIdRef = useRef<string | null>(null);

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
    ],
  );

  return state;
};
