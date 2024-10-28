'use client';

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AstroChartInformation, useAstrologicalChart, ZodiacSign } from "../../utils/astrology/astrology";
import { constellations } from "../../utils/constellations";
import dayjs from "dayjs";
import { getWrittenDate } from "../../utils/date/date";
import { getTarotCard } from "../../utils/tarot/tarot";
import { monthlyMoonPhases } from "../../utils/moon/monthlyPhases";
import { getMoonPhase, MoonPhaseLabels, stringToCamelCase } from "../../utils/moon/moonPhases";

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
  
  const currentAstrologicalChart = useAstrologicalChart(currentDateTime);
  const currentMoonPosition = currentAstrologicalChart.find(({body}) => body === "Moon");
  const currentMoonConstellationPosition = useMemo(() => currentMoonPosition?.sign as ZodiacSign, [currentMoonPosition]);
  const currentMoonConstellation = useMemo(() => constellations[currentMoonConstellationPosition?.toLowerCase() as keyof typeof constellations], [currentMoonConstellationPosition]);
  const currentMoonPhase = getMoonPhase(currentDateTime);
  const writtenDate = useMemo(() => getWrittenDate(currentDateTime), [currentDateTime]);
  const currentTarotCard = useMemo(() => getTarotCard(currentDate), [currentDate]);
  const symbol = monthlyMoonPhases[stringToCamelCase(currentMoonPhase) as keyof typeof monthlyMoonPhases]?.symbol;

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
    }}>
      {children}
    </AstronomyContext.Provider>
  )
}
