'use client';

import {
  createContext,
  use,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AstroChartInformation,
  getAstrologicalChart,
  getObserverLocation,
  ZodiacSign,
} from '../../utils/astrology/astrology';
import { constellations } from '../../utils/constellations';
import dayjs from 'dayjs';
import { getWrittenDate } from '../../utils/date/date';
import { getTarotCard } from '../../utils/tarot/tarot';
import { monthlyMoonPhases } from '../../utils/moon/monthlyPhases';
import {
  getMoonPhase,
  MoonPhaseLabels,
  stringToCamelCase,
} from '../../utils/moon/moonPhases';
// import { getHoroscope } from '../../utils/astrology/horoscope';
import { useAccount } from 'jazz-tools/react';

// Lazy load astronomy-engine to reduce initial bundle size
let astronomyEngineModule: typeof import('astronomy-engine') | null = null;
let astronomyEnginePromise: Promise<typeof import('astronomy-engine')> | null =
  null;

async function loadAstronomyEngine() {
  if (astronomyEngineModule) return astronomyEngineModule;
  if (!astronomyEnginePromise) {
    astronomyEnginePromise = import('astronomy-engine');
  }
  astronomyEngineModule = await astronomyEnginePromise;
  return astronomyEngineModule;
}

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
  writtenDate: string;
  currentTarotCard: any;
  symbol: string;
  currentDate: string;
  // horoscope: string,
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
  // Get account info if available
  const account = useAccount();
  const userName = account?.me?.profile?.name;
  const userBirthday = account?.me?.profile?.birthday;

  const [currentDateTime, setCurrentDateTime] = useState(dayjs().toDate());
  const [currentDate, setCurrentDate] = useState(
    dayjs(currentDateTime).format('YYYY-MM-DD'),
  );

  const [observer, setObserver] = useState<any>(null);
  const [isLoadingEngine, setIsLoadingEngine] = useState(true);

  // Lazy load astronomy-engine
  useEffect(() => {
    let isMounted = true;

    loadAstronomyEngine().then((module) => {
      if (!isMounted) return;
      const { Observer } = module;
      const defaultObserver = new Observer(51.4769, 0.0005, 0);
      setObserver(defaultObserver);
      setIsLoadingEngine(false);

      // Get user location if available
      getObserverLocation((obs) => {
        if (isMounted) {
          setObserver(obs);
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const natalObserver = observer;

  const currentAstrologicalChart = useMemo(() => {
    if (!observer) return [];
    return getAstrologicalChart(currentDateTime, observer);
  }, [currentDateTime, observer]);
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
  const currentMoonPhase = getMoonPhase(currentDateTime);
  const writtenDate = useMemo(
    () => getWrittenDate(currentDateTime),
    [currentDateTime],
  );
  const currentTarotCard = useMemo(
    () => getTarotCard(`daily-${currentDate}`, userName, userBirthday),
    [currentDate, userName, userBirthday],
  );
  const symbol =
    monthlyMoonPhases[
      stringToCamelCase(currentMoonPhase) as keyof typeof monthlyMoonPhases
    ]?.symbol;

  const natalChart = useMemo(() => {
    if (!natalObserver) return [];
    return getAstrologicalChart(dayjs('2000-01-01').toDate(), natalObserver);
  }, [natalObserver]);
  // const natalChart = useAstrologicalChart(dayjs("1994-01-20").toDate());
  // const horoscope = useMemo(() => getHoroscope(currentAstrologicalChart, natalChart), [currentAstrologicalChart, natalChart]);

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
        writtenDate,
        currentTarotCard,
        symbol,
        currentDate,
        // horoscope,
      }}
    >
      {children}
    </AstronomyContext.Provider>
  );
};
