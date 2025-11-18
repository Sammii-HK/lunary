'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStatus } from '@/components/AuthStatus';
import type { AIPrompt } from '@/lib/ai/prompt-generator';

export function useAIPrompts() {
  const { user } = useAuthStatus();
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [hasNewPrompts, setHasNewPrompts] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrompts = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ai/prompts?autoGenerate=true', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      const data = await response.json();
      setPrompts(data.prompts || []);
      setHasNewPrompts(data.hasNewPrompts || false);
    } catch (err) {
      console.error('[useAIPrompts] Error fetching prompts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  const markPromptAsRead = useCallback(
    async (promptId: number) => {
      try {
        const response = await fetch('/api/ai/prompts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ promptId }),
        });

        if (!response.ok) {
          throw new Error('Failed to mark prompt as read');
        }

        // Update local state
        setPrompts((prev) =>
          prev.map((p) => (p.id === promptId ? { ...p, readAt: new Date().toISOString(), isNew: false } : p)),
        );
        setHasNewPrompts((prev) => {
          const remainingNew = prompts.filter((p) => p.id !== promptId && p.isNew);
          return remainingNew.length > 0;
        });
      } catch (err) {
        console.error('[useAIPrompts] Error marking prompt as read:', err);
      }
    },
    [prompts],
  );

  useEffect(() => {
    fetchPrompts();
  }, [fetchPrompts]);

  return {
    prompts,
    hasNewPrompts,
    isLoading,
    error,
    refetch: fetchPrompts,
    markPromptAsRead,
  };
}
