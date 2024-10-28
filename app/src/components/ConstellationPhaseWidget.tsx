"use client";

import { constellationItems, getIcon, } from "../../utils/zodiac/zodiac";
import { useAstronomyContext } from "@/context/AstronomyContext";
import { stringToCamelCase } from "../../utils/moon/moonPhases";
import { constellationsMoonPhases } from "../../utils/moon/zodiacPhases";
import { MoonPhase } from "../../utils/moon/moonPhases";

export const ConstellationPhaseWidget = () => {
  const {currentMoonConstellation, currentMoonPhase} = useAstronomyContext()

  if (!currentMoonConstellation) return null;

  const constellationItems = [ 'element', 'rulingPlanet', 'quality', 'symbol' ] as const;
  const currentMoonConstellationName = currentMoonConstellation.name?.toLowerCase() as keyof typeof constellationsMoonPhases;
  const currentConstellationMoonPhases = constellationsMoonPhases[currentMoonConstellationName]
  const phaseConstellationInformation = currentConstellationMoonPhases[stringToCamelCase(currentMoonPhase) as MoonPhase];
  
  return (
    <>
    <div className="flex mb-3 flex-wrap grid-cols-2 justify-between">
      {constellationItems.map(item => (
        <ConstellationItem key={item} item={item} constellation={currentMoonConstellation} />
      ))}
    </div>
    <p className="mb-4 text-[12px]">{phaseConstellationInformation?.details}</p>
  </>
  )
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
