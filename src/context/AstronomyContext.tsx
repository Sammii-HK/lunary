'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  AstroChartInformation,
  ZodiacSign,
} from '../../utils/astrology/astrology';
import { constellations } from '../../utils/constellations';
import dayjs from 'dayjs';
import { getWrittenDate } from '../../utils/date/date';
import { getPersonalizedTarotCard } from '@/lib/tarot/get-personalized-card';
import { monthlyMoonPhases } from '../../utils/moon/monthlyPhases';
import {
  MoonPhaseLabels,
  stringToCamelCase,
} from '../../utils/moon/moonPhases';
import type { GlobalCosmicData } from '@/lib/cosmic-snapshot/global-cache';
import { useUser } from '@/context/UserContext';
import { DailyCache, getLocalDateString } from '@/lib/cache/dailyCache';

/** Lightweight client-side duration formatter (mirrors server formatDuration) */
function formatDurationCompact(days: number): string {
  const hours = Math.round(days * 24);
  if (hours < 1) return '<1h left';
  if (days < 1) return `${hours}h left`;
  if (days < 14) return `${Math.round(days)}d left`;
  if (days < 56) return `${Math.round(days / 7)}w left`;
  if (days < 365) return `${Math.round(days / 30)}m left`;
  const years = Math.round((days / 365) * 10) / 10;
  return years % 1 === 0 ? `${Math.round(years)}y left` : `${years}y left`;
}

/** Recalculate remaining time from stored end date */
function refreshClientDuration(duration: {
  totalDays: number;
  remainingDays: number;
  displayText: string;
  startDate?: string | Date;
  endDate?: string | Date;
}) {
  if (!duration.endDate) return null; // No end date = stale cached data, discard
  const endTime = new Date(duration.endDate).getTime();
  const remainingMs = endTime - Date.now();
  if (remainingMs <= 0) return null;
  const remainingDays = remainingMs / (1000 * 60 * 60 * 24);
  return {
    totalDays: duration.totalDays,
    remainingDays,
    displayText: formatDurationCompact(remainingDays),
  };
}

// =============================================================================
// Granular context types
// =============================================================================

type CosmicDateContextValue = {
  currentDateTime: Date;
  setCurrentDateTime: (date: Date) => void;
  currentDate: string;
  writtenDate: string;
};

type MoonContextValue = {
  currentMoonPhase: MoonPhaseLabels;
  moonIllumination: number;
  moonAge: number;
  currentMoonPosition: AstroChartInformation | undefined;
  currentMoonConstellationPosition: ZodiacSign | undefined;
  currentMoonConstellation:
    | (typeof constellations)[keyof typeof constellations]
    | undefined;
  symbol: string;
};

type PlanetaryContextValue = {
  currentAstrologicalChart: AstroChartInformation[];
  generalTransits: GlobalCosmicData['generalTransits'];
  refreshCosmicData: () => void;
};

type TarotContextValue = {
  currentTarotCard: any;
};

// =============================================================================
// Context creation
// =============================================================================

const CosmicDateContext = createContext<CosmicDateContextValue | null>(null);
const MoonContext = createContext<MoonContextValue | null>(null);
const PlanetaryContext = createContext<PlanetaryContextValue | null>(null);
const TarotContext = createContext<TarotContextValue | null>(null);

// Legacy combined context — kept for backwards compat
export const AstronomyContext = createContext<{
  currentAstrologicalChart: AstroChartInformation[];
  currentMoonPosition: AstroChartInformation | undefined;
  currentMoonConstellationPosition: ZodiacSign | undefined;
  currentMoonConstellation:
    | (typeof constellations)[keyof typeof constellations]
    | undefined;
  currentDateTime: Date;
  setCurrentDateTime: (date: Date) => void;
  currentMoonPhase: MoonPhaseLabels;
  moonIllumination: number;
  moonAge: number;
  writtenDate: string;
  currentTarotCard: any;
  symbol: string;
  currentDate: string;
  refreshCosmicData: () => void;
  generalTransits: GlobalCosmicData['generalTransits'];
} | null>(null);

