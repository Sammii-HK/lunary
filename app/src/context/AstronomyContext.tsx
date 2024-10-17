'use client';

import { createContext, useContext, useMemo, useState } from "react";
import { AstroChartInformation, getMoonPhase, useAstrologicalChart, useCurrentAstrologicalChart } from "../../utils/astrology/astrology";
import { constellations } from "../../utils/constellations";
import dayjs from "dayjs";
import { getWrittenDate } from "../../utils/date/date";

export const AstronomyContext = createContext<{
  currentAstrologicalChart: AstroChartInformation[],
  currentMoonPosition: AstroChartInformation | undefined,
  currentMoonConstellationPosition: string | undefined,
  currentMoonConstellation: typeof constellations[keyof typeof constellations] | undefined,
  currentDate: Date,
  setCurrentDate: (date: Date) => void,
  currentMoonPhase: string,
  writtenDate: string,
} | null>(null);

export function useAstronomyContext() {
  const context = useContext(AstronomyContext);
  if (!context) {
    throw new Error('useAstronomyContext must be used within an AstronomyContextProvider');
  }
  return context;
}

export const AstronomyContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentDate, setCurrentDate] = useState(dayjs().toDate());
  console.log("currentDate", currentDate);
  
  const currentAstrologicalChart = useAstrologicalChart(currentDate);
  const currentMoonPosition = currentAstrologicalChart.find(({body}) => body === "Moon");
  const currentMoonConstellationPosition = useMemo(() => currentMoonPosition?.sign, [currentMoonPosition]);
  const currentMoonConstellation = useMemo(() => constellations[currentMoonConstellationPosition?.toLowerCase() as keyof typeof constellations], [currentMoonConstellationPosition]);
  const currentMoonPhase = getMoonPhase(currentDate);
  const writtenDate = useMemo(() => getWrittenDate(currentDate), [currentDate]);

  return (
    <AstronomyContext.Provider value={{
      currentAstrologicalChart,
      currentMoonPosition,
      currentMoonConstellationPosition,
      currentMoonConstellation,
      currentDate,
      setCurrentDate,
      currentMoonPhase,
      writtenDate,
    }}>
      {children}
    </AstronomyContext.Provider>
  )
}
