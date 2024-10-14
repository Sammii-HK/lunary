import { createContext, useMemo } from "react";
import { useCurrentAstrologicalChart } from "../../utils/astrology/astrology";
import { constellations } from "../../utils/constellations";

export const AstronomyContext = createContext(() => {
  const currentAstrologicalChart = useCurrentAstrologicalChart();
  const currentMoonPosition = useCurrentAstrologicalChart().find(({body}) => body === "Moon");
  const currentMoonConstellationPosition = useMemo(() => currentMoonPosition?.sign, [currentMoonPosition]);
  const todaysDate = new Date();
  const currentMoonConstellation = useMemo(() => constellations[currentMoonConstellationPosition?.toLowerCase() as keyof typeof constellations], [currentMoonConstellationPosition]);



  // console.log("currentAstrologicalChart", currentAstrologicalChart);

  return {
    currentAstrologicalChart,
    currentMoonPosition,
    currentMoonConstellationPosition,
    todaysDate,
    currentMoonConstellation,
  }
});
