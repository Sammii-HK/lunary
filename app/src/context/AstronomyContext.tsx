'use client';

import { createContext, use, useContext, useEffect, useMemo, useState } from 'react';
import { AstroChartInformation, getAstrologicalChart, getObserverLocation, ZodiacSign } from '../../utils/astrology/astrology';
import { constellations } from '../../utils/constellations';
import dayjs from 'dayjs';
import { getWrittenDate } from '../../utils/date/date';
import { getTarotCard } from '../../utils/tarot/tarot';
import { monthlyMoonPhases } from '../../utils/moon/monthlyPhases';
import { getMoonPhase, MoonPhaseLabels, stringToCamelCase } from '../../utils/moon/moonPhases';
import { getHoroscope } from '../../utils/astrology/horoscope';
import { Observer } from 'astronomy-engine';

export const AstronomyContext = createContext<{
  currentAstrologicalChart: AstroChartInformation[],
  currentMoonPosition: AstroChartInformation | undefined,
  currentMoonConstellationPosition: ZodiacSign | undefined,
  currentMoonConstellation: typeof constellations[keyof typeof constellations] | undefined,
  currentDateTime: Date,
  setCurrentDateTime: (date: Date) => void,
  currentMoonPhase: MoonPhaseLabels,
  writtenDate: string,
  currentTarotCard: any,
  symbol: string,
  currentDate: string,
  horoscope: string,
    } | null>(null);

export function useAstronomyContext() {
  const context = useContext(AstronomyContext);
  if (!context) {
    throw new Error('useAstronomyContext must be used within an AstronomyContextProvider');
  }
  return context;
}

export const AstronomyContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentDateTime, setCurrentDateTime] = useState(dayjs().toDate());
  const [currentDate, setCurrentDate] = useState(currentDateTime.toDateString());
  console.log('currentDate', currentDate);

  const [observer, setObserver] = useState<Observer>(new Observer(51.4769, 0.0005, 0));
  const natalObserver = observer;

  useEffect(() => {
    if (!observer) {
      getObserverLocation((obs) => setObserver(obs));
    }
  }, [observer]);
  
  const currentAstrologicalChart = useMemo(() => getAstrologicalChart(currentDateTime, observer), [currentDateTime, observer]);
  const currentMoonPosition = currentAstrologicalChart.find(({body}) => body === 'Moon');
  const currentMoonConstellationPosition = useMemo(() => (currentMoonPosition?.sign as ZodiacSign), [currentMoonPosition]);
  const currentMoonConstellation = useMemo(() => constellations[currentMoonConstellationPosition?.toLowerCase() as keyof typeof constellations], [currentMoonConstellationPosition]);
  const currentMoonPhase = getMoonPhase(currentDateTime);
  const writtenDate = useMemo(() => getWrittenDate(currentDateTime), [currentDateTime]);
  const currentTarotCard = useMemo(() => getTarotCard(currentDate), [currentDate]);
  const symbol = monthlyMoonPhases[stringToCamelCase(currentMoonPhase) as keyof typeof monthlyMoonPhases]?.symbol;

  const natalChart = useMemo(() => getAstrologicalChart(dayjs('1994-01-20').toDate(), natalObserver), [natalObserver]);
  // const natalChart = useAstrologicalChart(dayjs("1994-01-20").toDate());
  const horoscope = useMemo(() => getHoroscope(currentAstrologicalChart, natalChart), [currentAstrologicalChart, natalChart]);

  useEffect(() => {
    setCurrentDate(currentDateTime.toDateString());
  }, [currentDateTime]);

  return (
    <AstronomyContext.Provider value={{
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
      horoscope,
    }}>
      {children}
    </AstronomyContext.Provider>
  );
};
