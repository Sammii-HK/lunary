import { useEffect } from "react"

import { monthlyMoonPhases } from "../../utils/moon/monthlyPhases";
import { stringToCamelCase } from "../../utils/moon/moonPhases";

export const MoonConstellation = ({
  phaseString,
  moonConstellationPosition,
}: {
  phaseString: string,
  moonConstellationPosition: string,
}) => { 
  const symbol = monthlyMoonPhases[stringToCamelCase(phaseString) as keyof typeof monthlyMoonPhases]?.symbol;

  useEffect(() => {}, [moonConstellationPosition]);
  return (
    <div>
      <p className="self-center">{symbol} {phaseString} {moonConstellationPosition && <> in {moonConstellationPosition}</>}</p>
    </div>
  )
}