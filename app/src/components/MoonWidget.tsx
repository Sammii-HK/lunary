'use client'

import { Moon } from "lunarphase-js";
import { moonPhasesWithConstellations } from "../../utils/moon/anualPhases";
import { months } from "../../utils/months";
import { stringToCamelCase, getNextMoonPhase, getLunarAgeToNextPhase, moonPhaseLabels, CamelCaseMoonPhase } from "../../utils/moon/moonPhases";
import { useEffect, useState } from "react";
import { ConstellationPhaseWidget } from "./ConstellationPhaseWidget";
import { ChevronDown, ChevronUp } from 'lucide-react';

export const MoonWidget = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date();
	const monthNumber = date.getMonth();
	const month = months[monthNumber];
	const phaseString = Moon.lunarPhase(date);
	const [agePercent, setAgePercent] = useState(1);
	const emoji = Moon.emojiForLunarPhase(Moon.lunarPhase(date));
	const phase = stringToCamelCase(Moon.lunarPhase(date));
  const lunarAge = Moon.lunarAge(date); 

	const phasesWithConstellationsInMonth = moonPhasesWithConstellations[month];

  const moonPhaseInConstellation = ({phase}: {phase: string}) => {
    return phase in phasesWithConstellationsInMonth
      ? phasesWithConstellationsInMonth[
          phase as keyof typeof phasesWithConstellationsInMonth
        ]
      : undefined;
  };

  const constellation = moonPhaseInConstellation({phase})?.constellation[0];

  useEffect(() => {
    setAgePercent(Moon.lunarAgePercent());
  }, [])

  const nextMoonPhase = stringToCamelCase(getNextMoonPhase(phase as CamelCaseMoonPhase));
  const nextMoonPhaseInConstellation = moonPhaseInConstellation({phase: nextMoonPhase})?.constellation[0];

  const lunarAgeToNextPhase = getLunarAgeToNextPhase(lunarAge);  

  console.log("Moon", Moon.lunationNumber(date));
  // last new/full moon
  // next new/full moon
  

  return(
    <div className="border-stone-500 border-2 p-3 flex flex-col">
      <div className="flex w-full justify-between">
        <div className="flex align-middle">
          <span className="self-center">{emoji} {phaseString} Moon {constellation && <> in {constellation?.name}</>}</span>
          {isExpanded && <span className="text-xs ml-5 self-center">Age: {agePercent.toFixed(8)}</span>}
        </div>
        <div className="justify-self-end">
          <button onClick={() => setIsExpanded(!isExpanded)}>
            {!isExpanded && <ChevronDown />}
            {isExpanded && <ChevronUp />}
          </button>
        </div>
      </div>        
        {constellation && <ConstellationPhaseWidget isExpanded={isExpanded} constellation={moonPhaseInConstellation} />}
        {!constellation && nextMoonPhaseInConstellation && <>
          <hr className="my-2" />
          <p className="font-bold text-xs mb-3"><span className="text-xs text-stone-500">{lunarAgeToNextPhase} days until </span>{moonPhaseLabels[nextMoonPhase as keyof typeof moonPhaseLabels]} Moon {nextMoonPhaseInConstellation && <> in {nextMoonPhaseInConstellation?.name}</>}</p>
          <ConstellationPhaseWidget isExpanded={isExpanded} constellation={nextMoonPhaseInConstellation} />
        </>}
    </div>
  )
};
