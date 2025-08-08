
import { MoonPhase } from "astronomy-engine";
import { monthlyMoonPhases } from "./monthlyPhases";
import dayjs from "dayjs";

export const stringToCamelCase = (string: string) => {
	return string[0].toLowerCase() + string.substring(1).replace(" ", "");
};

export const moonPhases = [
  "newMoon", 
  "waxingCrescent", 
  "firstQuarter",
  "waxingGibbous",
  "fullMoon",
  "waningGibbous",
  "lastQuarter"
] as const;

export type MoonPhase = "newMoon" | "waxingCrescent" | "firstQuarter" | "waxingGibbous" | "fullMoon" | "waningGibbous" | "lastQuarter";

export const moonPhaseLabels = {
  newMoon: "New Moon",
  waxingCrescent: "Waxing Crescent",
  firstQuarter: "First Quarter",
  waxingGibbous: "Waxing Gibbous",
  fullMoon: "Full Moon",
  waningGibbous: "Waning Gibbous",
  lastQuarter: "Last Quarter",
  waningCrescent: "Waning",
}

const lunarAgeRanges = {
  newMoon: [27.68, 29.53, 1.84],
  waxingCrescent: [1.84, 3.69, 5.53],
  firstQuarter: [5.53, 7.38, 9.22],
  waxingGibbous: [9.22, 11.07, 12.91],
  fullMoon: [12.91, 14.76, 16.61],
  waningGibbous: [16.61, 18.45, 20.30],
  lastQuarter: [20.30, 22.14, 23.99],
  waningCrescent: [23.99, 25.83, 27.68],
}

export type MoonPhaseLabels = "New Moon" | "Waxing Crescent" | "First Quarter" | "Waxing Gibbous" | "Full Moon" | "Waning Gibbous" | "Last Quarter" | "Waning Crescent";

export function getMoonPhase(date: Date): MoonPhaseLabels {
  const moonPhase = MoonPhase(date);

  const getPhase = (phase: number): MoonPhaseLabels => {
    if (phase >= 0 && phase < 22.5) return "New Moon";
    if (phase >= 22.5 && phase < 67.5) return "Waxing Crescent";
    if (phase >= 67.5 && phase < 112.5) return "First Quarter";
    if (phase >= 112.5 && phase < 157.5) return "Waxing Gibbous";
    if (phase >= 157.5 && phase < 202.5) return "Full Moon";
    if (phase >= 202.5 && phase < 247.5) return "Waning Gibbous";
    if (phase >= 247.5 && phase < 292.5) return "Last Quarter";
    if (phase >= 292.5 && phase < 337.5) return "Waning Crescent";
    return "New Moon"; // for phase >= 337.5 to 360
  };

  const moonPhaseString = getPhase(moonPhase);
  return moonPhaseString;
}

export const getMoonSymbol = () => {
  const currentMoonPhase = getMoonPhase(dayjs().toDate());
  return monthlyMoonPhases[stringToCamelCase(currentMoonPhase) as keyof typeof monthlyMoonPhases]?.symbol;
}
