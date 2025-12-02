'use client';

import { useState, useEffect, useMemo } from 'react';
import { RitualContext } from '@/lib/rituals/message-pools';
import { getRitualMessageSync, WeeklyInsights } from '@/lib/rituals/engine';

export type RitualType = RitualContext | null;

interface RitualBadgeState {
  hasUnreadMessage: boolean;
  ritualType: RitualType;
  message: string | null;
  messageId: string | null;
}

function getRitualType(isPaid: boolean): RitualContext {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const isSunday = dayOfWeek === 0;

  if (isSunday && isPaid && hour < 14) {
    return 'cosmic_reset';
  }

  return hour < 14 ? 'morning' : 'evening';
}

export function useRitualBadge(
  isPaid: boolean = false,
  userName?: string,
  weeklyInsights?: WeeklyInsights,
): RitualBadgeState {
  const [lastDismissed, setLastDismissed] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lunary_ritual_dismissed');
    if (stored) {
      setLastDismissed(stored);
    }

    const handleDismissed = () => {
      const newStored = localStorage.getItem('lunary_ritual_dismissed');
      setLastDismissed(newStored);
    };

    window.addEventListener('ritual-dismissed', handleDismissed);
    return () =>
      window.removeEventListener('ritual-dismissed', handleDismissed);
  }, []);

  const state = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const ritualType = getRitualType(isPaid);
    const dismissKey = `${today}-${ritualType}`;

    if (lastDismissed === dismissKey) {
      return {
        hasUnreadMessage: false,
        ritualType: null,
        message: null,
        messageId: null,
      };
    }

    const result = getRitualMessageSync({
      context: ritualType,
      isPremium: isPaid,
      userName,
      weeklyInsights,
    });

    return {
      hasUnreadMessage: true,
      ritualType,
      message: result.message,
      messageId: result.id,
    };
  }, [lastDismissed, isPaid, userName, weeklyInsights]);

  return state;
}

export function dismissRitualBadge(isPaid: boolean = false): void {
  const today = new Date().toISOString().split('T')[0];
  const ritualType = getRitualType(isPaid);
  const dismissKey = `${today}-${ritualType}`;
  localStorage.setItem('lunary_ritual_dismissed', dismissKey);
  window.dispatchEvent(new Event('ritual-dismissed'));
}

export async function trackRitualShown(
  messageId: string,
  context: RitualContext,
  userId?: string,
): Promise<void> {
  try {
    await fetch('/api/rituals/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, context, userId, action: 'shown' }),
    });
  } catch (error) {
    console.error('Failed to track ritual shown:', error);
  }
}

export async function trackRitualEngaged(
  messageId: string,
  context: RitualContext,
  userId?: string,
): Promise<void> {
  try {
    await fetch('/api/rituals/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messageId, context, userId, action: 'engaged' }),
    });
  } catch (error) {
    console.error('Failed to track ritual engagement:', error);
  }
}
