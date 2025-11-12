import {
  BirthChartSnapshot,
  ConversationMessageMeta,
  DailyHighlight,
  LunaryContext,
  MoodHistory,
  MoonSnapshot,
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
} from './providers';

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
  getDailyHighlight: defaultGetDailyHighlight,
  getMoodHistory: defaultGetMoodHistory,
  getConversationHistory: defaultGetConversationHistory,
};

export type BuildLunaryContextParams = {
  userId: string;
  tz: string;
  locale: string;
  displayName?: string;
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
  historyLimit = 10,
  includeMood = true,
  deps: dependencyOverrides,
  now = new Date(),
}: BuildLunaryContextParams): Promise<BuildLunaryContextResult> => {
  const deps = mergeDeps(dependencyOverrides);

  const [
    birthChart,
    currentTransits,
    tarotReading,
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
    deps
      .getConversationHistory({ userId, limit: historyLimit, now })
      .catch((error) => {
        console.error(
          '[LunaryContext] Failed to fetch conversation history',
          error,
        );
        return { lastMessages: emptyHistory };
      }),
  ]);

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
    },
    history: {
      lastMessages: history?.lastMessages ?? emptyHistory,
    },
  };

  if (mood) {
    context.mood = mood;
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
