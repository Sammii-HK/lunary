import { planetSymbols, zodiacSigns, zodiacSymbol, planetaryBodies } from '../../../../utils/zodiac/zodiac';

const Astronomy = () => {
  const astronomyItems = [
    'Planets',
    'Zodiac',
  ] as const;
  
  
  return (
    <div className="w-full">
      {astronomyItems.map(item => <AstronomyItems key={item} type={item} />)}
    </div>
  );
};

const AstronomyItems = ({type} : {type: string}) => {
  const items = type === 'zodiac' ? planetSymbols : zodiacSymbol;
  const content = type === 'zodiac' ? planetaryBodies : zodiacSigns;

  type Content = {
    name: string;
    mysticalProperties: string;
  }
  
  return (
    <div id={type} className="grid grid-cols-1 pb-5">
      <h2 id="phases my-3" className="text-lg font-bold mb-4">Astronomy</h2>
      <h2 className="mb-1 pb-5 font-bold">{type}</h2>
      {Object.keys(items).map((item: string) => (
        <div key={item.toLowerCase()} className="mb-3">
          <h2 className="font-bold">{items[item as keyof typeof items]} {content[item as keyof typeof content].name}</h2>
          <p>{content[item as keyof typeof content].mysticalProperties}</p>
        </div>
      ))}
    </div>
  );
};

export default Astronomy;