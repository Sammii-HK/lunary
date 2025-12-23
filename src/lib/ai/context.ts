import {
  BirthChartSnapshot,
  ConversationMessageMeta,
  DailyHighlight,
  LunaryContext,
  MoodHistory,
  MoonSnapshot,
  TarotCard,
  TarotReading,
  TarotReadingWithInsights,
  TransitRecord,
  AiPlanId,
} from './types';
import {
  CurrentTransitsResponse,
  ConversationHistoryResponse,
  getBirthChart as defaultGetBirthChart,
  getConversationHistory as defaultGetConversationHistory,
  getCurrentTransits as defaultGetCurrentTransits,
  getDailyHighlight as defaultGetDailyHighlight,
  getMoodHistory as defaultGetMoodHistory,
  getTarotLastReading as defaultGetTarotLastReading,
  getTarotPatternAnalysis as defaultGetTarotPatternAnalysis,
  getTarotRecentReadings as defaultGetTarotRecentReadings,
} from './providers';
import { getCachedSnapshot, saveSnapshot } from '../cosmic-snapshot/cache';

export type LunaryContextDependencies = {
  getBirthChart: (params: {
    userId: string;
  }) => Promise<BirthChartSnapshot | null>;
  getCurrentTransits: (params: {
    userId: string;
    now?: Date;
  }) => Promise<CurrentTransitsResponse>;
  getTarotLastReading: (params: {
    userId: string;
    now?: Date;
  }) => Promise<TarotReading | null>;
  getTarotRecentReadings: (params: {
    userId: string;
    limit?: number;
    now?: Date;
    dailyPullsOnly?: boolean;
  }) => Promise<TarotReadingWithInsights[]>;
  getTarotPatternAnalysis: (params: {
    userId: string;
    userName?: string;
    userBirthday?: string;
    now?: Date;
    timeZone?: string;
  }) => Promise<{
    daily: TarotCard | null;
    weekly: TarotCard | null;
    recentDailyCards: Array<{ date: string; day: string; card: TarotCard }>;
    trends: {
      dominantThemes: string[];
      frequentCards: Array<{ name: string; count: number }>;
      patternInsights: string[];
    };
  } | null>;
  getDailyHighlight: (params: {
    userId: string;
    now?: Date;
  }) => Promise<DailyHighlight | null>;
  getMoodHistory: (params: {
    userId: string;
    now?: Date;
  }) => Promise<MoodHistory | null>;
  getConversationHistory: (params: {
    userId: string;
    limit?: number;
    now?: Date;
  }) => Promise<ConversationHistoryResponse>;
};

const defaultDependencies: LunaryContextDependencies = {
  getBirthChart: defaultGetBirthChart,
  getCurrentTransits: defaultGetCurrentTransits,
  getTarotLastReading: defaultGetTarotLastReading,
  getTarotRecentReadings: defaultGetTarotRecentReadings,
  getTarotPatternAnalysis: defaultGetTarotPatternAnalysis,
  getDailyHighlight: defaultGetDailyHighlight,
  getMoodHistory: defaultGetMoodHistory,
  getConversationHistory: defaultGetConversationHistory,
};

export type BuildLunaryContextParams = {
  userId: string;
  tz: string;
  locale: string;
  displayName?: string;
  userBirthday?: string;
  historyLimit?: number;
  includeMood?: boolean;
  planId?: AiPlanId;
  deps?: Partial<LunaryContextDependencies>;
  now?: Date;
};

export type BuildLunaryContextResult = {
  context: LunaryContext;
  dailyHighlight: DailyHighlight | null;
};

const mergeDeps = (
  overrides?: Partial<LunaryContextDependencies>,
): LunaryContextDependencies => {
  if (!overrides) {
    return defaultDependencies;
  }

  return {
    ...defaultDependencies,
    ...overrides,
  };
};

const emptyHistory: ConversationMessageMeta[] = [];

