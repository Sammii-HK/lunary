import dayjs from 'dayjs';

import { prisma } from '@/lib/prisma';

import {
  AI_LIMIT_REACHED_MESSAGE,
  DAILY_MESSAGE_LIMITS,
  PlanUsageSnapshot,
} from './plans';
import { AiPlanId } from './types';

const memoryUsage = new Map<string, PlanUsageSnapshot>();

type UsageContext = {
  userId: string;
  planId: AiPlanId;
  now?: Date;
};

const serialiseDay = (date: Date): string => dayjs(date).format('YYYY-MM-DD');

const isSameDay = (a: Date, b: Date): boolean => dayjs(a).isSame(b, 'day');

const upsertInMemoryUsage = (
  key: string,
  snapshot: PlanUsageSnapshot,
): PlanUsageSnapshot => {
  memoryUsage.set(key, snapshot);
  return snapshot;
};

const makeMemoryKey = (userId: string, day: string) => `${userId}:${day}`;

const loadUsageFromMemory = (
  userId: string,
  day: string,
): PlanUsageSnapshot | null => {
  const stored = memoryUsage.get(makeMemoryKey(userId, day));
  return stored ?? null;
};

const saveUsageToMemory = (snapshot: PlanUsageSnapshot): PlanUsageSnapshot => {
  return upsertInMemoryUsage(
    makeMemoryKey(snapshot.userId, snapshot.day),
    snapshot,
  );
};

const initialUsageSnapshot = (
  userId: string,
  planId: AiPlanId,
  now: Date,
): PlanUsageSnapshot => ({
  userId,
  planId,
  day: serialiseDay(now),
  usedMessages: 0,
  tokensIn: 0,
  tokensOut: 0,
});

export const loadUsage = async ({
  userId,
  planId,
  now = new Date(),
}: UsageContext): Promise<PlanUsageSnapshot> => {
  const todayKey = serialiseDay(now);

  // In development, allow unlimited usage for testing
  if (process.env.NODE_ENV === 'development') {
    const memory = loadUsageFromMemory(userId, todayKey);
    if (memory) {
      // Reset usage count in dev but keep the snapshot structure
      return {
        ...memory,
        usedMessages: 0,
      };
    }
    return saveUsageToMemory(initialUsageSnapshot(userId, planId, now));
  }

  const memory = loadUsageFromMemory(userId, todayKey);
  if (memory) {
    return memory;
  }

  try {
    const record = await prisma.aiUsage.findUnique({
      where: { userId },
    });

    if (!record) {
      return saveUsageToMemory(initialUsageSnapshot(userId, planId, now));
    }

    if (!isSameDay(record.day, now)) {
      return saveUsageToMemory({
        userId,
        planId,
        day: todayKey,
        usedMessages: 0,
        tokensIn: 0,
        tokensOut: 0,
      });
    }

    const snapshot: PlanUsageSnapshot = {
      userId,
      planId,
      day: todayKey,
      usedMessages: record.count,
      tokensIn: record.tokensIn,
      tokensOut: record.tokensOut,
    };

    return saveUsageToMemory(snapshot);
  } catch (error) {
    console.error('[AI Usage] Falling back to memory store', error);
    return saveUsageToMemory(initialUsageSnapshot(userId, planId, now));
  }
};

export type UsageIncrement = {
  userId: string;
  planId: AiPlanId;
  tokensIn: number;
  tokensOut: number;
  messageDelta?: number;
  now?: Date;
};

export type UsageResult = {
  usage: PlanUsageSnapshot;
  dailyLimit: number;
  limitExceeded: boolean;
  message: string | null;
};

const persistUsage = async (snapshot: PlanUsageSnapshot): Promise<void> => {
  const { userId, usedMessages, tokensIn, tokensOut, planId, day } = snapshot;

  try {
    await prisma.aiUsage.upsert({
      where: { userId },
      update: {
        count: usedMessages,
        tokensIn,
        tokensOut,
        day: new Date(day),
        plan: planId,
        renewedAt: new Date(),
      },
      create: {
        userId,
        count: usedMessages,
        tokensIn,
        tokensOut,
        day: new Date(day),
        plan: planId,
        renewedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('[AI Usage] Failed to persist usage', error);
  }
};

export const updateUsage = async ({
  userId,
  planId,
  tokensIn,
  tokensOut,
  messageDelta = 1,
  now = new Date(),
}: UsageIncrement): Promise<UsageResult> => {
  const current = await loadUsage({ userId, planId, now });
  const limit = DAILY_MESSAGE_LIMITS[planId];

  // In development, bypass usage limits
  if (process.env.NODE_ENV === 'development') {
    const updated: PlanUsageSnapshot = {
      ...current,
      usedMessages: current.usedMessages + messageDelta,
      tokensIn: current.tokensIn + tokensIn,
      tokensOut: current.tokensOut + tokensOut,
    };

    saveUsageToMemory(updated);
    // Still persist to database for testing, but don't enforce limits
    await persistUsage(updated).catch(() => {
      // Ignore persistence errors in dev
    });

    return {
      usage: updated,
      dailyLimit: limit,
      limitExceeded: false,
      message: null,
    };
  }

  if (current.usedMessages + messageDelta > limit) {
    return {
      usage: current,
      dailyLimit: limit,
      limitExceeded: true,
      message: AI_LIMIT_REACHED_MESSAGE,
    };
  }

  const updated: PlanUsageSnapshot = {
    ...current,
    usedMessages: current.usedMessages + messageDelta,
    tokensIn: current.tokensIn + tokensIn,
    tokensOut: current.tokensOut + tokensOut,
  };

  saveUsageToMemory(updated);
  await persistUsage(updated);

  return {
    usage: updated,
    dailyLimit: limit,
    limitExceeded: false,
    message: null,
  };
};
