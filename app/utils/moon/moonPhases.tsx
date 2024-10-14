import { moonPhasesWithConstellations } from "./anualPhases";
import { months } from "../months";
import { Moon } from "lunarphase-js";

export const stringToCamelCase = (string: string) => {
	return string[0].toLowerCase() + string.substring(1).replace(" ", "");
};

export type CamelCaseMoonPhase =
	| "new"
	| "waxingCrescent"
	| "firstQuarter"
	| "waxingGibbous"
	| "full"
	| "waningGibbous"
	| "lastQuarter";

export const moonPhases = [
  "new", 
  "waxingCrescent", 
  "firstQuarter",
  "waxingGibbous",
  "full",
  "waningGibbous",
  "lastQuarter"
] as const;

export const moonPhaseLabels = {
  new: "New Moon",
  waxingCrescent: "Waxing Crescent",
  firstQuarter: "First Quarter",
  waxingGibbous: "Waxing Gibbous",
  full: "Full Moon",
  waningGibbous: "Waning Gibbous",
  lastQuarter: "Last Quarter",
  waningCrescent: "Waning",
}

export const getNextMoonPhase = (currentPhase: CamelCaseMoonPhase) => {
  const currentPhaseIndex = moonPhases.indexOf(currentPhase);
  const nextPhaseIndex = (currentPhaseIndex + 1) % moonPhases.length;
  return moonPhases[nextPhaseIndex];
};

const lunarAgeRanges = {
  new: [27.68, 29.53, 1.84],
  waxingCrescent: [1.84, 3.69, 5.53],
  firstQuarter: [5.53, 7.38, 9.22],
  waxingGibbous: [9.22, 11.07, 12.91],
  full: [12.91, 14.76, 16.61],
  waningGibbous: [16.61, 18.45, 20.30],
  lastQuarter: [20.30, 22.14, 23.99],
  waningCrescent: [23.99, 25.83, 27.68],
}

export const getLunarAgeToNextPhase = (lunarAge: number) => {
  const phase = moonPhases.find(phase => {
    const [min, event, max] = lunarAgeRanges[phase];
    return lunarAge >= min && lunarAge < max;
  });

  const daysUntilNextPhase = (lunarAgeRanges[phase as CamelCaseMoonPhase][2]) - lunarAge;

  return daysUntilNextPhase.toFixed(1);
};

export const todaysDate = new Date();

const monthNumber = todaysDate.getMonth();
const month = months[monthNumber];

export const currentMoon = Moon.lunarPhase(todaysDate);

export const currentMoonPhase = stringToCamelCase(Moon.lunarPhase(todaysDate));

const phasesWithConstellationsInMonth = moonPhasesWithConstellations[month.toLowerCase() as keyof typeof moonPhasesWithConstellations];

export const nextMoonPhase = stringToCamelCase(getNextMoonPhase(currentMoonPhase as CamelCaseMoonPhase));


export const moonPhaseInConstellation = ({phase}: {phase: string}) => {
  return phase in phasesWithConstellationsInMonth
  ? phasesWithConstellationsInMonth[
    phase as keyof typeof phasesWithConstellationsInMonth
  ]
  : undefined;
};

const getMoonPhaseInConstellation = (phase: string) => {
  const constellationsInPhase =  moonPhaseInConstellation({phase});
  const phaseConstellation = () => {
    if (constellationsInPhase?.constellation?.length === 1) return constellationsInPhase?.constellation[0];
    if (todaysDate.getDate() < 15) return constellationsInPhase?.constellation[0];
    if (todaysDate.getDate() >= 15) return constellationsInPhase?.constellation[1];
  }
  const constellation = phaseConstellation();

  if (!constellation) return null;
  return {
    name: constellation,
    information: constellationsInPhase?.information[constellation?.toLowerCase() as keyof typeof constellationsInPhase.information],
  }
};

export const currentMoonPhaseInConstellation = getMoonPhaseInConstellation(currentMoonPhase)//?.constellation[0]; // make this dynamic based on if beginning or end of the month

export const nextMoonPhaseInConstellation = getMoonPhaseInConstellation(nextMoonPhase)//?.constellation[0]; // make this dynamic based on if beginning or end of the month