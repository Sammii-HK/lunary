import {
  planetSymbols,
  zodiacSigns,
  zodiacSymbol,
  planetaryBodies,
} from '../../../../utils/zodiac/zodiac';

const Astronomy = () => {
  const astronomyItems = ['Planets', 'Zodiac'] as const;

  return (
    <div className='w-full'>
      <h2 id='astronomy' className='pt-12 text-lg font-bold'>
        Astronomy
      </h2>
      {astronomyItems.map((item) => (
        <AstronomyItems key={item} type={item} />
      ))}
    </div>
  );
};

const AstronomyItems = ({ type }: { type: string }) => {
  const items = type === 'Zodiac' ? zodiacSymbol : planetSymbols;
  type AstronomyItem = {
    name: string;
    mysticalProperties: string;
    properties?: string;
    dates?: string;
    element?: string;
  };
  const content = type === 'Zodiac' ? zodiacSigns : planetaryBodies;

  type Content = {
    name: string;
    mysticalProperties: string;
  };

  return (
    <div className='grid grid-cols-1 pb-5'>
      <h2 id={type.toLowerCase()} className='mt-1 py-5 font-bold'>
        {type}
      </h2>
      {Object.keys(items).map((item: string) => (
        <div key={item.toLowerCase()} className='mb-3'>
          <h2 className='font-bold'>
            {items[item as keyof typeof items]}{' '}
            {(content[item as keyof typeof content] as AstronomyItem).name}
          </h2>
          <p>
            {
              (content[item as keyof typeof content] as AstronomyItem)
                .mysticalProperties
            }
          </p>
        </div>
      ))}
    </div>
  );
};

export default Astronomy;