// =============================================================================
// Fallback error reporting (shared by all hooks)
// =============================================================================

function reportMissingProvider(contextName: string) {
  const errorInfo = {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'SSR',
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
    componentStack:
      process.env.NODE_ENV === 'development' ? new Error().stack : undefined,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error(
      `AstronomyContext (${contextName}): Component is not wrapped in AstronomyContextProvider!`,
      '\nLocation:',
      errorInfo.url,
    );
  } else {
    console.warn(
      `AstronomyContext (${contextName}): Missing provider, using fallback`,
      {
        url: errorInfo.url,
        timestamp: errorInfo.timestamp,
      },
    );
  }

  if (typeof window !== 'undefined') {
    if ((window as any).Sentry) {
      (window as any).Sentry.captureMessage(
        `${contextName} used without provider`,
        {
          level: 'warning',
          extra: errorInfo,
          tags: { context: 'astronomy', fallback: 'active' },
        },
      );
    }
    if ((window as any).posthog) {
      (window as any).posthog.capture('astronomy_context_fallback_used', {
        ...errorInfo,
        contextName,
        environment: process.env.NODE_ENV,
      });
    }
  }
}

// =============================================================================
// Granular hooks
// =============================================================================

export function useCosmicDate(): CosmicDateContextValue {
  const context = useContext(CosmicDateContext);
  if (!context) {
    reportMissingProvider('CosmicDate');
    return {
      currentDateTime: new Date(),
      setCurrentDateTime: () => {},
      currentDate: getLocalDateString(),
      writtenDate: '',
    };
  }
  return context;
}

export function useMoonData(): MoonContextValue {
  const context = useContext(MoonContext);
  if (!context) {
    reportMissingProvider('Moon');
    return {
      currentMoonPhase: 'New Moon' as MoonPhaseLabels,
      moonIllumination: 0,
      moonAge: 0,
      currentMoonPosition: undefined,
      currentMoonConstellationPosition: undefined,
      currentMoonConstellation: undefined,
      symbol: '',
    };
  }
  return context;
}

export function usePlanetaryChart(): PlanetaryContextValue {
  const context = useContext(PlanetaryContext);
  if (!context) {
    reportMissingProvider('Planetary');
    return {
      currentAstrologicalChart: [],
      generalTransits:
        undefined as unknown as GlobalCosmicData['generalTransits'],
      refreshCosmicData: () => {},
    };
  }
  return context;
}

export function useTarotCard(): TarotContextValue {
  const context = useContext(TarotContext);
  if (!context) {
    reportMissingProvider('Tarot');
    return { currentTarotCard: null };
  }
  return context;
}

// =============================================================================
// Composed backwards-compatible hook
// =============================================================================

export function useAstronomyContext() {
  const legacyContext = useContext(AstronomyContext);
  if (legacyContext) return legacyContext;

  // Fallback: not inside provider — return safe defaults with error reporting
  reportMissingProvider('AstronomyContext');
  return {
    currentAstrologicalChart: [],
    currentMoonPosition: undefined,
    currentMoonConstellationPosition: undefined,
    currentMoonConstellation: undefined,
    currentDateTime: new Date(),
    setCurrentDateTime: () => {
      console.warn('AstronomyContext fallback: setCurrentDateTime called');
    },
    currentMoonPhase: 'New Moon' as MoonPhaseLabels,
    moonIllumination: 0,
    moonAge: 0,
    writtenDate: '',
    currentTarotCard: null,
    symbol: '',
    currentDate: getLocalDateString(),
    refreshCosmicData: () => {
      console.warn('AstronomyContext fallback: refreshCosmicData called');
    },
    generalTransits:
      undefined as unknown as GlobalCosmicData['generalTransits'],
  };
}

