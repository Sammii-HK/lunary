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

export function useAstronomyContext() {
  const context = useContext(AstronomyContext);
  if (!context) {
    // Emergency fallback - this should RARELY happen in production
    // Collect diagnostic information
    const errorInfo = {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : 'SSR',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
      componentStack:
        process.env.NODE_ENV === 'development' ? new Error().stack : undefined,
    };

    // In development, show a very visible error to help developers fix the issue
    if (process.env.NODE_ENV === 'development') {
      console.error(
        '🚨 ASTRONOMY CONTEXT ERROR: Component is not wrapped in AstronomyContextProvider!',
        '\n📍 Location:',
        errorInfo.url,
        '\n⏰ Time:',
        errorInfo.timestamp,
        '\n\n💡 Fix: Ensure this component is rendered inside <AstronomyContextProvider>',
      );
      console.trace('📋 Component stack trace:');
    } else {
      // In production, log quietly for monitoring systems
      console.warn('AstronomyContext: Missing provider, using fallback', {
        url: errorInfo.url,
        timestamp: errorInfo.timestamp,
      });
    }

    // Send to error monitoring service if available
    if (typeof window !== 'undefined') {
      // Sentry integration
      if ((window as any).Sentry) {
        (window as any).Sentry.captureMessage(
          'AstronomyContext used without provider',
          {
            level: 'warning',
            extra: errorInfo,
            tags: {
              context: 'astronomy',
              fallback: 'active',
            },
          },
        );
      }

      // PostHog integration for analytics
      if ((window as any).posthog) {
        (window as any).posthog.capture('astronomy_context_fallback_used', {
          ...errorInfo,
          environment: process.env.NODE_ENV,
        });
      }
    }

    // Return safe defaults as absolute last resort
    // This keeps the app running but we'll know about it via monitoring
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
      currentDate: getLocalDateString(), // User's local date, not UTC
      refreshCosmicData: () => {
        console.warn('AstronomyContext fallback: refreshCosmicData called');
      },
      generalTransits: undefined,
    };
  }
  return context;
}

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

  useEffect(() => {
    if (isDemoMode) return; // Skip fetching in demo mode

    let isMounted = true;

    // Check cache first - cosmic data updates every 2 hours
    const cacheKey = `cosmic_global_${currentDate}`;
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
      };
    }) as AstroChartInformation[];

    return result;
  }, [cosmicData]);

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

  return (
    <AstronomyContext.Provider
      value={{
        currentAstrologicalChart,
        currentMoonPosition,
        currentMoonConstellationPosition: isDemoMode
          ? demoData!.currentMoonConstellationPosition ||
            currentMoonConstellationPosition
          : currentMoonConstellationPosition,
        currentMoonConstellation,
        currentDateTime,
        setCurrentDateTime,
        currentMoonPhase: isDemoMode
          ? demoData!.currentMoonPhase || currentMoonPhase
          : currentMoonPhase,
        moonIllumination: isDemoMode
          ? (demoData!.moonIllumination ?? moonIllumination)
          : moonIllumination,
        moonAge: isDemoMode ? (demoData!.moonAge ?? moonAge) : moonAge,
        writtenDate,
        currentTarotCard: isDemoMode
          ? demoData!.currentTarotCard || currentTarotCard
          : currentTarotCard,
        symbol,
        currentDate,
        refreshCosmicData: () => setRefreshKey((prev) => prev + 1),
        generalTransits,
      }}
    >
      {children}
    </AstronomyContext.Provider>
  );
};
