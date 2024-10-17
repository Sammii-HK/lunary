'use client'

// import { 
//   getLunarAgeToNextPhase,
//   moonPhaseLabels,
//   currentMoon,
//   // nextMoonPhaseInConstellation,
//   nextMoonPhase,
// } from "../../utils/moon/moonPhases";

import { ConstellationPhaseWidget } from "./ConstellationPhaseWidget";
import { useAstronomyContext } from "@/context/AstronomyContext";
import { MoonConstellation } from "./MoonConstellation";
// import { Moon } from "lunarphase-js";

// const emoji = Moon.emojiForLunarPhase(currentMoon);


export const MoonWidget = () => {
  const { currentMoonConstellationPosition, currentMoonPhase, currentDate } = useAstronomyContext();
  
  // const lunarAge = Moon.lunarAge(currentDate);
  // const lunarAgeToNextPhase = getLunarAgeToNextPhase(lunarAge);

  return(
    <div className="border-stone-800 border p-3 flex flex-col w-full rounded-md">
      <div className="flex w-full justify-between">
        <div className="flex align-middle flex-col md:flex-row mb-3">
          <MoonConstellation
            phaseString={currentMoonPhase}
            moonConstellationPosition={currentMoonConstellationPosition || '...'}
          />
        </div>
      </div>        
      <ConstellationPhaseWidget />
      {/* {nextMoonPhaseInConstellation !== undefined && 
        <p className="font-bold text-xs mb-3">
          <span className="text-xs text-stone-500">{lunarAgeToNextPhase} days until </span>{moonPhaseLabels[nextMoonPhase as keyof typeof moonPhaseLabels]} <> in {nextMoonPhaseInConstellation?.name}</>
        </p>
      } */}
    </div>
  )
};
