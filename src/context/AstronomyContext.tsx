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
    throw new Error(
      'useAstronomyContext must be used within an AstronomyContextProvider',
    );
  }
  return context;
}

export const AstronomyContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { user } = useUser();
  const userName = user?.name;
  const userBirthday = user?.birthday;

  const [currentDateTime, setCurrentDateTime] = useState(dayjs().toDate());
  const [currentDate, setCurrentDate] = useState(
    dayjs(currentDateTime).format('YYYY-MM-DD'),
  );
  const [cosmicData, setCosmicData] = useState<GlobalCosmicData | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    fetch(`/api/cosmic/global?date=${currentDate}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && !data.error) {
          setCosmicData(data);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch cosmic data:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [currentDate, refreshKey]);

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
        currentMoonConstellationPosition,
        currentMoonConstellation,
        currentDateTime,
        setCurrentDateTime,
        currentMoonPhase,
        moonIllumination,
        moonAge,
        writtenDate,
        currentTarotCard,
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
