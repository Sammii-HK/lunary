import Image from "next/image";
import { Moon } from "lunarphase-js";
// import { moonPhases } from "../../utils/moon/monthlyPhases";
import { moonPhasesWithConstellations } from "../../utils/moon/anualPhases";
// import { moonPhases } from "../../utils/moon/anualPhases";
// import { monthlyMoonPhases } from "../../utils/moon/monthlyPhases";

const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];

const stringToCamelCase = (string: string) => {
  return string[0].toLowerCase() + string.substring(1).replace(" ", "")
};


export default function Home() {
  const date = new Date()
  const monthNumber = date.getMonth();
  const month = months[monthNumber].toLowerCase();
  const phase = Moon.lunarPhase(date);
  const agePercent = Moon.lunarAgePercent();
  const emoji = Moon.emojiForLunarPhase(phase);
  // const phaseNoSpace = phase.replace(" ", "");
  // const phaseCamelCase = phase[0].toLowerCase() + phaseNoSpace.substring(1)
  // const constellation = moonPhasesWithConstellations[month][phaseCamelCase];
  const moonPhaseInConstellation = moonPhasesWithConstellations[month][stringToCamelCase(phase)];
  const constellation = moonPhaseInConstellation.constellation;
  const constellationName = moonPhaseInConstellation.constellation.name.toLowerCase();
  const phaseDetails = moonPhaseInConstellation.information[constellationName].details

  // console.log("constellation", constellation);
  


  // console.log("phaseCamelCase", phaseCamelCase);
  
  // console.log("stringToCamelCase(phase)", stringToCamelCase(phase));
  

  // console.log("moonPhaseInConstellation", moonPhaseInConstellation.information[constellationName].details);
  // console.log("moonPhaseInConstellation", moonPhaseInConstellation.phase);
  // console.log("constellation", constellation);
  // console.log("constellationName", constellationName);
  
  // console.log("information", moonPhaseInConstellation[month]);
  // console.log("constellation.constellation", constellation.constellation);
  // console.log("constellation keys", Object.keys(constellation));
  // console.log("monthlyMoonPhases", monthlyMoonPhases);
  // console.log("month", month);
  // console.log("phase", phase);
  
  
  
  

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full h-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          {emoji}
        </p>
        <p>{emoji} {phase} in {constellation.name}</p>
        <p>{agePercent}</p>
        <div>
          <p>{constellation.element}</p>
          <p>{constellation.quality}</p>
          <p>{constellation.rulingPlanet}</p>
          <p>{constellation.symbol}</p>
        </div>
        <p>{constellation.keywords}</p>
        <p>{constellation.crystals}</p>
        <p>{phaseDetails}</p>
        {/* <p>{moonPhaseInConstellation.information[constellation].details}</p> */}
        {/* <p>{constellation}</p> */}
        {/* <div>{phase}</div>
        <div>{agePercent}</div> */}
        {/* <div className="fixed left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">
          <div>{phase}</div>
          <div>{agePercent}</div>
        </div> */}
      </div>

    </main>
  );
}