export const buildLunaryContext = async ({
  userId,
  tz,
  locale,
  displayName,
  userBirthday,
  historyLimit = 10,
  includeMood = true,
  planId,
  deps: dependencyOverrides,
  now = new Date(),
  useCache = true,
}: BuildLunaryContextParams & {
  useCache?: boolean;
}): Promise<BuildLunaryContextResult> => {
  // NOTE: We do NOT cache tarot data - always fetch fresh from database

  if (useCache) {
    try {
      const cachedSnapshot = await getCachedSnapshot(userId, now);
      if (cachedSnapshot) {
        const dailyHighlight = dependencyOverrides?.getDailyHighlight
          ? await dependencyOverrides
              .getDailyHighlight({ userId, now })
              .catch(() => null)
          : await defaultGetDailyHighlight({ userId, now }).catch(() => null);

        return {
          context: cachedSnapshot,
          dailyHighlight,
        };
      }
    } catch (error) {
      console.error(
        '[LunaryContext] Cache check failed, building fresh:',
        error,
      );
    }
  }

  // Even if useCache is false, try to get cached tarot data to reuse
  // NEVER use cached tarot data - always fetch fresh from database
  // The cache had old generated/fake data that was causing wrong results

  const deps = mergeDeps(dependencyOverrides);

  // Fetch recent readings for pattern analysis (all paying users including trials)
  // Trial is a status, not a plan - trials are on specific plans (lunary_plus, lunary_plus_ai, lunary_plus_ai_annual)
  const hasPaidAccess =
    planId === 'lunary_plus' ||
    planId === 'lunary_plus_ai' ||
    planId === 'lunary_plus_ai_annual';
  const recentReadingsLimit = hasPaidAccess ? 10 : 0;

  const [
    birthChart,
    currentTransits,
    tarotReading,
    tarotRecentReadings,
    tarotPatternAnalysis,
    dailyHighlight,
    mood,
    history,
  ] = await Promise.all([
    deps.getBirthChart({ userId }).catch((error) => {
      console.error('[LunaryContext] Failed to fetch birth chart', error);
      return null;
    }),
    deps.getCurrentTransits({ userId, now }).catch((error) => {
      console.error('[LunaryContext] Failed to fetch transits', error);
      return {
        transits: [] as TransitRecord[],
        moon: null as MoonSnapshot | null,
      };
    }),
    deps.getTarotLastReading({ userId, now }).catch((error) => {
      console.error('[LunaryContext] Failed to fetch tarot reading', error);
      return null;
    }),
    recentReadingsLimit > 0
      ? deps
          .getTarotRecentReadings({
            userId,
            limit: recentReadingsLimit,
            now,
            dailyPullsOnly: true,
          })
          .catch((error) => {
            console.error(
              '[LunaryContext] Failed to fetch recent tarot readings',
              error,
            );
            return [];
          })
      : Promise.resolve([]),
    // ALWAYS fetch fresh tarot data from database - never use cache
    deps
      .getTarotPatternAnalysis({
        userId,
        userName: displayName,
        userBirthday,
        timeZone: tz,
        now,
      })
      .catch((error) => {
        console.error(
          '[LunaryContext] Failed to fetch tarot pattern analysis:',
          error,
        );
        return null;
      }),
    deps.getDailyHighlight({ userId, now }).catch((error) => {
      console.error('[LunaryContext] Failed to fetch daily highlight', error);
      return null;
    }),
    includeMood
      ? deps.getMoodHistory({ userId, now }).catch((error) => {
          console.error('[LunaryContext] Failed to fetch mood history', error);
          return null;
        })
      : Promise.resolve(null),
    historyLimit > 0
      ? deps
          .getConversationHistory({ userId, limit: historyLimit, now })
          .catch((error) => {
            console.error(
              '[LunaryContext] Failed to fetch conversation history',
              error,
            );
            return { lastMessages: emptyHistory };
          })
      : Promise.resolve({ lastMessages: emptyHistory }),
  ]);

  // Use pattern analysis from database - no generated fallback cards
  const finalTarotPatternAnalysis = tarotPatternAnalysis;

  const context: LunaryContext = {
    user: {
      id: userId,
      tz,
      locale,
      displayName,
    },
    birthChart,
    currentTransits: currentTransits?.transits ?? [],
    moon: currentTransits?.moon ?? null,
    tarot: {
      lastReading: tarotReading ?? undefined,
      recentReadings:
        tarotRecentReadings.length > 0 ? tarotRecentReadings : undefined,
      daily: finalTarotPatternAnalysis?.daily ?? undefined,
      weekly: finalTarotPatternAnalysis?.weekly ?? undefined,
      recentDailyCards:
        finalTarotPatternAnalysis?.recentDailyCards ?? undefined,
      patternAnalysis: finalTarotPatternAnalysis?.trends ?? undefined,
    },
    history: {
      lastMessages:
        historyLimit > 0
          ? (history?.lastMessages?.slice(0, historyLimit) ?? emptyHistory)
          : emptyHistory,
    },
  };

  if (mood) {
    context.mood = mood;
  }

  if (useCache) {
    try {
      await saveSnapshot(userId, now, context);
    } catch (error) {
      console.error('[LunaryContext] Failed to save snapshot:', error);
    }
  }

  return {
    context,
    dailyHighlight: dailyHighlight ?? null,
  };
};

