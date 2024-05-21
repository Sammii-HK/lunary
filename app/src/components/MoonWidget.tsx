'use client'

import { Moon } from "lunarphase-js";
import { moonPhasesWithConstellations } from "../../utils/moon/anualPhases";
import { months } from "../../utils/months";
import { stringToCamelCase } from "../../utils/moon/moonPhases";

export const MoonWidget = () => {
  const date = new Date();
	const monthNumber = date.getMonth();
	const month = months[monthNumber];
	const phaseString = Moon.lunarPhase(date);
	const agePercent = Moon.lunarAgePercent();
	const emoji = Moon.emojiForLunarPhase(Moon.lunarPhase(date));
	const phase = stringToCamelCase(Moon.lunarPhase(date));

	const phasesWithConstellationsInMonth = moonPhasesWithConstellations[month];

	const moonPhaseInConstellation =
		phase in phasesWithConstellationsInMonth
			? phasesWithConstellationsInMonth[
					phase as keyof typeof phasesWithConstellationsInMonth
			]
			: undefined;

  // make it work with 2 new moons a mnonth
  const constellation = moonPhaseInConstellation?.constellation[0];

  return(
    <div>
      <p className="mt-2">{emoji} {phaseString} Moon {constellation && <> in {constellation?.name}</>}</p>
        <p className="my-2">Age: {agePercent}</p>
        {constellation && <>
          <div>
            <p>Element: {constellation.element}</p>
            <p>Quality: {constellation.quality}</p>
            <p>Planet: {constellation.rulingPlanet}</p>
            <p>Symbol: {constellation.symbol}</p>
          </div>
          <div className="flex mt-2">
            <p>Keywords: </p>
            {constellation.keywords.map(keyword => ` ${keyword}`)}
          </div>
          <div className="flex mt-2">
            <p>Crystals: </p>
            {constellation.crystals.map(crystal => ` ${crystal}`)}
          </div>
          <p className="mt-2">{constellation.information}</p>
        </>}
    </div>
  )
};