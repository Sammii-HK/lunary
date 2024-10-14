'use client'

import { 
  getLunarAgeToNextPhase,
  moonPhaseLabels,
  todaysDate,
  currentMoon,
  nextMoonPhaseInConstellation,
  nextMoonPhase,
  currentMoonPhaseInConstellation
} from "../../utils/moon/moonPhases";
import { useContext } from "react";
import { ConstellationPhaseWidget } from "./ConstellationPhaseWidget";
import { AstronomyContext } from "@/context/AstronomyContext";
import { MoonConstellation } from "./MoonConstellation";
import { Moon } from "lunarphase-js";

const emoji = Moon.emojiForLunarPhase(currentMoon);
const lunarAge = Moon.lunarAge(todaysDate);
const lunarAgeToNextPhase = getLunarAgeToNextPhase(lunarAge);  


export const MoonWidget = () => {
  const getAstronomyContext = useContext(AstronomyContext);
  const currentMoonConstellationPosition = getAstronomyContext().currentMoonConstellationPosition;

  console.log("currentMoonPhaseInConstellation", currentMoonPhaseInConstellation);
  console.log("nextMoonPhaseInConstellation", nextMoonPhaseInConstellation);

  return(
    <div className="border-stone-800 border p-3 flex flex-col w-full rounded-md">
      <div className="flex w-full justify-between">
        <div className="flex align-middle flex-col md:flex-row mb-3">
          <MoonConstellation
            emoji={emoji}
            phaseString={currentMoon}
            moonConstellationPosition={currentMoonConstellationPosition || '...'}
          />
        </div>
      </div>        
      <ConstellationPhaseWidget />
      {nextMoonPhaseInConstellation !== undefined && 
        <p className="font-bold text-xs mb-3">
          <span className="text-xs text-stone-500">{lunarAgeToNextPhase} days until </span>{moonPhaseLabels[nextMoonPhase as keyof typeof moonPhaseLabels]} <> in {nextMoonPhaseInConstellation?.name}</>
        </p>
      }
    </div>
  )
};