export type ContextStream = AsyncGenerator<LunaryContext, void, unknown>;

export const streamLunaryContext = async function* ({
  userId,
  tz,
  locale,
  displayName,
  deps: dependencyOverrides,
  now = new Date(),
}: {
  userId: string;
  tz: string;
  locale: string;
  displayName?: string;
  deps?: Partial<LunaryContextDependencies>;
  now?: Date;
}): ContextStream {
  const deps = mergeDeps(dependencyOverrides);

  const baseContext: LunaryContext = {
    user: {
      id: userId,
      tz,
      locale,
      displayName,
    },
    birthChart: null,
    currentTransits: [],
    moon: null,
    tarot: {},
    history: { lastMessages: [] },
  };

  yield baseContext;

  const birthChart = await deps.getBirthChart({ userId }).catch((error) => {
    console.error(
      '[LunaryContext] (stream) Failed to fetch birth chart',
      error,
    );
    return null;
  });

  yield {
    ...baseContext,
    birthChart,
  };

  const currentTransits = await deps
    .getCurrentTransits({ userId, now })
    .catch((error) => {
      console.error('[LunaryContext] (stream) Failed to fetch transits', error);
      return { transits: [], moon: null };
    });

  yield {
    ...baseContext,
    birthChart,
    currentTransits: currentTransits?.transits ?? [],
    moon: currentTransits?.moon ?? null,
  };

  const tarotReading = await deps
    .getTarotLastReading({ userId, now })
    .catch((error) => {
      console.error('[LunaryContext] (stream) Failed to fetch tarot', error);
      return null;
    });

  yield {
    ...baseContext,
    birthChart,
    currentTransits: currentTransits?.transits ?? [],
    moon: currentTransits?.moon ?? null,
    tarot: { lastReading: tarotReading ?? undefined },
  };

  const history = await deps
    .getConversationHistory({ userId, limit: 10, now })
    .catch((error) => {
      console.error(
        '[LunaryContext] (stream) Failed to fetch conversation history',
        error,
      );
      return { lastMessages: [] };
    });

  yield {
    ...baseContext,
    birthChart,
    currentTransits: currentTransits?.transits ?? [],
    moon: currentTransits?.moon ?? null,
    tarot: { lastReading: tarotReading ?? undefined },
    history: {
      lastMessages: history?.lastMessages ?? [],
    },
  };
};
