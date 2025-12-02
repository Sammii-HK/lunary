'use client';

import { useState, useEffect, useMemo } from 'react';

export type RitualType = 'morning' | 'evening' | 'cosmic_reset' | null;

interface RitualBadgeState {
  hasUnreadMessage: boolean;
  ritualType: RitualType;
  message: string | null;
}

function getRitualType(isPaid: boolean): RitualType {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const isSunday = dayOfWeek === 0;

  if (isSunday && isPaid && hour < 14) {
    return 'cosmic_reset';
  }

  return hour < 14 ? 'morning' : 'evening';
}

const MORNING_MESSAGES = [
  'Good morning. The sky has shifted while you slept. Take a breath before the day unfolds.',
  'A new day rises. What intention will you carry with you?',
  'The morning light is patient. So is your path.',
  'Before the world asks for your attention, what does your soul need to know?',
  'The dawn holds quiet wisdom. What would you like to explore today?',
];

const EVENING_MESSAGES = [
  'The day softens. A moment to pause and reflect before rest.',
  'Evening arrives. What did today teach you?',
  'As the sky darkens, your inner light remains. What needs releasing?',
  'The night invites stillness. What thoughts need tending before sleep?',
  'Day turns to night. What will you carry forward, and what will you leave behind?',
];

const COSMIC_RESET_MESSAGES = [
  'The week closes. Take a moment to reflect on what moved through you. What will you carry forward, and what will you release?',
  'Sunday arrives. The cosmic wheel has turned. What did this week teach you about yourself?',
  'A pause before the new week begins. What patterns emerged? What fell away? What remains?',
  'The week behind you held lessons. The week ahead holds possibility. Where do you stand now?',
  'Time to reset. Honour what was, release what no longer serves, and set your intention for what comes next.',
];

function getRitualMessage(type: RitualType): string | null {
  if (!type) return null;

  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
      86400000,
  );

  if (type === 'cosmic_reset') {
    return COSMIC_RESET_MESSAGES[dayOfYear % COSMIC_RESET_MESSAGES.length];
  }

  const messages = type === 'morning' ? MORNING_MESSAGES : EVENING_MESSAGES;
  return messages[dayOfYear % messages.length];
}

export function useRitualBadge(isPaid: boolean = false): RitualBadgeState {
  const [lastDismissed, setLastDismissed] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('lunary_ritual_dismissed');
    if (stored) {
      setLastDismissed(stored);
    }
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
      };
    }

    return {
      hasUnreadMessage: true,
      ritualType,
      message: getRitualMessage(ritualType),
    };
  }, [lastDismissed, isPaid]);

  return state;
}

export function dismissRitualBadge(isPaid: boolean = false): void {
  const today = new Date().toISOString().split('T')[0];
  const ritualType = getRitualType(isPaid);
  const dismissKey = `${today}-${ritualType}`;
  localStorage.setItem('lunary_ritual_dismissed', dismissKey);
  window.dispatchEvent(new Event('ritual-dismissed'));
}
