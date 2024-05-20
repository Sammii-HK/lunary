import { Moon } from "lunarphase-js";
import { moonPhasesWithConstellations } from "../../utils/moon/anualPhases";
import { months } from "../../utils/months";
import { stringToCamelCase } from "../../utils/moon/moonPhases";

("waningCrescent");

export default function Home() {
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
  
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="z-10 w-full h-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
				<p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
					{emoji}
				</p>
        <p>{emoji} {phaseString} {constellation && <> in {constellation?.name}</>}</p>
        <p>{agePercent}</p>
        {constellation && <>
          <div>
            <p>{constellation.element}</p>
            <p>{constellation.quality}</p>
            <p>{constellation.rulingPlanet}</p>
            <p>{constellation.symbol}</p>
          </div>
          <p>{constellation.keywords}</p>
          <p>{constellation.crystals}</p>
        </>}
			</div>
		</main>
	);
}
