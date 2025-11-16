import {
  BirthChartSnapshot,
  ConversationMessageMeta,
  DailyHighlight,
  LunaryContext,
  MoodHistory,
  MoonSnapshot,
  TarotCard,
  TarotReading,
  TransitRecord,
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
  getTarotPatternAnalysis: (params: {
    userId: string;
    userName?: string;
    userBirthday?: string;
    now?: Date;
  }) => Promise<{
    daily: TarotCard;
    weekly: TarotCard;
    personal: TarotCard;
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
  deps: dependencyOverrides,
  now = new Date(),
  useCache = true,
}: BuildLunaryContextParams & {
  useCache?: boolean;
}): Promise<BuildLunaryContextResult> => {
  // Try to get cached snapshot first - reuse tarot data if available
  let cachedTarotData: {
    daily?: any;
    weekly?: any;
    personal?: any;
    patternAnalysis?: any;
  } | null = null;

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
  // This avoids regenerating the same cards when building fresh context
  if (!useCache) {
    try {
      const cachedSnapshot = await getCachedSnapshot(userId, now);
      if (cachedSnapshot?.tarot) {
        cachedTarotData = {
          daily: cachedSnapshot.tarot.daily,
          weekly: cachedSnapshot.tarot.weekly,
          personal: cachedSnapshot.tarot.personal,
          patternAnalysis: cachedSnapshot.tarot.patternAnalysis,
        };
      }
    } catch (error) {
      // Ignore cache errors when building fresh - we'll generate new data
    }
  }

  const deps = mergeDeps(dependencyOverrides);

  const [
    birthChart,
    currentTransits,
    tarotReading,
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
    // Use cached tarot data if available, otherwise fetch fresh
    cachedTarotData
      ? Promise.resolve({
          daily: cachedTarotData.daily,
          weekly: cachedTarotData.weekly,
          personal: cachedTarotData.personal,
          trends: cachedTarotData.patternAnalysis || {
            dominantThemes: [],
            frequentCards: [],
            patternInsights: [],
          },
        })
      : deps
          .getTarotPatternAnalysis({
            userId,
            userName: displayName,
            userBirthday,
            now,
          })
          .catch((error) => {
            console.error(
              '[LunaryContext] Failed to fetch tarot pattern analysis:',
              error,
            );
            // Return null - we'll handle fallback after Promise.all
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

  // Generate fallback tarot cards if pattern analysis failed and we don't have cached data
  let finalTarotPatternAnalysis = tarotPatternAnalysis;
  if (!finalTarotPatternAnalysis && !cachedTarotData) {
    try {
      const { getTarotCard } = await import('../../../utils/tarot/tarot');
      const today = new Date();
      const todayString = today.toDateString();

      // Calculate weekly seed
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekStartYear = weekStart.getFullYear();
      const weekStartMonth = weekStart.getMonth() + 1;
      const weekStartDate = weekStart.getDate();
      const dayOfYear = Math.floor(
        (weekStart.getTime() - new Date(weekStartYear, 0, 0).getTime()) /
          86400000,
      );
      const weekNumber = Math.floor(dayOfYear / 7);
      const weeklySeed = `weekly-${weekStartYear}-W${weekNumber}-${weekStartMonth}-${weekStartDate}`;

      // Get personal card seed
      const currentMonth = new Date().getMonth().toString();
      const personalSeed = userBirthday
        ? userBirthday + currentMonth
        : currentMonth;

      finalTarotPatternAnalysis = {
        daily: getTarotCard(`daily-${todayString}`, displayName, userBirthday),
        weekly: getTarotCard(weeklySeed, displayName, userBirthday),
        personal: getTarotCard(personalSeed, displayName, userBirthday),
        trends: {
          dominantThemes: [],
          frequentCards: [],
          patternInsights: [],
        },
      };
    } catch (fallbackError) {
      console.error(
        '[LunaryContext] Fallback tarot generation failed:',
        fallbackError,
      );
    }
  }

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
      // Ensure tarot cards are always included - use cached, fetched, or fallback
      daily: finalTarotPatternAnalysis?.daily ?? undefined,
      weekly: finalTarotPatternAnalysis?.weekly ?? undefined,
      personal: finalTarotPatternAnalysis?.personal ?? undefined,
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
