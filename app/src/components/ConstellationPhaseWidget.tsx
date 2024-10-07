import { constellationItems, getIcon, } from "../../utils/zodiac/zodiac";

export const ConstellationPhaseWidget = ({
  constellation, 
  isExpanded
}: {
  constellation: any,
  isExpanded: boolean
}) => {
  const constellationItems = [ 'element', 'rulingPlanet', 'quality', 'symbol' ] as const;
  if (!constellation) return null;
  return (
    <>
    <div className="flex flex-wrap grid-cols-2 justify-between">
      {constellationItems.map(item => (
        <ConstellationItem key={item} item={item} constellation={constellation} isExpanded={isExpanded} />
      ))}
    </div>
    {isExpanded && <div className="text-xs">
      <div className="flex mb-3 mt-5">
        <p className="mr-3">Keywords:</p>
        {constellation.keywords?.map((keyword: string) => ` ${keyword}`)}
      </div>
      <div className="flex mb-3">
        <p className="mr-3">Crystals:</p>
        {constellation.crystals?.map((crystal: string) => ` ${crystal}`)}
      </div>
      <p className="mt-4">{constellation.information}</p>
    </div>}
  </>
  )
};

const ConstellationItem = ({
  item,
  constellation,
  isExpanded,
}:
{
  item: constellationItems,
  constellation: any,
  isExpanded?: boolean,
}) => {

  const icon = getIcon(item as 'element' | 'rulingPlanet', constellation[item], constellation); 
  

  // const ExpandedItem = `${item}: ${icon} ${constellation[item]}`;
  const ExpandedItem = `${icon} ${constellation[item]}`;
  // const UnexpandedItem = getIcon(item as 'element' | 'rulingPlanet', constellation[item]);

  return (
    <p>{ExpandedItem}</p>
  )
}
