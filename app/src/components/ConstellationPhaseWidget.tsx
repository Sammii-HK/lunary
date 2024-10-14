import { useContext } from "react";
import { constellationItems, getIcon, } from "../../utils/zodiac/zodiac";
import { AstronomyContext } from "@/context/AstronomyContext";
import { currentMoonPhaseInConstellation } from "../../utils/moon/moonPhases";

export const ConstellationPhaseWidget = () => {
  const getAstronomyContext = useContext(AstronomyContext);
  const currentMoonConstellation = getAstronomyContext().currentMoonConstellation;

  const constellationItems = [ 'element', 'rulingPlanet', 'quality', 'symbol' ] as const;
  if (!currentMoonConstellation) return null;
  return (
    <>
    <div className="flex mb-3 flex-wrap grid-cols-2 justify-between">
      {constellationItems.map(item => (
        <ConstellationItem key={item} item={item} constellation={currentMoonConstellation} />
      ))}
    </div>
    <p className="mb-4 text-[12px]">{currentMoonPhaseInConstellation?.information || currentMoonConstellation.information}</p>
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
