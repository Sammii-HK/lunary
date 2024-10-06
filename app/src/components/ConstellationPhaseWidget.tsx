type constellationItems = "element" | "quality" | "rulingPlanet" | "symbol";

export const ConstellationPhaseWidget = ({
  constellation, 
  isExpanded
}: {
  constellation: any,
  isExpanded: boolean
}) => {
  const constellationItems = [ 'element', 'rulingPlanet', 'quality', 'symbol' ];
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
        {constellation.keywords?.map(keyword => ` ${keyword}`)}
      </div>
      <div className="flex mb-3">
        <p className="mr-3">Crystals:</p>
        {constellation.crystals?.map(crystal => ` ${crystal}`)}
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

  const elementUnicode = {
    earth: '🜃',
    fire: '🜂',
    air: '🜁',
    water: '🜄',
  };

  const planetUnicode = {
    sun: '☉',
    moon: '☽',
    mercury: '☿',
    venus: '♀',
    mars: '♂',
    jupiter: '♃',
    saturn: '♄',
    uranus: '♅',
    neptune: '♆',
    pluto: '♇',
  };

  const qualityUnicode = {
    cardinal: '🜍',
    fixed: '🜔',
    mutable: '☿',
  };

  const symbolUnicode = {
    capricorn: '♑',
    aquarius: '♒',
    pisces: '♓',
    aries: '♈',
    taurus: '♉',
    gemini: '♊',
    cancer: '♋',
    leo: '♌',
    virgo: '♍',
    libra: '♎',
    scorpio: '♏',
    sagittarius: '♐',
  };


  const getIcon = (type: constellationItems, item: string) => {
    if (type === 'element') {
      return elementUnicode[constellation[type].toLowerCase()];
    }
    if (type === 'rulingPlanet') {
      return planetUnicode[constellation[type].toLowerCase()];
    }
    if (type === 'quality') {
      return qualityUnicode[constellation[type].toLowerCase()];
    }
    if (type === 'symbol') {
      const constellationName = constellation.name.toLowerCase();
      return symbolUnicode[constellationName];
    }
    return item;
  };

  const icon = getIcon(item as 'element' | 'rulingPlanet', constellation[item]); 
  

  // const ExpandedItem = `${item}: ${icon} ${constellation[item]}`;
  const ExpandedItem = `${icon} ${constellation[item]}`;
  const UnexpandedItem = getIcon(item as 'element' | 'rulingPlanet', constellation[item]);

  return (
    <p>{ExpandedItem}</p>
  )
}
