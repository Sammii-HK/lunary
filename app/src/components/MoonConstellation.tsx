import { useEffect } from "react"

export const MoonConstellation = ({
  phaseString,
  emoji,
  moonConstellationPosition,
}: {
  phaseString: string,
  emoji: string,
  moonConstellationPosition: string,
}) => {

  useEffect(() => {}, [moonConstellationPosition]);
  return (
    <div>
      <p className="self-center">{emoji} {phaseString} Moon {moonConstellationPosition && <> in {moonConstellationPosition}</>}</p>
    </div>
  )
}