// =============================================================================
// Provider
// =============================================================================

export const AstronomyContextProvider = ({
  children,
  demoData,
}: {
  children: React.ReactNode;
  demoData?: {
    currentMoonPhase?: MoonPhaseLabels;
    currentMoonConstellationPosition?: ZodiacSign;
    currentTarotCard?: any;
    moonIllumination?: number;
    moonAge?: number;
  };
}) => {
  const { user } = useUser();
  const userName = user?.name;
  const userBirthday = user?.birthday;

  const isDemoMode = Boolean(demoData);

  const [currentDateTime, setCurrentDateTime] = useState(dayjs().toDate());
  const [currentDate, setCurrentDate] = useState(
    dayjs(currentDateTime).format('YYYY-MM-DD'),
  );
  const [cosmicData, setCosmicData] = useState<GlobalCosmicData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  // Tick counter to trigger duration recalculation every 60s
  const [durationTick, setDurationTick] = useState(0);

  useEffect(() => {
    if (isDemoMode) return; // Skip fetching in demo mode

    let isMounted = true;

    // Check cache first - cosmic data updates every 2 hours
    const cacheKey = `cosmic_global_v3_${currentDate}`;
    const cached = DailyCache.get<GlobalCosmicData>(cacheKey);

    if (cached && refreshKey === 0) {
      // Use cached data (skip if user manually refreshed)
      setCosmicData(cached);
      return;
    }

    // Cache miss or manual refresh, fetch from API
    fetch(`/api/cosmic/global?date=${currentDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && !data.error) {
          // Cache for 2 hours (hourly = 2 hour expiration)
          DailyCache.set(cacheKey, data, 'hourly');
          setCosmicData(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch cosmic data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentDate, refreshKey, isDemoMode]);

  // Recalculate durations every 60s so badges stay current
  useEffect(() => {
    if (isDemoMode || !cosmicData?.planetaryPositions) return;
    const id = setInterval(() => setDurationTick((t) => t + 1), 60_000);
    return () => clearInterval(id);
  }, [isDemoMode, cosmicData]);

  const currentAstrologicalChart = useMemo(() => {
    if (!cosmicData?.planetaryPositions) return [];

    // Build in explicit solar system order
    const PLANET_ORDER = [
      'Sun',
      'Moon',
      'Mercury',
      'Venus',
      'Mars',
      'Jupiter',
      'Saturn',
      'Uranus',
      'Neptune',
      'Pluto',
    ];

    const result = PLANET_ORDER.filter(
      (body) => cosmicData.planetaryPositions[body],
    ).map((body) => {
      const data = cosmicData.planetaryPositions[body];
      return {
        body,
        sign: data.sign,
        formattedDegree: {
          degree: Math.floor(data.longitude % 30),
          minute: Math.floor(((data.longitude % 30) % 1) * 60),
        },
        retrograde: data.retrograde,
        eclipticLongitude: data.longitude,
        duration: data.duration
          ? (refreshClientDuration(data.duration) ?? undefined)
          : undefined,
      };
    }) as AstroChartInformation[];

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cosmicData, durationTick]);

  const generalTransits = useMemo(
    () => cosmicData?.generalTransits ?? [],
    [cosmicData],
  );

  const currentMoonPosition = currentAstrologicalChart.find(
    ({ body }) => body === 'Moon',
  );
  const currentMoonConstellationPosition = useMemo(
    () => currentMoonPosition?.sign as ZodiacSign,
    [currentMoonPosition],
  );
  const currentMoonConstellation = useMemo(
    () =>
      constellations[
        currentMoonConstellationPosition?.toLowerCase() as keyof typeof constellations
      ],
    [currentMoonConstellationPosition],
  );
  const currentMoonPhase = useMemo(() => {
    if (cosmicData?.moonPhase?.name) {
      return cosmicData.moonPhase.name as MoonPhaseLabels;
    }
    return 'Waxing Crescent' as MoonPhaseLabels;
  }, [cosmicData]);

  const moonIllumination = useMemo(() => {
    return cosmicData?.moonPhase?.illumination ?? 0;
  }, [cosmicData]);

  const moonAge = useMemo(() => {
    return cosmicData?.moonPhase?.age ?? 0;
  }, [cosmicData]);
  const writtenDate = useMemo(
    () => getWrittenDate(currentDateTime),
    [currentDateTime],
  );
  const currentTarotCard = useMemo(
    () =>
      getPersonalizedTarotCard(
        currentDate,
        user?.birthChart,
        currentMoonConstellationPosition,
        currentMoonPhase,
        moonIllumination,
        userName,
        userBirthday,
      ),
    [
      currentDate,
      user?.birthChart,
      currentMoonConstellationPosition,
      currentMoonPhase,
      moonIllumination,
      userName,
      userBirthday,
    ],
  );
  const symbol =
    monthlyMoonPhases[
      stringToCamelCase(currentMoonPhase) as keyof typeof monthlyMoonPhases
    ]?.symbol;

  useEffect(() => {
    setCurrentDate(dayjs(currentDateTime).format('YYYY-MM-DD'));
  }, [currentDateTime]);

  const refreshCosmicData = useMemo(
    () => () => setRefreshKey((prev) => prev + 1),
    [],
  );

  // Granular context values — memoized individually
  const cosmicDateValue = useMemo<CosmicDateContextValue>(
    () => ({ currentDateTime, setCurrentDateTime, currentDate, writtenDate }),
    [currentDateTime, currentDate, writtenDate],
  );

  const moonValue = useMemo<MoonContextValue>(
    () => ({
      currentMoonPhase: isDemoMode
        ? demoData!.currentMoonPhase || currentMoonPhase
        : currentMoonPhase,
      moonIllumination: isDemoMode
        ? (demoData!.moonIllumination ?? moonIllumination)
        : moonIllumination,
      moonAge: isDemoMode ? (demoData!.moonAge ?? moonAge) : moonAge,
      currentMoonPosition,
      currentMoonConstellationPosition: isDemoMode
        ? demoData!.currentMoonConstellationPosition ||
          currentMoonConstellationPosition
        : currentMoonConstellationPosition,
      currentMoonConstellation,
      symbol,
    }),
    [
      isDemoMode,
      demoData,
      currentMoonPhase,
      moonIllumination,
      moonAge,
      currentMoonPosition,
      currentMoonConstellationPosition,
      currentMoonConstellation,
      symbol,
    ],
  );

  const planetaryValue = useMemo<PlanetaryContextValue>(
    () => ({
      currentAstrologicalChart,
      generalTransits,
      refreshCosmicData,
    }),
    [currentAstrologicalChart, generalTransits, refreshCosmicData],
  );

  const tarotValue = useMemo<TarotContextValue>(
    () => ({
      currentTarotCard: isDemoMode
        ? demoData!.currentTarotCard || currentTarotCard
        : currentTarotCard,
    }),
    [isDemoMode, demoData, currentTarotCard],
  );

  // Legacy combined value for AstronomyContext backwards compat
  const legacyValue = useMemo(
    () => ({
      ...cosmicDateValue,
      ...moonValue,
      ...planetaryValue,
      ...tarotValue,
    }),
    [cosmicDateValue, moonValue, planetaryValue, tarotValue],
  );

  return (
    <AstronomyContext.Provider value={legacyValue}>
      <CosmicDateContext.Provider value={cosmicDateValue}>
        <MoonContext.Provider value={moonValue}>
          <PlanetaryContext.Provider value={planetaryValue}>
            <TarotContext.Provider value={tarotValue}>
              {children}
            </TarotContext.Provider>
          </PlanetaryContext.Provider>
        </MoonContext.Provider>
      </CosmicDateContext.Provider>
    </AstronomyContext.Provider>
  );
};
