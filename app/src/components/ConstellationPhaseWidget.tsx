"use client";

import { constellationItems, getIcon, } from "../../utils/zodiac/zodiac";
import { useAstronomyContext } from "@/context/AstronomyContext";
import { MoonPhaseLabels, stringToCamelCase } from "../../utils/moon/moonPhases";
import { constellationsMoonPhases } from "../../utils/moon/zodiacPhases";
import { MoonPhase } from "../../utils/moon/moonPhases";
// import { checkForEquinoxOrSolstice } from "../../utils/astrology/astrology";
import { constellations } from "../../utils/constellations";


export const ConstellationPhaseWidget = () => {
  const {currentMoonConstellation, currentMoonPhase} = useAstronomyContext()

  if (!currentMoonConstellation) return null;

  return (
		<LoadedConstellationPhaseWidget
			currentMoonConstellation={currentMoonConstellation}
			currentMoonPhase={currentMoonPhase}
		/>
	);
};

export const LoadedConstellationPhaseWidget = ({
	currentMoonConstellation,
	currentMoonPhase,
}: {
	currentMoonConstellation: (typeof constellations)[keyof typeof constellations];
	currentMoonPhase: MoonPhaseLabels;
}) => {
	const constellationItems = [
		"element",
		"rulingPlanet",
		"quality",
		"symbol",
	] as const;
	const currentMoonConstellationName =
		currentMoonConstellation.name?.toLowerCase() as keyof typeof constellationsMoonPhases;
	const currentConstellationMoonPhases =
		constellationsMoonPhases[currentMoonConstellationName];
	const phaseConstellationInformation =
		currentConstellationMoonPhases[
			stringToCamelCase(currentMoonPhase) as MoonPhase
		];

	return (
		<>
			<div className="flex mb-3 flex-wrap grid-cols-2 justify-between">
				{constellationItems.map((item) => (
					<ConstellationItem
						key={item}
						item={item}
						constellation={currentMoonConstellation}
					/>
				))}
			</div>
			<p className="mb-4 text-[12px]">
				{phaseConstellationInformation?.details}
			</p>
		</>
	);
};

const ConstellationItem = ({
  item,
  constellation,
}:
{
  item: constellationItems,
  constellation: any,
}) => {
  const icon = getIcon(item as 'element' | 'rulingPlanet', constellation[item], constellation); 
  const ExpandedItem = `${icon} ${constellation[item]}`;

  return (
    <p>{ExpandedItem}</p>
  )
}
