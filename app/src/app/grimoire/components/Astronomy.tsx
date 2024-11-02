import { bodiesSymbols, zodiacSymbol } from '../../../../utils/zodiac/zodiac';

const Astronomy = () => {
  const planets = Object.keys(bodiesSymbols);
  const zodiac = Object.keys(zodiacSymbol);
  console.log('planets', planets);
  console.log('zodiac', zodiac);
  
  
  return (
    <div className="w-full">
      <h1 className="font-bold text-lg w-full">Astronomy</h1>
      <h2 id="planets" className="mb-1 mt-3 font-bold">Planets</h2>
      {/* <div className="flex flex-row flex-wrap"> */}
      <div className="grid grid-cols-5">
        {planets.map((planet) => (
          <div key={planet} className="mb-3">
            <h2 className="font-bold">{planet}</h2>
            <p>{bodiesSymbols[planet as keyof typeof bodiesSymbols]}</p>
          </div>
        ))}
      </div>
      <h2 id="zodiac" className="mb-1 mt-3 font-bold">Zodiac</h2>
      <div className="grid grid-cols-5">
        {zodiac.map((sign) => (
          <div key={sign} className="mb-3">
            <h2 className="mb-1">{sign}</h2>
            <p>{zodiacSymbol[sign as keyof typeof zodiacSymbol]}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Astronomy;